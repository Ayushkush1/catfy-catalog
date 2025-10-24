import { ThemeRegistry } from './theme-registry'
import { TemplateRegistry } from './template-registry'
import { z } from 'zod'

// Compatibility rule schema
const CompatibilityRuleSchema = z.object({
  templateId: z.string(),
  themeId: z.string(),
  compatible: z.boolean(),
  reason: z.string().optional(),
  requiredFeatures: z.array(z.string()).optional(),
  limitations: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
})

type CompatibilityRule = z.infer<typeof CompatibilityRuleSchema>

// Compatibility test result
interface CompatibilityResult {
  compatible: boolean
  score: number // 0-100 compatibility score
  issues: string[]
  warnings: string[]
  recommendations: string[]
  missingFeatures: string[]
}

// Compatibility matrix class
export class CompatibilityMatrix {
  private static instance: CompatibilityMatrix | null = null
  private rules: Map<string, CompatibilityRule> = new Map()
  private themeRegistry: ThemeRegistry
  private templateRegistry: TemplateRegistry

  public constructor() {
    this.themeRegistry = ThemeRegistry.getInstance()
    this.templateRegistry = TemplateRegistry.getInstance()
    this.initializeDefaultRules()
  }

  static getInstance(): CompatibilityMatrix {
    if (!CompatibilityMatrix.instance) {
      CompatibilityMatrix.instance = new CompatibilityMatrix()
    }
    return CompatibilityMatrix.instance
  }

  // Initialize default compatibility rules
  private initializeDefaultRules() {
    // Universal compatibility rules
    this.addRule({
      templateId: '*',
      themeId: '*',
      compatible: true,
      reason: 'Default universal compatibility',
    })

    // Specific compatibility rules can be added here
    // Example: Minimal themes work best with simple templates
    this.addRule({
      templateId: 'modern-4page',
      themeId: 'minimal-mono',
      compatible: true,
      reason: 'Minimal theme complements modern layout',
      recommendations: [
        'Consider reducing visual elements for better minimal aesthetic',
        'Focus on typography and whitespace',
      ],
    })
  }

  // Add a compatibility rule
  addRule(rule: CompatibilityRule): void {
    const key = `${rule.templateId}:${rule.themeId}`
    this.rules.set(key, rule)
  }

  // Remove a compatibility rule
  removeRule(templateId: string, themeId: string): void {
    const key = `${templateId}:${themeId}`
    this.rules.delete(key)
  }

  // Test compatibility between template and theme
  testCompatibility(templateId: string, themeId: string): CompatibilityResult {
    const template = this.templateRegistry.getTemplate(templateId)
    const theme = this.themeRegistry.getTheme(themeId)

    if (!template || !theme) {
      return {
        compatible: false,
        score: 0,
        issues: ['Template or theme not found'],
        warnings: [],
        recommendations: [],
        missingFeatures: [],
      }
    }

    const result: CompatibilityResult = {
      compatible: true,
      score: 100,
      issues: [],
      warnings: [],
      recommendations: [],
      missingFeatures: [],
    }

    // Check explicit rules first
    const specificRule = this.getRule(templateId, themeId)
    if (specificRule && !specificRule.compatible) {
      result.compatible = false
      result.score = 0
      result.issues.push(
        specificRule.reason || 'Explicitly marked as incompatible'
      )
      return result
    }

    // Check template's compatible themes
    if (
      !template.compatibleThemes.includes('*') &&
      !template.compatibleThemes.includes(themeId)
    ) {
      result.compatible = false
      result.score = 0
      result.issues.push("Theme not in template's compatible themes list")
      return result
    }

    // Check theme's compatible templates
    if (
      !theme.compatibleTemplates.includes('*') &&
      !theme.compatibleTemplates.includes(templateId)
    ) {
      result.compatible = false
      result.score = 0
      result.issues.push("Template not in theme's compatible templates list")
      return result
    }

    // Check required features
    const missingFeatures = template.requiredThemeFeatures.filter(
      feature => !theme.requiredFeatures.includes(feature)
    )

    if (missingFeatures.length > 0) {
      result.missingFeatures = missingFeatures
      result.score -= missingFeatures.length * 20
      result.warnings.push(
        `Missing theme features: ${missingFeatures.join(', ')}`
      )
    }

    // Category compatibility scoring
    if (template.category === theme.category) {
      result.score += 10
      result.recommendations.push(
        'Template and theme categories match perfectly'
      )
    } else {
      result.score -= 5
      result.warnings.push("Template and theme categories don't match")
    }

    // Premium compatibility
    if (template.isPremium && !theme.isPremium) {
      result.score -= 10
      result.warnings.push(
        'Premium template with free theme may have limited features'
      )
    }

    // Add specific rule recommendations
    if (specificRule?.recommendations) {
      result.recommendations.push(...specificRule.recommendations)
    }

    // Ensure score is within bounds
    result.score = Math.max(0, Math.min(100, result.score))

    // Mark as incompatible if score is too low
    if (result.score < 50) {
      result.compatible = false
    }

    return result
  }

