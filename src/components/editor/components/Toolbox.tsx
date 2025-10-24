'use client'

import React, { useState } from 'react'
import { useEditor, Element } from '@craftjs/core'
import {
  Type,
  Heading1,
  MousePointer,
  Image,
  Video,
  Minus,
  Square,
  Layout,
  Grid3X3,
  Columns,
  Layers,
  ChevronDown,
  Star,
  ShoppingCart,
  MessageSquare,
  Upload,
  FileText,
  Search,
} from 'lucide-react'

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
import type { Template } from '../templates'

interface ToolboxProps {
  selectedTool: string
  onToolSelect: (tool: string) => void
  onShowAssetManager: () => void
  onShowTemplateManager?: () => void
  templates: Template[]
  onLoadTemplate: (template: Template) => void
  className?: string
}

interface BlockCategory {
  id: string
  name: string
  icon: React.ReactNode
  blocks: BlockItem[]
}

interface BlockItem {
  id: string
  name: string
  icon: React.ReactNode
  component: React.ComponentType<any>
  props?: Record<string, unknown>
  description: string
}

export const Toolbox: React.FC<ToolboxProps> = ({
  selectedTool,
  onToolSelect,
  onShowAssetManager,
  onShowTemplateManager,
  templates,
  onLoadTemplate,
  className,
}) => {
  const { connectors } = useEditor()
  const [activeCategory, setActiveCategory] = useState('basic')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'basic',
  ])

  const blockCategories: BlockCategory[] = [
    {
      id: 'basic',
      name: 'Basic Blocks',
      icon: <Type className="h-4 w-4" />,
      blocks: [
        {
          id: 'text',
          name: 'Text',
          icon: <Type className="h-4 w-4" />,
          component: TextBlock,
          props: { text: 'Edit this text' },
          description: 'Add editable text content',
        },
        {
          id: 'heading',
          name: 'Heading',
          icon: <Heading1 className="h-4 w-4" />,
          component: HeadingBlock,
          props: { text: 'Heading', level: 1 },
          description: 'Add heading text (H1-H6)',
        },
        {
          id: 'button',
          name: 'Button',
          icon: <MousePointer className="h-4 w-4" />,
          component: ButtonBlock,
          props: { text: 'Click me', variant: 'primary' },
          description: 'Add clickable button',
        },
        {
          id: 'divider',
          name: 'Divider',
          icon: <Minus className="h-4 w-4" />,
          component: DividerBlock,
          props: { style: 'solid', color: '#e5e7eb' },
          description: 'Add horizontal divider line',
        },
        {
          id: 'spacer',
          name: 'Spacer',
          icon: <Square className="h-4 w-4" />,
          component: SpacerBlock,
          props: { height: 40 },
          description: 'Add vertical spacing',
        },
        {
          id: 'icon',
          name: 'Icon',
          icon: <Star className="h-4 w-4" />,
          component: IconBlock,
          props: { icon: 'Star', size: 24, color: '#000000' },
          description: 'Add customizable icons',
        },
      ],
    },
    {
      id: 'media',
      name: 'Media Blocks',
      icon: <Image className="h-4 w-4" />,
      blocks: [
        {
          id: 'image',
          name: 'Image',
          icon: <Image className="h-4 w-4" />,
          component: ImageBlock,
          props: { src: '', alt: 'Image', width: '100%' },
          description: 'Add images with customizable properties',
        },
        {
          id: 'video',
          name: 'Video',
          icon: <Video className="h-4 w-4" />,
          component: VideoBlock,
          props: { src: '', autoplay: false, controls: true },
          description: 'Embed videos from URL or upload',
        },
      ],
    },
    {
      id: 'layout',
      name: 'Layout Blocks',
      icon: <Layout className="h-4 w-4" />,
      blocks: [
        {
          id: 'container',
          name: 'Container',
          icon: <Square className="h-4 w-4" />,
          component: ContainerBlock,
          props: { padding: 16, backgroundColor: 'transparent' },
          description: 'Responsive container for grouping elements',
        },
        {
          id: 'grid',
          name: 'Grid',
          icon: <Grid3X3 className="h-4 w-4" />,
          component: GridBlock,
          props: { columns: 2, rows: 2, gap: 16 },
          description: 'CSS Grid layout system',
        },
        {
          id: 'flexbox',
          name: 'Flexbox',
          icon: <Layers className="h-4 w-4" />,
          component: FlexboxBlock,
          props: {
            direction: 'row',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            itemCount: 3,
          },
          description: 'Flexible box layout',
        },
      ],
    },
    {
      id: 'advanced',
      name: 'Advanced Blocks',
      icon: <Layers className="h-4 w-4" />,
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
          description: 'Tabbed content sections',
        },
        {
          id: 'accordion',
          name: 'Accordion',
          icon: <ChevronDown className="h-4 w-4" />,
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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const filteredCategories = blockCategories
    .map(category => ({
      ...category,
      blocks: category.blocks.filter(
        block =>
          block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          block.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter(category => category.blocks.length > 0)

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
      className="group cursor-move rounded-md bg-gray-100 p-2 transition-colors hover:bg-gray-200"
    >
      <div className="flex items-center justify-center">
        <div className="h-3 w-3 text-gray-600 group-hover:text-gray-800">
          {block.icon}
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <div className="truncate text-[11px] font-medium text-gray-800">
            {block.name}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`flex h-full flex-col ${className || ''}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-3">
        <h2 className="text-md mb-2 font-semibold text-gray-900">Components</h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded border border-gray-300 py-1.5 pl-7 pr-2 text-xs focus:border-transparent focus:outline-none focus:ring-1 focus:ring-[#2D1B69]"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-b border-gray-200 p-2">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={onShowAssetManager}
            className="flex items-center justify-center rounded-md bg-gray-100 p-2 text-xs text-gray-700 transition-colors hover:bg-gray-200"
          >
            <Upload className="mr-1 h-3 w-3" />
            Assets
          </button>
          <button
            onClick={onShowTemplateManager}
            className="flex items-center justify-center rounded-md bg-gray-100 p-2 text-xs text-gray-700 transition-colors hover:bg-gray-200"
          >
            <FileText className="mr-1 h-3 w-3" />
            Templates
          </button>
        </div>
      </div>

      {/* Block Categories */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="max-h-full space-y-2 p-2">
          {filteredCategories.map(category => (
            <div key={category.id} className="space-y-1">
              <button
                onClick={() => toggleCategory(category.id)}
                className="flex w-full items-center justify-between rounded-md bg-gray-100 p-2 text-left text-xs font-medium text-gray-800 transition-colors hover:bg-gray-200 hover:text-gray-900"
              >
                <div className="flex items-center">
                  {category.icon}
                  <span className="ml-2 font-semibold">{category.name}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedCategories.includes(category.id) ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedCategories.includes(category.id) && (
                <div className="ml-2 grid grid-cols-2 gap-2">
                  {category.blocks.map(renderBlock)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Templates Section */}
      {templates.length > 0 && (
        <div className="border-t border-gray-200 p-2">
          <h3 className="mb-1 text-xs font-medium text-gray-900">Templates</h3>
          <div className="space-y-1">
            {templates.slice(0, 3).map((template, index) => (
              <button
                key={index}
                onClick={() => onLoadTemplate(template)}
                className="w-full truncate rounded-md bg-gray-100 p-1.5 text-left text-xs text-gray-800 transition-colors hover:bg-gray-200"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
