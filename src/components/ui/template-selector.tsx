'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Crown, Eye, Star } from 'lucide-react'
import { TemplateConfig } from '@/lib/template-registry'
import { getAllTemplates } from '@/templates'
import { TemplateEditorPreview } from '@/components/ui/template-editor-preview'
import { cn } from '@/lib/utils'

interface TemplateSelectorProps {
  selectedTemplateId?: string
  selectedThemeId?: string
  onTemplateSelect: (templateId: string) => void
  showPreview?: boolean
  filterCategory?: TemplateConfig['category']
  className?: string
}

export function TemplateSelector({
  selectedTemplateId,
  selectedThemeId,
  onTemplateSelect,
  showPreview = true,
  filterCategory,
  className,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<TemplateConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateConfig[]>(
    []
  )
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(
    null
  )
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const allTemplates = getAllTemplates()
        setTemplates(allTemplates)
        setFilteredTemplates(allTemplates)
      } catch (error) {
        console.error('Failed to load templates:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [])

  useEffect(() => {
    const filtered = filterCategory
      ? templates.filter(t => t.category === filterCategory)
      : templates
    setFilteredTemplates(filtered)
  }, [templates, filterCategory])

  const handleTemplateSelect = (templateId: string) => {
    onTemplateSelect(templateId)
  }

  const handlePreview = (templateId: string) => {
    setPreviewTemplateId(templateId)
    setIsPreviewOpen(true)
  }

  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setPreviewTemplateId(null)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 rounded-t-lg bg-gray-200" />
            <CardHeader>
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-200" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map(template => (
          <Card
            key={template.id}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-lg',
              selectedTemplateId === template.id
                ? 'shadow-lg ring-2 ring-blue-500'
                : 'hover:shadow-md'
            )}
            onClick={() => handleTemplateSelect(template.id)}
          >
            {/* Preview Image */}
            <div className="relative h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-50 to-indigo-100">
              {template.previewImage ? (
                <img
                  src={template.previewImage}
                  alt={`${template.name} preview`}
                  className="h-full w-full object-cover"
                  onError={e => {
                    // Fallback to gradient background if image fails to load
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="mb-2 text-4xl">📄</div>
                    <div className="text-sm font-medium">{template.name}</div>
                  </div>
                </div>
              )}

              {/* Selection Indicator */}
              {selectedTemplateId === template.id && (
                <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1 text-white">
                  <Check className="h-4 w-4" />
                </div>
              )}

              {/* Premium Badge */}
              {template.isPremium && (
                <div className="absolute left-2 top-2">
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    <Crown className="mr-1 h-3 w-3" />
                    Premium
                  </Badge>
                </div>
              )}

              {/* Preview Button */}
              {showPreview && (
                <div className="absolute bottom-2 right-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white"
                    onClick={e => {
                      e.stopPropagation()
                      handlePreview(template.id)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm text-gray-600">
                    {template.description}
                  </CardDescription>
                </div>
              </div>

              {/* Template Metadata */}
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {template.pageCount} pages
                </Badge>
                {template.author && (
                  <Badge variant="outline" className="text-xs">
                    by {template.author}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Features */}
              {template.features && template.features.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">
                    Features:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.features.slice(0, 3).map((feature, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {feature}
                      </Badge>
                    ))}
                    {template.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button
                className={cn(
                  'mt-4 w-full',
                  selectedTemplateId === template.id
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
                onClick={e => {
                  e.stopPropagation()
                  handleTemplateSelect(template.id)
                }}
              >
                {selectedTemplateId === template.id ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Selected
                  </>
                ) : (
                  'Select Template'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && !loading && (
        <div className="py-12 text-center">
          <div className="mb-2 text-lg text-gray-400">No templates found</div>
          <div className="text-sm text-gray-500">
            {filterCategory
              ? `No templates available in the "${filterCategory}" category.`
              : 'No templates are currently available.'}
          </div>
        </div>
      )}

      <TemplateEditorPreview
        templateId={previewTemplateId}
        themeId={selectedThemeId}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </div>
  )
}

export default TemplateSelector
