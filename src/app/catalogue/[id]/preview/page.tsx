'use client'

import IframeEditor from '@/components/editor/IframeEditor'
import {
  HtmlTemplates,
  getTemplateById as getHtmlTemplateById,
  PrebuiltTemplate,
} from '@/components/editor/iframe-templates'
import { getTemplateById as getRegistryTemplateById } from '@/templates'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Eye,
  Edit3,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Undo,
  Redo,
  Save,
  Share,
  Share2,
  Link as LinkIcon,
  Printer,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ProfileDropdown } from '@/components/editor/components/ProfileDropdown'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

// Helper function to get HTML template from registry or direct lookup
function getTemplate(templateId: string): PrebuiltTemplate | null {
  console.log('🔍 getTemplate called with:', templateId)

  // First try direct HTML template lookup
  const directTemplate = getHtmlTemplateById(templateId)
  console.log('🔍 Direct HTML template lookup:', {
    templateId,
    found: !!directTemplate,
    templateName: directTemplate?.name,
    availableTemplates: HtmlTemplates.map(t => ({ id: t.id, name: t.name })),
  })

  if (directTemplate) {
    return directTemplate
  }

  // Then try registry lookup and extract HTML template data
  const registryTemplate = getRegistryTemplateById(templateId)
  console.log('🔍 Registry template lookup:', {
    templateId,
    found: !!registryTemplate,
    isHtmlTemplate: !!registryTemplate?.customProperties?.isHtmlTemplate,
    hasHtmlTemplateData: !!registryTemplate?.customProperties?.htmlTemplateData,
  })

  if (registryTemplate?.customProperties?.isHtmlTemplate) {
    // Extract the HTML template data from the registry template
    return registryTemplate.customProperties
      .htmlTemplateData as PrebuiltTemplate
  }

  console.warn('❌ Template not found:', templateId)
  return null
}

