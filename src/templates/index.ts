// Template auto-discovery and registration
import { TemplateRegistry } from '@/lib/template-registry'

// Import editor templates
import { PrebuiltTemplates } from '@/components/editor/templates/PrebuiltTemplates'
import { getAllModularTemplates } from '@/components/editor/templates/ModularTemplates'
import { Template as EditorTemplate } from '@/components/editor/templates/types'
import { TemplateConfig } from '@/lib/template-registry'

// Template registry instance
let templateRegistry: TemplateRegistry | null = null

// Convert editor template to registry template config
function convertEditorTemplateToConfig(editorTemplate: EditorTemplate): TemplateConfig {
  // Map editor categories to template registry categories
  const categoryMap: Record<string, TemplateConfig['category']> = {
    'test': 'minimal',
    'landing': 'modern',
    'content': 'modern',
    'business': 'classic',
    'catalog': 'product',
    'fashion': 'product'
  }

  // Detect multi-page editor templates
  const isMultiPage = !!editorTemplate.customProperties?.isMultiPageTemplate
  const multiPageData = editorTemplate.customProperties?.multiPageData

  return {
    id: editorTemplate.id,
    name: editorTemplate.name,
    description: editorTemplate.description,
    category: categoryMap[editorTemplate.category] || 'modern',
    isPremium: false, // Editor templates are free by default
    version: '1.0.0',
    previewImage: editorTemplate.thumbnail || `/templates/${editorTemplate.id}-preview.svg`,
    features: editorTemplate.tags,
    tags: editorTemplate.tags || [],
    // Prefer explicit pageCount; fall back to multiPageData length; default to 1
    pageCount: editorTemplate.pageCount ?? (Array.isArray(multiPageData) ? multiPageData.length : 1),
    supportedFields: {
      products: ['name', 'description', 'price', 'images', 'sku', 'tags', 'currency', 'priceDisplay'],
      categories: ['name', 'description', 'color'],
      profile: ['companyName', 'logo', 'email', 'phone', 'website', 'address', 'description', 'tagline', 'socialLinks']
    },
    compatibleThemes: ['modern-blue', 'classic-warm', 'minimal-mono'],
    requiredThemeFeatures: [],
    customProperties: {
      isEditorTemplate: true,
      originalCategory: editorTemplate.category,
      // Map single-page and multi-page data appropriately for the editor
      ...(isMultiPage
        ? { isMultiPageTemplate: true, multiPageData }
        : { editorData: editorTemplate.data }
      )
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

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

  // Get all templates (both legacy and modular)
  const allModularTemplates = getAllModularTemplates();
  const allTemplates = [...PrebuiltTemplates, ...allModularTemplates];

  // Register editor templates
  console.log('📝 Registering all templates:', allTemplates.length);
  console.log('📝 PrebuiltTemplates:', PrebuiltTemplates.length);
  console.log('📝 ModularTemplates:', allModularTemplates.length);
  
  allTemplates.forEach(editorTemplate => {
    const config = convertEditorTemplateToConfig(editorTemplate)
    console.log('📝 Registering template:', {
      id: editorTemplate.id,
      name: editorTemplate.name,
      category: editorTemplate.category,
      isModular: allModularTemplates.some(t => t.id === editorTemplate.id),
      hasData: !!editorTemplate.data,
      dataType: typeof editorTemplate.data,
      dataKeys: editorTemplate.data ? Object.keys(editorTemplate.data) : [],
      configId: config.id,
      hasEditorData: !!config.customProperties?.editorData,
      editorDataType: typeof config.customProperties?.editorData,
      editorDataKeys: config.customProperties?.editorData ? Object.keys(config.customProperties.editorData) : []
    });
    // Create a simple wrapper component for editor templates
    const EditorTemplateWrapper = () => {
      return null // Editor templates are handled differently
    }
    templateRegistry!.registerTemplate(config, EditorTemplateWrapper)
  })

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
  const template = registry.getTemplate(templateId)
  
  console.log('🔍 getTemplateById Debug:', {
    templateId,
    templateFound: !!template,
    allTemplateIds: registry.getAllTemplates().map(t => t.id),
    totalTemplates: registry.getAllTemplates().length,
    templateData: template ? {
      id: template.id,
      name: template.name,
      hasCustomProperties: !!template.customProperties,
      hasEditorData: !!template.customProperties?.editorData,
      editorDataType: typeof template.customProperties?.editorData,
      editorDataKeys: template.customProperties?.editorData ? Object.keys(template.customProperties.editorData) : []
    } : null
  });
  
  return template
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

// Template configurations are now handled through the registry

// Export types
export type { TemplateConfig } from '@/lib/template-registry'