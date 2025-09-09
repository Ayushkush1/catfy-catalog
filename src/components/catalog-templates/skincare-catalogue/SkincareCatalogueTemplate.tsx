'use client'

import { Catalogue, Category, Product, Profile } from '@prisma/client'
import { CoverPage } from './components/CoverPage'
import { BrandPromisePage } from './components/BrandPromisePage'
import { DailyRoutinePage } from './components/DailyRoutinePage'
import { ContactPage } from './components/ContactPage'
import { ColorCustomization } from './types/ColorCustomization'
import { ContentMapper } from '@/lib/content-schema'
import { TemplateComponentProps } from '@/lib/template-registry'
import { useEffect, useMemo } from 'react'

interface SkincareCatalogueTemplateProps {
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
  customColors?: ColorCustomization
  fontCustomization?: any
  spacingCustomization?: any
  advancedStyles?: any
  smartSortEnabled?: boolean
  themeId?: string
}

const DEFAULT_COLORS: ColorCustomization = {
  textColors: {
    companyName: '#1f2937',
    title: '#1f2937',
    description: '#6b7280',
    productName: '#1f2937',
    productDescription: '#6b7280',
    productPrice: '#059669',
    categoryName: '#1f2937'
  },
  backgroundColors: {
    main: '#ffffff',
    cover: '#f9fafb',
    productCard: '#ffffff',
    categorySection: '#f3f4f6'
  }
}

export function SkincareCatalogueTemplate({
  catalogue,
  profile,
  themeColors,
  isEditMode,
  catalogueId,
  onProductsReorder,
  onCatalogueUpdate,
  onProductUpdate,
  customColors = DEFAULT_COLORS,
  fontCustomization,
  spacingCustomization,
  advancedStyles,
  smartSortEnabled = false,
  themeId
}: SkincareCatalogueTemplateProps) {
  // Convert raw data to standardized format
  const standardizedContent = useMemo(() => {
    return ContentMapper.mapToStandardized({
      ...catalogue,
      products: catalogue.products,
      categories: catalogue.categories
    }, profile)
  }, [catalogue, profile])

  // Register template and theme if provided
  useEffect(() => {
    // Templates are now registered statically, no loading needed
  }, [])

  // Validate content structure
  useEffect(() => {
    try {
      // This will throw if content doesn't match schema
      ContentMapper.validate(standardizedContent)
    } catch (error) {
      console.warn('Content validation warning:', error)
    }
  }, [standardizedContent])

  return (
    <div className="bg-white catalog-template skincare-catalogue">
      {/* Page 1: Cover Page */}
      <div className="min-h-screen flex items-center justify-center page-break">
        <CoverPage
          catalogue={catalogue}
          profile={profile}
          themeColors={themeColors}
          customColors={customColors}
          fontCustomization={fontCustomization}
          spacingCustomization={spacingCustomization}
          advancedStyles={advancedStyles}
        />
      </div>

      {/* Page 2: Brand Promise Page */}
      <div className="min-h-screen flex items-center justify-center page-break">
        <BrandPromisePage
          catalogue={catalogue}
          profile={profile}
          themeColors={themeColors}
          customColors={customColors}
          fontCustomization={fontCustomization}
          spacingCustomization={spacingCustomization}
          advancedStyles={advancedStyles}
        />
      </div>

      {/* Page 3: Daily Routine Page */}
      <div className="min-h-screen flex items-center justify-center page-break">
        <DailyRoutinePage
          catalogue={catalogue}
          profile={profile}
          themeColors={themeColors}
          customColors={customColors}
          fontCustomization={fontCustomization}
          spacingCustomization={spacingCustomization}
          advancedStyles={advancedStyles}
        />
      </div>

      {/* Page 4: Contact Page */}
      <div className="min-h-screen flex items-center justify-center page-break">
        <ContactPage
          catalogue={catalogue}
          profile={profile}
          themeColors={themeColors}
          customColors={customColors}
          fontCustomization={fontCustomization}
        />
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          
          .page-break:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}

// Wrapper component that implements TemplateComponentProps interface
export function SkincareCatalogueTemplateWrapper({ content, theme, isEditMode, onContentUpdate, customProps }: TemplateComponentProps) {
  // Convert standardized content to SkincareCatalogueTemplate props
  const catalogue = {
    id: content.catalogue?.id || '',
    name: content.catalogue?.name || '',
    description: content.catalogue?.description || null,
    quote: content.catalogue?.quote || null,
    tagline: content.catalogue?.tagline || null,
    year: content.catalogue?.year || null,
    introImage: (content.catalogue as any)?.introImage || null,
    theme: content.catalogue?.theme || 'skincare',
    isPublic: content.catalogue?.isPublic || false,
    slug: null,
    status: 'DRAFT' as const,
    settings: content.catalogue?.settings || null,
    createdAt: content.catalogue?.createdAt || new Date(),
    updatedAt: content.catalogue?.updatedAt || new Date(),
    profileId: content.catalogue?.profileId || '',
    publishedAt: null,
    customDomain: null,
    exportCount: 0,
    seoDescription: null,
    seoTitle: null,
    viewCount: 0,
    products: (content.products || []).map(product => ({
      ...product,
      price: product.price || null,
      priceDisplay: product.priceDisplay || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      catalogueId: content.catalogue?.id || '',
      imageUrl: product.images?.[0] || null,
      category: product.category ? {
        ...product.category,
        createdAt: new Date(),
        updatedAt: new Date(),
        catalogueId: content.catalogue?.id || ''
      } : null
    })),
    categories: (content.categories || []).map(category => ({
      ...category,
      createdAt: new Date(),
      updatedAt: new Date(),
      catalogueId: content.catalogue?.id || ''
    }))
  }

  const profile = {
    id: content.profile?.id || '',
    email: content.profile?.email || '',
    fullName: content.profile?.fullName || null,
    firstName: null,
    lastName: null,
    avatarUrl: null,
    accountType: 'INDIVIDUAL' as const,
    companyName: content.profile?.companyName || null,
    phone: content.profile?.phone || null,
    website: content.profile?.website || null,
    address: content.profile?.address || null,
    city: content.profile?.city || null,
    state: content.profile?.state || null,
    country: content.profile?.country || null,
    postalCode: null,
    tagline: (content.profile as any)?.tagline || null,
    logo: (content.profile as any)?.logo || null,
    socialLinks: (content.profile as any)?.socialLinks || null,
    stripeCustomerId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const themeColors = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent
  }

  return (
    <SkincareCatalogueTemplate
      catalogue={catalogue}
      profile={profile}
      themeColors={themeColors}
      isEditMode={isEditMode}
      {...customProps}
    />
  )
}

export default SkincareCatalogueTemplateWrapper