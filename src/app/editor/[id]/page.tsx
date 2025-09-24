'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { templateManager } from '@/lib/template-management';
import { bindDataToTemplate } from '@/lib/grapesjs-data-binding';

// Add global declaration for GrapesJS editor
declare global {
  interface Window {
    grapesJsEditor: any;
  }
}

// Dynamically import GrapesJSEditor to avoid SSR issues
const GrapesJSEditor = dynamic(
  () => import('@/components/editor/GrapesJSEditor'),
  { ssr: false }
);

// Sample data - in a real implementation, this would come from an API
const SAMPLE_CONTENT = {
  companyName: 'Acme Corporation',
  companyLogo: '/logo.png',
  companyDescription: 'Leading provider of innovative solutions',
  products: [
    {
      id: '1',
      name: 'Premium Product',
      description: 'High-quality product for discerning customers',
      price: '$99.99',
      image: '/products/product1.jpg',
    },
    {
      id: '2',
      name: 'Standard Product',
      description: 'Reliable product for everyday use',
      price: '$49.99',
      image: '/products/product2.jpg',
    },
    {
      id: '3',
      name: 'Budget Product',
      description: 'Affordable option without compromising quality',
      price: '$29.99',
      image: '/products/product3.jpg',
    },
  ],
  categories: [
    { id: '1', name: 'Category 1', image: '/categories/category1.jpg' },
    { id: '2', name: 'Category 2', image: '/categories/category2.jpg' },
    { id: '3', name: 'Category 3', image: '/categories/category3.jpg' },
  ],
};

export default function EditorPage({ params }: { params: { id: string } }) {
  const [html, setHtml] = useState<string>('');
  const [css, setCss] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template') || 'modern-grapesjs';

  useEffect(() => {
    // In a real implementation, fetch the catalogue data and template
    const loadTemplate = async () => {
      setIsLoading(true);
      try {
        // Fetch template from template manager
        const template = await templateManager.getTemplate(templateId);
        
        if (template) {
          // If template exists, use it
          setHtml(template.html);
          setCss(template.css);
        } else {
          // Otherwise use default template
          setHtml('<div class="catalog-container"><h1>New Catalogue</h1><div class="product-grid"></div></div>');
          setCss('.catalog-container { padding: 20px; } .product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }');
        }
      } catch (error) {
        console.error('Error loading template:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [templateId, params.id]);

  const handleSave = async (html: string, css: string, js: string) => {
    setIsSaving(true);
    try {
      // Save the template
      await templateManager.saveTemplate({
        id: templateId,
        name: `Template for ${params.id}`,
        html,
        css,
        js,
        components: [], // This would be populated in a real implementation
      });

      // In a real implementation, save the catalogue data as well
      console.log('Saved template for catalogue:', params.id);
      
      // Navigate back to the catalogue page
      router.push(`/catalogue/${params.id}`);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    // Create a Blob with the HTML and CSS
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Catalogue</title>
  <style>${css}</style>
</head>
<body>
  ${html}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger it
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalogue-${params.id}.html`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading editor...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Modern Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Catalogue Editor</h1>
              <p className="text-sm text-slate-500">Editing: {params.id}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export HTML
          </Button>
          
          <Button 
            onClick={() => {
              if (window.grapesJsEditor) {
                const editor = window.grapesJsEditor;
                handleSave(
                  editor.getHtml(),
                  editor.getCss(),
                  editor.getJs()
                );
              }
            }}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save & Exit
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Editor Container */}
      <div className="flex-grow overflow-hidden">
        <GrapesJSEditor 
          initialHtml={bindDataToTemplate(html, SAMPLE_CONTENT)}
          initialCss={css}
          initialJs=""
          content={SAMPLE_CONTENT}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}