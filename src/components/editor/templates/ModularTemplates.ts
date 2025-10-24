import { Template } from './types'
import {
  templateRegistry,
  registerTemplates,
} from './registry/template-registry'

// Import catalog templates
import { furnitureCatalogTemplate } from './catalog'

// Import landing templates
import { heroLandingTemplate, featureGridTemplate } from './landing'

// Import existing templates that we want to keep
import { PrebuiltTemplates } from './PrebuiltTemplates'

/**
 * Modular Template System
 *
 * This system provides:
 * 1. Organized template structure with separate files for each template
 * 2. Easy extensibility for adding new templates
 * 3. Simple removal of outdated templates
 * 4. Consistent template creation using builder utilities
 * 5. Centralized registry for template management
 */

// Register all modular templates
const modularTemplates: Template[] = [
  // Catalog templates
  furnitureCatalogTemplate,

  // Landing templates
  heroLandingTemplate,
  featureGridTemplate,
]

// Register existing templates (for backward compatibility)
const existingTemplates = PrebuiltTemplates.filter(
  template => !modularTemplates.some(modular => modular.id === template.id)
)

// Initialize the template registry
registerTemplates([...modularTemplates, ...existingTemplates])

/**
 * Get all templates from the registry
 */
export const getAllModularTemplates = (): Template[] => {
  return templateRegistry.getAllTemplates()
}

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: string): Template[] => {
  return templateRegistry.getTemplatesByCategory(category)
}

/**
 * Search templates
 */
export const searchTemplates = (query: string): Template[] => {
  return templateRegistry.searchTemplates(query)
}

/**
 * Get template by ID
 */
export const getTemplateById = (id: string): Template | undefined => {
  return templateRegistry.getTemplate(id)
}

/**
 * Get all available categories
 */
export const getAvailableCategories = (): string[] => {
  return templateRegistry.getCategories()
}

/**
 * Add a new template to the registry
 * This function makes it easy to add new templates dynamically
 */
export const addTemplate = (template: Template): void => {
  templateRegistry.register(template)
}

/**
 * Remove a template from the registry
 * This function makes it easy to remove outdated templates
 */
export const removeTemplate = (templateId: string): boolean => {
  return templateRegistry.unregister(templateId)
}

/**
 * Export the modular templates for backward compatibility
 * This ensures existing code continues to work
 */
export const ModularTemplates: Template[] = getAllModularTemplates()

// Export the registry for advanced usage
export { templateRegistry } from './registry/template-registry'

// Export template builder utilities for creating new templates
export * from './utils/template-builder'
