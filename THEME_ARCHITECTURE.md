# Dynamic Theme Creation Architecture

A comprehensive system for creating, managing, and previewing themes and templates in Catfy with improved developer experience.

## 🏗️ Architecture Overview

The dynamic theme creation architecture consists of four main phases:

1. **Content Standardization** - Unified data structures
2. **Theme Registry** - Centralized theme management
3. **Template System** - Template discovery and compatibility
4. **Developer Experience** - CLI tools and hot-reload

## 📁 File Structure

```
src/
├── lib/
│   ├── content-schema.ts          # Unified content schema and mapper
│   ├── theme-registry.ts           # Theme management and discovery
│   ├── template-registry.ts        # Template management and discovery
│   ├── compatibility-matrix.ts     # Theme-template compatibility
│   └── dev-server.ts              # Hot-reload development server
├── themes/
│   ├── index.ts                   # Theme exports and initialization
│   ├── modern-blue.theme.ts       # Modern Blue theme
│   ├── classic-warm.theme.ts      # Classic Warm theme
│   └── minimal-mono.theme.ts      # Minimal Mono theme
├── templates/
│   └── index.ts                   # Template exports and initialization
├── components/
│   ├── catalog-templates/
│   │   ├── index.ts              # Template exports with registry integration
│   │   └── modern-4page/
│   │       ├── ModernCatalogTemplate.tsx
│   │       └── template.config.ts
│   └── preview/
│       └── ThemeTemplatePreview.tsx # Preview system component
└── cli/
    ├── index.ts                   # CLI entry point
    └── generators/
        ├── theme-generator.ts     # Theme generation tool
        └── template-generator.ts  # Template generation tool
```

## 🎨 Phase 1: Content Standardization

### Content Schema (`src/lib/content-schema.ts`)

Defines standardized data structures using Zod for validation:

```typescript
// Unified content types
type StandardizedCatalogue = {
  catalogue: CatalogueData
  profile: ProfileData
  products: ProductData[]
  categories: CategoryData[]
}

// Content mapper for transformation
class ContentMapper {
  mapCatalogue(rawData: RawCatalogueData): StandardizedCatalogue
  validateCatalogue(content: StandardizedCatalogue): boolean
}
```

**Benefits:**
- Consistent data structure across all templates
- Type safety with Zod validation
- Easy data transformation from raw formats
- Standardized field access patterns

## 🎭 Phase 2: Theme Registry

### Theme Registry (`src/lib/theme-registry.ts`)

Centralized theme management system:

```typescript
class ThemeRegistry {
  static getInstance(): ThemeRegistry
  loadThemes(): Promise<void>
  registerTheme(theme: ThemeConfig): void
  getTheme(id: string): ThemeConfig | null
  getAllThemes(): ThemeConfig[]
  validateTheme(theme: ThemeConfig): boolean
}
```

### Theme Configuration

Each theme follows a standardized configuration:

```typescript
interface ThemeConfig {
  id: string
  name: string
  description: string
  category: 'modern' | 'classic' | 'minimal' | 'creative'
  version: string
  author: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
  }
  typography: {
    fontFamily: string
    headingFont: string
    bodyFont: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
    }
  }
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  shadows: Record<string, string>
  compatibleTemplates: string[]
}
```

**Benefits:**
- Auto-discovery of themes
- Validation and type safety
- Centralized theme management
- Easy theme switching

## 📄 Phase 3: Template System

### Template Registry (`src/lib/template-registry.ts`)

Manages template discovery and compatibility:

```typescript
class TemplateRegistry {
  static getInstance(): TemplateRegistry
  loadTemplates(): Promise<void>
  registerTemplate(template: TemplateConfig): void
  getTemplate(id: string): TemplateConfig | null
  getAllTemplates(): TemplateConfig[]
  validateTemplate(template: TemplateConfig): boolean
}
```

### Compatibility Matrix (`src/lib/compatibility-matrix.ts`)

Manages theme-template relationships:

```typescript
class CompatibilityMatrix {
  addCompatibilityRule(rule: CompatibilityRule): void
  isCompatible(themeId: string, templateId: string): boolean
  getCompatibleThemes(templateId: string): string[]
  getCompatibleTemplates(themeId: string): string[]
  getFullMatrix(): Record<string, string[]>
}
```

**Benefits:**
- Automatic compatibility checking
- Template-theme relationship management
- Easy filtering of compatible combinations
- Validation of theme-template pairs

## 🛠️ Phase 4: Developer Experience

### CLI Tools (`src/cli/`)

Comprehensive command-line interface for development:

#### Available Commands

