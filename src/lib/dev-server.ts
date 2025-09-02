import { watch } from 'chokidar'
import { EventEmitter } from 'events'
import path from 'path'
import { ThemeRegistry } from './theme-registry'
import { TemplateRegistry } from './template-registry'
import { CompatibilityMatrix } from './compatibility-matrix'

// Development server events
export interface DevServerEvents {
  'theme:changed': (themeId: string) => void
  'template:changed': (templateId: string) => void
  'theme:added': (themeId: string) => void
  'template:added': (templateId: string) => void
  'theme:removed': (themeId: string) => void
  'template:removed': (templateId: string) => void
  'compatibility:updated': () => void
  'registry:reloaded': () => void
  'error': (error: Error) => void
}

// Development server configuration
export interface DevServerConfig {
  themesDir: string
  templatesDir: string
  watchPatterns: string[]
  debounceMs: number
  enableHotReload: boolean
  enableCompatibilityCheck: boolean
  logLevel: 'silent' | 'error' | 'warn' | 'info' | 'debug'
}

// Default configuration
const DEFAULT_CONFIG: DevServerConfig = {
  themesDir: 'src/themes',
  templatesDir: 'src/components/catalog-templates',
  watchPatterns: [
    '**/*.theme.ts',
    '**/*.theme.js',
    '**/template.config.ts',
    '**/template.config.js',
    '**/*.tsx',
    '**/*.ts'
  ],
  debounceMs: 300,
  enableHotReload: true,
  enableCompatibilityCheck: true,
  logLevel: 'info'
}

// Development server class
export class DevServer extends EventEmitter {
  private config: DevServerConfig
  private themeRegistry: ThemeRegistry
  private templateRegistry: TemplateRegistry
  private compatibilityMatrix: CompatibilityMatrix
  private watchers: any[] = []
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()
  private isRunning = false

  constructor(config: Partial<DevServerConfig> = {}) {
    super()
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.themeRegistry = ThemeRegistry.getInstance()
    this.templateRegistry = TemplateRegistry.getInstance()
    this.compatibilityMatrix = new CompatibilityMatrix()
  }

  // Start the development server
  async start(): Promise<void> {
    if (this.isRunning) {
      this.log('warn', 'Development server is already running')
      return
    }

    try {
      this.log('info', 'Starting Catfy development server...')
      
      // Load initial registries
      await this.loadRegistries()
      
      // Setup file watchers
      if (this.config.enableHotReload) {
        this.setupWatchers()
      }
      
      // Setup compatibility checking
      if (this.config.enableCompatibilityCheck) {
        this.setupCompatibilityChecking()
      }
      
      this.isRunning = true
      this.log('info', '✅ Development server started successfully')
      this.log('info', `🔍 Watching: ${this.config.watchPatterns.join(', ')}`)
      this.log('info', `🎨 Themes directory: ${this.config.themesDir}`)
      this.log('info', `📄 Templates directory: ${this.config.templatesDir}`)
      
    } catch (error) {
      this.log('error', `Failed to start development server: ${error}`)
      this.emit('error', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  // Stop the development server
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return
    }

    this.log('info', 'Stopping development server...')
    
    // Close all watchers
    await Promise.all(this.watchers.map(watcher => watcher.close()))
    this.watchers = []
    
    // Clear debounce timers
    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.clear()
    
    this.isRunning = false
    this.log('info', '✅ Development server stopped')
  }

  // Load registries
  private async loadRegistries(): Promise<void> {
    try {
      // Themes and templates are now registered statically, no loading needed
      
      this.log('info', `📦 Loaded ${this.themeRegistry.getAllThemes().length} themes`)
      this.log('info', `📋 Loaded ${this.templateRegistry.getAllTemplates().length} templates`)
      
      this.emit('registry:reloaded')
    } catch (error) {
      this.log('error', `Failed to load registries: ${error}`)
      throw error
    }
  }

  // Setup file watchers
  private setupWatchers(): void {
    const watchPaths = [
      path.join(process.cwd(), this.config.themesDir),
      path.join(process.cwd(), this.config.templatesDir)
    ]

    watchPaths.forEach(watchPath => {
      const watcher = watch(watchPath, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true
      })

      watcher
        .on('add', (filePath) => this.handleFileChange('add', filePath))
        .on('change', (filePath) => this.handleFileChange('change', filePath))
        .on('unlink', (filePath) => this.handleFileChange('unlink', filePath))
        .on('error', (error) => {
          this.log('error', `Watcher error: ${error}`)
          this.emit('error', error)
        })

      this.watchers.push(watcher)
    })

    this.log('info', '👀 File watchers setup complete')
  }