export default function CataloguePreviewPage() {
  const [catalogue, setCatalogue] = useState<any | null>(null)
  const [liveData, setLiveData] = useState<Record<string, any> | null>(null)
  const [styleMutations, setStyleMutations] = useState<
    Record<string, Partial<CSSStyleDeclaration>>
  >({})
  const [templateId, setTemplateId] = useState<string>('default-html')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<
    'saved' | 'saving' | 'unsaved' | 'error'
  >('saved')
  const [isEditorReady, setIsEditorReady] = useState(false) // NEW: Prevent flash on initial load
  const [isExportingPDF, setIsExportingPDF] = useState(false) // Loading state for PDF export
  const iframeGetterRef = useRef<() => HTMLIFrameElement | null>(() => null)

  // Helper function to get public share URL
  const getPublicShareUrl = () => {
    if (typeof window === 'undefined' || !catalogue) return ''

    // If catalogue has a slug, use the public view URL
    if (catalogue.slug) {
      const baseUrl = window.location.origin
      return `${baseUrl}/view/${catalogue.slug}`
    }

    // Fallback to current URL
    return window.location.href
  }

  const editorControlsRef = useRef<{
    undo: () => void
    redo: () => void
    setZoom: (z: number) => void
    getZoom: () => number
    zoomIn?: () => void
    zoomOut?: () => void
    toggleGrid?: () => void
    setGrid?: (v: boolean) => void
    getGrid?: () => boolean
    hasUndo?: () => boolean
    hasRedo?: () => boolean
    print?: () => void
    exportHTML?: () => void
    exportJSON?: () => void
    exportPDF?: () => Promise<void>
    exportPNG?: () => Promise<void>
    saveToDatabase?: () => Promise<void>
    getSaveStatus?: () => 'saved' | 'saving' | 'unsaved' | 'error'
    getLastSaved?: () => Date | null
    isDirty?: () => boolean
    // Pages
    getPages?: () => any[]
    getCurrentPageIndex?: () => number
    setCurrentPageIndex?: (i: number) => void
    goPrev?: () => void
    goNext?: () => void
  } | null>(null)
  const [toolbarZoom, setToolbarZoom] = useState<number>(100)
  const [showResizeMenu, setShowResizeMenu] = useState(false)
  const [gridOn, setGridOn] = useState<boolean>(false)
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(true)
  const [shareOpen, setShareOpen] = useState<boolean>(false)
  const [pageIndex, setPageIndex] = useState<number>(0)
  const [pageCount, setPageCount] = useState<number>(1)
  const [canUndo, setCanUndo] = useState<boolean>(false)
  const [canRedo, setCanRedo] = useState<boolean>(false)

  // Keep navbar page index/count in sync with iframe editor
  useEffect(() => {
    const interval = setInterval(() => {
      const controls = editorControlsRef.current as any
      if (!controls) return
      const idx = controls.getCurrentPageIndex?.()
      if (typeof idx === 'number' && idx !== pageIndex) {
        setPageIndex(idx)
      }
      const pages = controls.getPages?.()
      if (Array.isArray(pages) && pages.length !== pageCount) {
        setPageCount(pages.length)
      }

      // Poll undo/redo state
      const hasUndo = controls.hasUndo?.() || false
      const hasRedo = controls.hasRedo?.() || false
      if (hasUndo !== canUndo) setCanUndo(hasUndo)
      if (hasRedo !== canRedo) setCanRedo(hasRedo)
    }, 250)
    return () => clearInterval(interval)
  }, [pageIndex, pageCount, canUndo, canRedo])

  // Poll save status from editor
  useEffect(() => {
    const interval = setInterval(() => {
      const status = editorControlsRef.current?.getSaveStatus?.()
      if (status && status !== saveStatus) {
        setSaveStatus(status)
      }
    }, 500) // Check every 500ms
    return () => clearInterval(interval)
  }, [saveStatus])

  const params = useParams()
  const catalogueId = params.id as string

  // Timeout fallback: if iframe doesn't load in 10 seconds, show it anyway
  useEffect(() => {
    console.log(
      '⏰ Preview: Starting 10-second timeout for editor ready fallback'
    )
    const timeout = setTimeout(() => {
      if (!isEditorReady) {
        console.warn(
          '⚠️ IframeEditor took too long to load (10s timeout), showing it anyway'
        )
        setIsEditorReady(true)
      } else {
        console.log('✅ Preview: Editor already ready before timeout')
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [isEditorReady])

  const loadCatalogue = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/catalogues/${catalogueId}`)

      if (response.ok) {
        const data = await response.json()
        setCatalogue(data.catalogue)
        // Prepare initial live data for iframe editor
        const initial = {
          catalogue: {
            id: data.catalogue.id,
            name: data.catalogue.name,
            year:
              data.catalogue.year ||
              (data.catalogue.settings &&
                data.catalogue.settings.displaySettings &&
                data.catalogue.settings.displaySettings.defaultYear) ||
              undefined,
            nameUpper: data.catalogue.name
              ? String(data.catalogue.name).toUpperCase()
              : undefined,
            // Tagline (template-level) — prefer catalogue.tagline if provided
            tagline: data.catalogue.tagline || undefined,
            // Split catalogue name into two parts for top/bottom title lines
            titleTop: (() => {
              const n = data.catalogue.name || ''
              const parts = String(n).trim().split(/\s+/, 2)
              return parts[0] ? String(parts[0]).toUpperCase() : undefined
            })(),
            titleBottom: (() => {
              const n = data.catalogue.name || ''
              const parts = String(n).trim().split(/\s+/, 2)
              return parts[1] ? String(parts[1]).toUpperCase() : undefined
            })(),
            // Products array for templates to loop through
            products: data.catalogue.products || [],
            // Categories
            categories: data.catalogue.categories || [],
            // Expose selected media assets to templates (cover image)
            settings: {
              mediaAssets: {
                coverImageUrl:
                  (data.catalogue.settings &&
                    data.catalogue.settings.mediaAssets &&
                    data.catalogue.settings.mediaAssets.coverImageUrl) ||
                  (data.catalogue.mediaAssets &&
                    data.catalogue.mediaAssets.coverImageUrl) ||
                  undefined,
                introImage:
                  (data.catalogue.settings &&
                    data.catalogue.settings.mediaAssets &&
                    data.catalogue.settings.mediaAssets.introImage) ||
                  (data.catalogue.mediaAssets &&
                    data.catalogue.mediaAssets.introImage) ||
                  undefined,
              },
              companyInfo: {
                companyName:
                  (data.catalogue.settings &&
                    data.catalogue.settings.companyInfo &&
                    data.catalogue.settings.companyInfo.companyName) ||
                  (data.catalogue.profile &&
                    data.catalogue.profile.companyName) ||
                  '',
                companyDescription:
                  (data.catalogue.settings &&
                    data.catalogue.settings.companyInfo &&
                    data.catalogue.settings.companyInfo.companyDescription) ||
                  data.catalogue.description ||
                  '',
              },
              contactDetails: {
                email:
                  (data.catalogue.settings &&
                    data.catalogue.settings.contactDetails &&
                    data.catalogue.settings.contactDetails.email) ||
                  (data.catalogue.profile && data.catalogue.profile.email) ||
                  '',
                phone:
                  (data.catalogue.settings &&
                    data.catalogue.settings.contactDetails &&
                    data.catalogue.settings.contactDetails.phone) ||
                  (data.catalogue.profile && data.catalogue.profile.phone) ||
                  '',
                address:
                  (data.catalogue.settings &&
                    data.catalogue.settings.contactDetails &&
                    data.catalogue.settings.contactDetails.address) ||
                  (data.catalogue.profile && data.catalogue.profile.address) ||
                  '',
                website:
                  (data.catalogue.settings &&
                    data.catalogue.settings.contactDetails &&
                    data.catalogue.settings.contactDetails.website) ||
                  (data.catalogue.profile && data.catalogue.profile.website) ||
                  '',
                contactImage:
                  (data.catalogue.settings &&
                    data.catalogue.settings.contactDetails &&
                    data.catalogue.settings.contactDetails.contactImage) ||
                  undefined,
                contactQuote:
                  (data.catalogue.settings &&
                    data.catalogue.settings.contactDetails &&
                    data.catalogue.settings.contactDetails.contactQuote) ||
                  data.catalogue.quote ||
                  '',
              },
              socialMedia: {
                instagram:
                  (data.catalogue.settings &&
                    data.catalogue.settings.socialMedia &&
                    data.catalogue.settings.socialMedia.instagram) ||
                  '',
                facebook:
                  (data.catalogue.settings &&
                    data.catalogue.settings.socialMedia &&
                    data.catalogue.settings.socialMedia.facebook) ||
                  '',
                twitter:
                  (data.catalogue.settings &&
                    data.catalogue.settings.socialMedia &&
                    data.catalogue.settings.socialMedia.twitter) ||
                  '',
                linkedin:
                  (data.catalogue.settings &&
                    data.catalogue.settings.socialMedia &&
                    data.catalogue.settings.socialMedia.linkedin) ||
                  '',
              },
            },
          },
          profile: {
            ...(data.catalogue.profile || {}),
            companyName:
              (data.catalogue.settings &&
                data.catalogue.settings.companyInfo &&
                data.catalogue.settings.companyInfo.companyName) ||
              (data.catalogue.profile && data.catalogue.profile.companyName) ||
              '',
          },
          // Use first active product as default context
          product: (() => {
            const products = data.catalogue.products || []
            const active =
              products.find((p: any) => p.isActive) || products[0] || {}
            return {
              title: active.name || '',
              price:
                active.priceDisplay ||
                (typeof active.price === 'number' ? `₹${active.price}` : ''),
              image:
                active.imageUrl ||
                (Array.isArray(active.images) && active.images[0]) ||
                '',
              description: active.description || '',
            }
          })(),
          products: data.catalogue.products || [],
          // Provide a small preview array limited to 3 items for templates that display a short selection
          productsPreview: (data.catalogue.products || [])
            .slice(0, 3)
            .map((p: any) => ({
              title: p.name || '',
              price:
                p.priceDisplay ||
                (typeof p.price === 'number' ? `₹${p.price}` : ''),
              image:
                p.imageUrl || (Array.isArray(p.images) && p.images[0]) || '',
              description: p.description || '',
            })),
          categories: data.catalogue.categories || [],
          // Page info usable by templates
          page: {
            number: 1,
            total: 1,
          },
        }
        setLiveData(initial)
        // Load previous iframe editor state if present
        const iframeEditorSettings = (data.catalogue.settings as any)
          ?.iframeEditor

        // Load template ID from either settings.iframeEditor.templateId or catalogue.template
        const savedTemplateId =
          iframeEditorSettings?.templateId || data.catalogue.template

        console.log('📋 Loading template from catalogue:', {
          templateId: savedTemplateId,
          source: iframeEditorSettings?.templateId
            ? 'settings.iframeEditor.templateId'
            : 'catalogue.template',
          catalogueName: data.catalogue.name,
          catalogueTemplate: data.catalogue.template,
          iframeEditorTemplateId: iframeEditorSettings?.templateId,
          hasSavedPages: !!iframeEditorSettings?.pages,
          savedPageCount: iframeEditorSettings?.pages?.length || 0,
          fullIframeEditorSettings: iframeEditorSettings,
        })

        if (savedTemplateId) {
          console.log('✅ Setting templateId to:', savedTemplateId)
          setTemplateId(savedTemplateId)
        } else {
          console.log('⚠️ No template ID found, using default:', {
            defaultTemplateId: templateId,
            catalogueName: data.catalogue.name,
          })
        }
        if (iframeEditorSettings) {
          if (iframeEditorSettings.liveData)
            setLiveData(iframeEditorSettings.liveData)
          if (iframeEditorSettings.styleMutations)
            setStyleMutations(iframeEditorSettings.styleMutations)
          // Load additional editor state
          if (typeof iframeEditorSettings.currentPageIndex === 'number')
            setPageIndex(iframeEditorSettings.currentPageIndex)
          if (typeof iframeEditorSettings.userZoom === 'number') {
            setToolbarZoom(Math.round(iframeEditorSettings.userZoom * 100))
          }
          if (typeof iframeEditorSettings.showGrid === 'boolean')
            setGridOn(iframeEditorSettings.showGrid)
        }
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

  const handleCatalogueUpdate = async (catalogueId: string, updates: any) => {
    try {
      const response = await fetch(`/api/catalogues/${catalogueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update catalogue')
      }

      const responseData = await response.json()
      const updatedCatalogue = responseData.catalogue || responseData

      setCatalogue((prev: { settings: object }) => {
        if (!prev) return null
        return {
          ...prev,
          ...updatedCatalogue,
          settings: {
            ...((prev.settings as object) || {}),
            ...((updatedCatalogue.settings as object) || {}),
          },
        }
      })
    } catch (error) {
      console.error('Error updating catalogue:', error)
    }
  }

  useEffect(() => {
    if (catalogueId) {
      loadCatalogue()
    }
  }, [catalogueId])

  // Sync page index/count from editor controls so navbar shows "Page X of Y"
  useEffect(() => {
    const update = () => {
      const controls = editorControlsRef.current
      if (!controls) return
      const idx = controls.getCurrentPageIndex?.() ?? 0
      const count = controls.getPages?.()?.length ?? 1
      setPageIndex(idx)
      setPageCount(count)
    }
    // Initial read shortly after mount/controls registration
    const t = setTimeout(update, 100)
    const interval = setInterval(update, 500)
    return () => {
      clearTimeout(t)
      clearInterval(interval)
    }
  }, [])

  // Keep page number in liveData in sync with editor's pageIndex/pageCount
  useEffect(() => {
    if (!liveData) return
    setLiveData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        page: {
          number: Math.min(pageIndex + 1, pageCount || 1),
          total: pageCount || 1,
        },
      }
    })
  }, [pageIndex, pageCount])

  if (isLoading) {
    return (
      <div className="h-screen overflow-hidden bg-gray-50">
        {/* Skeleton Toolbar */}
        <div className="flex h-16 items-center justify-between border-b bg-white px-4">
          <div className="flex items-center gap-10">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-8 w-48" />
          </div>

          <div className="flex items-center gap-6">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>

        {/* Skeleton Canvas Area */}
        <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
          <Skeleton className="h-[90%] w-[80%] max-w-4xl" />
        </div>
      </div>
    )
  }

  if (error || !catalogue) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Error</h2>
          <p className="mb-4 text-gray-600">{error || 'Catalogue not found'}</p>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      {/* Top Toolbar with center Zoom/Grid and right actions */}
      <div className="relative flex h-16 items-center justify-between border-b bg-white px-4">
        <div className="flex items-center gap-10">
          <Button
            asChild
            variant="ghost"
            className="rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gradient-to-r hover:from-[#2D1B69]/10 hover:to-[#6366F1]/10 hover:text-gray-900"
          >
            <Link href={`/catalogue/${catalogueId}/edit`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>

          {/* Mode Toggle - Segmented Control */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-xl bg-gray-100 p-1 ">
              <button
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 ${
                  !isPreviewMode
                    ? 'bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setIsPreviewMode(false)}
                aria-label="Switch to edit mode"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span className="leading-none">Edit</span>
              </button>
              <button
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 ${
                  isPreviewMode
                    ? 'bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setIsPreviewMode(true)}
                aria-label="Switch to preview mode"
              >
                <Eye className="h-4 w-4" />
                <span className="leading-none">Preview</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center Zoom/Grid controls */}
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
          {/* Undo/Redo icons - Hidden in preview mode */}
          {!isPreviewMode && (
            <>
              <button
                className="rounded-md p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                disabled={!canUndo}
                onClick={() => editorControlsRef.current?.undo?.()}
                aria-label="Undo"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                className="rounded-md p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                disabled={!canRedo}
                onClick={() => editorControlsRef.current?.redo?.()}
                aria-label="Redo"
              >
                <Redo className="h-4 w-4" />
              </button>

              <hr className="h-6 w-[1px] bg-gray-300"></hr>
            </>
          )}
          <button
            className="pl-2 text-gray-700"
            onClick={() => {
              editorControlsRef.current?.zoomOut?.()
              setTimeout(() => {
                const pct = Math.round(
                  (editorControlsRef.current?.getZoom?.() || 1) * 100
                )
                setToolbarZoom(pct)
              }, 0)
            }}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <div className="rounded-xl bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {toolbarZoom}%
          </div>
          <button
            className="pr-2  text-gray-700"
            onClick={() => {
              editorControlsRef.current?.zoomIn?.()
              setTimeout(() => {
                const pct = Math.round(
                  (editorControlsRef.current?.getZoom?.() || 1) * 100
                )
                setToolbarZoom(pct)
              }, 0)
            }}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          {/* Page navigator: Page X of Y with prev/next chevrons - Hidden in preview mode */}
          {!isPreviewMode && (
            <div className="ml-3 flex items-center gap-2 rounded-2xl border bg-white px-3 py-1">
              <span className="text-xs text-gray-700">
                Page {Math.min(pageIndex + 1, pageCount)} of {pageCount}
              </span>
              <button
                className="rounded-md p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                onClick={() => {
                  editorControlsRef.current?.goPrev?.()
                  setTimeout(() => {
                    setPageIndex(
                      editorControlsRef.current?.getCurrentPageIndex?.() || 0
                    )
                    setPageCount(
                      editorControlsRef.current?.getPages?.()?.length ||
                        pageCount
                    )
                  }, 0)
                }}
                disabled={pageIndex <= 0}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="rounded-md p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                onClick={() => {
                  editorControlsRef.current?.goNext?.()
                  setTimeout(() => {
                    setPageIndex(
                      editorControlsRef.current?.getCurrentPageIndex?.() || 0
                    )
                    setPageCount(
                      editorControlsRef.current?.getPages?.()?.length ||
                        pageCount
                    )
                  }, 0)
                }}
                disabled={pageIndex >= pageCount - 1}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Save Status Indicator (hidden in preview mode) */}
          {!isPreviewMode && (
            <>
              {saveStatus === 'saving' && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                  Saving...
                </div>
              )}
              {saveStatus === 'saved' && (
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  All changes saved
                </div>
              )}
              {saveStatus === 'unsaved' && (
                <div className="flex items-center gap-2 text-xs text-orange-600">
                  <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                  Unsaved changes
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  Save failed
                </div>
              )}

              <Button
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
                onClick={async () => {
                  try {
                    await editorControlsRef.current?.saveToDatabase?.()
                    toast.success('Changes saved successfully')
                  } catch (error) {
                    toast.error('Failed to save changes')
                  }
                }}
                disabled={saveStatus === 'saving'}
              >
                <Save className="mr-1 h-3 w-3" />
                {saveStatus === 'saving' ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
          {/* Share */}
          <Button
            className="flex items-center rounded-lg bg-gradient-to-r from-[#2D1B69] to-[#6366F1] px-3 py-2 text-sm font-medium text-white transition-colors hover:from-[#1E1338] hover:to-[#4F46E5]"
            onClick={() => setShareOpen(true)}
          >
            <Share2 className="mr-2 h-3 w-3" />
            Share
          </Button>

          <ProfileDropdown />
        </div>
      </div>

      {/* Iframe Editor */}
      <div className="relative h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
        {/* Loading overlay - shows until editor is fully ready with user's edits */}
        {!isEditorReady && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-sm font-medium text-gray-600">
                Loading your catalogue...
              </p>
            </div>
          </div>
        )}

        {/* IframeEditor - hidden until fully loaded with user's edits */}
        {liveData && (
          <div
            className="h-full transition-opacity duration-300 ease-in-out"
            style={{ opacity: isEditorReady ? 1 : 0 }}
          >
            <IframeEditor
              key={templateId} // 🔥 CRITICAL FIX: Force React to re-mount when template changes
              template={(() => {
                const template = getTemplate(templateId) || HtmlTemplates[0]
                const foundTemplate = getTemplate(templateId)

                console.log('🎨 Preview - Rendering template:', {
                  templateId,
                  templateFound: !!foundTemplate,
                  templateName: template.name,
                  templateEngine: template.engine,
                  pageCount: template.pages?.length || 0,
                  usingFallback: !foundTemplate,
                })

                if (!foundTemplate) {
                  console.error(
                    `❌ Template "${templateId}" not found, using fallback: ${HtmlTemplates[0].name}`
                  )
                  toast.error(
                    `Template "${templateId}" not found, using default template`
                  )
                }

                return template
              })()}
              initialData={liveData}
              onLiveDataChange={setLiveData}
              initialStyleMutations={styleMutations}
              onStyleMutationsChange={setStyleMutations}
              registerIframeGetter={getter => {
                iframeGetterRef.current = getter
              }}
              previewMode={isPreviewMode}
              onTemplateIdChange={async id => {
                console.log('� onTemplateIdChange CALLED with id:', id)
                console.log('�🔄 Template changed:', {
                  oldTemplateId: templateId,
                  newTemplateId: id,
                })

                // 🔥 FIX: Immediately update templateId to trigger React re-mount via key prop
                setTemplateId(id)

                // 🔥 FIX: Reset ALL editor state immediately
                setStyleMutations({})
                setLiveData({
                  catalogue: catalogue
                    ? {
                        id: catalogue.id,
                        name: catalogue.name,
                      }
                    : {},
                  profile: catalogue?.profile || {},
                  product: catalogue?.products?.[0]
                    ? {
                        title: catalogue.products[0].name || '',
                        price: catalogue.products[0].priceDisplay || '',
                        image: catalogue.products[0].imageUrl || '',
                        description: catalogue.products[0].description || '',
                      }
                    : {},
                  products: catalogue?.products || [],
                  categories: catalogue?.categories || [],
                })

                // 🔥 FIX: Save template change to database AND clear ALL saved editor state
                if (catalogueId) {
                  try {
                    // First, get current catalogue data
                    const getResponse = await fetch(
                      `/api/catalogues/${catalogueId}`
                    )
                    const currentData = await getResponse.json()
                    const currentSettings =
                      currentData.catalogue?.settings || {}

                    console.log(
                      '📦 Current settings before template change:',
                      currentSettings
                    )

                    // Remove iframeEditor from settings completely
                    const { iframeEditor, ...restSettings } =
                      currentSettings as any

                    console.log('📦 Settings after removing iframeEditor:', {
                      restSettings,
                      removedIframeEditor: iframeEditor,
                    })

                    const updatePayload = {
                      template: id, // Update catalogue.template field
                      settings: {
                        ...restSettings,
                        iframeEditor: null, // 🔥 CRITICAL: Explicitly set to null to remove it
                      },
                    }

                    console.log('📤 Sending update payload:', updatePayload)

                    const response = await fetch(
                      `/api/catalogues/${catalogueId}`,
                      {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatePayload),
                      }
                    )

                    console.log('📥 Update response status:', response.status)

                    if (response.ok) {
                      const responseData = await response.json()
                      console.log(
                        '✅ Template changed and all saved editor state cleared'
                      )
                      console.log('📦 Response data:', responseData)
                      console.log(
                        '📦 Response settings:',
                        responseData.catalogue?.settings
                      )
                      console.log(
                        '📦 Response template:',
                        responseData.catalogue?.template
                      )
                      toast.success(
                        'Template changed - reloading with fresh template'
                      )

                      // 🔥 CRITICAL: Force a hard reload to ensure clean state
                      window.location.href = `/catalogue/${catalogueId}/preview`
                    } else {
                      const errorData = await response.json()
                      console.error('❌ Failed to update template:', errorData)
                      toast.error(
                        `Failed to change template: ${errorData.error || 'Unknown error'}`
                      )
                    }
                  } catch (error) {
                    console.error('Error updating template:', error)
                    toast.error('Failed to change template')
                  }
                }
              }}
              catalogueId={catalogueId as string}
              autoSave={true}
              autoSaveInterval={10000} // 10 seconds after last change
              onSaveSuccess={() => {
                // Don't show toast for auto-save, status indicator is enough
              }}
              onSaveError={error => {
                toast.error(`Auto-save failed: ${error}`)
              }}
              registerEditorControls={controls => {
                editorControlsRef.current = controls
                const pct = Math.round((controls.getZoom?.() || 1) * 100)
                setToolbarZoom(pct)
                setGridOn(Boolean(controls.getGrid?.()))
                // Sync page index/count from editor when controls become available
                const idx = controls.getCurrentPageIndex?.()
                if (typeof idx === 'number') setPageIndex(idx)
                const pages = controls.getPages?.()
                if (Array.isArray(pages)) setPageCount(pages.length)
              }}
              onIframeReady={() => {
                // Mark editor as ready once iframe is fully loaded with user's saved edits
                console.log(
                  '✅ Preview: onIframeReady callback received, hiding loading overlay'
                )
                setIsEditorReady(true)
              }}
            />
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share & Export</DialogTitle>
            <DialogDescription>
              Share your catalogue with others or export it as PDF/PNG.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Export Options */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                disabled={isExportingPDF}
                onClick={async () => {
                  try {
                    setIsExportingPDF(true)
                    toast.loading('Generating PDF...', {
                      id: 'pdf-export',
                    })
                    await editorControlsRef.current?.exportPDF?.()
                    toast.success('PDF exported successfully', {
                      id: 'pdf-export',
                    })
                  } catch (error) {
                    toast.error('Failed to export PDF', { id: 'pdf-export' })
                  } finally {
                    setIsExportingPDF(false)
                  }
                }}
              >
                <Printer className="h-4 w-4" />
                {isExportingPDF ? 'Exporting...' : 'Export PDF'}
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={async () => {
                  try {
                    await editorControlsRef.current?.exportPNG?.()
                    toast.success('PNG exported successfully')
                  } catch (error) {
                    toast.error('Failed to export PNG')
                  }
                }}
              >
                <Share className="h-4 w-4" /> Export PNG
              </Button>
            </div>

            {/* Share Link Section */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Public Share Link</div>
              {catalogue?.isPublic && catalogue?.slug ? (
                <>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded border border-green-200 bg-green-50 px-2 py-1 text-sm"
                      value={getPublicShareUrl()}
                      readOnly
                    />
                    <Button
                      onClick={() => {
                        const shareUrl = getPublicShareUrl()
                        navigator.clipboard.writeText(shareUrl)
                        toast.success('Public link copied to clipboard!')
                      }}
                      className="flex items-center gap-2"
                    >
                      <LinkIcon className="h-4 w-4" /> Copy
                    </Button>
                  </div>
                  <p className="flex items-center gap-1 text-xs text-green-600">
                    ✓ Anyone with this link can view your catalogue
                  </p>
                </>
              ) : catalogue?.isPublic && !catalogue?.slug ? (
                <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
                  <p className="mb-2 text-sm text-orange-800">
                    ⚠️ Your catalogue is public but needs a unique URL slug to
                    be shareable.
                  </p>
                  <p className="text-xs text-orange-700">
                    Go to <strong>Edit → Overview → Quick Actions</strong> to
                    add a slug and generate your public share link.
                  </p>
                </div>
              ) : !catalogue?.isPublic ? (
                <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
                  <p className="mb-2 text-sm text-orange-800">
                    🔒 This catalogue is currently private.
                  </p>
                  <p className="text-xs text-orange-700">
                    Go to <strong>Edit → Overview → Quick Actions</strong> to
                    make it public and add a share link.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Share to Social Media - Only show if public and has slug */}
            {catalogue?.isPublic && catalogue?.slug && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Share via</div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      const shareUrl = getPublicShareUrl()
                      const text = `Check out my catalogue: ${catalogue?.name}`
                      window.open(
                        `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`,
                        '_blank'
                      )
                    }}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      const shareUrl = getPublicShareUrl()
                      const subject = encodeURIComponent(
                        `Check out: ${catalogue?.name}`
                      )
                      const body = encodeURIComponent(
                        `I wanted to share this catalogue with you:\n\n${catalogue?.name}\n\nView it here: ${shareUrl}`
                      )
                      window.open(
                        `mailto:?subject=${subject}&body=${body}`,
                        '_blank'
                      )
                    }}
                  >
                    Email
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}