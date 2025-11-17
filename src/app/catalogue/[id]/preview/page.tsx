'use client'

import IframeEditor from '@/components/editor/IframeEditor'
import {
  HtmlTemplates,
  getTemplateById,
} from '@/components/editor/iframe-templates'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Eye,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Undo,
  Redo,
  Save,
  Share,
  Share2,
  Link as LinkIcon,
  FileJson,
  FileType,
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

export default function CataloguePreviewPage() {
  const [catalogue, setCatalogue] = useState<any | null>(null)
  const [liveData, setLiveData] = useState<Record<string, any> | null>(null)
  const [styleMutations, setStyleMutations] = useState<
    Record<string, Partial<CSSStyleDeclaration>>
  >({})
  const [templateId, setTemplateId] = useState<string>('default-html')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const iframeGetterRef = useRef<() => HTMLIFrameElement | null>(() => null)
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
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false)
  const [shareOpen, setShareOpen] = useState<boolean>(false)
  const [pageIndex, setPageIndex] = useState<number>(0)
  const [pageCount, setPageCount] = useState<number>(1)

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
    }, 250)
    return () => clearInterval(interval)
  }, [pageIndex, pageCount])

  const params = useParams()
  const catalogueId = params.id as string

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
          },
          profile: data.catalogue.profile || {},
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
          categories: data.catalogue.categories || [],
        }
        setLiveData(initial)
        // Load previous iframe editor state if present
        const iframeEditorSettings = (data.catalogue.settings as any)
          ?.iframeEditor
        if (iframeEditorSettings) {
          if (iframeEditorSettings.liveData)
            setLiveData(iframeEditorSettings.liveData)
          if (iframeEditorSettings.templateId)
            setTemplateId(iframeEditorSettings.templateId)
          if (iframeEditorSettings.styleMutations)
            setStyleMutations(iframeEditorSettings.styleMutations)
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading catalogue...</p>
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
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>

          {/* Edit/Preview toggle */}
          <button
            className={`flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${isPreviewMode ? 'bg-gray-100 text-gray-700' : 'bg-gradient-to-r from-[#2D1B69]/10 to-[#6366F1]/10 text-[#2D1B69]'}`}
            onClick={() => setIsPreviewMode(v => !v)}
            aria-label="Toggle preview mode"
          >
            {isPreviewMode ? (
              <>
                <Eye className="mr-1 h-4 w-4" /> Preview
              </>
            ) : (
              <>
                <EyeOff className="mr-1 h-4 w-4" /> Editing
              </>
            )}
          </button>
        </div>

        {/* Center Zoom/Grid controls */}
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
          {/* Undo/Redo icons */}
          <button
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            disabled={!editorControlsRef.current?.hasUndo?.()}
            onClick={() => editorControlsRef.current?.undo?.()}
            aria-label="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            disabled={!editorControlsRef.current?.hasRedo?.()}
            onClick={() => editorControlsRef.current?.redo?.()}
            aria-label="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>

          <hr className="h-6 w-[1px] bg-gray-300"></hr>
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
          {/* Page navigator: Page X of Y with prev/next chevrons */}
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
                    editorControlsRef.current?.getPages?.()?.length || pageCount
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
                    editorControlsRef.current?.getPages?.()?.length || pageCount
                  )
                }, 0)
              }}
              disabled={pageIndex >= pageCount - 1}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
            onClick={() => {
              if (!catalogue?.id || !liveData) return
              handleCatalogueUpdate(catalogue.id, {
                settings: {
                  ...((catalogue.settings as object) || {}),
                  iframeEditor: {
                    templateId,
                    liveData,
                    styleMutations,
                  },
                } as any,
              })
              toast.success('Saved iframe editor data')
            }}
          >
            <Save className="mr-1 h-3 w-3" />
            Save
          </Button>
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
      <div className="h-[calc(100vh-64px)] overflow-hidden">
        {liveData && (
          <IframeEditor
            template={getTemplateById(templateId) || HtmlTemplates[0]}
            initialData={liveData}
            onLiveDataChange={setLiveData}
            initialStyleMutations={styleMutations}
            onStyleMutationsChange={setStyleMutations}
            registerIframeGetter={getter => {
              iframeGetterRef.current = getter
            }}
            previewMode={isPreviewMode}
            onTemplateIdChange={id => setTemplateId(id)}
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
          />
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share & Export</DialogTitle>
            <DialogDescription>
              Select an option to share or export your catalogue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => editorControlsRef.current?.exportHTML?.()}
              >
                <FileType className="h-4 w-4" /> Export HTML
              </Button>
              <Button
                variant="outline"
                className="flex  items-center gap-2"
                onClick={() => editorControlsRef.current?.exportJSON?.()}
              >
                <FileJson className="h-4 w-4" /> Export JSON
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => editorControlsRef.current?.print?.()}
              >
                <Printer className="h-4 w-4" /> Print / PDF
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={async () => {
                  try {
                    const iframe = iframeGetterRef.current?.()
                    if (!iframe || !iframe.contentDocument) {
                      toast.error('Preview not ready')
                      return
                    }
                    const w = iframe.clientWidth || 1200
                    const h = iframe.clientHeight || 800
                    const html =
                      iframe.contentDocument.documentElement.outerHTML
                    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject width="100%" height="100%">${html}</foreignObject></svg>`
                    const blob = new Blob([svg], {
                      type: 'image/svg+xml;charset=utf-8',
                    })
                    const url = URL.createObjectURL(blob)
                    const img = new Image()
                    img.onload = () => {
                      const canvas = document.createElement('canvas')
                      canvas.width = w
                      canvas.height = h
                      const ctx = canvas.getContext('2d')
                      if (!ctx) {
                        URL.revokeObjectURL(url)
                        toast.error('Canvas error')
                        return
                      }
                      ctx.drawImage(img, 0, 0)
                      canvas.toBlob(b => {
                        if (!b) {
                          URL.revokeObjectURL(url)
                          toast.error('PNG export failed')
                          return
                        }
                        const a = document.createElement('a')
                        a.href = URL.createObjectURL(b)
                        a.download = 'catalogue.png'
                        a.click()
                        URL.revokeObjectURL(url)
                      }, 'image/png')
                    }
                    img.crossOrigin = 'anonymous'
                    img.src = url
                  } catch (e) {
                    toast.error('PNG export failed')
                  }
                }}
              >
                <Share className="h-4 w-4" /> Export PNG
              </Button>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Share link</div>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded border px-2 py-1 text-sm"
                  value={
                    typeof window !== 'undefined' ? window.location.href : ''
                  }
                  readOnly
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success('Link copied')
                  }}
                  className="flex items-center gap-2"
                >
                  <LinkIcon className="h-4 w-4" /> Copy
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Share to</div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    window.open(
                      `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`,
                      '_blank'
                    )
                  }
                >
                  Twitter
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    window.open(
                      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}`,
                      '_blank'
                    )
                  }
                >
                  LinkedIn
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(window.location.href)}`,
                      '_blank'
                    )
                  }
                >
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
