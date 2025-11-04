'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Maximize2, Minimize2, FileText } from 'lucide-react'
import { CraftJSEditor } from '@/components/editor/CraftJSEditor'
import { getTemplateById } from '@/templates'
import { getThemeById } from '@/lib/theme-registry'
import { TemplateConfig } from '@/lib/template-registry'
import { ThemeConfig } from '@/lib/theme-registry'
import { cn } from '@/lib/utils'
import Mustache from 'mustache'
import { HtmlTemplates } from '@/components/editor/iframe-templates'

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
  const [loading, setLoading] = useState(false)
  const [isHtmlTemplate, setIsHtmlTemplate] = useState(false)
  const [renderedPages, setRenderedPages] = useState<string[]>([])
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([])

  useEffect(() => {
    if (templateId) {
      setLoading(true)
      try {
        const templateData = getTemplateById(templateId)
        setTemplate(templateData || null)

        // Check if it's an HTML template
        const isHtml = templateData?.customProperties?.isHtmlTemplate || false
        setIsHtmlTemplate(isHtml)

        if (themeId) {
          const themeData = getThemeById(themeId)
          setTheme(themeData || null)
        }

        // If it's an HTML template, generate preview pages
        if (isHtml && templateData) {
          generatePreviewPages(templateData)
        }
      } catch (error) {
        console.error('Failed to load template/theme:', error)
      } finally {
        setLoading(false)
      }
    }
  }, [templateId, themeId])

  const generatePreviewPages = (templateData: TemplateConfig) => {
    try {
      // Find the HTML template
      const htmlTemplate = HtmlTemplates.find(t => t.id === templateData.id)
      if (!htmlTemplate) {
        console.error('HTML template not found')
        return
      }

      // Generate dummy data
      const dummyData = {
        catalogue: {
          name: 'Sample Product Catalogue',
          description: 'Discover our premium collection of products',
          year: new Date().getFullYear(),
          settings: {
            companyInfo: {
              companyName: 'Premium Products Co.',
              companyDescription: 'Quality products since 2020',
            },
            contactDetails: {
              email: 'contact@premiumproducts.com',
              phone: '+1 (555) 123-4567',
              website: 'www.premiumproducts.com',
              address: '123 Business St, Suite 100, City, State 12345',
            },
            socialMedia: {
              instagram: 'https://instagram.com/premiumproducts',
              facebook: 'https://facebook.com/premiumproducts',
              linkedin: 'https://linkedin.com/company/premiumproducts',
            },
            mediaAssets: {
              coverImageUrl:
                'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
              contactImage:
                'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
            },
          },
          products: [
            {
              name: 'Premium Product 1',
              description: 'High-quality product with exceptional features',
              price: '299.99',
              imageUrl:
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
              category: { name: 'Electronics' },
            },
            {
              name: 'Luxury Item 2',
              description: 'Elegant design meets functionality',
              price: '499.99',
              imageUrl:
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
              category: { name: 'Accessories' },
            },
            {
              name: 'Premium Product 3',
              description: 'Excellence in every detail',
              price: '399.99',
              imageUrl:
                'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
              category: { name: 'Fashion' },
            },
            {
              name: 'Designer Product 4',
              description: 'Sophisticated and modern',
              price: '599.99',
              imageUrl:
                'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500',
              category: { name: 'Lifestyle' },
            },
            {
              name: 'Exclusive Product 5',
              description: 'Limited edition collection',
              price: '799.99',
              imageUrl:
                'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500',
              category: { name: 'Premium' },
            },
            {
              name: 'Classic Product 6',
              description: 'Timeless quality and style',
              price: '349.99',
              imageUrl:
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
              category: { name: 'Classic' },
            },
          ],
          categories: [
            { name: 'Electronics', description: 'Latest tech products' },
            { name: 'Fashion', description: 'Trendy apparel' },
            { name: 'Accessories', description: 'Premium accessories' },
          ],
        },
        profile: {
          companyName: 'Premium Products Co.',
          email: 'contact@premiumproducts.com',
          phone: '+1 (555) 123-4567',
          website: 'www.premiumproducts.com',
          address: '123 Business St, Suite 100, City, State 12345',
        },
      }

      // Transform data if needed
      const transformedData = htmlTemplate.dataTransform
        ? htmlTemplate.dataTransform(dummyData)
        : dummyData

      // Generate pages
      let pagesToRender = htmlTemplate.pages
      const htmlTemplateAny = htmlTemplate as any
      if (htmlTemplateAny.pageGenerator) {
        pagesToRender = htmlTemplateAny.pageGenerator(
          transformedData,
          htmlTemplate.pages
        )
      }

      // Render each page with Mustache
      const rendered = pagesToRender.map((page, index) => {
        // For product pages, add pageProducts to data
        let pageData = { ...transformedData }
        if (page.id.startsWith('products-')) {
          const pageNum = parseInt(page.id.split('-')[1]) || 1
          const productsPerPage = 3
          const startIdx = (pageNum - 1) * productsPerPage
          const endIdx = startIdx + productsPerPage
          pageData.pageProducts = transformedData.catalogue.products.slice(
            startIdx,
            endIdx
          )
        }

        const renderedHtml = Mustache.render(page.html, pageData)

        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                ${htmlTemplate.sharedCss || ''}
                ${page.css || ''}
              </style>
            </head>
            <body>
              ${renderedHtml}
            </body>
          </html>
        `
      })

      setRenderedPages(rendered)
    } catch (error) {
      console.error('Failed to generate preview pages:', error)
    }
  }

  // Render all pages
  useEffect(() => {
    if (renderedPages.length > 0) {
      renderedPages.forEach((pageHtml, index) => {
        const iframe = iframeRefs.current[index]
        if (iframe) {
          const doc = iframe.contentDocument || iframe.contentWindow?.document
          if (doc) {
            doc.open()
            doc.write(pageHtml)
            doc.close()
          }
        }
      })
    }
  }, [renderedPages])

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
          'h-[90vh] max-w-[95vw] gap-0 border-none bg-transparent p-0 shadow-none',
          isFullscreen && 'h-screen w-screen max-w-none',
          className
        )}
      >
        <div className="flex-1 overflow-hidden bg-transparent">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                <p className="text-gray-600">Loading template preview...</p>
              </div>
            </div>
          ) : template ? (
            isHtmlTemplate ? (
              // HTML Template Preview - Show all pages stacked vertically
              <div className="flex h-full flex-col">
                <div
                  className="flex-1 overflow-auto py-4 [&::-webkit-scrollbar]:hidden"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {renderedPages.length > 0 ? (
                    <div className="mx-auto flex flex-col items-center justify-center gap-8">
                      {renderedPages.map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: '1200px',
                            height: '800px',
                            transform: 'scale(0.7)',
                            transformOrigin: 'center center',
                          }}
                        >
                          <div className="mb-2 text-center">
                            <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                              Page {index + 1}
                            </span>
                          </div>
                          <iframe
                            ref={el => {
                              iframeRefs.current[index] = el
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white shadow-lg"
                            style={{
                              width: '1200px', // Match IframeEditor BASE_W
                              height: '800px', // Match IframeEditor BASE_H
                            }}
                            title={`${template.name} - Page ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <FileText className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Failed to load template preview
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // CraftJS Template Preview
              <CraftJSEditor
                initialData={generateSampleData()}
                initialPreviewMode={true}
                className="h-full"
              />
            )
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
