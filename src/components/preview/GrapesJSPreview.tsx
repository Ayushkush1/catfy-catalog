'use client';

import React, { useEffect, useRef } from 'react';
import { bindDataToTemplate } from '@/lib/grapesjs-data-binding';
import { StandardizedContent } from '@/lib/content-schema';

interface GrapesJSPreviewProps {
  html: string;
  css: string;
  js?: string;
  content?: StandardizedContent;
  scale?: number;
  className?: string;
}

const GrapesJSPreview: React.FC<GrapesJSPreviewProps> = ({
  html,
  css,
  js = '',
  content,
  scale = 1,
  className = '',
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    // Apply data binding if content is provided
    const htmlWithData = content ? bindDataToTemplate(html, content) : html;

    // Get the iframe document
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;

    // Write the HTML, CSS, and JS to the iframe
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              background: white;
            }
            body {
              width: 794px;
              min-height: 1123px;
              margin: 0 auto;
              padding: 0.5cm;
              box-sizing: border-box;
            }
            ${css}
          </style>
        </head>
        <body>
          ${htmlWithData}
          <script>
            ${js}
          </script>
        </body>
      </html>
    `);
    iframeDoc.close();

    // Apply scaling if needed
    if (scale !== 1 && iframeRef.current) {
      const body = iframeDoc.body;
      if (body) {
        body.style.transform = `scale(${scale})`;
        body.style.transformOrigin = 'top left';
        body.style.width = `${100 / scale}%`;
        body.style.height = `${100 / scale}%`;
      }
    }
  }, [html, css, js, content, scale]);

  return (
    <div className={`grapesjs-preview ${className}`} style={{ overflow: 'hidden', width: '100%', height: '100%', minHeight: '1123px' }}>
      <iframe
        ref={iframeRef}
        title="GrapesJS Preview"
        className="w-full border-0"
        style={{ height: '1123px', minHeight: '1123px' }}
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
};

export default GrapesJSPreview;