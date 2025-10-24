'use client'

import { TemplateConfig } from './template-registry'
import { getTemplateById, getAllTemplates } from '@/templates'

export interface TemplateLoadResult {
  success: boolean
  data?: string
  error?: string
}

export interface TemplateSelectionContext {
  type: 'wizard' | 'edit'
  catalogueId?: string
  onTemplateSelected?: (templateId: string, templateData: string) => void
  onError?: (error: string) => void
}

/**
 * Unified Template Manager
 * Handles template operations for both wizard and edit page contexts
 */
export class TemplateManager {
  private static instance: TemplateManager

  public static getInstance(): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager()
    }
    return TemplateManager.instance
  }

  /**
   * Get all available templates with user access filtering
   */
  public getAvailableTemplates(
    userPlan: 'free' | 'monthly' | 'yearly' = 'free'
  ): TemplateConfig[] {
    const allTemplates = getAllTemplates()

    // Filter templates based on user plan
    return allTemplates.filter(template => {
      if (template.isPremium && userPlan === 'free') {
        return false
      }
      return true
    })
  }

  /**
   * Get template by ID with validation
   */
  public getTemplate(templateId: string): TemplateConfig | null {
    try {
      const template = getTemplateById(templateId)
      return template || null
    } catch (error) {
      console.error('Failed to get template:', error)
      return null
    }
  }

  /**
   * Alias for getTemplate for backward compatibility
   */
  public getTemplateById(templateId: string): TemplateConfig | null {
    return this.getTemplate(templateId)
  }

  /**
   * Prepare template data for editor loading
   */
  public prepareTemplateData(templateId: string): TemplateLoadResult {
    try {
      const template = this.getTemplate(templateId)

      if (!template) {
        return {
          success: false,
          error: `Template with ID "${templateId}" not found`,
        }
      }

      // Check if it's an HTML template (from iframe-templates)
      if (template.customProperties?.isHtmlTemplate) {
        console.log('✅ HTML template detected:', templateId)
        // HTML templates don't need editor data - they're handled by IframeEditor
        // Just return success - the actual template will be loaded via getTemplate()
        return {
          success: true,
          data: JSON.stringify({ templateId, isHtmlTemplate: true }),
        }
      }

      // Check if it's a CraftJS editor template
      if (!template.customProperties?.isEditorTemplate) {
        return {
          success: false,
          error: `Template "${templateId}" is not an editor template`,
        }
      }

      // Check if it's a multi-page template
      if (template.customProperties?.isMultiPageTemplate) {
        const multiPageData = template.customProperties.multiPageData
        if (!multiPageData) {
          return {
            success: false,
            error: `Multi-page template "${templateId}" has no page data`,
          }
        }

        // For multi-page templates, return the page array as JSON string
        return {
          success: true,
          data: JSON.stringify(multiPageData),
        }
      }

      // Handle single-page templates (legacy behavior)
      const editorData = template.customProperties.editorData
      if (!editorData) {
        return {
          success: false,
          error: `Template "${templateId}" has no editor data`,
        }
      }

      // Ensure data is properly formatted as JSON string
      let templateData: string
      if (typeof editorData === 'string') {
        // Validate it's valid JSON
        JSON.parse(editorData)
        templateData = editorData
      } else {
        templateData = JSON.stringify(editorData)
      }

      return {
        success: true,
        data: templateData,
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error preparing template data',
      }
    }
  }

  /**
   * Handle template selection for wizard context
   */
  public async handleWizardTemplateSelection(
    templateId: string,
    context: TemplateSelectionContext
  ): Promise<TemplateLoadResult> {
    const result = this.prepareTemplateData(templateId)

    if (result.success && result.data) {
      // For wizard, we just prepare the data - actual loading happens when editor is created
      context.onTemplateSelected?.(templateId, result.data)

      // Store template selection in localStorage for wizard flow
      localStorage.setItem('selectedTemplateId', templateId)
      localStorage.setItem('selectedTemplateData', result.data)
    } else {
      context.onError?.(result.error || 'Failed to prepare template')
    }

    return result
  }

  /**
   * Handle template selection for edit page context
   */
  public async handleEditPageTemplateSelection(
    templateId: string,
    context: TemplateSelectionContext
  ): Promise<TemplateLoadResult> {
    const result = this.prepareTemplateData(templateId)

    if (result.success && result.data) {
      context.onTemplateSelected?.(templateId, result.data)
    } else {
      context.onError?.(result.error || 'Failed to load template')
    }

    return result
  }

  /**
   * Load template into CraftJS editor
   */
  public loadTemplateIntoEditor(
    templateData: string,
    loadPageDataFn: (data: string) => boolean,
    loadMultiPageDataFn?: (pages: any[]) => boolean
  ): boolean {
    try {
      console.log('🎯 TemplateManager: Loading template into editor')
      console.log('📊 Template data length:', templateData.length)

      // Parse the data to determine if it's multi-page or single-page
      const parsedData = JSON.parse(templateData)

      // Check if it's a multi-page template (array of Page objects)
      if (
        Array.isArray(parsedData) &&
        parsedData.length > 0 &&
        parsedData[0].id &&
        parsedData[0].data
      ) {
        console.log(
          '🔄 TemplateManager: Detected multi-page template with',
          parsedData.length,
          'pages'
        )

        if (!loadMultiPageDataFn) {
          throw new Error(
            'Multi-page template detected but no multi-page loader provided'
          )
        }

        // Load multi-page data
        const success = loadMultiPageDataFn(parsedData)

        if (success) {
          console.log(
            '✅ TemplateManager: Multi-page template loaded successfully'
          )
        } else {
          console.error(
            '❌ TemplateManager: Failed to load multi-page template data'
          )
        }

        return success
      }

      // Handle single-page template (legacy behavior)
      if (!parsedData.ROOT) {
        throw new Error('Invalid single-page template data: missing ROOT node')
      }

      // Load single-page data into editor
      const success = loadPageDataFn(templateData)

      if (success) {
        console.log(
          '✅ TemplateManager: Single-page template loaded successfully'
        )
      } else {
        console.error(
          '❌ TemplateManager: Failed to load single-page template data'
        )
      }

      return success
    } catch (error) {
      console.error('❌ TemplateManager: Error loading template:', error)
      return false
    }
  }

  /**
   * Get template categories for filtering
   */
  public getTemplateCategories(): string[] {
    const templates = getAllTemplates()
    const categories = new Set<string>()

    templates.forEach(template => {
      if (template.category) {
        categories.add(template.category)
      }
    })

    return Array.from(categories).sort()
  }

  /**
   * Filter templates by category
   */
  public getTemplatesByCategory(category: string): TemplateConfig[] {
    const allTemplates = getAllTemplates()
    return allTemplates.filter(template => template.category === category)
  }

  /**
   * Search templates by name or description
   */
  public searchTemplates(query: string): TemplateConfig[] {
    const allTemplates = getAllTemplates()
    const lowercaseQuery = query.toLowerCase()

    return allTemplates.filter(
      template =>
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description?.toLowerCase().includes(lowercaseQuery) ||
        template.tags?.some((tag: string) =>
          tag.toLowerCase().includes(lowercaseQuery)
        )
    )
  }

  /**
   * Clear stored template selection (useful for wizard cleanup)
   */
  public clearStoredSelection(): void {
    localStorage.removeItem('selectedTemplateId')
    localStorage.removeItem('selectedTemplateData')
  }

  /**
   * Get stored template selection from localStorage
   */
  public getStoredSelection(): {
    templateId: string
    templateData: string
  } | null {
    const templateId = localStorage.getItem('selectedTemplateId')
    const templateData = localStorage.getItem('selectedTemplateData')

    if (templateId && templateData) {
      return { templateId, templateData }
    }

    return null
  }
}

// Export singleton instance
export const templateManager = TemplateManager.getInstance()
