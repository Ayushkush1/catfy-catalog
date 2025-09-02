import React from 'react'
import { Catalogue, Profile } from '@prisma/client'
import Image from 'next/image'
import { ColorCustomization } from '../types/ColorCustomization'
import { FontCustomization, SpacingCustomization, AdvancedStyleCustomization } from '@/components/shared/StyleCustomizer'

interface CatalogCoverProps {
  catalogue: Catalogue
  profile: Profile
  themeColors: {
    primary: string
    secondary: string
    accent: string
  }
  customColors?: ColorCustomization
  isEditMode?: boolean
  onCatalogueUpdate?: (catalogueId: string, updates: Partial<Catalogue>) => void
  fontCustomization?: FontCustomization
  spacingCustomization?: SpacingCustomization
  advancedStyles?: AdvancedStyleCustomization
}

export function CatalogCover({ 
  catalogue, 
  profile, 
  themeColors, 
  customColors, 
  fontCustomization, 
  spacingCustomization, 
  advancedStyles, 
  isEditMode = false, 
  onCatalogueUpdate 
}: CatalogCoverProps) {
  // Removed inline editing functionality - content is now managed centrally in StyleCustomizer
  const currentYear = new Date().getFullYear()
  
  return (
    <div 
      className="w-full max-w-4xl mx-auto relative"
      style={{ backgroundColor: customColors?.backgroundColors.cover }}
    >
      {/* Cover Image Background */}
      {(catalogue.settings as any)?.mediaAssets?.coverImageUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <Image 
            src={(catalogue.settings as any).mediaAssets.coverImageUrl}
            alt="Cover Image"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
      )}
      
      {/* Background Design Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: customColors?.textColors.title || '#3b82f6' }}
        />
        <div 
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5"
          style={{ backgroundColor: customColors?.textColors.title || '#3b82f6' }}
        />
      </div>

      {/* Main Content */}
      <div 
        className="relative z-10 text-center"
        style={{
          padding: `${spacingCustomization?.padding?.section || 32}px`,
          gap: `${spacingCustomization?.gap?.content || 32}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Company Logo/Brand */}
        <div 
          style={{
            marginBottom: `${spacingCustomization?.margin?.elements || 48}px`
          }}
        >
          {(catalogue.settings as any)?.mediaAssets?.logoUrl || profile.avatarUrl ? (
            <div className="w-24 h-24 mx-auto mb-6 rounded-lg overflow-hidden shadow-lg">
              <Image 
                src={(catalogue.settings as any)?.mediaAssets?.logoUrl || profile.avatarUrl} 
                alt={(catalogue.settings as any)?.companyInfo?.companyName || profile.companyName || 'Company Logo'}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div 
              className="w-24 h-24 mx-auto mb-6 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              style={{ backgroundColor: customColors?.textColors.title || '#3b82f6' }}
            >
              {((catalogue.settings as any)?.companyInfo?.companyName || profile.companyName || profile.fullName || 'C').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Catalog Title */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${spacingCustomization?.gap?.content || 16}px`,
            alignItems: 'center'
          }}
        >
          <h1 
            className="text-6xl font-bold tracking-tight"
            style={{ 
              color: customColors?.textColors.title || '#3b82f6',
              fontFamily: fontCustomization?.fontFamily?.title || 'Inter, sans-serif',
              fontWeight: fontCustomization?.fontWeight?.title || '700'
            }}
          >
            CATALOG
          </h1>
          {/* Catalog Name */}
          <h2 
            className="uppercase tracking-wider"
            style={{ 
              color: customColors?.textColors.title || '#1f2937',
              fontFamily: fontCustomization?.fontFamily?.title || 'Inter, sans-serif',
              fontSize: `${fontCustomization?.fontSize?.title || 24}px`,
              fontWeight: fontCustomization?.fontWeight?.title || '600'
            }}
          >
            {catalogue.name}
          </h2>
          
          {/* Catalog Description */}
          <p 
            className="max-w-2xl mx-auto leading-relaxed"
            style={{ 
              color: customColors?.textColors.description || '#6b7280',
              fontFamily: fontCustomization?.fontFamily?.description || 'Inter, sans-serif',
              fontSize: `${fontCustomization?.fontSize?.description || 16}px`,
              fontWeight: fontCustomization?.fontWeight?.description || '400'
            }}
          >
            {catalogue.description || 'Modern • Unique • Products'}
          </p>
        </div>

        {/* Year */}
        <div className="pt-8">
          <div 
            className="text-4xl font-bold"
            style={{ 
              color: customColors?.textColors.title || '#3b82f6',
              fontFamily: fontCustomization?.fontFamily?.title || 'Inter, sans-serif',
              fontWeight: fontCustomization?.fontWeight?.title || '700'
            }}
          >
            {currentYear}
          </div>
        </div>

        {/* Company Information */}
        <div className="pt-12 space-y-2">
          <p 
            className="font-medium"
            style={{ 
              color: customColors?.textColors.companyName || '#374151',
              fontFamily: fontCustomization?.fontFamily?.companyName || 'Inter, sans-serif',
              fontSize: `${fontCustomization?.fontSize?.companyName || 20}px`,
              fontWeight: fontCustomization?.fontWeight?.companyName || '600'
            }}
          >
            by {(catalogue.settings as any)?.companyInfo?.companyName || profile.companyName || profile.fullName || 'Your Company'}
          </p>
          {(catalogue.settings as any)?.companyInfo?.companyDescription && (
            <p 
              className="text-sm"
              style={{ 
                color: customColors?.textColors.description || '#6b7280',
                fontFamily: fontCustomization?.fontFamily?.description || 'Inter, sans-serif',
                fontWeight: fontCustomization?.fontWeight?.description || '400'
              }}
            >
              {(catalogue.settings as any)?.companyInfo?.companyDescription}
            </p>
          )}
          {profile.website && (
            <p 
              className="text-gray-600"
              style={{ 
                color: customColors?.textColors.description || '#6b7280',
                fontFamily: fontCustomization?.fontFamily?.description || 'Inter, sans-serif',
                fontWeight: fontCustomization?.fontWeight?.description || '400'
              }}
            >
              {profile.website.replace(/^https?:\/\//, '')}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Design Element */}
      <div className="absolute bottom-0 left-0 right-0 h-2" style={{ backgroundColor: customColors?.textColors.title || '#3b82f6' }} />
    </div>
  )
}

export default CatalogCover