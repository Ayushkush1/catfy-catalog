import { TemplateConfig } from '@/lib/template-registry'

const template: Omit<TemplateConfig, 'id'> = {
  name: 'Modern 4-Page Catalog',
  description: 'A sleek, modern catalog design with 4 pages featuring cover, table of contents, product grid, and contact information.',
  category: 'modern',
  isPremium: false,
  version: '1.0.0',
  author: 'Catfy Team',
  previewImage: '/templates/modern-4page-preview.jpg',
  features: [
    '4-page layout',
    'Modern design',
    'Product categorization',
    'Contact information',
    'Responsive grid',
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

export default template