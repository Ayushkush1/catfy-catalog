import { TemplateConfig } from '../../../lib/template-registry';

export const fmcgCatalogueConfig: TemplateConfig = {
  id: 'fmcg-catalogue',
  name: 'FMCG Catalogue',
  description: 'A premium dark-themed 4-page template designed for FMCG brands, luxury products, and consumer goods with sophisticated layouts and elegant presentation',
  category: 'product',
  pageCount: 4,
  version: '1.0.0',
  author: 'Catfy Team',
  isPremium: false,
  previewImage: '/templates/fmcg-catalogue-preview.svg',
  features: [
    'Premium dark theme design',
    'Luxury product showcase',
    'Category-based organization',
    'Crafted excellence branding',
    'Contact information',
    'Professional dark layouts',
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