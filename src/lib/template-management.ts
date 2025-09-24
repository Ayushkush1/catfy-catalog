/**
 * Template Management System
 * Handles template selection, storage, and conversion
 */

import { GrapesJSTemplate } from './grapesjs-template-converter';

// Template storage interface
export interface TemplateStorage {
  getTemplate(id: string): Promise<GrapesJSTemplate | null>;
  saveTemplate(template: GrapesJSTemplate): Promise<string>;
  listTemplates(): Promise<GrapesJSTemplate[]>;
  deleteTemplate(id: string): Promise<boolean>;
}

// In-memory template storage implementation
class MemoryTemplateStorage implements TemplateStorage {
  private templates: Map<string, GrapesJSTemplate> = new Map();

  async getTemplate(id: string): Promise<GrapesJSTemplate | null> {
    return this.templates.get(id) || null;
  }

  async saveTemplate(template: GrapesJSTemplate): Promise<string> {
    const id = template.id || `template-${Date.now()}`;
    const templateToSave = { ...template, id };
    this.templates.set(id, templateToSave);
    return id;
  }

  async listTemplates(): Promise<GrapesJSTemplate[]> {
    return Array.from(this.templates.values());
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }
}

// Template manager class
export class TemplateManager {
  private static instance: TemplateManager;
  private storage: TemplateStorage;

  private constructor(storage: TemplateStorage) {
    this.storage = storage;
  }

  static getInstance(storage?: TemplateStorage): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager(
        storage || new MemoryTemplateStorage()
      );
    }
    return TemplateManager.instance;
  }

  async getTemplate(id: string): Promise<GrapesJSTemplate | null> {
    return this.storage.getTemplate(id);
  }

  async saveTemplate(template: GrapesJSTemplate): Promise<string> {
    return this.storage.saveTemplate(template);
  }

  async listTemplates(): Promise<GrapesJSTemplate[]> {
    return this.storage.listTemplates();
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.storage.deleteTemplate(id);
  }

  async duplicateTemplate(id: string, newName?: string): Promise<string | null> {
    const template = await this.getTemplate(id);
    if (!template) return null;

    const newTemplate: GrapesJSTemplate = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: newName || `${template.name} (Copy)`
    };

    return this.saveTemplate(newTemplate);
  }
}

// Default template manager instance
export const templateManager = TemplateManager.getInstance();

// Template selection for catalogues
export interface CatalogueTemplateSelection {
  catalogueId: string;
  templateId: string;
  customizations?: Record<string, any>;
}

// Template selection storage
class TemplateSelectionStorage {
  private selections: Map<string, CatalogueTemplateSelection> = new Map();

  getSelection(catalogueId: string): CatalogueTemplateSelection | null {
    return this.selections.get(catalogueId) || null;
  }

  saveSelection(selection: CatalogueTemplateSelection): void {
    this.selections.set(selection.catalogueId, selection);
  }

  deleteSelection(catalogueId: string): boolean {
    return this.selections.delete(catalogueId);
  }

  listSelections(): CatalogueTemplateSelection[] {
    return Array.from(this.selections.values());
  }
}

// Template selection manager
export class TemplateSelectionManager {
  private static instance: TemplateSelectionManager;
  private storage: TemplateSelectionStorage;

  private constructor() {
    this.storage = new TemplateSelectionStorage();
  }

  static getInstance(): TemplateSelectionManager {
    if (!TemplateSelectionManager.instance) {
      TemplateSelectionManager.instance = new TemplateSelectionManager();
    }
    return TemplateSelectionManager.instance;
  }

  getTemplateForCatalogue(catalogueId: string): CatalogueTemplateSelection | null {
    return this.storage.getSelection(catalogueId);
  }

  setTemplateForCatalogue(catalogueId: string, templateId: string, customizations?: Record<string, any>): void {
    this.storage.saveSelection({
      catalogueId,
      templateId,
      customizations
    });
  }

  removeTemplateFromCatalogue(catalogueId: string): boolean {
    return this.storage.deleteSelection(catalogueId);
  }

  listCatalogueTemplateSelections(): CatalogueTemplateSelection[] {
    return this.storage.listSelections();
  }
}

// Default template selection manager instance
export const templateSelectionManager = TemplateSelectionManager.getInstance();