import { TemplateConfig } from '@/lib/template-registry';
import { HomeDecorCatalogueTemplateWrapper } from './HomeDecorCatalogueTemplate';

export const homeDecorCatalogueConfig: TemplateConfig = {
    id: 'home-decor-catalogue',
    name: 'Home Decor Catalogue',
    description: 'An elegant 4-page template designed specifically for home decor and interior design brands to showcase their products with sophisticated layouts and artistic presentation',
    category: 'product',
    isPremium: false,
    version: '1.0.0',
    author: 'Catfy Design Team',
    previewImage: '/templates/home-decor-catalogue-preview.svg',
    features: [
        'Elegant artistic design',
        'Home decor product showcase',
        'Interior design inspiration',
        'Sophisticated layouts',
        'Contact information',
        'Professional branding',
        'Theme color integration',
        'Responsive design',
        'Print optimization',
        'Artisan craftsmanship focus'
    ],
    pageCount: 4,
    supportedFields: {
        products: ['name', 'description', 'price', 'images', 'sku', 'tags', 'currency', 'priceDisplay', 'materials', 'dimensions'],
        categories: ['name', 'description', 'color'],
        profile: ['companyName', 'logo', 'email', 'phone', 'website', 'address', 'description', 'tagline', 'socialLinks']
    },
    compatibleThemes: ['*'], // Compatible with all themes
    requiredThemeFeatures: [],
    layoutOptions: {
        responsive: true,
        printOptimized: true,
        customizable: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
};

export { HomeDecorCatalogueTemplateWrapper as component };