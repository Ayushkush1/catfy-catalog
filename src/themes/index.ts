// Theme auto-discovery and registration
import { ThemeRegistry } from '@/lib/theme-registry'

// Import all theme configurations
import modernBlueTheme from './modern-blue.theme'
import classicWarmTheme from './classic-warm.theme'
import minimalMonoTheme from './minimal-mono.theme'

// Theme registry instance
let themeRegistry: ThemeRegistry | null = null

// Initialize theme registry with auto-discovery
export function initializeThemeRegistry(): ThemeRegistry {
  if (!themeRegistry) {
    themeRegistry = ThemeRegistry.getInstance()
    
    // Register all themes
    registerAllThemes()
  }
  
  return themeRegistry
}

// Register all available themes
function registerAllThemes() {
  if (!themeRegistry) return
  
  // Register themes with auto-generated IDs
  themeRegistry.registerTheme({
    id: 'modern-blue',
    ...modernBlueTheme
  })
  
  themeRegistry.registerTheme({
    id: 'classic-warm',
    ...classicWarmTheme
  })
  
  themeRegistry.registerTheme({
    id: 'minimal-mono',
    ...minimalMonoTheme
  })
}

// Convenience functions
export function getThemeRegistry(): ThemeRegistry {
  return initializeThemeRegistry()
}

export function getAllThemes() {
  const registry = getThemeRegistry()
  return registry.getAllThemes()
}

export function getThemeById(themeId: string) {
  const registry = getThemeRegistry()
  return registry.getTheme(themeId)
}

export function getThemesByCategory(category: 'modern' | 'classic' | 'minimal' | 'creative' | 'industry') {
  const registry = getThemeRegistry()
  return registry.getThemesByCategory(category)
}

export function getFreeThemes() {
  const registry = getThemeRegistry()
  return registry.getFreeThemes()
}

export function getPremiumThemes() {
  const registry = getThemeRegistry()
  return registry.getPremiumThemes()
}

export function validateThemeCompatibility(themeId: string, templateId: string): boolean {
  const registry = getThemeRegistry()
  const theme = registry.getTheme(themeId)
  
  if (!theme) return false
  
  // Check if theme is compatible with template
  return theme.compatibleTemplates.includes('*') || 
         theme.compatibleTemplates.includes(templateId)
}

// Auto-discovery function for dynamic theme loading
export async function discoverThemes(): Promise<void> {
  // This function can be extended to dynamically discover theme files
  // For now, it ensures all static themes are registered
  initializeThemeRegistry()
}

// Export theme configurations for direct access
export {
  modernBlueTheme,
  classicWarmTheme,
  minimalMonoTheme
}

// Export types
export type { ThemeConfig } from '@/lib/theme-registry'