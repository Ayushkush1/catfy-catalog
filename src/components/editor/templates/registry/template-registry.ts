import { Template } from '../types'

/**
 * Template Registry System
 * Provides a centralized way to manage templates with easy addition/removal
 */
export class TemplateRegistry {
  private templates: Map<string, Template> = new Map()
  private categories: Map<string, Template[]> = new Map()

  /**
   * Register a single template
   */
  register(template: Template): void {
    this.templates.set(template.id, template)
    this.updateCategoryIndex(template)
  }

  /**
   * Register multiple templates
   */
  registerMany(templates: Template[]): void {
    templates.forEach(template => this.register(template))
  }

  /**
   * Unregister a template by ID
   */
  unregister(templateId: string): boolean {
    const template = this.templates.get(templateId)
    if (template) {
      this.templates.delete(templateId)
      this.removeCategoryIndex(template)
      return true
    }
    return false
  }

  /**
   * Get a template by ID
   */
  getTemplate(templateId: string): Template | undefined {
    return this.templates.get(templateId)
  }

  /**
   * Get all templates
   */
  getAllTemplates(): Template[] {
    return Array.from(this.templates.values())
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): Template[] {
    return this.categories.get(category) || []
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return Array.from(this.categories.keys())
  }

  /**
   * Search templates by name, description, or tags
   */
  searchTemplates(query: string): Template[] {
    const lowercaseQuery = query.toLowerCase()
    return this.getAllTemplates().filter(
      template =>
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  /**
   * Get templates by tags
   */
  getTemplatesByTags(tags: string[]): Template[] {
    return this.getAllTemplates().filter(template =>
      tags.some(tag => template.tags.includes(tag))
    )
  }

  /**
   * Clear all templates
   */
  clear(): void {
    this.templates.clear()
    this.categories.clear()
  }

  /**
   * Get template count
   */
  getTemplateCount(): number {
    return this.templates.size
  }

  /**
   * Check if template exists
   */
  hasTemplate(templateId: string): boolean {
    return this.templates.has(templateId)
  }

  /**
   * Update category index when template is added
   */
  private updateCategoryIndex(template: Template): void {
    if (!this.categories.has(template.category)) {
      this.categories.set(template.category, [])
    }

    const categoryTemplates = this.categories.get(template.category)!
    const existingIndex = categoryTemplates.findIndex(t => t.id === template.id)

    if (existingIndex >= 0) {
      categoryTemplates[existingIndex] = template
    } else {
      categoryTemplates.push(template)
    }
  }

  /**
   * Remove template from category index
   */
  private removeCategoryIndex(template: Template): void {
    const categoryTemplates = this.categories.get(template.category)
    if (categoryTemplates) {
      const index = categoryTemplates.findIndex(t => t.id === template.id)
      if (index >= 0) {
        categoryTemplates.splice(index, 1)

        // Remove category if empty
        if (categoryTemplates.length === 0) {
          this.categories.delete(template.category)
        }
      }
    }
  }
}

// Global template registry instance
export const templateRegistry = new TemplateRegistry()

/**
 * Helper functions for easy template management
 */

/**
 * Register a template
 */
export const registerTemplate = (template: Template): void => {
  templateRegistry.register(template)
}

/**
 * Register multiple templates
 */
export const registerTemplates = (templates: Template[]): void => {
  templateRegistry.registerMany(templates)
}

/**
 * Remove a template
 */
export const removeTemplate = (templateId: string): boolean => {
  return templateRegistry.unregister(templateId)
}

/**
 * Get all templates
 */
export const getAllTemplates = (): Template[] => {
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
