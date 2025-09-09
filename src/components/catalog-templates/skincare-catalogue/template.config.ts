import { TemplateConfig } from '@/lib/template-registry'

export const skincareCatalogueConfig: TemplateConfig = {
  id: 'skincare-catalogue',
  name: 'Skin Care Catalogue',
  description: 'A modern 4-page template designed specifically for skincare and wellness brands to showcase their botanical formulations with elegant, clean layouts and professional presentation',
  category: 'product',
  isPremium: false,
  version: '1.0.0',
  author: 'Catfy Team',
  previewImage: '/templates/skincare-catalogue-preview.svg',
  features: [
    'Skincare product showcase',
    'Botanical ingredients highlight',
    'Daily routine workflow',
    'Brand story presentation',
    'Professional contact page',
    'Premium aesthetic design',
    'Responsive grid layout',
    'Print-optimized',
    'Drag & drop editing',
    'Smart sorting',
    'Custom colors',
    'Font customization'
  ],
  pageCount: 4,
  supportedFields: {
    products: [
      'name',
      'description',
      'price',
      'images',
      'sku',
      'tags',
      'currency',
      'priceDisplay',
      'category'
    ],
    categories: [
      'name',
      'description',
      'color',
      'sortOrder'
    ],
    profile: [
      'companyName',
      'fullName',
      'logo',
      'email',
      'phone',
      'website',
      'address',
      'city',
      'state',
      'country',
      'tagline',
      'socialLinks'
    ]
  },
  compatibleThemes: ['*'], // Compatible with all themes
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
}