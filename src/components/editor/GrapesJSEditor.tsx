'use client';

import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import { bindDataToTemplate } from '@/lib/grapesjs-data-binding';
import { StandardizedContent } from '@/lib/content-schema';

// Import GrapesJS CSS
import 'grapesjs/dist/css/grapes.min.css';

interface GrapesJSEditorProps {
  initialHtml: string;
  initialCss: string;
  initialJs: string;
  content: any;
  onSave: (html: string, css: string, js: string) => void;
}

const GrapesJSEditor: React.FC<GrapesJSEditorProps> = ({
  initialHtml = '',
  initialCss = '',
  initialJs = '',
  content,
  onSave,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    
    // Safety checks for initial data
    const safeInitialHtml = initialHtml || '<div>Default content</div>';
    const safeInitialCss = initialCss || '';
    const safeInitialJs = initialJs || '';
    
    // Apply data binding if catalogue data is available, with error handling
    let htmlWithData = safeInitialHtml;
    try {
      htmlWithData = content ? bindDataToTemplate(safeInitialHtml, content) : safeInitialHtml;
    } catch (error) {
      console.warn('Error applying data binding, using original HTML:', error);
      htmlWithData = safeInitialHtml;
    }

    // Initialize GrapesJS editor with error handling
    let editor;
    try {
      // Validate container before initialization
      if (!editorRef.current) {
        throw new Error('Editor container not found');
      }

      editor = grapesjs.init({
      container: editorRef.current,
      height: '100vh',
      width: 'auto',
      storageManager: false,
      // Disable problematic features that might cause parseHtml errors
      avoidInlineStyle: true,
      avoidFrameOffset: true,
      noticeOnUnload: false,
      // Canvas configuration for A4 sizing
      canvas: {
        styles: [
          // A4 page styling for accurate export preview
          `
          .gjs-frame {
            max-width: 794px !important;
            margin: 0 auto !important;
            box-shadow: 0 0 20px rgba(0,0,0,0.1) !important;
          }
          .gjs-cv-canvas {
            background: #f5f5f5 !important;
            padding: 20px !important;
          }
          body {
            width: 794px !important;
            min-height: 1123px !important;
            margin: 0 auto !important;
            background: white !important;
            box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
          }
          `
        ]
      },
      plugins: [gjsPresetWebpage, gjsBlocksBasic],
      pluginsOpts: {
        gjsPresetWebpage: {},
        gjsBlocksBasic: {},
      },
      components: htmlWithData,
      style: initialCss,
      jsInHtml: false,
      js: initialJs,
      // Enhanced panels configuration with modern styling
      panels: {
        defaults: [
          {
            id: 'layers',
            el: '.panel__right',
            resizable: {
              maxDim: 380,
              minDim: 250,
              tc: 0,
              cl: 1,
              cr: 0,
              bc: 0,
              keyWidth: 'flex-basis',
            },
          },
          {
            id: 'styles',
            el: '.panel__right',
            resizable: {
              maxDim: 380,
              minDim: 250,
              tc: 0,
              cl: 1,
              cr: 0,
              bc: 0,
              keyWidth: 'flex-basis',
            },
          },
          {
            id: 'traits',
            el: '.panel__right',
            resizable: {
              maxDim: 380,
              minDim: 250,
              tc: 0,
              cl: 1,
              cr: 0,
              bc: 0,
              keyWidth: 'flex-basis',
            },
          },
          {
            id: 'blocks',
            el: '.panel__left',
            resizable: {
              maxDim: 320,
              minDim: 220,
              tc: 0,
              cl: 0,
              cr: 1,
              bc: 0,
              keyWidth: 'flex-basis',
            },
          }
        ]
      },
      // Enhanced toolbar configuration
      toolbar: {
        defaults: [
          {
            id: 'sw-visibility',
            active: true,
            className: 'btn-toggle-borders',
            label: '<i class="fa fa-clone"></i>',
            command: 'sw-visibility',
          },
          {
            id: 'preview',
            className: 'btn-preview',
            label: '<i class="fa fa-eye"></i>',
            command: 'preview',
            context: 'preview',
          },
          {
            id: 'fullscreen',
            className: 'btn-fullscreen',
            label: '<i class="fa fa-arrows-alt"></i>',
            command: 'fullscreen',
            context: 'fullscreen',
          },
          {
            id: 'export',
            className: 'btn-export',
            label: '<i class="fa fa-code"></i>',
            command: 'export',
          },
          {
            id: 'undo',
            className: 'btn-undo',
            label: '<i class="fa fa-undo"></i>',
            command: 'core:undo',
          },
          {
            id: 'redo',
            className: 'btn-redo',
            label: '<i class="fa fa-repeat"></i>',
            command: 'core:redo',
          },
        ]
      },
      // Add custom commands
      commands: {
        defaults: [
          {
            id: 'save-template',
            run: function(editor: any) {
              const html = editor.getHtml();
              const css = editor.getCss();
              const js = editor.getJs();
              onSave(html, css, js);
            }
          }
        ]
      },
      deviceManager: {
        devices: [
          {
            name: 'A4 Print',
            width: '794px',
            height: '1123px',
            widthMedia: '794px',
          },
          {
            name: 'Desktop',
            width: '',
          },
          {
            name: 'Tablet',
            width: '768px',
            widthMedia: '992px',
          },
          {
            name: 'Mobile',
            width: '320px',
            widthMedia: '480px',
          },
        ],
      },
    });

      // Add custom commands
      editor.Commands.add('save-template', {
      run: (editor: any) => {
        const html = editor.getHtml();
        const css = editor.getCss();
        const js = editor.getJs();
        
        if (onSave) {
          onSave(html, css, js);
        }
      },
    });

      editor.Commands.add('preview', {
        run: (editor: any) => {
          editor.runCommand('core:preview');
        },
      });
    
      editor.Commands.add('export', {
      run: (editor: any) => {
        const html = editor.getHtml();
        const css = editor.getCss();
        const js = editor.getJs();
        
        // Apply data binding before export if content is available
        const htmlWithData = content ? bindDataToTemplate(html, content) : html;
        
        // Default export functionality
        const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Catalogue</title>
  <style>${css}</style>
  <script>${js}</script>
</head>
<body>
  ${htmlWithData}
</body>
</html>`;

        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `catalogue-export-${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
    });

      editor.Commands.add('set-device-desktop', {
        run: (editor: any) => editor.setDevice('Desktop'),
      });

      editor.Commands.add('set-device-tablet', {
        run: (editor: any) => editor.setDevice('Tablet'),
      });

      editor.Commands.add('set-device-mobile', {
        run: (editor: any) => editor.setDevice('Mobile'),
      });

      // Register custom blocks for catalogue elements
      registerCustomBlocks(editor);

      // Add error handling for component selection
      editor.on('component:selected', (component: any) => {
        try {
          // Safely handle component selection
          if (component && component.get) {
            const componentType = component.get('type');
            console.log('Component selected:', componentType);
          }
        } catch (error) {
          console.warn('Error handling component selection:', error);
        }
      });

      // Add error handling for component updates
      editor.on('component:update', (component: any) => {
        try {
          // Safely handle component updates
          if (component && component.get) {
            const componentType = component.get('type');
            console.log('Component updated:', componentType);
          }
        } catch (error) {
          console.warn('Error handling component update:', error);
        }
      });

      // Add global error handler for GrapesJS
      const originalConsoleError = console.error;
      const grapesJSErrorHandler = (...args: any[]) => {
        const errorMessage = args.join(' ');
        if (errorMessage.includes('parseHtml') || errorMessage.includes('Cannot read properties')) {
          console.warn('GrapesJS parsing error caught and handled:', errorMessage);
          // Don't propagate the error to avoid breaking the UI
          return;
        }
        // Call original console.error for other errors
        originalConsoleError.apply(console, args);
      };
      
      // Temporarily override console.error
      console.error = grapesJSErrorHandler;

      setEditor(editor);

      return () => {
        // Restore original console.error
        console.error = originalConsoleError;
        
        if (editor) {
          editor.destroy();
        }
      };
    } catch (error) {
      console.error('Error initializing GrapesJS editor:', error);
      // Set a fallback state or show error message
      setEditor(null);
    }
  }, [initialHtml, initialCss, initialJs, content, onSave]);
  
  // Register custom blocks for catalogue elements
  const registerCustomBlocks = (editor: any) => {
    try {
      const blockManager = editor.BlockManager;

      // Simplified Furniture Cover Page Block
      blockManager.add('furniture-cover-page', {
        label: 'Furniture Cover Page',
        category: 'Furniture Catalogue',
        content: `<div class="furniture-cover-page" style="background: #1a1a1a; color: white; padding: 40px; min-height: 400px;">
  <div style="text-align: center;">
    <h1 data-field="catalogue.name">Catalogue Title</h1>
    <p data-field="catalogue.description">Catalogue Description</p>
    <img src="/api/placeholder/300/200" alt="Cover Image" data-field="catalogue.coverImage" style="max-width: 300px; height: auto;" />
  </div>
</div>`,
        attributes: { class: 'fa fa-home' }
      });

    // Simplified Furniture Product Card Block
    blockManager.add('furniture-product-card', {
      label: 'Product Card',
      category: 'Furniture Catalogue',
      content: `<div class="furniture-product-card" style="background: white; border-radius: 8px; padding: 16px; margin: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
  <img src="/api/placeholder/300/200" alt="Product" data-field="product.image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px;" />
  <h3 data-field="product.name" style="margin: 16px 0 8px 0;">Product Name</h3>
  <p data-field="product.description" style="color: #666; margin: 0 0 12px 0;">Product description</p>
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <span data-field="product.price" style="font-weight: bold; color: #2563eb;">$299</span>
    <button style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 4px;">Add to Cart</button>
  </div>
</div>`,
      attributes: { class: 'fa fa-cube' }
    });

    // Simplified Furniture Product Grid Block
    blockManager.add('furniture-product-grid', {
      label: 'Product Grid',
      category: 'Furniture Catalogue',
      content: `<div class="furniture-product-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; padding: 20px;">
  <div style="background: white; border-radius: 8px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <img src="/api/placeholder/250/150" alt="Product 1" data-field="products[0].image" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px;" />
    <h3 data-field="products[0].name" style="margin: 12px 0 8px 0;">Product 1</h3>
    <p data-field="products[0].description" style="color: #666; margin: 0 0 8px 0;">Description</p>
    <span data-field="products[0].price" style="font-weight: bold; color: #299</span>
  </div>
  <div style="background: white; border-radius: 8px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <img src="/api/placeholder/250/150" alt="Product 2" data-field="products[1].image" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px;" />
    <h3 data-field="products[1].name" style="margin: 12px 0 8px 0;">Product 2</h3>
    <p data-field="products[1].description" style="color: #666; margin: 0 0 8px 0;">Description</p>
    <span data-field="products[1].price" style="font-weight: bold; color: #399</span>
  </div>
</div>`,
      attributes: { class: 'fa fa-th' }
    });

      // Simplified Contact Page Block
      blockManager.add('furniture-contact-page', {
        label: 'Contact Page',
        category: 'Furniture Catalogue',
        content: `<div class="furniture-contact-page" style="padding: 40px; background: #667eea; color: white; text-align: center;">
  <h2 style="margin: 0 0 16px 0;">Get in Touch</h2>
  <p style="margin: 0 0 24px 0;">Contact us for any inquiries</p>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
    <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 8px;">
      <h3 data-field="contact.phone" style="margin: 0 0 8px 0;">Phone</h3>
      <p style="margin: 0;">+1 (555) 123-4567</p>
    </div>
    <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 8px;">
      <h3 data-field="contact.email" style="margin: 0 0 8px 0;">Email</h3>
      <p style="margin: 0;">hello@furniture.com</p>
    </div>
  </div>
</div>`,
        attributes: { class: 'fa fa-phone' }
      });

      // Simplified Category Section Block
      blockManager.add('category-section', {
        label: 'Category Section',
        category: 'Furniture Catalogue',
        content: `<div class="category-section" style="padding: 40px; background: #f9fafb;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 data-field="category.name" style="margin: 0 0 16px 0;">Category Name</h2>
    <p data-field="category.description" style="color: #666; margin: 0;">Category description</p>
  </div>
  <div style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <img src="/api/placeholder/300/200" alt="Category" data-field="category.image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px;" />
    <h3 data-field="category.title" style="margin: 16px 0 8px 0;">Category Title</h3>
    <p data-field="category.subtitle" style="color: #666; margin: 0 0 16px 0;">Starting from $299</p>
    <button style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 4px;">View Collection</button>
  </div>
</div>`,
        attributes: { class: 'fa fa-list' }
      });

      // Simplified PDF Export Button Block
      blockManager.add('pdf-export-button', {
        label: 'PDF Export Button',
        category: 'Furniture Catalogue',
        content: `<div class="pdf-export-button" style="text-align: center; padding: 20px;">
  <button onclick="window.exportToPDF && window.exportToPDF()" style="background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; cursor: pointer;">
    Export to PDF
  </button>
</div>`,
        attributes: { class: 'fa fa-file-pdf-o' }
      });
    } catch (error) {
      console.error('Error registering custom blocks:', error);
    }
  };

  return (
    <div className="grapesjs-editor-container">
      {/* <div className="panel__left"></div> */}
      <div ref={editorRef} className="editor-canvas"></div>
      {/* <div className="panel__right"></div> */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        .grapesjs-editor-container {
          height: 100vh;
          width: 100%;
          display: flex;
          background: #ffffff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .panel__left {
          width: 240px;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
        }
        .panel__right {
          width: 260px;
          background: #ffffff;
          border-left: 1px solid #e5e7eb;
        }
        .editor-canvas {
          flex: 1;
          height: 100vh;
          width: 10wh;
          background: #f8fafc;
          position: relative;
        }

        /* Clean GrapesJS Styling */
        :global(.gjs-editor) {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          background: #ffffff !important;
        }

        /* Simple Toolbar */
        :global(.gjs-pn-commands) {
          background: #ffffff !important;
          border-bottom: 1px solid #e5e7eb !important;
          padding: 8px 12px !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
        }

        :global(.gjs-pn-btn) {
          background: #f9fafb !important;
          border: 1px solid #d1d5db !important;
          border-radius: 6px !important;
          color: #374151 !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          padding: 2px !important;
          transition: all 0.15s ease !important;
          cursor: pointer !important;
        }

        :global(.gjs-pn-btn:hover) {
          background: #f3f4f6 !important;
          border-color: #9ca3af !important;
          color: #111827 !important;
        }

        :global(.gjs-pn-btn.gjs-pn-active) {
          background:rgb(33, 59, 102) !important;
          border-color:rgb(24, 54, 104) !important;
          color: #ffffff !important;
        }

        /* Minimal Panel Styling */
        :global(.gjs-pn-panel) {
          background: #ffffff !important;
          border: none !important;
        }

        :global(.gjs-pn-panel .gjs-pn-header) {
          background: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
          color: #374151 !important;
          font-size: 11px !important;
          font-weight: 500 !important;
          padding: 6px 8px !important;
          text-transform: uppercase !important;
        }

        /* Minimal Blocks Panel */
        :global(.gjs-blocks-c) {
          background: #ffffff !important;
          padding: 8px !important;
        }

        :global(.gjs-block) {
          background: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          color: #374151 !important;
          cursor: pointer !important;
          font-size: 10px !important;
          margin: 0 0 4px 0 !important;
          padding: 6px !important;
          text-align: center !important;
          width: calc(50% - 2px) !important;
          display: inline-block !important;
          vertical-align: top !important;
        }

        :global(.gjs-block:nth-child(odd)) {
          margin-right: 4px !important;
        }

        :global(.gjs-block:hover) {
          background: #f9fafb !important;
          border-color: #3b82f6 !important;
        }

        :global(.gjs-block-svg) {
          fill: currentColor !important;
          width: 16px !important;
          height: 16px !important;
          margin-bottom: 2px !important;
        }

        :global(.gjs-block-label) {
          font-size: 9px !important;
          font-weight: 400 !important;
          line-height: 1.1 !important;
        }

        /* Clean Canvas Area */
        :global(.gjs-cv-canvas) {
          background: #f8fafc !important;
          padding: 16px !important;
        }

        :global(.gjs-frame) {
          background: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 6px !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
          overflow: hidden !important;
        }

        /* Minimal Layers Panel */
        :global(.gjs-layers) {
          background: #ffffff !important;
          padding: 4px !important;
        }

        :global(.gjs-layer) {
          background: transparent !important;
          border: none !important;
          color: #374151 !important;
          font-size: 11px !important;
          margin: 0 !important;
          padding: 4px 6px !important;
        }

        :global(.gjs-layer:hover) {
          background: #f9fafb !important;
        }

        :global(.gjs-layer.gjs-selected) {
          background: #eff6ff !important;
          color: #1d4ed8 !important;
          border-left: 2px solid #3b82f6 !important;
        }

        /* Minimal Styles Panel */
        :global(.gjs-sm-sectors) {
          background: #ffffff !important;
          padding: 4px !important;
        }

        :global(.gjs-sm-sector) {
          background: #ffffff !important;
          border: none !important;
          margin-bottom: 6px !important;
          padding: 0 !important;
        }

        :global(.gjs-sm-title) {
          background: #f9fafb !important;
          border: 1px solid #e5e7eb !important;
          color: #374151 !important;
          font-size: 10px !important;
          font-weight: 500 !important;
          padding: 4px 6px !important;
          text-transform: uppercase !important;
        }

        :global(.gjs-sm-properties) {
          background: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          border-top: none !important;
          padding: 4px !important;
        }

        :global(.gjs-sm-property) {
          background: transparent !important;
          border: none !important;
          margin-bottom: 4px !important;
          padding: 0 !important;
        }

        :global(.gjs-sm-label) {
          color: #6b7280 !important;
          font-size: 10px !important;
          font-weight: 400 !important;
          margin-bottom: 2px !important;
          text-transform: capitalize !important;
        }

        :global(.gjs-field) {
          background: #ffffff !important;
          border: 1px solid #d1d5db !important;
          color: #374151 !important;
          font-size: 11px !important;
          padding: 4px 6px !important;
          width: 100% !important;
        }

        :global(.gjs-field:focus) {
          border-color: #3b82f6 !important;
          outline: none !important;
        }

        /* Clean Device Manager */
        :global(.gjs-pn-devices-c) {
          background: #ffffff !important;
          border-bottom: 1px solid #e5e7eb !important;
          padding: 8px 12px !important;
          display: flex !important;
          justify-content: center !important;
          gap: 6px !important;
        }

        :global(.gjs-pn-device) {
          background: #f9fafb !important;
          border: 1px solid #d1d5db !important;
          border-radius: 4px !important;
          color: #6b7280 !important;
          cursor: pointer !important;
          font-size: 12px !important;
          padding: 4px 8px !important;
          transition: all 0.15s ease !important;
        }

        :global(.gjs-pn-device:hover) {
          background: #f3f4f6 !important;
          border-color: #9ca3af !important;
          color: #374151 !important;
        }

        :global(.gjs-pn-device.gjs-pn-active) {
          background: #3b82f6 !important;
          border-color: #3b82f6 !important;
          color: #ffffff !important;
        }

        /* Simple Scrollbars */
        :global(.gjs-editor ::-webkit-scrollbar) {
          width: 4px !important;
          height: 4px !important;
        }

        :global(.gjs-editor ::-webkit-scrollbar-track) {
          background: #f9fafb !important;
        }

        :global(.gjs-editor ::-webkit-scrollbar-thumb) {
          background: #d1d5db !important;
          border-radius: 2px !important;
        }

        :global(.gjs-editor ::-webkit-scrollbar-thumb:hover) {
          background: #9ca3af !important;
        }

        /* Clean Component Selection */
        :global(.gjs-selected) {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 1px !important;
        }

        :global(.gjs-hovered) {
          outline: 1px dashed #6b7280 !important;
          outline-offset: 1px !important;
        }

        /* Clean Resizer */
        :global(.gjs-resizer-h) {
          background: #3b82f6 !important;
          border-radius: 1px !important;
        }

        /* Clean Modal */
        :global(.gjs-mdl-dialog) {
          background: #ffffff !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
          border: none !important;
        }

        :global(.gjs-mdl-header) {
          background: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
          border-radius: 8px 8px 0 0 !important;
          padding: 12px 16px !important;
        }

        :global(.gjs-mdl-title) {
          color: #374151 !important;
          font-size: 16px !important;
          font-weight: 600 !important;
        }

        :global(.gjs-mdl-content) {
          padding: 16px !important;
        }

        /* Clean Buttons */
        :global(.gjs-btn-prim) {
          background: #3b82f6 !important;
          border: none !important;
          border-radius: 6px !important;
          color: #ffffff !important;
          font-weight: 500 !important;
          padding: 6px 12px !important;
          transition: all 0.15s ease !important;
        }

        :global(.gjs-btn-prim:hover) {
          background: #2563eb !important;
        }

        /* Clean Tooltip */
        :global(.gjs-tooltip) {
          background: #1f2937 !important;
          border-radius: 4px !important;
          color: #ffffff !important;
          font-size: 11px !important;
          font-weight: 500 !important;
          padding: 4px 6px !important;
        }

        /* Clean Context Menu */
        :global(.gjs-cm-editor) {
          background: #ffffff !important;
          border: none !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          padding: 4px !important;
        }

        :global(.gjs-cm-editor .gjs-cm-item) {
          background: transparent !important;
          border-radius: 4px !important;
          color: #374151 !important;
          font-size: 12px !important;
          margin: 1px 0 !important;
          padding: 6px 8px !important;
          transition: all 0.15s ease !important;
        }

        :global(.gjs-cm-editor .gjs-cm-item:hover) {
          background: #f9fafb !important;
          color: #111827 !important;
        }

        /* Loading States */
        :global(.gjs-editor.gjs-loading) {
          opacity: 0.7 !important;
          pointer-events: none !important;
        }

        /* Improved Animation */
        :global(.gjs-editor *) {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* Panel Dividers */
        :global(.gjs-pn-panel:not(:last-child)) {
          border-bottom: 1px solid #e2e8f0 !important;
        }

        /* Enhanced Focus States */
        :global(.gjs-editor *:focus) {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }

        /* Improved Typography */
        :global(.gjs-editor) {
          line-height: 1.5 !important;
          letter-spacing: 0.025em !important;
        }

        /* Modern Shadows */
        :global(.gjs-pn-panel),
        :global(.gjs-toolbar),
        :global(.gjs-cv-canvas) {
          box-shadow: 
            0 1px 3px 0 rgba(0, 0, 0, 0.1),
            0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
        }

        /* Clean Canvas Area */
        :global(.gjs-cv-canvas) {
          background: #f8fafc !important;
          padding: 16px !important;
        }

        /* Canvas Frame */
        :global(.gjs-frame) {
          background: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 6px !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
          overflow: hidden !important;
        }

        /* Clean Device Manager */
        :global(.gjs-pn-devices-c) {
          background: #ffffff !important;
          border-bottom: 1px solid #e5e7eb !important;
          padding: 8px 12px !important;
          display: flex !important;
          justify-content: center !important;
          gap: 6px !important;
        }

        :global(.gjs-pn-device) {
          background: #f9fafb !important;
          border: 1px solid #d1d5db !important;
          border-radius: 4px !important;
          color: #6b7280 !important;
          cursor: pointer !important;
          font-size: 12px !important;
          padding: 4px 8px !important;
          transition: all 0.15s ease !important;
        }

        :global(.gjs-pn-device:hover) {
          background: #f3f4f6 !important;
          border-color: #9ca3af !important;
          color: #374151 !important;
        }

        :global(.gjs-pn-device.gjs-pn-active) {
          background: #3b82f6 !important;
          border-color: #3b82f6 !important;
          color: #ffffff !important;
        }

        /* Clean Toolbar */
        :global(.gjs-toolbar) {
          background: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          padding: 8px 12px !important;
        }

        :global(.gjs-toolbar .gjs-toolbar-item) {
          background: transparent !important;
          border: none !important;
          border-radius: 4px !important;
          color: #6b7280 !important;
          font-size: 14px !important;
          margin: 0 2px !important;
          padding: 6px 8px !important;
          transition: all 0.15s ease !important;
        }

        :global(.gjs-toolbar .gjs-toolbar-item:hover) {
          background: #f9fafb !important;
          color: #374151 !important;
        }

        :global(.gjs-toolbar .gjs-toolbar-item.gjs-toolbar-item-active) {
          background: #3b82f6 !important;
          color: #ffffff !important;
        }

        /* Clean Rulers */
        :global(.gjs-ruler-h),
        :global(.gjs-ruler-v) {
          background: #f8fafc !important;
          border-color: #e5e7eb !important;
          color: #6b7280 !important;
          font-size: 10px !important;
        }

        /* Clean Grid */
        :global(.gjs-cv-canvas.gjs-cv-grid) {
          background-image: 
            linear-gradient(rgba(229, 231, 235, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(229, 231, 235, 0.5) 1px, transparent 1px) !important;
          background-size: 20px 20px !important;
        }

        /* Clean Zoom Controls */
        :global(.gjs-cv-zoom) {
          background: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 4px !important;
          bottom: 16px !important;
          right: 16px !important;
          padding: 4px !important;
        }

        :global(.gjs-cv-zoom button) {
          background: transparent !important;
          border: none !important;
          border-radius: 2px !important;
          color: #6b7280 !important;
          font-size: 12px !important;
          padding: 2px 4px !important;
          transition: all 0.15s ease !important;
        }

        :global(.gjs-cv-zoom button:hover) {
          background: #f9fafb !important;
          color: #374151 !important;
        }

        /* Modern Typography System */
        :global(.gjs-editor),
        :global(.gjs-editor *) {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }

        /* Typography Hierarchy */
        :global(.gjs-pn-panel .gjs-pn-header) {
          font-size: 14px !important;
          font-weight: 600 !important;
          letter-spacing: 0.025em !important;
          text-transform: uppercase !important;
          color: #1e293b !important;
        }

        :global(.gjs-blocks .gjs-block) {
          font-size: 12px !important;
          font-weight: 500 !important;
          letter-spacing: 0.025em !important;
        }

        :global(.gjs-layers .gjs-layer) {
          font-size: 13px !important;
          font-weight: 400 !important;
          line-height: 1.4 !important;
        }

        :global(.gjs-sm-properties .gjs-sm-property) {
          font-size: 13px !important;
          font-weight: 400 !important;
        }

        :global(.gjs-sm-property .gjs-sm-label) {
          font-size: 12px !important;
          font-weight: 500 !important;
          color: #475569 !important;
          text-transform: capitalize !important;
        }

        /* Enhanced Color Scheme */
        :global(.gjs-editor) {
          --primary-50: #eff6ff;
          --primary-100: #dbeafe;
          --primary-200: #bfdbfe;
          --primary-300: #93c5fd;
          --primary-400: #60a5fa;
          --primary-500: #3b82f6;
          --primary-600: #2563eb;
          --primary-700: #1d4ed8;
          --primary-800: #1e40af;
          --primary-900: #1e3a8a;
          
          --gray-50: #f8fafc;
          --gray-100: #f1f5f9;
          --gray-200: #e2e8f0;
          --gray-300: #cbd5e1;
          --gray-400: #94a3b8;
          --gray-500: #64748b;
          --gray-600: #475569;
          --gray-700: #334155;
          --gray-800: #1e293b;
          --gray-900: #0f172a;
          
          --success-500: #10b981;
          --warning-500: #f59e0b;
          --error-500: #ef4444;
        }

        /* Apply Color Variables */
        :global(.gjs-pn-panel) {
          background: var(--gray-50) !important;
          border-color: var(--gray-200) !important;
        }

        :global(.gjs-pn-header) {
          background: var(--gray-100) !important;
          border-color: var(--gray-200) !important;
          color: var(--gray-800) !important;
        }

        :global(.gjs-blocks .gjs-block) {
          background: #ffffff !important;
          border: 1px solid var(--gray-200) !important;
          color: var(--gray-700) !important;
        }

        :global(.gjs-blocks .gjs-block:hover) {
          border-color: var(--primary-300) !important;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15) !important;
        }

        :global(.gjs-layers .gjs-layer) {
          color: var(--gray-700) !important;
        }

        :global(.gjs-layers .gjs-layer:hover) {
          background: var(--gray-100) !important;
        }

        :global(.gjs-layers .gjs-layer.gjs-hovered) {
          background: var(--primary-50) !important;
          color: var(--primary-700) !important;
        }

        :global(.gjs-layers .gjs-layer.gjs-selected) {
          background: var(--primary-100) !important;
          color: var(--primary-800) !important;
          border-left: 3px solid var(--primary-500) !important;
        }

        /* Form Elements Color Scheme */
        :global(.gjs-field) {
          background: #ffffff !important;
          border: 1px solid var(--gray-300) !important;
          color: var(--gray-700) !important;
          font-size: 13px !important;
          font-weight: 400 !important;
        }

        :global(.gjs-field:focus) {
          border-color: var(--primary-500) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        /* Status Colors */
        :global(.gjs-editor .success) {
          color: var(--success-500) !important;
        }

        :global(.gjs-editor .warning) {
          color: var(--warning-500) !important;
        }

        :global(.gjs-editor .error) {
          color: var(--error-500) !important;
        }

        /* Enhanced Scrollbars */
        :global(.gjs-editor ::-webkit-scrollbar) {
          width: 8px !important;
          height: 8px !important;
        }

        :global(.gjs-editor ::-webkit-scrollbar-track) {
          background: var(--gray-100) !important;
          border-radius: 4px !important;
        }

        :global(.gjs-editor ::-webkit-scrollbar-thumb) {
          background: var(--gray-300) !important;
          border-radius: 4px !important;
          transition: background 0.2s ease !important;
        }

        :global(.gjs-editor ::-webkit-scrollbar-thumb:hover) {
          background: var(--gray-400) !important;
        }

        /* Improved Accessibility */
        :global(.gjs-editor button:focus),
        :global(.gjs-editor input:focus),
        :global(.gjs-editor select:focus),
        :global(.gjs-editor textarea:focus) {
          outline: 2px solid var(--primary-500) !important;
          outline-offset: 2px !important;
        }

        /* High Contrast Mode Support */
        @media (prefers-contrast: high) {
          :global(.gjs-editor) {
            --gray-200: #000000;
            --gray-700: #000000;
            --primary-500: #0000ff;
          }
        }

        /* Dark Mode Preparation */
        @media (prefers-color-scheme: dark) {
          :global(.gjs-editor) {
            --gray-50: #0f172a;
            --gray-100: #1e293b;
            --gray-200: #334155;
            --gray-700: #cbd5e1;
            --gray-800: #f1f5f9;
          }
        }

        /* Responsive Typography */
        @media (max-width: 768px) {
          :global(.gjs-pn-panel .gjs-pn-header) {
            font-size: 12px !important;
          }
          
          :global(.gjs-blocks .gjs-block) {
            font-size: 11px !important;
          }
        }

        /* Print Styles */
        @media print {
          :global(.gjs-editor) {
            font-size: 12pt !important;
            color: #000000 !important;
            background: #ffffff !important;
          }
        }

        // custom style











      `}</style>
    </div>
  );
};

export default GrapesJSEditor;