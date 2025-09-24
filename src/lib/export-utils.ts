/**
 * Export utilities for GrapesJS templates
 */

import { StandardizedContent } from './content-schema';
import { bindDataToTemplate } from './grapesjs-data-binding';

export interface ExportOptions {
  filename?: string;
  includeJs?: boolean;
  includeCss?: boolean;
  applyContent?: boolean;
  content?: StandardizedContent;
}

/**
 * Export HTML template to file
 */
export function exportToHtml(
  html: string,
  css: string,
  js: string = '',
  options: ExportOptions = {}
): void {
  const {
    filename = `catalogue-export-${Date.now()}.html`,
    includeJs = true,
    includeCss = true,
    applyContent = false,
    content
  } = options;

  // Apply data binding if content is provided and applyContent is true
  const processedHtml = (applyContent && content) 
    ? bindDataToTemplate(html, content) 
    : html;

  // Create full HTML document
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Catalogue</title>
  ${includeCss ? `<style>${css}</style>` : ''}
  ${includeJs ? `<script>${js}</script>` : ''}
</head>
<body>
  ${processedHtml}
</body>
</html>`;

  // Create blob and download
  const blob = new Blob([fullHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export template to PDF (via print dialog)
 */
export function exportToPdf(
  html: string,
  css: string,
  js: string = '',
  options: ExportOptions = {}
): void {
  const {
    applyContent = false,
    content
  } = options;

  // Apply data binding if content is provided and applyContent is true
  const processedHtml = (applyContent && content) 
    ? bindDataToTemplate(html, content) 
    : html;

  // Create full HTML document optimized for printing
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catalogue PDF Export</title>
  <style>
    ${css}
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      @page {
        size: A4;
        margin: 0.5cm;
      }
    }
  </style>
</head>
<body>
  ${processedHtml}
  <script>
    ${js}
    // Automatically trigger print dialog when loaded
    window.onload = function() {
      setTimeout(() => {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

  // Open in a new window and trigger print
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(fullHtml);
  printWindow.document.close();
}

/**
 * Export template as JSON (for saving/importing in GrapesJS)
 */
export function exportToJson(
  html: string,
  css: string,
  js: string = '',
  templateName: string = 'Template',
  templateId: string = `template-${Date.now()}`
): void {
  const template = {
    id: templateId,
    name: templateName,
    html,
    css,
    js,
    components: [], // This would be populated with actual components in a real implementation
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Create blob and download
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${templateId}.json`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}