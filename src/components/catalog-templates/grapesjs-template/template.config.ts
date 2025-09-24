import { TemplateConfig } from '@/lib/template-registry';

export const grapesJSTemplateConfig: TemplateConfig = {
  id: 'grapesjs-template',
  name: 'GrapesJS Template',
  description: 'A fully customizable drag-and-drop template editor',
  category: 'modern',
  isPremium: false,
  version: '1.0.0',
  author: 'Catfy',
  previewImage: '/templates/grapesjs-template-preview.svg',
  features: [
    'Drag and drop editor',
    'Responsive design',
    'Custom blocks',
    'HTML/CSS/JS editing',
    'Export to HTML/PDF'
  ],
  pageCount: 1,
  supportedFields: {
    products: ['name', 'description', 'price', 'image'],
    categories: ['name', 'image'],
    profile: ['companyName', 'companyLogo', 'companyDescription']
  },
  compatibleThemes: ['*'],
  requiredThemeFeatures: [],
  layoutOptions: {
    responsive: true,
    printOptimized: true,
    customizable: true
  },
  isGrapesJSTemplate: true,
  grapesJSData: {
    html: '<div class="catalog-container"><h1>My Catalogue</h1><div class="product-grid"></div></div>',
    css: '.catalog-container { padding: 20px; } .product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }',
    js: '',
    components: []
  },
  createdAt: new Date(),
  updatedAt: new Date()
};