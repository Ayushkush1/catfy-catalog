'use client';

import React, { useEffect, useState } from 'react';
import { TemplateComponentProps } from '@/lib/template-registry';
import dynamic from 'next/dynamic';

// Dynamically import GrapesJSEditor to avoid SSR issues
const GrapesJSEditor = dynamic(
  () => import('@/components/editor/GrapesJSEditor'),
  { ssr: false }
);

// Initial HTML template
const initialHTML = `
<div class="catalogue-container">
  <section id="cover-page" class="page">
    <div class="company-header">
      <div class="logo-container">
        <img class="company-logo" data-gjs-type="image" data-field="profile.logo" />
      </div>
      <h1 class="company-name" data-field="profile.companyName">Company Name</h1>
      <p class="company-tagline" data-field="profile.tagline">Company Tagline</p>
    </div>
    <div class="catalogue-title-container">
      <h2 class="catalogue-title" data-field="catalogue.title">Catalogue Title</h2>
      <p class="catalogue-description" data-field="catalogue.description">Catalogue Description</p>
    </div>
  </section>
  
  <section id="products-page" class="page">
    <h2 class="section-title">Our Products</h2>
    <div class="products-container" data-gjs-type="products-grid" data-field="products">
      <!-- Products will be dynamically populated -->
      <div class="product-card" data-gjs-type="product-card">
        <div class="product-image-container">
          <img class="product-image" data-field="product.images[0]" />
        </div>
        <h3 class="product-name" data-field="product.name">Product Name</h3>
        <p class="product-description" data-field="product.description">Product Description</p>
        <p class="product-price" data-field="product.priceDisplay">$99.99</p>
      </div>
    </div>
  </section>
  
  <section id="contact-page" class="page">
    <h2 class="section-title">Contact Us</h2>
    <div class="contact-container">
      <div class="contact-info">
        <p class="contact-email" data-field="profile.email">Email</p>
        <p class="contact-phone" data-field="profile.phone">Phone</p>
        <p class="contact-address" data-field="profile.address">Address</p>
      </div>
      <div class="social-links" data-field="profile.socialLinks">
        <!-- Social links will be dynamically populated -->
      </div>
    </div>
  </section>
</div>
`;

// Initial CSS
const initialCSS = `
.catalogue-container {
  font-family: 'Inter', sans-serif;
  color: #333;
  max-width: 1200px;
  margin: 0 auto;
}

.page {
  min-height: 100vh;
  padding: 2rem;
  margin-bottom: 2rem;
  break-after: page;
  page-break-after: always;
}

.company-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.logo-container {
  width: 120px;
  height: 120px;
  margin-bottom: 1rem;
}

.company-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.company-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.company-tagline {
  font-size: 1.2rem;
  color: #666;
}

.catalogue-title-container {
  text-align: center;
  margin: 3rem 0;
}

.catalogue-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.catalogue-description {
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
}

.products-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.product-image-container {
  width: 100%;
  height: 200px;
  margin-bottom: 1rem;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.product-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.product-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.product-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #059669;
}

.contact-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contact-info {
  margin-bottom: 2rem;
  text-align: center;
}

.social-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
`;

export function ModernGrapesJSTemplate({ content, theme, isEditMode = false }: TemplateComponentProps) {
  const [html, setHtml] = useState(initialHTML);
  const [css, setCss] = useState(initialCSS);
  
  // Function to handle saving content
  const handleSave = (htmlContent: string, cssContent: string, components: any) => {
    setHtml(htmlContent);
    setCss(cssContent);
    console.log('Saved content:', { html: htmlContent, css: cssContent, components });
  };

  // Function to populate template with content data
  const populateTemplate = () => {
    // In a real implementation, this would replace data-field attributes with actual content
    // For now, we're just using the initial template
    return { html, css };
  };

  // Get populated template
  const { html: populatedHtml, css: populatedCss } = populateTemplate();

  // Safety check - ensure we have valid HTML before rendering
  if (!populatedHtml || populatedHtml.trim() === '') {
    return (
      <div className="flex items-center justify-center h-64 bg-yellow-50 rounded-lg">
        <p className="text-yellow-600">Template content is not available</p>
      </div>
    );
  }

  try {
    // If in edit mode, show the GrapesJS editor
    if (isEditMode) {
      return (
        <GrapesJSEditor
          initialHtml={populatedHtml}
          initialCss={populatedCss}
          onSave={handleSave}
        />
      );
    }

    // If in preview mode, render the template with the content
    return (
      <div className="grapesjs-template-preview">
        <style dangerouslySetInnerHTML={{ __html: populatedCss }} />
        <div dangerouslySetInnerHTML={{ __html: populatedHtml }} />
      </div>
    );
  } catch (error) {
    console.error('Error rendering ModernGrapesJS template:', error);
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <p className="text-red-500">Error rendering template: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}

// Wrapper component for template registry compatibility
export function ModernGrapesJSTemplateWrapper(props: TemplateComponentProps) {
  return <ModernGrapesJSTemplate {...props} />;
}

export { ModernGrapesJSTemplateWrapper as component };