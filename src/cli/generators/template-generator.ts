import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'
import { TemplateConfig } from '@/lib/template-registry'

// CLI options schema
const TemplateGeneratorOptionsSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  id: z.string().min(1, 'Template ID is required'),
  description: z.string().optional(),
  category: z.enum(['modern', 'classic', 'minimal', 'creative']),
  isPremium: z.boolean().default(false),
  author: z.string().default('Unknown'),
  pageCount: z.number().min(1).default(4),
  features: z.array(z.string()).default([]),
  outputDir: z.string().default('src/components/catalog-templates')
})

type TemplateGeneratorOptions = z.infer<typeof TemplateGeneratorOptionsSchema>

// Template generator
export class TemplateGenerator {
  private options: TemplateGeneratorOptions

  constructor(options: Partial<TemplateGeneratorOptions>) {
    this.options = TemplateGeneratorOptionsSchema.parse(options)
  }

  // Generate template configuration
  private generateTemplateConfig(): Omit<TemplateConfig, 'id'> {
    return {
      name: this.options.name,
      description: this.options.description || `A ${this.options.category} catalog template with ${this.options.pageCount} pages`,
      category: this.options.category,
      isPremium: this.options.isPremium,
      version: '1.0.0',
      author: this.options.author,
      previewImage: `/templates/${this.options.id}-preview.jpg`,
      features: [
        `${this.options.pageCount}-page layout`,
        `${this.options.category} design`,
        'Product categorization',
        'Contact information',
        'Responsive grid',
        'Print-optimized',
        ...this.options.features
      ],
      pageCount: this.options.pageCount,
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
          'category'
        ],
        categories: [
          'name',
          'description',
          'color',
          'sortOrder'
        ],
        profile: [
          'companyName',
          'fullName',
          'logo',
          'email',
          'phone',
          'website',
          'address',
          'city',
          'state',
          'country',
          'tagline',
          'socialLinks'
        ]
      },
      compatibleThemes: ['*'],
      requiredThemeFeatures: [],
      layoutOptions: {
        responsive: true,
        printOptimized: true,
        customizable: true
      },
      customProperties: {
        supportsSmartSort: true,
        supportsDragDrop: true,
        supportsColorCustomization: true,
        supportsFontCustomization: true,
        supportsSpacingCustomization: true,
        supportsAdvancedStyles: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  // Generate main template component
  private generateTemplateComponent(): string {
    const componentName = this.toPascalCase(this.options.id)
    
    return `'use client'

import { Catalogue, Category, Product, Profile } from '@prisma/client'
import { ContentMapper, type StandardizedCatalogue } from '@/lib/content-schema'
import { TemplateRegistry } from '@/lib/template-registry'
import { ThemeRegistry } from '@/lib/theme-registry'
import { useEffect, useMemo } from 'react'

interface ${componentName}Props {
  catalogue: Catalogue & {
    products: (Product & { category: Category | null })[]
    categories: Category[]
  }
  profile: Profile
  themeColors: {
    primary: string
    secondary: string
    accent: string
  }
  isEditMode?: boolean
  catalogueId?: string
  onProductsReorder?: (products: (Product & { category: Category | null })[]) => void
  onCatalogueUpdate?: (catalogueId: string, updates: Partial<Catalogue>) => void
  onProductUpdate?: (productId: string, updates: Partial<Product>) => void
  customColors?: any
  fontCustomization?: any
  spacingCustomization?: any
  advancedStyles?: any
  smartSortEnabled?: boolean
  themeId?: string
}

export function ${componentName}({ 
  catalogue, 
  profile, 
  themeColors, 
  isEditMode, 
  catalogueId, 
  onProductsReorder, 
  onCatalogueUpdate, 
  onProductUpdate,
  customColors,
  fontCustomization,
  spacingCustomization,
  advancedStyles,
  smartSortEnabled = false,
  themeId
}: ${componentName}Props) {
  // Convert raw data to standardized format
  const standardizedContent = useMemo(() => {
    const mapper = new ContentMapper()
    return mapper.mapCatalogue({
      catalogue,
      profile,
      products: catalogue.products,
      categories: catalogue.categories
    })
  }, [catalogue, profile])

  // Register template and theme if provided
  useEffect(() => {
    const templateRegistry = TemplateRegistry.getInstance()
    const themeRegistry = ThemeRegistry.getInstance()
    
    // Templates are now registered statically, no loading needed
    
    // Load themes if themeId is provided
    if (themeId) {
      themeRegistry.loadThemes()
    }
  }, [themeId])

  // Validate content structure
  useEffect(() => {
    try {
      // This will throw if content doesn't match schema
      const mapper = new ContentMapper()
      mapper.validateCatalogue(standardizedContent)
    } catch (error) {
      console.warn('Content validation warning:', error)
    }
  }, [standardizedContent])

  return (
    <div className="bg-white catalog-template">
      {/* TODO: Implement your template pages here */}
      ${this.generatePageStructure()}
    </div>
  )
}

export default ${componentName}
`
  }

  // Generate page structure based on page count
  private generatePageStructure(): string {
    const pages = []
    
    for (let i = 1; i <= this.options.pageCount; i++) {
      const pageName = this.getPageName(i)
      pages.push(`      {/* Page ${i}: ${pageName} */}
      <div className="min-h-screen flex items-center justify-center p-8 page-break">
        {/* TODO: Implement ${pageName} component */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">${pageName}</h1>
          <p className="text-gray-600">Page ${i} content goes here</p>
        </div>
      </div>`)
    }
    
    return pages.join('\n\n')
  }

  // Get page name based on index
  private getPageName(pageIndex: number): string {
    const commonPages = [
      'Cover',
      'Table of Contents',
      'Product Grid',
      'Contact Page',
      'About Us',
      'Services',
      'Gallery',
      'Testimonials'
    ]
    
    return commonPages[pageIndex - 1] || `Page ${pageIndex}`
  }

  // Generate template configuration file
  private generateConfigFile(): string {
    const config = this.generateTemplateConfig()
    
    return `import { TemplateConfig } from '@/lib/template-registry'

const template: Omit<TemplateConfig, 'id'> = ${JSON.stringify(config, null, 2)}

export default template
`
  }

  // Generate index file for the template
  private generateIndexFile(): string {
    const componentName = this.toPascalCase(this.options.id)
    
    return `export { default as ${componentName} } from './${componentName}'
export { default as templateConfig } from './template.config'
`
  }

  // Generate README for the template
  private generateReadme(): string {
    return `# ${this.options.name}

${this.options.description || `A ${this.options.category} catalog template with ${this.options.pageCount} pages`}

## Features
${this.options.features.map(feature => `- ${feature}`).join('\n')}

## Pages
${Array.from({ length: this.options.pageCount }, (_, i) => `${i + 1}. ${this.getPageName(i + 1)}`).join('\n')}

## Usage
\`\`\`typescript
import { ${this.toPascalCase(this.options.id)} } from '@/components/catalog-templates/${this.options.id}'

// Use in your component
<${this.toPascalCase(this.options.id)}
  catalogue={catalogue}
  profile={profile}
  themeColors={themeColors}
  // ... other props
/>
\`\`\`

## Customization
This template supports:
- Custom colors
- Font customization
- Spacing customization
- Advanced styles
- Smart sorting
- Drag & drop editing

## Compatibility
This template is compatible with all themes by default.

## Development
1. Modify the main component file: \`${this.toPascalCase(this.options.id)}.tsx\`
2. Update the configuration: \`template.config.ts\`
3. Test with different themes
4. Create preview images
`
  }

  // Generate all template files
  async generateTemplate(): Promise<{ success: boolean, files?: string[], error?: string }> {
    try {
      const templateDir = path.join(process.cwd(), this.options.outputDir, this.options.id)
      const files: string[] = []
      
      // Ensure template directory exists
      await fs.mkdir(templateDir, { recursive: true })
      
      // Generate main component file
      const componentName = this.toPascalCase(this.options.id)
      const componentFile = path.join(templateDir, `${componentName}.tsx`)
      await fs.writeFile(componentFile, this.generateTemplateComponent(), 'utf-8')
      files.push(componentFile)
      
      // Generate config file
      const configFile = path.join(templateDir, 'template.config.ts')
      await fs.writeFile(configFile, this.generateConfigFile(), 'utf-8')
      files.push(configFile)
      
      // Generate index file
      const indexFile = path.join(templateDir, 'index.ts')
      await fs.writeFile(indexFile, this.generateIndexFile(), 'utf-8')
      files.push(indexFile)
      
      // Generate README
      const readmeFile = path.join(templateDir, 'README.md')
      await fs.writeFile(readmeFile, this.generateReadme(), 'utf-8')
      files.push(readmeFile)
      
      return {
        success: true,
        files
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Utility function to convert string to PascalCase
  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
  }
}

// CLI command function
export async function generateTemplate(options: Partial<TemplateGeneratorOptions>): Promise<void> {
  const generator = new TemplateGenerator(options)
  
  console.log(`📄 Generating template: ${options.name}...`)
  
  const result = await generator.generateTemplate()
  if (!result.success) {
    console.error(`❌ Failed to generate template: ${result.error}`)
    return
  }
  
  console.log(`✅ Template generated successfully!`)
  console.log(`📁 Files created:`)
  result.files?.forEach(file => {
    console.log(`   - ${file}`)
  })
  
  console.log(`\n🚀 Template '${options.name}' has been generated successfully!`)
  console.log(`\nNext steps:`)
  console.log(`1. Implement the page components in the template`)
  console.log(`2. Add the template to your template registry`)
  console.log(`3. Test the template with different themes`)
  console.log(`4. Create preview images for the template`)
  console.log(`5. Update the template configuration as needed`)
}

export type { TemplateGeneratorOptions }