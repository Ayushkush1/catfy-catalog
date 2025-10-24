'use client'

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useImperativeHandle,
} from 'react'
import { Editor, Frame, Element, useEditor } from '@craftjs/core'
import { Layers } from '@craftjs/layers'

// Import blocks
import {
  TextBlock,
  HeadingBlock,
  ButtonBlock,
  ImageBlock,
  ContainerBlock,
  DividerBlock,
  SpacerBlock,
  VideoBlock,
  IconBlock,
  GridBlock,
  FlexboxBlock,
  TabsBlock,
  AccordionBlock,
  CarouselBlock,
  FormBlock,
} from './blocks'

// Import UI components
import {
  Toolbox,
  Toolbar,
  InspectorPanel,
  PageNavigator,
  AssetManager,
  StatusBar,
} from './ui'
import { CanvaSidebar } from './components/CanvaSidebar'
import { CanvaToolbar } from './components/CanvaToolbar'

// Import template system
import { TemplateManager } from './templates'
import type { Template } from './templates'

// Import custom hooks
import {
  useMultiPage,
  useZoom,
  useDeviceMode,
  useExportImport,
  useHistory,
} from './hooks'
import { useTemplateRenderer } from './hooks/useTemplateRenderer'
import type { DeviceMode } from './hooks/useDeviceMode'
import type {
  UseMultiPageReturn,
  UseZoomReturn,
  UseDeviceModeReturn,
  UseExportImportReturn,
  UseHistoryReturn,
} from './hooks'

// Import types
import type { Page, Asset } from './ui'

interface CraftJSEditorProps {
  initialData?: string
  onSave?: (data: string) => void
  className?: string
  initialPreviewMode?: boolean
  templateName?: string
  backButton?: {
    href: string
    catalogueName: string
  }
}

export interface CraftJSEditorRef {
  getCurrentData: () => string
}

// Canvas component that uses the editor context
const Canvas: React.FC<{
  zoom: UseZoomReturn
  deviceMode: UseDeviceModeReturn
  isPreviewMode: boolean
}> = ({ zoom, deviceMode, isPreviewMode }) => {
  const { enabled, query, actions } = useEditor(state => ({
    enabled: state.options.enabled,
  }))

  // Monitor node changes by checking periodically (reduced frequency)
  React.useEffect(() => {
    const interval = setInterval(() => {
      const nodes = query.getNodes()
      if (Object.keys(nodes).length > 1) {
        // Only log when there are actual components
        console.log('🔄 Editor State:', {
          nodeCount: Object.keys(nodes).length,
          componentTypes: Object.values(nodes).map(
            node => node.data.displayName || node.data.type
          ),
        })
      }
    }, 10000) // Further reduced frequency to prevent conflicts

    return () => clearInterval(interval)
  }, [query])

  // Debug logging for canvas state - disabled to prevent performance issues
  React.useEffect(() => {
    // Minimal logging only for critical state changes
    if (process.env.NODE_ENV === 'development') {
      console.log('🎨 Canvas State:', {
        previewMode: isPreviewMode,
        enabled: enabled,
        nodeCount: Object.keys(query.getNodes()).length,
      })
    }
  }, [enabled, isPreviewMode, query])

  // Add a ref to track the Frame element
  const frameRef = React.useRef<HTMLDivElement>(null)

  return (
    <div className="flex h-full w-full items-start justify-center overflow-auto p-8">
      <div
        ref={zoom.canvasRef}
        className={`bg-white shadow-lg transition-all duration-200 ${
          deviceMode.currentMode === 'mobile'
            ? 'h-[667px] w-[375px]'
            : deviceMode.currentMode === 'tablet'
              ? 'h-[1024px] w-[768px]'
              : 'min-h-[800px] w-full max-w-[1200px]'
        }`}
        style={{
          ...zoom.getCanvasStyle(),
          transformOrigin: 'top center',
          border: 'none',
          borderRadius: '8px',
          overflow: 'visible',
        }}
      >
        <Frame>
          <Element
            is={ContainerBlock}
            canvas
            custom={{
              displayName: 'App Container',
            }}
            backgroundColor="transparent"
            minHeight={800}
            width="100%"
            height="100%"
            padding={{
              top: 8,
              right: 8,
              bottom: 8,
              left: 8,
            }}
          />
        </Frame>
      </div>
    </div>
  )
}

