import { TemplateConfig } from '../../../lib/template-registry';

export const furnitureCatalogueConfig: TemplateConfig = {
    id: 'furniture-catalogue',
    name: 'Furniture Catalogue',
    description: 'An elegant 4-page template designed specifically for furniture brands and home decor retailers to showcase their products with sophisticated layouts and professional craftsmanship presentation',
    category: 'product',
    pageCount: 4,
    version: '1.0.0',
    author: 'Catfy Team',
    isPremium: false,
    previewImage: '/templates/furniture-catalogue-preview.svg',
    features: [
        'Elegant dark theme design',
        'Product catalog display',
        'Craftsmanship details showcase',
        'Category organization',
        'Contact information',
        'Professional layout',
        'Theme color integration',
        'Responsive design',
        'Print optimization',
        'Premium furniture branding'
    ],
    supportedFields: {
        products: ['name', 'description', 'price', 'images', 'sku', 'tags', 'currency', 'priceDisplay', 'dimensions', 'materials', 'finishes'],
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