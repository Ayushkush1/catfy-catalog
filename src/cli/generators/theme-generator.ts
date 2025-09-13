import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'
import { ThemeConfig } from '@/lib/theme-registry'

// CLI options schema
const ThemeGeneratorOptionsSchema = z.object({
  name: z.string().min(1, 'Theme name is required'),
  id: z.string().min(1, 'Theme ID is required'),
  description: z.string().optional(),
  category: z.enum(['modern', 'classic', 'minimal', 'creative']),
  isPremium: z.boolean().default(false),
  author: z.string().default('Unknown'),
  primaryColor: z.string().default('#3b82f6'),
  secondaryColor: z.string().default('#1e40af'),
  accentColor: z.string().default('#60a5fa'),
  backgroundColor: z.string().default('#ffffff'),
  textColor: z.string().default('#1f2937'),
  fontFamily: z.string().default('Inter, system-ui, sans-serif'),
  outputDir: z.string().default('src/themes')
})

type ThemeGeneratorOptions = z.infer<typeof ThemeGeneratorOptionsSchema>

// Theme template generator
export class ThemeGenerator {
  private options: ThemeGeneratorOptions

  constructor(options: Partial<ThemeGeneratorOptions>) {
    this.options = ThemeGeneratorOptionsSchema.parse(options)
  }

  // Generate theme configuration
  private generateThemeConfig(): Omit<ThemeConfig, 'id'> {
    return {
      name: this.options.name,
      description: this.options.description || `A ${this.options.category} theme with custom styling`,
      category: this.options.category,
      isPremium: this.options.isPremium,
      version: '1.0.0',
      author: this.options.author,
      previewImage: `/themes/${this.options.id}-preview.jpg`,
      colors: {
        primary: this.options.primaryColor,
        secondary: this.options.secondaryColor,
        accent: this.options.accentColor,
        background: this.options.backgroundColor,
        surface: this.lightenColor(this.options.backgroundColor, 0.02),
        text: {
          primary: this.options.textColor,
          secondary: this.adjustColorOpacity(this.options.textColor, 0.7),
          muted: this.adjustColorOpacity(this.options.textColor, 0.5)
        },
        border: this.lightenColor(this.options.textColor, 0.8),
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      typography: {
        fontFamily: {
          primary: this.options.fontFamily,
          secondary: this.options.fontFamily,
          mono: 'JetBrains Mono, monospace'
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem'
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem'
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
      compatibleTemplates: ['*'],
      requiredFeatures: [],
      customProperties: {
        gradients: {
          primary: `linear-gradient(135deg, ${this.options.primaryColor} 0%, ${this.options.secondaryColor} 100%)`,
          secondary: `linear-gradient(135deg, ${this.options.accentColor} 0%, ${this.options.primaryColor} 100%)`
        },
        animations: {
          duration: {
            fast: '150ms',
            normal: '300ms',
            slow: '500ms'
          },
          easing: {
            default: 'cubic-bezier(0.4, 0, 0.2, 1)',
            in: 'cubic-bezier(0.4, 0, 1, 1)',
            out: 'cubic-bezier(0, 0, 0.2, 1)'
          }
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  // Generate theme file content
  private generateThemeFile(): string {
    const config = this.generateThemeConfig()
    
    return `import { ThemeConfig } from '@/lib/theme-registry'

const theme: Omit<ThemeConfig, 'id'> = ${JSON.stringify(config, null, 2)}

export default theme
`
  }

  // Generate theme file
  async generateTheme(): Promise<{ success: boolean, filePath?: string, error?: string }> {
    try {
      const themeContent = this.generateThemeFile()
      const fileName = `${this.options.id}.theme.ts`
      const filePath = path.join(process.cwd(), this.options.outputDir, fileName)
      
      // Ensure output directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      
      // Write theme file
      await fs.writeFile(filePath, themeContent, 'utf-8')
      
      return {
        success: true,
        filePath
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Generate preview documentation
  async generatePreviewDocs(): Promise<{ success: boolean, filePath?: string, error?: string }> {
    try {
      const docsContent = this.generatePreviewDocsContent()
      const fileName = `${this.options.id}-preview.md`
      const filePath = path.join(process.cwd(), this.options.outputDir, 'docs', fileName)
      
      // Ensure output directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      
      // Write docs file
      await fs.writeFile(filePath, docsContent, 'utf-8')
      
      return {
        success: true,
        filePath
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Generate preview documentation content
  private generatePreviewDocsContent(): string {
    return `# ${this.options.name} Theme

## Overview
${this.options.description || `A ${this.options.category} theme with custom styling`}

## Details
- **Category**: ${this.options.category}
- **Premium**: ${this.options.isPremium ? 'Yes' : 'No'}
- **Author**: ${this.options.author}
- **Version**: 1.0.0

## Color Palette
- **Primary**: ${this.options.primaryColor}
- **Secondary**: ${this.options.secondaryColor}
- **Accent**: ${this.options.accentColor}
- **Background**: ${this.options.backgroundColor}
- **Text**: ${this.options.textColor}

## Typography
- **Font Family**: ${this.options.fontFamily}

## Usage
\`\`\`typescript
import { getThemeById } from '@/themes'

const theme = getThemeById('${this.options.id}')
\`\`\`

## Compatibility
This theme is compatible with all templates by default.

## Customization
You can customize this theme by modifying the theme configuration file:
\`src/themes/${this.options.id}.theme.ts\`
`
  }

  // Utility functions
  private lightenColor(color: string, amount: number): string {
    // Simple color lightening - in a real implementation, you'd use a proper color library
    if (color.startsWith('#')) {
      const num = parseInt(color.slice(1), 16)
      const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * amount))
      const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * amount))
      const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * amount))
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
    }
    return color
  }

  private adjustColorOpacity(color: string, opacity: number): string {
    if (color.startsWith('#')) {
      const num = parseInt(color.slice(1), 16)
      const r = num >> 16
      const g = (num >> 8) & 0x00FF
      const b = num & 0x0000FF
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
    return color
  }
}

// CLI command function
export async function generateTheme(options: Partial<ThemeGeneratorOptions>): Promise<void> {
  const generator = new ThemeGenerator(options)
  
  console.log(`🎨 Generating theme: ${options.name}...`)
  
  const themeResult = await generator.generateTheme()
  if (!themeResult.success) {
    console.error(`❌ Failed to generate theme: ${themeResult.error}`)
    return
  }
  
  console.log(`✅ Theme generated: ${themeResult.filePath}`)
  
  const docsResult = await generator.generatePreviewDocs()
  if (docsResult.success) {
    console.log(`📝 Documentation generated: ${docsResult.filePath}`)
  }
  
  console.log(`\n🚀 Theme '${options.name}' has been generated successfully!`)
  console.log(`\nNext steps:`)
  console.log(`1. Review the generated theme file`)
  console.log(`2. Add the theme to your theme registry`)
  console.log(`3. Test the theme with different templates`)
  console.log(`4. Create a preview image for the theme`)
}

export type { ThemeGeneratorOptions }