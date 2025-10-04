export { TemplateManager } from './TemplateManager';
export { PrebuiltTemplates } from './PrebuiltTemplates';
export type { Template, TemplateCategory } from './types';

// Export the new modular template system
export {
  ModularTemplates,
  getAllModularTemplates,
  getTemplatesByCategory,
  searchTemplates,
  getTemplateById,
  getAvailableCategories,
  addTemplate,
  removeTemplate,
  templateRegistry
} from './ModularTemplates';

// Export template builder utilities for creating new templates
export * from './utils/template-builder';