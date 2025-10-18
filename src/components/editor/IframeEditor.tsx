'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FileText, Layers as LayersIcon, Shapes, Type, Upload, Palette, Star, ChevronRight, ChevronDown, ChevronLeft, Trash2, Copy, ChevronUp, Edit3, Settings, Sparkles, Image, Move3D, Circle, Tag, LayoutGrid } from 'lucide-react'
import { HtmlTemplates } from './iframe-templates'
import Mustache from 'mustache'
import html2canvas from 'html2canvas'

export type IframePage = {
  id: string
  name: string
  html: string
  css?: string
  createdAt?: Date
  updatedAt?: Date
}

export type PrebuiltTemplate = {
  id: string
  name: string
  engine: 'mustache' | 'handlebars'
  pages: IframePage[]
  sharedCss?: string
}

type LiveData = Record<string, any>
// Sidebar palette element types for drag-and-drop insertion
type PaletteElementType =
  | 'heading'
  | 'paragraph'
  | 'button'
  | 'input'
  | 'image'
  | 'icon'
  | 'container'
  | 'divider'
  | 'columns-2'
  | 'columns-3'
  | 'hero'
  | 'gallery'
  | 'product-card'

interface IframeEditorProps {
  template: PrebuiltTemplate
  initialData?: LiveData
  onLiveDataChange?: (data: LiveData) => void
  // Optional style mutation persistence
  initialStyleMutations?: Record<string, Partial<CSSStyleDeclaration>>
  onStyleMutationsChange?: (mutations: Record<string, Partial<CSSStyleDeclaration>>) => void
  // Allow parent to grab iframe element for export/print
  registerIframeGetter?: (getter: () => HTMLIFrameElement | null) => void
  // Preview mode: disable interactions and hide sidebars when true
  previewMode?: boolean
  onTemplateIdChange?: (id: string) => void
  // Database persistence
  catalogueId?: string
  autoSave?: boolean
  autoSaveInterval?: number // in milliseconds, default 5000
  onSaveSuccess?: () => void
  onSaveError?: (error: string) => void
  onIframeReady?: () => void // Callback when iframe is fully loaded with content
  // Optional: expose editor controls to parent toolbar
  registerEditorControls?: (controls: {
    undo: () => void
    redo: () => void
    zoomIn: () => void
    zoomOut: () => void
    setZoom: (z: number) => void
    getZoom: () => number
    toggleGrid: () => void
    setGrid: (v: boolean) => void
    getGrid: () => boolean
    hasUndo: () => boolean
    hasRedo: () => boolean
    print: () => void
    exportHTML: () => void
    exportJSON: () => void
    exportPDF: () => Promise<void>
    exportPNG: () => Promise<void>
    // Page navigation and info
    getPages: () => IframePage[]
    getCurrentPageIndex: () => number
    setCurrentPageIndex: (i: number) => void
    goPrev: () => void
    goNext: () => void
    // Manual save function
    saveToDatabase: () => Promise<void>
  }) => void
}

/**
 * Minimal iframe-based editor for user-side editing of prebuilt templates.
 * MVP features:
 * - Multi-page navigation
 * - Live data inputs bound to Mustache placeholders
 * - Render pages inside a sandboxed iframe via srcdoc
 */
