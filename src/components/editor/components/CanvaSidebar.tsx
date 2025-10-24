'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Type,
  Image,
  Upload,
  Layers,
  Settings,
  FileText,
  Palette,
  Shapes,
  Grid3X3,
  Star,
  Video,
  MessageSquare,
  ChevronRight,
  Search,
  X,
  // Standard UI Icons - Arrows
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  // Standard UI Icons - Actions
  Plus,
  Minus,
  Check,
  Edit,
  Trash2,
  Copy,
  Download,
  Share2,
  // Standard UI Icons - Navigation
  Home,
  Menu,
  MoreHorizontal,
  MoreVertical,
  // Standard UI Icons - Status
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  // Standard UI Icons - Common
  Heart,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Shield,
} from 'lucide-react'
import { useEditor, Element } from '@craftjs/core'

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
} from '../blocks'
import { LayersPanel } from './LayersPanel'
import { PageNavigator } from '../ui/PageNavigator'
import type { UseMultiPageReturn } from '../hooks'

interface CanvaSidebarProps {
  onShowAssetManager: () => void
  onShowTemplateManager: () => void
  onHideInspector?: () => void
  multiPage?: UseMultiPageReturn
  className?: string
}

interface SidebarTab {
  id: string
  name: string
  icon: React.ReactNode
  tooltip: string
}

interface BlockItem {
  id: string
  name: string
  icon: React.ReactNode
  component: React.ComponentType<any>
  props?: Record<string, unknown>
  description: string
}

interface BlockCategory {
  id: string
  name: string
  blocks: BlockItem[]
}

