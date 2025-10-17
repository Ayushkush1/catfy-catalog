// CraftJS serialized node structure
export interface CraftNode {
  type: { resolvedName: string };
  isCanvas: boolean;
  props: Record<string, any>;
  displayName: string;
  custom: Record<string, any>;
  hidden: boolean;
  nodes: string[];
  linkedNodes: Record<string, any>;
  parent?: string;
}

export interface CraftData {
  [nodeId: string]: CraftNode;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  data: CraftData | string; // Can be either serialized object or JSON string
  tags: string[];
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
  customProperties?: Record<string, unknown>;
  pageCount?: number;
  multiPageData?: Array<{ id: string; name: string; data: CraftData | string }>;
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
  currentData?: string;
}