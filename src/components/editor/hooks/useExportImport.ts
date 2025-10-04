'use client';

import { useCallback, useRef } from 'react';
import { useEditor } from '@craftjs/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Page } from '../ui';

export interface ExportOptions {
  format: 'pdf' | 'png' | 'json' | 'html';
  quality?: number;
  scale?: number;
  filename?: string;
  includeStyles?: boolean;
  multiPage?: boolean;
}

export interface ImportOptions {
  replaceExisting?: boolean;
  validateData?: boolean;
}

export const useExportImport = () => {
  const { query, actions } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export single page as PNG
  const exportAsPNG = useCallback(async (
    element: HTMLElement,
    options: Partial<ExportOptions> = {}
  ): Promise<string> => {
    const {
      quality = 1,
      scale = 2,
      filename = 'page'
    } = options;

    try {
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Convert to blob and download
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create image blob'));
            return;
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          resolve(url);
        }, 'image/png', quality);
      });
    } catch (error) {
      console.error('PNG export failed:', error);
      throw error;
    }
  }, []);

  // Export multiple pages as PDF
  const exportAsPDF = useCallback(async (
    pages: Page[],
    canvasElements: HTMLElement[],
    options: Partial<ExportOptions> = {}
  ): Promise<void> => {
    const {
      scale = 2,
      filename = 'document'
    } = options;

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      for (let i = 0; i < canvasElements.length; i++) {
        const element = canvasElements[i];
        
        if (i > 0) {
          pdf.addPage();
        }

        const canvas = await html2canvas(element, {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Calculate dimensions to fit the page
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        
        // Center the image on the page
        const x = (pdfWidth - finalWidth) / 2;
        const y = (pdfHeight - finalHeight) / 2;

        pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      }

      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    }
  }, []);

  // Export as JSON
  const exportAsJSON = useCallback((
    pages: Page[],
    options: Partial<ExportOptions> = {}
  ): void => {
    const {
      filename = 'pages-data',
      multiPage = true
    } = options;

    try {
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        pages: multiPage ? pages : [pages[0]],
        metadata: {
          totalPages: pages.length,
          exportedAt: new Date().toISOString(),
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('JSON export failed:', error);
      throw error;
    }
  }, []);

  // Export as HTML
  const exportAsHTML = useCallback((
    pages: Page[],
    options: Partial<ExportOptions> = {}
  ): void => {
    const {
      filename = 'pages',
      includeStyles = true,
      multiPage = true
    } = options;

    try {
      // Generate HTML content
      let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Pages</title>
    ${includeStyles ? `
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
        }
        .page {
            background: white;
            margin: 20px auto;
            padding: 40px;
            max-width: 800px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }
        .page-break {
            page-break-after: always;
        }
        @media print {
            body { background: white; }
            .page { 
                margin: 0; 
                box-shadow: none; 
                border-radius: 0;
                page-break-after: always;
            }
        }
    </style>
    ` : ''}
</head>
<body>
`;

      const pagesToExport = multiPage ? pages : [pages[0]];
      
      pagesToExport.forEach((page, index) => {
        // Parse the page data and convert to HTML
        // This is a simplified version - in a real implementation,
        // you'd need to convert the Craft.js JSON to actual HTML
        const pageHTML = convertCraftJSToHTML(page.data);
        
        htmlContent += `
    <div class="page${index < pagesToExport.length - 1 ? ' page-break' : ''}">
        <h1>${page.name}</h1>
        ${pageHTML}
    </div>
`;
      });

      htmlContent += `
</body>
</html>`;

      const dataBlob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('HTML export failed:', error);
      throw error;
    }
  }, []);

  // Helper function to convert Craft.js JSON to HTML
  const convertCraftJSToHTML = useCallback((jsonData: string): string => {
    try {
      const data = JSON.parse(jsonData);
      // This is a simplified conversion - you'd need to implement
      // proper conversion logic based on your component structure
      return '<div>Content converted from Craft.js data</div>';
    } catch (error) {
      return '<div>Error converting page data</div>';
    }
  }, []);

  // Import from JSON
  const importFromJSON = useCallback(async (
    file: File,
    options: ImportOptions = {}
  ): Promise<Page[]> => {
    const {
      validateData = true
    } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importData = JSON.parse(content);

          // Validate the imported data structure
          if (validateData) {
            if (!importData.pages || !Array.isArray(importData.pages)) {
              throw new Error('Invalid file format: missing pages array');
            }

            // Validate each page
            importData.pages.forEach((page: any, index: number) => {
              if (!page.id || !page.name || !page.data) {
                throw new Error(`Invalid page data at index ${index}`);
              }
            });
          }

          // Convert imported data to Page objects
          const pages: Page[] = importData.pages.map((pageData: any) => ({
            id: pageData.id || `imported-${Date.now()}-${Math.random()}`,
            name: pageData.name || 'Imported Page',
            data: pageData.data || '{}',
            createdAt: pageData.createdAt ? new Date(pageData.createdAt) : new Date(),
            updatedAt: new Date(),
            thumbnail: pageData.thumbnail,
          }));

          resolve(pages);
        } catch (error) {
          reject(new Error(`Failed to import JSON: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }, []);

  // Import single page data
  const importPageData = useCallback(async (
    file: File,
    options: ImportOptions = {}
  ): Promise<string> => {
    const {
      validateData = true
    } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);

          // Validate the data if required
          if (validateData) {
            // Basic validation for Craft.js data structure
            if (typeof data !== 'object' || data === null) {
              throw new Error('Invalid JSON data structure');
            }
          }

          resolve(JSON.stringify(data));
        } catch (error) {
          reject(new Error(`Failed to import page data: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }, []);

  // Trigger file import dialog
  const triggerImport = useCallback((
    onImport: (file: File) => void,
    accept: string = '.json'
  ) => {
    if (!fileInputRef.current) {
      // Create a temporary file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          onImport(file);
        }
      };
      input.click();
    } else {
      fileInputRef.current.accept = accept;
      fileInputRef.current.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          onImport(file);
        }
      };
      fileInputRef.current.click();
    }
  }, []);

  // Get current page data for export
  const getCurrentPageData = useCallback(() => {
    return query.serialize();
  }, [query]);

  // Load page data into editor
  const loadPageData = useCallback((data: string) => {
    try {
      console.log('🔍 Loading page data:', {
        dataType: typeof data,
        dataLength: data.length,
        dataPreview: data.substring(0, 200) + '...'
      });
      
      // Parse the data to validate it
      const parsedData = JSON.parse(data);
      console.log('📊 Parsed data structure:', {
        rootExists: !!parsedData.ROOT,
        nodeCount: Object.keys(parsedData).length,
        nodeIds: Object.keys(parsedData)
      });
      
      // Log current editor state before clearing
      const currentState = query.serialize();
      console.log('🔄 Current editor state before clear:', {
        currentNodeCount: Object.keys(JSON.parse(currentState)).length
      });
      
      // Clear the editor completely first
      actions.clearEvents();
      
      // Get the ROOT node and clear its children
      const rootNodeId = 'ROOT';
      const rootNode = query.node(rootNodeId).get();
      if (rootNode) {
        if (rootNode.data.nodes && rootNode.data.nodes.length > 0) {
          // Remove all child nodes from ROOT
          rootNode.data.nodes.forEach((nodeId: string) => {
            const childNode = query.node(nodeId).get();
            if (childNode) {
              actions.delete(nodeId);
            }
          });
        }
      }
      
      // Log state after clearing
      const clearedState = query.serialize();
      console.log('🧹 Editor state after clear:', {
        clearedNodeCount: Object.keys(JSON.parse(clearedState)).length
      });
      
      // Deserialize the parsed data (must be an object, not a string)
      console.log('🔄 About to deserialize parsed data...');
      try {
        actions.deserialize(parsedData);
        console.log('✅ Deserialization completed successfully');
      } catch (deserializeError) {
        console.error('❌ Deserialization failed:', deserializeError);
        throw new Error(`Deserialization failed: ${(deserializeError as Error).message}`);
      }
      
      // Log state after deserialization
      const newState = query.serialize();
      console.log('🎯 Editor state after deserialize:', {
        newNodeCount: Object.keys(JSON.parse(newState)).length,
        newNodeIds: Object.keys(JSON.parse(newState))
      });
      
      // Force a re-render by triggering a state update
      // This ensures the canvas reflects the new template content
      setTimeout(() => {
        actions.clearEvents();
        console.log('🔄 Forced canvas re-render');
      }, 100);
      
      console.log('✅ Template loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to load page data:', error);
      console.error('📋 Data that failed:', data);
      return false;
    }
  }, [actions, query]);

  return {
    // Export functions
    exportAsPNG,
    exportAsPDF,
    exportAsJSON,
    exportAsHTML,

    // Import functions
    importFromJSON,
    importPageData,
    triggerImport,

    // Utility functions
    getCurrentPageData,
    loadPageData,
    convertCraftJSToHTML,

    // Refs
    fileInputRef,
  };
};