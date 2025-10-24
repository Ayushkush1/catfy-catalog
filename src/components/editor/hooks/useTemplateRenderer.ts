'use client'

import { useCallback, useEffect, useState } from 'react'
import { useEditor } from '@craftjs/core'
import { templateManager, TemplateLoadResult } from '@/lib/template-manager'
import { Page } from '../ui'

export interface TemplateRenderState {
  isLoading: boolean
  error: string | null
  loadedTemplateId: string | null
}

export interface UseTemplateRendererOptions {
  onTemplateLoaded?: (templateId: string) => void
  onTemplateError?: (error: string) => void
  autoLoadFromStorage?: boolean
  multiPageHook?: {
    loadPages: (pages: Page[], initialPageId?: string) => void
  }
}

export const useTemplateRenderer = (
  options: UseTemplateRendererOptions = {}
) => {
  const { query, actions } = useEditor()
  const [state, setState] = useState<TemplateRenderState>({
    isLoading: false,
    error: null,
    loadedTemplateId: null,
  })

  const {
    onTemplateLoaded,
    onTemplateError,
    autoLoadFromStorage = false,
    multiPageHook,
  } = options

  // Load template data into editor
  const loadTemplate = useCallback(
    async (templateId: string): Promise<TemplateLoadResult> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        console.log('🎯 useTemplateRenderer: Loading template:', templateId)

        const result = templateManager.prepareTemplateData(templateId)

        if (!result.success || !result.data) {
          const error = result.error || 'Failed to prepare template data'
          setState(prev => ({ ...prev, isLoading: false, error }))
          onTemplateError?.(error)
          return result
        }

        // Load template data into editor using the template manager
        const loadSuccess = templateManager.loadTemplateIntoEditor(
          result.data,
          (data: string) => {
            try {
              // Clear editor first
              actions.clearEvents()

              // Parse and validate data
              const parsedData = JSON.parse(data)
              if (!parsedData.ROOT) {
                throw new Error('Invalid template data: missing ROOT node')
              }

              // Deserialize the data into the editor
              actions.deserialize(parsedData)

              console.log(
                '✅ Single-page template data loaded into editor successfully'
              )
              return true
            } catch (error) {
              console.error(
                '❌ Failed to deserialize single-page template data:',
                error
              )
              return false
            }
          },
          multiPageHook
            ? (pages: Page[]) => {
                try {
                  console.log(
                    '🔄 Loading multi-page template with',
                    pages.length,
                    'pages'
                  )

                  // Use the multi-page hook to load pages
                  multiPageHook.loadPages(pages)

                  console.log('✅ Multi-page template data loaded successfully')
                  return true
                } catch (error) {
                  console.error(
                    '❌ Failed to load multi-page template data:',
                    error
                  )
                  return false
                }
              }
            : undefined
        )

        if (loadSuccess) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: null,
            loadedTemplateId: templateId,
          }))
          onTemplateLoaded?.(templateId)

          // Force a re-render to ensure the canvas updates
          setTimeout(() => {
            actions.clearEvents()
          }, 100)

          return { success: true, data: result.data }
        } else {
          const error = 'Failed to load template into editor'
          setState(prev => ({ ...prev, isLoading: false, error }))
          onTemplateError?.(error)
          return { success: false, error }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Unknown error loading template'
        console.error('❌ useTemplateRenderer error:', errorMessage)

        setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
        onTemplateError?.(errorMessage)

        return { success: false, error: errorMessage }
      }
    },
    [actions, onTemplateLoaded, onTemplateError]
  )

  // Load template from stored selection (useful for wizard flow)
  const loadFromStorage =
    useCallback(async (): Promise<TemplateLoadResult | null> => {
      const stored = templateManager.getStoredSelection()

      if (!stored) {
        console.log('📭 No stored template selection found')
        return null
      }

      console.log('📦 Loading template from storage:', stored.templateId)

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        // Load the stored template data directly
        const loadSuccess = templateManager.loadTemplateIntoEditor(
          stored.templateData,
          (data: string) => {
            try {
              actions.clearEvents()
              const parsedData = JSON.parse(data)
              actions.deserialize(parsedData)
              return true
            } catch (error) {
              console.error(
                '❌ Failed to deserialize stored template data:',
                error
              )
              return false
            }
          },
          multiPageHook
            ? (pages: Page[]) => {
                try {
                  console.log(
                    '🔄 Loading multi-page template from storage with',
                    pages.length,
                    'pages'
                  )
                  multiPageHook.loadPages(pages)
                  return true
                } catch (error) {
                  console.error(
                    '❌ Failed to load multi-page template data from storage:',
                    error
                  )
                  return false
                }
              }
            : undefined
        )

        if (loadSuccess) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: null,
            loadedTemplateId: stored.templateId,
          }))
          onTemplateLoaded?.(stored.templateId)

          // Clear the stored selection after successful load
          templateManager.clearStoredSelection()

          // If multi-page, surface the pages tab automatically like normal path
          try {
            const parsed = JSON.parse(stored.templateData)
            if (Array.isArray(parsed) && parsed.length > 1) {
              console.log('📄 Stored multi-page template detected')
            }
          } catch {}

          return { success: true, data: stored.templateData }
        } else {
          const error = 'Failed to load stored template into editor'
          setState(prev => ({ ...prev, isLoading: false, error }))
          onTemplateError?.(error)
          return { success: false, error }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Unknown error loading stored template'
        setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
        onTemplateError?.(errorMessage)
        return { success: false, error: errorMessage }
      }
    }, [actions, onTemplateLoaded, onTemplateError])

  // Clear current template and reset editor
  const clearTemplate = useCallback(() => {
    try {
      actions.clearEvents()

      // Reset to empty state
      const emptyState = {
        ROOT: {
          type: { resolvedName: 'ContainerBlock' },
          isCanvas: true,
          props: {},
          displayName: 'Container',
          custom: {},
          hidden: false,
          nodes: [],
          linkedNodes: {},
          parent: null,
        },
      } as any

      actions.deserialize(emptyState)

      setState(prev => ({
        ...prev,
        loadedTemplateId: null,
        error: null,
      }))

      console.log('🧹 Template cleared successfully')
    } catch (error) {
      console.error('❌ Failed to clear template:', error)
    }
  }, [actions])

  // Get current editor state as template data
  const getCurrentTemplateData = useCallback((): string => {
    return query.serialize()
  }, [query])

  // Auto-load from storage on mount if enabled
  useEffect(() => {
    if (autoLoadFromStorage) {
      loadFromStorage()
    }
  }, [autoLoadFromStorage, loadFromStorage])

  return {
    // State
    ...state,

    // Actions
    loadTemplate,
    loadFromStorage,
    clearTemplate,
    getCurrentTemplateData,

    // Utilities
    hasStoredTemplate: () => !!templateManager.getStoredSelection(),
    getStoredTemplateId: () =>
      templateManager.getStoredSelection()?.templateId || null,
  }
}

export default useTemplateRenderer