// Props interface for EditorInner component
interface EditorInnerProps {
  isPreviewMode: boolean
  setIsPreviewMode: (value: boolean) => void
  showAssetManager: boolean
  setShowAssetManager: (value: boolean) => void
  showLeftSidebar: boolean
  setShowLeftSidebar: (value: boolean) => void
  showLayers: boolean
  setShowLayers: (value: boolean) => void
  showTemplateManager: boolean
  setShowTemplateManager: (value: boolean) => void
  showPagesTab: boolean
  setShowPagesTab: (value: boolean) => void
  showInspector: boolean
  setShowInspector: (value: boolean) => void
  inspectorCollapsed: boolean
  setInspectorCollapsed: (value: boolean) => void
  assets: Asset[]
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>
  onSave?: (data: string) => void
  initialData?: string
  templateName?: string
  backButton?: {
    href: string
    catalogueName: string
  }
}

// Inner component that uses Editor hooks (must be inside Editor)
const EditorInner = React.forwardRef<CraftJSEditorRef, EditorInnerProps>(
  function EditorInner(
    {
      isPreviewMode,
      setIsPreviewMode,
      showAssetManager,
      setShowAssetManager,
      showLeftSidebar,
      setShowLeftSidebar,
      showLayers,
      setShowLayers,
      showTemplateManager,
      setShowTemplateManager,
      showPagesTab,
      setShowPagesTab,
      showInspector,
      setShowInspector,
      inspectorCollapsed,
      setInspectorCollapsed,
      assets,
      setAssets,
      onSave,
      initialData,
      templateName,
      backButton,
    },
    ref
  ) {
    // Custom hooks that require Editor context
    const multiPage: UseMultiPageReturn = useMultiPage({
      onPageChange: pageId => {
        console.log('Page changed to:', pageId)
      },
      onPagesUpdate: pages => {
        console.log('Pages updated:', pages.length)
      },
    })

    const zoom: UseZoomReturn = useZoom({
      initialZoom: 1,
      onZoomChange: zoomLevel => {
        console.log('Zoom changed to:', zoomLevel)
      },
    })

    const deviceMode: UseDeviceModeReturn = useDeviceMode({
      initialMode: 'desktop',
      onModeChange: mode => {
        console.log('Device mode changed to:', mode)
      },
    })

    const exportImport: UseExportImportReturn = useExportImport()
    const [activeLeftTab, setActiveLeftTab] = useState<'pages' | 'components'>(
      'pages'
    )

    // History hook for undo/redo functionality
    const history: UseHistoryReturn = useHistory({
      maxHistorySize: 50,
      debounceDelay: 500,
      onHistoryChange: (canUndo, canRedo) => {
        console.log('History changed:', { canUndo, canRedo })
      },
    })

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        getCurrentData: () => exportImport.getCurrentPageData(),
      }),
      [exportImport]
    )

    // Template renderer hook
    const templateRenderer = useTemplateRenderer({
      onTemplateLoaded: templateId => {
        console.log('✅ Template loaded successfully:', templateId)
        setShowTemplateManager(false)

        // If this is a multi-page template, automatically show the pages tab
        if (multiPage.pages.length > 1) {
          setShowPagesTab(true)
          console.log('📄 Multi-page template detected, showing pages tab')
        }
      },
      onTemplateError: error => {
        console.error('❌ Template loading error:', error)
        alert('Failed to load template: ' + error)
      },
      autoLoadFromStorage: true, // Auto-load template from storage (useful for wizard flow)
      multiPageHook: {
        loadPages: pages => {
          multiPage.loadPages(pages)

          // Automatically show pages tab for multi-page templates
          if (pages.length > 1) {
            setShowPagesTab(true)
            console.log('📄 Multi-page template loaded, showing pages tab')
          }
        },
      },
    })

    // Handle left sidebar toggle - allow independent toggling
    const handleLeftSidebarToggle = () => {
      setShowLeftSidebar(!showLeftSidebar)
    }

    // Handle asset upload
    const handleAssetUpload = useCallback(
      async (files: FileList): Promise<Asset[]> => {
        const uploadedAssets: Asset[] = []

        for (let i = 0; i < files.length; i++) {
          const file = files[i]

          // Create a temporary URL for the file
          const url = URL.createObjectURL(file)

          // Get image dimensions if it's an image
          let dimensions
          if (file.type.startsWith('image/')) {
            dimensions = await new Promise<{ width: number; height: number }>(
              resolve => {
                const img = new Image()
                img.onload = () => {
                  resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                  })
                }
                img.src = url
              }
            )
          }

          const asset: Asset = {
            id: `asset-${Date.now()}-${i}`,
            name: file.name,
            url,
            type: file.type.startsWith('image/')
              ? 'image'
              : file.type.startsWith('video/')
                ? 'video'
                : 'document',
            size: file.size,
            dimensions,
            createdAt: new Date(),
            tags: [],
          }

          uploadedAssets.push(asset)
        }

        setAssets(prev => [...prev, ...uploadedAssets])
        return uploadedAssets
      },
      []
    )

    // Handle export
    const handleExport = useCallback(
      async (format: 'pdf' | 'png' | 'json' | 'html') => {
        try {
          const canvasElement = zoom.canvasRef.current
          if (!canvasElement) {
            console.error('Canvas element not found')
            throw new Error('Canvas element not available for export')
          }

          switch (format) {
            case 'png':
              await exportImport.exportAsPNG(canvasElement, {
                filename: multiPage.currentPage?.name || 'page',
              })
              break

            case 'pdf':
              const allPages = multiPage.getAllPagesData()
              if (!multiPage.currentPage) {
                throw new Error('No current page available for PDF export')
              }
              await exportImport.exportAsPDF(
                [multiPage.currentPage],
                [canvasElement],
                { filename: 'document' }
              )
              break

            case 'json':
              const pagesData = multiPage.getAllPagesData()
              if (!pagesData || pagesData.length === 0) {
                throw new Error('No page data available for JSON export')
              }
              exportImport.exportAsJSON(pagesData, {
                filename: 'pages-data',
              })
              break

            case 'html':
              const htmlPages = multiPage.getAllPagesData()
              if (!htmlPages || htmlPages.length === 0) {
                throw new Error('No page data available for HTML export')
              }
              exportImport.exportAsHTML(htmlPages, {
                filename: 'pages',
              })
              break

            default:
              throw new Error(`Unsupported export format: ${format}`)
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown export error'
          console.error('Export failed:', errorMessage)
          // You could add a toast notification here
          throw error // Re-throw to allow caller to handle
        }
      },
      [exportImport, multiPage, zoom.canvasRef]
    )

    // Handle import
    const handleImport = useCallback(() => {
      exportImport.triggerImport(async (file: File) => {
        try {
          if (!file) {
            throw new Error('No file selected for import')
          }

          if (!file.name.endsWith('.json')) {
            throw new Error('Only JSON files are supported for import')
          }

          const pages = await exportImport.importFromJSON(file)
          if (!pages || pages.length === 0) {
            throw new Error('No valid page data found in the imported file')
          }

          // Use addPages instead of loadPages to add imported pages to existing ones
          multiPage.addPages(pages, true)
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown import error'
          console.error('Import failed:', errorMessage)
          // You could add a toast notification here
          throw error // Re-throw to allow caller to handle
        }
      })
    }, [exportImport, multiPage])

    // Handle template loading - now using the unified template renderer
    const handleTemplateLoad = useCallback(
      (template: Template) => {
        templateRenderer.loadTemplate(template.id)
      },
      [templateRenderer]
    )

    // Handle template saving
    const handleTemplateSave = useCallback(
      (name: string, description: string, category: string, tags: string[]) => {
        try {
          if (!name || name.trim() === '') {
            throw new Error('Template name is required')
          }

          const currentData = exportImport.getCurrentPageData()
          if (!currentData) {
            throw new Error('No page data available to save as template')
          }

          console.log('Template saved:', {
            name,
            description,
            category,
            tags,
            data: currentData,
          })
          // The TemplateManager handles the actual saving to localStorage
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Unknown template saving error'
          console.error('Template saving failed:', errorMessage)
          // You could add a toast notification here
          throw error // Re-throw to allow caller to handle
        }
      },
      [exportImport]
    )

    // Handle asset insertion
    const handleAssetInsert = useCallback((asset: Asset) => {
      // This would typically insert an image block with the asset URL
      console.log('Insert asset:', asset)
      setShowAssetManager(false)
    }, [])

    // Auto-save functionality
    useEffect(() => {
      const interval = setInterval(() => {
        if (!isPreviewMode) {
          multiPage.scheduleAutoSave()
        }
      }, 5000) // Auto-save every 5 seconds

      return () => clearInterval(interval)
    }, [isPreviewMode, multiPage])

    // Track if we've already loaded initial data to avoid repeated deserialization
    const hasLoadedInitialDataRef = useRef(false)

    // Load initial data (run once per initialData value)
    useEffect(() => {
      console.log('🎯 CraftJSEditor useEffect triggered:', {
        initialDataExists: !!initialData,
        initialDataType: typeof initialData,
        initialDataLength: initialData?.length,
        exportImportExists: !!exportImport,
        multiPageExists: !!multiPage,
        currentPagesCount: multiPage.pages.length,
        currentPageNames: multiPage.pages.map(p => p.name),
      })

      // Avoid re-running if we've already processed the same initialData
      // Also check if we already have multiple pages loaded (indicating data was already processed)
      if (
        initialData &&
        !hasLoadedInitialDataRef.current &&
        multiPage.pages.length === 1 &&
        multiPage.pages[0].name === 'Page 1' &&
        multiPage.pages[0].data === '{}'
      ) {
        try {
          console.log('🔍 Processing initialData:', {
            data: initialData,
            dataType: typeof initialData,
            dataLength: initialData.length,
          })

          if (typeof initialData !== 'string') {
            throw new Error('Initial data must be a valid JSON string')
          }

          // Validate JSON format
          const parsedData = JSON.parse(initialData)
          console.log('✅ JSON validation passed:', {
            parsedDataKeys: Array.isArray(parsedData)
              ? 'Array'
              : Object.keys(parsedData),
            hasRoot: !!parsedData.ROOT,
            isArray: Array.isArray(parsedData),
            arrayLength: Array.isArray(parsedData) ? parsedData.length : 'N/A',
          })

          // Check if this is multi-page data (array of pages)
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            console.log(
              '📄 Multi-page data detected with',
              parsedData.length,
              'pages'
            )
            console.log(
              '🚀 Loading multi-page data using multiPage.loadPages...'
            )

            // Convert array data to Page objects (ensure we use pageData.data)
            const pages = parsedData.map((pageData: any, index: number) => ({
              id: pageData.id ?? `page-${index + 1}`,
              name: pageData.name ?? `Page ${index + 1}`,
              data:
                typeof pageData.data === 'string'
                  ? pageData.data
                  : JSON.stringify(pageData.data ?? {}),
              createdAt: pageData.createdAt
                ? new Date(pageData.createdAt)
                : new Date(),
              updatedAt: pageData.updatedAt
                ? new Date(pageData.updatedAt)
                : new Date(),
              thumbnail: pageData.thumbnail,
            }))

            console.log(
              '📦 Loading',
              pages.length,
              'pages:',
              pages.map(p => p.name)
            )

            multiPage.loadPages(pages)
            setShowPagesTab(true) // Show pages tab for multi-page content
            console.log('✅ Multi-page data loaded successfully')
          } else {
            // Single page data
            console.log('📄 Single-page data detected')
            console.log('🚀 Calling exportImport.loadPageData...')
            exportImport.loadPageData(initialData)
            console.log('✅ Single-page data loaded successfully')
          }

          // Mark as loaded to prevent repeated effect runs
          hasLoadedInitialDataRef.current = true
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Unknown error loading initial data'
          console.error('❌ Failed to load initial data:', errorMessage)
          console.error('❌ Error details:', error)
          // You could add a toast notification here to inform the user
        }
      } else {
        console.log('⚠️ No initialData provided to CraftJSEditor')
      }
      // Depend only on the initialData value and stable hook functions
    }, [
      initialData,
      exportImport.loadPageData,
      multiPage.loadPages,
      multiPage.pages,
      setShowPagesTab,
    ])

    return (
      <>
        {/* Top Toolbar - Canva Style */}
        <CanvaToolbar
          onSave={() => {
            // For multipage: save all pages data, for single page: save current page data
            if (multiPage.pages.length > 1) {
              // Save current page data first, then get all pages data
              const currentPageData = exportImport.getCurrentPageData()
              if (multiPage.currentPageId) {
                multiPage.updatePageData(
                  multiPage.currentPageId,
                  currentPageData
                )
              }

              // Get all pages data and serialize it for saving
              const allPagesData = multiPage.getAllPagesData()
              console.log(
                '💾 Saving multipage data with',
                allPagesData.length,
                'pages'
              )
              const serializedData = JSON.stringify(allPagesData)
              onSave?.(serializedData)
            } else {
              // Single page mode - save current page data only
              const data = exportImport.getCurrentPageData()
              onSave?.(data)
              if (multiPage.currentPageId) {
                multiPage.updatePageData(multiPage.currentPageId, data)
              }
            }
          }}
          onExport={handleExport}
          onImport={handleImport}
          onUndo={history.undo}
          onRedo={history.redo}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          onZoomIn={zoom.zoomIn}
          onZoomOut={zoom.zoomOut}
          onResetZoom={zoom.resetZoom}
          onFitToScreen={zoom.fitToScreen}
          zoom={zoom.zoom}
          onDeviceModeChange={deviceMode.switchMode}
          deviceMode={deviceMode.currentMode}
          onPreviewModeToggle={() => setIsPreviewMode(!isPreviewMode)}
          previewMode={isPreviewMode}
          templateName={templateName}
          backButton={backButton}
        />

        <div className="flex h-full min-h-0 flex-1 overflow-hidden">
          {/* Left Sidebar - Canva Style */}
          <CanvaSidebar
            onShowAssetManager={() => setShowAssetManager(true)}
            onShowTemplateManager={() => setShowTemplateManager(true)}
            onHideInspector={() => setInspectorCollapsed(true)}
            multiPage={multiPage}
          />

          {/* Main Canvas Area */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Canvas Container - Simplified for focused zoom */}
            <div className="flex-1 overflow-hidden bg-gray-50">
              <Canvas
                zoom={zoom}
                deviceMode={deviceMode}
                isPreviewMode={isPreviewMode}
              />
            </div>
          </div>

          {/* Right Sidebar - Inspector Panel */}
          {showInspector && (
            <div
              className={`${inspectorCollapsed ? 'w-0' : 'w-72 '} relative bg-white transition-all duration-200`}
            >
              <InspectorPanel
                isCollapsed={inspectorCollapsed}
                onToggle={() => setInspectorCollapsed(!inspectorCollapsed)}
              />
            </div>
          )}
        </div>

        {/* Asset Manager Modal */}
        <AssetManager
          assets={assets}
          onAssetUpload={handleAssetUpload}
          onAssetDelete={assetId => {
            setAssets(prev => prev.filter(asset => asset.id !== assetId))
          }}
          onAssetSelect={asset => {
            console.log('Select asset:', asset)
          }}
          onAssetInsert={handleAssetInsert}
          isOpen={showAssetManager}
          onClose={() => setShowAssetManager(false)}
        />

        {/* Template Manager Modal */}
        {showTemplateManager && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 flex h-5/6 w-full max-w-6xl flex-col rounded-lg bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <h2 className="text-lg font-semibold">Template Manager</h2>
                <button
                  onClick={() => setShowTemplateManager(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <TemplateManager
                  onLoadTemplate={handleTemplateLoad}
                  onSaveTemplate={handleTemplateSave}
                  currentData={exportImport.getCurrentPageData()}
                />
              </div>
            </div>
          </div>
        )}
      </>
    )
  }
)

