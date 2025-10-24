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
  className,
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
          const compatibleThemes = allThemes.filter(
            (theme: ThemeConfig) =>
              compatibleThemeIds.includes(theme.id) ||
              compatibleThemeIds.includes('*')
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
      colors.background,
    ]
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 rounded-t-lg bg-gray-200" />
            <CardHeader>
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-200" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (!selectedTemplateId) {
    return (
      <div className="py-12 text-center">
        <Palette className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <div className="mb-2 text-lg text-gray-500">
          Select a Template First
        </div>
        <div className="text-sm text-gray-400">
          Choose a template to see compatible themes
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {themes.map(theme => {
          const colorPreview = getColorPreview(theme)

          return (
            <Card
              key={theme.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-lg',
                selectedThemeId === theme.id
                  ? 'shadow-lg ring-2 ring-blue-500'
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
                  <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1 text-white">
                    <Check className="h-4 w-4" />
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
                        handlePreview(theme.id)
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
                      {theme.name}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm text-gray-600">
                      {theme.description}
                    </CardDescription>
                  </div>
                </div>

                {/* Theme Metadata */}
                <div className="mt-3 flex items-center gap-2">
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
                  <div className="text-sm font-medium text-gray-700">
                    Colors:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full border"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <span>Primary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full border"
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                      <span>Secondary</span>
                    </div>
                    {theme.colors.accent && (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full border"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                        <span>Accent</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full border"
                        style={{ backgroundColor: theme.colors.background }}
                      />
                      <span>Background</span>
                    </div>
                  </div>
                </div>

                {/* Typography Info */}
                {theme.typography?.fontFamily && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Typography:
                    </div>
                    <div className="text-xs text-gray-600">
                      {theme.typography.fontFamily.primary && (
                        <div>
                          Primary: {theme.typography.fontFamily.primary}
                        </div>
                      )}
                      {theme.typography.fontFamily.secondary && (
                        <div>
                          Secondary: {theme.typography.fontFamily.secondary}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  className={cn(
                    'mt-4 w-full',
                    selectedThemeId === theme.id
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                  onClick={e => {
                    e.stopPropagation()
                    handleThemeSelect(theme.id)
                  }}
                >
                  {selectedThemeId === theme.id ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
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
        <div className="py-12 text-center">
          <div className="mb-2 text-lg text-gray-400">
            No compatible themes found
          </div>
          <div className="text-sm text-gray-500">
            No themes are compatible with the selected template.
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeSelector
