'use client'

import { useState, useEffect, useMemo } from 'react'
import { ThemeRegistry, type ThemeConfig } from '@/lib/theme-registry'
import { TemplateRegistry, type TemplateConfig } from '@/lib/template-registry'
import { CompatibilityMatrix } from '@/lib/compatibility-matrix'
import { ContentMapper, type StandardizedCatalogue } from '@/lib/content-schema'
import { Catalogue, Category, Product, Profile } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AlertCircle, Eye, Palette, FileText, Zap, Download } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ThemeTemplatePreviewProps {
  catalogue: Catalogue & {
    products: (Product & { category: Category | null })[]
    categories: Category[]
  }
  profile: Profile
  className?: string
}

interface PreviewState {
  selectedTheme: string | null
  selectedTemplate: string | null
  isCompatible: boolean
  showIncompatible: boolean
  previewMode: 'single' | 'grid' | 'comparison'
  autoRefresh: boolean
}

export function ThemeTemplatePreview({ catalogue, profile, className }: ThemeTemplatePreviewProps) {
  const [state, setState] = useState<PreviewState>({
    selectedTheme: null,
    selectedTemplate: null,
    isCompatible: true,
    showIncompatible: false,
    previewMode: 'single',
    autoRefresh: true
  })

  const [themes, setThemes] = useState<ThemeConfig[]>([])
  const [templates, setTemplates] = useState<TemplateConfig[]>([])
  const [compatibilityMatrix, setCompatibilityMatrix] = useState<CompatibilityMatrix>(new CompatibilityMatrix())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load themes, templates, and compatibility data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const themeRegistry = ThemeRegistry.getInstance()
        const templateRegistry = TemplateRegistry.getInstance()
        const matrix = new CompatibilityMatrix()

        // Themes and templates are now registered statically, no loading needed

        const loadedThemes = themeRegistry.getAllThemes()
        const loadedTemplates = templateRegistry.getAllTemplates()

        // Build compatibility matrix
        loadedThemes.forEach(theme => {
          loadedTemplates.forEach(template => {
            const isCompatible = template.compatibleThemes.includes('*') ||
              template.compatibleThemes.includes(theme.id) ||
              theme.compatibleTemplates.includes('*') ||
              theme.compatibleTemplates.includes(template.id)

            matrix.addRule({
              themeId: theme.id,
              templateId: template.id,
              compatible: isCompatible
            })
          })
        })

        setThemes(loadedThemes)
        setTemplates(loadedTemplates)
        setCompatibilityMatrix(matrix)

        // Set default selections
        if (loadedThemes.length > 0 && loadedTemplates.length > 0) {
          setState(prev => ({
            ...prev,
            selectedTheme: prev.selectedTheme || loadedThemes[0].id,
            selectedTemplate: prev.selectedTemplate || loadedTemplates[0].id
          }))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preview data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Check compatibility when selections change
  useEffect(() => {
    if (state.selectedTheme && state.selectedTemplate) {
      const isCompatible = compatibilityMatrix.isCompatible(state.selectedTheme, state.selectedTemplate)
      setState(prev => ({ ...prev, isCompatible }))
    }
  }, [state.selectedTheme, state.selectedTemplate, compatibilityMatrix])

  // Standardized content for preview
  const standardizedContent = useMemo(() => {
    const mapper = new ContentMapper()
    return ContentMapper.mapToStandardized({
      ...catalogue,
      products: catalogue.products,
      categories: catalogue.categories
    }, profile)
  }, [catalogue, profile])

  // Get compatible combinations
  const compatibleCombinations = useMemo(() => {
    const combinations: Array<{ theme: ThemeConfig, template: TemplateConfig }> = []

    themes.forEach(theme => {
      templates.forEach(template => {
        const isCompatible = compatibilityMatrix.isCompatible(theme.id, template.id)
        if (isCompatible || state.showIncompatible) {
          combinations.push({ theme, template })
        }
      })
    })

    return combinations
  }, [themes, templates, compatibilityMatrix, state.showIncompatible])

  // Get current theme and template
  const currentTheme = themes.find(t => t.id === state.selectedTheme)
  const currentTemplate = templates.find(t => t.id === state.selectedTemplate)

  // Render template component
  const renderTemplate = (theme: ThemeConfig, template: TemplateConfig, size: 'small' | 'medium' | 'large' = 'large') => {
    try {
      // This would dynamically import and render the template component
      // For now, we'll show a placeholder
      return (
        <div
          className={`
            border rounded-lg overflow-hidden bg-white shadow-sm
            ${size === 'small' ? 'h-32 w-24' : size === 'medium' ? 'h-48 w-36' : 'h-96 w-72'}
          `}
          style={{
            aspectRatio: '210/297', // A4 aspect ratio
            maxWidth: size === 'small' ? '96px' : size === 'medium' ? '144px' : '288px',
            '--primary-color': theme.colors.primary,
            '--secondary-color': theme.colors.secondary,
            '--accent-color': theme.colors.accent
          } as React.CSSProperties}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div
              className="h-8 flex items-center px-3 text-white text-sm font-medium"
              style={{ backgroundColor: theme.colors.primary }}
            >
              {standardizedContent.catalogue.name}
            </div>

            {/* Content */}
            <div className="flex-1 p-3 space-y-2">
              <div className="text-xs text-gray-600">
                {template.name} • {theme.name}
              </div>

              {/* Sample product grid */}
              <div className="grid grid-cols-2 gap-1">
                {standardizedContent.products.slice(0, 4).map((product: any, idx: number) => (
                  <div
                    key={idx}
                    className="border rounded p-1 text-xs"
                    style={{ borderColor: theme.colors.secondary }}
                  >
                    <div className="font-medium truncate">{product.name}</div>
                    {(product.priceDisplay === 'show' && product.price) ||
                      (product.priceDisplay === 'contact') ||
                      (!product.priceDisplay && product.price) ? (
                      <div
                        className="text-xs"
                        style={{ color: theme.colors.accent }}
                      >
                        {product.priceDisplay === 'show' && product.price ?
                          `₹${Number(product.price).toLocaleString('en-IN')}`
                          : product.priceDisplay === 'contact' ?
                            'Contact for Price'
                            : product.price ?
                              `₹${Number(product.price).toLocaleString('en-IN')}`
                              : 'No Price'}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              className="h-6 flex items-center px-3 text-xs"
              style={{ backgroundColor: theme.colors.secondary, color: 'white' }}
            >
              {standardizedContent.profile.companyName}
            </div>
          </div>
        </div>
      )
    } catch (err) {
      return (
        <div className="border rounded-lg p-4 bg-red-50 border-red-200">
          <div className="text-red-600 text-sm">Preview Error</div>
          <div className="text-red-500 text-xs mt-1">
            {err instanceof Error ? err.message : 'Failed to render preview'}
          </div>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Loading preview...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Theme & Template Preview</h2>
          <p className="text-gray-600 mt-1">
            Preview and test all theme-template combinations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-refresh"
              checked={state.autoRefresh}
              onCheckedChange={(checked) => setState(prev => ({ ...prev, autoRefresh: checked }))}
            />
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Preview Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Theme Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Theme</Label>
              <Select
                value={state.selectedTheme || ''}
                onValueChange={(value) => setState(prev => ({ ...prev, selectedTheme: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map(theme => (
                    <SelectItem key={theme.id} value={theme.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        {theme.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Template</Label>
              <Select
                value={state.selectedTemplate || ''}
                onValueChange={(value) => setState(prev => ({ ...prev, selectedTemplate: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        {template.name}
                        {template.isPremium && <Badge variant="secondary" className="text-xs">Pro</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview Mode */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Preview Mode</Label>
              <Select
                value={state.previewMode}
                onValueChange={(value: any) => setState(prev => ({ ...prev, previewMode: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Preview</SelectItem>
                  <SelectItem value="grid">Grid View</SelectItem>
                  <SelectItem value="comparison">Comparison</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-incompatible"
                  checked={state.showIncompatible}
                  onCheckedChange={(checked) => setState(prev => ({ ...prev, showIncompatible: checked }))}
                />
                <Label htmlFor="show-incompatible" className="text-sm">Show incompatible</Label>
              </div>
            </div>
          </div>

          {/* Compatibility Status */}
          {state.selectedTheme && state.selectedTemplate && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${state.isCompatible ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                <span className="text-sm font-medium">
                  {state.isCompatible ? 'Compatible' : 'Incompatible'}
                </span>
                {currentTheme && currentTemplate && (
                  <span className="text-sm text-gray-600">
                    {currentTheme.name} + {currentTemplate.name}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Content */}
      <Tabs value={state.previewMode} onValueChange={(value: any) => setState(prev => ({ ...prev, previewMode: value }))}>
        <TabsList>
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Single Preview
          </TabsTrigger>
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Grid View
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Comparison
          </TabsTrigger>
        </TabsList>

        {/* Single Preview */}
        <TabsContent value="single" className="space-y-4">
          {currentTheme && currentTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{currentTheme.name} + {currentTemplate.name}</span>
                  <div className="flex items-center gap-2">
                    {!state.isCompatible && (
                      <Badge variant="destructive">Incompatible</Badge>
                    )}
                    {currentTemplate.isPremium && (
                      <Badge variant="secondary">Premium</Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderTemplate(currentTheme, currentTemplate, 'large')}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Select a theme and template to preview
            </div>
          )}
        </TabsContent>

        {/* Grid View */}
        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {compatibleCombinations.map(({ theme, template }, idx) => {
              const isCompatible = compatibilityMatrix.isCompatible(theme.id, template.id)
              return (
                <Card
                  key={`${theme.id}-${template.id}`}
                  className={`cursor-pointer transition-all hover:shadow-md ${!isCompatible ? 'opacity-60 border-red-200' : ''
                    }`}
                  onClick={() => setState(prev => ({
                    ...prev,
                    selectedTheme: theme.id,
                    selectedTemplate: template.id,
                    previewMode: 'single'
                  }))}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="truncate">{theme.name} + {template.name}</span>
                      <div className="flex items-center gap-1">
                        {!isCompatible && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                        {template.isPremium && <Badge variant="secondary" className="text-xs">Pro</Badge>}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderTemplate(theme, template, 'medium')}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Comparison View */}
        <TabsContent value="comparison" className="space-y-4">
          {currentTemplate && themes.length > 1 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {currentTemplate.name} with Different Themes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map(theme => {
                  const isCompatible = compatibilityMatrix.isCompatible(theme.id, currentTemplate.id)
                  return (
                    <Card key={theme.id} className={!isCompatible ? 'opacity-60 border-red-200' : ''}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>{theme.name}</span>
                          {!isCompatible && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderTemplate(theme, currentTemplate, 'medium')}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Select a template to compare themes
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Preview Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{themes.length}</div>
              <div className="text-sm text-gray-600">Themes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{templates.length}</div>
              <div className="text-sm text-gray-600">Templates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{compatibleCombinations.length}</div>
              <div className="text-sm text-gray-600">Combinations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {compatibleCombinations.filter(({ theme, template }) =>
                  compatibilityMatrix.isCompatible(theme.id, template.id)
                ).length}
              </div>
              <div className="text-sm text-gray-600">Compatible</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ThemeTemplatePreview