// EditorContent component that wraps the Editor and renders EditorInner inside
const EditorContent = React.forwardRef<
  CraftJSEditorRef,
  {
    showLeftSidebar: boolean
    setShowLeftSidebar: (value: boolean) => void
    setInspectorCollapsed: (value: boolean) => void
    inspectorCollapsed: boolean
    isPreviewMode: boolean
    setIsPreviewMode: (value: boolean) => void
    showAssetManager: boolean
    setShowAssetManager: (value: boolean) => void
    showLayers: boolean
    setShowLayers: (value: boolean) => void
    showTemplateManager: boolean
    setShowTemplateManager: (value: boolean) => void
    showPagesTab: boolean
    setShowPagesTab: (value: boolean) => void
    showInspector: boolean
    setShowInspector: (value: boolean) => void
    assets: Asset[]
    setAssets: React.Dispatch<React.SetStateAction<Asset[]>>
    onSave?: (data: string) => void
    initialData?: string
    className?: string
    templateName?: string
    backButton?: {
      href: string
      catalogueName: string
    }
  }
>(function EditorContent(props, ref) {
  return (
    <div className={`flex h-full flex-col bg-gray-50 ${props.className || ''}`}>
      <Editor
        resolver={{
          // Current component names
          TextBlock,
          HeadingBlock,
          ButtonBlock,
          ImageBlock,
          ContainerBlock,
          DividerBlock,
          SpacerBlock,
          VideoBlock,
          IconBlock,
          GridBlock,
          FlexboxBlock,
          TabsBlock,
          AccordionBlock,
          CarouselBlock,
          FormBlock,

          // Legacy aliases for deserialization compatibility
          // These map old resolvedName values found in templates to current components
          Container: ContainerBlock,
          Text: TextBlock,
          Heading: HeadingBlock,
          Button: ButtonBlock,
          Image: ImageBlock,
          Divider: DividerBlock,
          Spacer: SpacerBlock,
          Video: VideoBlock,
          Icon: IconBlock,
          Grid: GridBlock,
          Flexbox: FlexboxBlock,
          Tabs: TabsBlock,
          Accordion: AccordionBlock,
          Carousel: CarouselBlock,
          Form: FormBlock,
        }}
        enabled={!props.isPreviewMode}
        onRender={({ render }) => render}
      >
        <EditorInner
          ref={ref}
          isPreviewMode={props.isPreviewMode}
          setIsPreviewMode={props.setIsPreviewMode}
          showAssetManager={props.showAssetManager}
          setShowAssetManager={props.setShowAssetManager}
          showLeftSidebar={props.showLeftSidebar}
          setShowLeftSidebar={props.setShowLeftSidebar}
          showLayers={props.showLayers}
          setShowLayers={props.setShowLayers}
          showTemplateManager={props.showTemplateManager}
          setShowTemplateManager={props.setShowTemplateManager}
          showPagesTab={props.showPagesTab}
          setShowPagesTab={props.setShowPagesTab}
          showInspector={props.showInspector}
          setShowInspector={props.setShowInspector}
          inspectorCollapsed={props.inspectorCollapsed}
          setInspectorCollapsed={props.setInspectorCollapsed}
          assets={props.assets}
          setAssets={props.setAssets}
          onSave={props.onSave}
          initialData={props.initialData}
          templateName={props.templateName}
          backButton={props.backButton}
        />
      </Editor>
    </div>
  )
})

