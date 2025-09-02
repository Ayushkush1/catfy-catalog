import { z } from 'zod'
// Removed fs and path imports for client-side compatibility

// Theme configuration schema
export const ThemeConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['modern', 'classic', 'minimal', 'creative', 'industry']),
  isPremium: z.boolean().default(false),
  version: z.string().default('1.0.0'),
  author: z.string().optional(),
  previewImage: z.string().optional(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    surface: z.string().optional(),
    text: z.object({
      primary: z.string(),
      secondary: z.string(),
      muted: z.string()
    }).optional(),
    border: z.string().optional(),
    success: z.string().optional(),
    warning: z.string().optional(),
    error: z.string().optional()
  }),
  typography: z.object({
    fontFamily: z.object({
      primary: z.string(),
      secondary: z.string(),
      mono: z.string().optional()
    }),
    fontSize: z.record(z.string()),
    fontWeight: z.record(z.string()),
    lineHeight: z.record(z.string())
  }).optional(),
  spacing: z.record(z.string()).optional(),
  borderRadius: z.record(z.string()).optional(),
  shadows: z.record(z.string()).optional(),
  compatibleTemplates: z.array(z.string()).default(['*']), // '*' means compatible with all
  requiredFeatures: z.array(z.string()).default([]),
  customProperties: z.record(z.any()).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>

// Theme registry class
export class ThemeRegistry {
  private static instance: ThemeRegistry
  private themes: Map<string, ThemeConfig> = new Map()

  private constructor() {
    // Themes are now registered statically
    this.initializeDefaultThemes()
  }

  static getInstance(): ThemeRegistry {
    if (!ThemeRegistry.instance) {
      ThemeRegistry.instance = new ThemeRegistry()
    }
    return ThemeRegistry.instance
  }

  // Themes are now registered statically, no dynamic loading needed

  // Themes are loaded statically, no dynamic loading needed

  // Initialize default themes
  private initializeDefaultThemes() {
    const defaultThemes: any[] = [
      {
        name: 'Modern Blue',
        description: 'Clean and contemporary design with blue accents',
        category: 'modern',
        isPremium: false,
        colors: {
          primary: '#3B82F6',
          secondary: '#1E40AF',
          accent: '#60A5FA',
          background: '#F8FAFC',
          text: {
            primary: '#1F2937',
            secondary: '#4B5563',
            muted: '#6B7280'
          }
        },
        typography: {
           fontFamily: {
             primary: 'Inter',
             secondary: 'Inter'
           },
           fontSize: {},
           fontWeight: {},
           lineHeight: {}
         },
         version: '1.0.0'
      },
      {
        name: 'Classic Warm',
        description: 'Traditional design with warm, inviting colors',
        category: 'classic',
        isPremium: false,
        colors: {
          primary: '#F59E0B',
          secondary: '#D97706',
          accent: '#FCD34D',
          background: '#FFFBEB',
          text: {
            primary: '#1F2937',
            secondary: '#4B5563',
            muted: '#6B7280'
          }
        },
        typography: {
           fontFamily: {
             primary: 'Playfair Display',
             secondary: 'Source Sans Pro'
           },
           fontSize: {},
           fontWeight: {},
           lineHeight: {}
         },
         version: '1.0.0'
      },
      {
        name: 'Minimal White',
        description: 'Ultra-clean minimalist design focusing on content',
        category: 'minimal',
        isPremium: false,
        colors: {
          primary: '#000000',
          secondary: '#374151',
          accent: '#9CA3AF',
          background: '#FFFFFF',
          text: {
            primary: '#111827',
            secondary: '#4B5563',
            muted: '#6B7280'
          }
        },
        typography: {
           fontFamily: {
             primary: 'Inter',
             secondary: 'Inter'
           },
           fontSize: {},
           fontWeight: {},
           lineHeight: {}
         },
         version: '1.0.0'
      }
    ]

    defaultThemes.forEach((theme, index) => {
      const themeId = theme.name.toLowerCase().replace(/\s+/g, '-')
      // Parse with schema to add default values
      const validatedTheme = ThemeConfigSchema.parse({ ...theme, id: themeId })
      this.themes.set(themeId, validatedTheme)
      // Theme files are now managed manually
    })
  }

  // Theme files are now managed manually

  // Public methods
  getAllThemes(): ThemeConfig[] {
    return Array.from(this.themes.values())
  }

  getTheme(id: string): ThemeConfig | undefined {
    return this.themes.get(id)
  }

  getThemesByCategory(category: ThemeConfig['category']): ThemeConfig[] {
    return this.getAllThemes().filter(theme => theme.category === category)
  }

  getFreeThemes(): ThemeConfig[] {
    return this.getAllThemes().filter(theme => !theme.isPremium)
  }

  getPremiumThemes(): ThemeConfig[] {
    return this.getAllThemes().filter(theme => theme.isPremium)
  }

  getCompatibleThemes(templateId: string): ThemeConfig[] {
    return this.getAllThemes().filter(theme => 
      theme.compatibleTemplates.includes('*') || 
      theme.compatibleTemplates.includes(templateId)
    )
  }

  registerTheme(theme: ThemeConfig): void {
    const validatedTheme = ThemeConfigSchema.parse(theme)
    this.themes.set(theme.id, validatedTheme)
    // Theme files are now managed manually
  }

  unregisterTheme(id: string): boolean {
    return this.themes.delete(id)
  }

  reloadThemes(): void {
    this.themes.clear()
    this.initializeDefaultThemes()
  }

  validateTheme(theme: unknown): { valid: boolean; errors?: string[] } {
    try {
      ThemeConfigSchema.parse(theme)
      return { valid: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        }
      }
      return { valid: false, errors: ['Unknown validation error'] }
    }
  }
}

// Export singleton instance
export const themeRegistry = ThemeRegistry.getInstance()

// Helper functions
export function getThemeColors(themeId: string) {
  const theme = themeRegistry.getTheme(themeId)
  if (!theme) {
    // Fallback to default modern theme colors
    return {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#60A5FA',
      background: '#F8FAFC',
      text: '#1F2937',
      muted: '#6B7280'
    }
  }
  return theme.colors
}

export function getThemeFonts(themeId: string) {
  const theme = themeRegistry.getTheme(themeId)
  return theme?.typography?.fontFamily || {
    primary: 'Inter',
    secondary: 'Inter'
  }
}

export function isThemeCompatible(themeId: string, templateId: string): boolean {
  const theme = themeRegistry.getTheme(themeId)
  if (!theme) return false
  
  return theme.compatibleTemplates.includes('*') || 
         theme.compatibleTemplates.includes(templateId)
}

export function getAllThemes(): ThemeConfig[] {
  return themeRegistry.getAllThemes()
}

export function getThemeById(themeId: string): ThemeConfig | undefined {
  return themeRegistry.getTheme(themeId)
}