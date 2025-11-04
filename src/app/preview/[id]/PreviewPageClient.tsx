'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import {
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    Globe,
    ExternalLink,
    MapPin,
    Facebook,
} from 'lucide-react'
import {
    ViewportToggle,
    ViewportMode,
    getViewportStyles,
} from '@/components/preview/ViewportToggle'
import { getTemplateComponent, getTemplateById } from '@/templates'

// Client component that handles the responsive toggle
export function PreviewPageClient({ catalogue }: { catalogue: any }) {
    const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop')

    const settings = (catalogue.settings as any) || {}
    const templateId = settings.templateId || 'modern-4page' // Default to modern template

    // Get the template component
    const TemplateComponent = getTemplateComponent(templateId)
    const templateConfig = getTemplateById(templateId)

    // Get viewport styles
    const viewportStyles = getViewportStyles(viewportMode)

    // Registry template components are not currently used - using legacy rendering only

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
            <div style={viewportStyles.wrapper} className="print:m-0 print:p-0">
                <div
                    className={`preview-container ${getThemeClasses(catalogue.theme)} print:h-auto print:w-full print:bg-white`}
                    data-pdf-ready="true"
                    style={{
                        ...viewportStyles.container,
                        boxShadow:
                            '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                    }}
                >
                    {/* Catalogue Content */}
                    <div className="px-8 py-8">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h1 className="mb-4 text-4xl font-bold text-gray-900">
                                {catalogue.name}
                            </h1>

                            {catalogue.description && (
                                <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-600">
                                    {catalogue.description}
                                </p>
                            )}

                            <div className="text-sm text-gray-500">
                                by{' '}
                                {catalogue.profile?.companyName ||
                                    catalogue.profile?.fullName ||
                                    'Unknown'}
                            </div>
                        </div>

                        {/* Company Info */}
                        {(settings.companyInfo?.companyName ||
                            settings.companyInfo?.companyDescription) && (
                                <Card className="mb-8">
                                    <CardHeader>
                                        <CardTitle>Company Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {settings.companyInfo?.companyName && (
                                            <h4 className="mb-2 text-lg font-medium">
                                                {settings.companyInfo.companyName}
                                            </h4>
                                        )}
                                        {settings.companyInfo?.companyDescription && (
                                            <p className="text-gray-600">
                                                {settings.companyInfo.companyDescription}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                        {/* Media & Assets */}
                        {(settings.mediaAssets?.logoUrl ||
                            settings.mediaAssets?.coverImageUrl) && (
                                <Card className="mb-8">
                                    <CardHeader>
                                        <CardTitle>Media & Assets</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {settings.mediaAssets?.logoUrl && (
                                                <div>
                                                    <h4 className="mb-2 text-sm font-medium">Logo</h4>
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
                                                    <h4 className="mb-2 text-sm font-medium">
                                                        Cover Image
                                                    </h4>
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
                                                    className="flex items-center gap-1 text-blue-600 hover:underline"
                                                >
                                                    Visit Website
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                        )}

                                        {/* Address */}
                                        {(settings.contactDetails?.address ||
                                            catalogue.profile?.address) && (
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="mt-0.5 h-4 w-4 text-gray-500" />
                                                    <div>
                                                        {(settings.contactDetails?.address ||
                                                            catalogue.profile?.address) && (
                                                                <div>
                                                                    {settings.contactDetails?.address ||
                                                                        catalogue.profile?.address}
                                                                </div>
                                                            )}
                                                        <div>
                                                            {[
                                                                settings.contactDetails?.city ||
                                                                catalogue.profile?.city,
                                                                settings.contactDetails?.state ||
                                                                catalogue.profile?.state,
                                                                settings.contactDetails?.country ||
                                                                catalogue.profile?.country,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(', ')}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                    </CardContent>
                                </Card>
                            )}

                        {/* Social Media Links */}
                        {(settings.socialMedia?.facebook ||
                            settings.socialMedia?.twitter ||
                            settings.socialMedia?.instagram ||
                            settings.socialMedia?.linkedin) && (
                                <Card className="mb-8">
                                    <CardHeader>
                                        <CardTitle>Follow Us</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-4">
                                            {settings.socialMedia?.facebook && (
                                                <a
                                                    href={settings.socialMedia.facebook}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                                >
                                                    <Facebook className="h-4 w-4" />
                                                    Facebook
                                                </a>
                                            )}
                                            {settings.socialMedia?.twitter && (
                                                <a
                                                    href={settings.socialMedia.twitter}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                                >
                                                    <Twitter className="h-4 w-4" />
                                                    Twitter
                                                </a>
                                            )}
                                            {settings.socialMedia?.instagram && (
                                                <a
                                                    href={settings.socialMedia.instagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                                >
                                                    <Instagram className="h-4 w-4" />
                                                    Instagram
                                                </a>
                                            )}
                                            {settings.socialMedia?.linkedin && (
                                                <a
                                                    href={settings.socialMedia.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                                >
                                                    <Linkedin className="h-4 w-4" />
                                                    LinkedIn
                                                </a>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                        {/* Categories & Products */}
                        <div className="space-y-8">
                            {catalogue.categories
                                .filter((category: any) =>
                                    catalogue.products.some(
                                        (product: any) => product.categoryId === category.id
                                    )
                                )
                                .map((category: any) => {
                                    const categoryProducts = catalogue.products.filter(
                                        (product: any) => product.categoryId === category.id
                                    )

                                    return (
                                        <Card key={category.id} className="page-break-inside-avoid">
                                            <CardHeader>
                                                <CardTitle className="text-2xl font-bold text-gray-900">
                                                    {category.name}
                                                </CardTitle>
                                                {category.description && (
                                                    <p className="text-gray-600">
                                                        {category.description}
                                                    </p>
                                                )}
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                                    {categoryProducts.map((product: any) => (
                                                        <div
                                                            key={product.id}
                                                            className="rounded-lg border bg-white p-4 shadow-sm"
                                                        >
                                                            {product.imageUrl && (
                                                                <div className="mb-3">
                                                                    <Image
                                                                        src={product.imageUrl}
                                                                        alt={product.name}
                                                                        width={250}
                                                                        height={200}
                                                                        className="h-48 w-full rounded object-cover"
                                                                    />
                                                                </div>
                                                            )}
                                                            <h4 className="mb-2 font-semibold text-gray-900">
                                                                {product.name}
                                                            </h4>
                                                            {product.description && (
                                                                <p className="mb-2 text-sm text-gray-600">
                                                                    {product.description}
                                                                </p>
                                                            )}
                                                            {product.price && (
                                                                <p
                                                                    className="text-lg font-bold"
                                                                    style={{ color: themeColors.primary }}
                                                                >
                                                                    {product.priceDisplay || `$${product.price}`}
                                                                </p>
                                                            )}
                                                            {product.sku && (
                                                                <p className="text-xs text-gray-400">
                                                                    SKU: {product.sku}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function getThemeColors(theme: string) {
    const themes: Record<string, any> = {
        modern: {
            primary: '#3b82f6',
            secondary: '#1e40af',
            fontFamily: 'Inter, sans-serif',
        },
        classic: {
            primary: '#1f2937',
            secondary: '#374151',
            fontFamily: 'Georgia, serif',
        },
        minimal: {
            primary: '#000000',
            secondary: '#666666',
            fontFamily: 'Helvetica, sans-serif',
        },
        bold: {
            primary: '#dc2626',
            secondary: '#991b1b',
            fontFamily: 'Arial, sans-serif',
        },
        elegant: {
            primary: '#7c3aed',
            secondary: '#a855f7',
            fontFamily: 'Times, serif',
        },
        tech: {
            primary: '#06b6d4',
            secondary: '#0891b2',
            fontFamily: 'Roboto, sans-serif',
        },
        nature: {
            primary: '#059669',
            secondary: '#047857',
            fontFamily: 'Inter, sans-serif',
        },
        warm: {
            primary: '#ea580c',
            secondary: '#c2410c',
            fontFamily: 'Inter, sans-serif',
        },
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
