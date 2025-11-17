# Modular Template System

This directory contains a modular template system for the CraftJS editor that provides organized, extensible, and maintainable template management.

## 🏗️ Architecture

### Directory Structure

```
templates/
├── catalog/                 # Catalog-specific templates
│   ├── index.ts            # Exports all catalog templates
│   └── furniture-catalog.ts # Furniture catalog template
├── landing/                 # Landing page templates
│   ├── index.ts            # Exports all landing templates
│   ├── hero-landing.ts     # Hero landing template
│   └── feature-grid.ts     # Feature grid template
├── registry/                # Template registry system
│   └── template-registry.ts # Centralized template management
├── utils/                   # Utility functions
│   └── template-builder.ts  # Template builder utilities
├── ModularTemplates.ts      # Main modular system
├── PrebuiltTemplates.ts     # Legacy templates (maintained for compatibility)
├── TemplateManager.tsx      # Template manager component
├── types.ts                 # Type definitions
└── index.ts                 # Main exports
```

## 🚀 Features

### 1. **Modular Organization**

- Each template is stored in its own file
- Templates are organized by category (catalog, landing, etc.)
- Easy to locate and modify specific templates

### 2. **Easy Extensibility**

- Simple process to add new templates
- Straightforward category creation
- Template builder utilities for consistency

### 3. **Simple Management**

- Easy addition of new templates
- Straightforward removal of outdated templates
- Centralized registry system

### 4. **Consistency**

- Template builder utilities ensure consistent structure
- Standardized template creation process
- Type safety with TypeScript

## 📝 Usage

### Using Existing Templates

```typescript
import {
  getAllModularTemplates,
  getTemplatesByCategory,
  getTemplateById,
} from '@/components/editor/templates'

// Get all templates
const allTemplates = getAllModularTemplates()

// Get templates by category
const catalogTemplates = getTemplatesByCategory('catalog')

// Get specific template
const furnitureTemplate = getTemplateById('furniture-catalog')
```

### Creating a New Template

1. **Create the template file** (e.g., `catalog/electronics-catalog.ts`):

```typescript
import { Template } from '../types'
import {
  createTemplate,
  createContainer,
  createHeading,
  createText,
} from '../utils/template-builder'

export const electronicsCatalogTemplate: Template = createTemplate()
  .setId('electronics-catalog')
  .setName('Electronics Catalog')
  .setDescription('A modern electronics product catalog')
  .setCategory('catalog')
  .addTags('electronics', 'products', 'modern')
  .setData({
    ROOT: {
      ...createContainer(
        'ROOT',
        {
          padding: 0,
          backgroundColor: '#ffffff',
        },
        'Electronics Catalog',
        ['hero-section']
      ),
    },
    'hero-section': {
      ...createContainer(
        'hero-section',
        {
          padding: 80,
          backgroundColor: '#1a1a1a',
          textAlign: 'center',
        },
        'Hero Section',
        ['hero-title'],
        'ROOT'
      ),
    },
    'hero-title': {
      ...createHeading(
        'Latest Electronics',
        1,
        {
          fontSize: 48,
          color: '#ffffff',
          marginBottom: 20,
        },
        'Hero Title',
        'hero-section'
      ),
    },
  })
  .build()
```

2. **Export from category index** (`catalog/index.ts`):

```typescript
export { furnitureCatalogTemplate } from './furniture-catalog'
export { electronicsCatalogTemplate } from './electronics-catalog' // Add this line
```

3. **Register in ModularTemplates.ts**:

```typescript
import { electronicsCatalogTemplate } from './catalog'

const modularTemplates: Template[] = [
  furnitureCatalogTemplate,
  electronicsCatalogTemplate, // Add this line
  // ... other templates
]
```

### Adding a New Category

1. **Create category directory** (e.g., `business/`)
2. **Create index file** (`business/index.ts`)
3. **Create template files** in the directory
4. **Import and register** in `ModularTemplates.ts`

### Template Builder Utilities

The template builder provides helper functions for consistent template creation:

```typescript
import {
  createTemplate,
  createContainer,
  createHeading,
  createText,
  createImage,
  createButton,
  createGrid,
} from '../utils/template-builder'

// Create a template
const myTemplate = createTemplate()
  .setId('my-template')
  .setName('My Template')
  .setDescription('A custom template')
  .setCategory('custom')
  .addTags('custom', 'example')
  .setData({
    // CraftJS data structure
  })
  .build()

// Create common elements
const container = createContainer('container-id', { padding: 20 })
const heading = createHeading('My Heading', 1, { fontSize: 32 })
const text = createText('My text content', { fontSize: 16 })
const image = createImage('/path/to/image.jpg', 'Alt text')
const button = createButton('Click me', { backgroundColor: '#blue' })
const grid = createGrid(3, { gap: 20 })
```

## 🔧 Registry System

The template registry provides centralized management:

```typescript
import { templateRegistry } from '@/components/editor/templates'

// Register a template
templateRegistry.register(myTemplate)

// Get templates by category
const catalogTemplates = templateRegistry.getTemplatesByCategory('catalog')

// Search templates
const searchResults = templateRegistry.searchTemplates('furniture')

// Remove a template
templateRegistry.unregister('template-id')
```

## 🔄 Migration from Legacy System

The modular system maintains backward compatibility with the existing `PrebuiltTemplates.ts`. Existing templates are automatically imported and registered in the new system.

To migrate a template from the legacy system:

1. Extract the template from `PrebuiltTemplates.ts`
2. Create a new file in the appropriate category directory
3. Use template builder utilities to recreate the template
4. Register the new template in `ModularTemplates.ts`
5. Remove the old template from `PrebuiltTemplates.ts`

## 🎯 Best Practices

1. **Naming Convention**: Use kebab-case for template IDs and file names
2. **Organization**: Group related templates in category directories
3. **Documentation**: Add clear descriptions and tags to templates
4. **Consistency**: Use template builder utilities for all new templates
5. **Testing**: Test templates in the CraftJS editor before committing

## 🔍 Example: Furniture Catalog Template

The furniture catalog template demonstrates the modular system's capabilities:

- **File**: `catalog/furniture-catalog.ts`
- **Features**: Hero section, featured products, categories, product grid, footer
- **Structure**: Uses template builder utilities for consistency
- **Styling**: Modern design with warm furniture-appropriate colors
- **Responsive**: Grid layouts that adapt to different screen sizes

This template serves as a reference for creating new catalog templates and demonstrates the power and flexibility of the modular system.
