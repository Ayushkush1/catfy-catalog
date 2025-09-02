#!/usr/bin/env node

import { Command } from 'commander'
import { generateTheme, type ThemeGeneratorOptions } from './generators/theme-generator'
import { generateTemplate, type TemplateGeneratorOptions } from './generators/template-generator'
import { z } from 'zod'

const program = new Command()

// CLI version and description
program
  .name('catfy-cli')
  .description('CLI tools for Catfy theme and template development')
  .version('1.0.0')

// Theme generation command
program
  .command('generate:theme')
  .description('Generate a new theme')
  .requiredOption('-n, --name <name>', 'Theme name')
  .requiredOption('-i, --id <id>', 'Theme ID (kebab-case)')
  .option('-d, --description <description>', 'Theme description')
  .option('-c, --category <category>', 'Theme category', 'modern')
  .option('-a, --author <author>', 'Theme author', 'Unknown')
  .option('-p, --primary <color>', 'Primary color', '#3b82f6')
  .option('-s, --secondary <color>', 'Secondary color', '#64748b')
  .option('--accent <color>', 'Accent color', '#f59e0b')
  .option('-o, --output-dir <dir>', 'Output directory', 'src/themes')
  .action(async (options) => {
    try {
      const themeOptions: Partial<ThemeGeneratorOptions> = {
        name: options.name,
        id: options.id,
        description: options.description,
        category: options.category as any,
        author: options.author,
        primaryColor: options.primary,
        secondaryColor: options.secondary,
        accentColor: options.accent,
        outputDir: options.outputDir
      }
      
      await generateTheme(themeOptions)
    } catch (error) {
      console.error('❌ Error generating theme:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

// Template generation command
program
  .command('generate:template')
  .description('Generate a new template')
  .requiredOption('-n, --name <name>', 'Template name')
  .requiredOption('-i, --id <id>', 'Template ID (kebab-case)')
  .option('-d, --description <description>', 'Template description')
  .option('-c, --category <category>', 'Template category', 'modern')
  .option('-a, --author <author>', 'Template author', 'Unknown')
  .option('-p, --pages <number>', 'Number of pages', '4')
  .option('--premium', 'Mark as premium template', false)
  .option('-f, --features <features>', 'Comma-separated list of features')
  .option('-o, --output-dir <dir>', 'Output directory', 'src/components/catalog-templates')
  .action(async (options) => {
    try {
      const features = options.features ? options.features.split(',').map((f: string) => f.trim()) : []
      
      const templateOptions: Partial<TemplateGeneratorOptions> = {
        name: options.name,
        id: options.id,
        description: options.description,
        category: options.category as any,
        author: options.author,
        pageCount: parseInt(options.pages),
        isPremium: options.premium,
        features,
        outputDir: options.outputDir
      }
      
      await generateTemplate(templateOptions)
    } catch (error) {
      console.error('❌ Error generating template:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

// List themes command
program
  .command('list:themes')
  .description('List all available themes')
  .action(async () => {
    try {
      const { ThemeRegistry } = await import('../lib/theme-registry')
      const registry = ThemeRegistry.getInstance()
      // Themes are now registered statically
      
      const themes = registry.getAllThemes()
      
      console.log('🎨 Available Themes:')
      console.log('===================')
      
      if (themes.length === 0) {
        console.log('No themes found.')
        return
      }
      
      themes.forEach(theme => {
        console.log(`\n📦 ${theme.name} (${theme.id})`)
        console.log(`   Description: ${theme.description}`)
        console.log(`   Category: ${theme.category}`)
        console.log(`   Author: ${theme.author}`)
        console.log(`   Version: ${theme.version}`)
        console.log(`   Colors: Primary(${theme.colors.primary}), Secondary(${theme.colors.secondary}), Accent(${theme.colors.accent})`)
      })
    } catch (error) {
      console.error('❌ Error listing themes:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

// List templates command
program
  .command('list:templates')
  .description('List all available templates')
  .action(async () => {
    try {
      const { TemplateRegistry } = await import('../lib/template-registry')
      const registry = TemplateRegistry.getInstance()
      // Templates are now registered statically, no loading needed
      
      const templates = registry.getAllTemplates()
      
      console.log('📄 Available Templates:')
      console.log('=======================')
      
      if (templates.length === 0) {
        console.log('No templates found.')
        return
      }
      
      templates.forEach(template => {
        console.log(`\n📋 ${template.name} (${template.id})`)
        console.log(`   Description: ${template.description}`)
        console.log(`   Category: ${template.category}`)
        console.log(`   Author: ${template.author}`)
        console.log(`   Version: ${template.version}`)
        console.log(`   Pages: ${template.pageCount}`)
        console.log(`   Premium: ${template.isPremium ? 'Yes' : 'No'}`)
        console.log(`   Features: ${template.features.join(', ')}`)
      })
    } catch (error) {
      console.error('❌ Error listing templates:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

// Validate compatibility command
program
  .command('validate:compatibility')
  .description('Validate theme-template compatibility')
  .option('-t, --theme <themeId>', 'Theme ID to check')
  .option('--template <templateId>', 'Template ID to check')
  .action(async (options) => {
    try {
      const { CompatibilityMatrix } = await import('../lib/compatibility-matrix')
      const { ThemeRegistry } = await import('../lib/theme-registry')
      const { TemplateRegistry } = await import('../lib/template-registry')
      
      const themeRegistry = ThemeRegistry.getInstance()
      const templateRegistry = TemplateRegistry.getInstance()
      const matrix = new CompatibilityMatrix()
      
      // Themes are now registered statically, no loading needed
      // Templates are now registered statically, no loading needed
      
      if (options.theme && options.template) {
        // Check specific combination
        const result = matrix.testCompatibility(options.template, options.theme)
        console.log(`🔍 Compatibility Check: ${options.theme} + ${options.template}`)
        console.log(`Result: ${result.compatible ? '✅ Compatible' : '❌ Not Compatible'}`)
        console.log(`Score: ${result.score}/100`)
        if (result.issues.length > 0) {
          console.log(`Issues: ${result.issues.join(', ')}`)
        }
      } else if (options.theme) {
        // Show compatible templates for theme
        const compatibleTemplates = matrix.getCompatibleTemplates(options.theme)
        console.log(`🎨 Compatible templates for theme '${options.theme}':`)
        compatibleTemplates.forEach(templateId => {
          const template = templateRegistry.getTemplate(templateId)
          console.log(`   ✅ ${template?.name || templateId} (${templateId})`)
        })
      } else if (options.template) {
        // Show compatible themes for template
        const compatibleThemes = matrix.getCompatibleThemes(options.template)
        console.log(`📄 Compatible themes for template '${options.template}':`)
        compatibleThemes.forEach(themeId => {
          const theme = themeRegistry.getTheme(themeId)
          console.log(`   ✅ ${theme?.name || themeId} (${themeId})`)
        })
      } else {
        // Show full compatibility matrix
        const fullMatrix = matrix.getFullMatrix()
        console.log('🔗 Full Compatibility Matrix:')
        console.log('=============================')
        
        Object.entries(fullMatrix).forEach(([templateId, themes]) => {
          const template = templateRegistry.getTemplate(templateId)
          console.log(`\n📄 ${template?.name || templateId} (${templateId}):`)
          Object.entries(themes).forEach(([themeId, result]) => {
            if (result.compatible) {
              const theme = themeRegistry.getTheme(themeId)
              console.log(`   ✅ ${theme?.name || themeId} (${themeId}) - Score: ${result.score}`)
            }
          })
        })
      }
    } catch (error) {
      console.error('❌ Error validating compatibility:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

// Development server command
program
  .command('dev')
  .description('Start development server with hot-reload')
  .option('-p, --port <port>', 'Port number', '3000')
  .option('-h, --host <host>', 'Host address', 'localhost')
  .action(async (options) => {
    console.log('🚀 Starting Catfy development server...')
    console.log(`📍 Server will be available at http://${options.host}:${options.port}`)
    console.log('🔥 Hot-reload enabled for themes and templates')
    console.log('\n💡 Features:')
    console.log('   - Live theme editing')
    console.log('   - Template preview')
    console.log('   - Compatibility testing')
    console.log('   - Auto-refresh on changes')
    console.log('\n⚠️  Development server implementation coming soon!')
    console.log('   This will integrate with your Next.js dev server.')
  })

// Help command
program
  .command('help')
  .description('Show help information')
  .action(() => {
    console.log('🎨 Catfy CLI - Theme & Template Development Tools')
    console.log('===============================================')
    console.log('')
    console.log('📋 Available Commands:')
    console.log('')
    console.log('🎨 Theme Management:')
    console.log('   generate:theme     Generate a new theme')
    console.log('   list:themes        List all available themes')
    console.log('')
    console.log('📄 Template Management:')
    console.log('   generate:template  Generate a new template')
    console.log('   list:templates     List all available templates')
    console.log('')
    console.log('🔗 Compatibility:')
    console.log('   validate:compatibility  Check theme-template compatibility')
    console.log('')
    console.log('🚀 Development:')
    console.log('   dev               Start development server with hot-reload')
    console.log('')
    console.log('📖 Examples:')
    console.log('   catfy-cli generate:theme -n "Ocean Blue" -i ocean-blue')
    console.log('   catfy-cli generate:template -n "Modern Grid" -i modern-grid -p 6')
    console.log('   catfy-cli validate:compatibility -t ocean-blue --template modern-grid')
    console.log('   catfy-cli list:themes')
    console.log('   catfy-cli dev -p 3000')
    console.log('')
    console.log('For more information on a specific command, use:')
    console.log('   catfy-cli <command> --help')
  })

// Parse command line arguments
program.parse(process.argv)

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp()
}

export { program }
export type { ThemeGeneratorOptions, TemplateGeneratorOptions }