export const CanvaSidebar: React.FC<CanvaSidebarProps> = ({
  onShowAssetManager,
  onShowTemplateManager,
  onHideInspector,
  multiPage,
  className = '',
}) => {
  const { query, actions, connectors } = useEditor()
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setActiveTab(null)
      }
    }

    if (activeTab) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeTab])

  const sidebarTabs: SidebarTab[] = [
    {
      id: 'pages',
      name: 'Pages',
      icon: <FileText className="h-6 w-6" />,
      tooltip: 'Pages',
    },
    {
      id: 'layers',
      name: 'Layers',
      icon: <Layers className="h-6 w-6" />,
      tooltip: 'Layers',
    },
    {
      id: 'templates',
      name: 'Templates',
      icon: <Palette className="h-6 w-6" />,
      tooltip: 'Templates',
    },
    {
      id: 'elements',
      name: 'Elements',
      icon: <Shapes className="h-6 w-6" />,
      tooltip: 'Elements',
    },
    {
      id: 'icons',
      name: 'Icons',
      icon: <Star className="h-6 w-6" />,
      tooltip: 'Icons',
    },
    {
      id: 'text',
      name: 'Text',
      icon: <Type className="h-6 w-6" />,
      tooltip: 'Text',
    },
    {
      id: 'assets',
      name: 'Assets',
      icon: <Upload className="h-6 w-6" />,
      tooltip: 'Assets',
    },
  ]

  // Function to get category icons
  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'basic':
        return <Shapes className="h-4 w-4" />
      case 'media':
        return <Image className="h-4 w-4" />
      case 'layout':
        return <Grid3X3 className="h-4 w-4" />
      case 'interactive':
        return <Settings className="h-4 w-4" />
      default:
        return <Shapes className="h-4 w-4" />
    }
  }

  const blockCategories: BlockCategory[] = [
    {
      id: 'basic',
      name: 'Basic Elements',
      blocks: [
        {
          id: 'text',
          name: 'Text',
          icon: <Type className="h-4 w-4" />,
          component: TextBlock,
          props: { text: 'Add a little bit of body text' },
          description: 'Add editable text content',
        },
        {
          id: 'heading',
          name: 'Heading',
          icon: <Type className="h-4 w-4" />,
          component: HeadingBlock,
          props: { text: 'Add a heading', level: 1 },
          description: 'Add heading text',
        },
        {
          id: 'button',
          name: 'Button',
          icon: <MessageSquare className="h-4 w-4" />,
          component: ButtonBlock,
          props: {
            text: 'Button',
            backgroundColor: '#2D1B69',
            textColor: '#ffffff',
          },
          description: 'Add clickable button',
        },
        {
          id: 'divider',
          name: 'Divider',
          icon: <Shapes className="h-4 w-4" />,
          component: DividerBlock,
          props: { thickness: 1, color: '#e5e7eb', margin: 16 },
          description: 'Add a horizontal line',
        },
        {
          id: 'spacer',
          name: 'Spacer',
          icon: <Shapes className="h-4 w-4" />,
          component: SpacerBlock,
          props: { height: 32 },
          description: 'Add vertical spacing',
        },
      ],
    },
    {
      id: 'media',
      name: 'Media',
      blocks: [
        {
          id: 'image',
          name: 'Image',
          icon: <Image className="h-4 w-4" />,
          component: ImageBlock,
          props: { src: '', alt: 'Image', width: '100%' },
          description: 'Add images',
        },
        {
          id: 'video',
          name: 'Video',
          icon: <Video className="h-4 w-4" />,
          component: VideoBlock,
          props: { src: '', autoplay: false, controls: true },
          description: 'Add videos',
        },
      ],
    },
    {
      id: 'layout',
      name: 'Layout',
      blocks: [
        {
          id: 'container',
          name: 'Frame',
          icon: <Shapes className="h-4 w-4" />,
          component: ContainerBlock,
          props: { padding: 16, backgroundColor: 'transparent' },
          description: 'Add a frame',
        },
        {
          id: 'grid',
          name: 'Grid',
          icon: <Grid3X3 className="h-4 w-4" />,
          component: GridBlock,
          props: { columns: 2, rows: 2, gap: 16 },
          description: 'Add a grid layout',
        },
        {
          id: 'flexbox',
          name: 'Flexbox',
          icon: <Layers className="h-4 w-4" />,
          component: FlexboxBlock,
          props: {
            direction: 'row',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 16,
          },
          description: 'Add flexible layout',
        },
      ],
    },
    {
      id: 'interactive',
      name: 'Interactive',
      blocks: [
        {
          id: 'tabs',
          name: 'Tabs',
          icon: <Layers className="h-4 w-4" />,
          component: TabsBlock,
          props: {
            tabs: [
              { id: '1', title: 'Tab 1', content: 'Content for tab 1' },
              { id: '2', title: 'Tab 2', content: 'Content for tab 2' },
            ],
            activeTab: '1',
          },
          description: 'Add tabbed content',
        },
        {
          id: 'accordion',
          name: 'Accordion',
          icon: <ChevronRight className="h-4 w-4" />,
          component: AccordionBlock,
          props: {
            items: [
              {
                id: '1',
                title: 'Section 1',
                content: 'Content for section 1',
                open: false,
              },
              {
                id: '2',
                title: 'Section 2',
                content: 'Content for section 2',
                open: false,
              },
            ],
          },
          description: 'Collapsible content sections',
        },
        {
          id: 'carousel',
          name: 'Carousel',
          icon: <Image className="h-4 w-4" />,
          component: CarouselBlock,
          props: {
            slides: [
              { id: '1', type: 'image', content: '', title: 'Slide 1' },
              { id: '2', type: 'image', content: '', title: 'Slide 2' },
            ],
            autoplay: false,
            showArrows: true,
            showDots: true,
          },
          description: 'Image and content carousel',
        },
        {
          id: 'form',
          name: 'Form',
          icon: <MessageSquare className="h-4 w-4" />,
          component: FormBlock,
          props: {
            fields: [
              {
                id: '1',
                type: 'text',
                label: 'Name',
                placeholder: 'Enter your name',
                required: true,
              },
              {
                id: '2',
                type: 'email',
                label: 'Email',
                placeholder: 'Enter your email',
                required: true,
              },
            ],
            submitText: 'Submit',
            action: '',
          },
          description: 'Interactive form with fields',
        },
      ],
    },
  ]

  const textBlocks: BlockItem[] = [
    {
      id: 'heading',
      name: 'Add a heading',
      icon: <Type className="h-4 w-4" />,
      component: HeadingBlock,
      props: { text: 'Add a heading', level: 1, fontSize: 32 },
      description: 'Large heading text',
    },
    {
      id: 'subheading',
      name: 'Add a subheading',
      icon: <Type className="h-4 w-4" />,
      component: HeadingBlock,
      props: { text: 'Add a subheading', level: 2, fontSize: 24 },
      description: 'Medium heading text',
    },
    {
      id: 'body-text',
      name: 'Add a little bit of body text',
      icon: <Type className="h-4 w-4" />,
      component: TextBlock,
      props: { text: 'Add a little bit of body text', fontSize: 16 },
      description: 'Regular body text',
    },
  ]

  const handleTabClick = (tabId: string) => {
    if (activeTab === tabId) {
      setActiveTab(null)
    } else {
      setActiveTab(tabId)
    }

    // Clear selected element when clicking on any sidebar tab
    // This will trigger the inspector to auto-collapse due to existing logic
    actions.clearEvents()

    // Hide inspector when switching to tabs other than 'layers'
    if (tabId !== 'layers' && onHideInspector) {
      onHideInspector()
    }
  }

  const renderBlock = (block: BlockItem) => (
    <div
      key={block.id}
      ref={ref => {
        if (ref) {
          connectors.create(
            ref,
            React.createElement(block.component, block.props)
          )
        }
      }}
      className="group cursor-move rounded-lg border border-gray-200 bg-white p-3 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2D1B69] focus:ring-offset-1"
      role="button"
      tabIndex={0}
      aria-label={`Add ${block.name} - ${block.description}`}
      title={`Click to add ${block.name}`}
      onClick={() => {
        const nodeTree = query
          .parseReactElement(React.createElement(block.component, block.props))
          .toNodeTree()
        actions.addNodeTree(nodeTree)
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          const nodeTree = query
            .parseReactElement(
              React.createElement(block.component, block.props)
            )
            .toNodeTree()
          actions.addNodeTree(nodeTree)
        }
      }}
    >
      <div className="flex items-center">
        <div
          className="mr-3 flex-shrink-0 text-xs text-gray-600 group-hover:text-gray-800"
          aria-hidden="true"
        >
          {block.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium text-gray-900">
            {block.name}
          </div>
          <div className="truncate text-[11px] text-gray-500">
            {block.description}
          </div>
        </div>
        <div className="ml-2 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="text-xs text-gray-400">
            <Plus className="h-3 w-3" />
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pages':
        if (!multiPage) {
          return (
            <div className="p-4">
              <div className="text-center text-sm text-gray-500">
                Page management not available
              </div>
            </div>
          )
        }
        return (
          <div className="h-full">
            <PageNavigator
              pages={multiPage.pages}
              currentPageId={multiPage.currentPageId || ''}
              currentPageData={query.serialize()}
              onPageSelect={multiPage.switchToPage}
              onPageAdd={multiPage.addPage}
              onPageDuplicate={multiPage.duplicatePage}
              onPageDelete={multiPage.deletePage}
              onPageRename={multiPage.renamePage}
              onPageReorder={multiPage.reorderPages}
              className="h-full"
            />
          </div>
        )

      case 'layers':
        return <LayersPanel />

      case 'templates':
        return (
          <div className="p-4">
            <button
              onClick={onShowTemplateManager}
              className="w-full rounded-lg bg-gradient-to-r from-[#2D1B69]/10 to-[#6366F1]/10 p-2 text-sm text-[#2D1B69] transition-all duration-200 hover:from-[#2D1B69]/20 hover:to-[#6366F1]/20"
            >
              Browse all templates
            </button>
          </div>
        )

      case 'text':
        return (
          <div className="p-4">
            <div className="space-y-3">{textBlocks.map(renderBlock)}</div>
          </div>
        )

      case 'elements':
        const filteredCategories = blockCategories
          .map(category => ({
            ...category,
            blocks: category.blocks.filter(
              block =>
                block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                block.description
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
            ),
          }))
          .filter(category => category.blocks.length > 0)

        return (
          <div className="p-4">
            {/* Search Input */}
            <div className="relative mb-4">
              <label htmlFor="element-search" className="sr-only">
                Search elements
              </label>
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
                aria-hidden="true"
              />
              <input
                id="element-search"
                type="text"
                placeholder="Search elements..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 text-sm focus:border-transparent focus:ring-2 focus:ring-[#2D1B69]"
                aria-describedby="element-search-help"
              />
              <div id="element-search-help" className="sr-only">
                Type to search through all available elements
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 focus:text-gray-600 focus:outline-none"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Elements by Category */}
            <div className="space-y-6">
              {filteredCategories.map(category => (
                <div key={category.id}>
                  <div className="mb-3 flex items-center">
                    <div className="mr-2 text-gray-600">
                      {getCategoryIcon(category.id)}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {category.name}
                    </h3>
                    <span className="ml-2 text-xs text-gray-500">
                      ({category.blocks.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {category.blocks.map(block => renderBlock(block))}
                  </div>
                </div>
              ))}
            </div>

            {filteredCategories.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">No elements found</p>
                <p className="mt-1 text-xs">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        )

      case 'icons':
        // Define actual icon components for the icons tab
        const iconList = [
          {
            id: 'star',
            name: 'Star',
            icon: <Star className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Star', size: 24, color: '#2D1B69' },
          },
          {
            id: 'heart',
            name: 'Heart',
            icon: <Heart className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Heart', size: 24, color: '#2D1B69' },
          },
          {
            id: 'user',
            name: 'User',
            icon: <User className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'User', size: 24, color: '#2D1B69' },
          },
          {
            id: 'mail',
            name: 'Mail',
            icon: <Mail className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Mail', size: 24, color: '#2D1B69' },
          },
          {
            id: 'phone',
            name: 'Phone',
            icon: <Phone className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Phone', size: 24, color: '#2D1B69' },
          },
          {
            id: 'map-pin',
            name: 'Map Pin',
            icon: <MapPin className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'MapPin', size: 24, color: '#2D1B69' },
          },
          {
            id: 'calendar',
            name: 'Calendar',
            icon: <Calendar className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Calendar', size: 24, color: '#2D1B69' },
          },
          {
            id: 'clock',
            name: 'Clock',
            icon: <Clock className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Clock', size: 24, color: '#2D1B69' },
          },
          {
            id: 'eye',
            name: 'Eye',
            icon: <Eye className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Eye', size: 24, color: '#2D1B69' },
          },
          {
            id: 'eye-off',
            name: 'Eye Off',
            icon: <EyeOff className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'EyeOff', size: 24, color: '#2D1B69' },
          },
          {
            id: 'lock',
            name: 'Lock',
            icon: <Lock className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Lock', size: 24, color: '#2D1B69' },
          },
          {
            id: 'unlock',
            name: 'Unlock',
            icon: <Unlock className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Unlock', size: 24, color: '#2D1B69' },
          },
          {
            id: 'shield',
            name: 'Shield',
            icon: <Shield className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Shield', size: 24, color: '#2D1B69' },
          },
          {
            id: 'arrow-up',
            name: 'Arrow Up',
            icon: <ArrowUp className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'ArrowUp', size: 24, color: '#2D1B69' },
          },
          {
            id: 'arrow-down',
            name: 'Arrow Down',
            icon: <ArrowDown className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'ArrowDown', size: 24, color: '#2D1B69' },
          },
          {
            id: 'arrow-left',
            name: 'Arrow Left',
            icon: <ArrowLeft className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'ArrowLeft', size: 24, color: '#2D1B69' },
          },
          {
            id: 'arrow-right',
            name: 'Arrow Right',
            icon: <ArrowRight className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'ArrowRight', size: 24, color: '#2D1B69' },
          },
          {
            id: 'chevron-up',
            name: 'Chevron Up',
            icon: <ChevronUp className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'ChevronUp', size: 24, color: '#2D1B69' },
          },
          {
            id: 'chevron-down',
            name: 'Chevron Down',
            icon: <ChevronDown className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'ChevronDown', size: 24, color: '#2D1B69' },
          },
          {
            id: 'chevron-left',
            name: 'Chevron Left',
            icon: <ChevronLeft className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'ChevronLeft', size: 24, color: '#2D1B69' },
          },
          {
            id: 'chevron-right',
            name: 'Chevron Right',
            icon: <ChevronRight className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'ChevronRight', size: 24, color: '#2D1B69' },
          },
          {
            id: 'plus',
            name: 'Plus',
            icon: <Plus className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Plus', size: 24, color: '#2D1B69' },
          },
          {
            id: 'minus',
            name: 'Minus',
            icon: <Minus className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Minus', size: 24, color: '#2D1B69' },
          },
          {
            id: 'check',
            name: 'Check',
            icon: <Check className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Check', size: 24, color: '#2D1B69' },
          },
          {
            id: 'edit',
            name: 'Edit',
            icon: <Edit className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Edit', size: 24, color: '#2D1B69' },
          },
          {
            id: 'trash-2',
            name: 'Trash',
            icon: <Trash2 className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Trash2', size: 24, color: '#2D1B69' },
          },
          {
            id: 'copy',
            name: 'Copy',
            icon: <Copy className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Copy', size: 24, color: '#2D1B69' },
          },
          {
            id: 'download',
            name: 'Download',
            icon: <Download className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Download', size: 24, color: '#2D1B69' },
          },
          {
            id: 'share-2',
            name: 'Share',
            icon: <Share2 className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Share2', size: 24, color: '#2D1B69' },
          },
          {
            id: 'home',
            name: 'Home',
            icon: <Home className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Home', size: 24, color: '#2D1B69' },
          },
          {
            id: 'menu',
            name: 'Menu',
            icon: <Menu className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Menu', size: 24, color: '#2D1B69' },
          },
          {
            id: 'more-horizontal',
            name: 'More Horizontal',
            icon: <MoreHorizontal className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'MoreHorizontal', size: 24, color: '#2D1B69' },
          },
          {
            id: 'more-vertical',
            name: 'More Vertical',
            icon: <MoreVertical className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'MoreVertical', size: 24, color: '#2D1B69' },
          },
          {
            id: 'alert-circle',
            name: 'Alert Circle',
            icon: <AlertCircle className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'AlertCircle', size: 24, color: '#2D1B69' },
          },
          {
            id: 'check-circle',
            name: 'Check Circle',
            icon: <CheckCircle className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'CheckCircle', size: 24, color: '#2D1B69' },
          },
          {
            id: 'x-circle',
            name: 'X Circle',
            icon: <XCircle className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'XCircle', size: 24, color: '#2D1B69' },
          },
          {
            id: 'info',
            name: 'Info',
            icon: <Info className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'Info', size: 24, color: '#2D1B69' },
          },
          {
            id: 'help-circle',
            name: 'Help Circle',
            icon: <HelpCircle className="h-4 w-4" />,
            component: IconBlock,
            props: { icon: 'HelpCircle', size: 24, color: '#2D1B69' },
          },
        ]

        // Filter icons based on search term
        const filteredIcons = iconList.filter(icon =>
          icon.name.toLowerCase().includes(searchTerm.toLowerCase())
        )

        return (
          <div className="p-4">
            {/* Search Input */}
            <div className="relative mb-4">
              <label htmlFor="icon-search" className="sr-only">
                Search icons
              </label>
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
                aria-hidden="true"
              />
              <input
                id="icon-search"
                type="text"
                placeholder="Search all icons..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 text-sm focus:border-transparent focus:ring-2 focus:ring-[#2D1B69]"
                aria-describedby="icon-search-help"
              />
              <div id="icon-search-help" className="sr-only">
                Type to search through all available icons
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 focus:text-gray-600 focus:outline-none"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Icons Grid */}
            <div className="grid grid-cols-6 gap-2">
              {filteredIcons.map((block, index) => (
                <div
                  key={`${block.name}-${index}`}
                  ref={ref => {
                    if (ref) {
                      connectors.create(
                        ref,
                        React.createElement(block.component, block.props)
                      )
                    }
                  }}
                  className="group flex h-10 w-10 cursor-move items-center justify-center rounded-lg border border-gray-200 transition-all duration-200 hover:border-[#2D1B69] hover:bg-[#2D1B69] hover:text-white"
                  onClick={() => {
                    const nodeTree = query
                      .parseReactElement(
                        React.createElement(block.component, block.props)
                      )
                      .toNodeTree()
                    actions.addNodeTree(nodeTree)
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Drag or click to add ${block.name} icon`}
                  title={`Drag or click to add ${block.name}`}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      const nodeTree = query
                        .parseReactElement(
                          React.createElement(block.component, block.props)
                        )
                        .toNodeTree()
                      actions.addNodeTree(nodeTree)
                    }
                  }}
                >
                  <div className="h-5 w-5 text-gray-600 transition-colors group-hover:text-white">
                    {block.icon}
                  </div>
                </div>
              ))}
            </div>

            {filteredIcons.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">No icons found</p>
              </div>
            )}
          </div>
        )

      case 'assets':
        return (
          <div className="p-4">
            <button
              onClick={onShowAssetManager}
              className="w-full rounded-lg bg-purple-50 p-2 text-sm text-purple-700 transition-colors hover:bg-purple-100"
            >
              Upload images
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div ref={sidebarRef} className={`flex h-full ${className || ''}`}>
      {/* Icon Sidebar */}
      <div className="m-2 flex w-16 flex-col items-center space-y-3 rounded-xl bg-white py-2 shadow-lg">
        {sidebarTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`group relative flex h-16 w-16 flex-col items-center justify-center rounded-lg transition-all duration-200 `}
            title={tab.tooltip}
          >
            <div
              className={`rounded-xl p-2 ${
                activeTab === tab.id
                  ? 'mb-1 bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
              }`}
            >
              {tab.icon}
            </div>
            <span className="text-center text-[11px] font-medium leading-tight">
              {tab.name}
            </span>
          </button>
        ))}
      </div>

      {/* Expandable Panel */}
      {activeTab && (
        <div className="m-2 flex w-72 flex-col rounded-xl bg-white shadow-lg">
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {sidebarTabs.find(tab => tab.id === activeTab)?.name}
            </h2>
            <button
              onClick={() => setActiveTab(null)}
              className="p-1 text-gray-400 transition-colors hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">{renderTabContent()}</div>
        </div>
      )}
    </div>
  )
}
