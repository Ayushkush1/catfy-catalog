'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { StandardizedContent } from '@/lib/content-schema';
import { ThemeConfig } from '@/lib/theme-registry';
import { TemplateComponentProps } from '@/lib/template-registry';
import { templateManager } from '@/lib/template-management';

// Dynamically import GrapesJSEditor to avoid SSR issues
const GrapesJSEditor = dynamic(
  () => import('@/components/editor/GrapesJSEditor'),
  { ssr: false }
);

// Dynamically import GrapesJSPreview to avoid SSR issues
const GrapesJSPreview = dynamic(
  () => import('@/components/preview/GrapesJSPreview'),
  { ssr: false }
);

interface GrapesJSTemplateProps extends TemplateComponentProps {
  templateId: string;
}

const GrapesJSTemplate: React.FC<GrapesJSTemplateProps> = ({
  content,
  theme,
  isEditMode = false,
  onContentUpdate,
  customProps,
  templateId,
}) => {
  const [html, setHtml] = useState<string>('');
  const [css, setCss] = useState<string>('');
  const [js, setJs] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load template data
  useEffect(() => {
    const loadTemplate = async () => {
      setIsLoading(true);
      try {
        // Try to load from template manager
        const template = await templateManager.getTemplate(templateId);
        
        if (template) {
          setHtml(template.html);
          setCss(template.css);
          setJs(template.js || '');
        } else {
          // Default furniture catalog template if none found
          setHtml(`
            <div class="furniture-catalog">
              <!-- Cover Page -->
              <div class="cover-page">
                <div class="cover-background">
                  <div class="cover-header">
                    <div class="brand-info">
                      <span data-field="profile.businessName">Your Business Name</span>
                      <span class="year" data-field="catalogue.year">2024</span>
                    </div>
                  </div>
                  <div class="cover-content">
                    <div class="cover-text">
                      <h1 data-field="catalogue.name">FURNITURE COLLECTION</h1>
                      <h2>CATALOG</h2>
                      <p data-field="catalogue.description">Discover our premium furniture collection featuring modern designs and exceptional craftsmanship.</p>
                      <button class="cta-button">EXPLORE COLLECTION</button>
                    </div>
                    <div class="cover-image">
                      <img data-field="catalogue.coverImageUrl" src="/api/placeholder/400/500" alt="Featured Product" />
                      <div class="new-badge">NEW ARRIVALS</div>
                    </div>
                  </div>
                  <div class="cover-footer">
                    <span>PREMIUM QUALITY • SUSTAINABLE MATERIALS • TIMELESS DESIGN</span>
                  </div>
                </div>
              </div>
              
              <!-- Products Section -->
              <div class="products-section">
                <h2>Our Collection</h2>
                <div class="products-grid" data-field="products" data-type="products-grid"></div>
              </div>
              
              <!-- Contact Section -->
              <div class="contact-section">
                <h2>Contact Us</h2>
                <div class="contact-info">
                  <p data-field="profile.businessName">Your Business Name</p>
                  <p data-field="profile.email">contact@yourbusiness.com</p>
                  <p data-field="profile.phone">+1 (555) 123-4567</p>
                  <p data-field="profile.address">123 Business Street, City, State 12345</p>
                </div>
              </div>
            </div>
          `);
          setCss(`
            .furniture-catalog {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
            }
            
            .cover-page {
              min-height: 100vh;
              position: relative;
              overflow: hidden;
            }
            
            .cover-background {
              background: linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%);
              min-height: 100vh;
              position: relative;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 40px;
              color: white;
            }
            
            .cover-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 40px;
            }
            
            .brand-info {
              display: flex;
              flex-direction: column;
              font-size: 14px;
              font-weight: 300;
              letter-spacing: 2px;
            }
            
            .year {
              margin-top: 5px;
              opacity: 0.8;
            }
            
            .cover-content {
              display: flex;
              align-items: center;
              justify-content: space-between;
              flex: 1;
              max-width: 1200px;
              margin: 0 auto;
              width: 100%;
            }
            
            .cover-text {
              flex: 1;
              max-width: 500px;
            }
            
            .cover-text h1 {
              font-size: 4rem;
              font-weight: 300;
              letter-spacing: 3px;
              margin: 0 0 20px 0;
              line-height: 1.1;
            }
            
            .cover-text h2 {
              font-size: 2rem;
              font-weight: 600;
              letter-spacing: 8px;
              margin: 0 0 30px 0;
              color: #d4af37;
            }
            
            .cover-text p {
              font-size: 1.1rem;
              line-height: 1.8;
              margin-bottom: 40px;
              opacity: 0.9;
              max-width: 400px;
            }
            
            .cta-button {
              background: transparent;
              border: 2px solid #d4af37;
              color: #d4af37;
              padding: 15px 30px;
              font-size: 14px;
              font-weight: 600;
              letter-spacing: 2px;
              cursor: pointer;
              transition: all 0.3s ease;
            }
            
            .cta-button:hover {
              background: #d4af37;
              color: #2c1810;
            }
            
            .cover-image {
              position: relative;
              margin-left: 60px;
            }
            
            .cover-image img {
              width: 350px;
              height: 450px;
              object-fit: cover;
              border-radius: 8px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }
            
            .new-badge {
              position: absolute;
              top: 20px;
              right: 20px;
              background: #d4af37;
              color: #2c1810;
              padding: 8px 16px;
              font-size: 12px;
              font-weight: 600;
              letter-spacing: 1px;
              border-radius: 4px;
            }
            
            .cover-footer {
              text-align: center;
              font-size: 12px;
              letter-spacing: 3px;
              opacity: 0.7;
              margin-top: 40px;
            }
            
            .products-section {
              padding: 80px 40px;
              max-width: 1200px;
              margin: 0 auto;
            }
            
            .products-section h2 {
              font-size: 2.5rem;
              text-align: center;
              margin-bottom: 60px;
              color: #2c1810;
              font-weight: 300;
              letter-spacing: 2px;
            }
            
            .products-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 30px;
              margin-bottom: 40px;
            }
            
            .contact-section {
              background: #f8f9fa;
              padding: 80px 40px;
              text-align: center;
            }
            
            .contact-section h2 {
              font-size: 2.5rem;
              margin-bottom: 40px;
              color: #2c1810;
              font-weight: 300;
              letter-spacing: 2px;
            }
            
            .contact-info {
              max-width: 600px;
              margin: 0 auto;
            }
            
            .contact-info p {
              font-size: 1.1rem;
              margin-bottom: 15px;
              color: #555;
            }
            
            @media (max-width: 768px) {
              .cover-content {
                flex-direction: column;
                text-align: center;
              }
              
              .cover-image {
                margin-left: 0;
                margin-top: 40px;
              }
              
              .cover-text h1 {
                font-size: 2.5rem;
              }
              
              .products-grid {
                grid-template-columns: 1fr;
              }
            }
          `);
          setJs('');
        }
      } catch (error) {
        console.error('Error loading template:', error);
        // Default furniture catalog template on error
        setHtml(`
          <div class="furniture-catalog">
            <div class="cover-page">
              <div class="cover-background">
                <div class="cover-content">
                  <div class="cover-text">
                    <h1 data-field="catalogue.name">FURNITURE COLLECTION</h1>
                    <h2>CATALOG</h2>
                    <p data-field="catalogue.description">Discover our premium furniture collection featuring modern designs and exceptional craftsmanship.</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="products-section">
              <h2>Our Collection</h2>
              <div class="products-grid" data-field="products" data-type="products-grid"></div>
            </div>
          </div>
        `);
        setCss(`
          .furniture-catalog { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .cover-page { min-height: 50vh; position: relative; }
          .cover-background { background: linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%); min-height: 50vh; display: flex; align-items: center; justify-content: center; padding: 40px; color: white; }
          .cover-text h1 { font-size: 3rem; font-weight: 300; letter-spacing: 3px; margin: 0 0 20px 0; }
          .cover-text h2 { font-size: 1.5rem; font-weight: 600; letter-spacing: 8px; margin: 0 0 30px 0; color: #d4af37; }
          .products-section { padding: 60px 40px; max-width: 1200px; margin: 0 auto; }
          .products-section h2 { font-size: 2.5rem; text-align: center; margin-bottom: 40px; color: #2c1810; }
          .products-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        `);
        setJs('');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [templateId]);

  // Handle save from editor
  const handleSave = async (html: string, css: string, js: string) => {
    try {
      // Save template
      await templateManager.saveTemplate({
        id: templateId,
        name: `Template ${templateId}`,
        html,
        css,
        js,
        components: [],
      });

      // Update state
      setHtml(html);
      setCss(css);
      setJs(js);

      // Notify parent if needed
      if (onContentUpdate) {
        onContentUpdate({
          // Update any content fields if needed
        });
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading template...</div>;
  }

  // Safety check - ensure we have valid HTML before rendering
  if (!html || html.trim() === '') {
    return (
      <div className="flex items-center justify-center h-64 bg-yellow-50 rounded-lg">
        <p className="text-yellow-600">Template content is not available</p>
      </div>
    );
  }

  // Render editor in edit mode, preview in view mode
  try {
    return isEditMode ? (
      <GrapesJSEditor
        initialHtml={html}
        initialCss={css}
        initialJs={js}
        content={content}
        onSave={handleSave}
      />
    ) : (
      <GrapesJSPreview
        html={html}
        css={css}
        js={js}
        content={content}
        className="w-full h-full"
      />
    );
  } catch (error) {
    console.error('Error rendering GrapesJS component:', error);
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <p className="text-red-500">Error rendering template: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
};

export default GrapesJSTemplate;