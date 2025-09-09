// Template auto-discovery and registration
import { TemplateRegistry } from '@/lib/template-registry'
import { SkincareCatalogueTemplateWrapper } from '@/components/catalog-templates/skincare-catalogue/SkincareCatalogueTemplate'
import { FashionCatalogueTemplateWrapper } from '@/components/catalog-templates/fashion-catalogue/FashionCatalogueTemplate'

// Import template configurations
import { skincareCatalogueConfig } from '@/components/catalog-templates/skincare-catalogue/template.config'
import { fashionCatalogueConfig } from '@/components/catalog-templates/fashion-catalogue/template.config'

// Template registry instance
let templateRegistry: TemplateRegistry | null = null

// Initialize template registry with auto-discovery
export function initializeTemplateRegistry(): TemplateRegistry {
  if (!templateRegistry) {
    templateRegistry = TemplateRegistry.getInstance()

    // Register all templates
    registerAllTemplates()
  }

  return templateRegistry
}

// Register all available templates
function registerAllTemplates() {
  if (!templateRegistry) return

  // Register skincare catalogue template
  templateRegistry.registerTemplate(skincareCatalogueConfig, SkincareCatalogueTemplateWrapper)

  // Register fashion catalogue template
  templateRegistry.registerTemplate(fashionCatalogueConfig, FashionCatalogueTemplateWrapper)

  // Future templates can be registered here
  // templateRegistry.registerTemplate({
  //   id: 'classic-brochure',
  //   ...classicBrochureTemplate,
  //   component: ClassicBrochureTemplate
  // })
}

// Convenience functions
export function getTemplateRegistry(): TemplateRegistry {
  return initializeTemplateRegistry()
}

export function getAllTemplates() {
  const registry = getTemplateRegistry()
  return registry.getAllTemplates()
}

export function getTemplateById(templateId: string) {
  const registry = getTemplateRegistry()
  return registry.getTemplate(templateId)
}

export function getTemplatesByCategory(category: 'modern' | 'classic' | 'minimal' | 'creative' | 'industry' | 'specialized' | 'product') {
  const registry = getTemplateRegistry()
  return registry.getTemplatesByCategory(category)
}

export function getFreeTemplates() {
  const registry = getTemplateRegistry()
  return registry.getFreeTemplates()
}

export function getPremiumTemplates() {
  const registry = getTemplateRegistry()
  return registry.getPremiumTemplates()
}

export function validateTemplateThemeCompatibility(templateId: string, themeId: string): boolean {
  const registry = getTemplateRegistry()
  return registry.isTemplateThemeCompatible(templateId, themeId)
}

export function getCompatibleThemes(templateId: string): string[] {
  const registry = getTemplateRegistry()
  const template = registry.getTemplate(templateId)

  if (!template) return []

  return template.compatibleThemes
}

export function getTemplateComponent(templateId: string) {
  const registry = getTemplateRegistry()
  return registry.getTemplateComponent(templateId)
}

// Auto-discovery function for dynamic template loading
export async function discoverTemplates(): Promise<void> {
  // This function can be extended to dynamically discover template files
  // For now, it ensures all static templates are registered
  initializeTemplateRegistry()
}

// Template validation helpers
export function validateTemplateStructure(templateId: string) {
  const registry = getTemplateRegistry()
  return registry.validateTemplate(templateId)
}

export function getTemplateFeatures(templateId: string): string[] {
  const template = getTemplateById(templateId)
  return template?.features || []
}

export function getTemplateSupportedFields(templateId: string) {
  const template = getTemplateById(templateId)
  return template?.supportedFields || {
    products: [],
    categories: [],
    profile: []
  }
}

// Export template configurations for direct access
export {
  skincareCatalogueConfig,
  fashionCatalogueConfig
}

// Export types
export type { TemplateConfig } from '@/lib/template-registry'