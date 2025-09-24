'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Copy, 
  FileImage, 
  FileText,
  Check
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { exportToPdf, exportToHtml } from '@/lib/export-utils'

// Dynamic imports for GrapesJS templates
const ModernGrapesJSTemplate = dynamic(
  () => import('@/components/catalog-templates/modern-grapesjs/ModernGrapesJSTemplate').then(mod => ({ default: mod.ModernGrapesJSTemplate })),
  { ssr: false }
)

const GrapesJSTemplate = dynamic(
  () => import('@/components/catalog-templates/grapesjs-template/GrapesJSTemplate'),
  { ssr: false }
)

interface Catalogue {
  id: string
  name: string
  description: string
  templateId: string
  quote?: string
  tagline?: string
  isPublic: boolean
  theme: string
  createdAt: string
  updatedAt: string
  profile: Profile
  products: Product[]
  categories: Category[]
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: {
    id: string
    name: string
    color: string
  }
}

interface Category {
  id: string
  name: string
  description: string
  color: string
  _count: {
    products: number
  }
}

interface Profile {
  id: string
  fullName: string
  companyName: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  logo: string
  tagline: string
  socialLinks?: any
}

export default function PreviewPage() {
  const params = useParams()
  const router = useRouter()
  const catalogueId = params.id as string

  const [isEditMode, setIsEditMode] = useState(false)
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    if (catalogueId) {
      loadCatalogue()
    }
  }, [catalogueId])

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/preview/${catalogueId}`
      if (navigator.share) {
        await navigator.share({
          title: catalogue?.name || 'Product Catalogue',
          text: catalogue?.description || 'Check out this product catalogue',
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        setLinkCopied(true)
        toast.success('Link copied to clipboard!')
        setTimeout(() => setLinkCopied(false), 2000)
      }
    } catch (error) {
      console.error('Error sharing:', error)
      toast.error('Failed to share catalogue')
    }
  }

  const handleExport = async (format: 'pdf' | 'html' | 'image') => {
     if (!catalogue) return
     
     try {
       setIsExporting(true)
       
       // Get the template container content
       const templateElement = document.querySelector('[data-template-container]')
       if (!templateElement) {
         throw new Error('Template content not found')
       }
       
       const templateHtml = templateElement.innerHTML
       const templateCss = Array.from(document.styleSheets)
         .map(sheet => {
           try {
             return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n')
           } catch (e) {
             return ''
           }
         })
         .join('\n')
       
       if (format === 'pdf') {
         exportToPdf(templateHtml, templateCss, '', {
           filename: `${catalogue.name}-catalogue.pdf`,
           applyContent: true,
           content: prepareStandardizedContent(catalogue)
         })
         toast.success('PDF export initiated! Check your browser\'s print dialog.')
       } else if (format === 'html') {
         exportToHtml(templateHtml, templateCss, '', {
           filename: `${catalogue.name}-catalogue.html`,
           applyContent: true,
           content: prepareStandardizedContent(catalogue)
         })
         toast.success('HTML file downloaded successfully!')
       } else if (format === 'image') {
         // For PNG export, we'll use the browser's built-in screenshot capability
         // This is a simplified approach - for production, consider using html2canvas
         try {
           if ('getDisplayMedia' in navigator.mediaDevices) {
             toast.info('Please select the browser tab to capture when prompted.')
             const stream = await navigator.mediaDevices.getDisplayMedia({ 
               video: { mediaSource: 'screen' } 
             })
             stream.getTracks().forEach(track => track.stop())
             toast.success('Use your browser\'s screenshot tool to capture the preview!')
           } else {
             toast.info('PNG export: Use your browser\'s screenshot feature to capture this page.')
           }
         } catch (error) {
           toast.info('PNG export: Use your browser\'s screenshot feature to capture this page.')
         }
       }
     } catch (error) {
       console.error('Export error:', error)
       toast.error(`Failed to export as ${format.toUpperCase()}`)
     } finally {
       setIsExporting(false)
     }
   }

  const loadCatalogue = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load catalogue data with all related data using public preview API
      const response = await fetch(`/api/catalogues/${catalogueId}/preview`)
      if (!response.ok) {
        throw new Error('Failed to load catalogue')
      }
      const data = await response.json()
      // The API returns { catalogue: {...} }, so we extract the catalogue object
      setCatalogue(data.catalogue || data)

    } catch (err) {
      console.error('Error loading catalogue:', err)
      setError(err instanceof Error ? err.message : 'Failed to load catalogue')
    } finally {
      setLoading(false)
    }
  }

  // Map legacy template IDs to current template IDs
  const mapLegacyTemplateId = (templateId: string): string => {
    const legacyMapping: Record<string, string> = {
      'grapes-template': 'grapesjs-template',
      'grapes-js': 'grapesjs-template',
      'modern-grapes': 'modern-grapesjs',
      'grapesjs': 'grapesjs-template'
    }
    return legacyMapping[templateId] || templateId
  }

  // Check if template is GrapesJS-based
  const isGrapesJSTemplate = (catalogueData: any) => {
    const rawTemplateId = catalogueData?.settings?.templateId || catalogueData?.templateId || 'grapesjs-template'
    const templateId = mapLegacyTemplateId(rawTemplateId)
    return templateId === 'modern-grapesjs' || templateId === 'grapesjs-template'
  }

  // Prepare standardized content for GrapesJS templates
  const prepareStandardizedContent = (catalogueData: any) => {
    // The API returns data in format: { catalogue: { ...catalogueInfo, products: [...], categories: [...] } }
    const catalogue = catalogueData.catalogue || catalogueData
    
    return {
      catalogue: {
        id: catalogue.id,
        name: catalogue.name,
        description: catalogue.description,
        quote: catalogue.quote || '',
        tagline: catalogue.tagline || '',
      },
      products: (catalogue.products || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
      })),
      categories: (catalogue.categories || []).map((category: any) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color,
      })),
      profile: {
        id: catalogue.profile?.id || '',
        companyName: catalogue.profile?.companyName || '',
        fullName: catalogue.profile?.fullName || '',
        email: catalogue.profile?.email || '',
        phone: catalogue.profile?.phone || '',
        website: catalogue.profile?.website || '',
        address: catalogue.profile?.address || '',
        city: catalogue.profile?.city || '',
        country: catalogue.profile?.country || '',
      },
    }
  }

  // Sample theme configuration
  const sampleTheme = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#FFFFFF',
    text: '#1F2937',
    muted: '#6B7280',
  }

  const renderTemplate = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-500">Loading catalogue...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
          <p className="text-red-500">Error: {error}</p>
        </div>
      )
    }

    if (!catalogue) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-500">Catalogue not found</p>
        </div>
      )
    }

    try {
      const standardizedContent = prepareStandardizedContent(catalogue)
      if (!standardizedContent) {
        return (
          <div className="flex items-center justify-center h-64 bg-yellow-50 rounded-lg">
            <p className="text-yellow-600">Unable to prepare catalogue content</p>
          </div>
        )
      }

      // Get templateId from settings or fallback to default
      const rawTemplateId = catalogue.settings?.templateId || catalogue.templateId || 'grapesjs-template'
      const templateId = mapLegacyTemplateId(rawTemplateId)

      if (templateId === 'modern-grapesjs') {
        return (
          <ErrorBoundary>
            <ModernGrapesJSTemplate
              content={standardizedContent}
              theme={sampleTheme}
              isEditMode={isEditMode}
              onSave={(data) => {
                console.log('Template saved:', data)
              }}
            />
          </ErrorBoundary>
        )
      } else if (templateId === 'grapesjs-template') {
        return (
          <ErrorBoundary>
            <GrapesJSTemplate
              content={standardizedContent}
              theme={sampleTheme}
              isEditMode={isEditMode}
              onSave={(data) => {
                console.log('Template saved:', data)
              }}
            />
          </ErrorBoundary>
        )
      }

      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-500">Template "{templateId}" not supported for preview</p>
        </div>
      )
    } catch (err) {
      console.error('Error rendering template:', err)
      return (
        <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
          <p className="text-red-500">Error rendering template: {err instanceof Error ? err.message : 'Unknown error'}</p>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!catalogue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Catalogue Not Found</h1>
          <p className="text-gray-600">The requested catalogue could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              {/* Back to Edit Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/catalogue/${catalogueId}/edit`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Edit
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{catalogue.name}</h1>
                {catalogue.description && (
                  <p className="text-gray-600 mt-1">{catalogue.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Share Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                {linkCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                {linkCopied ? 'Copied!' : 'Share'}
              </Button>

              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isExporting}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('image')}>
                    <FileImage className="h-4 w-4 mr-2" />
                    Export as PNG
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport('html')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as HTML
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Edit Mode Toggle (if applicable) */}
              {isGrapesJSTemplate(catalogue.templateId) && (
                <Button
                  onClick={() => setIsEditMode(!isEditMode)}
                  size="sm"
                  className={isEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                >
                  {isEditMode ? 'View Preview' : 'Edit Template'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='' data-template-container>
        {renderTemplate()}
      </div>
    </div>
  )
}