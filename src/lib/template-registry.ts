import { z } from 'zod'
import React from 'react'
import { StandardizedContent } from './content-schema'
import { ThemeConfig } from './theme-registry'

// Template configuration schema
export const TemplateConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['modern', 'classic', 'minimal', 'creative', 'industry', 'specialized', 'product']),
  isPremium: z.boolean().default(false),
  version: z.string().default('1.0.0'),
  author: z.string().optional(),
  previewImage: z.string().optional(),
  features: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  pageCount: z.number().default(1),
  supportedFields: z.object({
    products: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    profile: z.array(z.string()).default([])
  }),
  compatibleThemes: z.array(z.string()).default(['*']), // '*' means compatible with all
  requiredThemeFeatures: z.array(z.string()).default([]),
  layoutOptions: z.object({
    responsive: z.boolean().default(true),
    printOptimized: z.boolean().default(true),
    customizable: z.boolean().default(true)
  }).optional(),
  customProperties: z.record(z.any()).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

export type TemplateConfig = z.infer<typeof TemplateConfigSchema>

// Template component interface
export interface TemplateComponentProps {
  content: StandardizedContent
  theme: ThemeConfig
  isEditMode?: boolean
  onContentUpdate?: (updates: Partial<StandardizedContent>) => void
  customProps?: Record<string, any>
}

export type TemplateComponent = React.ComponentType<TemplateComponentProps>

// Template registry class
export class TemplateRegistry {
  static getTemplate(catalogueTemplate: string) {
    throw new Error('Method not implemented.')
  }
  private static instance: TemplateRegistry
  private templates: Map<string, TemplateConfig> = new Map()
  private components: Map<string, TemplateComponent> = new Map()

  private constructor() {
    // Templates are now registered statically via registerTemplate method
    // No automatic file system discovery
  }

  static getInstance(): TemplateRegistry {
    if (!TemplateRegistry.instance) {
      TemplateRegistry.instance = new TemplateRegistry()
    }
    return TemplateRegistry.instance
  }

  // Templates are now registered statically via registerTemplate method
  // No automatic file system discovery needed

  // Public methods
  getAllTemplates(): TemplateConfig[] {
    return Array.from(this.templates.values())
  }

  getTemplate(id: string): TemplateConfig | undefined {
    return this.templates.get(id)
  }

  getTemplateComponent(id: string): TemplateComponent | undefined {
    return this.components.get(id)
  }

  getTemplatesByCategory(category: TemplateConfig['category']): TemplateConfig[] {
    return this.getAllTemplates().filter(template => template.category === category)
  }

  getFreeTemplates(): TemplateConfig[] {
    return this.getAllTemplates().filter(template => !template.isPremium)
  }

  getPremiumTemplates(): TemplateConfig[] {
    return this.getAllTemplates().filter(template => template.isPremium)
  }

  getCompatibleTemplates(themeId: string): TemplateConfig[] {
    return this.getAllTemplates().filter(template =>
      template.compatibleThemes.includes('*') ||
      template.compatibleThemes.includes(themeId)
    )
  }

  isTemplateThemeCompatible(templateId: string, themeId: string, theme?: ThemeConfig): boolean {
    const template = this.getTemplate(templateId)
    if (!template) return false

    // Check basic compatibility
    if (!template.compatibleThemes.includes('*') &&
      !template.compatibleThemes.includes(themeId)) {
      return false
    }

    // Check required theme features
    if (theme && template.requiredThemeFeatures.length > 0) {
      // For now, assume all themes support all features since ThemeConfig doesn't have a features property
      // This can be enhanced later by adding a features property to ThemeConfig
      return true
    }

    return true
  }

  registerTemplate(config: TemplateConfig, component: TemplateComponent): void {
    // Use safeParse to handle validation errors gracefully
    const result = TemplateConfigSchema.safeParse(config)

    if (!result.success) {
      console.warn(`⚠️ Template validation failed for "${config.id}":`, result.error.errors)
      console.warn('Registering template anyway with original config')
      // Register anyway - useful for HTML templates with flexible properties
      this.templates.set(config.id, config)
      this.components.set(config.id, component)
      return
    }

    this.templates.set(config.id, result.data)
    this.components.set(config.id, component)
  }

  unregisterTemplate(id: string): boolean {
    const templateDeleted = this.templates.delete(id)
    const componentDeleted = this.components.delete(id)
    return templateDeleted && componentDeleted
  }

  reloadTemplates(): void {
    // Templates are registered statically, no reloading needed
    // Use registerTemplate to add new templates at runtime
  }

  validateTemplate(template: unknown): { valid: boolean; errors?: string[] } {
    try {
      TemplateConfigSchema.parse(template)
      return { valid: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        }
      }
      return { valid: false, errors: ['Unknown validation error'] }
    }
  }

  // Template files are now managed manually in the codebase
  // No automatic file generation needed

  // Get template compatibility matrix
  getCompatibilityMatrix(): Record<string, string[]> {
    const matrix: Record<string, string[]> = {}

    this.getAllTemplates().forEach(template => {
      matrix[template.id] = template.compatibleThemes
    })

    return matrix
  }
}

// Export singleton instance
export const templateRegistry = TemplateRegistry.getInstance()

// Helper functions
export function getTemplateById(id: string): TemplateConfig | undefined {
  return templateRegistry.getTemplate(id)
}

export function getTemplateComponent(id: string): TemplateComponent | undefined {
  return templateRegistry.getTemplateComponent(id)
}

export function isTemplateCompatible(templateId: string, themeId: string): boolean {
  return templateRegistry.isTemplateThemeCompatible(templateId, themeId)
}

export function getCompatibleTemplatesForTheme(themeId: string): TemplateConfig[] {
  return templateRegistry.getCompatibleTemplates(themeId)
}

export function getCompatibilityMatrix(): Record<string, string[]> {
  return templateRegistry.getCompatibilityMatrix()
}