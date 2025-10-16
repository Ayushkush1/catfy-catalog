'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, Grid, List, Filter, X, Eye, Sparkles, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TemplateEditorPreview } from './template-editor-preview'
import { templateManager, TemplateSelectionContext } from '@/lib/template-manager'
import { loadDbTemplatesIntoRegistry } from '@/templates'
import { TemplateConfig } from '@/lib/template-registry'
import { cn } from '@/lib/utils'

interface UserProfile {
  id: string
  fullName: string
  email: string
  subscriptionPlan: 'free' | 'monthly' | 'yearly'
  subscriptionStatus: 'active' | 'inactive' | 'cancelled'
}

interface UnifiedTemplateSelectorProps {
  context: TemplateSelectionContext
  userProfile?: UserProfile | null
  selectedTemplateId?: string
  onTemplateSelect: (templateId: string) => void
  showPreview?: boolean
  className?: string
  viewMode?: 'grid' | 'list'
  showSearch?: boolean
  showFilters?: boolean
}

export function UnifiedTemplateSelector({
  context,
  userProfile,
  selectedTemplateId,
  onTemplateSelect,
  showPreview = true,
  className,
  viewMode: initialViewMode = 'grid',
  showSearch = true,
  showFilters = true
}: UnifiedTemplateSelectorProps) {
  const [templates, setTemplates] = useState<TemplateConfig[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateConfig[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode)
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Get user plan for premium filtering
  const userPlan = userProfile?.subscriptionPlan || 'free'

  // Load templates on mount
  useEffect(() => {
    let mounted = true
    const load = async () => {
      setIsLoading(true)
      try {
        await loadDbTemplatesIntoRegistry()
        const availableTemplates = templateManager.getAvailableTemplates(userPlan)
        if (!mounted) return
        setTemplates(availableTemplates)
        setFilteredTemplates(availableTemplates)
      } catch (error) {
        console.error('Failed to load templates:', error)
        context.onError?.('Failed to load templates')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [userPlan, context])

  // Get categories for filtering
  const categories = useMemo(() => {
    const cats = templateManager.getTemplateCategories()
    return ['all', ...cats]
  }, [])

  // Filter templates based on search and category
  useEffect(() => {
    let filtered = templates

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = templateManager.searchTemplates(searchQuery.trim())
        .filter(template => templates.includes(template)) // Ensure it's in available templates
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    setFilteredTemplates(filtered)
  }, [searchQuery, selectedCategory, templates])

  const handleTemplateSelect = async (templateId: string) => {
    try {
      // Handle selection based on context
      if (context.type === 'wizard') {
        await templateManager.handleWizardTemplateSelection(templateId, context)
      } else {
        await templateManager.handleEditPageTemplateSelection(templateId, context)
      }

      onTemplateSelect(templateId)
    } catch (error) {
      console.error('Template selection failed:', error)
      context.onError?.('Failed to select template')
    }
  }

  const handlePreview = (templateId: string) => {
    setPreviewTemplateId(templateId)
    setIsPreviewOpen(true)
  }

  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setPreviewTemplateId(null)
  }

  const renderTemplateCard = (template: TemplateConfig) => {
    const isSelected = selectedTemplateId === template.id
    const isPremium = template.isPremium
    const canAccess = !isPremium || userPlan !== 'free'

    return (
      <Card
        key={template.id}
        onClick={() => canAccess && handleTemplateSelect(template.id)}
        role="button"
        aria-pressed={isSelected}
        aria-label={`${template.name}${isSelected ? ' (selected)' : ''}`}
        className={cn(
          'group relative overflow-hidden rounded-lg cursor-pointer transition-transform transform hover:-translate-y-1 hover:shadow-2xl',
          isSelected && 'ring-2 ring-blue-500',
          !canAccess && 'opacity-60 pointer-events-none',
          viewMode === 'list' && 'flex flex-row'
        )}
      >
        <div className={cn(
          'relative bg-gray-100',
          viewMode === 'grid' ? 'aspect-video' : 'w-48 flex-shrink-0'
        )}>
          {template.previewImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={template.previewImage}
              alt={template.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                ; (e.target as HTMLImageElement).src = '/templates/default-preview.svg'
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-blue-500" />
            </div>
          )}

          {/* Overlay header */}
          <div className="absolute left-0 right-0 top-0 px-3 py-2 bg-gradient-to-b from-black/50 to-transparent text-white flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold truncate max-w-xs">{template.name}</span>
            </div>
            {isPremium && (
              <Badge className="bg-yellow-500 text-white text-xs">Premium</Badge>
            )}
          </div>

          {/* Preview CTA visible on hover */}
          {showPreview && (
            <button
              aria-label={`Preview ${template.name}`}
              onClick={(e) => { e.stopPropagation(); handlePreview(template.id) }}
              className="absolute bottom-3 right-3 bg-white/90 text-gray-800 rounded-md p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        <CardHeader className={cn('p-4', viewMode === 'list' && 'flex-1')}>
          <CardTitle className="text-base truncate">{template.name}</CardTitle>
          <CardDescription className="text-sm text-gray-600 line-clamp-2">{template.description}</CardDescription>

          <div className="flex flex-wrap gap-2 mt-3">
            {template.category && (
              <Badge variant="outline" className="text-xs">
                {template.category}
              </Badge>
            )}
            {template.tags?.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-3 z-30">
            <Badge className="bg-gradient-to-r from-[#6366F1]  text-white">Selected</Badge>
          </div>
        )}

        {!canAccess && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Badge className="bg-yellow-500 text-white">
              <Crown className="w-3 h-3 mr-1" />
              Premium Required
            </Badge>
          </div>
        )}
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading templates...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {showSearch && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            {showFilters && (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Grid/List */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No templates are available at the moment'
            }
          </p>
        </div>
      ) : (
        <div className={cn(
          'grid gap-6',
          viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'
            : 'grid-cols-1'
        )}>
          {filteredTemplates.map(renderTemplateCard)}
        </div>
      )}

      {/* Template Preview Modal */}
      {showPreview && previewTemplateId && (
        <TemplateEditorPreview
          templateId={previewTemplateId}
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
        />
      )}
    </div>
  )
}

export default UnifiedTemplateSelector