  // Handle file changes with debouncing
  private handleFileChange(event: 'add' | 'change' | 'unlink', filePath: string): void {
    const relativePath = path.relative(process.cwd(), filePath)
    
    // Check if file matches watch patterns
    const shouldWatch = this.config.watchPatterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
      return regex.test(relativePath)
    })

    if (!shouldWatch) {
      return
    }

    // Debounce file changes
    const debounceKey = `${event}:${filePath}`
    const existingTimer = this.debounceTimers.get(debounceKey)
    
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(() => {
      this.processFileChange(event, filePath, relativePath)
      this.debounceTimers.delete(debounceKey)
    }, this.config.debounceMs)

    this.debounceTimers.set(debounceKey, timer)
  }

  // Process file changes
  private async processFileChange(event: 'add' | 'change' | 'unlink', filePath: string, relativePath: string): Promise<void> {
    try {
      this.log('debug', `File ${event}: ${relativePath}`)

      // Determine if it's a theme or template file
      const isThemeFile = relativePath.includes(this.config.themesDir) || filePath.includes('.theme.')
      const isTemplateFile = relativePath.includes(this.config.templatesDir) || filePath.includes('template.config.')

      if (isThemeFile) {
        await this.handleThemeChange(event, filePath, relativePath)
      } else if (isTemplateFile) {
        await this.handleTemplateChange(event, filePath, relativePath)
      }

      // Reload registries and update compatibility
      await this.loadRegistries()
      
      if (this.config.enableCompatibilityCheck) {
        this.updateCompatibilityMatrix()
      }

    } catch (error) {
      this.log('error', `Error processing file change: ${error}`)
      this.emit('error', error instanceof Error ? error : new Error(String(error)))
    }
  }

  // Handle theme file changes
  private async handleThemeChange(event: 'add' | 'change' | 'unlink', filePath: string, relativePath: string): Promise<void> {
    const themeId = this.extractThemeId(filePath)
    
    if (!themeId) {
      this.log('warn', `Could not extract theme ID from: ${relativePath}`)
      return
    }

    switch (event) {
      case 'add':
        this.log('info', `🎨 New theme detected: ${themeId}`)
        this.emit('theme:added', themeId)
        break
      case 'change':
        this.log('info', `🎨 Theme updated: ${themeId}`)
        this.emit('theme:changed', themeId)
        break
      case 'unlink':
        this.log('info', `🎨 Theme removed: ${themeId}`)
        this.emit('theme:removed', themeId)
        break
    }
  }

  // Handle template file changes
  private async handleTemplateChange(event: 'add' | 'change' | 'unlink', filePath: string, relativePath: string): Promise<void> {
    const templateId = this.extractTemplateId(filePath)
    
    if (!templateId) {
      this.log('warn', `Could not extract template ID from: ${relativePath}`)
      return
    }

    switch (event) {
      case 'add':
        this.log('info', `📄 New template detected: ${templateId}`)
        this.emit('template:added', templateId)
        break
      case 'change':
        this.log('info', `📄 Template updated: ${templateId}`)
        this.emit('template:changed', templateId)
        break
      case 'unlink':
        this.log('info', `📄 Template removed: ${templateId}`)
        this.emit('template:removed', templateId)
        break
    }
  }

  // Setup compatibility checking
  private setupCompatibilityChecking(): void {
    this.on('theme:changed', () => this.updateCompatibilityMatrix())
    this.on('template:changed', () => this.updateCompatibilityMatrix())
    this.on('theme:added', () => this.updateCompatibilityMatrix())
    this.on('template:added', () => this.updateCompatibilityMatrix())
    this.on('theme:removed', () => this.updateCompatibilityMatrix())
    this.on('template:removed', () => this.updateCompatibilityMatrix())
  }

  // Update compatibility matrix
  private updateCompatibilityMatrix(): void {
    try {
      // Rebuild compatibility matrix
      this.compatibilityMatrix = new CompatibilityMatrix()
      
      const themes = this.themeRegistry.getAllThemes()
      const templates = this.templateRegistry.getAllTemplates()
      
      // Add compatibility rules based on theme and template configurations
      themes.forEach(theme => {
        templates.forEach(template => {
          if (this.isThemeTemplateCompatible(theme.id, template.id)) {
            this.compatibilityMatrix.addRule({
              themeId: theme.id,
              templateId: template.id,
              compatible: true
            })
          }
        })
      })
      
      this.emit('compatibility:updated')
      this.log('debug', '🔗 Compatibility matrix updated')
      
    } catch (error) {
      this.log('error', `Failed to update compatibility matrix: ${error}`)
    }
  }

  // Check if theme and template are compatible
  private isThemeTemplateCompatible(themeId: string, templateId: string): boolean {
    const theme = this.themeRegistry.getTheme(themeId)
    const template = this.templateRegistry.getTemplate(templateId)
    
    if (!theme || !template) {
      return false
    }
    
    // Check if template supports all themes or specifically supports this theme
    if (template.compatibleThemes.includes('*') || template.compatibleThemes.includes(themeId)) {
      return true
    }
    
    // Check if theme supports all templates or specifically supports this template
    if (theme.compatibleTemplates.includes('*') || theme.compatibleTemplates.includes(templateId)) {
      return true
    }
    
    return false
  }

  // Extract theme ID from file path
  private extractThemeId(filePath: string): string | null {
    const fileName = path.basename(filePath)
    
    // For .theme.ts files
    if (fileName.endsWith('.theme.ts') || fileName.endsWith('.theme.js')) {
      return fileName.replace(/\.(theme\.(ts|js))$/, '')
    }
    
    // For theme directories
    const parts = filePath.split(path.sep)
    const themesDirIndex = parts.findIndex(part => part === 'themes')
    if (themesDirIndex !== -1 && parts[themesDirIndex + 1]) {
      return parts[themesDirIndex + 1]
    }
    
    return null
  }

  // Extract template ID from file path
  private extractTemplateId(filePath: string): string | null {
    const parts = filePath.split(path.sep)
    const templatesIndex = parts.findIndex(part => part === 'catalog-templates')
    
    if (templatesIndex !== -1 && parts[templatesIndex + 1]) {
      return parts[templatesIndex + 1]
    }
    
    return null
  }

  // Logging utility
  private log(level: DevServerConfig['logLevel'], message: string): void {
    const levels = ['silent', 'error', 'warn', 'info', 'debug']
    const currentLevelIndex = levels.indexOf(this.config.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    
    if (messageLevelIndex <= currentLevelIndex) {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
      const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'info' ? 'ℹ️' : '🐛'
      console.log(`[${timestamp}] ${prefix} ${message}`)
    }
  }

  // Get current server status
  getStatus(): {
    isRunning: boolean
    themesCount: number
    templatesCount: number
    watchersCount: number
    config: DevServerConfig
  } {
    return {
      isRunning: this.isRunning,
      themesCount: this.themeRegistry.getAllThemes().length,
      templatesCount: this.templateRegistry.getAllTemplates().length,
      watchersCount: this.watchers.length,
      config: this.config
    }
  }

  // Get compatibility matrix
  getCompatibilityMatrix(): CompatibilityMatrix {
    return this.compatibilityMatrix
  }

  // Get registries
  getRegistries(): {
    themeRegistry: ThemeRegistry
    templateRegistry: TemplateRegistry
  } {
    return {
      themeRegistry: this.themeRegistry,
      templateRegistry: this.templateRegistry
    }
  }
}

// Singleton instance for global access
let devServerInstance: DevServer | null = null

// Get or create dev server instance
export function getDevServer(config?: Partial<DevServerConfig>): DevServer {
  if (!devServerInstance) {
    devServerInstance = new DevServer(config)
  }
  return devServerInstance
}

// Start development server
export async function startDevServer(config?: Partial<DevServerConfig>): Promise<DevServer> {
  const server = getDevServer(config)
  await server.start()
  return server
}

// Stop development server
export async function stopDevServer(): Promise<void> {
  if (devServerInstance) {
    await devServerInstance.stop()
    devServerInstance = null
  }
}