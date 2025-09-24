/**
 * GrapesJS Template Converter
 * Converts existing React templates to GrapesJS compatible format
 */

import { Catalogue, Category, Product, Profile } from '@prisma/client';
import { StandardizedContent } from './content-schema';

// Define the structure for GrapesJS template
export interface GrapesJSTemplate {
  id: string;
  name: string;
  html: string;
  css: string;
  components?: any; // GrapesJS component JSON structure
  styles?: any; // GrapesJS styles JSON structure
  assets?: string[]; // URLs of assets used in the template
}

// Template mapping configuration
export interface TemplateMapping {
  templateId: string;
  sections: {
    coverPage: string;
    productPage: string;
    contactPage: string;
    // Add more sections as needed
  };
  styles: {
    global: string;
    coverPage: string;
    productPage: string;
    contactPage: string;
    // Add more styles as needed
  };
}

// Base HTML structure for GrapesJS templates
const BASE_HTML = `
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

// Base CSS for GrapesJS templates
const BASE_CSS = `
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

/**
 * Converts a template to GrapesJS format
 * @param templateId The ID of the template to convert
 * @param content Standardized content for the template
 * @returns GrapesJS template object
 */
export function convertToGrapesJSTemplate(
  templateId: string,
  content?: StandardizedContent
): GrapesJSTemplate {
  // For now, return a basic template with the base HTML and CSS
  // In a real implementation, this would use the templateId to determine
  // which specific template structure to use
  
  return {
    id: templateId,
    name: `GrapesJS ${templateId}`,
    html: BASE_HTML,
    css: BASE_CSS,
    // These would be populated with actual GrapesJS component data
    components: null,
    styles: null,
    assets: []
  };
}

/**
 * Creates a new GrapesJS template based on a template ID
 * @param templateId The ID of the template to use as a base
 * @param name Optional name for the new template
 * @returns New GrapesJS template
 */
export function createNewGrapesJSTemplate(
  templateId: string,
  name?: string
): GrapesJSTemplate {
  return {
    id: `grapesjs-${templateId}-${Date.now()}`,
    name: name || `New ${templateId} Template`,
    html: BASE_HTML,
    css: BASE_CSS,
    components: null,
    styles: null,
    assets: []
  };
}

/**
 * Converts standardized content to GrapesJS component data
 * @param content Standardized content
 * @returns GrapesJS component data
 */
export function contentToGrapesJSComponents(content: StandardizedContent): any {
  // This would convert the standardized content to GrapesJS component format
  // For now, return a placeholder
  return {
    type: 'root',
    components: [
      {
        type: 'text',
        content: 'Placeholder for converted content'
      }
    ]
  };
}