```bash
# Theme Management
npm run catfy:theme -- -n "Ocean Blue" -i ocean-blue --primary "#0066cc"
npm run catfy:list-themes

# Template Management
npm run catfy:template -- -n "Modern Grid" -i modern-grid -p 6
npm run catfy:list-templates

# Compatibility Testing
npm run catfy:validate -- -t ocean-blue --template modern-grid
npm run catfy:validate -- --theme ocean-blue
npm run catfy:validate

# Development Server
npm run catfy:dev -- -p 3000

# Help
npm run catfy:help
```

### Hot-Reload Development Server (`src/lib/dev-server.ts`)

Real-time development environment:

```typescript
class DevServer extends EventEmitter {
  start(): Promise<void>
  stop(): Promise<void>
  
  // Events
  on('theme:changed', (themeId: string) => void)
  on('template:changed', (templateId: string) => void)
  on('compatibility:updated', () => void)
}
```

**Features:**
- File watching for themes and templates
- Automatic registry reloading
- Compatibility matrix updates
- Real-time preview updates
- Debounced change detection

### Preview System (`src/components/preview/ThemeTemplatePreview.tsx`)

Comprehensive preview and testing interface:

**Features:**
- Single preview mode
- Grid view of all combinations
- Theme comparison view
- Compatibility status indicators
- Export functionality
- Auto-refresh capabilities

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Create a New Theme

```bash
npm run catfy:theme -- \
  --name "Sunset Orange" \
  --id sunset-orange \
  --description "A warm, vibrant theme" \
  --category modern \
  --primary "#ff6b35" \
  --secondary "#f7931e" \
  --accent "#ffb627"
```

### 3. Create a New Template

```bash
npm run catfy:template -- \
  --name "Elegant Portfolio" \
  --id elegant-portfolio \
  --description "A sophisticated portfolio layout" \
  --category classic \
  --pages 8 \
  --features "Portfolio showcase,Client testimonials,Service listings"
```

### 4. Start Development Server

```bash
npm run catfy:dev
```

### 5. Test Compatibility

```bash
npm run catfy:validate -- --theme sunset-orange --template elegant-portfolio
```

## 📋 Usage Examples

### Creating a Custom Theme

1. **Generate theme files:**
   ```bash
   npm run catfy:theme -- -n "Corporate Blue" -i corporate-blue
   ```

2. **Customize the generated theme:**
   ```typescript
   // src/themes/corporate-blue.theme.ts
   export const corporateBlueTheme: Omit<ThemeConfig, 'id'> = {
     name: 'Corporate Blue',
     description: 'Professional corporate theme',
     colors: {
       primary: '#1e40af',
       secondary: '#64748b',
       accent: '#3b82f6'
       // ... other colors
     }
     // ... other configuration
   }
   ```

3. **Register the theme:**
   ```typescript
   // src/themes/index.ts
   import { corporateBlueTheme } from './corporate-blue.theme'
   
   export async function initializeThemeRegistry() {
     const registry = ThemeRegistry.getInstance()
     registry.registerTheme({ id: 'corporate-blue', ...corporateBlueTheme })
   }
   ```

### Using the Preview System

```typescript
import { ThemeTemplatePreview } from '@/components/preview/ThemeTemplatePreview'

function PreviewPage({ catalogue, profile }) {
  return (
    <ThemeTemplatePreview
      catalogue={catalogue}
      profile={profile}
      className="container mx-auto py-8"
    />
  )
}
```

### Integrating with Existing Templates

```typescript
// Update existing template to use standardized content
import { ContentMapper, type StandardizedCatalogue } from '@/lib/content-schema'
import { TemplateRegistry } from '@/lib/template-registry'

function MyTemplate({ catalogue, profile, themeId }) {
  // Convert to standardized format
  const standardizedContent = useMemo(() => {
    const mapper = new ContentMapper()
    return mapper.mapCatalogue({ catalogue, profile, products: catalogue.products, categories: catalogue.categories })
  }, [catalogue, profile])

  // Register template
  useEffect(() => {
    const registry = TemplateRegistry.getInstance()
    registry.loadTemplates()
  }, [])

  // Use standardized content in template
  return (
    <div>
      <h1>{standardizedContent.catalogue.title}</h1>
      {/* ... rest of template */}
    </div>
  )
}
```

## 🔧 Configuration

### Development Server Configuration

```typescript
const devServerConfig: DevServerConfig = {
  themesDir: 'src/themes',
  templatesDir: 'src/components/catalog-templates',
  watchPatterns: ['**/*.theme.ts', '**/template.config.ts', '**/*.tsx'],
  debounceMs: 300,
  enableHotReload: true,
  enableCompatibilityCheck: true,
  logLevel: 'info'
}
```