// Main component that manages state and wraps EditorContent
export const CraftJSEditor = React.forwardRef<
  CraftJSEditorRef,
  CraftJSEditorProps
>(function CraftJSEditor(
  {
    initialData,
    onSave,
    className = '',
    initialPreviewMode = false,
    templateName,
    backButton,
  },
  ref
) {
  const [isPreviewMode, setIsPreviewMode] = useState(initialPreviewMode)
  const [showAssetManager, setShowAssetManager] = useState(false)
  // Changed: Sidebars hidden by default for minimal interface
  const [showLeftSidebar, setShowLeftSidebar] = useState(false)
  const [showLayers, setShowLayers] = useState(false)
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [showPagesTab, setShowPagesTab] = useState(false)
  // Changed: Inspector hidden by default for minimal interface
  const [showInspector, setShowInspector] = useState(false)
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([])

  // Auto-show/hide inspector based on preview mode
  React.useEffect(() => {
    if (!isPreviewMode) {
      setShowInspector(true)
      setInspectorCollapsed(true) // Start collapsed by default in edit mode
      setShowLeftSidebar(true) // Also show left sidebar for better editing experience
    } else {
      setShowInspector(false) // Hide inspector in preview mode
    }
  }, [isPreviewMode])

  return (
    <EditorContent
      ref={ref}
      isPreviewMode={isPreviewMode}
      setIsPreviewMode={setIsPreviewMode}
      showAssetManager={showAssetManager}
      setShowAssetManager={setShowAssetManager}
      showLeftSidebar={showLeftSidebar}
      setShowLeftSidebar={setShowLeftSidebar}
      showLayers={showLayers}
      setShowLayers={setShowLayers}
      showTemplateManager={showTemplateManager}
      setShowTemplateManager={setShowTemplateManager}
      showPagesTab={showPagesTab}
      setShowPagesTab={setShowPagesTab}
      showInspector={showInspector}
      setShowInspector={setShowInspector}
      inspectorCollapsed={inspectorCollapsed}
      setInspectorCollapsed={setInspectorCollapsed}
      assets={assets}
      setAssets={setAssets}
      onSave={onSave}
      initialData={initialData}
      className={className}
      templateName={templateName}
      backButton={backButton}
    />
  )
})
