'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Palette, Eye } from 'lucide-react'
import { ThemeConfig, getAllThemes } from '@/lib/theme-registry'
import { getCompatibleThemes } from '@/templates'
import { cn } from '@/lib/utils'

interface ThemeSelectorProps {
  selectedThemeId?: string
  selectedTemplateId?: string
  onThemeSelect: (themeId: string) => void
  showPreview?: boolean
  className?: string
}

export function ThemeSelector({
  selectedThemeId,
  selectedTemplateId,
  onThemeSelect,
  showPreview = true,
  className
}: ThemeSelectorProps) {
  const [themes, setThemes] = useState<ThemeConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [previewTheme, setPreviewTheme] = useState<string | null>(null)

  useEffect(() => {
    const loadThemes = async () => {
      try {
        const allThemes = getAllThemes()
        
        if (selectedTemplateId) {
          // Filter themes compatible with selected template
          const compatibleThemeIds = getCompatibleThemes(selectedTemplateId)
          const compatibleThemes = allThemes.filter((theme: ThemeConfig) => 
            compatibleThemeIds.includes(theme.id) || compatibleThemeIds.includes('*')
          )
          setThemes(compatibleThemes)
        } else {
          // Show all themes if no template selected
          setThemes(allThemes)
        }
      } catch (error) {
        console.error('Failed to load themes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadThemes()
  }, [selectedTemplateId])

  const handleThemeSelect = (themeId: string) => {
    onThemeSelect(themeId)
  }

  const handlePreview = (themeId: string) => {
    setPreviewTheme(themeId)
  }

  const getColorPreview = (theme: ThemeConfig) => {
    const colors = theme.colors
    return [
      colors.primary,
      colors.secondary,
      colors.accent || colors.primary,
      colors.background
    ]
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-t-lg" />
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (!selectedTemplateId) {
    return (
      <div className="text-center py-12">
        <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <div className="text-gray-500 text-lg mb-2">Select a Template First</div>
        <div className="text-gray-400 text-sm">
          Choose a template to see compatible themes
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => {
          const colorPreview = getColorPreview(theme)
          
          return (
            <Card
              key={theme.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-lg',
                selectedThemeId === theme.id
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : 'hover:shadow-md'
              )}
              onClick={() => handleThemeSelect(theme.id)}
            >
              {/* Color Preview */}
              <div className="relative h-32 overflow-hidden rounded-t-lg">
                <div className="flex h-full">
                  {colorPreview.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                
                {/* Selection Indicator */}
                {selectedThemeId === theme.id && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
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
                        handlePreview(theme.id)
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
                      {theme.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 mt-1">
                      {theme.description}
                    </CardDescription>
                  </div>
                </div>
                
                {/* Theme Metadata */}
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">
                    {theme.category}
                  </Badge>
                  {theme.author && (
                    <Badge variant="outline" className="text-xs">
                      by {theme.author}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Color Palette Details */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Colors:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <span>Primary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                      <span>Secondary</span>
                    </div>
                    {theme.colors.accent && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                        <span>Accent</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: theme.colors.background }}
                      />
                      <span>Background</span>
                    </div>
                  </div>
                </div>
                
                {/* Typography Info */}
                {theme.typography?.fontFamily && (
                  <div className="space-y-2 mt-4">
                    <div className="text-sm font-medium text-gray-700">Typography:</div>
                    <div className="text-xs text-gray-600">
                      {theme.typography.fontFamily.primary && (
                        <div>Primary: {theme.typography.fontFamily.primary}</div>
                      )}
                      {theme.typography.fontFamily.secondary && (
                        <div>Secondary: {theme.typography.fontFamily.secondary}</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Action Button */}
                <Button
                  className={cn(
                    'w-full mt-4',
                    selectedThemeId === theme.id
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleThemeSelect(theme.id)
                  }}
                >
                  {selectedThemeId === theme.id ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    'Select Theme'
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {themes.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No compatible themes found</div>
          <div className="text-gray-500 text-sm">
            No themes are compatible with the selected template.
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeSelector