import { TemplateRegistry } from './template-registry';
import { templateManager } from './template-management';
import { convertToGrapesJSTemplate } from './grapesjs-template-converter';

/**
 * Utility to migrate old React templates to GrapesJS format
 */
export class TemplateMigrationUtil {
  private registry: TemplateRegistry;

  constructor(registry: TemplateRegistry) {
    this.registry = registry;
  }

  /**
   * Migrate a specific template to GrapesJS format
   * @param templateId The ID of the template to migrate
   * @returns Promise resolving to the migrated template ID
   */
  async migrateTemplate(templateId: string): Promise<string> {
    // Get the template component and config
    const templateConfig = this.registry.getTemplateById(templateId);
    if (!templateConfig) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    // Skip if already a GrapesJS template
    if (templateConfig.isGrapesJSTemplate) {
      return templateId;
    }

    // Create a new GrapesJS template ID
    const newTemplateId = `grapesjs-${templateId}`;

    // Convert the template to GrapesJS format
    const grapesJSTemplate = await convertToGrapesJSTemplate(templateId);

    // Save the new template
    await templateManager.saveTemplate({
      id: newTemplateId,
      name: `${templateConfig.name} (GrapesJS)`,
      html: grapesJSTemplate.html,
      css: grapesJSTemplate.css,
      js: grapesJSTemplate.js || '',
      components: grapesJSTemplate.components || [],
    });

    return newTemplateId;
  }

  /**
   * Migrate all templates in the registry to GrapesJS format
   * @returns Promise resolving to an array of migrated template IDs
   */
  async migrateAllTemplates(): Promise<string[]> {
    const templates = this.registry.getAllTemplates();
    const migratedIds: string[] = [];

    for (const template of templates) {
      // Skip already migrated templates
      if (template.isGrapesJSTemplate) {
        migratedIds.push(template.id);
        continue;
      }

      try {
        const newId = await this.migrateTemplate(template.id);
        migratedIds.push(newId);
      } catch (error) {
        console.error(`Failed to migrate template ${template.id}:`, error);
      }
    }

    return migratedIds;
  }

  /**
   * Replace an old template with its GrapesJS version for a specific catalogue
   * @param catalogueId The ID of the catalogue
   * @param oldTemplateId The ID of the old template
   * @returns Promise resolving to the new template ID
   */
  async replaceTemplateForCatalogue(catalogueId: string, oldTemplateId: string): Promise<string> {
    // Migrate the template
    const newTemplateId = await this.migrateTemplate(oldTemplateId);

    // Update the catalogue's template selection
    // This would typically be handled by your catalogue management system
    // For now, we'll just return the new template ID
    return newTemplateId;
  }
}

// Export a singleton instance
export const templateMigration = new TemplateMigrationUtil(TemplateRegistry.getInstance());