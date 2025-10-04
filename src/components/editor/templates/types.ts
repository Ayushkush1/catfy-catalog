export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  data: any; // Craft.js serialized data
  tags: string[];
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
  customProperties?: Record<string, any>;
  pageCount?: number;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  templates: Template[];
}

export interface TemplateManagerProps {
  onLoadTemplate: (template: Template) => void;
  onSaveTemplate: (name: string, description: string, category: string, tags: string[]) => void;
  currentData?: any;
}