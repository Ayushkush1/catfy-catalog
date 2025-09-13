'use client'
import { useState } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Phone, Globe, ExternalLink, Facebook, Twitter, Instagram, Linkedin, MapPin, Monitor, Smartphone } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getTemplateComponent, getTemplateById } from '@/components/catalog-templates'
import { DEFAULT_FONT_CUSTOMIZATION, DEFAULT_SPACING_CUSTOMIZATION, DEFAULT_ADVANCED_STYLES } from '@/components/shared/StyleCustomizer'
import { ViewportToggle, getViewportStyles, type ViewportMode } from '@/components/preview/ViewportToggle'

interface PreviewPageProps {
  params: {
    id: string
  }
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = params

  // Fetch catalogue data server-side
  const catalogue = await prisma.catalogue.findFirst({
    where: {
      id,
      // Allow both public catalogues and any catalogue for PDF generation
    },
    include: {
      products: {
        include: {
          category: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      categories: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
      profile: {
        select: {
          id: true,
          fullName: true,
          companyName: true,
          phone: true,
          email: true,
          website: true,
          address: true,
          city: true,
          state: true,
          country: true,
          postalCode: true,
        },
      },
    },
  })

  if (!catalogue) {
    notFound()
  }

  // Pass the catalogue data to the client component
  return <PreviewPageClient catalogue={catalogue} />
}

// Client component that handles the responsive toggle
function PreviewPageClient({ catalogue }: { catalogue: any }) {
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop')

  const settings = catalogue.settings as any || {}
  const templateId = settings.templateId || 'modern-4page' // Default to modern template

  // Get the template component
  const TemplateComponent = getTemplateComponent(templateId)
  const templateConfig = getTemplateById(templateId)

  // Get viewport styles
  const viewportStyles = getViewportStyles(viewportMode)

  // If template is found, use it; otherwise fall back to legacy rendering
  if (TemplateComponent && templateConfig) {
    const themeColors = {
      primary: getThemeColors(catalogue.theme || 'modern').primary,
      secondary: getThemeColors(catalogue.theme || 'modern').secondary,
      accent: '#f1f5f9'
    }

    // Transform profile data to match expected structure
    const profileData = {
      id: catalogue.profile?.id || catalogue.profileId || '',
      email: catalogue.profile?.email || '',
      fullName: catalogue.profile?.fullName || null,
      firstName: null,
      lastName: null,
      avatarUrl: null,
      accountType: 'INDIVIDUAL' as const,
      companyName: catalogue.profile?.companyName || null,
      phone: catalogue.profile?.phone || null,
      website: catalogue.profile?.website || null,
      address: catalogue.profile?.address || null,
      city: catalogue.profile?.city || null,
      state: catalogue.profile?.state || null,
      country: catalogue.profile?.country || null,
      postalCode: catalogue.profile?.postalCode || null,
      logo: null, // Remove logo property
      tagline: null, // Remove tagline property
      socialLinks: null, // Remove socialLinks property
      stripeCustomerId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return (
      <>
        {/* Viewport Toggle */}
        <ViewportToggle
          currentMode={viewportMode}
          onModeChange={setViewportMode}
          className="print:hidden"
        />

        {/* Responsive Container */}
        <div style={viewportStyles.wrapper}>
          <div
            data-pdf-ready="true"
            className="preview-container print:bg-white"
            style={{
              ...viewportStyles.container,
              '--theme-primary': themeColors.primary,
              '--theme-secondary': themeColors.secondary,
              '--theme-accent': themeColors.accent,
              minHeight: viewportMode === 'desktop' ? '800px' : 'auto',
              boxShadow: viewportMode !== 'desktop' ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : 'none',
              borderRadius: viewportMode !== 'desktop' ? '12px' : '0',
              overflow: 'hidden',
              background: 'white'
            } as React.CSSProperties}
          >
            <TemplateComponent
              catalogue={catalogue}
              profile={profileData}
              themeColors={themeColors}
              fontCustomization={settings.fontCustomization || DEFAULT_FONT_CUSTOMIZATION}
              spacingCustomization={settings.spacingCustomization || DEFAULT_SPACING_CUSTOMIZATION}
              advancedStyles={settings.advancedStyles || DEFAULT_ADVANCED_STYLES}
            />
          </div>
        </div>

        {/* Global styles for responsive preview */}
        <style jsx global>{`
          @media print {
            .preview-container {
              transform: none !important;
              width: auto !important;
              max-width: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              margin: 0 !important;
            }
          }
          
          body {
            overflow-x: ${viewportMode !== 'desktop' ? 'hidden' : 'auto'};
          }
          
          /* Mobile-specific styles */
          ${viewportMode === 'mobile' ? `
            .preview-container .grid {
              grid-template-columns: 1fr !important;
            }
            .preview-container .md\\:grid-cols-2 {
              grid-template-columns: 1fr !important;
            }
            .preview-container .lg\\:grid-cols-3 {
              grid-template-columns: 1fr !important;
            }
            .preview-container .xl\\:grid-cols-4 {
              grid-template-columns: 1fr !important;
            }
            .preview-container .text-4xl {
              font-size: 2rem !important;
            }
            .preview-container .text-3xl {
              font-size: 1.875rem !important;
            }
            .preview-container .text-2xl {
              font-size: 1.5rem !important;
            }
            .preview-container .p-8 {
              padding: 1rem !important;
            }
            .preview-container .p-6 {
              padding: 0.75rem !important;
            }
            .preview-container .py-8 {
              padding-top: 1rem !important;
              padding-bottom: 1rem !important;
            }
            .preview-container .mb-8 {
              margin-bottom: 1rem !important;
            }
            .preview-container .gap-6 {
              gap: 0.75rem !important;
            }
          ` : ''}
          
          /* Tablet-specific styles */
          ${viewportMode === 'tablet' ? `
            .preview-container .xl\\:grid-cols-4 {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .preview-container .lg\\:grid-cols-3 {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .preview-container .text-4xl {
              font-size: 2.25rem !important;
            }
            .preview-container .p-8 {
              padding: 1.5rem !important;
            }
          ` : ''}
        `}</style>
      </>
    )
  }

  // Legacy rendering for backward compatibility
  const themeColors = getThemeColors(catalogue.theme || 'modern')

  return (
    <>
      {/* Viewport Toggle */}
      <ViewportToggle
        currentMode={viewportMode}
        onModeChange={setViewportMode}
        className="print:hidden"
      />

      {/* Responsive Container */}
      <div style={viewportStyles.wrapper}>
        <div
          className={`preview-container ${getThemeClasses(catalogue.theme)} print:bg-white`}
          data-pdf-ready="true"
          style={{
            ...viewportStyles.container,
            minHeight: viewportMode === 'desktop' ? '800px' : 'auto',
            boxShadow: viewportMode !== 'desktop' ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : 'none',
            borderRadius: viewportMode !== 'desktop' ? '12px' : '0',
            overflow: 'hidden',
            background: 'white'
          }}
        >
          {/* Catalogue Content */}
          <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {catalogue.name}
              </h1>

              {catalogue.description && (
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                  {catalogue.description}
                </p>
              )}

              <div className="text-sm text-gray-500">
                by {catalogue.profile?.companyName || catalogue.profile?.fullName || 'Unknown'}
              </div>
            </div>

            {/* Company Info */}
            {(settings.companyInfo?.companyName || settings.companyInfo?.companyDescription) && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {settings.companyInfo?.companyName && (
                    <h4 className="text-lg font-medium mb-2">{settings.companyInfo.companyName}</h4>
                  )}
                  {settings.companyInfo?.companyDescription && (
                    <p className="text-gray-600">{settings.companyInfo.companyDescription}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Media & Assets */}
            {(settings.mediaAssets?.logoUrl || settings.mediaAssets?.coverImageUrl) && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Media & Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settings.mediaAssets?.logoUrl && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Logo</h4>
                        <Image
                          src={settings.mediaAssets.logoUrl}
                          alt="Company Logo"
                          width={100}
                          height={100}
                          className="rounded border"
                        />
                      </div>
                    )}
                    {settings.mediaAssets?.coverImageUrl && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Cover Image</h4>
                        <Image
                          src={settings.mediaAssets.coverImageUrl}
                          alt="Cover Image"
                          width={200}
                          height={100}
                          className="rounded border"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Details */}
            {(settings.contactDetails?.email ||
              settings.contactDetails?.phone ||
              settings.contactDetails?.website ||
              settings.contactDetails?.address ||
              catalogue.profile?.address) && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Contact Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {settings.contactDetails?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a
                          href={`mailto:${settings.contactDetails.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {settings.contactDetails.email}
                        </a>
                      </div>
                    )}

                    {settings.contactDetails?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a
                          href={`tel:${settings.contactDetails.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {settings.contactDetails.phone}
                        </a>
                      </div>
                    )}

                    {settings.contactDetails?.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <a
                          href={settings.contactDetails.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Visit Website
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {/* Address */}
                    {(settings.contactDetails?.address || catalogue.profile?.address) && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          {(settings.contactDetails?.address || catalogue.profile?.address) && (
                            <div>{settings.contactDetails?.address || catalogue.profile?.address}</div>
                          )}
                          <div>
                            {[
                              settings.contactDetails?.city || catalogue.profile?.city,
                              settings.contactDetails?.state || catalogue.profile?.state,
                              settings.contactDetails?.country || catalogue.profile?.country
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                          {settings.contactDetails?.postalCode && (
                            <div>{settings.contactDetails.postalCode}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

            {/* Social Media */}
            {(settings.socialMedia?.facebook ||
              settings.socialMedia?.twitter ||
              settings.socialMedia?.instagram ||
              settings.socialMedia?.linkedin) && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Social Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      {settings.socialMedia?.facebook && (
                        <a
                          href={settings.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Facebook className="h-6 w-6" />
                        </a>
                      )}

                      {settings.socialMedia?.twitter && (
                        <a
                          href={settings.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-600 transition-colors"
                        >
                          <Twitter className="h-6 w-6" />
                        </a>
                      )}

                      {settings.socialMedia?.instagram && (
                        <a
                          href={settings.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-800 transition-colors"
                        >
                          <Instagram className="h-6 w-6" />
                        </a>
                      )}

                      {settings.socialMedia?.linkedin && (
                        <a
                          href={settings.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-900 transition-colors"
                        >
                          <Linkedin className="h-6 w-6" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Products */}
            {catalogue.products && catalogue.products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {catalogue.products.map((product: any) => (
                  <Card key={product.id}>
                    {product.imageUrl && (
                      <div className="aspect-square">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      {product.description && (
                        <CardDescription className="line-clamp-2">
                          {product.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent>
                      {product.price && (
                        <div className="text-lg font-semibold text-primary">
                          ${product.price.toString()}
                        </div>
                      )}

                      {product.category && (
                        <Badge variant="secondary" className="mt-2">
                          {product.category.name}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <div className="h-12 w-12 mx-auto bg-gray-200 rounded" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No products yet
                  </h3>
                  <p className="text-gray-600">
                    Products will appear here once they are added
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Global styles for responsive preview */}
        <style jsx global>{`
        @media print {
          .preview-container {
            transform: none !important;
            width: auto !important;
            max-width: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
          }
        }
        
        body {
          overflow-x: ${viewportMode !== 'desktop' ? 'hidden' : 'auto'};
        }
        
        /* Mobile-specific styles */
        ${viewportMode === 'mobile' ? `
          .preview-container .grid {
            grid-template-columns: 1fr !important;
          }
          .preview-container .md\\:grid-cols-2 {
            grid-template-columns: 1fr !important;
          }
          .preview-container .lg\\:grid-cols-3 {
            grid-template-columns: 1fr !important;
          }
          .preview-container .xl\\:grid-cols-4 {
            grid-template-columns: 1fr !important;
          }
          .preview-container .text-4xl {
            font-size: 2rem !important;
          }
          .preview-container .text-3xl {
            font-size: 1.875rem !important;
          }
          .preview-container .text-2xl {
            font-size: 1.5rem !important;
          }
          .preview-container .p-8 {
            padding: 1rem !important;
          }
          .preview-container .p-6 {
            padding: 0.75rem !important;
          }
          .preview-container .py-8 {
            padding-top: 1rem !important;
            padding-bottom: 1rem !important;
          }
          .preview-container .mb-8 {
            margin-bottom: 1rem !important;
          }
          .preview-container .gap-6 {
            gap: 0.75rem !important;
          }
        ` : ''}
        
        /* Tablet-specific styles */
        ${viewportMode === 'tablet' ? `
          .preview-container .xl\\:grid-cols-4 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .preview-container .lg\\:grid-cols-3 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .preview-container .text-4xl {
            font-size: 2.25rem !important;
          }
          .preview-container .p-8 {
            padding: 1.5rem !important;
          }
        ` : ''}
      `}</style>
      </div>
    </>
  )
}

// Theme color configurations
function getThemeColors(theme: string) {
  const themes: Record<string, { primary: string; secondary: string; fontFamily: string }> = {
    modern: { primary: '#3b82f6', secondary: '#64748b', fontFamily: 'Inter, sans-serif' },
    classic: { primary: '#1f2937', secondary: '#6b7280', fontFamily: 'Georgia, serif' },
    minimal: { primary: '#000000', secondary: '#666666', fontFamily: 'Helvetica, sans-serif' },
    bold: { primary: '#dc2626', secondary: '#991b1b', fontFamily: 'Arial, sans-serif' },
    elegant: { primary: '#7c3aed', secondary: '#a855f7', fontFamily: 'Times, serif' },
    tech: { primary: '#06b6d4', secondary: '#0891b2', fontFamily: 'Roboto, sans-serif' },
    nature: { primary: '#059669', secondary: '#047857', fontFamily: 'Inter, sans-serif' },
    warm: { primary: '#ea580c', secondary: '#c2410c', fontFamily: 'Inter, sans-serif' },
  }

  return themes[theme] || themes.modern
}

function getThemeClasses(theme: string) {
  const themeClasses: Record<string, string> = {
    modern: 'bg-white text-gray-900',
    classic: 'bg-gray-50 text-gray-900',
    minimal: 'bg-white text-black',
    bold: 'bg-white text-gray-900',
    elegant: 'bg-purple-50 text-gray-900',
    tech: 'bg-cyan-50 text-gray-900',
    nature: 'bg-green-50 text-gray-900',
    warm: 'bg-orange-50 text-gray-900',
  }

  return themeClasses[theme] || themeClasses.modern
}