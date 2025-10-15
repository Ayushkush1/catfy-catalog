'use client'

import IframeEditor from '@/components/editor/IframeEditor'
import { HtmlTemplates, getTemplateById } from '@/components/editor/iframe-templates'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, EyeOff, Eye, ZoomIn, ZoomOut, Grid3X3, Undo, Redo, Save, Share, Share2, Link as LinkIcon, FileJson, FileType, Printer } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ProfileDropdown } from '@/components/editor/components/ProfileDropdown'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

export default function CataloguePreviewPage() {
  const [catalogue, setCatalogue] = useState<any | null>(null)
  const [liveData, setLiveData] = useState<Record<string, any> | null>(null)
  const [styleMutations, setStyleMutations] = useState<Record<string, Partial<CSSStyleDeclaration>>>({})
  const [templateId, setTemplateId] = useState<string>('default-html')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved')
  const [isEditorReady, setIsEditorReady] = useState(false) // NEW: Prevent flash on initial load
  const iframeGetterRef = useRef<() => HTMLIFrameElement | null>(() => null)
  const editorControlsRef = useRef<{
    undo: () => void,
    redo: () => void,
    setZoom: (z: number) => void,
    getZoom: () => number,
    zoomIn?: () => void,
    zoomOut?: () => void,
    toggleGrid?: () => void,
    setGrid?: (v: boolean) => void,
    getGrid?: () => boolean,
    hasUndo?: () => boolean,
    hasRedo?: () => boolean,
    print?: () => void,
    exportHTML?: () => void,
    exportJSON?: () => void,
    exportPDF?: () => Promise<void>,
    exportPNG?: () => Promise<void>,
    saveToDatabase?: () => Promise<void>,
    getSaveStatus?: () => 'saved' | 'saving' | 'unsaved' | 'error',
    getLastSaved?: () => Date | null,
    isDirty?: () => boolean,
    // Pages
    getPages?: () => any[],
    getCurrentPageIndex?: () => number,
    setCurrentPageIndex?: (i: number) => void,
    goPrev?: () => void,
    goNext?: () => void,
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
            const active = products.find((p: any) => p.isActive) || products[0] || {}
            return {
              title: active.name || '',
              price: active.priceDisplay || (typeof active.price === 'number' ? `₹${active.price}` : ''),
              image: active.imageUrl || (Array.isArray(active.images) && active.images[0]) || '',
              description: active.description || ''
            }
          })(),
          products: data.catalogue.products || [],
          categories: data.catalogue.categories || []
        }
        setLiveData(initial)
        // Load previous iframe editor state if present
        const iframeEditorSettings = (data.catalogue.settings as any)?.iframeEditor
        if (iframeEditorSettings) {
          if (iframeEditorSettings.liveData) setLiveData(iframeEditorSettings.liveData)
          if (iframeEditorSettings.templateId) setTemplateId(iframeEditorSettings.templateId)
          if (iframeEditorSettings.styleMutations) setStyleMutations(iframeEditorSettings.styleMutations)
          // Load additional editor state
          if (typeof iframeEditorSettings.currentPageIndex === 'number') setPageIndex(iframeEditorSettings.currentPageIndex)
          if (typeof iframeEditorSettings.userZoom === 'number') {
            setToolbarZoom(Math.round(iframeEditorSettings.userZoom * 100))
          }
          if (typeof iframeEditorSettings.showGrid === 'boolean') setGridOn(iframeEditorSettings.showGrid)
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
            ...(prev.settings as object || {}),
            ...(updatedCatalogue.settings as object || {})
          }
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
      <div className="h-screen overflow-hidden bg-gray-50">
        {/* Skeleton Toolbar */}
        <div className="h-16 border-b bg-white flex items-center justify-between px-4">
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
        <div className="h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
          <Skeleton className="h-[90%] w-[80%] max-w-4xl" />
        </div>
      </div>
    )
  }

  if (error || !catalogue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Catalogue not found'}</p>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
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
      <div className="h-16 border-b bg-white flex items-center justify-between px-4 relative">
        <div className="flex items-center gap-10">
          <Button asChild variant="ghost" className="px-3 py-2 text-gray-700 hover:text-gray-900 rounded-md transition-colors text-sm hover:bg-gradient-to-r hover:from-[#2D1B69]/10 hover:to-[#6366F1]/10">
            <Link href={`/catalogue/${catalogueId}/edit`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>

          {/* Edit/Preview toggle */}
          <button
            className={`text-sm px-3 py-2 rounded-lg flex items-center transition-colors ${isPreviewMode ? 'bg-gray-100 text-gray-700' : 'bg-gradient-to-r from-[#2D1B69]/10 to-[#6366F1]/10 text-[#2D1B69]'}`}
            onClick={() => setIsPreviewMode(v => !v)}
            aria-label="Toggle preview mode"
          >
            {isPreviewMode ? (<><Eye className="w-4 h-4 mr-1" /> Preview</>) : (<><EyeOff className="w-4 h-4 mr-1" /> Editing</>)}
          </button>
        </div>

        {/* Center Zoom/Grid controls */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          {/* Undo/Redo icons */}
          <button className="p-2 rounded-md hover:bg-gray-100 text-gray-700 disabled:opacity-50" disabled={!editorControlsRef.current?.hasUndo?.()} onClick={() => editorControlsRef.current?.undo?.()} aria-label="Undo">
            <Undo className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-md hover:bg-gray-100 text-gray-700 disabled:opacity-50" disabled={!editorControlsRef.current?.hasRedo?.()} onClick={() => editorControlsRef.current?.redo?.()} aria-label="Redo">
            <Redo className="w-4 h-4" />
          </button>

          <hr className="w-[1px] h-6 bg-gray-300"></hr>
          <button
            className="pl-2 text-gray-700"
            onClick={() => {
              editorControlsRef.current?.zoomOut?.()
              setTimeout(() => {
                const pct = Math.round((editorControlsRef.current?.getZoom?.() || 1) * 100)
                setToolbarZoom(pct)
              }, 0)
            }}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="px-3 py-1 rounded-xl bg-gray-100 text-gray-700 text-xs font-medium">{toolbarZoom}%</div>
          <button
            className="pr-2  text-gray-700"
            onClick={() => {
              editorControlsRef.current?.zoomIn?.()
              setTimeout(() => {
                const pct = Math.round((editorControlsRef.current?.getZoom?.() || 1) * 100)
                setToolbarZoom(pct)
              }, 0)
            }}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          {/* Page navigator: Page X of Y with prev/next chevrons */}
          <div className="ml-3 flex items-center gap-2 px-3 py-1 rounded-2xl bg-white border">
            <span className="text-xs text-gray-700">Page {Math.min(pageIndex + 1, pageCount)} of {pageCount}</span>
            <button
              className="p-1 rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-40"
              onClick={() => {
                editorControlsRef.current?.goPrev?.()
                setTimeout(() => {
                  setPageIndex(editorControlsRef.current?.getCurrentPageIndex?.() || 0)
                  setPageCount(editorControlsRef.current?.getPages?.()?.length || pageCount)
                }, 0)
              }}
              disabled={pageIndex <= 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="p-1 rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-40"
              onClick={() => {
                editorControlsRef.current?.goNext?.()
                setTimeout(() => {
                  setPageIndex(editorControlsRef.current?.getCurrentPageIndex?.() || 0)
                  setPageCount(editorControlsRef.current?.getPages?.()?.length || pageCount)
                }, 0)
              }}
              disabled={pageIndex >= pageCount - 1}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        <div className="flex items-center gap-4">
          {/* Save Status Indicator */}
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Saving...
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              All changes saved
            </div>
          )}
          {saveStatus === 'unsaved' && (
            <div className="flex items-center gap-2 text-xs text-orange-600">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Unsaved changes
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-xs text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Save failed
            </div>
          )}

          <Button
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
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
            <Save className="w-3 h-3 mr-1" />
            {saveStatus === 'saving' ? 'Saving...' : 'Save'}
          </Button>
          {/* Share */}
          <Button
            className="px-3 py-2 bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white rounded-lg hover:from-[#1E1338] hover:to-[#4F46E5] transition-colors text-sm font-medium flex items-center"
            onClick={() => setShareOpen(true)}
          >
            <Share2 className="w-3 h-3 mr-2" />
            Share
          </Button>

          <ProfileDropdown />
        </div>
      </div>

      {/* Iframe Editor */}
      <div className="h-[calc(100vh-64px)] overflow-hidden relative bg-gray-50">
        {/* Loading overlay - shows until editor is fully ready with user's edits */}
        {!isEditorReady && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600 font-medium">Loading your catalogue...</p>
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
              template={getTemplateById(templateId) || HtmlTemplates[0]}
              initialData={liveData}
              onLiveDataChange={setLiveData}
              initialStyleMutations={styleMutations}
              onStyleMutationsChange={setStyleMutations}
              registerIframeGetter={(getter) => { iframeGetterRef.current = getter }}
              previewMode={isPreviewMode}
              onTemplateIdChange={(id) => setTemplateId(id)}
              catalogueId={catalogueId as string}
              autoSave={true}
              autoSaveInterval={10000} // 10 seconds after last change
              onSaveSuccess={() => {
                // Don't show toast for auto-save, status indicator is enough
              }}
              onSaveError={(error) => {
                toast.error(`Auto-save failed: ${error}`)
              }}
              registerEditorControls={(controls) => {
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
            <DialogDescription>Select an option to share or export your catalogue.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex items-center gap-2" onClick={() => editorControlsRef.current?.exportHTML?.()}>
                <FileType className="w-4 h-4" /> Export HTML
              </Button>
              <Button variant="outline" className="flex  items-center gap-2" onClick={() => editorControlsRef.current?.exportJSON?.()}>
                <FileJson className="w-4 h-4" /> Export JSON
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={async () => {
                  try {
                    await editorControlsRef.current?.exportPDF?.()
                    toast.success('PDF exported successfully')
                  } catch (error) {
                    toast.error('Failed to export PDF')
                  }
                }}
              >
                <Printer className="w-4 h-4" /> Export PDF
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
                <Share className="w-4 h-4" /> Export PNG
              </Button>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Share link</div>
              <div className="flex gap-2">
                <input className="flex-1 border rounded px-2 py-1 text-sm" value={typeof window !== 'undefined' ? window.location.href : ''} readOnly />
                <Button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied') }} className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" /> Copy
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Share to</div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, '_blank')}>Twitter</Button>
                <Button variant="secondary" onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}`, '_blank')}>LinkedIn</Button>
                <Button variant="secondary" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`, '_blank')}>WhatsApp</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}