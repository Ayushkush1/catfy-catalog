import { TemplateConfig } from '../../../lib/template-registry';

export const productShowcaseConfig: TemplateConfig = {
  id: 'product-showcase',
  name: 'Product Showcase',
  description: 'A modern 3-page template designed for showcasing products with elegant layouts and professional presentation',
  category: 'product',
  pageCount: 3,
  version: '1.0.0',
  author: 'Catfy Team',
  isPremium: false,
  previewImage: '/templates/product-showcase-preview.svg',
  features: [
    'Product catalog display',
    'Category organization',
    'New collection highlights',
    'Contact information',
    'Professional layout',
    'Theme color integration',
    'Responsive design',
    'Print optimization'
  ],
  supportedFields: {
    products: ['name', 'description', 'price', 'images', 'sku', 'tags', 'currency', 'priceDisplay'],
    categories: ['name', 'description', 'color'],
    profile: ['companyName', 'logo', 'email', 'phone', 'website', 'address', 'description', 'tagline', 'socialLinks']
  },
  compatibleThemes: ['*'],
  requiredThemeFeatures: [],
  layoutOptions: {
    responsive: true,
    printOptimized: true,
    customizable: true
  },
  customProperties: {
    supportsSmartSort: true,
    supportsDragDrop: true,
    supportsColorCustomization: true,
    supportsFontCustomization: true,
    supportsSpacingCustomization: true,
    supportsAdvancedStyles: true
  },
  createdAt: new Date(),
  updatedAt: new Date()
};