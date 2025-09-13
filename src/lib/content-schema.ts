import { Catalogue, Product, Category, Profile } from '@prisma/client'
import { z } from 'zod'

// Unified content schema for all templates
export const ContentSchema = z.object({
  catalogue: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    quote: z.string().optional(),
    tagline: z.string().optional(),
    year: z.string().optional(),
    isPublic: z.boolean(),
    theme: z.string().optional(),
    settings: z.any().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    profileId: z.string()
  }),
  profile: z.object({
    id: z.string(),
    email: z.string(),
    fullName: z.string().nullable(),
    companyName: z.string().nullable(),
    phone: z.string().nullable(),
    website: z.string().nullable(),
    address: z.string().nullable(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    country: z.string().nullable(),
    logo: z.string().nullable(),
    tagline: z.string().nullable(),
    socialLinks: z.record(z.string()).nullable()
  }),
  products: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.any().nullable(), // Decimal type
    currency: z.string().default('INR'),
    priceDisplay: z.string().nullable(),
    sku: z.string().nullable(),
    tags: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
    sortOrder: z.number().default(0),
    isActive: z.boolean().default(true),
    categoryId: z.string().nullable(),
    category: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      color: z.string().nullable(),
      sortOrder: z.number().default(0)
    }).nullable()
  })),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    color: z.string().nullable(),
    sortOrder: z.number().default(0)
  }))
})

export type StandardizedContent = z.infer<typeof ContentSchema>
export type StandardizedCatalogue = StandardizedContent // Alias for backward compatibility

// Content mapper utility to transform raw data to standardized format
export class ContentMapper {
  static mapToStandardized(
    catalogue: Catalogue & {
      products: (Product & { category: Category | null })[]
      categories: Category[]
    },
    profile: Profile
  ): StandardizedContent {
    return {
      catalogue: {
        id: catalogue.id,
        name: catalogue.name,
        description: catalogue.description || undefined,
        quote: catalogue.quote || undefined,
        tagline: catalogue.tagline || undefined,
        year: catalogue.year || undefined,
        isPublic: catalogue.isPublic,
        theme: catalogue.theme || undefined,
        settings: catalogue.settings,
        createdAt: catalogue.createdAt,
        updatedAt: catalogue.updatedAt,
        profileId: catalogue.profileId
      },
      profile: {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        companyName: profile.companyName,
        phone: profile.phone,
        website: profile.website,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        logo: profile.logo || null,
        tagline: profile.tagline || null,
        socialLinks: (profile.socialLinks as Record<string, string>) || null
      },
      products: catalogue.products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency || 'INR',
        priceDisplay: product.priceDisplay,
        sku: product.sku,
        tags: Array.isArray(product.tags) ? product.tags as string[] : [],
        images: Array.isArray(product.images) ? product.images as string[] : [],
        sortOrder: product.sortOrder || 0,
        isActive: product.isActive,
        categoryId: product.categoryId,
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
          description: product.category.description,
          color: product.category.color,
          sortOrder: product.category.sortOrder || 0
        } : null
      })),
      categories: catalogue.categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color,
        sortOrder: category.sortOrder || 0
      }))
    }
  }

  static validate(content: unknown): StandardizedContent {
    return ContentSchema.parse(content)
  }

  static isValid(content: unknown): boolean {
    try {
      ContentSchema.parse(content)
      return true
    } catch {
      return false
    }
  }
}

// Helper functions for content manipulation
export const ContentHelpers = {
  // Get products by category
  getProductsByCategory(content: StandardizedContent, categoryId: string) {
    return content.products.filter(product => product.categoryId === categoryId)
  },

  // Get featured products (based on tags)
  getFeaturedProducts(content: StandardizedContent) {
    return content.products.filter(product =>
      product.tags.some(tag =>
        ['featured', 'bestseller', 'trending', 'new'].includes(tag.toLowerCase())
      )
    )
  },

  // Sort products by priority tags
  sortProductsByPriority(products: StandardizedContent['products']) {
    const priorityOrder = ['bestseller', 'featured', 'trending', 'new', 'seasonal']

    return products.sort((a, b) => {
      const aPriority = Math.min(...a.tags.map(tag =>
        priorityOrder.indexOf(tag.toLowerCase())
      ).filter(index => index !== -1))

      const bPriority = Math.min(...b.tags.map(tag =>
        priorityOrder.indexOf(tag.toLowerCase())
      ).filter(index => index !== -1))

      if (aPriority === Infinity && bPriority === Infinity) {
        return a.sortOrder - b.sortOrder
      }
      if (aPriority === Infinity) return 1
      if (bPriority === Infinity) return -1

      return aPriority - bPriority
    })
  },

  // Format price with currency
  formatPrice(price: any, currency: string = 'INR'): string {
    if (!price) return 'Price on request'

    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price)

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(numPrice)
  },

  // Get company display name
  getCompanyDisplayName(profile: StandardizedContent['profile']): string {
    return profile.companyName || profile.fullName || 'Company Name'
  },

  // Get contact information
  getContactInfo(profile: StandardizedContent['profile']) {
    return {
      name: this.getCompanyDisplayName(profile),
      email: profile.email,
      phone: profile.phone,
      website: profile.website,
      address: [profile.address, profile.city, profile.state, profile.country]
        .filter(Boolean)
        .join(', ') || null
    }
  }
}