  // Get compatibility rule
  private getRule(
    templateId: string,
    themeId: string
  ): CompatibilityRule | null {
    // Check for specific rule first
    const specificKey = `${templateId}:${themeId}`
    if (this.rules.has(specificKey)) {
      return this.rules.get(specificKey)!
    }

    // Check for wildcard rules
    const templateWildcard = `${templateId}:*`
    if (this.rules.has(templateWildcard)) {
      return this.rules.get(templateWildcard)!
    }

    const themeWildcard = `*:${themeId}`
    if (this.rules.has(themeWildcard)) {
      return this.rules.get(themeWildcard)!
    }

    // Check for universal rule
    const universalKey = '*:*'
    if (this.rules.has(universalKey)) {
      return this.rules.get(universalKey)!
    }

    return null
  }

  // Check if theme and template are compatible (simple boolean)
  isCompatible(themeId: string, templateId: string): boolean {
    return this.testCompatibility(templateId, themeId).compatible
  }

  // Get all compatible themes for a template
  getCompatibleThemes(templateId: string): string[] {
    const allThemes = this.themeRegistry.getAllThemes()
    return allThemes
      .filter(theme => this.testCompatibility(templateId, theme.id).compatible)
      .map(theme => theme.id)
  }

  // Get all compatible templates for a theme
  getCompatibleTemplates(themeId: string): string[] {
    const allTemplates = this.templateRegistry.getAllTemplates()
    return allTemplates
      .filter(
        template => this.testCompatibility(template.id, themeId).compatible
      )
      .map(template => template.id)
  }

  // Get compatibility matrix for all combinations
  getFullMatrix(): Record<string, Record<string, CompatibilityResult>> {
    const matrix: Record<string, Record<string, CompatibilityResult>> = {}
    const templates = this.templateRegistry.getAllTemplates()
    const themes = this.themeRegistry.getAllThemes()

    templates.forEach(template => {
      matrix[template.id] = {}
      themes.forEach(theme => {
        matrix[template.id][theme.id] = this.testCompatibility(
          template.id,
          theme.id
        )
      })
    })

    return matrix
  }

  // Get best theme recommendations for a template
  getBestThemes(
    templateId: string,
    limit: number = 5
  ): Array<{ themeId: string; score: number }> {
    const allThemes = this.themeRegistry.getAllThemes()
    const scored = allThemes
      .map(theme => ({
        themeId: theme.id,
        score: this.testCompatibility(templateId, theme.id).score,
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return scored
  }

  // Get best template recommendations for a theme
  getBestTemplates(
    themeId: string,
    limit: number = 5
  ): Array<{ templateId: string; score: number }> {
    const allTemplates = this.templateRegistry.getAllTemplates()
    const scored = allTemplates
      .map(template => ({
        templateId: template.id,
        score: this.testCompatibility(template.id, themeId).score,
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return scored
  }

  // Validate all rules
  validateRules(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const [key, rule] of Array.from(this.rules)) {
      try {
        CompatibilityRuleSchema.parse(rule)
      } catch (error) {
        errors.push(`Invalid rule ${key}: ${error}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

// Export convenience functions
export function testCompatibility(
  templateId: string,
  themeId: string
): CompatibilityResult {
  const matrix = CompatibilityMatrix.getInstance()
  return matrix.testCompatibility(templateId, themeId)
}

export function getCompatibleThemes(templateId: string): string[] {
  const matrix = CompatibilityMatrix.getInstance()
  return matrix.getCompatibleThemes(templateId)
}

export function getCompatibleTemplates(themeId: string): string[] {
  const matrix = CompatibilityMatrix.getInstance()
  return matrix.getCompatibleTemplates(themeId)
}

export function getBestThemeRecommendations(
  templateId: string,
  limit?: number
) {
  const matrix = CompatibilityMatrix.getInstance()
  return matrix.getBestThemes(templateId, limit)
}

export function getBestTemplateRecommendations(
  themeId: string,
  limit?: number
) {
  const matrix = CompatibilityMatrix.getInstance()
  return matrix.getBestTemplates(themeId, limit)
}

export type { CompatibilityResult, CompatibilityRule }
