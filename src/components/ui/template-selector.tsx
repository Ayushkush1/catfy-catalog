'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Crown, Eye, Star } from 'lucide-react'
import { TemplateConfig } from '@/lib/template-registry'
import { getAllTemplates } from '@/templates'
import { cn } from '@/lib/utils'

interface TemplateSelectorProps {
  selectedTemplateId?: string
  onTemplateSelect: (templateId: string) => void
  showPreview?: boolean
  filterCategory?: TemplateConfig['category']
  className?: string
}

export function TemplateSelector({
  selectedTemplateId,
  onTemplateSelect,
  showPreview = true,
  filterCategory,
  className
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<TemplateConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const allTemplates = getAllTemplates()
        const filteredTemplates = filterCategory
          ? allTemplates.filter(t => t.category === filterCategory)
          : allTemplates
        setTemplates(filteredTemplates)
      } catch (error) {
        console.error('Failed to load templates:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [filterCategory])

  const handleTemplateSelect = (templateId: string) => {
    onTemplateSelect(templateId)
  }

  const handlePreview = (templateId: string) => {
    setPreviewTemplate(templateId)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg" />
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-lg',
              selectedTemplateId === template.id
                ? 'ring-2 ring-blue-500 shadow-lg'
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
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to gradient background if image fails to load
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📄</div>
                    <div className="text-sm font-medium">{template.name}</div>
                  </div>
                </div>
              )}
              
              {/* Selection Indicator */}
              {selectedTemplateId === template.id && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}
              
              {/* Premium Badge */}
              {template.isPremium && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Crown className="w-3 h-3 mr-1" />
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
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePreview(template.id)
                    }}
                  >
                    <Eye className="w-4 h-4" />
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
                  <CardDescription className="text-sm text-gray-600 mt-1">
                    {template.description}
                  </CardDescription>
                </div>
              </div>
              
              {/* Template Metadata */}
              <div className="flex items-center gap-2 mt-3">
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
                  <div className="text-sm font-medium text-gray-700">Features:</div>
                  <div className="flex flex-wrap gap-1">
                    {template.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
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
                  'w-full mt-4',
                  selectedTemplateId === template.id
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  handleTemplateSelect(template.id)
                }}
              >
                {selectedTemplateId === template.id ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
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
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No templates found</div>
          <div className="text-gray-500 text-sm">
            {filterCategory
              ? `No templates available in the "${filterCategory}" category.`
              : 'No templates are currently available.'}
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplateSelector