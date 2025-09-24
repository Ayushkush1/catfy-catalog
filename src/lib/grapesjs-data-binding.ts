/**
 * GrapesJS Data Binding System
 * Handles binding catalogue data to GrapesJS templates
 */

import { StandardizedContent } from './content-schema';
import get from 'lodash/get';

/**
 * Binds data to a GrapesJS template
 * @param html The HTML template with data-field attributes
 * @param content The standardized content to bind
 * @returns HTML with data fields populated
 */
export function bindDataToTemplate(html: string, content: StandardizedContent): string {
  if (!content || !html) return html;
  
  try {
    // Create a DOM parser to work with the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Check if parsing was successful
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.warn('HTML parsing error in bindDataToTemplate:', parserError.textContent);
      return html; // Return original HTML if parsing failed
    }
    
    // Find all elements with data-field attributes
    const elements = doc.querySelectorAll('[data-field]');
    
    elements.forEach(element => {
      try {
        const fieldPath = element.getAttribute('data-field');
        if (!fieldPath) return;
        
        // Get the value from the content using the field path
        const value = getValueFromPath(content, fieldPath);
        
        // Apply the value to the element based on its tag and attributes
        applyValueToElement(element, value);
      } catch (error) {
        console.warn('Error applying value to element:', error);
        // Continue with other elements
      }
    });
    
    // Convert back to HTML string
    const result = doc.body.innerHTML;
    
    // Validate the result is not empty
    if (!result || result.trim() === '') {
      console.warn('bindDataToTemplate produced empty result, returning original HTML');
      return html;
    }
    
    return result;
  } catch (error) {
    console.error('Error in bindDataToTemplate:', error);
    return html; // Return original HTML on any error
  }
}

/**
 * Gets a value from a nested object using a dot-notation path
 * @param obj The object to extract from
 * @param path The path to the value (e.g., "profile.companyName")
 * @returns The value at the path
 */
function getValueFromPath(obj: any, path: string): any {
  return get(obj, path);
}

/**
 * Applies a value to an element based on its tag and attributes
 * @param element The DOM element
 * @param value The value to apply
 */
function applyValueToElement(element: Element, value: any): void {
  if (value === undefined || value === null) return;
  
  const tagName = element.tagName.toLowerCase();
  
  switch (tagName) {
    case 'img':
      // For image elements, set the src attribute
      if (typeof value === 'string') {
        element.setAttribute('src', value);
      } else if (Array.isArray(value) && value.length > 0) {
        // If it's an array (like product.images), use the first item
        element.setAttribute('src', value[0]);
      }
      break;
      
    case 'input':
      // For input elements, set the value attribute
      element.setAttribute('value', String(value));
      break;
      
    case 'div':
      // Special handling for product grids
      if (element.getAttribute('data-gjs-type') === 'products-grid') {
        populateProductGrid(element, value);
      } else {
        element.textContent = String(value);
      }
      break;
      
    default:
      // For most elements, set the text content
      element.textContent = String(value);
      break;
  }
}

/**
 * Populates a product grid with product data
 * @param gridElement The grid element
 * @param products Array of products
 */
function populateProductGrid(gridElement: Element, products: any[]): void {
  if (!Array.isArray(products) || products.length === 0) return;
  
  // Clear existing content
  gridElement.innerHTML = '';
  
  // Create product cards for each product
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'furniture-product-card';
    productCard.style.cssText = 'background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s; margin-bottom: 16px;';
    
    productCard.innerHTML = `
      <div style="position: relative; width: 100%; height: 200px; overflow: hidden;">
        <img style="width: 100%; height: 100%; object-fit: cover;" src="${product.images?.[0] || '/api/placeholder/300/200'}" alt="${product.name || 'Product'}" />
        <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px;">${product.category?.name || 'Furniture'}</div>
      </div>
      <div style="padding: 16px;">
        <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 8px 0; color: #1f2937;">${product.name || 'Product Name'}</h3>
        <p style="font-size: 24px; font-weight: bold; color: #059669; margin: 0 0 8px 0;">${product.priceDisplay || product.price || 'Price not available'}</p>
        ${product.dimensions ? `<div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
          <span>Dimensions: </span><span>${product.dimensions}</span>
        </div>` : ''}
        ${product.finishes ? `<div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
          <span>Finishes: </span><span>${product.finishes}</span>
        </div>` : ''}
        ${product.materials ? `<div style="font-size: 12px; color: #6b7280;">
          <span>Materials: </span><span>${product.materials}</span>
        </div>` : ''}
      </div>
    `;
    
    gridElement.appendChild(productCard);
  });
}

/**
 * Extracts data from a GrapesJS template based on data-field attributes
 * @param html The HTML with data-field attributes and user-entered values
 * @param originalContent The original content object to update
 * @returns Updated content object
 */
export function extractDataFromTemplate(
  html: string, 
  originalContent: StandardizedContent
): StandardizedContent {
  const updatedContent = { ...originalContent };
  
  // Create a DOM parser to work with the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Find all elements with data-field attributes
  const elements = doc.querySelectorAll('[data-field]');
  
  elements.forEach(element => {
    const fieldPath = element.getAttribute('data-field');
    if (!fieldPath) return;
    
    // Extract the value from the element based on its tag and attributes
    const value = extractValueFromElement(element);
    
    // Set the value in the content object
    setValueAtPath(updatedContent, fieldPath, value);
  });
  
  return updatedContent;
}

/**
 * Extracts a value from an element based on its tag and attributes
 * @param element The DOM element
 * @returns The extracted value
 */
function extractValueFromElement(element: Element): any {
  const tagName = element.tagName.toLowerCase();
  
  switch (tagName) {
    case 'img':
      return element.getAttribute('src');
      
    case 'input':
      return element.getAttribute('value');
      
    default:
      return element.textContent;
  }
}

/**
 * Sets a value at a path in an object
 * @param obj The object to modify
 * @param path The path to set (e.g., "profile.companyName")
 * @param value The value to set
 */
function setValueAtPath(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    
    if (!current[part]) {
      current[part] = {};
    }
    
    current = current[part];
  }
  
  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;
}