export default function IframeEditor({
  template,
  initialData,
  onLiveDataChange,
  initialStyleMutations,
  onStyleMutationsChange,
  registerIframeGetter,
  previewMode = false,
  onTemplateIdChange,
  catalogueId,
  autoSave = true,
  autoSaveInterval = 5000,
  onSaveSuccess,
  onSaveError,
  onIframeReady,
  registerEditorControls
}: IframeEditorProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)
  const [activeLeftTab, setActiveLeftTab] = useState<'pages' | 'layers' | 'elements' | 'text' | 'assets' | 'icons' | null>(null)
  const [rightTab, setRightTab] = useState<'content' | 'style' | 'effects'>('style')
  const [liveData, setLiveData] = useState<LiveData>(initialData || {
    product: {
      title: 'Sample Product',
      price: '₹1,299',
      image: '/assets/heroImage.png',
      description: 'A brief product description goes here.'
    },
    profile: {
      companyName: 'Catfy Co.',
      tagline: 'Beautiful catalogues, simply built.'
    }
  })

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const stageContainerRef = useRef<HTMLDivElement>(null)
  const canvasWrapperRef = useRef<HTMLDivElement>(null)
  const leftSidebarRef = useRef<HTMLDivElement>(null)
  const rightSidebarRef = useRef<HTMLDivElement>(null)

  // Enable trackpad pinch-to-zoom when hovering over the canvas area
  useEffect(() => {
    const container = stageContainerRef.current
    if (!container) return
    const onWheel = (ev: WheelEvent) => {
      const target = ev.target as Node | null
      if (!target || !canvasWrapperRef.current) return
      // Only act when the wheel originates from within the canvas wrapper
      const overCanvas = canvasWrapperRef.current.contains(target)
      if (!overCanvas) return
      // Pinch gesture on most browsers sets ctrlKey=true; treat that as zoom intent
      if (ev.ctrlKey) {
        ev.preventDefault()
        const step = 0.06
        const direction = ev.deltaY < 0 ? 1 : -1
        setUserZoom((z) => Math.min(3, Math.max(0.5, z + direction * step)))
      }
    }
    container.addEventListener('wheel', onWheel, { passive: false })
    return () => container.removeEventListener('wheel', onWheel as any)
  }, [])
  const [styleMutations, setStyleMutations] = useState<Record<string, Partial<CSSStyleDeclaration>>>(initialStyleMutations || {})
  // Simple history stacks for undo/redo of style changes
  const [pastMutations, setPastMutations] = useState<Record<string, Partial<CSSStyleDeclaration>>[]>([])
  const [futureMutations, setFutureMutations] = useState<Record<string, Partial<CSSStyleDeclaration>>[]>([])
  const lastAppliedPathsRef = useRef<string[]>([])
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [selectedContent, setSelectedContent] = useState<string>('')
  const [isContentEditable, setIsContentEditable] = useState<boolean>(false)
  const [scale, setScale] = useState<number>(1)
  const [userZoom, setUserZoom] = useState<number>(1)
  const [showGrid, setShowGrid] = useState<boolean>(false)
  const [hoverStyles, setHoverStyles] = useState<Record<string, { backgroundColor?: string; color?: string }>>({})
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)
  const [currentStyles, setCurrentStyles] = useState<Record<string, string>>({})
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false)
  const [pagePreviews, setPagePreviews] = useState<Record<string, string>>({})
  const [selectedElementType, setSelectedElementType] = useState<string>('unknown')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  // Element UI Configuration for smart sidebar
  const ELEMENT_UI_CONFIG = {
    text: {
      content: [
        { group: "Content", icon: "Type", fields: ["text", "link"] },

      ],
      style: [
        { group: "Typography", icon: "Type", fields: ["fontFamily", "fontSize", "fontWeight", "color", "textAlign", "lineHeight", "letterSpacing"] },
        { group: "Background", icon: "Palette", fields: ["backgroundColor"] },
        { group: "Spacing", icon: "Move3D", fields: ["padding", "margin"] }
      ],
      effects: [
        { group: "Visual Effects", icon: "Sparkles", fields: ["boxShadow", "opacity", "transform"] }
      ]
    },
    image: {
      content: [
        { group: "Image Source", icon: "Image", fields: ["upload", "src", "alt"] },

      ],
      style: [
        { group: "Appearance", icon: "Settings", fields: ["objectFit", "borderRadius", "border"] },
        { group: "Size & Position", icon: "Move3D", fields: ["width", "height", "padding", "margin"] }
      ],
      effects: [
        { group: "Visual Effects", icon: "Sparkles", fields: ["boxShadow", "opacity", "filter"] }
      ]
    },
    button: {
      content: [
        { group: "Content", icon: "Type", fields: ["text", "link"] },

      ],
      style: [
        { group: "Colors", icon: "Palette", fields: ["backgroundColor", "color"] },
        { group: "Typography", icon: "Type", fields: ["fontFamily", "fontWeight", "fontSize"] },
        { group: "Shape", icon: "Circle", fields: ["borderRadius", "border"] },
        { group: "Spacing", icon: "Move3D", fields: ["padding", "margin"] }
      ],
      effects: [
        { group: "Visual Effects", icon: "Sparkles", fields: ["boxShadow", "hover", "transition"] }
      ]
    },
    container: {
      content: [
      ],
      style: [
        { group: "Background", icon: "Palette", fields: ["backgroundColor", "backgroundImage"] },
        { group: "Layout", icon: "LayoutGrid", fields: ["layout", "justifyContent", "alignItems", "gap"] },
        { group: "Shape", icon: "Circle", fields: ["border", "borderRadius"] },
        { group: "Spacing", icon: "Move3D", fields: ["padding", "margin"] }
      ],
      effects: [
        { group: "Visual Effects", icon: "Sparkles", fields: ["boxShadow", "backdrop", "overflow"] }
      ]
    },
    default: {
      content: [
        { group: "Content", icon: "Type", fields: ["text"] },

      ],
      style: [
        { group: "Appearance", icon: "Settings", fields: ["backgroundColor", "color", "border", "borderRadius"] },
        { group: "Typography", icon: "Type", fields: ["fontFamily", "fontSize", "fontWeight", "textAlign"] },
        { group: "Spacing", icon: "Move3D", fields: ["padding", "margin"] }
      ],
      effects: [
        { group: "Visual Effects", icon: "Sparkles", fields: ["boxShadow", "opacity"] }
      ]
    }
  }

  // Font options for custom dropdown
  const fontOptions = [
    { value: 'Inter, system-ui, Arial', label: 'Inter', description: 'Modern Sans-Serif', family: 'Inter, system-ui, Arial' },
    { value: 'Arial, Helvetica, sans-serif', label: 'Arial', description: 'Classic Sans-Serif', family: 'Arial, Helvetica, sans-serif' },
    { value: 'Helvetica Neue, Helvetica, sans-serif', label: 'Helvetica Neue', description: 'Clean Sans-Serif', family: 'Helvetica Neue, Helvetica, sans-serif' },
    { value: 'Roboto, sans-serif', label: 'Roboto', description: 'Google Font', family: 'Roboto, sans-serif' },
    { value: 'Open Sans, sans-serif', label: 'Open Sans', description: 'Friendly Sans-Serif', family: 'Open Sans, sans-serif' },
    { value: 'Lato, sans-serif', label: 'Lato', description: 'Professional Sans-Serif', family: 'Lato, sans-serif' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat', description: 'Geometric Sans-Serif', family: 'Montserrat, sans-serif' },
    { value: 'Poppins, sans-serif', label: 'Poppins', description: 'Rounded Sans-Serif', family: 'Poppins, sans-serif' },
    { value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro', description: 'Adobe Font', family: 'Source Sans Pro, sans-serif' },
    { value: 'Georgia, serif', label: 'Georgia', description: 'Classic Serif', family: 'Georgia, serif' },
    { value: 'Times New Roman, Times, serif', label: 'Times New Roman', description: 'Traditional Serif', family: 'Times New Roman, Times, serif' },
    { value: 'Playfair Display, serif', label: 'Playfair Display', description: 'Elegant Serif', family: 'Playfair Display, serif' },
    { value: 'Merriweather, serif', label: 'Merriweather', description: 'Readable Serif', family: 'Merriweather, serif' },
    { value: 'Crimson Text, serif', label: 'Crimson Text', description: 'Book Serif', family: 'Crimson Text, serif' },
    { value: 'Courier New, monospace', label: 'Courier New', description: 'Typewriter', family: 'Courier New, monospace' },
    { value: 'Monaco, Consolas, monospace', label: 'Monaco', description: 'Code Font', family: 'Monaco, Consolas, monospace' },
    { value: 'Source Code Pro, monospace', label: 'Source Code Pro', description: 'Modern Mono', family: 'Source Code Pro, monospace' },
    { value: 'Fira Code, monospace', label: 'Fira Code', description: 'Programming Font', family: 'Fira Code, monospace' },
    { value: 'Dancing Script, cursive', label: 'Dancing Script', description: 'Handwritten', family: 'Dancing Script, cursive' },
    { value: 'Lobster, cursive', label: 'Lobster', description: 'Display Script', family: 'Lobster, cursive' },
    { value: 'Pacifico, cursive', label: 'Pacifico', description: 'Brush Script', family: 'Pacifico, cursive' },
    { value: 'Oswald, sans-serif', label: 'Oswald', description: 'Condensed Sans-Serif', family: 'Oswald, sans-serif' },
    { value: 'Raleway, sans-serif', label: 'Raleway', description: 'Elegant Sans-Serif', family: 'Raleway, sans-serif' },
    { value: 'Nunito, sans-serif', label: 'Nunito', description: 'Rounded Sans-Serif', family: 'Nunito, sans-serif' },
  ]

  // Get selected font option
  const getSelectedFont = () => {
    const currentFont = currentStyles.fontFamily || 'Inter, system-ui, Arial'
    return fontOptions.find(font => font.value === currentFont) || fontOptions[0]
  }

  // Detect element type for smart sidebar
  const detectElementType = (tagName: string, element?: HTMLElement): string => {
    const tag = tagName.toLowerCase()

    // Text elements
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a'].includes(tag)) {
      return 'text'
    }

    // Image elements
    if (tag === 'img') {
      return 'image'
    }

    // Button elements
    if (tag === 'button' || (tag === 'a' && element?.classList.contains('btn'))) {
      return 'button'
    }

    // Container elements
    if (['div', 'section', 'article', 'main', 'aside', 'nav', 'header', 'footer'].includes(tag)) {
      return 'container'
    }

    return 'default'
  }

  // Get current element configuration
  const getCurrentElementConfig = () => {
    const config = ELEMENT_UI_CONFIG[selectedElementType as keyof typeof ELEMENT_UI_CONFIG]
    return config || ELEMENT_UI_CONFIG.default
  }

  // Toggle section expansion
  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }))
  }

  // Render smart section
  const renderSmartSection = (section: { group: string; icon: string; fields: string[] }, tabType: 'content' | 'style' | 'effects') => {
    const isExpanded = expandedSections[section.group] ?? true // Default to expanded

    // Map icon names to Lucide React components with colorful styling
    const getIconComponent = (iconName: string) => {
      switch (iconName) {
        case 'Type': return <Type className="w-4 h-4 text-blue-500" />
        case 'Image': return <Image className="w-4 h-4 text-green-500" />
        case 'Settings': return <Settings className="w-4 h-4 text-purple-500" />
        case 'Palette': return <Palette className="w-4 h-4 text-pink-500" />
        case 'Move3D': return <Move3D className="w-4 h-4 text-orange-500" />
        case 'Circle': return <Circle className="w-4 h-4 text-cyan-500" />
        case 'Tag': return <Tag className="w-4 h-4 text-indigo-500" />
        case 'LayoutGrid': return <LayoutGrid className="w-4 h-4 text-emerald-500" />
        case 'Sparkles': return <Sparkles className="w-4 h-4 text-yellow-500" />
        case 'Link': return <Type className="w-4 h-4 text-blue-600" />
        case 'Content': return <FileText className="w-4 h-4 text-slate-600" />
        default: return <Settings className="w-4 h-4 text-gray-500" />
      }
    }

    return (
      <div key={section.group} className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 overflow-hidden mb-3 shadow-sm hover:shadow-md transition-shadow duration-200">
        <button
          onClick={() => toggleSection(section.group)}
          className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 transition-all duration-200"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-lg bg-white shadow-sm">{getIconComponent(section.icon)}</span>
            <span className="text-xs font-semibold text-gray-800">{section.group}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {isExpanded && (
          <div className="p-3 pt-1 space-y-3 animate-in slide-in-from-top-2 duration-200 bg-gradient-to-br from-gray-50/30 to-white">
            {section.fields.map(field => renderSmartField(field, tabType))}
          </div>
        )}
      </div>
    )
  }

  // Render smart field based on field type
  const renderSmartField = (field: string, tabType: 'content' | 'style' | 'effects') => {
    switch (field) {
      case 'text':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Text Content</label>
            <textarea
              className="w-full h-20 border border-gray-300 rounded-lg px-2 py-2 text-xs bg-white resize-none"
              value={selectedContent}
              onChange={(e) => {
                const val = e.target.value
                setSelectedContent(val)
                const doc = iframeRef.current?.contentDocument
                if (!doc || !selectedPath) return
                const el = resolvePathToElement(doc, selectedPath)
                if (el) (el as HTMLElement).textContent = val
              }}
              placeholder="Enter your text..."
            />
          </div>
        )

      case 'link':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Link (Optional)</label>
            <input
              type="url"
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              placeholder="https://example.com"
              onChange={(e) => {
                const doc = iframeRef.current?.contentDocument
                if (!doc || !selectedPath) return
                const el = resolvePathToElement(doc, selectedPath)
                if (el && selectedTag === 'a') {
                  (el as HTMLAnchorElement).href = e.target.value
                }
              }}
            />
          </div>
        )

      case 'fontFamily':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Font Family</label>
            <div className="relative font-dropdown-container">
              <button
                type="button"
                onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm bg-white font-medium flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <div className="flex items-center space-x-2">
                  <span style={{ fontFamily: getSelectedFont().family, fontSize: '12px' }}>
                    {getSelectedFont().label}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${fontDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {fontDropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {fontOptions.map((font) => (
                    <button
                      key={font.value}
                      type="button"
                      onClick={() => {
                        updateSelectedStyles({ fontFamily: font.value })
                        setFontDropdownOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0 ${getSelectedFont().value === font.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                    >
                      <div style={{ fontFamily: font.family, fontSize: '13px' }}>
                        {font.label}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 'fontSize':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Font Size</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="8"
                max="72"
                value={currentStyles.fontSize ? parseInt(currentStyles.fontSize) : 16}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                onChange={(e) => updateSelectedStyles({ fontSize: `${e.target.value}px` })}
              />
              <input
                type="number"
                min="8"
                max="72"
                value={currentStyles.fontSize ? parseInt(currentStyles.fontSize) : 16}
                className="w-12 h-8 border border-gray-300 rounded px-1 text-xs text-center bg-white"
                onChange={(e) => updateSelectedStyles({ fontSize: `${e.target.value}px` })}
              />
            </div>
          </div>
        )

      case 'color':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentStyles.color || '#000000'}
                className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                onChange={(e) => updateSelectedStyles({ color: e.target.value })}
              />
              <input
                type="text"
                value={currentStyles.color || '#000000'}
                className="flex-1 h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
                onChange={(e) => updateSelectedStyles({ color: e.target.value })}
              />
            </div>
          </div>
        )

      case 'backgroundColor':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentStyles.backgroundColor || '#ffffff'}
                className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                onChange={(e) => updateSelectedStyles({ backgroundColor: e.target.value })}
              />
              <input
                type="text"
                value={currentStyles.backgroundColor || '#ffffff'}
                className="flex-1 h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
                onChange={(e) => updateSelectedStyles({ backgroundColor: e.target.value })}
              />
            </div>
          </div>
        )

      case 'fontWeight':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Font Weight</label>
            <select
              value={currentStyles.fontWeight || '400'}
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              onChange={(e) => updateSelectedStyles({ fontWeight: e.target.value as any })}
            >
              <option value="400">Regular</option>
              <option value="500">Medium</option>
              <option value="600">Semibold</option>
              <option value="700">Bold</option>
            </select>
          </div>
        )

      case 'textAlign':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Text Alignment</label>
            <div className="flex gap-1">
              {['left', 'center', 'right', 'justify'].map(align => (
                <button
                  key={align}
                  onClick={() => updateSelectedStyles({ textAlign: align })}
                  className={`flex-1 h-8 border border-gray-300 rounded text-xs capitalize ${currentStyles.textAlign === align ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-50'
                    }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>
        )

      case 'padding':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Padding (Inside Spacing)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={currentStyles.padding ? parseInt(currentStyles.padding) : 0}
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              onChange={(e) => updateSelectedStyles({ padding: `${e.target.value}px` })}
            />
          </div>
        )

      case 'margin':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Margin (Outside Spacing)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={currentStyles.margin ? parseInt(currentStyles.margin) : 0}
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              onChange={(e) => updateSelectedStyles({ margin: `${e.target.value}px` })}
            />
          </div>
        )

      case 'lineHeight':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Line Height</label>
            <input
              type="number"
              min="1"
              max="3"
              step="0.1"
              value={currentStyles.lineHeight ? parseFloat(currentStyles.lineHeight) : 1.5}
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              onChange={(e) => updateSelectedStyles({ lineHeight: e.target.value })}
            />
          </div>
        )

      case 'letterSpacing':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Letter Spacing</label>
            <input
              type="number"
              min="-2"
              max="10"
              step="0.1"
              value={currentStyles.letterSpacing ? parseFloat(currentStyles.letterSpacing) : 0}
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              onChange={(e) => updateSelectedStyles({ letterSpacing: `${e.target.value}px` })}
            />
          </div>
        )

      case 'upload':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Image Upload / Replace</label>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="image-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const doc = iframeRef.current?.contentDocument
                      if (!doc || !selectedPath) return
                      const el = resolvePathToElement(doc, selectedPath)
                      if (el && selectedTag === 'img') {
                        (el as HTMLImageElement).src = event.target?.result as string
                      }
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
              <label
                htmlFor="image-upload"
                className="flex-1 h-8 border border-gray-300 rounded-lg px-3 text-xs bg-white cursor-pointer flex items-center justify-center hover:bg-gray-50"
              >
                📤 Upload Image
              </label>
            </div>
          </div>
        )

      case 'src':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Image URL (Optional)</label>
            <input
              type="url"
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              placeholder="https://example.com/image.jpg"
              onChange={(e) => {
                const doc = iframeRef.current?.contentDocument
                if (!doc || !selectedPath) return
                const el = resolvePathToElement(doc, selectedPath)
                if (el && selectedTag === 'img') {
                  (el as HTMLImageElement).src = e.target.value
                }
              }}
            />
          </div>
        )

      case 'alt':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Alt Text</label>
            <input
              type="text"
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              placeholder="Describe the image..."
              onChange={(e) => {
                const doc = iframeRef.current?.contentDocument
                if (!doc || !selectedPath) return
                const el = resolvePathToElement(doc, selectedPath)
                if (el && selectedTag === 'img') {
                  (el as HTMLImageElement).alt = e.target.value
                }
              }}
            />
          </div>
        )

      case 'objectFit':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Image Fit</label>
            <select
              value={currentStyles.objectFit || 'cover'}
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              onChange={(e) => updateSelectedStyles({ objectFit: e.target.value as any })}
            >
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
              <option value="fill">Fill</option>
              <option value="none">None</option>
              <option value="scale-down">Scale Down</option>
            </select>
          </div>
        )

      case 'borderRadius':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Corner Radius</label>
            <input
              type="range"
              min="0"
              max="50"
              value={currentStyles.borderRadius ? parseInt(currentStyles.borderRadius) : 0}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              onChange={(e) => updateSelectedStyles({ borderRadius: `${e.target.value}px` })}
            />
            <div className="text-xs text-gray-500 mt-1">{currentStyles.borderRadius || '0px'}</div>
          </div>
        )

      case 'boxShadow':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Shadow</label>
            <select
              value={currentStyles.boxShadow && currentStyles.boxShadow !== 'none' ? 'custom' : 'none'}
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              onChange={(e) => {
                if (e.target.value === 'none') {
                  updateSelectedStyles({ boxShadow: 'none' })
                } else if (e.target.value === 'small') {
                  updateSelectedStyles({ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' })
                } else if (e.target.value === 'medium') {
                  updateSelectedStyles({ boxShadow: '0 4px 8px rgba(0,0,0,0.15)' })
                } else if (e.target.value === 'large') {
                  updateSelectedStyles({ boxShadow: '0 8px 16px rgba(0,0,0,0.2)' })
                }
              }}
            >
              <option value="none">No Shadow</option>
              <option value="small">Small Shadow</option>
              <option value="medium">Medium Shadow</option>
              <option value="large">Large Shadow</option>
            </select>
          </div>
        )

      case 'border':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Border</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="0"
                max="10"
                placeholder="Width"
                value={currentStyles.borderWidth ? parseInt(currentStyles.borderWidth) : 0}
                className="h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
                onChange={(e) => updateSelectedStyles({ borderWidth: `${e.target.value}px` })}
              />
              <select
                value={currentStyles.borderStyle || 'solid'}
                className="h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
                onChange={(e) => updateSelectedStyles({ borderStyle: e.target.value as any })}
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
              <input
                type="color"
                value={currentStyles.borderColor || '#000000'}
                className="h-8 border border-gray-300 rounded cursor-pointer"
                onChange={(e) => updateSelectedStyles({ borderColor: e.target.value })}
              />
            </div>
          </div>
        )

      case 'width':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Width</label>
            <input
              type="range"
              min="50"
              max="800"
              value={currentStyles.width ? parseInt(currentStyles.width) : 200}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              onChange={(e) => updateSelectedStyles({ width: `${e.target.value}px` })}
            />
            <div className="text-xs text-gray-500 mt-1">{currentStyles.width || 'auto'}</div>
          </div>
        )

      case 'height':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Height</label>
            <input
              type="range"
              min="50"
              max="600"
              value={currentStyles.height ? parseInt(currentStyles.height) : 200}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              onChange={(e) => updateSelectedStyles({ height: `${e.target.value}px` })}
            />
            <div className="text-xs text-gray-500 mt-1">{currentStyles.height || 'auto'}</div>
          </div>
        )

      case 'label':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Section Label / ID</label>
            <input
              type="text"
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              placeholder="Section name..."
              onChange={(e) => {
                const doc = iframeRef.current?.contentDocument
                if (!doc || !selectedPath) return
                const el = resolvePathToElement(doc, selectedPath)
                if (el) {
                  el.setAttribute('data-label', e.target.value)
                }
              }}
            />
          </div>
        )

      case 'id':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Element ID</label>
            <input
              type="text"
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              placeholder="unique-id"
              onChange={(e) => {
                const doc = iframeRef.current?.contentDocument
                if (!doc || !selectedPath) return
                const el = resolvePathToElement(doc, selectedPath)
                if (el) {
                  (el as HTMLElement).id = e.target.value
                }
              }}
            />
          </div>
        )

      case 'backgroundImage':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Background Image</label>
            <input
              type="url"
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              placeholder="https://example.com/bg.jpg"
              onChange={(e) => {
                const value = e.target.value
                updateSelectedStyles({
                  backgroundImage: value ? `url(${value})` : 'none'
                })
              }}
            />
          </div>
        )

      case 'layout':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Layout</label>
            <div className="flex gap-1">
              {[
                { value: 'flex', label: 'Flex' },
                { value: 'grid', label: 'Grid' },
                { value: 'block', label: 'Block' }
              ].map(layout => (
                <button
                  key={layout.value}
                  onClick={() => updateSelectedStyles({ display: layout.value })}
                  className={`flex-1 h-8 border border-gray-300 rounded text-xs ${currentStyles.display === layout.value ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-50'
                    }`}
                >
                  {layout.label}
                </button>
              ))}
            </div>
          </div>
        )

      case 'justifyContent':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Horizontal Alignment</label>
            <select
              value={currentStyles.justifyContent || 'flex-start'}
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              onChange={(e) => updateSelectedStyles({ justifyContent: e.target.value as any })}
            >
              <option value="flex-start">Left</option>
              <option value="center">Center</option>
              <option value="flex-end">Right</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
            </select>
          </div>
        )

      case 'alignItems':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Vertical Alignment</label>
            <select
              value={currentStyles.alignItems || 'flex-start'}
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              onChange={(e) => updateSelectedStyles({ alignItems: e.target.value as any })}
            >
              <option value="flex-start">Top</option>
              <option value="center">Center</option>
              <option value="flex-end">Bottom</option>
              <option value="stretch">Stretch</option>
            </select>
          </div>
        )

      case 'gap':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Spacing (Gap between children)</label>
            <input
              type="range"
              min="0"
              max="50"
              value={currentStyles.gap ? parseInt(currentStyles.gap) : 0}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              onChange={(e) => updateSelectedStyles({ gap: `${e.target.value}px` })}
            />
            <div className="text-xs text-gray-500 mt-1">{currentStyles.gap || '0px'}</div>
          </div>
        )

      case 'opacity':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={currentStyles.opacity ? parseFloat(currentStyles.opacity) : 1}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              onChange={(e) => updateSelectedStyles({ opacity: e.target.value })}
            />
            <div className="text-xs text-gray-500 mt-1">{Math.round((parseFloat(currentStyles.opacity || '1') * 100))}%</div>
          </div>
        )

      case 'transform':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Transform</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] text-gray-500 mb-1">Rotate (deg)</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={0}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  onChange={(e) => updateSelectedStyles({ transform: `rotate(${e.target.value}deg)` })}
                />
              </div>
              <div>
                <label className="block text-[9px] text-gray-500 mb-1">Scale</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={1}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  onChange={(e) => updateSelectedStyles({ transform: `scale(${e.target.value})` })}
                />
              </div>
            </div>
          </div>
        )

      case 'filter':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Image Filter</label>
            <select
              value="none"
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              onChange={(e) => {
                const filterValue = e.target.value === 'none' ? 'none' : e.target.value
                updateSelectedStyles({ filter: filterValue })
              }}
            >
              <option value="none">No Filter</option>
              <option value="blur(2px)">Blur</option>
              <option value="brightness(1.2)">Bright</option>
              <option value="contrast(1.2)">High Contrast</option>
              <option value="grayscale(1)">Grayscale</option>
              <option value="sepia(1)">Sepia</option>
              <option value="saturate(1.5)">Saturated</option>
            </select>
          </div>
        )

      case 'hover':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Hover Effects</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] text-gray-500 mb-1">Hover Background</label>
                <input
                  type="color"
                  className="w-full h-6 border border-gray-300 rounded cursor-pointer"
                  onChange={(e) => updateHoverStyles({ backgroundColor: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[9px] text-gray-500 mb-1">Hover Text</label>
                <input
                  type="color"
                  className="w-full h-6 border border-gray-300 rounded cursor-pointer"
                  onChange={(e) => updateHoverStyles({ color: e.target.value })}
                />
              </div>
            </div>
          </div>
        )

      case 'transition':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Transition Duration</label>
            <select
              value={currentStyles.transitionDuration || '300ms'}
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              onChange={(e) => updateSelectedStyles({
                transitionDuration: e.target.value,
                transitionProperty: 'all',
                transitionTimingFunction: 'ease-in-out'
              })}
            >
              <option value="150ms">Fast (150ms)</option>
              <option value="300ms">Normal (300ms)</option>
              <option value="500ms">Slow (500ms)</option>
              <option value="1000ms">Very Slow (1s)</option>
            </select>
          </div>
        )

      case 'backdrop':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Backdrop Filter</label>
            <select
              value="none"
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              onChange={(e) => {
                const backdropValue = e.target.value === 'none' ? 'none' : e.target.value
                updateSelectedStyles({ backdropFilter: backdropValue })
              }}
            >
              <option value="none">No Backdrop</option>
              <option value="blur(10px)">Blur Background</option>
              <option value="brightness(0.8)">Darken Background</option>
              <option value="brightness(1.2)">Brighten Background</option>
              <option value="saturate(1.5)">Saturate Background</option>
            </select>
          </div>
        )

      case 'overflow':
        return (
          <div key={field}>
            <label className="block text-[11px] text-gray-600 mb-1">Content Overflow</label>
            <select
              value={currentStyles.overflow || 'visible'}
              className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs bg-white"
              onChange={(e) => updateSelectedStyles({ overflow: e.target.value as any })}
            >
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
              <option value="scroll">Scroll</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        )



      default:
        return null
    }
  }

  // Close font dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontDropdownOpen) {
        const target = event.target as Element
        if (!target.closest('.font-dropdown-container')) {
          setFontDropdownOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [fontDropdownOpen])

  // Generate preview thumbnails for pages
  const generatePagePreview = async (pageHtml: string, pageId: string) => {
    try {
      // If this is the current page, capture from the main iframe
      if (pageId === currentPage?.id && iframeRef.current?.contentDocument) {
        const mainDoc = iframeRef.current.contentDocument
        const canvas = await html2canvas(mainDoc.body, {
          width: 800,
          height: 600,
          scale: 0.25, // Small scale for thumbnail
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        })

        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7)

        setPagePreviews(prev => ({
          ...prev,
          [pageId]: thumbnailDataUrl
        }))
        return
      }

      // For non-current pages, create a temporary iframe with the compiled HTML
      const compiledHtml = Mustache.render(pageHtml, liveData)

      const tempIframe = document.createElement('iframe')
      tempIframe.style.width = '800px'
      tempIframe.style.height = '600px'
      tempIframe.style.position = 'absolute'
      tempIframe.style.left = '-9999px'
      tempIframe.style.top = '-9999px'
      tempIframe.sandbox.add('allow-same-origin')

      document.body.appendChild(tempIframe)

      const doc = tempIframe.contentDocument
      if (!doc) return

      // Write the compiled HTML with styles
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              ${template.sharedCss || ''}
              body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
            </style>
          </head>
          <body>
            ${compiledHtml}
          </body>
        </html>
      `

      doc.open()
      doc.write(fullHtml)
      doc.close()

      // Wait for content to load and fonts to render
      await new Promise(resolve => setTimeout(resolve, 800))

      // Create canvas and capture the content
      const canvas = await html2canvas(doc.body, {
        width: 800,
        height: 600,
        scale: 0.25, // Small scale for thumbnail
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7)

      // Clean up
      document.body.removeChild(tempIframe)

      // Update state
      setPagePreviews(prev => ({
        ...prev,
        [pageId]: thumbnailDataUrl
      }))
    } catch (error) {
      console.error('Failed to generate page preview:', error)
    }
  }

  // Refresh preview for current page when changes are made
  const refreshCurrentPagePreview = () => {
    if (currentPage?.id) {
      generatePagePreview(currentPage.html, currentPage.id)
    }
  }

  // Refresh all page previews
  const refreshAllPreviews = () => {
    pages.forEach(page => {
      generatePagePreview(page.html, page.id)
    })
  }

  // Function to get current computed styles of selected element
  const getCurrentElementStyles = (element: HTMLElement): Record<string, string> => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return {}
    const iframeWindow = iframeRef.current?.contentWindow
    if (!iframeWindow) return {}

    const computedStyles = iframeWindow.getComputedStyle(element)
    return {
      // Typography
      color: element.style.color || rgbToHex(computedStyles.color) || '#000000',
      fontSize: element.style.fontSize || computedStyles.fontSize,
      fontFamily: element.style.fontFamily || computedStyles.fontFamily,
      fontWeight: element.style.fontWeight || computedStyles.fontWeight,
      lineHeight: element.style.lineHeight || computedStyles.lineHeight,
      letterSpacing: element.style.letterSpacing || computedStyles.letterSpacing,
      // Dimensions
      width: element.style.width || (computedStyles.width !== 'auto' ? computedStyles.width : ''),
      height: element.style.height || (computedStyles.height !== 'auto' ? computedStyles.height : ''),
      minWidth: element.style.minWidth || computedStyles.minWidth,
      minHeight: element.style.minHeight || computedStyles.minHeight,
      maxWidth: element.style.maxWidth || computedStyles.maxWidth,
      maxHeight: element.style.maxHeight || computedStyles.maxHeight,
      // Position & Display
      display: element.style.display || computedStyles.display,
      position: element.style.position || computedStyles.position,
      zIndex: element.style.zIndex || computedStyles.zIndex,
      overflow: element.style.overflow || computedStyles.overflow,
      // Spacing
      marginTop: element.style.marginTop || computedStyles.marginTop,
      marginRight: element.style.marginRight || computedStyles.marginRight,
      marginBottom: element.style.marginBottom || computedStyles.marginBottom,
      marginLeft: element.style.marginLeft || computedStyles.marginLeft,
      paddingTop: element.style.paddingTop || computedStyles.paddingTop,
      paddingRight: element.style.paddingRight || computedStyles.paddingRight,
      paddingBottom: element.style.paddingBottom || computedStyles.paddingBottom,
      paddingLeft: element.style.paddingLeft || computedStyles.paddingLeft,
      // Background & Border
      backgroundColor: element.style.backgroundColor || rgbToHex(computedStyles.backgroundColor) || '#ffffff',
      borderWidth: element.style.borderWidth || computedStyles.borderWidth,
      borderRadius: element.style.borderRadius || computedStyles.borderRadius,
      borderColor: element.style.borderColor || rgbToHex(computedStyles.borderColor) || '#000000',
      borderStyle: element.style.borderStyle || computedStyles.borderStyle,
      // Effects
      boxShadow: element.style.boxShadow || computedStyles.boxShadow,
      objectFit: element.style.objectFit || computedStyles.objectFit,
    }
  }

  // Helper function to convert RGB to Hex for color inputs
  const rgbToHex = (rgb: string): string => {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff'
    if (rgb.startsWith('#')) return rgb
    const match = rgb.match(/\d+/g)
    if (!match || match.length < 3) return '#ffffff'
    const [r, g, b] = match.map(Number)
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
  }
  // Keep a ref to the previously hovered element so we can remove the attribute cleanly
  const prevHoveredElRef = useRef<Element | null>(null)
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument
    // If iframe not ready, just clear any previous hover attr and wait
    if (!doc) {
      if (prevHoveredElRef.current && prevHoveredElRef.current.isConnected) {
        prevHoveredElRef.current.removeAttribute('data-editor-hover')
        prevHoveredElRef.current = null
      }
      return
    }

    // Helper to resolve a path like '0.2.1' into an element under body
    const resolve = (d: Document, path: string) => {
      if (!path) return null
      const parts = path.split('.').map(n => parseInt(n, 10)).filter(n => !Number.isNaN(n))
      let cursor: Element = d.body
      for (const i of parts) {
        if (!cursor.children[i]) return null
        cursor = cursor.children[i]
      }
      return cursor as Element
    }

    // Remove attribute from previous hovered element (if any)
    if (prevHoveredElRef.current && prevHoveredElRef.current.isConnected) {
      prevHoveredElRef.current.removeAttribute('data-editor-hover')
      prevHoveredElRef.current = null
    }

    // If there's no hovered path or it's the same as the selected path, don't set hover
    if (!hoveredPath || (selectedPath && hoveredPath === selectedPath)) return

    const el = resolve(doc, hoveredPath)
    if (el) {
      try {
        el.setAttribute('data-editor-hover', 'true')
        prevHoveredElRef.current = el
      } catch (e) {
        // ignore cross-origin or other DOM errors
      }
    }

    // Cleanup when hoveredPath changes or on unmount
    return () => {
      if (prevHoveredElRef.current && prevHoveredElRef.current.isConnected) {
        prevHoveredElRef.current.removeAttribute('data-editor-hover')
        prevHoveredElRef.current = null
      }
    }
  }, [hoveredPath, selectedPath, iframeRef])
  const [pages, setPages] = useState<IframePage[]>(template.pages)
  const currentPage = pages[currentPageIndex]

  // Use ref to store the latest pages without causing re-renders
  const pagesRef = useRef<IframePage[]>(pages)
  useEffect(() => {
    pagesRef.current = pages
  }, [pages])

  // Auto-collapse left tab when element is selected (except for layers tab)
  useEffect(() => {
    if (selectedPath && activeLeftTab && activeLeftTab !== 'layers') {
      setActiveLeftTab(null)
    }
  }, [selectedPath, activeLeftTab])

  // Detect element type when selection changes
  useEffect(() => {
    if (selectedPath && selectedTag) {
      const elementType = detectElementType(selectedTag)
      setSelectedElementType(elementType)

      // Auto-expand first section of each tab
      const config = ELEMENT_UI_CONFIG[elementType as keyof typeof ELEMENT_UI_CONFIG] || ELEMENT_UI_CONFIG.default

      // Expand all sections by default for better user experience
      const allSections: Record<string, boolean> = {}
      config.content.forEach(section => {
        allSections[section.group] = true
      })
      config.style.forEach(section => {
        allSections[section.group] = true
      })
      config.effects?.forEach(section => {
        allSections[section.group] = true
      })

      setExpandedSections(allSections)
    }
  }, [selectedPath, selectedTag])

  // Generate previews when pages change
  useEffect(() => {
    pages.forEach(page => {
      if (!pagePreviews[page.id]) {
        generatePagePreview(page.html, page.id)
      }
    })
  }, [pages.length, pagePreviews]) // Depend on page count and previews state

  // Refresh current page preview when style mutations change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshCurrentPagePreview()
    }, 1000) // Debounce to avoid too frequent updates

    return () => clearTimeout(timeoutId)
  }, [styleMutations])

  // Refresh current page preview when live data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshCurrentPagePreview()
    }, 1000) // Debounce to avoid too frequent updates

    return () => clearTimeout(timeoutId)
  }, [liveData])

  // Refresh preview when current page changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshCurrentPagePreview()
    }, 1500) // Wait a bit longer for page transition to complete

    return () => clearTimeout(timeoutId)
  }, [currentPageIndex])

  // Database persistence
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Track if iframe content has been modified (DOM changes)
  const [isDirty, setIsDirty] = useState(false)
  const iframeContentRef = useRef<string>('') // Store the actual HTML from iframe

  // Save status: 'saved' | 'saving' | 'unsaved' | 'error'
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved')
  const lastChangeTimeRef = useRef<number>(Date.now())

  // Function to capture current iframe HTML (including all user edits)
  const captureIframeHTML = (): string => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return ''

    // Clone the body to avoid modifying the live DOM
    const bodyClone = doc.body.cloneNode(true) as HTMLElement

    // Remove editor-specific attributes that shouldn't be saved
    bodyClone.querySelectorAll('[data-editor-selected], [data-editor-hover]').forEach(el => {
      el.removeAttribute('data-editor-selected')
      el.removeAttribute('data-editor-hover')
      el.removeAttribute('contenteditable')
    })

    // Remove editor-specific style tags
    const editorStyles = bodyClone.querySelectorAll('#editor-interaction-styles, #editor-hover-styles')
    editorStyles.forEach(style => style.remove())

    return bodyClone.innerHTML
  }

  // Function to extract CSS from iframe
  const captureIframeCSS = (): string => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return ''

    const styles: string[] = []
    doc.querySelectorAll('style:not(#editor-interaction-styles):not(#editor-hover-styles)').forEach(styleEl => {
      styles.push(styleEl.textContent || '')
    })

    return styles.join('\n')
  }

  // 🔥 NEW: Assign unique data-id to elements that don't have one
  const assignDataIds = () => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return

    let counter = 0
    const walk = (el: Element | null) => {
      // Null check
      if (!el || !el.tagName) return

      // Skip script, style, svg elements
      if (['SCRIPT', 'STYLE', 'SVG', 'PATH'].includes(el.tagName)) return

      // Assign ID if not present
      if (!el.getAttribute('data-id')) {
        el.setAttribute('data-id', `el-${Date.now()}-${counter++}`)
      }

      // Also mark as editable if it's a text container
      const isTextElement = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'A', 'LI', 'TD', 'TH', 'LABEL', 'BUTTON'].includes(el.tagName)
      if (isTextElement && !el.querySelector('img, svg')) {
        el.setAttribute('data-editable', 'true')
      }

      // Recurse to children
      Array.from(el.children).forEach(walk)
    }

    walk(doc.body)
  }

  // Save function to persist data to database
  const saveToDatabase = async () => {
    if (!catalogueId || isSaving) return

    setIsSaving(true)
    setSaveStatus('saving')

    try {
      // Capture the ACTUAL HTML from iframe (with all user edits)
      const capturedHTML = captureIframeHTML()
      const capturedCSS = captureIframeCSS()

      console.log('💾 Saving to database...')
      console.log('📄 Captured HTML length:', capturedHTML.length, 'chars')
      console.log('🎨 Style mutations:', Object.keys(styleMutations).length, 'elements')
      console.log('📊 Live data keys:', Object.keys(liveData))

      // Update the current page with captured HTML (use ref to avoid re-render)
      const updatedPages = pagesRef.current.map((page, idx) => {
        if (idx === currentPageIndex) {
          return {
            ...page,
            html: capturedHTML,
            css: capturedCSS,
            updatedAt: new Date()
          }
        }
        return page
      })

      const editorState = {
        liveData,
        styleMutations,
        templateId: template.id,
        pages: updatedPages, // Save updated HTML, not original template
        currentPageIndex,
        userZoom,
        showGrid,
        lastSaved: new Date().toISOString()
      }

      const response = await fetch(`/api/catalogues/${catalogueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: {
            iframeEditor: editorState
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save editor state')
      }

      // ✅ FIX: Only update pagesRef, NOT pages state to prevent re-render/blink
      // The pages state will be synced when user switches pages
      pagesRef.current = updatedPages

      setLastSaved(new Date())
      setIsDirty(false)
      setSaveStatus('saved')
      onSaveSuccess?.()

      console.log('✅ Save successful!')
    } catch (error) {
      console.error('❌ Error saving editor state:', error)
      setSaveStatus('error')
      onSaveError?.(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  // Improved auto-save with debouncing - only save after user stops editing
  const scheduleAutoSave = () => {
    if (!autoSave || !catalogueId || previewMode) return

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Mark as unsaved
    setSaveStatus('unsaved')
    lastChangeTimeRef.current = Date.now()

    // Schedule save after inactivity period
    saveTimeoutRef.current = setTimeout(() => {
      // Only save if there have been no changes for the full interval
      const timeSinceLastChange = Date.now() - lastChangeTimeRef.current
      if (timeSinceLastChange >= autoSaveInterval) {
        saveToDatabase()
      }
    }, autoSaveInterval)
  }

  // Load initial data from database
  useEffect(() => {
    const loadInitialData = async () => {
      if (!catalogueId) return

      try {
        const response = await fetch(`/api/catalogues/${catalogueId}`)
        if (!response.ok) return

        const data = await response.json()
        const iframeEditorSettings = data.catalogue?.settings?.iframeEditor

        console.log('🔍 IframeEditor - Loading initial data:', {
          hasIframeEditorSettings: !!iframeEditorSettings,
          savedTemplateId: iframeEditorSettings?.templateId,
          currentTemplateId: template.id,
          hasSavedPages: !!iframeEditorSettings?.pages,
          savedPageCount: iframeEditorSettings?.pages?.length || 0,
          freshPageCount: template.pages.length,
          fullSettings: iframeEditorSettings
        })

        if (iframeEditorSettings) {
          // Load saved editor state
          if (iframeEditorSettings.liveData && !initialData) {
            setLiveData(iframeEditorSettings.liveData)
          }
          if (iframeEditorSettings.styleMutations && !initialStyleMutations) {
            setStyleMutations(iframeEditorSettings.styleMutations)
          }

          // 🔥 FIX: Only load saved pages if they belong to the SAME template
          // Otherwise, use the fresh template pages to avoid showing wrong template
          const savedTemplateId = iframeEditorSettings.templateId
          const currentTemplateId = template.id

          console.log('🔍 IframeEditor - Page loading decision:', {
            savedTemplateId,
            currentTemplateId,
            hasSavedPages: !!iframeEditorSettings.pages,
            savedPageCount: iframeEditorSettings.pages?.length || 0,
            templateMatch: savedTemplateId === currentTemplateId
          })

          // 🔥 FIX: Only load saved pages if they belong to the SAME template
          // This prevents old template pages from overlaying on new templates
          if (iframeEditorSettings.pages && savedTemplateId === currentTemplateId) {
            console.log('✅ Loading saved pages - template matches:', {
              savedTemplateId,
              currentTemplateId,
              pageCount: iframeEditorSettings.pages.length
            })
            setPages(iframeEditorSettings.pages)
            pagesRef.current = iframeEditorSettings.pages // Keep ref in sync
          } else if (iframeEditorSettings.pages && savedTemplateId !== currentTemplateId) {
            console.warn('⚠️ Template changed - using fresh template pages:', {
              savedTemplateId,
              currentTemplateId,
              savedPageCount: iframeEditorSettings.pages.length,
              freshPageCount: template.pages.length
            })
            // Don't load saved pages - they're from a different template!
            // The template pages will be used from the initial state
          }
          // } else {
          //   console.log('ℹ️ No saved pages found or no template mismatch')
          // }
          if (typeof iframeEditorSettings.currentPageIndex === 'number') {
            setCurrentPageIndex(iframeEditorSettings.currentPageIndex)
          }
          if (typeof iframeEditorSettings.userZoom === 'number') {
            setUserZoom(iframeEditorSettings.userZoom)
          }
          if (typeof iframeEditorSettings.showGrid === 'boolean') {
            setShowGrid(iframeEditorSettings.showGrid)
          }
          if (iframeEditorSettings.lastSaved) {
            setLastSaved(new Date(iframeEditorSettings.lastSaved))
          }
        }
      } catch (error) {
        console.error('Error loading initial editor data:', error)
      }
    }

    loadInitialData()
  }, [catalogueId]) // Only run when catalogueId changes

  // Trigger auto-save when data changes (debounced)
  useEffect(() => {
    if (!previewMode && isDirty) {
      scheduleAutoSave()
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [isDirty, liveData, styleMutations, currentPageIndex])

  // Separate effect for when user actively changes these settings
  useEffect(() => {
    if (!previewMode && (userZoom !== 1 || showGrid !== false)) {
      scheduleAutoSave()
    }
  }, [userZoom, showGrid])

  // Compile current page with Mustache
  const compiledHtml = useMemo(() => {
    const cssBlock = `<style>${template?.sharedCss || ''}\n${currentPage?.css || ''}</style>`
    if (!currentPage) return cssBlock

    if (template.engine === 'mustache') {
      const rendered = Mustache.render(currentPage.html, liveData)
      return `${cssBlock}\n${rendered}`
    }
    // For now, default to Mustache until Handlebars adapter lands
    const rendered = Mustache.render(currentPage.html, liveData)
    return `${cssBlock}\n${rendered}`
  }, [template, currentPage, liveData])

  // Track the last rendered HTML to prevent unnecessary iframe reloads
  const lastRenderedHtmlRef = useRef<string>('')

  useEffect(() => {
    if (!iframeRef.current) return

    // ✅ OPTIMIZATION: Only update srcdoc if HTML actually changed
    // This prevents blinking during auto-save when HTML hasn't changed
    if (lastRenderedHtmlRef.current === compiledHtml) {
      console.log('⏭️ Skipping iframe update - HTML unchanged')
      return
    }

    lastRenderedHtmlRef.current = compiledHtml
    console.log('🔄 Updating iframe with new HTML')

    // Write to iframe via srcdoc for sandboxed DOM
    iframeRef.current.srcdoc = compiledHtml
    // Reapply style mutations when content updates
    const applyMutations = () => {
      const doc = iframeRef.current?.contentDocument
      if (!doc || !doc.body) return

      // 🔥 Step 1: Assign data-id attributes to all elements
      assignDataIds()

      // Step 2: Apply saved style mutations
      Object.entries(styleMutations).forEach(([path, styles]) => {
        const el = resolvePathToElement(doc, path)
        if (el) Object.assign((el as HTMLElement).style, styles)
      })

      // Step 3: Mark ready for PDF if needed
      if (doc.body) {
        doc.body.setAttribute('data-pdf-ready', 'true')
      }

      // 🔥 Step 4: Set up MutationObserver to track DOM changes
      const observer = new MutationObserver((mutations) => {
        // Filter out our own editor changes (data-editor-* attributes)
        const hasRealChanges = mutations.some(mutation => {
          if (mutation.type === 'attributes') {
            const attrName = mutation.attributeName
            return attrName && !attrName.startsWith('data-editor-') && attrName !== 'contenteditable'
          }
          return true // characterData or childList changes are real
        })

        if (hasRealChanges) {
          setIsDirty(true)
        }
      })

      // Observe the entire iframe body for changes
      observer.observe(doc.body, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
        attributeOldValue: true,
        characterDataOldValue: true
      })

      // 🔥 Step 5: Notify parent that iframe is fully loaded and ready
      console.log('✅ IframeEditor: Calling onIframeReady callback')
      onIframeReady?.()

      // Refresh preview for current page after iframe is ready
      setTimeout(() => {
        refreshCurrentPagePreview()
      }, 500)

      // Store observer cleanup
      return () => observer.disconnect()
    }
    // Wait a tick for DOM to be ready
    const timeoutId = setTimeout(() => {
      console.log('🔧 IframeEditor: Applying mutations and setting up observers')
      applyMutations()
    }, 50)
    return () => clearTimeout(timeoutId)
  }, [compiledHtml, styleMutations, onIframeReady])

  // Inject interaction styles (disable outlines; we render overlay rectangles)
  const ensureInteractionStyleTag = () => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    let tag = doc.getElementById('editor-interaction-styles') as HTMLStyleElement | null
    if (!tag) {
      tag = doc.createElement('style')
      tag.id = 'editor-interaction-styles'
      // Some templates render without a <head>; fall back to body
      const container = doc.head || doc.body || doc.documentElement
      if (container) container.appendChild(tag)
    }
    tag.textContent = `
      /* Remove focus ring from contenteditable elements completely */
      *[contenteditable]:focus,
      *[contenteditable]:focus-visible,
      [data-editor-selected="true"],
      [data-editor-hover="true"] {
        outline: none !important;
        border: none !important;
        box-shadow: none !important;
      }
      
      /* Prevent user selection to avoid accidental text selection */
      [data-editor-hover="true"],
      [data-editor-selected="true"] {
        user-select: none;
      }
    `
  }
  useEffect(() => { ensureInteractionStyleTag() }, [compiledHtml])

  // Reset page index when template changes to avoid out-of-bound page selection
  useEffect(() => {
    // Initialize pages with timestamps when template changes
    const stamped = template.pages.map(p => ({
      ...p,
      createdAt: p.createdAt ?? new Date(),
      updatedAt: p.updatedAt ?? new Date(),
    }))
    setPages(stamped)
    setCurrentPageIndex(0)
    clearSelection()
  }, [template?.id])

  // Sync pages state from pagesRef when user switches pages with smooth transition
  // This ensures saved changes persist across page navigation with fade animation
  useEffect(() => {
    // Only sync if pagesRef has different content than pages state
    if (pagesRef.current !== pages) {
      // Start fade out
      setIsPageTransitioning(true)

      // Wait for fade out, then update pages and fade in
      const timer = setTimeout(() => {
        setPages([...pagesRef.current])
        setIsPageTransitioning(false)
      }, 200) // 200ms fade out, then fade in

      return () => clearTimeout(timer)
    }
  }, [currentPageIndex])

  const onInputChange = (path: string, value: string) => {
    setLiveData(prev => {
      const next = { ...prev }
      // Support simple dot-paths like "product.title"
      const parts = path.split('.')
      let cursor: any = next
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i]
        cursor[key] = cursor[key] ?? {}
        cursor = cursor[key]
      }
      cursor[parts[parts.length - 1]] = value
      return next
    })
  }

  // Propagate liveData changes to parent if requested
  useEffect(() => {
    if (onLiveDataChange) {
      onLiveDataChange(liveData)
    }
  }, [liveData, onLiveDataChange])

  // Propagate style mutations
  useEffect(() => {
    if (onStyleMutationsChange) onStyleMutationsChange(styleMutations)
  }, [styleMutations, onStyleMutationsChange])

  // Expose iframe getter to parent
  useEffect(() => {
    if (registerIframeGetter) {
      registerIframeGetter(() => iframeRef.current)
    }
  }, [registerIframeGetter])

  // Expose editor controls (undo/redo, zoom) to parent
  useEffect(() => {
    if (!registerEditorControls) return
    const controls = {
      undo: () => {
        if (pastMutations.length === 0) return
        const previous = pastMutations[pastMutations.length - 1]
        setPastMutations(p => p.slice(0, p.length - 1))
        setFutureMutations(f => [styleMutations, ...f])
        setStyleMutations(previous)
      },
      redo: () => {
        if (futureMutations.length === 0) return
        const next = futureMutations[0]
        setFutureMutations(f => f.slice(1))
        setPastMutations(p => [...p, styleMutations])
        setStyleMutations(next)
      },
      zoomIn: () => setUserZoom(z => Math.min(2, Number((z + 0.1).toFixed(2)))),
      zoomOut: () => setUserZoom(z => Math.max(0.5, Number((z - 0.1).toFixed(2)))),
      setZoom: (z: number) => setUserZoom(Math.max(0.5, Math.min(2, z))),
      getZoom: () => userZoom,
      toggleGrid: () => setShowGrid(g => !g),
      setGrid: (v: boolean) => setShowGrid(Boolean(v)),
      getGrid: () => showGrid,
      hasUndo: () => pastMutations.length > 0,
      hasRedo: () => futureMutations.length > 0,
      print: () => {
        try { iframeRef.current?.contentWindow?.print?.() } catch { }
      },
      exportHTML: () => exportCurrentPageAsHTML(),
      exportJSON: () => exportEditorStateAsJSON(),
      exportPDF: () => exportAllPagesToPDF(),
      exportPNG: () => exportCurrentPageAsPNG(),
      // Pages
      getPages: () => pagesRef.current, // Use ref to get latest pages without re-render
      getCurrentPageIndex: () => currentPageIndex,
      setCurrentPageIndex: (i: number) => setCurrentPageIndex(Math.max(0, Math.min(pages.length - 1, i))),
      goPrev: () => setCurrentPageIndex(i => Math.max(0, i - 1)),
      goNext: () => setCurrentPageIndex(i => Math.min(pages.length - 1, i + 1)),
      // Database persistence
      saveToDatabase: saveToDatabase,
      getSaveStatus: () => saveStatus,
      getLastSaved: () => lastSaved,
      isDirty: () => isDirty,
    }
    registerEditorControls(controls)
  }, [registerEditorControls, userZoom, styleMutations, pastMutations, futureMutations, showGrid, pages, currentPageIndex, saveToDatabase, saveStatus, lastSaved, isDirty])

  // Selection handling inside iframe (disabled in preview mode)
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    if (previewMode) return
    const handler = (ev: MouseEvent) => {
      const doc = iframe.contentDocument
      if (!doc) return
      let target = ev.target as HTMLElement
      if (!target) return
      // Promote selection to parent when clicking near element edges to allow selecting outer containers
      const edgePromote = (start: HTMLElement): HTMLElement => {
        let el: HTMLElement = start
        const margin = 8
        while (el.parentElement && el.parentElement !== doc.body) {
          const r = el.getBoundingClientRect()
          const nearEdge = (ev.clientX - r.left < margin) || (r.right - ev.clientX < margin) || (ev.clientY - r.top < margin) || (r.bottom - ev.clientY < margin)
          if (!nearEdge) break
          el = el.parentElement as HTMLElement
        }
        return el
      }
      target = edgePromote(target)
      const path = computeElementPath(doc, target)
      // Tag the element to enable hover CSS targeting by path
      target.setAttribute('data-editor-path', path)
      // Solid outline for selection; clear previous
      const prevSel = doc.querySelector('[data-editor-selected="true"]') as HTMLElement | null
      if (prevSel && prevSel !== target) {
        prevSel.removeAttribute('data-editor-selected')
        // Disable inline editing on previously selected element
        prevSel.removeAttribute('contenteditable')
      }
      target.setAttribute('data-editor-selected', 'true')
      // Set tabindex to -1 to prevent native focus and gray border
      target.setAttribute('tabindex', '-1')
      // Don't focus the element to avoid browser's default focus ring
      // target.setAttribute('contenteditable', 'true')
      // try { target.focus({ preventScroll: true }) } catch { }
      setSelectedPath(path)
      setSelectedTag(target.tagName.toLowerCase())
      setSelectedContent(target.textContent || '')
      setIsContentEditable(true)
      ev.preventDefault()
      ev.stopPropagation()
    }
    // Hover tracking for dotted outline
    let lastHoverEl: HTMLElement | null = null
    const onMouseMove = (ev: MouseEvent) => {
      const doc = iframe.contentDocument
      if (!doc) return
      const target = ev.target as HTMLElement | null
      if (!target || target === doc.body) return
      if (lastHoverEl && lastHoverEl !== target) {
        lastHoverEl.removeAttribute('data-editor-hover')
      }
      const path = computeElementPath(doc, target)
      target.setAttribute('data-editor-path', path)
      target.setAttribute('data-editor-hover', 'true')
      lastHoverEl = target
      setHoveredPath(path)
    }
    const onMouseLeave = () => {
      const doc = iframe.contentDocument
      if (!doc) return
      const el = doc.querySelector('[data-editor-hover="true"]') as HTMLElement | null
      if (el) el.removeAttribute('data-editor-hover')
      lastHoverEl = null
      setHoveredPath(null)
    }
    const attach = () => {
      const doc = iframe.contentDocument
      if (!doc) return
      doc.addEventListener('click', handler, true)
      doc.addEventListener('mousemove', onMouseMove, true)
      doc.addEventListener('mouseleave', onMouseLeave, true)
    }
    const detach = () => {
      const doc = iframe.contentDocument
      if (!doc) return
      doc.removeEventListener('click', handler, true)
      doc.removeEventListener('mousemove', onMouseMove, true)
      doc.removeEventListener('mouseleave', onMouseLeave, true)
    }
    const onLoad = () => attach()
    iframe.addEventListener('load', onLoad)
    // Attempt immediate attach (srcdoc load event may not fire consistently)
    setTimeout(attach, 100)
    return () => {
      detach()
      iframe.removeEventListener('load', onLoad)
    }
  }, [compiledHtml, previewMode])

  // Reflect contenteditable state when selection changes
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) {
      setIsContentEditable(false)
      setCurrentStyles({})
      return
    }
    const prevSel = doc.querySelector('[data-editor-selected="true"]') as HTMLElement | null
    if (prevSel && (!selectedPath || computeElementPath(doc, prevSel) !== selectedPath)) {
      prevSel.removeAttribute('data-editor-selected')
      prevSel.removeAttribute('contenteditable')
    }
    if (!selectedPath) {
      setIsContentEditable(false)
      setCurrentStyles({})
      return
    }
    const el = resolvePathToElement(doc, selectedPath) as HTMLElement | null
    if (!el) {
      setIsContentEditable(false)
      setCurrentStyles({})
      return
    }

    // Extract current styles from the element
    const styles = getCurrentElementStyles(el)
    setCurrentStyles(styles)

    // Set tabindex to -1 to prevent native focus and gray border
    el.setAttribute('tabindex', '-1')
    // Don't set contenteditable or focus to avoid browser's default focus ring
    // const editable = el.isContentEditable || el.getAttribute('contenteditable') === 'true'
    // if (!editable) el.setAttribute('contenteditable', 'true')
    el.setAttribute('data-editor-selected', 'true')
    // Don't focus the element to avoid gray border
    // try { (el as HTMLElement).focus({ preventScroll: true }) } catch { }
    setSelectedTag(el.tagName.toLowerCase())
    setSelectedContent((el as HTMLElement).textContent || '')
    setIsContentEditable(true)
  }, [selectedPath, compiledHtml])

  // Drag-and-drop support: allow dropping palette elements into iframe (disabled in preview mode)
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    if (previewMode) return
    const onDragOver = (ev: DragEvent) => {
      ev.preventDefault()
    }
    const onDrop = (ev: DragEvent) => {
      ev.preventDefault()
      let type = ev.dataTransfer?.getData('application/x-editor-element') as PaletteElementType | ''
      if (!type) {
        const plain = ev.dataTransfer?.getData('text/plain') || ''
        if (plain) type = plain as PaletteElementType
      }
      if (!type) return
      const target = ev.target as HTMLElement | null
      addElement(type, target || undefined)
    }
    const attach = () => {
      const doc = iframe.contentDocument
      if (!doc) return
      doc.addEventListener('dragover', onDragOver)
      doc.addEventListener('drop', onDrop)
    }
    const detach = () => {
      const doc = iframe.contentDocument
      if (!doc) return
      doc.removeEventListener('dragover', onDragOver)
      doc.removeEventListener('drop', onDrop)
    }
    const onLoad = () => attach()
    iframe.addEventListener('load', onLoad)
    setTimeout(attach, 100)
    return () => {
      detach()
      iframe.removeEventListener('load', onLoad)
    }
  }, [compiledHtml, previewMode])

  // Apply style mutations to iframe DOM (clear previously applied paths to avoid stale styles)
  const applyStyleMutationsToIframe = (mutations: Record<string, Partial<CSSStyleDeclaration>>) => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    // Clear previous inline styles for tracked paths
    lastAppliedPathsRef.current.forEach((path) => {
      const el = resolvePathToElement(doc, path)
      if (el && (el as HTMLElement).style) {
        ; (el as HTMLElement).removeAttribute('style')
      }
    })
    // Apply new mutations
    Object.entries(mutations).forEach(([path, styles]) => {
      const el = resolvePathToElement(doc, path)
      if (el) Object.assign((el as HTMLElement).style, styles)
    })
    lastAppliedPathsRef.current = Object.keys(mutations)
  }

  // When styleMutations state changes (undo/redo), reapply to iframe
  useEffect(() => {
    applyStyleMutationsToIframe(styleMutations)
  }, [styleMutations])

  const updateSelectedStyles = (updates: Partial<CSSStyleDeclaration>) => {
    if (!selectedPath || !iframeRef.current) return
    const doc = iframeRef.current.contentDocument
    if (!doc) return
    const el = resolvePathToElement(doc, selectedPath)
    if (!el) return
    // Save current state to past stack for undo
    setPastMutations(p => [...p, JSON.parse(JSON.stringify(styleMutations))])
    // Clear future on new change
    setFutureMutations([])
    // Apply to DOM immediately for responsive feedback
    Object.assign((el as HTMLElement).style, updates)
    // Update mutations map
    setStyleMutations(prev => ({ ...prev, [selectedPath]: { ...(prev[selectedPath] || {}), ...updates } }))
  }

  const clearSelection = () => {
    setSelectedPath(null)
    setSelectedTag('')
    const doc = iframeRef.current?.contentDocument
    const prevSel = doc?.querySelector('[data-editor-selected="true"]') as HTMLElement | null
    if (prevSel) {
      prevSel.removeAttribute('data-editor-selected')
      prevSel.removeAttribute('contenteditable')
      prevSel.removeAttribute('tabindex')
    }
    setIsContentEditable(false)
  }

  // Hover style helpers: inject style tag in iframe head and rebuild rules
  const ensureHoverStyleTag = () => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return null
    let tag = doc.getElementById('editor-hover-styles') as HTMLStyleElement | null
    if (!tag) {
      tag = doc.createElement('style')
      tag.id = 'editor-hover-styles'
      // Fall back to body if head is unavailable in srcdoc
      const container = doc.head || doc.body || doc.documentElement
      if (container) container.appendChild(tag)
    }
    return tag
  }

  const rebuildHoverStyles = () => {
    const tag = ensureHoverStyleTag()
    if (!tag) return
    const rules = Object.entries(hoverStyles).map(([path, styles]) => {
      const bg = styles.backgroundColor ? `background-color: ${styles.backgroundColor};` : ''
      const color = styles.color ? `color: ${styles.color};` : ''
      if (!bg && !color) return ''
      return `[data-editor-path="${path}"]:hover { ${bg} ${color} }`
    }).filter(Boolean)
    tag.textContent = rules.join('\n')
  }

  useEffect(() => {
    rebuildHoverStyles()
  }, [hoverStyles, compiledHtml])

  const updateHoverStyles = (updates: Partial<{ backgroundColor: string; color: string }>) => {
    if (!selectedPath) return
    setHoverStyles(prev => ({ ...prev, [selectedPath]: { ...(prev[selectedPath] || {}), ...updates } }))
  }

  // Unselect when clicking outside the canvas, except when clicking the right sidebar
  useEffect(() => {
    const onDocMouseDown = (ev: MouseEvent) => {
      const target = ev.target as Node | null
      if (!target) return
      const canvas = canvasWrapperRef.current
      const rightBar = rightSidebarRef.current
      const leftBar = leftSidebarRef.current
      const insideCanvas = canvas ? canvas.contains(target) : false
      const insideRight = rightBar ? rightBar.contains(target) : false
      const insideLeft = leftBar ? leftBar.contains(target) : false
      // Keep selection when clicking inside canvas, right sidebar, or left sidebar
      if (!insideCanvas && !insideRight && !insideLeft) {
        setSelectedPath(null)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown, true)
    return () => document.removeEventListener('mousedown', onDocMouseDown, true)
  }, [])

  // Export helpers
  const downloadFile = (filename: string, content: string, mime = 'text/plain') => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const exportCurrentPageAsHTML = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${compiledHtml}</body></html>`
    downloadFile(`${template.name}-${currentPage?.name || 'page'}.html`, html, 'text/html')
  }

  const exportEditorStateAsJSON = () => {
    const data = {
      pages: pages.map(p => ({ id: p.id, name: p.name })),
      currentPageIndex,
      liveData,
      styleMutations,
    }
    downloadFile(`${template.name}-state.json`, JSON.stringify(data, null, 2), 'application/json')
  }

  // Export all pages to a single PDF using Playwright (server-side)
  const exportAllPagesToPDF = async () => {
    try {
      const iframe = iframeRef.current
      if (!iframe || !iframe.contentDocument) {
        throw new Error('Iframe not ready')
      }

      const originalPageIndex = currentPageIndex
      const pagesData: Array<{ html: string; name: string; width?: number; height?: number }> = []

      // Get iframe dimensions (canvas size)
      const iframeWidth = iframe.clientWidth || iframe.offsetWidth || 1200
      const iframeHeight = iframe.clientHeight || iframe.offsetHeight || 1600

      console.log(`Canvas dimensions: ${iframeWidth}x${iframeHeight}`)

      // Collect HTML from all pages
      for (let i = 0; i < pages.length; i++) {
        // Navigate to page
        setCurrentPageIndex(i)

        // Wait longer for page to render completely
        await new Promise(resolve => setTimeout(resolve, 800))

        const doc = iframe.contentDocument
        if (!doc || !doc.body) {
          console.warn(`Skipping page ${i} - document not ready`)
          continue
        }

        // Wait for data-pdf-ready attribute
        let attempts = 0
        while (!doc.body.getAttribute('data-pdf-ready') && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }

        // Capture the full HTML including styles
        const html = captureIframeHTML()
        const css = captureIframeCSS()

        if (!html) {
          console.warn(`Skipping page ${i} - no HTML content`)
          continue
        }

        // Get actual body dimensions from the rendered content
        const bodyWidth = doc.body.scrollWidth || iframeWidth
        const bodyHeight = doc.body.scrollHeight || iframeHeight

        // Create complete HTML document
        const fullHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>${css}</style>
          </head>
          <body>
            ${html}
          </body>
          </html>
        `

        pagesData.push({
          html: fullHtml,
          name: pages[i].name || `Page ${i + 1}`,
          width: bodyWidth,
          height: bodyHeight,
        })
      }

      // Restore original page
      setCurrentPageIndex(originalPageIndex)

      if (pagesData.length === 0) {
        throw new Error('No pages could be captured for PDF export')
      }

      // Send to server for PDF generation using Playwright
      const response = await fetch('/api/export/pdf-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pages: pagesData,
          catalogueName: template.name,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.error || 'Failed to generate PDF')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${template.name}-catalogue.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('PDF export failed:', error)
      throw error
    }
  }

  // Export current page as PNG
  const exportCurrentPageAsPNG = async () => {
    try {
      const iframe = iframeRef.current
      if (!iframe || !iframe.contentDocument) {
        throw new Error('Iframe not ready')
      }

      const doc = iframe.contentDocument
      if (!doc || !doc.body) {
        throw new Error('Document not ready')
      }

      const canvas = await html2canvas(doc.body, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create image blob')
        }

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${template.name}-${currentPage?.name || 'page'}.png`
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch (error) {
      console.error('PNG export failed:', error)
      throw error
    }
  }

  // Utilities: element path by child index
  function computeElementPath(doc: Document, el: Element): string {
    const path: number[] = []
    let cursor: Element | null = el
    while (cursor && cursor !== doc.body) {
      const parentEl: Element | null = cursor.parentElement
      if (!parentEl) break
      const index = Array.prototype.indexOf.call(parentEl.children, cursor)
      path.unshift(index)
      cursor = parentEl
    }
    return path.join('.')
  }

  function resolvePathToElement(doc: Document, path: string): Element | null {
    const parts = path.split('.').map(n => parseInt(n, 10)).filter(n => !Number.isNaN(n))
    let cursor: Element = doc.body
    for (const idx of parts) {
      if (!cursor.children || !cursor.children[idx]) return null
      cursor = cursor.children[idx]
    }
    return cursor
  }

  // Palette element creation and insertion
  const createPaletteElement = (doc: Document, type: PaletteElementType): HTMLElement => {
    let el: HTMLElement
    switch (type) {
      case 'heading': {
        el = doc.createElement('h2')
        el.textContent = 'Heading'
        el.style.fontSize = '24px'
        el.style.fontWeight = '700'
        break
      }
      case 'paragraph': {
        el = doc.createElement('p')
        el.textContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        el.style.fontSize = '14px'
        el.style.lineHeight = '1.6'
        break
      }
      case 'button': {
        el = doc.createElement('button') as HTMLButtonElement
        el.textContent = 'Click me'
        el.style.padding = '8px 12px'
        el.style.border = '1px solid #d1d5db'
        el.style.borderRadius = '6px'
        el.style.background = '#3b82f6'
        el.style.color = '#fff'
        el.style.cursor = 'pointer'
        break
      }
      case 'input': {
        el = doc.createElement('input') as HTMLInputElement
          ; (el as HTMLInputElement).type = 'text'
          ; (el as HTMLInputElement).placeholder = 'Enter text'
        el.style.padding = '6px 8px'
        el.style.border = '1px solid #d1d5db'
        el.style.borderRadius = '6px'
        el.style.width = '100%'
        break
      }
      case 'image': {
        el = doc.createElement('img') as HTMLImageElement
          ; (el as HTMLImageElement).src = liveData.product?.image || 'https://via.placeholder.com/150'
        el.style.maxWidth = '100%'
        el.style.display = 'block'
          ; (el as HTMLImageElement).alt = 'Image'
        break
      }
      case 'icon': {
        el = doc.createElement('div')
        el.textContent = '☆'
        el.style.display = 'inline-flex'
        el.style.alignItems = 'center'
        el.style.justifyContent = 'center'
        el.style.width = '24px'
        el.style.height = '24px'
        el.style.border = '1px solid #d1d5db'
        el.style.borderRadius = '12px'
        break
      }
      case 'divider': {
        el = doc.createElement('hr')
        el.style.border = 'none'
        el.style.borderTop = '1px solid #e5e7eb'
        el.style.margin = '12px 0'
        break
      }
      case 'columns-2': {
        el = doc.createElement('div')
        el.style.display = 'flex'
        el.style.gap = '12px'
        el.style.alignItems = 'stretch'
        const col1 = doc.createElement('div')
        const col2 = doc.createElement('div')
          ;[col1, col2].forEach((c, i) => {
            c.style.flex = '1'
            c.style.border = '1px dashed #d1d5db'
            c.style.padding = '12px'
            c.textContent = `Column ${i + 1}`
          })
        el.appendChild(col1)
        el.appendChild(col2)
        break
      }
      case 'columns-3': {
        el = doc.createElement('div')
        el.style.display = 'flex'
        el.style.gap = '12px'
        el.style.alignItems = 'stretch'
        const cols = [0, 1, 2].map(() => doc.createElement('div'))
        cols.forEach((c, i) => {
          c.style.flex = '1'
          c.style.border = '1px dashed #d1d5db'
          c.style.padding = '12px'
          c.textContent = `Column ${i + 1}`
          el.appendChild(c)
        })
        break
      }
      case 'hero': {
        el = doc.createElement('section')
        el.style.padding = '24px'
        el.style.background = '#f3f4f6'
        el.style.borderRadius = '8px'
        const h = doc.createElement('h1')
        h.textContent = 'Hero Title'
        h.style.fontSize = '32px'
        h.style.fontWeight = '800'
        const p = doc.createElement('p')
        p.textContent = 'Write a compelling tagline here.'
        p.style.marginTop = '8px'
        const btn = doc.createElement('button')
        btn.textContent = 'Get Started'
        btn.style.marginTop = '12px'
        btn.style.padding = '10px 14px'
        btn.style.borderRadius = '6px'
        btn.style.border = '1px solid #d1d5db'
        btn.style.background = '#111827'
        btn.style.color = '#fff'
        el.appendChild(h)
        el.appendChild(p)
        el.appendChild(btn)
        break
      }
      case 'gallery': {
        el = doc.createElement('section')
        el.style.display = 'grid'
        el.style.gridTemplateColumns = 'repeat(3, 1fr)'
        el.style.gap = '8px'
        for (let i = 0; i < 6; i++) {
          const img = doc.createElement('img') as HTMLImageElement
          img.src = 'https://via.placeholder.com/200x140.png?text=Photo'
          img.style.width = '100%'
          img.style.height = 'auto'
          img.style.display = 'block'
          img.alt = 'Gallery Image'
          el.appendChild(img)
        }
        break
      }
      case 'product-card': {
        el = doc.createElement('div')
        el.style.border = '1px solid #e5e7eb'
        el.style.borderRadius = '8px'
        el.style.padding = '12px'
        el.style.display = 'grid'
        el.style.gridTemplateColumns = '120px 1fr'
        el.style.gap = '12px'
        const img = doc.createElement('img') as HTMLImageElement
        img.src = liveData.product?.image || 'https://via.placeholder.com/120.png?text=Image'
        img.style.width = '120px'
        img.style.height = '120px'
        img.style.objectFit = 'cover'
        img.style.borderRadius = '8px'
        const info = doc.createElement('div')
        const title = doc.createElement('h3')
        title.textContent = liveData.product?.title || 'Product Name'
        title.style.fontSize = '18px'
        title.style.fontWeight = '700'
        const price = doc.createElement('p')
        price.textContent = liveData.product?.price || '$0.00'
        price.style.color = '#10b981'
        price.style.fontWeight = '700'
        info.appendChild(title)
        info.appendChild(price)
        el.appendChild(img)
        el.appendChild(info)
        break
      }
      case 'container':
      default: {
        el = doc.createElement('div')
        el.style.border = '1px dashed #d1d5db'
        el.style.padding = '12px'
        el.style.borderRadius = '6px'
        el.textContent = 'Container'
        break
      }
    }
    el.style.margin = '8px 0'
    return el
  }

  const addElement = (type: PaletteElementType, containerEl?: HTMLElement) => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    const target = containerEl || (selectedPath ? resolvePathToElement(doc, selectedPath) : doc.body)
    const container = (target as HTMLElement) || doc.body
    const el = createPaletteElement(doc, type)
    container.appendChild(el)
  }

  // Auto-fit canvas to viewport while preserving A4 aspect ratio (794x1123)
  const BASE_W = 1200
  const BASE_H = 800
  useEffect(() => {
    const el = stageContainerRef.current
    if (!el) return
    const compute = () => {
      const rect = el.getBoundingClientRect()
      const availW = Math.max(0, rect.width - 8) // padding safety
      const availH = Math.max(0, rect.height - 8)
      const fit = Math.min(availW / BASE_W, availH / BASE_H)
      const next = (Number.isFinite(fit) && fit > 0 ? fit : 1) * userZoom
      setScale(next)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    window.addEventListener('resize', compute)
    return () => {
      window.removeEventListener('resize', compute)
      ro.disconnect()
    }
  }, [userZoom])

  const goPrev = () => setCurrentPageIndex(i => Math.max(0, i - 1))
  const goNext = () => setCurrentPageIndex(i => Math.min(pages.length - 1, i + 1))

  // Pages actions
  const addBlankPage = () => {
    const now = new Date()
    const newPage: IframePage = {
      id: `page-${Date.now()}`,
      name: `Page ${pages.length + 1}`,
      html: '<section style="padding:24px"><h2>New Page</h2><p>Start building your layout.</p></section>',
      css: '',
      createdAt: now,
      updatedAt: now,
    }
    setPages(prev => [...prev, newPage])
    setCurrentPageIndex(pages.length)
  }

  const duplicateCurrentPage = () => {
    const src = pages[currentPageIndex]
    if (!src) return
    const now = new Date()
    const copy: IframePage = { ...src, id: `page-${Date.now()}`, name: `${src.name} Copy`, createdAt: now, updatedAt: now }
    setPages(prev => {
      const next = [...prev]
      next.splice(currentPageIndex + 1, 0, copy)
      return next
    })
    setCurrentPageIndex(i => i + 1)
  }

  const deleteCurrentPage = () => {
    if (pages.length <= 1) return
    setPages(prev => prev.filter((_, idx) => idx !== currentPageIndex))
    setCurrentPageIndex(i => Math.max(0, i - 1))
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      {/* Left Sidebar: Icon nav + panel */}
      {!previewMode && (
        <div className={`flex ${activeLeftTab ? 'w-80' : 'w-20'} transition-all duration-500 ease-in-out flex-shrink-0`}>
          {/* Icon column */}
          <div className="w-16 bg-white flex flex-col items-center py-2 m-2 rounded-xl shadow-lg space-y-3 flex-shrink-0">
            {([
              { id: 'pages', name: 'Pages', icon: <FileText className="w-6 h-6" /> },
              { id: 'layers', name: 'Layers', icon: <LayersIcon className="w-6 h-6" /> },
              { id: 'elements', name: 'Elements', icon: <Shapes className="w-6 h-6" /> },
              { id: 'icons', name: 'Icons', icon: <Star className="w-6 h-6" /> },
              { id: 'text', name: 'Text', icon: <Type className="w-6 h-6" /> },
              { id: 'assets', name: 'Assets', icon: <Upload className="w-6 h-6" /> },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveLeftTab(prev => (prev === (tab.id as any) ? null : (tab.id as any)))}
                className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg transition-all duration-300 ease-in-out group relative transform hover:scale-105`}
                title={tab.name}
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ease-in-out ${activeLeftTab === (tab.id as any)
                  ? 'bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white mb-1 shadow-md scale-110'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md hover:scale-105'
                  }`}>
                  {tab.icon}
                </div>
                <span className="text-[11px] font-medium leading-tight text-center">{tab.name}</span>
              </button>
            ))}
          </div>
          {/* Panel */}
          {activeLeftTab && (activeLeftTab === 'layers' || !selectedPath) && (
            <div ref={leftSidebarRef} className="flex-1 overflow-auto rounded-xl bg-white shadow-lg mr-2 my-2 transform transition-all duration-500 ease-in-out animate-in slide-in-from-left-5">
              {activeLeftTab === 'pages' && (
                <div className="flex flex-col h-full bg-white">
                  {/* Header */}
                  <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="font-medium text-sm">Pages ({pages.length})</div>
                    <button
                      onClick={addBlankPage}
                      className="px-2 py-1 text-xs rounded bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                      title="Add Page"
                    >
                      +
                    </button>
                  </div>

                  {/* Pages list */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {pages.map((p, idx) => (
                      <div
                        key={p.id}
                        className={`group border-2 rounded-lg p-2 cursor-pointer transition-all duration-300 ease-in-out transform ${idx === currentPageIndex ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'}`}
                        onClick={() => setCurrentPageIndex(idx)}
                      >
                        {/* Live Preview Thumbnail */}
                        <div className="w-full h-24 bg-gray-100 rounded mb-2 overflow-hidden relative">
                          {pagePreviews[p.id] ? (
                            <img
                              src={pagePreviews[p.id]}
                              alt={`Preview of ${p.name}`}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse">
                              <div className="text-xs text-gray-500">Generating...</div>
                            </div>
                          )}
                          {idx === currentPageIndex && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
                          )}
                        </div>

                        {/* Name and actions */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-medium text-gray-700 truncate">{p.name}</div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                              className="px-2 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
                              onClick={(e) => { e.stopPropagation(); duplicateCurrentPage() }}
                            >
                              Duplicate
                            </button>
                            {pages.length > 1 && (
                              <button
                                className="px-2 py-1 text-xs rounded border border-red-300 bg-white text-red-600 hover:bg-red-50 transition-all duration-200 transform hover:scale-105"
                                onClick={(e) => { e.stopPropagation(); deleteCurrentPage() }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Updated info */}
                        <div className="mt-1 text-xs text-gray-500">
                          {idx === currentPageIndex && (
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1" />
                          )}
                          Updated {(() => {
                            const d = p.updatedAt instanceof Date ? p.updatedAt : (p.updatedAt ? new Date(p.updatedAt) : new Date())
                            return d.toISOString().split('T')[0]
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pager */}
                  <div className="p-3 border-t border-gray-200 flex items-center justify-between text-xs">
                    <span>Page {currentPageIndex + 1} of {pages.length}</span>
                    <div className="flex items-center gap-2">
                      <button
                        className={`px-2 py-1 rounded transition-all duration-200 transform hover:scale-110 ${currentPageIndex === 0 ? 'text-gray-400' : 'hover:bg-gray-100'}`}
                        onClick={goPrev}
                        disabled={currentPageIndex === 0}
                        title="Previous"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        className={`px-2 py-1 rounded transition-all duration-200 transform hover:scale-110 ${currentPageIndex === pages.length - 1 ? 'text-gray-400' : 'hover:bg-gray-100'}`}
                        onClick={goNext}
                        disabled={currentPageIndex === pages.length - 1}
                        title="Next"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {activeLeftTab === 'layers' && (
                <LayersPanel iframeRef={iframeRef} selectedPath={selectedPath} hoveredPath={hoveredPath} onSelectPath={(p) => { setSelectedPath(p); }} onHoverPath={(p) => setHoveredPath(p)} />
              )}
              {activeLeftTab === 'elements' && (
                <ElementsPanel onAdd={(type) => addElement(type)} />
              )}
              {activeLeftTab === 'text' && (
                <ElementsPanel onAdd={(type) => addElement(type)} onlyText />
              )}
              {activeLeftTab === 'icons' && (
                <div className="p-3 text-sm text-gray-600">Icons library coming soon.</div>
              )}

              {activeLeftTab === 'assets' && (
                <div className="p-3 text-sm text-gray-600">Assets manager coming soon.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Center Canvas: Iframe (auto-fits to viewport) */}
      {(() => {
        const leftCollapsed = previewMode || !activeLeftTab
        const rightCollapsed = !selectedPath
        const sidebarsCollapsed = leftCollapsed && rightCollapsed
        const containerClasses = sidebarsCollapsed
          ? 'items-center overflow-hidden'
          : 'items-start overflow-auto'
        // Add margin-right to balance the left sidebar when both are collapsed
        // Also add proper padding to prevent overlap and ensure equal spacing
        const containerStyle = sidebarsCollapsed && !previewMode
          ? { marginRight: '80px', padding: '2rem 1rem', transition: 'all 0.5s ease-in-out' }
          : { padding: '1rem', transition: 'all 0.5s ease-in-out' }
        return (
          <div ref={stageContainerRef} className={`flex-1 bg-gray-50 flex ${containerClasses} justify-center h-full transition-all duration-500 ease-in-out`} style={containerStyle}>
            <div ref={canvasWrapperRef} style={{ width: BASE_W * scale, height: BASE_H * scale, position: 'relative', overflow: 'visible', transition: 'all 0.3s ease-in-out' }}>
              <div
                className="bg-white shadow border transition-all duration-300 ease-in-out"
                style={{ width: BASE_W, height: BASE_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}
              >
                <iframe
                  ref={iframeRef}
                  title={`Page ${currentPageIndex + 1}`}
                  style={{
                    width: BASE_W,
                    height: BASE_H,
                    border: 'none',
                    opacity: isPageTransitioning ? 0 : 1,
                    transform: isPageTransitioning ? 'translateX(20px) scale(0.98)' : 'translateX(0) scale(1)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
              {showGrid && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    backgroundImage:
                      'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                    backgroundSize: `${20 * scale}px ${20 * scale}px`,
                  }}
                />
              )}
              {/* Show hover border when hovering any element, even if something is selected */}
              {hoveredPath && (
                <HoverRectOverlay iframeRef={iframeRef} hoveredPath={hoveredPath} selectedPath={selectedPath} scale={scale} />
              )}
              {selectedPath && (
                <SelectionActionsOverlay iframeRef={iframeRef} selectedPath={selectedPath} scale={scale} onChangeSelectedPath={(p) => setSelectedPath(p)} />
              )}
              {/* Canvas Toolbar removed; controls now live in the top navbar */}
            </div>
          </div>
        )
      })()}

      {/* Right Sidebar: Style editing */}
      <div className={`transition-all duration-500 ease-in-out ${!previewMode && selectedPath ? 'w-72' : 'w-0'} overflow-hidden`}>
        {!previewMode && selectedPath && (
          <div ref={rightSidebarRef} className="w-72 shadow-lg rounded-xl bg-white p-3 ml-2 my-2 space-y-3 h-full overflow-auto transform transition-all duration-500 ease-in-out">
            {/* Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex w-full rounded-xl p-1 gap-1 bg-gradient-to-r from-[#E9E5FF] via-[#F3EFFF] to-[#E9E5FF] border border-[#E5E1FF] shadow-sm">
                <button
                  className={`flex items-center justify-center gap-1.5 flex-1 text-center px-2 py-2 text-xs rounded-lg transition-all duration-300 ease-in-out transform  ${rightTab === 'content' ? 'bg-gradient-to-r from-white to-blue-50 shadow-sm text-gray-900 ' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'}`}
                  onClick={() => setRightTab('content')}
                >
                  <Edit3 size={12} className={rightTab === 'content' ? 'text-blue-600' : ''} />
                  Edit
                </button>
                <button
                  className={`flex items-center justify-center gap-1.5 flex-1 text-center px-2 py-2 text-xs rounded-lg transition-all duration-300 ease-in-out transform  ${rightTab === 'style' ? 'bg-gradient-to-r from-white to-pink-50 shadow-sm text-gray-900 ' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'}`}
                  onClick={() => setRightTab('style')}
                >
                  <Palette size={12} className={rightTab === 'style' ? 'text-pink-600' : ''} />
                  Design
                </button>
                <button
                  className={`flex items-center justify-center gap-1.5 flex-1 text-center px-2 py-2 text-xs rounded-lg transition-all duration-300 ease-in-out transform  ${rightTab === 'effects' ? 'bg-gradient-to-r from-white to-yellow-50 shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'}`}
                  onClick={() => setRightTab('effects')}
                >
                  <Sparkles size={12} className={rightTab === 'effects' ? 'text-yellow-600' : ''} />
                  Effects
                </button>
              </div>
            </div>

            {/* Panel */}
            <div className="space-y-3 transition-all duration-300 ease-in-out">
              {selectedPath ? (
                <>

                  {rightTab === 'content' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-3 duration-300">
                      {/* Smart Content Sections */}
                      <div className="mb-2">
                        <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                          <span className="capitalize font-medium">{selectedElementType}</span>
                          <span>Editing</span>
                        </div>
                      </div>

                      {getCurrentElementConfig().content.map(section =>
                        renderSmartSection(section, 'content')
                      )}

                      <div className="flex gap-2 mt-4">
                        <button className="px-2 py-1 border border-gray-300 rounded-lg text-[11px] bg-white hover:bg-gray-50" onClick={clearSelection}>Clear</button>
                      </div>
                    </div>
                  )}

                  {rightTab === 'style' && (
                    <div className="animate-in fade-in slide-in-from-right-3 duration-300">
                      {/* Smart Style Sections */}
                      <div className="mb-2">
                        <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                          <span className="capitalize font-medium">{selectedElementType}</span>
                          <span>Design</span>
                        </div>
                      </div>

                      {getCurrentElementConfig().style.map((section, index) =>
                        renderSmartSection(section, 'style')
                      )}

                      <div className="flex gap-2 mt-4">
                        <button className="px-2 py-1 border border-gray-300 rounded-lg text-[11px] bg-white hover:bg-gray-50" onClick={clearSelection}>Clear</button>
                      </div>
                    </div>
                  )}

                  {rightTab === 'effects' && (
                    <div className="animate-in fade-in slide-in-from-right-3 duration-300">
                      {/* Smart Effects Sections */}
                      <div className="mb-2">
                        <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                          <span className="capitalize font-medium">{selectedElementType}</span>
                          <span>Effects</span>
                        </div>
                      </div>

                      {getCurrentElementConfig().effects?.map((section, index) =>
                        renderSmartSection(section, 'effects')
                      )}

                      <div className="flex gap-2 mt-4">
                        <button className="px-2 py-1 border border-gray-300 rounded-lg text-[11px] bg-white hover:bg-gray-50" onClick={clearSelection}>Clear</button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-[11px] text-gray-500">Click an element in the preview to edit its {rightTab === 'content' ? 'content' : rightTab === 'style' ? 'design' : 'effects'}.</div>
              )}
            </div>



          </div>
        )}
      </div>
    </div>
  )
}

// Layers Panel: Beautiful DOM tree with element type icons
function LayersPanel({ iframeRef, selectedPath, hoveredPath, onSelectPath, onHoverPath }: { iframeRef: React.RefObject<HTMLIFrameElement>, selectedPath?: string | null, hoveredPath?: string | null, onSelectPath: (path: string) => void, onHoverPath?: (path: string | null) => void }) {
  type LayerNode = { label: string; path: string; children: LayerNode[]; id?: string; classes?: string }
  const [tree, setTree] = useState<LayerNode[]>([])
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [dragSource, setDragSource] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ path: string; pos: 'before' | 'inside' | 'after' } | null>(null)

  const isContainer = (el: Element) => {
    return el.children && el.children.length >= 0
  }

  // Helper to get icon for element type
  const getElementIcon = (tagName: string) => {
    const tag = tagName.toLowerCase()
    const iconClass = "w-4 h-4"

    // Layout elements
    if (tag === 'div' || tag === 'section' || tag === 'article' || tag === 'main' || tag === 'aside' || tag === 'nav' || tag === 'header' || tag === 'footer') {
      return <svg className={iconClass} viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" /></svg>
    }
    // Text elements
    if (tag.match(/^h[1-6]$/)) {
      return <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h3v10H2V3zm9 0h3v10h-3V3zM6 7h4v2H6V7z" /></svg>
    }
    if (tag === 'p' || tag === 'span') {
      return <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="3" width="12" height="2" rx="1" /><rect x="2" y="7" width="10" height="2" rx="1" /><rect x="2" y="11" width="8" height="2" rx="1" /></svg>
    }
    // Interactive elements
    if (tag === 'button' || tag === 'a') {
      return <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="5" width="12" height="6" rx="3" /></svg>
    }
    if (tag === 'input' || tag === 'textarea') {
      return <svg className={iconClass} viewBox="0 0 16 16" fill="none"><rect x="1" y="5" width="14" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" /></svg>
    }
    // Media
    if (tag === 'img') {
      return <svg className={iconClass} viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" /><circle cx="5" cy="5" r="1.5" fill="currentColor" /><path d="M1 12l4-4 3 3 5-5" stroke="currentColor" strokeWidth="1.5" /></svg>
    }
    if (tag === 'svg') {
      return <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor"><polygon points="8,2 11,8 8,14 5,8" /></svg>
    }
    // Lists
    if (tag === 'ul' || tag === 'ol') {
      return <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="4" r="1" /><rect x="6" y="3" width="8" height="2" rx="1" /><circle cx="3" cy="8" r="1" /><rect x="6" y="7" width="8" height="2" rx="1" /><circle cx="3" cy="12" r="1" /><rect x="6" y="11" width="8" height="2" rx="1" /></svg>
    }
    if (tag === 'li') {
      return <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.5" /><rect x="6" y="7" width="8" height="2" rx="1" /></svg>
    }
    // Default
    return <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="3" width="10" height="10" rx="1" /></svg>
  }

  // Local utilities to resolve/compute element paths within iframe DOM
  const computeElementPathLocal = (doc: Document, el: Element): string => {
    const path: number[] = []
    let cursor: Element | null = el
    while (cursor && cursor !== doc.body) {
      const parentEl: Element | null = cursor.parentElement
      if (!parentEl) break
      const index = Array.prototype.indexOf.call(parentEl.children, cursor)
      path.unshift(index)
      cursor = parentEl
    }
    return path.join('.')
  }

  const resolvePathToElementLocal = (doc: Document, path: string): Element | null => {
    const parts = path.split('.').map(n => parseInt(n, 10)).filter(n => !Number.isNaN(n))
    let cursor: Element = doc.body
    for (const idx of parts) {
      if (!cursor.children || !cursor.children[idx]) return null
      cursor = cursor.children[idx]
    }
    return cursor
  }

  const buildTreeFromDom = () => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) { setTree([]); return }
    const walk = (el: Element, prefix: number[]): LayerNode[] => {
      return Array.from(el.children).map((child, idx) => {
        const pathArr = [...prefix, idx]
        const path = pathArr.join('.')
        const label = child.tagName.toLowerCase()
        const id = child.getAttribute('id')
        const classes = child.getAttribute('class')
        return {
          label,
          path,
          id: id || undefined,
          classes: classes || undefined,
          children: walk(child, pathArr)
        }
      })
    }
    const rootChildren = walk(doc.body, [])
    setTree(rootChildren)
  }

  useEffect(() => {
    buildTreeFromDom()
    const int = setInterval(buildTreeFromDom, 800)
    return () => clearInterval(int)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeRef])

  const toggleCollapse = (path: string) => {
    setCollapsed(prev => ({ ...prev, [path]: !prev[path] }))
  }

  const handleDragStart = (path: string) => {
    setDragSource(path)
  }
  const handleDragOver = (e: React.DragEvent, targetPath: string) => {
    e.preventDefault()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const y = e.clientY - rect.top
    const pos = y < rect.height / 3 ? 'before' : y > rect.height * 2 / 3 ? 'after' : 'inside'
    setDropTarget({ path: targetPath, pos })
  }
  const handleDrop = (targetPath: string) => {
    if (!dragSource || !iframeRef.current) return
    const doc = iframeRef.current.contentDocument
    if (!doc) return
    const srcEl = resolvePathToElementLocal(doc, dragSource)
    const tgtEl = resolvePathToElementLocal(doc, targetPath)
    if (!srcEl || !tgtEl) return

    try {
      if (dropTarget?.pos === 'inside' && isContainer(tgtEl)) {
        tgtEl.appendChild(srcEl)
      } else if (dropTarget?.pos === 'before') {
        tgtEl.parentElement?.insertBefore(srcEl, tgtEl)
      } else if (dropTarget?.pos === 'after') {
        tgtEl.parentElement?.insertBefore(srcEl, tgtEl.nextSibling)
      } else {
        tgtEl.parentElement?.insertBefore(srcEl, tgtEl)
      }
    } finally {
      const newPath = computeElementPathLocal(doc, srcEl)
      buildTreeFromDom()
      onSelectPath(newPath)
      setDragSource(null)
      setDropTarget(null)
    }
  }

  const renderNode = (node: LayerNode, depth: number = 0) => {
    const isCollapsed = collapsed[node.path]
    const isDropHere = dropTarget && dropTarget.path === node.path
    const isSelected = selectedPath === node.path
    const isHovered = hoveredPath === node.path
    const hasChildren = node.children.length > 0

    return (
      <li key={node.path} className="select-none">
        <div
          draggable
          onDragStart={() => handleDragStart(node.path)}
          onDragOver={(e) => handleDragOver(e, node.path)}
          onDrop={() => handleDrop(node.path)}
          onMouseEnter={() => onHoverPath?.(node.path)}
          onMouseLeave={() => onHoverPath?.(null)}
          className={`group flex items-center gap-2 px-2 py-2 text-xs cursor-pointer rounded-lg transition-all ${isSelected
            ? 'bg-gradient-to-r from-[#2D1B69]/10 to-[#6366F1]/10 text-[#2D1B69] shadow-sm'
            : isHovered
              ? 'bg-gray-50'
              : 'hover:bg-gray-50'
            } ${isDropHere ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
          onClick={() => onSelectPath(node.path)}
          title={node.path}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {/* Expand/Collapse chevron */}
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            {hasChildren ? (
              <button
                onClick={(e) => { e.stopPropagation(); toggleCollapse(node.path) }}
                className={`p-0.5 rounded hover:bg-gray-200 transition-transform ${isCollapsed ? '' : 'rotate-0'}`}
              >
                <ChevronRight size={12} className={`transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
              </button>
            ) : null}
          </div>

          {/* Element type icon */}
          <div className={`flex-shrink-0 ${isSelected ? 'text-[#6366F1]' : 'text-gray-500 group-hover:text-gray-700'}`}>
            {getElementIcon(node.label)}
          </div>

          {/* Element label and metadata */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className={`font-medium truncate ${isSelected ? 'text-[#2D1B69]' : 'text-gray-700'}`}>
              {node.label}
            </span>
            {node.id && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono">
                #{node.id}
              </span>
            )}
          </div>

          {/* Children count badge */}
          {hasChildren && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected
              ? 'bg-[#6366F1]/20 text-[#6366F1]'
              : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
              }`}>
              {node.children.length}
            </span>
          )}
        </div>

        {/* Render children */}
        {!isCollapsed && hasChildren && (
          <ul className="mt-0.5 relative">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-gray-200 to-transparent" style={{ marginLeft: `${depth * 12 + 16}px` }} />
            {node.children.map(child => renderNode(child, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm text-gray-800">Layers</div>
          <div className="text-xs text-gray-500">{tree.length} root</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {tree.length > 0 ? (
          <ul className="space-y-0.5">
            {tree.map(n => renderNode(n))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <LayersIcon className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-xs text-gray-500">No layers found</p>
          </div>
        )}
      </div>
    </div>
  )
}

// (hover sync effect moved into component body earlier)

// Elements Panel
function ElementsPanel({ onAdd, onlyText }: { onAdd: (type: PaletteElementType) => void, onlyText?: boolean }) {
  // Helper to provide a short description / visual hint for an element
  const hint = (type: PaletteElementType) => {
    switch (type) {
      case 'button': return 'CTA button - primary action'
      case 'input': return 'Single-line input field'
      case 'image': return 'Display an image or cover'
      case 'icon': return 'Small decorative icon'
      case 'container': return 'Container to group content'
      case 'divider': return 'Thin separator line'
      case 'columns-2': return 'Two-column layout'
      case 'columns-3': return 'Three-column layout'
      case 'hero': return 'Large hero section'
      case 'gallery': return 'Grid of images'
      case 'product-card': return 'Compact product card'
      case 'heading': return 'Section heading'
      case 'paragraph': return 'Paragraph / body text'
      default: return ''
    }
  }

  return (
    <div className="p-3">
      <div className="font-semibold mb-3">{onlyText ? 'Text' : 'Elements'}</div>
      <div className="grid grid-cols-1 gap-3">
        {!onlyText && (
          <>
            <PaletteItem label="Button" type="button" onAdd={onAdd} hintText={hint('button')} icon={<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="4" width="28" height="12" rx="6" fill="#6366F1" /></svg>} />
            <PaletteItem label="Input" type="input" onAdd={onAdd} hintText={hint('input')} icon={<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="4" width="28" height="12" rx="4" fill="#E5E7EB" /><rect x="4" y="8" width="20" height="2" rx="1" fill="#9CA3AF" /></svg>} />
            <PaletteItem label="Image" type="image" onAdd={onAdd} hintText={hint('image')} icon={<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="28" height="20" rx="4" fill="#F3F4F6" /><circle cx="8" cy="8" r="2" fill="#9CA3AF" /><rect x="3" y="12" width="22" height="4" fill="#E5E7EB" /></svg>} />
            <PaletteItem label="Icon" type="icon" onAdd={onAdd} hintText={hint('icon')} icon={<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="14,2 17,11 26,11 19,16 22,24 14,19 6,24 9,16 2,11 11,11" fill="#F59E0B" /></svg>} />
            <PaletteItem label="Container" type="container" onAdd={onAdd} hintText={hint('container')} icon={<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="26" height="18" rx="3" stroke="#D1D5DB" strokeWidth="1.5" /></svg>} />
            <PaletteItem label="Divider" type="divider" onAdd={onAdd} hintText={hint('divider')} icon={<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="9" width="24" height="2" rx="1" fill="#E5E7EB" /></svg>} />
            <PaletteItem label="2 Columns" type="columns-2" onAdd={onAdd} hintText={hint('columns-2')} icon={<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="12" height="18" rx="2" fill="#F8FAFC" stroke="#E6E9EE" /><rect x="15" y="1" width="12" height="18" rx="2" fill="#F8FAFC" stroke="#E6E9EE" /></svg>} />
            <PaletteItem label="3 Columns" type="columns-3" onAdd={onAdd} hintText={hint('columns-3')} icon={<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="8" height="18" rx="2" fill="#F8FAFC" stroke="#E6E9EE" /><rect x="10" y="1" width="8" height="18" rx="2" fill="#F8FAFC" stroke="#E6E9EE" /><rect x="19" y="1" width="8" height="18" rx="2" fill="#F8FAFC" stroke="#E6E9EE" /></svg>} />
            <PaletteItem label="Hero" type="hero" onAdd={onAdd} hintText={hint('hero')} icon={<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="28" height="20" rx="3" fill="#EEF2FF" /><rect x="3" y="3" width="22" height="6" rx="2" fill="#6366F1" /></svg>} />
            <PaletteItem label="Gallery" type="gallery" onAdd={onAdd} hintText={hint('gallery')} icon={<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="8" height="8" rx="1" fill="#F3F4F6" stroke="#E5E7EB" /><rect x="10" y="1" width="8" height="8" rx="1" fill="#F3F4F6" stroke="#E5E7EB" /><rect x="19" y="1" width="8" height="8" rx="1" fill="#F3F4F6" stroke="#E5E7EB" /></svg>} />
            <PaletteItem label="Product Card" type="product-card" onAdd={onAdd} hintText={hint('product-card')} icon={<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="26" height="18" rx="3" fill="#FFFFFF" stroke="#E6E9EE" /><rect x="3" y="3" width="8" height="8" rx="2" fill="#F3F4F6" /><rect x="13" y="4" width="12" height="3" rx="1" fill="#E5E7EB" /></svg>} />
          </>
        )}
        <PaletteItem label="Heading" type="heading" onAdd={onAdd} hintText={hint('heading')} icon={<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="24" height="3" rx="1" fill="#111827" /><rect x="2" y="10" width="18" height="3" rx="1" fill="#111827" /></svg>} />
        <PaletteItem label="Paragraph" type="paragraph" onAdd={onAdd} hintText={hint('paragraph')} icon={<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3" width="24" height="2" rx="1" fill="#9CA3AF" /><rect x="2" y="7" width="20" height="2" rx="1" fill="#9CA3AF" /><rect x="2" y="11" width="16" height="2" rx="1" fill="#9CA3AF" /></svg>} />
      </div>
    </div>
  )
}

function PaletteItem({ label, type, onAdd, hintText, icon }: { label: string, type: PaletteElementType, onAdd: (t: PaletteElementType) => void, hintText?: string, icon?: React.ReactNode }) {
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/x-editor-element', type)
    e.dataTransfer.setData('text/plain', type)
    e.dataTransfer.effectAllowed = 'copy'
  }
  return (
    <button
      className="group flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-left"
      onClick={() => onAdd(type)}
      draggable
      onDragStart={onDragStart}
      title={hintText || label}
    >
      <div className="w-10 h-8 flex items-center justify-center rounded-md bg-gradient-to-br from-white to-[#F8FAFF] border border-gray-100">
        {icon || <svg className="w-6 h-4 text-gray-400" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="22" height="14" rx="2" stroke="#E5E7EB" /></svg>}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {hintText && <div className="text-xs text-gray-500 mt-0.5">{hintText}</div>}
      </div>
    </button>
  )
}

// Overlay: shows quick actions above the selected element in the canvas
function SelectionActionsOverlay({ iframeRef, selectedPath, scale, onChangeSelectedPath }: { iframeRef: React.RefObject<HTMLIFrameElement>, selectedPath: string, scale: number, onChangeSelectedPath: (p: string | null) => void }) {
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null)
  // Local helpers (mirror editor utilities) to avoid scope issues
  const computeElementPathLocal = (doc: Document, el: Element): string => {
    const path: number[] = []
    let cursor: Element | null = el
    while (cursor && cursor !== doc.body) {
      const parentEl: Element | null = cursor.parentElement
      if (!parentEl) break
      const index = Array.prototype.indexOf.call(parentEl.children, cursor)
      path.unshift(index)
      cursor = parentEl
    }
    return path.join('.')
  }
  const resolvePathToElementLocal = (doc: Document, path: string): Element | null => {
    const parts = path.split('.').map(n => parseInt(n, 10)).filter(n => !Number.isNaN(n))
    let cursor: Element = doc.body
    for (const idx of parts) {
      if (!cursor.children || !cursor.children[idx]) return null
      cursor = cursor.children[idx]
    }
    return cursor
  }
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc || !selectedPath) { setRect(null); return }
    const el = resolvePathToElementLocal(doc, selectedPath) as HTMLElement | null
    if (!el) { setRect(null); return }
    // Compute position relative to the iframe body using offsets, then scale
    const getOffsets = (node: HTMLElement) => {
      let top = 0, left = 0
      let cur: HTMLElement | null = node
      while (cur && cur !== doc.body) {
        top += cur.offsetTop
        left += cur.offsetLeft
        cur = cur.offsetParent as HTMLElement | null
      }
      return { top, left }
    }
    const offsets = getOffsets(el)
    const r = el.getBoundingClientRect()
    setRect({ top: offsets.top * scale, left: offsets.left * scale, width: r.width * scale, height: r.height * scale })
  }, [selectedPath, scale])

  const actDelete = () => {
    const doc = iframeRef.current?.contentDocument
    if (!doc || !selectedPath) return
    const el = resolvePathToElementLocal(doc, selectedPath)
    if (!el || !el.parentElement) return
    el.parentElement.removeChild(el)
    onChangeSelectedPath(null)
  }

  const actDuplicate = () => {
    const doc = iframeRef.current?.contentDocument
    if (!doc || !selectedPath) return
    const el = resolvePathToElementLocal(doc, selectedPath)
    if (!el || !el.parentElement) return
    const copy = el.cloneNode(true)
    el.parentElement.insertBefore(copy, el.nextSibling)
    const newPath = computeElementPathLocal(doc, copy as Element)
    onChangeSelectedPath(newPath)
  }

  const actMoveUp = () => {
    const doc = iframeRef.current?.contentDocument
    if (!doc || !selectedPath) return
    const el = resolvePathToElementLocal(doc, selectedPath)
    if (!el || !el.parentElement) return
    const prev = el.previousElementSibling
    if (prev) {
      el.parentElement.insertBefore(el, prev)
      const newPath = computeElementPathLocal(doc, el)
      onChangeSelectedPath(newPath)
    }
  }

  const actMoveDown = () => {
    const doc = iframeRef.current?.contentDocument
    if (!doc || !selectedPath) return
    const el = resolvePathToElementLocal(doc, selectedPath)
    if (!el || !el.parentElement) return
    const next = el.nextElementSibling
    if (next) {
      el.parentElement.insertBefore(el, next.nextSibling)
      const newPath = computeElementPathLocal(doc, el)
      onChangeSelectedPath(newPath)
    }
  }

  if (!rect) return null
  // Place action bar along the top edge of the selection rectangle
  // Raise quick actions slightly higher above the selection rectangle
  const barTop = Math.max(0, rect.top - 36)
  const barLeft = rect.left
  return (
    <>
      {/* Selection rectangle – single blue border */}
      <div style={{ position: 'absolute', top: rect.top, left: rect.left, width: rect.width, height: rect.height, pointerEvents: 'none', boxSizing: 'border-box', border: '2px solid #3B82F6', borderRadius: '2px' }} />
      {/* Quick actions on the top edge */}
      <div style={{ position: 'absolute', top: barTop, left: barLeft, pointerEvents: 'auto' }}>
        <div className="inline-flex items-center gap-1 px-1.5 py-1 rounded-md bg-white/95 border shadow-sm">
          <button className="p-1 rounded hover:bg-gray-100" title="Delete" onClick={actDelete}><Trash2 size={14} /></button>
          <button className="p-1 rounded hover:bg-gray-100" title="Duplicate" onClick={actDuplicate}><Copy size={14} /></button>
          <button className="p-1 rounded hover:bg-gray-100" title="Move Up" onClick={actMoveUp}><ChevronUp size={14} /></button>
          <button className="p-1 rounded hover:bg-gray-100" title="Move Down" onClick={actMoveDown}><ChevronDown size={14} /></button>
        </div>
      </div>
    </>
  )
}

function HoverRectOverlay({ iframeRef, hoveredPath, scale, selectedPath }: { iframeRef: React.RefObject<HTMLIFrameElement>, hoveredPath: string, scale: number, selectedPath?: string | null }) {
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null)
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument
    // Show hover border even when something is selected, but not on the same element
    if (!doc || !hoveredPath || (selectedPath && hoveredPath === selectedPath)) { setRect(null); return }
    const resolve = (d: Document, path: string) => {
      const parts = path.split('.').map(n => parseInt(n, 10)).filter(n => !Number.isNaN(n))
      let cursor: Element = d.body
      for (const i of parts) { if (!cursor.children[i]) return null; cursor = cursor.children[i] }
      return cursor as HTMLElement
    }
    const el = resolve(doc, hoveredPath)
    if (!el) { setRect(null); return }
    const getOffsets = (node: HTMLElement) => {
      let top = 0, left = 0
      let cur: HTMLElement | null = node
      while (cur && cur !== doc.body) { top += cur.offsetTop; left += cur.offsetLeft; cur = cur.offsetParent as HTMLElement | null }
      return { top, left }
    }
    const offsets = getOffsets(el)
    const r = el.getBoundingClientRect()
    setRect({ top: offsets.top * scale, left: offsets.left * scale, width: r.width * scale, height: r.height * scale })
  }, [hoveredPath, selectedPath, scale])
  if (!rect) return null
  return (
    <div style={{ position: 'absolute', top: rect.top, left: rect.left, width: rect.width, height: rect.height, pointerEvents: 'none', boxSizing: 'border-box', border: '2px dashed #3B82F6', borderRadius: '2px' }} />
  )
}