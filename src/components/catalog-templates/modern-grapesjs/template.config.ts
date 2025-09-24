import { TemplateConfig } from '@/lib/template-registry';

export const modernGrapesJSConfig: TemplateConfig = {
  id: 'modern-grapesjs',
  name: 'Modern GrapesJS Template',
  description: 'A fully customizable template built with GrapesJS that allows complete design freedom with drag-and-drop editing',
  category: 'modern',
  isPremium: false,
  version: '1.0.0',
  author: 'Catfy Team',
  previewImage: '/templates/modern-grapesjs-preview.svg',
  features: [
    'Drag & drop editing',
    'Complete design freedom',
    'Responsive design',
    'Custom components',
    'Dynamic data binding',
    'Real-time preview',
    'Export to HTML/CSS',
    'Template saving',
    'Theme integration',
    'Print optimization'
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
    supportsGrapesJS: true,
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