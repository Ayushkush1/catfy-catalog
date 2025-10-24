'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react'
import { CraftJSEditor } from '@/components/editor/CraftJSEditor'
import { getTemplateById } from '@/templates'
import { getThemeById } from '@/lib/theme-registry'
import { TemplateConfig } from '@/lib/template-registry'
import { ThemeConfig } from '@/lib/theme-registry'
import { cn } from '@/lib/utils'

interface TemplateEditorPreviewProps {
  templateId: string | null
  themeId?: string | null
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function TemplateEditorPreview({
  templateId,
  themeId,
  isOpen,
  onClose,
  className,
}: TemplateEditorPreviewProps) {
  const [template, setTemplate] = useState<TemplateConfig | null>(null)
  const [theme, setTheme] = useState<ThemeConfig | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (templateId) {
      setLoading(true)
      try {
        const templateData = getTemplateById(templateId)
        setTemplate(templateData || null)

        if (themeId) {
          const themeData = getThemeById(themeId)
          setTheme(themeData || null)
        }
      } catch (error) {
        console.error('Failed to load template/theme:', error)
      } finally {
        setLoading(false)
      }
    }
  }, [templateId, themeId])

  const generateSampleData = () => {
    return JSON.stringify({
      ROOT: {
        type: { resolvedName: 'ContainerBlock' },
        isCanvas: true,
        props: {
          className: 'min-h-screen bg-white',
          style: {
            backgroundColor: theme?.colors.background || '#ffffff',
            color: theme?.colors.text || '#000000',
          },
        },
        displayName: 'Container',
        custom: {},
        hidden: false,
        nodes: ['header', 'content', 'footer'],
        linkedNodes: {},
      },
      header: {
        type: { resolvedName: 'ContainerBlock' },
        isCanvas: true,
        props: {
          className: 'w-full p-8 text-center',
          style: {
            backgroundColor: theme?.colors.primary || '#3b82f6',
            color: '#ffffff',
          },
        },
        displayName: 'Header',
        custom: {},
        hidden: false,
        nodes: ['headerTitle'],
        linkedNodes: {},
        parent: 'ROOT',
      },
      headerTitle: {
        type: { resolvedName: 'HeadingBlock' },
        isCanvas: false,
        props: {
          text: template?.name || 'Template Preview',
          level: 1,
          className: 'text-4xl font-bold mb-2',
          style: {
            color: '#ffffff',
          },
        },
        displayName: 'Heading',
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
        parent: 'header',
      },
      content: {
        type: { resolvedName: 'ContainerBlock' },
        isCanvas: true,
        props: {
          className: 'w-full p-8',
          style: {},
        },
        displayName: 'Content',
        custom: {},
        hidden: false,
        nodes: ['contentText', 'sampleGrid'],
        linkedNodes: {},
        parent: 'ROOT',
      },
      contentText: {
        type: { resolvedName: 'TextBlock' },
        isCanvas: false,
        props: {
          text:
            template?.description ||
            'This is a preview of the selected template with the chosen theme.',
          className: 'text-lg mb-6',
          style: {
            color: theme?.colors.text || '#000000',
          },
        },
        displayName: 'Text',
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
        parent: 'content',
      },
      sampleGrid: {
        type: { resolvedName: 'GridBlock' },
        isCanvas: true,
        props: {
          columns: 3,
          gap: 4,
          className: 'w-full',
          style: {},
        },
        displayName: 'Grid',
        custom: {},
        hidden: false,
        nodes: ['gridItem1', 'gridItem2', 'gridItem3'],
        linkedNodes: {},
        parent: 'content',
      },
      gridItem1: {
        type: { resolvedName: 'ContainerBlock' },
        isCanvas: true,
        props: {
          className: 'p-4 rounded-lg border',
          style: {
            borderColor: theme?.colors.secondary || '#e5e7eb',
            backgroundColor: theme?.colors.background || '#ffffff',
          },
        },
        displayName: 'Grid Item',
        custom: {},
        hidden: false,
        nodes: ['item1Title'],
        linkedNodes: {},
        parent: 'sampleGrid',
      },
      item1Title: {
        type: { resolvedName: 'HeadingBlock' },
        isCanvas: false,
        props: {
          text: 'Sample Item 1',
          level: 3,
          className: 'font-semibold',
          style: {
            color: theme?.colors.primary || '#3b82f6',
          },
        },
        displayName: 'Heading',
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
        parent: 'gridItem1',
      },
      gridItem2: {
        type: { resolvedName: 'ContainerBlock' },
        isCanvas: true,
        props: {
          className: 'p-4 rounded-lg border',
          style: {
            borderColor: theme?.colors.secondary || '#e5e7eb',
            backgroundColor: theme?.colors.background || '#ffffff',
          },
        },
        displayName: 'Grid Item',
        custom: {},
        hidden: false,
        nodes: ['item2Title'],
        linkedNodes: {},
        parent: 'sampleGrid',
      },
      item2Title: {
        type: { resolvedName: 'HeadingBlock' },
        isCanvas: false,
        props: {
          text: 'Sample Item 2',
          level: 3,
          className: 'font-semibold',
          style: {
            color: theme?.colors.primary || '#3b82f6',
          },
        },
        displayName: 'Heading',
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
        parent: 'gridItem2',
      },
      gridItem3: {
        type: { resolvedName: 'ContainerBlock' },
        isCanvas: true,
        props: {
          className: 'p-4 rounded-lg border',
          style: {
            borderColor: theme?.colors.secondary || '#e5e7eb',
            backgroundColor: theme?.colors.background || '#ffffff',
          },
        },
        displayName: 'Grid Item',
        custom: {},
        hidden: false,
        nodes: ['item3Title'],
        linkedNodes: {},
        parent: 'sampleGrid',
      },
      item3Title: {
        type: { resolvedName: 'HeadingBlock' },
        isCanvas: false,
        props: {
          text: 'Sample Item 3',
          level: 3,
          className: 'font-semibold',
          style: {
            color: theme?.colors.primary || '#3b82f6',
          },
        },
        displayName: 'Heading',
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
        parent: 'gridItem3',
      },
      footer: {
        type: { resolvedName: 'ContainerBlock' },
        isCanvas: true,
        props: {
          className: 'w-full p-6 text-center',
          style: {
            backgroundColor: theme?.colors.secondary || '#f3f4f6',
            color: theme?.colors.text || '#000000',
          },
        },
        displayName: 'Footer',
        custom: {},
        hidden: false,
        nodes: ['footerText'],
        linkedNodes: {},
        parent: 'ROOT',
      },
      footerText: {
        type: { resolvedName: 'TextBlock' },
        isCanvas: false,
        props: {
          text: 'This is a sample footer showing how the template looks with your selected theme.',
          className: 'text-sm',
          style: {
            color: theme?.colors.text || '#000000',
          },
        },
        displayName: 'Text',
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
        parent: 'footer',
      },
    })
  }

  if (!isOpen || !templateId) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'h-[90vh] max-w-7xl gap-0 p-0',
          isFullscreen && 'h-screen w-screen max-w-none',
          className
        )}
      >
        <DialogHeader className="flex-shrink-0 border-b bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-lg font-semibold">
                Template Preview
              </DialogTitle>
              {template && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{template.name}</Badge>
                  {theme && <Badge variant="secondary">{theme.name}</Badge>}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center gap-2"
              >
                {isPreviewMode ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Edit Mode
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Preview Mode
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>

              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                <p className="text-gray-600">Loading template preview...</p>
              </div>
            </div>
          ) : template ? (
            <CraftJSEditor
              initialData={generateSampleData()}
              initialPreviewMode={isPreviewMode}
              className="h-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600">Template not found</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TemplateEditorPreview
