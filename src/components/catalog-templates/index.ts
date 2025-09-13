import { Catalogue, Product, Category, Profile } from '@prisma/client'
import { SkincareCatalogueTemplate } from './skincare-catalogue/SkincareCatalogueTemplate'
import { FashionCatalogueTemplate } from './fashion-catalogue/FashionCatalogueTemplate'
import { FmcgCatalogueTemplate } from './fmcg-catalogue/FmcgCatalogueTemplate'
import { FurnitureCatalogueTemplate } from './furniture-catalogue/FurnitureCatalogueTemplate'
import { TemplateRegistry, type TemplateConfig as RegistryTemplateConfig } from '@/lib/template-registry'
import { ContentMapper, type StandardizedContent } from '@/lib/content-schema'

// Template interface that all catalog templates must implement
export interface CatalogTemplateProps {
  catalogue: Catalogue & {
    products: (Product & { category: Category | null })[]
    categories: Category[]
  }
  profile: Profile
  themeColors: {
    primary: string
    secondary: string
    accent: string
  }
  isEditMode?: boolean
  catalogueId?: string
  onProductsReorder?: (products: (Product & { category: Category | null })[]) => void
  onCatalogueUpdate?: (catalogueId: string, updates: Partial<Catalogue>) => void
  onProductUpdate?: (productId: string, updates: Partial<Product>) => void
  onContentChange?: (field: string, value: string) => void
  customColors?: any
  fontCustomization?: any
  spacingCustomization?: any
  advancedStyles?: any
  smartSortEnabled?: boolean
  themeId?: string
  standardizedContent?: StandardizedContent
}

// Legacy template configuration interface (for backward compatibility)
export interface TemplateConfig {
  id: string
  name: string
  description: string
  category: 'modern' | 'classic' | 'minimal' | 'creative' | 'product'
  isPremium: boolean
  previewImage: string
  component: React.ComponentType<CatalogTemplateProps>
  features: string[]
  pageCount: number
  supportedFields: {
    products: string[]
    categories: string[]
    profile: string[]
  }
}

// Re-export registry types for convenience
export type { RegistryTemplateConfig }

// Available catalog templates
export const CATALOG_TEMPLATES: TemplateConfig[] = [
  {
    id: 'skincare-catalogue',
    name: 'Skin Care Catalogue',
    description: 'A modern 4-page template designed specifically for skincare and wellness brands to showcase their botanical formulations with elegant, clean layouts and professional presentation',
    category: 'product',
    isPremium: false,
    previewImage: '/templates/skincare-catalogue-preview.svg',
    component: SkincareCatalogueTemplate,
    features: [
      'Skincare product showcase',
      'Botanical ingredients highlight',
      'Daily routine workflow',
      'Brand story presentation',
      'Professional contact page',
      'Premium aesthetic design',
      'Responsive grid layout',
      'Print-optimized'
    ],
    pageCount: 4,
    supportedFields: {
      products: ['name', 'description', 'price', 'images', 'sku', 'tags', 'currency', 'priceDisplay'],
      categories: ['name', 'description', 'color'],
      profile: ['companyName', 'logo', 'email', 'phone', 'website', 'address', 'description', 'tagline', 'socialLinks']
    }
  },
  {
    id: 'fashion-catalogue',
    name: 'Fashion Catalogue',
    description: 'A modern 4-page template designed specifically for fashion brands and clothing retailers to showcase their products with elegant layouts and professional presentation',
    category: 'product',
    isPremium: false,
    previewImage: '/templates/fashion-catalogue-preview.svg',
    component: FashionCatalogueTemplate,
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
    pageCount: 4,
    supportedFields: {
      products: ['name', 'description', 'price', 'images', 'sku', 'tags', 'currency', 'priceDisplay'],
      categories: ['name', 'description', 'color'],
      profile: ['companyName', 'logo', 'email', 'phone', 'website', 'address', 'description', 'tagline', 'socialLinks']
    }
  },
  {
    id: 'fmcg-catalogue',
    name: 'FMCG Catalogue',
    description: 'A premium dark-themed 4-page template designed for FMCG brands, luxury products, and consumer goods with sophisticated layouts and elegant presentation',
    category: 'product',
    isPremium: false,
    previewImage: '/templates/fmcg-catalogue-preview.svg',
    component: FmcgCatalogueTemplate,
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
    pageCount: 4,
    supportedFields: {
      products: ['name', 'description', 'price', 'images', 'sku', 'tags', 'currency', 'priceDisplay'],
      categories: ['name', 'description', 'color'],
      profile: ['companyName', 'logo', 'email', 'phone', 'website', 'address', 'description', 'tagline', 'socialLinks']
    }
  },
  {
    id: 'furniture-catalogue',
    name: 'Furniture Catalogue',
    description: 'An elegant 4-page template designed specifically for furniture brands and home decor retailers to showcase their products with sophisticated layouts and professional craftsmanship presentation',
    category: 'product',
    isPremium: false,
    previewImage: '/templates/furniture-catalogue-preview.svg',
    component: FurnitureCatalogueTemplate,
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
    pageCount: 4,
    supportedFields: {
      products: ['name', 'description', 'price', 'images', 'sku', 'tags', 'currency', 'priceDisplay', 'dimensions', 'materials', 'finishes'],
      categories: ['name', 'description', 'color'],
      profile: ['companyName', 'logo', 'email', 'phone', 'website', 'address', 'description', 'tagline', 'socialLinks']
    }
  }
  // Future templates can be added here:
  // {
  //   id: 'classic-brochure',
  //   name: 'Classic Brochure',
  //   description: 'Traditional tri-fold brochure style catalog',
  //   category: 'classic',
  //   isPremium: true,
  //   previewImage: '/templates/classic-brochure-preview.jpg',
  //   component: ClassicBrochureTemplate,
  //   features: ['Tri-fold layout', 'Classic typography', 'Professional design'],
  //   pageCount: 3,
  //   supportedFields: { ... }
  // }
]