### Theme Configuration Template

```typescript
const themeTemplate: Omit<ThemeConfig, 'id'> = {
  name: 'Theme Name',
  description: 'Theme description',
  category: 'modern',
  version: '1.0.0',
  author: 'Author Name',
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
    textSecondary: '#6b7280'
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    headingFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  },
  compatibleTemplates: ['*']
}
```

## 🧪 Testing

### Compatibility Testing

```bash
# Test specific combination
npm run catfy:validate -- --theme modern-blue --template modern-4page

# Test all combinations for a theme
npm run catfy:validate -- --theme modern-blue

# Test all combinations for a template
npm run catfy:validate -- --template modern-4page

# Show full compatibility matrix
npm run catfy:validate
```

### Preview Testing

1. Start the development server:
   ```bash
   npm run catfy:dev
   ```

2. Open the preview component in your application
3. Test different theme-template combinations
4. Verify compatibility indicators
5. Test export functionality

## 📚 API Reference

### ContentMapper

```typescript
class ContentMapper {
  mapCatalogue(data: RawCatalogueData): StandardizedCatalogue
  mapProduct(product: Product): ProductData
  mapCategory(category: Category): CategoryData
  mapProfile(profile: Profile): ProfileData
  validateCatalogue(content: StandardizedCatalogue): boolean
}
```

### ThemeRegistry

```typescript
class ThemeRegistry {
  static getInstance(): ThemeRegistry
  loadThemes(): Promise<void>
  registerTheme(theme: ThemeConfig): void
  unregisterTheme(themeId: string): void
  getTheme(themeId: string): ThemeConfig | null
  getAllThemes(): ThemeConfig[]
  getThemesByCategory(category: string): ThemeConfig[]
  validateTheme(theme: ThemeConfig): boolean
}
```

### TemplateRegistry

```typescript
class TemplateRegistry {
  static getInstance(): TemplateRegistry
  loadTemplates(): Promise<void>
  registerTemplate(template: TemplateConfig): void
  unregisterTemplate(templateId: string): void
  getTemplate(templateId: string): TemplateConfig | null
  getAllTemplates(): TemplateConfig[]
  getTemplatesByCategory(category: string): TemplateConfig[]
  getFreeTemplates(): TemplateConfig[]
  getPremiumTemplates(): TemplateConfig[]
  validateTemplate(template: TemplateConfig): boolean
}
```

### CompatibilityMatrix

```typescript
class CompatibilityMatrix {
  addCompatibilityRule(rule: CompatibilityRule): void
  removeCompatibilityRule(themeId: string, templateId: string): void
  isCompatible(themeId: string, templateId: string): boolean
  getCompatibleThemes(templateId: string): string[]
  getCompatibleTemplates(themeId: string): string[]
  getFullMatrix(): Record<string, string[]>
  getBestRecommendations(themeId?: string, templateId?: string): Array<{theme: string, template: string, score: number}>
}
```

## 🎯 Best Practices

### Theme Development

1. **Use semantic color names** - primary, secondary, accent, etc.
2. **Maintain consistent spacing scales** - use standardized spacing values
3. **Test with multiple templates** - ensure theme works across different layouts
4. **Follow accessibility guidelines** - ensure sufficient color contrast
5. **Document theme features** - clearly describe theme characteristics

### Template Development

1. **Use standardized content schema** - always work with `StandardizedCatalogue`
2. **Support theme customization** - use theme colors and typography
3. **Implement responsive design** - ensure templates work on all devices
4. **Test compatibility** - verify template works with different themes
5. **Optimize for print** - consider print layouts for catalog templates

### Development Workflow

1. **Start with CLI generation** - use generators for consistent structure
2. **Use hot-reload development** - enable real-time preview updates
3. **Test compatibility early** - validate theme-template combinations
4. **Use preview system** - test all combinations before deployment
5. **Document customizations** - maintain clear documentation for custom features

## 🔮 Future Enhancements

- **Visual Theme Editor** - GUI for creating and editing themes
- **Template Builder** - Drag-and-drop template creation
- **Advanced Compatibility Rules** - More sophisticated compatibility logic
- **Theme Marketplace** - Community themes and templates
- **A/B Testing Integration** - Test different theme-template combinations
- **Performance Optimization** - Lazy loading and code splitting
- **Mobile App Support** - Extend architecture to mobile applications

## 🤝 Contributing

To contribute to the theme architecture:

1. Follow the established patterns and conventions
2. Add comprehensive tests for new features
3. Update documentation for any changes
4. Ensure backward compatibility
5. Test with existing themes and templates

## 📄 License

This architecture is part of the Catfy project and follows the same licensing terms.