'use client'

import { getTemplateById, getTemplateComponent } from '@/components/catalog-templates'
import StyleCustomizer, { AdvancedStyleCustomization, DEFAULT_ADVANCED_STYLES, DEFAULT_FONT_CUSTOMIZATION, DEFAULT_SPACING_CUSTOMIZATION, FontCustomization, SpacingCustomization } from '@/components/shared/StyleCustomizer'
import { ColorCustomization } from '@/components/catalog-templates/modern-4page/types/ColorCustomization'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { Catalogue as PrismaCatalogue, Category as PrismaCategory, Product as PrismaProduct } from '@prisma/client'
import { AlertTriangle, ArrowLeft, Download, Edit, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type Catalogue = PrismaCatalogue & {
  categories: PrismaCategory[]
  products: (PrismaProduct & { category: PrismaCategory | null })[]
  profile?: {
    fullName: string
    companyName: string | null
    phone: string | null
    email: string | null
    website: string | null
    address: string | null
    city: string | null
    state: string | null
    country: string | null
    postalCode: string | null
    logo: string | null
    tagline: string | null
    socialLinks: any | null
  }
}

type Category = PrismaCategory
type Product = PrismaProduct & { category: PrismaCategory | null }

export default function CataloguePreviewPage() {
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showStyleCustomizer, setShowStyleCustomizer] = useState(false)
  const [customColors, setCustomColors] = useState<ColorCustomization>({
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
  })
  const [fontCustomization, setFontCustomization] = useState<FontCustomization | null>(null)
  const [spacingCustomization, setSpacingCustomization] = useState<SpacingCustomization>(DEFAULT_SPACING_CUSTOMIZATION)
  const [advancedStyles, setAdvancedStyles] = useState<AdvancedStyleCustomization>(DEFAULT_ADVANCED_STYLES)
  const [smartSortEnabled, setSmartSortEnabled] = useState(true)

  const params = useParams()
  const catalogueId = params.id as string
  const { canExport } = useSubscription()

  const shareCatalogue = async () => {
    if (!catalogue) return

    if (!catalogue.isPublic) {
      toast.error('Only public catalogues can be shared')
      return
    }

    const shareUrl = `${window.location.origin}/preview/${catalogue.id}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied to clipboard!')
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Share link copied to clipboard!')
    }
  }

  const exportToPDF = async () => {
    if (!catalogue) return

    if (!canExport()) {
      toast.error('You have reached your export limit. Please upgrade your plan to export more catalogues.')
      return
    }

    try {
      toast.loading('Generating PDF...', { id: 'pdf-export' })

      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          catalogueId: catalogue.id,
          theme: 'modern',
          format: 'A4',
          orientation: 'portrait'
        }),
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type')

        if (contentType && contentType.includes('application/pdf')) {
          // Direct PDF download for public catalogues
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `catalogue-${catalogue.id}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          toast.success('PDF exported successfully!', { id: 'pdf-export' })
        } else {
          // JSON response with download URL for authenticated users
          const data = await response.json()
          if (data.export?.downloadUrl) {
            // Open download URL in new tab
            window.open(data.export.downloadUrl, '_blank')
            toast.success('PDF exported successfully!', { id: 'pdf-export' })
          } else {
            throw new Error('No download URL received')
          }
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to export PDF')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export PDF', { id: 'pdf-export' })
    }
  }

  const loadCatalogue = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/catalogues/${catalogueId}`)

      if (response.ok) {
        const data = await response.json()
        setCatalogue(data.catalogue)
      } else if (response.status === 404) {
        setError('Catalogue not found')
      } else {
        setError('Failed to load catalogue')
      }
    } catch (err) {
      setError('Failed to load catalogue')
      console.error('Load error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProductsReorder = async (updatedProducts: (PrismaProduct & { category: PrismaCategory | null })[]) => {
    if (!catalogueId) return

    try {
      const response = await fetch(`/api/catalogues/${catalogueId}/products/sort`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productUpdates: updatedProducts.map((product, index) => ({
            id: product.id,
            sortOrder: index
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder products')
      }

      // Update local state
      setCatalogue(prev => {
        if (!prev) return prev
        return {
          ...prev,
          products: updatedProducts
        }
      })
    } catch (error) {
      console.error('Error reordering products:', error)
    }
  }

  const handleCatalogueUpdate = async (catalogueId: string, updates: Partial<PrismaCatalogue>) => {
    try {
      console.log('🔄 handleCatalogueUpdate called with:', { catalogueId, updates })
      const response = await fetch(`/api/catalogues/${catalogueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      console.log('📡 API Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error:', errorText)
        throw new Error(`Failed to update catalogue: ${response.status} ${errorText}`)
      }

      const responseData = await response.json()
      console.log('✅ Catalogue updated successfully:', responseData)

      // Extract the catalogue data from the response
      const updatedCatalogue = responseData.catalogue || responseData

      // Update the catalogue state with the new data
      setCatalogue(prev => {
        if (!prev) return null
        const newCatalogue = {
          ...prev,
          ...updatedCatalogue,
          // Ensure settings are properly merged
          settings: {
            ...(prev.settings as object || {}),
            ...(updatedCatalogue.settings as object || {})
          }
        }

        // Also update the fontCustomization state if it's in the response
        const newSettings = newCatalogue.settings as any
        if (newSettings?.fontCustomization) {
          console.log('🔄 Updating fontCustomization state from API response:', newSettings.fontCustomization)
          setFontCustomization(newSettings.fontCustomization)
        }

        return newCatalogue
      })
    } catch (error) {
      console.error('💥 Error updating catalogue:', error)
    }
  }

  const handleContentChange = async (field: string, value: string) => {
    if (!catalogue?.id) return

    try {
      // Handle nested field paths
      const updates: any = {}

      if (field.startsWith('catalogue.')) {
        const fieldName = field.replace('catalogue.', '')
        updates[fieldName] = value
      } else if (field.startsWith('profile.')) {
        const fieldName = field.replace('profile.', '')
        updates.profile = {
          ...catalogue.profile,
          [fieldName]: value
        }
      } else if (field.startsWith('categories.')) {
        const match = field.match(/categories\.(\d+)\.(.+)/)
        if (match && catalogue.categories) {
          const categoryIndex = parseInt(match[1])
          const fieldName = match[2]
          const updatedCategories = [...catalogue.categories]
          if (updatedCategories[categoryIndex]) {
            updatedCategories[categoryIndex] = {
              ...updatedCategories[categoryIndex],
              [fieldName]: value
            }
            updates.categories = updatedCategories
          }
        }
      } else if (field.startsWith('newCollection.')) {
        const fieldName = field.replace('newCollection.', '')
        const currentSettings = catalogue.settings as any || {}
        updates.settings = {
          ...currentSettings,
          newCollection: {
            ...currentSettings.newCollection,
            [fieldName]: value
          }
        }
      } else {
        updates[field] = value
      }

      await handleCatalogueUpdate(catalogue.id, updates)
    } catch (error) {
      console.error('Error updating catalogue content:', error)
    }
  }

  const handleProductUpdate = async (productId: string, updates: Partial<PrismaProduct>) => {
    try {
      const response = await fetch(`/api/catalogues/${catalogueId}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update product')
      }

      const responseData = await response.json()
      console.log('Successfully updated product:', responseData)

      // Extract the product data from the response
      const updatedProduct = responseData.product || responseData

      setCatalogue(prev => {
        if (!prev) return prev
        return {
          ...prev,
          products: prev.products.map(product =>
            product.id === productId ? { ...product, ...updatedProduct } : product
          )
        }
      })
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  // New category management handlers
  const handleCategoryUpdate = async (categoryId: string, updates: any) => {
    try {
      const response = await fetch(`/api/catalogues/${catalogueId}/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update category')
      }

      const responseData = await response.json()
      console.log('Successfully updated category:', responseData)

      const updatedCategory = responseData.category || responseData

      setCatalogue(prev => {
        if (!prev) return prev
        return {
          ...prev,
          categories: prev.categories.map(category =>
            category.id === categoryId ? { ...category, ...updatedCategory } : category
          )
        }
      })
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  }

  const handleCategoryCreate = async (categoryData: any) => {
    try {
      const response = await fetch(`/api/catalogues/${catalogueId}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })

      if (!response.ok) {
        throw new Error('Failed to create category')
      }

      const responseData = await response.json()
      console.log('Successfully created category:', responseData)

      const newCategory = responseData.category || responseData

      setCatalogue(prev => {
        if (!prev) return prev
        return {
          ...prev,
          categories: [...prev.categories, newCategory]
        }
      })
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }

  const handleCategoryDelete = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/catalogues/${catalogueId}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      console.log('Successfully deleted category:', categoryId)

      setCatalogue(prev => {
        if (!prev) return prev
        return {
          ...prev,
          categories: prev.categories.filter(category => category.id !== categoryId),
          // Also remove category association from products
          products: prev.products.map(product =>
            product.categoryId === categoryId
              ? { ...product, categoryId: null, category: null }
              : product
          )
        }
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }

  const handleProductImageUpdate = async (productId: string, imageUrl: string) => {
    try {
      await handleProductUpdate(productId, { imageUrl })
      toast.success('Product image updated successfully')
    } catch (error) {
      console.error('Error updating product image:', error)
      toast.error('Failed to update product image')
      throw error
    }
  }

  const handleBulkContentUpdate = async (updates: any) => {
    try {
      if (!catalogue?.id) return

      await handleCatalogueUpdate(catalogue.id, updates)
      toast.success('Content updated successfully')
    } catch (error) {
      console.error('Error updating content:', error)
      toast.error('Failed to update content')
      throw error
    }
  }

  const handleColorChange = async (type: string, colors: any) => {
    console.log('🎨 handleColorChange called with type:', type, 'colors:', colors)

    // Convert to the template's ColorCustomization format
    const updatedColors = { ...customColors }
    if (type === 'textColors') {
      updatedColors.textColors = { ...updatedColors.textColors, ...colors }
    } else if (type === 'backgroundColors') {
      updatedColors.backgroundColors = { ...updatedColors.backgroundColors, ...colors }
    }

    setCustomColors(updatedColors)

    // Save to database
    if (catalogue?.id) {
      console.log('💾 Saving color changes to database...')
      await handleCatalogueUpdate(catalogue.id, {
        settings: {
          ...(catalogue.settings as object || {}),
          customColors: updatedColors
        } as any
      })
      console.log('✅ Color changes saved successfully')
    } else {
      console.log('❌ No catalogue ID available for saving')
    }
  }

  const handleColorReset = () => {
    setCustomColors({
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
    })
  }

  const handleFontChange = async (path: string, value: any) => {
    console.log('🔤 handleFontChange called with path:', path, 'value:', value)
    const newFontCustomization = { ...(fontCustomization || DEFAULT_FONT_CUSTOMIZATION) }
    const pathParts = path.split('.')
    let current: any = newFontCustomization
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]]
    }
    current[pathParts[pathParts.length - 1]] = value
    setFontCustomization(newFontCustomization)

    // Save to database
    if (catalogue?.id) {
      console.log('💾 Saving font changes to database...')
      await handleCatalogueUpdate(catalogue.id, {
        settings: {
          ...(catalogue.settings as object || {}),
          fontCustomization: newFontCustomization
        } as any
      })
      console.log('✅ Font changes saved successfully')
    } else {
      console.log('❌ No catalogue ID available for saving')
    }
  }

  const handleSpacingChange = async (path: string, value: number) => {
    const newSpacingCustomization = { ...(spacingCustomization || DEFAULT_SPACING_CUSTOMIZATION) }
    const pathParts = path.split('.')
    let current: any = newSpacingCustomization
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]]
    }
    current[pathParts[pathParts.length - 1]] = value
    setSpacingCustomization(newSpacingCustomization)

    // Save to database
    if (catalogue?.id) {
      await handleCatalogueUpdate(catalogue.id, {
        settings: {
          ...(catalogue.settings as object || {}),
          spacingCustomization: newSpacingCustomization
        } as any
      })
    }
  }

  const handleAdvancedStylesChange = async (path: string, value: any) => {
    const newAdvancedStyles = { ...(advancedStyles || DEFAULT_ADVANCED_STYLES) }
    const pathParts = path.split('.')
    let current: any = newAdvancedStyles
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]]
    }
    current[pathParts[pathParts.length - 1]] = value
    setAdvancedStyles(newAdvancedStyles)

    // Save to database
    if (catalogue?.id) {
      await handleCatalogueUpdate(catalogue.id, {
        settings: {
          ...(catalogue.settings as object || {}),
          advancedStyles: newAdvancedStyles
        } as any
      })
    }
  }

  useEffect(() => {
    if (catalogueId) {
      loadCatalogue()
    }
  }, [catalogueId])

  // Initialize customizations from catalogue settings when catalogue is loaded
  // This runs on initial page load to restore saved customizations
  useEffect(() => {
    console.log('🔄 useEffect triggered for catalogue settings initialization')
    if (catalogue?.settings) {
      const settings = catalogue.settings as any
      console.log('📋 Catalogue settings found:', settings)

      // Initialize custom colors from saved settings
      if (settings.customColors) {
        console.log('🎨 Initializing custom colors:', settings.customColors)
        setCustomColors(settings.customColors)
      }

      // Initialize font customization from saved settings or defaults
      if (settings.fontCustomization) {
        console.log('🔤 Initializing font customization from saved settings:', settings.fontCustomization)
        setFontCustomization(settings.fontCustomization)
      } else {
        console.log('🔤 No saved fontCustomization found, using defaults:', DEFAULT_FONT_CUSTOMIZATION)
        setFontCustomization(DEFAULT_FONT_CUSTOMIZATION)
      }

      // Initialize spacing customization from saved settings
      if (settings.spacingCustomization) {
        console.log('📏 Initializing spacing customization:', settings.spacingCustomization)
        setSpacingCustomization(settings.spacingCustomization)
      }

      // Initialize advanced styles from saved settings
      if (settings.advancedStyles) {
        console.log('✨ Initializing advanced styles:', settings.advancedStyles)
        setAdvancedStyles(settings.advancedStyles)
      }
    } else {
      console.log('❌ No catalogue settings found, using defaults')
      // Set defaults when no settings exist
      setFontCustomization(DEFAULT_FONT_CUSTOMIZATION)
    }
  }, [catalogue]) // Depend on the full catalogue object to ensure it runs when data is loaded



  // Reload catalogue data when the page becomes visible (e.g., when navigating back)
  // but preserve edit mode state - DISABLED to prevent customization resets
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (!document.hidden && catalogueId && !isEditMode) {
  //       loadCatalogue()
  //     }
  //   }

  //   document.addEventListener('visibilitychange', handleVisibilityChange)
  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange)
  //   }
  // }, [catalogueId, isEditMode])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Enhanced Loading Header */}
        <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-lg print:hidden">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <div className="border-l border-gray-300 pl-6">
                  <Skeleton className="h-6 w-48 mb-2 rounded-lg" />
                  <Skeleton className="h-4 w-32 rounded-lg" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-24 rounded-xl" />
                <Skeleton className="h-9 w-20 rounded-xl" />
                <Skeleton className="h-9 w-16 rounded-xl" />
                <Skeleton className="h-9 w-28 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
        {/* Enhanced Loading Content */}
        <div className="container mx-auto py-12 px-6">
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <Skeleton className="h-40 w-full rounded-xl mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 rounded-xl" />
                    <Skeleton className="h-6 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-full rounded-lg" />
                    <Skeleton className="h-4 w-2/3 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !catalogue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <AlertTriangle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1A1B41] mb-4 tracking-tight">
            {error || 'Catalogue not found'}
          </h1>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md mx-auto">
            The catalogue you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-[#301F70] to-[#1A1B41] hover:from-[#1A1B41] hover:to-[#301F70] text-white px-8 py-3 rounded-xl shadow-lg transition-all duration-300"
          >
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  const settings = catalogue.settings as any || {}
  const templateId = settings.templateId || 'modern-4page' // Default to modern template

  // Get the template component
  const TemplateComponent = getTemplateComponent(templateId)
  const templateConfig = getTemplateById(templateId)

  // Get theme colors
  const themeColors = {
    primary: getThemeColors(catalogue.theme || 'modern').primary,
    secondary: getThemeColors(catalogue.theme || 'modern').secondary,
    accent: '#f1f5f9'
  }

  // Transform profile data to match expected structure
  const profileData = {
    id: catalogue.profileId || '',
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
    logo: catalogue.profile?.logo || null,
    tagline: catalogue.profile?.tagline || null,
    socialLinks: catalogue.profile?.socialLinks || null,
    stripeCustomerId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Enhanced Admin Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-lg print:hidden sticky top-0 z-40">
        <div className=" mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hover:bg-gradient-to-r hover:from-[#779CAB]/10 hover:to-[#A2E8DD]/10 transition-all duration-300"
              >
                <Link href={`/catalogue/${catalogue.id}/edit`}>
                  <ArrowLeft className="h-4 w-4 mr-2 text-[#1A1B41]" />
                  <span className="text-[#1A1B41] font-medium">Back to Edit</span>
                </Link>
              </Button>
              <div className="border-l border-gray-300 pl-6">
                <h1 className="font-bold text-xl text-[#1A1B41] tracking-tight">{catalogue.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#779CAB] to-[#A2E8DD] animate-pulse"></div>
                  <p className="text-sm text-gray-600 font-medium">Live Preview Mode</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                className={`relative transition-all duration-300 ${isEditMode
                  ? 'bg-gradient-to-r from-[#301F70] to-[#1A1B41] hover:from-[#1A1B41] hover:to-[#301F70] text-white shadow-lg'
                  : 'border-[#301F70]/30 text-[#301F70] hover:bg-gradient-to-r hover:from-[#301F70]/5 hover:to-[#1A1B41]/5'
                  }`}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
                {isEditMode && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full blur-sm opacity-70"></div>
                    </div>
                  </div>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={shareCatalogue}
                className="border-[#779CAB]/30 text-[#1A1B41] hover:bg-gradient-to-r hover:from-[#779CAB]/10 hover:to-[#A2E8DD]/10 hover:border-[#779CAB]/50 transition-all duration-300"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                disabled={!canExport()}
                className="border-[#779CAB]/30 text-[#1A1B41] hover:bg-gradient-to-r hover:from-[#779CAB]/10 hover:to-[#A2E8DD]/10 hover:border-[#779CAB]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content Area with Sidebar */}
      <div className="flex bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-[calc(100vh-81px)] relative">
        {/* Template Content - Enhanced PDF Export Size Preview */}
        <div className={`flex justify-center pt-2 transition-all duration-500 ease-in-out overflow-x-hidden overflow-y-auto h-[calc(100vh-81px)] ${isEditMode ? 'w-[calc(100vw-320px)]' : 'w-full'
          }`}>
          <div className="overflow-x-hidden">
            <div
              className={`bg-white shadow-2xl transition-all duration-300 relative group overflow-hidden ${isEditMode ? 'ring-4 ring-[#301F70]/20 shadow-[#301F70]/20' : 'shadow-gray-300/50'
                }`}
              style={{
                '--theme-primary': themeColors.primary,
                '--theme-secondary': themeColors.secondary,
                '--theme-accent': themeColors.accent,
                // Fixed viewport dimensions
                width: '1200px',
                minHeight: '800px',
                maxWidth: '1200px',
                transform: 'scale(1)',
                transformOrigin: 'top center',
                margin: '0 auto',
                boxShadow: isEditMode
                  ? '0 25px 60px rgba(48, 31, 112, 0.15), 0 0 0 1px rgba(48, 31, 112, 0.1)'
                  : '0 20px 60px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              } as React.CSSProperties}
            >
              {TemplateComponent && templateConfig ? (
                <TemplateComponent
                  key={`${JSON.stringify(customColors)}-${JSON.stringify(fontCustomization)}-${JSON.stringify(spacingCustomization)}-${JSON.stringify(advancedStyles)}-${smartSortEnabled}`}
                  catalogue={{
                    ...catalogue,
                    status: 'PUBLISHED',
                    slug: null,
                    viewCount: 0,
                    exportCount: 0,
                    shareCount: 0,
                    lastViewedAt: null,
                    lastExportedAt: null,
                    lastSharedAt: null,
                    settings: catalogue?.settings || {},
                    categories: catalogue?.categories || [],
                    products: catalogue?.products || [],
                    profile: catalogue?.profile || null
                  } as any}
                  profile={profileData}
                  themeColors={themeColors}
                  isEditMode={isEditMode}
                  catalogueId={catalogueId}
                  onProductsReorder={handleProductsReorder}
                  onCatalogueUpdate={handleCatalogueUpdate}
                  onProductUpdate={handleProductUpdate}
                  onContentChange={handleContentChange}
                  customColors={customColors}
                  fontCustomization={fontCustomization || DEFAULT_FONT_CUSTOMIZATION}
                  spacingCustomization={spacingCustomization}
                  advancedStyles={advancedStyles}
                  smartSortEnabled={smartSortEnabled}
                />
              ) : (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#779CAB] to-[#A2E8DD] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1A1B41] mb-2">Template Not Found</h2>
                    <p className="text-gray-600">The selected template could not be loaded.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Right Sidebar - StyleCustomizer */}
        {isEditMode && (
          <div className="w-[320px] bg-white/95 backdrop-blur-xl shadow-2xl border-gray-200/60 overflow-y-auto h-[calc(100vh-80px)] fixed right-0 top-[85px] z-50">


            <div className="">
              <StyleCustomizer
                fontCustomization={fontCustomization || DEFAULT_FONT_CUSTOMIZATION}
                spacingCustomization={spacingCustomization || DEFAULT_SPACING_CUSTOMIZATION}
                advancedStyleCustomization={advancedStyles || DEFAULT_ADVANCED_STYLES}
                customColors={{
                  primary: '#3b82f6',
                  secondary: '#64748b',
                  accent: '#f59e0b',
                  background: customColors?.backgroundColors?.main || '#ffffff',
                  surface: customColors?.backgroundColors?.productCard || '#f8fafc',
                  textColors: {
                    primary: customColors?.textColors?.title || '#1f2937',
                    secondary: customColors?.textColors?.description || '#6b7280',
                    accent: '#3b82f6',
                    price: customColors?.textColors?.productPrice || '#059669',
                    productDescription: customColors?.textColors?.productDescription || '#6b7280',
                    companyName: customColors?.textColors?.companyName || '#1f2937',
                    title: customColors?.textColors?.title || '#1f2937',
                    description: customColors?.textColors?.description || '#6b7280',
                  }
                }}
                content={catalogue}
                onFontChange={handleFontChange}
                onSpacingChange={handleSpacingChange}
                onAdvancedStyleChange={handleAdvancedStylesChange}
                onColorChange={handleColorChange}
                onContentChange={handleContentChange}
                onProductUpdate={handleProductUpdate}
                onCategoryUpdate={handleCategoryUpdate}
                onCategoryCreate={handleCategoryCreate}
                onCategoryDelete={handleCategoryDelete}
                onProductImageUpdate={handleProductImageUpdate}
                onBulkContentUpdate={handleBulkContentUpdate}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function getThemeColors(theme: string) {
  switch (theme) {
    case 'modern':
      return { primary: '#3b82f6', secondary: '#1e40af' }
    case 'classic':
      return { primary: '#f59e0b', secondary: '#d97706' }
    case 'minimal':
      return { primary: '#6b7280', secondary: '#4b5563' }
    case 'bold':
      return { primary: '#8b5cf6', secondary: '#7c3aed' }
    case 'elegant':
      return { primary: '#64748b', secondary: '#475569' }
    case 'tech':
      return { primary: '#06b6d4', secondary: '#0891b2' }
    default:
      return { primary: '#3b82f6', secondary: '#1e40af' }
  }
}