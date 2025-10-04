import { Template } from '../types';

/**
 * Base template builder utility for creating consistent templates
 */
export class TemplateBuilder {
  private template: Partial<Template>;

  constructor() {
    this.template = {
      isCustom: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    };
  }

  /**
   * Set the template ID
   */
  setId(id: string): TemplateBuilder {
    this.template.id = id;
    return this;
  }

  /**
   * Set the template name
   */
  setName(name: string): TemplateBuilder {
    this.template.name = name;
    return this;
  }

  /**
   * Set the template description
   */
  setDescription(description: string): TemplateBuilder {
    this.template.description = description;
    return this;
  }

  /**
   * Set the template category
   */
  setCategory(category: string): TemplateBuilder {
    this.template.category = category;
    return this;
  }

  /**
   * Set the template thumbnail
   */
  setThumbnail(thumbnail: string): TemplateBuilder {
    this.template.thumbnail = thumbnail;
    return this;
  }

  /**
   * Add tags to the template
   */
  addTags(...tags: string[]): TemplateBuilder {
    this.template.tags = [...(this.template.tags || []), ...tags];
    return this;
  }

  /**
   * Set the template data (CraftJS serialized data)
   */
  setData(data: any): TemplateBuilder {
    this.template.data = data;
    return this;
  }

  /**
   * Mark template as custom
   */
  setCustom(isCustom: boolean = true): TemplateBuilder {
    this.template.isCustom = isCustom;
    return this;
  }

  /**
   * Set the page count for multi-page templates
   */
  setPageCount(pageCount: number): TemplateBuilder {
    this.template.pageCount = pageCount;
    return this;
  }

  /**
   * Set multi-page data for templates with multiple pages
   */
  setMultiPageData(pages: any[]): TemplateBuilder {
    // Store multi-page data in customProperties for the template manager to detect
    if (!this.template.customProperties) {
      this.template.customProperties = {};
    }
    this.template.customProperties.isMultiPageTemplate = true;
    this.template.customProperties.multiPageData = pages;
    this.template.customProperties.isEditorTemplate = true;
    return this;
  }

  /**
   * Build and return the complete template
   */
  build(): Template {
    // Check if this is a multi-page template
    const isMultiPage = this.template.customProperties?.isMultiPageTemplate;
    
    if (!this.template.id || !this.template.name || !this.template.description || 
        !this.template.category) {
      throw new Error('Template is missing required fields: id, name, description, or category');
    }

    // For multi-page templates, data is optional (stored in multiPageData)
    // For single-page templates, data is required
    if (!isMultiPage && !this.template.data) {
      throw new Error('Single-page template is missing required data field');
    }

    return this.template as Template;
  }
}

/**
 * Helper function to create a new template builder
 */
export const createTemplate = (): TemplateBuilder => new TemplateBuilder();

/**
 * Common CraftJS node structure helpers
 */
export const createNode = (
  type: string,
  props: any = {},
  displayName?: string,
  isCanvas: boolean = false,
  nodes: string[] = [],
  parent?: string
) => ({
  type: { resolvedName: type },
  isCanvas,
  props,
  displayName: displayName || type,
  custom: {},
  hidden: false,
  nodes,
  linkedNodes: {},
  ...(parent && { parent })
});

/**
 * Create a container node
 */
export const createContainer = (
  id: string,
  props: any = {},
  displayName?: string,
  nodes: string[] = [],
  parent?: string
) => createNode('ContainerBlock', props, displayName, true, nodes, parent);

/**
 * Create a text node
 */
export const createText = (
  text: string,
  props: any = {},
  displayName?: string,
  parent?: string
) => createNode('TextBlock', { text, ...props }, displayName, false, [], parent);

/**
 * Create a heading node
 */
export const createHeading = (
  text: string,
  level: number = 1,
  props: any = {},
  displayName?: string,
  parent?: string
) => createNode('HeadingBlock', { text, level, ...props }, displayName, false, [], parent);

/**
 * Create an image node
 */
export const createImage = (
  src: string,
  alt: string,
  props: any = {},
  displayName?: string,
  parent?: string
) => createNode('ImageBlock', { src, alt, ...props }, displayName, false, [], parent);

/**
 * Create a button node
 */
export const createButton = (
  text: string,
  props: any = {},
  displayName?: string,
  parent?: string
) => createNode('ButtonBlock', { text, ...props }, displayName, false, [], parent);

/**
 * Create a grid node
 */
export const createGrid = (
  columns: number,
  props: any = {},
  displayName?: string,
  nodes: string[] = [],
  parent?: string
) => createNode('GridBlock', { columns, gridTemplateColumns: `repeat(${columns}, 1fr)`, ...props }, displayName, true, nodes, parent);