// Helper function to get template by ID
export function getTemplateById(templateId: string): TemplateConfig | undefined {
  return CATALOG_TEMPLATES.find(template => template.id === templateId)
}

// Helper function to get template component
export function getTemplateComponent(templateId: string): React.ComponentType<CatalogTemplateProps> | undefined {
  const template = getTemplateById(templateId)
  return template?.component
}

// Helper function to get templates by category
export function getTemplatesByCategory(category: TemplateConfig['category']): TemplateConfig[] {
  return CATALOG_TEMPLATES.filter(template => template.category === category)
}

// Helper function to get free templates
export function getFreeTemplates(): TemplateConfig[] {
  return CATALOG_TEMPLATES.filter(template => !template.isPremium)
}

// Helper function to get premium templates
export function getPremiumTemplates(): TemplateConfig[] {
  return CATALOG_TEMPLATES.filter(template => template.isPremium)
}

// Registry integration functions
export function initializeTemplateRegistry(): TemplateRegistry {
  const registry = TemplateRegistry.getInstance()
  return registry
}

export function getRegistryTemplateById(templateId: string): RegistryTemplateConfig | null {
  const registry = TemplateRegistry.getInstance()
  return registry.getTemplate(templateId) || null
}

export function getAllRegistryTemplates(): RegistryTemplateConfig[] {
  const registry = TemplateRegistry.getInstance()
  return registry.getAllTemplates()
}

export function validateTemplateCompatibility(templateId: string, themeId: string): boolean {
  const registry = TemplateRegistry.getInstance()
  return registry.isTemplateThemeCompatible(templateId, themeId)
}

// Content standardization helpers
export function createStandardizedContent(
  catalogue: Catalogue & {
    products: (Product & { category: Category | null })[]
    categories: Category[]
  },
  profile: Profile
): StandardizedContent {
  return ContentMapper.mapToStandardized({
    ...catalogue,
    products: catalogue.products.map(product => ({
      ...product,
      price: product.price || null,
      priceDisplay: product.priceDisplay || '',
      createdAt: product.createdAt || new Date(),
      updatedAt: product.updatedAt || new Date(),
      catalogueId: product.catalogueId || catalogue.id,
      imageUrl: product.imageUrl || product.images?.[0] || null,
      category: product.category ? {
        ...product.category,
        createdAt: new Date(),
        updatedAt: new Date(),
        catalogueId: catalogue.id
      } : null
    })),
    categories: catalogue.categories.map(category => ({
      ...category,
      createdAt: category.createdAt || new Date(),
      updatedAt: category.updatedAt || new Date(),
      catalogueId: category.catalogueId || catalogue.id
    }))
  }, profile)
}

export function validateContentStructure(content: StandardizedContent): boolean {
  try {
    ContentMapper.validate(content)
    return true
  } catch {
    return false
  }
}

export { SkincareCatalogueTemplate, FashionCatalogueTemplate, FmcgCatalogueTemplate, FurnitureCatalogueTemplate }