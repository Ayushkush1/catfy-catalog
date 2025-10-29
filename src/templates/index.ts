// Template auto-discovery and registration
import { TemplateRegistry } from '@/lib/template-registry'

// Import editor templates
import { PrebuiltTemplates } from '@/components/editor/templates/PrebuiltTemplates'
import { getAllModularTemplates } from '@/components/editor/templates/ModularTemplates'
import { Template as EditorTemplate } from '@/components/editor/templates/types'
import { TemplateConfig } from '@/lib/template-registry'

// Import HTML templates from iframe-templates
import {
  HtmlTemplates,
  PrebuiltTemplate,
} from '@/components/editor/iframe-templates'

// Template registry instance
let templateRegistry: TemplateRegistry | null = null
let dbTemplatesLoaded = false

// Convert HTML template to registry template config
function convertHtmlTemplateToConfig(
  htmlTemplate: PrebuiltTemplate
): TemplateConfig {
  return {
    id: htmlTemplate.id,
    name: htmlTemplate.name,
    description: `HTML ${htmlTemplate.engine} template - ${htmlTemplate.pages.length} page(s)`,
    category: 'modern', // All HTML templates use modern category
    isPremium: false,
    version: '1.0.0',
    // Use specific preview assets from public/templates. All templates have PNG previews.
    // Map template IDs to their corresponding preview image files.
    previewImage:
      htmlTemplate.id === 'furniture-catalog'
        ? '/templates/furniture-catalogue-preview.png'
        : htmlTemplate.id === 'fashion-catalogue'
          ? '/templates/fashion-catalogue-preview.png'
          : htmlTemplate.id === 'skincare-catalogue'
            ? '/templates/skincare-catalogue-preview.png'
            : htmlTemplate.id === 'fmcg-catalogue'
              ? '/templates/fmcg-catalogue-preview.png'
              : htmlTemplate.id === 'home-decor-catalogue'
                ? '/templates/home-decor-catalogue-preview.png'
                : `/templates/${htmlTemplate.id}-preview.svg`,
    features: [
      'HTML',
      htmlTemplate.engine,
      `${htmlTemplate.pages.length} page(s)`,
    ],
    tags: ['html', htmlTemplate.engine, 'iframe'],
    pageCount: htmlTemplate.pages.length,
    supportedFields: {
      products: ['name', 'description', 'price', 'images'],
      categories: ['name', 'description'],
      profile: ['companyName', 'logo', 'email', 'phone', 'website'],
    },
    compatibleThemes: ['modern-blue', 'classic-warm', 'minimal-mono'],
    requiredThemeFeatures: [],
    customProperties: {
      isHtmlTemplate: true,
      engine: htmlTemplate.engine,
      htmlTemplateData: htmlTemplate,
      pages: htmlTemplate.pages,
      sharedCss: htmlTemplate.sharedCss,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

// Convert editor template to registry template config
function convertEditorTemplateToConfig(
  editorTemplate: EditorTemplate
): TemplateConfig {
  // Map editor categories to template registry categories
  const categoryMap: Record<string, TemplateConfig['category']> = {
    test: 'minimal',
    landing: 'modern',
    content: 'modern',
    business: 'classic',
    catalog: 'product',
    fashion: 'product',
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
    previewImage:
      editorTemplate.thumbnail || `/templates/${editorTemplate.id}-preview.svg`,
    features: editorTemplate.tags,
    tags: editorTemplate.tags || [],
    // Prefer explicit pageCount; fall back to multiPageData length; default to 1
    pageCount:
      editorTemplate.pageCount ??
      (Array.isArray(multiPageData) ? multiPageData.length : 1),
    supportedFields: {
      products: [
        'name',
        'description',
        'price',
        'images',
        'sku',
        'tags',
        'currency',
        'priceDisplay',
      ],
      categories: ['name', 'description', 'color'],
      profile: [
        'companyName',
        'logo',
        'email',
        'phone',
        'website',
        'address',
        'description',
        'tagline',
        'socialLinks',
      ],
    },
    compatibleThemes: ['modern-blue', 'classic-warm', 'minimal-mono'],
    requiredThemeFeatures: [],
    customProperties: {
      isEditorTemplate: true,
      originalCategory: editorTemplate.category,
      // Map single-page and multi-page data appropriately for the editor
      ...(isMultiPage
        ? { isMultiPageTemplate: true, multiPageData }
        : { editorData: editorTemplate.data }),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
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

  // Register HTML templates (from iframe-templates) - PRIORITY
  console.log('📝 Registering HTML templates:', HtmlTemplates.length)
  HtmlTemplates.forEach(htmlTemplate => {
    const config = convertHtmlTemplateToConfig(htmlTemplate)
    console.log('📝 Registering HTML template:', {
      id: htmlTemplate.id,
      name: htmlTemplate.name,
      engine: htmlTemplate.engine,
      pageCount: htmlTemplate.pages.length,
      configId: config.id,
    })
    const HtmlTemplateWrapper = () => {
      return null // HTML templates are handled by IframeEditor
    }
    templateRegistry!.registerTemplate(config, HtmlTemplateWrapper)
  })

  // REMOVED: CraftJS Editor templates are no longer registered
  // User requested to only show HTML templates and remove other editor templates

  // Get all templates (both legacy and modular) - COMMENTED OUT
  // const allModularTemplates = getAllModularTemplates();
  // const allTemplates = [...PrebuiltTemplates, ...allModularTemplates];

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
    templateData: template
      ? {
        id: template.id,
        name: template.name,
        hasCustomProperties: !!template.customProperties,
        hasEditorData: !!template.customProperties?.editorData,
        editorDataType: typeof template.customProperties?.editorData,
        editorDataKeys: template.customProperties?.editorData
          ? Object.keys(template.customProperties.editorData)
          : [],
      }
      : null,
  })

  return template
}

export function getTemplatesByCategory(
  category:
    | 'modern'
    | 'classic'
    | 'minimal'
    | 'creative'
    | 'industry'
    | 'specialized'
    | 'product'
) {
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

export function validateTemplateThemeCompatibility(
  templateId: string,
  themeId: string
): boolean {
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

// Load templates from DB (published) and register into registry
// DISABLED: We're only using HTML templates from iframe-templates now
export async function loadDbTemplatesIntoRegistry(): Promise<void> {
  initializeTemplateRegistry()
  if (dbTemplatesLoaded) return

  // Skip loading DB templates - we only use HTML templates now
  console.log('📋 Skipping DB templates - using HTML templates only')
  dbTemplatesLoaded = true
  return

  /* COMMENTED OUT - DB template loading disabled
  try {
    const res = await fetch('/api/templates', { cache: 'no-store' })
    if (!res.ok) {
      console.warn('Failed to fetch DB templates:', res.status)
      return
    }
    const json = await res.json()
    const items: TemplateConfig[] = json.templates || []
    items.forEach((config) => {
      const EditorTemplateWrapper = () => null
      templateRegistry!.registerTemplate(config, EditorTemplateWrapper)
    })
    dbTemplatesLoaded = true
  } catch (err) {
    console.error('Error loading DB templates:', err)
  }
  */
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
  return (
    template?.supportedFields || {
      products: [],
      categories: [],
      profile: [],
    }
  )
}

// Template configurations are now handled through the registry

// Export types
export type { TemplateConfig } from '@/lib/template-registry'
