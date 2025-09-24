import { TemplateRegistry } from '@/lib/template-registry';
import { grapesJSTemplateConfig } from '@/components/catalog-templates/grapesjs-template/template.config';
import GrapesJSTemplate from '@/components/catalog-templates/grapesjs-template/GrapesJSTemplate';

/**
 * Register GrapesJS templates with the template registry
 */
export function registerGrapesJSTemplates(registry: TemplateRegistry) {
  // Register the GrapesJS template
  registry.registerTemplate(grapesJSTemplateConfig, GrapesJSTemplate);
  
  // Set as default editor
  registry.setDefaultEditorTemplate('grapesjs-template');
}