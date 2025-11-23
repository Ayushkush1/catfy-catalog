'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// import { formatDistanceToNow } from 'date-fns'
import { Header } from '@/components/Header'
import { TeamManagement } from '@/components/TeamManagement'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCatalogueRealtime } from '@/hooks/useCatalogueRealtime'
import { useCataloguePresence } from '@/hooks/useCataloguePresence'
import { VersionConflictDialog } from '@/components/editor/VersionConflictDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileUpload } from '@/components/ui/file-upload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { smartSort } from '@/lib/sorting'
import { themeRegistry, getAllThemes } from '@/lib/theme-registry'
import { initializeThemeRegistry } from '@/themes'
import { TemplateThemeWorkflow } from '@/components/ui/template-theme-workflow'
import { getTemplateById } from '@/templates'
import { SubscriptionPlan } from '@prisma/client'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  Crown,
  Edit,
  Eye,
  EyeOff,
  FolderOpen,
  Gauge,
  Gem,
  LayoutDashboard,
  Loader2,
  Monitor,
  MoreVertical,
  Package,
  Palette,
  Plus,
  Save,
  Settings,
  Sparkles,
  Trash2,
  Users,
  X,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Catalogue {
  introImage: any
  id: string
  name: string
  description: string | null
  quote?: string
  tagline?: string
  isPublic: boolean
  slug?: string
  theme: string
  template?: string
  createdAt: string
  updatedAt: string
  categories: Category[]
  products: Product[]
  settings?: {
    companyInfo?: {
      companyName?: string
      companyDescription?: string
    }
    contactDetails?: {
      email?: string
      phone?: string
      website?: string
    }
    socialMedia?: {
      facebook?: string
      instagram?: string
      twitter?: string
      linkedin?: string
    }
    mediaAssets?: {
      logoUrl?: string
      coverImageUrl?: string
    }
    displaySettings?: {
      showPrices?: boolean
      showCategories?: boolean
      allowSearch?: boolean
      showProductCodes?: boolean
    }
    editorData?: string
    [key: string]: any // Allow additional properties to match Prisma Json type
  }
}

interface Category {
  id: string
  name: string
  description: string
  color?: string
  _count: {
    products: number
  }
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  priceDisplay: 'show' | 'hide' | 'contact'
  imageUrl?: string
  categoryId: string
  isActive: boolean
  tags?: string[]
}

export default function EditCataloguePage() {
  const router = useRouter()
  const params = useParams()
  const catalogueId = (params?.id as string) || ''
  const { currentPlan } = useSubscription()
  const supabase = createClient()

  const [catalogue, setCatalogue] = useState<Catalogue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorTimeoutId, setErrorTimeoutId] = useState<NodeJS.Timeout | null>(
    null
  )
  const [activeTab, setActiveTab] = useState('overview')
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  })
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForms, setProductForms] = useState<
    Array<{
      id: string
      name: string
      description: string
      price: number
      priceDisplay: 'show' | 'hide' | 'contact'
      categoryId: string
      isActive: boolean
      imageUrl: string
      tags: string[]
    }>
  >([])
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [selectedThemeCategory, setSelectedThemeCategory] = useState('all')
  const [selectedTheme, setSelectedTheme] = useState('modern')
  const [products, setProducts] = useState<Product[]>([])
  const [smartSortEnabled, setSmartSortEnabled] = useState(false)
  const [isPlanSharingEnabled, setIsPlanSharingEnabled] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [currentUserHasPremiumAccess, setCurrentUserHasPremiumAccess] =
    useState(false)

  // New category creation state
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState<
    Record<number, boolean>
  >({})
  const [newCategoryForm, setNewCategoryForm] = useState<
    Record<number, { name: string; description: string }>
  >({})

  // Collaborative editing state
  const [catalogueVersion, setCatalogueVersion] = useState<number>(1)
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [conflictData, setConflictData] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<{
    userId: string
    fullName: string
    email: string
  } | null>(null)
  const [currentSection, setCurrentSection] = useState<string>('overview')

  // Memoize the real-time update handler
  const handleRealtimeUpdate = useCallback((update: any) => {
    console.log('Real-time update received:', update)
    // Optionally reload data when others make changes
  }, [])

  // Real-time updates hook
  useCatalogueRealtime({
    catalogueId,
    onUpdate: handleRealtimeUpdate,
    enabled: !!catalogueId,
  })

  // Presence tracking hook
  const { activeUsers, isTracking } = useCataloguePresence({
    catalogueId,
    currentUser: currentUser!,
    currentSection,
    enabled: !!currentUser && !!catalogueId,
  })

  // Theme data matching the themes page
  const THEMES = [
    {
      id: 'modern',
      name: 'Modern Blue',
      description: 'Clean and contemporary design with blue accents',
      category: 'modern' as const,
      isPremium: false,
      previewImage: '/themes/modern-preview.jpg',
      colors: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#60A5FA',
        background: '#F8FAFC',
      },
      features: [
        'Responsive grid layout',
        'Clean typography',
        'Blue color scheme',
      ],
    },
    {
      id: 'classic',
      name: 'Classic Warm',
      description: 'Traditional design with warm, inviting colors',
      category: 'classic' as const,
      isPremium: false,
      previewImage: '/themes/classic-preview.jpg',
      colors: {
        primary: '#F59E0B',
        secondary: '#D97706',
        accent: '#FCD34D',
        background: '#FFFBEB',
      },
      features: [
        'Traditional layout',
        'Warm color palette',
        'Elegant typography',
      ],
    },
    {
      id: 'minimal',
      name: 'Minimal White',
      description: 'Ultra-clean minimalist design focusing on content',
      category: 'minimal' as const,
      isPremium: false,
      previewImage: '/themes/minimal-preview.jpg',
      colors: {
        primary: '#374151',
        secondary: '#111827',
        accent: '#6B7280',
        background: '#FFFFFF',
      },
      features: ['Minimalist design', 'Maximum whitespace', 'Content-focused'],
    },
    {
      id: 'bold',
      name: 'Bold Purple',
      description: 'Eye-catching design with vibrant purple gradients',
      category: 'bold' as const,
      isPremium: true,
      previewImage: '/themes/bold-preview.jpg',
      colors: {
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        accent: '#A78BFA',
        background: '#FAF5FF',
      },
      features: [
        'Gradient backgrounds',
        'Bold typography',
        'Purple color scheme',
        'Premium animations',
      ],
    },
    {
      id: 'elegant',
      name: 'Elegant Gray',
      description: 'Sophisticated design with elegant gray tones',
      category: 'elegant' as const,
      isPremium: true,
      previewImage: '/themes/elegant-preview.jpg',
      colors: {
        primary: '#64748B',
        secondary: '#475569',
        accent: '#94A3B8',
        background: '#F8FAFC',
      },
      features: [
        'Sophisticated layout',
        'Premium typography',
        'Elegant spacing',
        'Advanced animations',
      ],
    },
    {
      id: 'tech',
      name: 'Tech Cyan',
      description: 'Futuristic design perfect for tech products',
      category: 'tech' as const,
      isPremium: true,
      previewImage: '/themes/tech-preview.jpg',
      colors: {
        primary: '#06B6D4',
        secondary: '#0891B2',
        accent: '#67E8F9',
        background: '#ECFEFF',
      },
      features: [
        'Futuristic design',
        'Tech-inspired elements',
        'Cyan accents',
        'Interactive components',
      ],
    },
  ]

  const THEME_ICONS = {
    modern: Monitor,
    classic: Palette,
    minimal: Sparkles,
    bold: Zap,
    elegant: Crown,
    tech: Gem,
  }

  // Filter themes based on selected category
  const filteredThemesForCategory = THEMES.filter(theme => {
    if (selectedThemeCategory === 'all') return true
    if (selectedThemeCategory === 'free') return !theme.isPremium
    if (selectedThemeCategory === 'premium') return theme.isPremium
    return theme.category === selectedThemeCategory
  })

  // Get available templates and themes
  const allThemes = getAllThemes()

  // Handle template selection (now handled by TemplateThemeWorkflow)
  const handleTemplateSelect = async (templateId: string) => {
    try {
      console.log('🔍 Template Selection Debug:', {
        templateId,
        timestamp: new Date().toISOString(),
      })

      // Get the template data
      const template = getTemplateById(templateId)

      console.log('📋 Template Retrieved:', {
        templateExists: !!template,
        templateId: template?.id,
        templateName: template?.name,
        hasCustomProperties: !!template?.customProperties,
        isHtmlTemplate: !!template?.customProperties?.isHtmlTemplate,
        hasEditorData: !!template?.customProperties?.editorData,
        customPropertiesKeys: template?.customProperties
          ? Object.keys(template.customProperties)
          : [],
        templateKeys: template ? Object.keys(template) : [],
      })

      if (!template) {
        toast.error('Template not found')
        return
      }

      // Check if this is an HTML template (from iframe-templates)
      const isHtmlTemplate = template.customProperties?.isHtmlTemplate

      if (isHtmlTemplate) {
        // Handle HTML templates - save template ID to settings for IframeEditor
        console.log(
          '✅ HTML template detected, saving template ID:',
          templateId
        )

        if (catalogue) {
          const existingSettings =
            typeof catalogue.settings === 'string'
              ? JSON.parse(catalogue.settings || '{}')
              : catalogue.settings || {}

          // 🔥 FIX: Remove old iframeEditor settings to avoid loading wrong template pages
          const { iframeEditor, ...restSettings } = existingSettings

          const updatedCatalogue = {
            ...catalogue,
            template: templateId,
            settings: {
              ...restSettings,
              // 🔥 CRITICAL: Create fresh iframeEditor settings for new template
              // Don't include old pages/styleMutations from previous template
              iframeEditor: {
                templateId: templateId,
                engine: template.customProperties?.engine || 'mustache',
                pageCount: template.customProperties?.pages?.length || 1,
                // Don't include: pages, styleMutations, liveData, etc.
              },
            },
          }

          // Save to database
          const response = await fetch(`/api/catalogues/${catalogue.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              template: templateId,
              settings: updatedCatalogue.settings,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error('Error updating catalogue:', errorData)
            toast.error('Failed to save template selection')
            return
          }

          // Update local state
          setCatalogue(updatedCatalogue)

          toast.success('Template changed successfully!')
        }
        return
      }

      // Handle CraftJS editor templates (legacy support)
      const isMultiPageTemplate =
        template.customProperties?.multiPageData &&
        Array.isArray(template.customProperties.multiPageData)

      console.log('📄 Multi-page Template Check:', {
        isMultiPageTemplate,
        hasMultiPageData: !!template.customProperties?.multiPageData,
        multiPageDataLength:
          template.customProperties?.multiPageData?.length || 0,
      })

      // Get template data - handle both single-page and multi-page templates
      let templateData: any
      let isMultiPage = false

      if (isMultiPageTemplate) {
        // This is a multi-page template - store the multi-page structure
        templateData = template.customProperties?.multiPageData
        isMultiPage = true
        console.log(
          '✅ Using multi-page template data with',
          templateData.length,
          'pages'
        )
      } else if (template.customProperties?.editorData) {
        // This is a single-page editor template
        templateData = template.customProperties.editorData
        console.log(
          '✅ Using single-page editor template data from customProperties.editorData'
        )
      } else {
        // For regular catalog templates, we'll use a default empty editor state
        templateData = {
          ROOT: {
            type: { resolvedName: 'Container' },
            isCanvas: true,
            props: {},
            displayName: 'Container',
            custom: {},
            hidden: false,
            nodes: [],
            linkedNodes: {},
          },
        }
        console.log('⚠️ Using default empty editor state - no editorData found')
      }

      console.log('📊 Template Data Structure:', {
        templateDataExists: !!templateData,
        templateDataType: typeof templateData,
        isMultiPage,
        isArray: Array.isArray(templateData),
        hasROOT: !isMultiPage && !!templateData?.ROOT,
        rootNodes: !isMultiPage
          ? templateData?.ROOT?.nodes || []
          : 'N/A (multi-page)',
        templateDataKeys: templateData ? Object.keys(templateData) : [],
        pageCount: isMultiPage ? templateData.length : 1,
      })

      console.log('Template data found, updating catalogue...')

      // Update the catalogue with the template data
      if (catalogue && templateData) {
        // Parse existing settings if they're stored as JSON string
        const existingSettings =
          typeof catalogue.settings === 'string'
            ? JSON.parse(catalogue.settings || '{}')
            : catalogue.settings || {}

        const updatedCatalogue = {
          ...catalogue,
          template: templateId,
          settings: {
            ...existingSettings,
            editorData: isMultiPage
              ? JSON.stringify(templateData)
              : JSON.stringify(templateData),
            isMultiPage: isMultiPage,
            pageCount: isMultiPage ? templateData.length : 1,
          },
        }

        // Save to database using API route
        const response = await fetch(`/api/catalogues/${catalogue.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            template: templateId,
            settings: updatedCatalogue.settings,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Error updating catalogue:', errorData)
          toast.error('Failed to load template')
          return
        }

        // Update local state
        setCatalogue(updatedCatalogue)

        toast.success('Template loaded successfully!')
      }
    } catch (error) {
      console.error('Error loading template:', error)
      toast.error('Failed to load template')
    }
  }

  // Handle theme selection
  const handleThemeSelect = async (themeId: string) => {
    const theme =
      allThemes.find(t => t.id === themeId) ||
      THEMES.find(t => t.id === themeId)
    if (!theme) return

    // For now, assume user can only use free themes
    if (theme.isPremium) {
      toast.error('This is a premium theme. Upgrade your plan to use it.')
      return
    }

    setSelectedTheme(themeId)

    // Update catalogue theme
    if (catalogue) {
      setCatalogue(prev => (prev ? { ...prev, theme: themeId } : null))

      // Save to localStorage for global theme application
      localStorage.setItem('selectedTheme', themeId)

      // Save to database
      try {
        const response = await fetch(`/api/catalogues/${catalogueId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ theme: themeId }),
        })

        if (!response.ok) {
          throw new Error('Failed to update theme')
        }

        // Track theme selection for analytics
        try {
          await fetch('/api/admin/theme-analytics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              themeId,
              themeName: theme.name,
              catalogueId,
            }),
          })
        } catch (analyticsError) {
          console.error('Failed to track theme selection:', analyticsError)
          // Don't show error to user as this is background tracking
        }

        toast.success('Theme updated successfully!')
      } catch (error) {
        console.error('Error updating theme:', error)
        toast.error('Failed to update theme')
      }
    }
  }

  // Combined handler for template and theme selection from workflow
  const handleTemplateThemeSelection = async (
    templateId: string,
    themeId: string
  ) => {
    try {
      // Get the template data
      const template = getTemplateById(templateId)

      if (!template) {
        toast.error('Template not found')
        return
      }

      // Get the theme data
      const theme =
        allThemes.find(t => t.id === themeId) ||
        THEMES.find(t => t.id === themeId)
      if (!theme) {
        toast.error('Theme not found')
        return
      }

      // Check if theme is premium
      if (theme.isPremium) {
        toast.error('This is a premium theme. Upgrade your plan to use it.')
        return
      }

      console.log('Template and theme found:', template.name, theme.name)

      // Get template data - check if it's in customProperties.editorData (for editor templates) or data field
      let templateData = null
      if (template.customProperties?.editorData) {
        // This is an editor template converted by convertEditorTemplateToConfig
        templateData = template.customProperties.editorData
      } else {
        // Use default empty editor state if no template data is available
        templateData = {}
      }

      if (!templateData) {
        toast.error('Template data not found')
        return
      }

      console.log('Template data found, updating catalogue...')

      // Update the catalogue with both template and theme data
      if (catalogue) {
        const updatedCatalogue = {
          ...catalogue,
          template: templateId,
          theme: themeId,
          settings: {
            ...(catalogue.settings || {}),
            editorData: JSON.stringify(templateData),
          },
        }

        // Save to database
        const { error } = await (supabase as any)
          .from('catalogues')
          .update({
            template: templateId,
            theme: themeId,
            settings: updatedCatalogue.settings,
          })
          .eq('id', catalogue.id)

        if (error) {
          console.error('Error updating catalogue:', error)
          toast.error('Failed to load template and theme')
          return
        }

        // Update local state
        setCatalogue(updatedCatalogue)
        setSelectedTheme(themeId)

        // Save theme to localStorage for global theme application
        localStorage.setItem('selectedTheme', themeId)

        // Track theme selection for analytics
        try {
          await fetch('/api/admin/theme-analytics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              themeId,
              themeName: theme.name,
              catalogueId,
            }),
          })
        } catch (analyticsError) {
          console.error('Failed to track theme selection:', analyticsError)
          // Don't show error to user as this is background tracking
        }

        toast.success('Template and theme loaded successfully!')

        // Redirect to preview page to see the loaded template with theme
        router.push(`/catalogue/${catalogue.id}/preview`)
      }
    } catch (error) {
      console.error('Error loading template and theme:', error)
      toast.error('Failed to load template and theme')
    }
  }

  // Initialize registries
  useEffect(() => {
    initializeThemeRegistry()
  }, [])

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
    }
    checkAuth()
  }, [supabase, router])

  useEffect(() => {
    fetchCatalogue()
  }, [catalogueId])

  // Load selected theme from localStorage and catalogue data
  useEffect(() => {
    if (catalogue) {
      // Set selected theme from catalogue data or localStorage
      const savedTheme = localStorage.getItem('selectedTheme')
      const themeToUse = catalogue.theme || savedTheme || 'modern'
      setSelectedTheme(themeToUse)

      // If catalogue doesn't have a theme but localStorage does, update catalogue
      if (!catalogue.theme && savedTheme) {
        setCatalogue(prev => (prev ? { ...prev, theme: savedTheme } : null))
      }
    }
  }, [catalogue])

  // Template selection is now handled by TemplateThemeWorkflow component

  // Auto-dismiss errors after 5 seconds
  useEffect(() => {
    if (error) {
      // Clear any existing timeout
      if (errorTimeoutId) {
        clearTimeout(errorTimeoutId)
      }

      // Set new timeout to clear error after 5 seconds
      const timeoutId = setTimeout(() => {
        setError(null)
        setErrorTimeoutId(null)
      }, 5000)

      setErrorTimeoutId(timeoutId)
    }

    // Cleanup timeout on unmount
    return () => {
      if (errorTimeoutId) {
        clearTimeout(errorTimeoutId)
      }
    }
  }, [error])

  // Helper function to set error with auto-dismiss
  const setErrorWithAutoDismiss = (errorMessage: string) => {
    setError(errorMessage)
  }

  const fetchCatalogue = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/catalogues/${catalogueId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch catalogue')
      }

      const data = await response.json()
      setCatalogue(data.catalogue)

      // Store version for optimistic locking
      setCatalogueVersion(data.catalogue.version || 1)

      // Check if current user is owner
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const userIsOwner = data.catalogue.profileId === user?.id
      setIsOwner(userIsOwner)

      // Set current user for presence tracking
      if (user && data.catalogue.profile) {
        setCurrentUser({
          userId: user.id,
          fullName:
            data.catalogue.profile.fullName ||
            data.catalogue.profile.email ||
            'User',
          email: data.catalogue.profile.email || user.email || '',
        })
      }

      // Check plan sharing status and user's premium access
      if (!userIsOwner) {
        try {
          const teamResponse = await fetch(
            `/api/catalogues/${catalogueId}/team`
          )
          if (teamResponse.ok) {
            const teamData = await teamResponse.json()
            const currentMember = teamData.team.find(
              (m: any) => m.id === user?.id
            )
            setCurrentUserHasPremiumAccess(
              currentMember?.hasPremiumAccess || false
            )
          }
        } catch (err) {
          console.log('Could not check team member status')
        }
      }

      // Check plan sharing status
      try {
        const planResponse = await fetch(
          `/api/catalogues/${catalogueId}/plan-sharing`
        )
        if (planResponse.ok) {
          const planData = await planResponse.json()
          setIsPlanSharingEnabled(planData.planSharingEnabled || false)
        }
      } catch (err) {
        // Plan sharing check failed, ignore
        console.log('Could not check plan sharing status')
      }
    } catch (error: any) {
      console.error('Error fetching catalogue:', error)
      setErrorWithAutoDismiss(error.message || 'Failed to load catalogue')
    } finally {
      setIsLoading(false)
    }
  }

  const saveCatalogue = async (forceUpdate = false) => {
    console.log('saveCatalogue called, catalogue state:', catalogue)

    if (!catalogue) {
      console.error('Catalogue is null or undefined')
      toast.error('Catalogue data not loaded. Please refresh the page.')
      return false
    }

    try {
      setIsSaving(true)

      const requestData = {
        name: catalogue.name,
        description: catalogue.description,
        quote: catalogue.quote,
        tagline: catalogue.tagline,
        introImage: catalogue.introImage,
        isPublic: catalogue.isPublic,
        slug: catalogue.slug,
        theme: catalogue.theme,
        settings: catalogue.settings,
        version: catalogueVersion, // Include version for conflict detection
        forceUpdate, // Allow overwriting if user chooses
      }

      console.log('Saving catalogue with data:', requestData)
      console.log('Settings being saved:', catalogue.settings)

      const response = await fetch(`/api/catalogues/${catalogueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const responseData = await response.json()
      console.log('API response:', responseData)

      // Check for version conflict
      if (response.status === 409) {
        setConflictData(responseData)
        setShowConflictDialog(true)
        setIsSaving(false)
        return false
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save catalogue')
      }

      // Update version on successful save
      if (responseData.catalogue?.version) {
        setCatalogueVersion(responseData.catalogue.version)
      }

      toast.success('Catalogue saved successfully!')
      await fetchCatalogue()
      return true
    } catch (error: any) {
      console.error('Error saving catalogue:', error)
      toast.error(error.message || 'Failed to save catalogue')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const openCategoryDialog = (category?: Category) => {
    if (
      currentPlan === SubscriptionPlan.FREE &&
      catalogue &&
      catalogue.categories.length >= 3
    ) {
      setShowUpgradePrompt(true)
      return
    }

    setEditingCategory(category || null)
    setCategoryForm({
      name: category?.name || '',
      description: category?.description || '',
    })
    setShowCategoryDialog(true)
  }

  const openProductDialog = (product?: Product) => {
    if (
      currentPlan === SubscriptionPlan.FREE &&
      catalogue &&
      catalogue.products.length >= 10
    ) {
      setShowUpgradePrompt(true)
      return
    }

    setEditingProduct(product || null)
    if (product) {
      // Editing a single product - initialize with one form
      setProductForms([
        {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          priceDisplay:
            (product.priceDisplay as 'show' | 'hide' | 'contact') || 'show',
          categoryId: product.categoryId,
          isActive: product.isActive ?? true,
          imageUrl: product.imageUrl || '',
          tags: product.tags || [],
        },
      ])
    } else {
      // Adding new products - start with one empty form
      setProductForms([
        {
          id: `temp-${Date.now()}`,
          name: '',
          description: '',
          price: 0,
          priceDisplay: 'show' as 'show' | 'hide' | 'contact',
          categoryId: '',
          isActive: true,
          imageUrl: '',
          tags: [],
        },
      ])
    }
    setShowProductDialog(true)
  }

  const addAnotherProduct = () => {
    setProductForms(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}-${prev.length}`,
        name: '',
        description: '',
        price: 0,
        priceDisplay: 'show' as 'show' | 'hide' | 'contact',
        categoryId: '',
        isActive: true,
        imageUrl: '',
        tags: [],
      },
    ])
  }

  const removeProductForm = (index: number) => {
    if (productForms.length > 1) {
      setProductForms(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateProductForm = (
    index: number,
    updates: Partial<(typeof productForms)[0]>
  ) => {
    setProductForms(prev =>
      prev.map((form, i) => (i === index ? { ...form, ...updates } : form))
    )
  }

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required')
      return
    }

    try {
      const url = editingCategory
        ? `/api/catalogues/${catalogueId}/categories/${editingCategory.id}`
        : `/api/catalogues/${catalogueId}/categories`

      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: categoryForm.name,
          description: categoryForm.description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save category')
      }

      toast.success(
        `Category ${editingCategory ? 'updated' : 'created'} successfully!`
      )
      setShowCategoryDialog(false)
      setCategoryForm({ name: '', description: '' })
      setEditingCategory(null)
      await fetchCatalogue()
    } catch (error: any) {
      console.error('Error saving category:', error)
      toast.error(error.message || 'Failed to save category')
    }
  }

  const createNewCategory = async (index: number) => {
    const form = newCategoryForm[index]
    if (!form?.name.trim()) {
      toast.error('Category name is required')
      return
    }

    try {
      const response = await fetch(
        `/api/catalogues/${catalogueId}/categories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create category')
      }

      const newCategory = await response.json()

      toast.success('Category created successfully!')

      // Update the product form with the new category
      updateProductForm(index, { categoryId: newCategory.category.id })

      // Reset the new category form
      setNewCategoryForm(prev => ({
        ...prev,
        [index]: { name: '', description: '' },
      }))
      setIsCreatingNewCategory(prev => ({ ...prev, [index]: false }))

      // Refresh catalogue data
      await fetchCatalogue()
    } catch (error: any) {
      console.error('Error creating category:', error)
      toast.error(error.message || 'Failed to create category')
    }
  }

  const saveProduct = async () => {
    // Validate that at least one product has a name
    const validProducts = productForms.filter(form => form.name.trim())
    if (validProducts.length === 0) {
      toast.error('At least one product must have a name')
      return
    }

    try {
      // Save each product individually
      const savePromises = validProducts.map(async productForm => {
        const isEditing = editingProduct && productForm.id === editingProduct.id
        const url = isEditing
          ? `/api/catalogues/${catalogueId}/products/${editingProduct.id}`
          : `/api/catalogues/${catalogueId}/products`

        const method = isEditing ? 'PUT' : 'POST'

        const productData: any = {
          name: productForm.name,
          description: productForm.description,
          price: Number(productForm.price),
          priceDisplay: productForm.priceDisplay,
          isActive: productForm.isActive,
          imageUrl: productForm.imageUrl || undefined,
          tags: productForm.tags,
        }

        // Only include categoryId if it's not empty
        if (productForm.categoryId && productForm.categoryId.trim() !== '') {
          productData.categoryId = productForm.categoryId
        }

        console.log('Saving product with data:', productData)
        console.log('Product form state:', productForm)

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        })

        console.log('Response status:', response.status)

        if (!response.ok) {
          const errorData = await response.json()
          console.log('Error response:', errorData)
          throw new Error(errorData.error || 'Failed to save product')
        }

        const responseData = await response.json()
        console.log('Success response data:', responseData)
        return responseData
      })

      // Wait for all products to be saved
      await Promise.all(savePromises)

      toast.success(
        `Successfully saved ${validProducts.length} product${validProducts.length > 1 ? 's' : ''}!`
      )
      setShowProductDialog(false)
      setProductForms([])
      setEditingProduct(null)
      await fetchCatalogue()
    } catch (error: any) {
      console.error('Error saving products:', error)
      toast.error(error.message || 'Failed to save products')
    }
  }

  // AI helpers moved inline into per-form controls in the product dialog.

  const toggleSmartSort = () => {
    setSmartSortEnabled(!smartSortEnabled)
    if (!smartSortEnabled) {
      // Use type assertion to ensure compatibility
      setCatalogue(prev => {
        if (!prev) return null
        const sortedProducts = smartSort(prev.products) as typeof prev.products
        return { ...prev, products: sortedProducts }
      })
    }
  }

  const handlePreview = () => {
    router.push(`/catalogue/${catalogueId}/preview`)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this category? All products in this category will be moved to "Uncategorized".'
      )
    ) {
      return
    }

    try {
      const deleteUrl = `/api/catalogues/${catalogueId}/categories/${categoryId}`
      console.log('Deleting category with URL:', deleteUrl)

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      })

      console.log('Delete category response status:', response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Delete category error response:', errorData)
        throw new Error('Failed to delete category')
      }

      // Update local state
      setCatalogue(prev => {
        if (!prev) return null
        return {
          ...prev,
          categories: prev.categories.filter(c => c.id !== categoryId),
          // Move products to uncategorized (empty string as categoryId)
          products: prev.products.map(p =>
            p.categoryId === categoryId ? { ...p, categoryId: '' } : p
          ),
        }
      })

      toast.success('Category deleted successfully')
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this product? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      const deleteUrl = `/api/catalogues/${catalogueId}/products/${productId}`
      console.log('Deleting product with URL:', deleteUrl)

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      })

      console.log('Delete product response status:', response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Delete product error response:', errorData)
        throw new Error('Failed to delete product')
      }

      // Update local state
      setCatalogue(prev => {
        if (!prev) return null
        return {
          ...prev,
          products: prev.products.filter(p => p.id !== productId),
        }
      })

      toast.success('Product deleted successfully')
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  if (isLoading) {
    return (
      <>
        <div className="bg-[#E8EAF6] pl-20">
          <Header title="Edit Catalogue" showGradientBanner={true} />
        </div>

        <div className="-mt-6 min-h-screen bg-[#E8EAF6] pl-28">
          <div className="flex">
            <div className="min-h-screen w-64 bg-white pt-4">
              <div className="space-y-1 p-4">
                <Skeleton className="mb-4 h-9 w-full rounded-lg" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-11 w-full rounded-lg" />
                ))}
              </div>
            </div>

            <div className="mr-8 flex flex-1 bg-gray-50">
              <div className="flex-1 space-y-6 p-6">
                {/* Stats cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-6">
                  <div className="col-span-4">
                    <div className="rounded-lg bg-white p-6">
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <Skeleton className="mb-2 h-6 w-40" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-8 w-32" />
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-48 rounded-lg" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="px-1">
                      <div className="mb-6">
                        <Skeleton className="mb-2 h-6 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                      <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-20 rounded-lg" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!catalogue) {
    return (
      <>
        <div className="ml-20">
          <Header title="Edit Catalogue" showGradientBanner={true} />
        </div>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Catalogue not found or you don&apos;t have permission to edit it.
            </AlertDescription>
          </Alert>
        </div>
      </>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-pink-50 to-blue-50">
      <div className=" pl-20">
        <Header
          title="Edit Catalogue"
          catalogueName={catalogue.name}
          lastUpdated={new Date(catalogue.updatedAt).toLocaleDateString(
            'en-US',
            {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }
          )}
          showGradientBanner={true}
          onPreview={handlePreview}
          onSave={saveCatalogue}
          isSaving={isSaving}
          hasPremiumAccess={!isOwner && currentUserHasPremiumAccess}
          activeUsers={activeUsers}
          isTrackingPresence={isTracking}
        />
      </div>
      <div className="-mt-6 min-h-screen pl-28">
        {/* Main Layout Container */}
        <div className="flex">
          {/* Left Sidebar */}
          <div className="min-h-screen w-64 bg-white pt-4">
            {/* Navigation */}
            <nav className="p-4">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('overview')
                    setCurrentSection('general')
                  }}
                  className={`flex w-full items-center px-3 py-3 text-sm font-medium transition-colors ${activeTab === 'overview'
                    ? 'rounded-xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white'
                    : 'rounded-xl text-gray-600 transition-transform duration-200 hover:scale-105 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <LayoutDashboard className="mr-3 h-4 w-4" />
                  Overview
                </button>

                <button
                  onClick={() => {
                    setActiveTab('products')
                    setCurrentSection('products')
                  }}
                  className={`flex w-full items-center px-3 py-3 text-sm font-medium transition-colors ${activeTab === 'products'
                    ? 'rounded-xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white'
                    : 'rounded-xl text-gray-600 transition-transform duration-200 hover:scale-105 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Package className="mr-3 h-4 w-4" />
                  Products
                  <span className="ml-auto rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-600">
                    {catalogue.products.length}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('categories')
                    setCurrentSection('categories')
                  }}
                  className={`flex w-full items-center px-3 py-3 text-sm font-medium transition-colors ${activeTab === 'categories'
                    ? 'rounded-xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white'
                    : 'rounded-xl text-gray-600 transition-transform duration-200 hover:scale-105 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <FolderOpen className="mr-3 h-4 w-4" />
                  Categories
                  <span
                    className={`ml-auto rounded-full px-2 py-1 text-xs ${activeTab === 'categories'
                      ? 'rounded-xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white'
                      : 'bg-gray-200 text-gray-600'
                      }`}
                  >
                    {catalogue.categories.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('theme')
                    setCurrentSection('general')
                  }}
                  className={`flex w-full items-center px-3 py-3 text-sm font-medium transition-colors ${activeTab === 'theme'
                    ? 'rounded-xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white'
                    : 'rounded-xl text-gray-600 transition-transform duration-200 hover:scale-105 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Palette className="mr-3 h-4 w-4" />
                  Template
                </button>

                <button
                  onClick={() => {
                    setActiveTab('sharing')
                    setCurrentSection('general')
                  }}
                  className={`flex w-full items-center px-3 py-3 text-sm font-medium transition-colors ${activeTab === 'team'
                    ? 'rounded-xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white'
                    : 'rounded-xl text-gray-600 transition-transform duration-200 hover:scale-105 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Users className="mr-3 h-4 w-4" />
                  Sharing
                </button>

                <button
                  onClick={() => setActiveTab('visibility')}
                  className={`flex w-full items-center px-3 py-3 text-sm font-medium transition-colors ${activeTab === 'visibility'
                    ? 'rounded-xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white'
                    : 'rounded-xl text-gray-600 transition-transform duration-200 hover:scale-105 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  {catalogue?.isPublic ? (
                    <Eye className="mr-3 h-4 w-4" />
                  ) : (
                    <EyeOff className="mr-3 h-4 w-4" />
                  )}
                  Visibility
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="mr-8 flex flex-1  bg-gray-50">
            {/* Content Area */}
            <div className="flex-1 p-6">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>{error}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setError(null)
                        if (errorTimeoutId) {
                          clearTimeout(errorTimeoutId)
                          setErrorTimeoutId(null)
                        }
                      }}
                      className="ml-2 h-auto p-1 hover:bg-red-100"
                    >
                      ×
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Tab Content */}
              <div className="space-y-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Stats Cards - Dynamic data */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                      <Card className="group h-24 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="mb-1 text-sm font-medium text-[#779CAB]">
                                Total Categories
                              </p>
                              <p className="text-2xl font-bold text-[#1A1B41]">
                                {catalogue.categories.length}
                              </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#43d8a9] to-[#2784e0d3] transition-transform duration-300 group-hover:scale-110">
                              <FolderOpen className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="group h-24 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="mb-1 text-sm font-medium text-[#779CAB]">
                                Total Products
                              </p>
                              <p className="text-2xl font-bold text-[#1A1B41]">
                                {catalogue.products.length}
                              </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#43d8a9] to-[#2784e0d3] transition-transform duration-300 group-hover:scale-110">
                              <Package className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="group h-24 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="mb-1 text-sm font-medium text-[#779CAB]">
                                Active Products
                              </p>
                              <p className="text-2xl font-bold text-[#1A1B41]">
                                {
                                  catalogue.products.filter(p => p.isActive)
                                    .length
                                }
                              </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#43d8a9] to-[#2784e0d3] transition-transform duration-300 group-hover:scale-110">
                              <Eye className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="group h-24 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="mb-1 text-sm font-medium text-[#779CAB]">
                                Public Status
                              </p>
                              <p className="text-xl font-bold text-[#1A1B41]">
                                {catalogue.isPublic ? 'Public' : 'Private'}
                              </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#43d8a9] to-[#2784e0d3] transition-transform duration-300 group-hover:scale-110">
                              {catalogue.isPublic ? (
                                <Eye className="h-6 w-6 text-white" />
                              ) : (
                                <Package className="h-6 w-6 text-white" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Products and Quick Actions Layout */}
                    <div className="grid grid-cols-5 gap-6  ">
                      {/* Recent Products - Left Column (2/3) */}
                      <div className="col-span-4">
                        <div className="rounded-lg bg-white p-6">
                          <div className="mb-6 flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-[#1A1B41]">
                                Recent Products
                              </h3>
                              <p className="text-xs text-gray-500">
                                Showing 3 of {catalogue.products.length}{' '}
                                products
                              </p>
                            </div>
                            <Button
                              size="xs"
                              className="bg-gradient-to-r from-[#6366F1] to-[#2D1B69] px-3 pr-4 py-4 text-white"
                              onClick={() => openProductDialog()}
                            >
                              <Plus className="mr-1 h-4 w-4" />
                              Add Product
                            </Button>
                          </div>

                          {catalogue.products.length === 0 ? (
                            <div className="py-8 text-center">
                              <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                              <h3 className="mb-2 text-lg font-medium text-gray-900">
                                No products yet
                              </h3>
                              <p className="mb-4 text-gray-600">
                                Add your first product to start building your
                                catalogue
                              </p>
                              <Button
                                onClick={() => openProductDialog()}
                                className="bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                              </Button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                              {catalogue.products.slice(0, 3).map(product => (
                                <div
                                  key={product.id}
                                  className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                                  style={{
                                    transitionProperty:
                                      'box-shadow, transform, opacity',
                                    transitionTimingFunction:
                                      'cubic-bezier(0.4, 0, 0.2, 1)',
                                  }}
                                  onClick={() => openProductDialog(product)}
                                >
                                  <div className="relative h-32 bg-gray-100">
                                    {product.imageUrl ? (
                                      <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                        onError={e => {
                                          e.currentTarget.style.display = 'none'
                                          const nextElement = e.currentTarget
                                            .nextElementSibling as HTMLElement
                                          if (nextElement) {
                                            nextElement.style.display = 'flex'
                                          }
                                        }}
                                      />
                                    ) : null}

                                    <div
                                      className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${product.imageUrl ? 'hidden' : 'flex'}`}
                                    >
                                      <div className="text-center text-gray-400">
                                        <Package className="mx-auto mb-1 h-8 w-8" />
                                        <p className="text-xs">No Image</p>
                                      </div>
                                    </div>

                                    {/* Hover Action Buttons */}
                                    <div className="absolute right-2 top-2 flex translate-y-1 transform gap-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                      <button
                                        onClick={e => {
                                          e.stopPropagation()
                                          openProductDialog(product)
                                        }}
                                        className="group/btn flex h-7 w-7 items-center justify-center rounded-lg border border-white/60 bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-[#301F70] hover:text-white"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={e => {
                                          e.stopPropagation()
                                          handleDeleteProduct(product.id)
                                        }}
                                        className="group/btn flex h-7 w-7 items-center justify-center rounded-lg border border-white/60 bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-red-500 hover:text-white"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>

                                    <div className="absolute left-2 top-2">
                                      <Badge
                                        variant={
                                          product.isActive
                                            ? 'default'
                                            : 'secondary'
                                        }
                                        className="bg-white/90 px-2 py-0.5 text-xs text-gray-800"
                                      >
                                        {product.isActive
                                          ? 'Available'
                                          : 'Unavailable'}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="p-3">
                                    <div className="space-y-2">
                                      <div>
                                        <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                                          {product.name}
                                        </h3>
                                        <p className="line-clamp-2 text-xs leading-tight text-gray-600">
                                          {product.description ||
                                            'No description available'}
                                        </p>
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <div className="text-sm font-bold text-gray-900">
                                          {product.priceDisplay === 'show' &&
                                            product.price ? (
                                            `$${Number(product.price).toFixed(2)}`
                                          ) : product.priceDisplay ===
                                            'contact' ? (
                                            <span className="text-xs font-medium text-blue-600">
                                              Contact for Price
                                            </span>
                                          ) : (
                                            <span className="text-xs font-medium text-gray-500">
                                              Price Hidden
                                            </span>
                                          )}
                                        </div>

                                        <Badge
                                          variant="outline"
                                          className="px-1.5 py-0.5 text-xs"
                                        >
                                          {product.categoryId
                                            ? catalogue.categories.find(
                                              c => c.id === product.categoryId
                                            )?.name || 'Unknown'
                                            : 'Uncategorized'}
                                        </Badge>
                                      </div>

                                      {product.tags &&
                                        product.tags.length > 0 && (
                                          <div className="flex flex-wrap gap-1">
                                            {product.tags
                                              .slice(0, 2)
                                              .map((tag, index) => (
                                                <Badge
                                                  key={index}
                                                  variant="secondary"
                                                  className="px-1.5 py-0.5 text-xs"
                                                >
                                                  {tag}
                                                </Badge>
                                              ))}
                                            {product.tags.length > 2 && (
                                              <Badge
                                                variant="secondary"
                                                className="px-1.5 py-0.5 text-xs"
                                              >
                                                +{product.tags.length - 2}
                                              </Badge>
                                            )}
                                          </div>
                                        )}

                                      {/* Compact hover footer */}
                                      <div className="mt-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-gray-500">
                                            Click to edit
                                          </span>
                                          <span className="font-medium text-[#301F70]">
                                            Edit Product
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions - Right Column (1/3) - Remove background */}
                      <div className="col-span-1">
                        <div className="px-1">
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-[#1A1B41]">
                              Quick Actions
                            </h3>
                            <p className="text-xs text-gray-500">
                              Manage your catalogues
                            </p>
                          </div>
                          <div className="space-y-3">
                            <div
                              onClick={() => openProductDialog()}
                              className="group cursor-pointer rounded-lg border-2 border-dashed border-[#779CAB]/30 bg-gradient-to-br from-[#779CAB]/5 to-[#A2E8DD]/10 p-4 transition-all duration-200 hover:border-[#301F70]/50 hover:from-[#301F70]/5 hover:to-[#1A1B41]/10"
                            >
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-gradient-to-r from-[#43d8a9] to-[#2784e0d3] p-2 transition-all duration-200 group-hover:from-[#301F70] group-hover:to-[#1A1B41]">
                                  <Package className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#1A1B41]">
                                    Add Product
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Expand catalogue
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div
                              onClick={() => openCategoryDialog()}
                              className="group cursor-pointer rounded-lg border-2 border-dashed border-[#779CAB]/30 bg-gradient-to-br from-[#779CAB]/5 to-[#A2E8DD]/10 p-4 transition-all duration-200 hover:border-[#301F70]/50 hover:from-[#301F70]/5 hover:to-[#1A1B41]/10"
                            >
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-gradient-to-r from-[#43d8a9] to-[#2784e0d3] p-2 transition-all duration-200 group-hover:from-[#301F70] group-hover:to-[#1A1B41]">
                                  <Plus className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#1A1B41]">
                                    Add Category
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Organize products
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div
                              onClick={() => setShowEditDialog(true)}
                              className="group cursor-pointer rounded-lg border-2 border-dashed border-[#779CAB]/30 bg-gradient-to-br from-[#779CAB]/5 to-[#A2E8DD]/10 p-4 transition-all duration-200 hover:border-[#301F70]/50 hover:from-[#301F70]/5 hover:to-[#1A1B41]/10"
                            >
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-gradient-to-r from-[#43d8a9] to-[#2784e0d3] p-2 transition-all duration-200 group-hover:from-[#301F70] group-hover:to-[#1A1B41]">
                                  <Edit className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#1A1B41]">
                                    Edit Details
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Update branding
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div
                              onClick={() => setShowSettingsDialog(true)}
                              className="group cursor-pointer rounded-lg border-2 border-dashed border-[#779CAB]/30 bg-gradient-to-br from-[#779CAB]/5 to-[#A2E8DD]/10 p-4 transition-all duration-200 hover:border-[#301F70]/50 hover:from-[#301F70]/5 hover:to-[#1A1B41]/10"
                            >
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-gradient-to-r from-[#43d8a9] to-[#2784e0d3] p-2 transition-all duration-200 group-hover:from-[#301F70] group-hover:to-[#1A1B41]">
                                  <Settings className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#1A1B41]">
                                    Edit Settings
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Display options
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-[#1A1B41]">
                        Categories
                      </h2>
                      <Button
                        onClick={() => openCategoryDialog()}
                        className="bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                      </Button>
                    </div>

                    {catalogue.categories.length === 0 ? (
                      <div className="rounded-lg bg-white">
                        <div className="flex flex-col items-center justify-center py-12">
                          <Package className="mb-4 h-12 w-12 text-gray-400" />
                          <h3 className="mb-2 text-lg font-medium text-gray-900">
                            No categories yet
                          </h3>
                          <p className="mb-4 text-center text-gray-600">
                            Create your first category to organize your products
                          </p>
                          <Button
                            onClick={() => openCategoryDialog()}
                            className="bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Category
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {catalogue.categories.map(category => {
                          const categoryProducts = catalogue.products.filter(
                            p => p.categoryId === category.id
                          )
                          const previewImage = categoryProducts.find(
                            p => p.imageUrl
                          )?.imageUrl

                          return (
                            <div
                              key={category.id}
                              className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/40"
                              onClick={() => openCategoryDialog(category)}
                            >
                              <div className="relative h-48 overflow-hidden bg-slate-50">
                                {previewImage ? (
                                  <div className="absolute inset-0">
                                    <img
                                      src={previewImage}
                                      alt={category.name}
                                      className="h-full w-full object-cover opacity-95 transition-all duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/30 to-transparent" />
                                  </div>
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#779CAB]/20 to-[#A2E8DD]/20">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-[#779CAB]/30 bg-white/80 shadow-sm">
                                      <Package className="h-8 w-8 text-[#1A1B41]" />
                                    </div>
                                  </div>
                                )}

                                {/* Hover Action Buttons */}
                                <div className="absolute right-4 top-4 flex translate-y-2 transform gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                  <button
                                    onClick={e => {
                                      e.stopPropagation()
                                      openCategoryDialog(category)
                                    }}
                                    className="group/btn flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-[#1A1B41] hover:text-white"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={e => {
                                      e.stopPropagation()
                                      handleDeleteCategory(category.id)
                                    }}
                                    className="group/btn flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-red-500 hover:text-white"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                  <div className="space-y-1">
                                    <h3 className="text-xl font-semibold leading-tight text-slate-800">
                                      {category.name}
                                    </h3>
                                    <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
                                      {category.description || 'No description'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-5 p-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div className="h-2 w-2 rounded-full bg-[#A2E8DD]" />
                                    <span className="text-sm font-semibold text-slate-700">
                                      {category._count.products}{' '}
                                      {category._count.products === 1
                                        ? 'Product'
                                        : 'Products'}
                                    </span>
                                  </div>

                                  <Badge
                                    variant="secondary"
                                    className="border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-700"
                                  >
                                    Active
                                  </Badge>
                                </div>

                                {categoryProducts.length > 0 && (
                                  <div className="space-y-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                      Featured Products
                                    </p>
                                    <div className="flex gap-2.5">
                                      {categoryProducts
                                        .slice(0, 4)
                                        .map(product => (
                                          <div
                                            key={product.id}
                                            className="group/thumb"
                                          >
                                            {product.imageUrl ? (
                                              <div className="h-14 w-14 overflow-hidden rounded-xl border border-slate-200 shadow-sm transition-all duration-200 group-hover/thumb:scale-105 group-hover/thumb:shadow-md">
                                                <img
                                                  src={product.imageUrl}
                                                  alt={product.name}
                                                  className="h-full w-full object-cover"
                                                />
                                              </div>
                                            ) : (
                                              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 transition-all duration-200 group-hover/thumb:bg-slate-100">
                                                <Package className="h-6 w-6 text-slate-400" />
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      {categoryProducts.length > 4 && (
                                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                                          <span className="text-xs font-semibold text-slate-500">
                                            +{categoryProducts.length - 4}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Compact footer - only show on hover */}
                                <div className="mt-3 ">
                                  <div className="flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <span className="text-xs text-gray-500">
                                      Click to edit
                                    </span>
                                    <div className="text-xs font-medium text-[#301F70]">
                                      Edit
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-[#1A1B41]">
                        Products
                      </h2>
                      <Button
                        onClick={() => openProductDialog()}
                        className="bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </Button>
                    </div>

                    {catalogue.products.length === 0 ? (
                      <div className="rounded-lg bg-white">
                        <div className="flex flex-col items-center justify-center py-12">
                          <Package className="mb-4 h-12 w-12 text-gray-400" />
                          <h3 className="mb-2 text-lg font-medium text-gray-900">
                            No products yet
                          </h3>
                          <p className="mb-4 text-center text-gray-600">
                            Add your first product to start building your
                            catalogue
                          </p>
                          <Button
                            onClick={() => openProductDialog()}
                            className="bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {catalogue.products.map(product => (
                          <div
                            key={product.id}
                            className="group transform cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                            style={{
                              transitionProperty:
                                'box-shadow, transform, opacity',
                              transitionTimingFunction:
                                'cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                            onClick={() => openProductDialog(product)}
                          >
                            <div className="relative aspect-[4/3] bg-gray-100">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                  onError={e => {
                                    e.currentTarget.style.display = 'none'
                                    const nextElement = e.currentTarget
                                      .nextElementSibling as HTMLElement
                                    if (nextElement) {
                                      nextElement.style.display = 'flex'
                                    }
                                  }}
                                />
                              ) : null}

                              <div
                                className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${product.imageUrl ? 'hidden' : 'flex'}`}
                              >
                                <div className="text-center text-gray-400">
                                  <Package className="mx-auto mb-2 h-12 w-12" />
                                  <p className="text-sm">No Image</p>
                                </div>
                              </div>

                              {/* Hover Action Buttons */}
                              <div className="absolute right-2 top-2 flex translate-y-2 transform gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                <button
                                  onClick={e => {
                                    e.stopPropagation()
                                    openProductDialog(product)
                                  }}
                                  className="group/btn flex h-8 w-8 items-center justify-center rounded-xl border border-white/60 bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-[#301F70] hover:text-white"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleDeleteProduct(product.id)
                                  }}
                                  className="group/btn flex h-8 w-8 items-center justify-center rounded-xl border border-white/60 bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-red-500 hover:text-white"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="absolute left-2 top-2">
                                <Badge
                                  variant={
                                    product.isActive ? 'default' : 'secondary'
                                  }
                                  className="bg-white/90 text-gray-800"
                                >
                                  {product.isActive
                                    ? 'Available'
                                    : 'Unavailable'}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-3 p-4">
                              <div>
                                <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                                  {product.name}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                  {product.description ||
                                    'No description available'}
                                </p>
                              </div>

                              <div className="flex justify-between">
                                <div className="flex items-center justify-between">
                                  <div className="text-xl font-bold text-gray-900">
                                    {product.priceDisplay === 'show' &&
                                      product.price ? (
                                      `$${Number(product.price).toFixed(2)}`
                                    ) : product.priceDisplay === 'contact' ? (
                                      <span className="text-base font-medium text-blue-600">
                                        Contact for Price
                                      </span>
                                    ) : (
                                      <span className="text-base font-medium text-gray-500">
                                        Price Hidden
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    Category:
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {product.categoryId
                                      ? catalogue.categories.find(
                                        c => c.id === product.categoryId
                                      )?.name || 'Unknown'
                                      : 'Uncategorized'}
                                  </Badge>
                                </div>
                              </div>

                              {product.tags && product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {product.tags
                                    .slice(0, 3)
                                    .map((tag, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="px-2 py-1 text-xs"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  {product.tags.length > 3 && (
                                    <Badge
                                      variant="secondary"
                                      className="px-2 py-1 text-xs"
                                    >
                                      +{product.tags.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Hover footer for edit indication */}
                              <div className="mt-3  opacity-0 transition-all duration-300 group-hover:opacity-100">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    Click to edit
                                  </span>
                                  <div className="text-xs font-medium text-[#301F70]">
                                    Edit Product
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Visibility Tab */}
                {activeTab === 'visibility' && (
                  <div className="space-y-6">
                    <div className="rounded-lg bg-white p-6">
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-[#1A1B41]">
                          Catalogue Settings
                        </h3>
                        <p className="text-sm text-gray-500">
                          Configure your catalogue preferences
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base font-medium">
                              Public Visibility
                            </Label>
                            <p className="text-sm text-gray-600">
                              Make your catalogue visible to everyone
                            </p>
                          </div>
                          <Switch
                            checked={catalogue.isPublic}
                            onCheckedChange={checked =>
                              setCatalogue(prev =>
                                prev ? { ...prev, isPublic: checked } : null
                              )
                            }
                            className={`${catalogue.isPublic ? 'bg-[#2D1B69]' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors `}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sharing Tab */}
                {activeTab === 'sharing' && (
                  <div className="space-y-6">
                    {catalogue && (
                      <TeamManagement
                        catalogueId={catalogue.id}
                        isOwner={true}
                      />
                    )}
                  </div>
                )}

                {/* Template Tab */}
                {activeTab === 'theme' && (
                  <div className="space-y-6">
                    <TemplateThemeWorkflow
                      initialTemplateId={catalogue?.template}
                      onSelectionComplete={templateId => {
                        // Use template-only handler
                        handleTemplateSelect(templateId)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b bg-gradient-to-r from-[#2D1B69] to-[#6366F1] px-6 py-5 text-white">
            <DialogTitle className="text-2xl font-bold text-white">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
            <DialogDescription className="text-white/80">
              {editingCategory
                ? 'Update category information'
                : 'Create a new category for your products'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <Label
                htmlFor="categoryName"
                className="text-base font-semibold text-gray-900"
              >
                Category Name
              </Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={e =>
                  setCategoryForm(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter category name"
                className="mt-2 h-11"
              />
            </div>

            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <Label
                htmlFor="categoryDescription"
                className="text-base font-semibold text-gray-900"
              >
                Description
              </Label>
              <Textarea
                id="categoryDescription"
                value={categoryForm.description}
                onChange={e =>
                  setCategoryForm(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter category description"
                rows={3}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t bg-gray-50 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setShowCategoryDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white hover:from-[#3D2B79] hover:to-[#7376F1]"
              onClick={saveCategory}
            >
              {editingCategory ? 'Update' : 'Create'} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b bg-gradient-to-r from-[#2D1B69] to-[#6366F1] px-6 py-5 text-white">
            <DialogTitle className="text-2xl font-bold text-white">
              {editingProduct ? 'Edit Product' : 'Add Products'}
            </DialogTitle>
            <DialogDescription className="text-white/80">
              {editingProduct
                ? 'Update product information'
                : `Add multiple products to your catalogue (${productForms.length} product${productForms.length > 1 ? 's' : ''})`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
            {productForms.map((productForm, index) => (
              <div
                key={productForm.id}
                className="space-y-4 rounded-lg border bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Product {index + 1}
                  </h3>
                  {productForms.length > 1 && !editingProduct && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeProductForm(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Product Name */}
                <div>
                  <Label
                    htmlFor={`productName-${index}`}
                    className="text-base font-semibold text-gray-900"
                  >
                    Product Name *
                  </Label>
                  <Input
                    id={`productName-${index}`}
                    value={productForm.name}
                    onChange={e =>
                      updateProductForm(index, { name: e.target.value })
                    }
                    placeholder="Enter product name"
                    className="mt-2 h-11"
                  />
                </div>

                {/* Product Description with AI */}
                <div>
                  <Label
                    htmlFor={`productDescription-${index}`}
                    className="text-base font-semibold text-gray-900"
                  >
                    Description
                  </Label>
                  <div className="mt-2 space-y-2">
                    <Textarea
                      id={`productDescription-${index}`}
                      value={productForm.description}
                      onChange={e =>
                        updateProductForm(index, {
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter product description"
                      rows={3}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      className="w-fit border-blue-400/20 text-xs text-blue-600"
                      disabled={
                        isGeneratingDescription || !productForm.name.trim()
                      }
                      onClick={async () => {
                        if (!productForm.name.trim()) {
                          toast.error('Please enter a product name first')
                          return
                        }

                        setIsGeneratingDescription(true)

                        try {
                          const category = catalogue?.categories.find(
                            cat => cat.id === productForm.categoryId
                          )

                          const response = await fetch('/api/ai/description', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              productName: productForm.name,
                              category: category?.name,
                              tags: productForm.tags,
                              price:
                                productForm.price > 0
                                  ? productForm.price
                                  : undefined,
                            }),
                          })

                          if (!response.ok) {
                            throw new Error(
                              `Failed to generate description: ${response.status}`
                            )
                          }

                          const data = await response.json()

                          if (data.success && data.description) {
                            updateProductForm(index, {
                              description: data.description,
                            })
                            toast.success(
                              'AI description generated successfully!'
                            )
                          } else {
                            throw new Error(
                              data.error || 'Failed to generate description'
                            )
                          }
                        } catch (error) {
                          console.error('AI Generation Error:', error)
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : 'Failed to generate description'
                          )
                        } finally {
                          setIsGeneratingDescription(false)
                        }
                      }}
                    >
                      {isGeneratingDescription ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-1 h-3 w-3" /> AI Generate
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Product Image */}
                <div>
                  <Label className="text-base font-semibold text-gray-900">
                    Product Image
                  </Label>
                  {!productForm.imageUrl ? (
                    <FileUpload
                      uploadType="product"
                      catalogueId={catalogueId}
                      productId={editingProduct?.id}
                      maxFiles={1}
                      accept={[
                        'image/jpeg',
                        'image/jpg',
                        'image/png',
                        'image/webp',
                      ]}
                      onUpload={files => {
                        if (files.length > 0) {
                          updateProductForm(index, { imageUrl: files[0].url })
                        }
                      }}
                      onError={error => {
                        setErrorWithAutoDismiss(
                          `Product image upload failed: ${error}`
                        )
                      }}
                      className="mt-2"
                    />
                  ) : (
                    <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3">
                      <p className="mb-2 text-sm text-gray-600">
                        Current image:
                      </p>
                      <img
                        src={productForm.imageUrl}
                        alt="Product Image"
                        className="h-20 w-20 rounded border object-cover"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateProductForm(index, { imageUrl: '' })
                        }
                        className="text-xs"
                      >
                        Change Image
                      </Button>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <Label
                    htmlFor={`productTags-${index}`}
                    className="text-base font-semibold text-gray-900"
                  >
                    Tags
                  </Label>
                  <Input
                    id={`productTags-${index}`}
                    value={productForm.tags?.join(', ') || ''}
                    onChange={e => {
                      const tagsArray = e.target.value
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(tag => tag.length > 0)
                      updateProductForm(index, { tags: tagsArray })
                    }}
                    placeholder="Enter tags separated by commas (e.g., electronics, gadgets, premium)"
                    className="mt-2 h-11"
                  />
                </div>

                {/* Price Information */}
                <div>
                  <h4 className="mb-4 text-base font-semibold text-gray-900">
                    Price Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor={`productPrice-${index}`}
                        className="text-sm font-semibold text-gray-900"
                      >
                        Price
                      </Label>
                      <Input
                        id={`productPrice-${index}`}
                        type="number"
                        value={productForm.price}
                        onChange={e =>
                          updateProductForm(index, {
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0.00"
                        className="mt-2 h-11"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor={`productPriceDisplay-${index}`}
                        className="text-sm font-semibold text-gray-900"
                      >
                        Price Display
                      </Label>
                      <Select
                        value={productForm.priceDisplay}
                        onValueChange={(value: 'show' | 'hide' | 'contact') =>
                          updateProductForm(index, { priceDisplay: value })
                        }
                      >
                        <SelectTrigger className="mt-2 h-11">
                          <SelectValue placeholder="Select price display" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="show">Show Price</SelectItem>
                          <SelectItem value="hide">Hide Price</SelectItem>
                          <SelectItem value="contact">
                            Contact for Price
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Category & Status */}
                <div>
                  <h4 className="mb-4 text-base font-semibold text-gray-900">
                    Category & Status
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor={`productCategory-${index}`}
                        className="text-sm font-semibold text-gray-900"
                      >
                        Category
                      </Label>
                      <div className="mt-2 space-y-3">
                        {!isCreatingNewCategory[index] ? (
                          <div className="flex flex-col items-start gap-2">
                            <Select
                              value={productForm.categoryId || 'no-category'}
                              onValueChange={value => {
                                if (value === 'create-new') {
                                  setIsCreatingNewCategory(prev => ({
                                    ...prev,
                                    [index]: true,
                                  }))
                                  setNewCategoryForm(prev => ({
                                    ...prev,
                                    [index]: { name: '', description: '' },
                                  }))
                                } else if (value === 'no-category') {
                                  updateProductForm(index, { categoryId: '' })
                                } else {
                                  updateProductForm(index, {
                                    categoryId: value,
                                  })
                                }
                              }}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no-category">
                                  <div className="flex items-center gap-2 text-gray-500">
                                    <Package className="h-4 w-4" />
                                    No Category
                                  </div>
                                </SelectItem>
                                {catalogue.categories.map(category => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                                <SelectItem
                                  value="create-new"
                                  className="mt-1 border-t pt-2"
                                >
                                  <div className="flex items-center gap-2 text-blue-600">
                                    <Plus className="h-4 w-4" />
                                    Create New Category
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              className="border-blue-400/20 bg-blue-500/10 text-xs text-blue-600"
                              disabled={
                                !productForm.name || !productForm.description
                              }
                              onClick={async () => {
                                try {
                                  const response = await fetch(
                                    '/api/ai/category',
                                    {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({
                                        text: `${productForm.name} ${productForm.description}`,
                                        existingCategories:
                                          catalogue.categories,
                                      }),
                                    }
                                  )

                                  const data = await response.json()

                                  if (data.success && data.category) {
                                    updateProductForm(index, {
                                      categoryId: data.category.id,
                                    })
                                    toast.success(
                                      'Category suggested successfully!'
                                    )
                                  } else {
                                    throw new Error(
                                      data.error || 'Failed to suggest category'
                                    )
                                  }
                                } catch (error) {
                                  console.error(
                                    'AI Category Suggestion Error:',
                                    error
                                  )
                                  toast.error(
                                    error instanceof Error
                                      ? error.message
                                      : 'Failed to suggest category'
                                  )
                                }
                              }}
                            >
                              {isGeneratingDescription ? (
                                <>
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  Suggesting...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="mr-1 h-3 w-3" /> Suggest
                                  Category
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3 rounded-lg border bg-blue-50/50 p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-gray-900">
                                Create New Category
                              </h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setIsCreatingNewCategory(prev => ({
                                    ...prev,
                                    [index]: false,
                                  }))
                                  setNewCategoryForm(prev => ({
                                    ...prev,
                                    [index]: { name: '', description: '' },
                                  }))
                                }}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div>
                              <Label
                                htmlFor={`newCategoryName-${index}`}
                                className="text-xs text-gray-600"
                              >
                                Category Name *
                              </Label>
                              <Input
                                id={`newCategoryName-${index}`}
                                value={newCategoryForm[index]?.name || ''}
                                onChange={e =>
                                  setNewCategoryForm(prev => ({
                                    ...prev,
                                    [index]: {
                                      ...prev[index],
                                      name: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Enter category name"
                                className="mt-1 h-9"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`newCategoryDescription-${index}`}
                                className="text-xs text-gray-600"
                              >
                                Description (Optional)
                              </Label>
                              <Input
                                id={`newCategoryDescription-${index}`}
                                value={
                                  newCategoryForm[index]?.description || ''
                                }
                                onChange={e =>
                                  setNewCategoryForm(prev => ({
                                    ...prev,
                                    [index]: {
                                      ...prev[index],
                                      description: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Enter category description"
                                className="mt-1 h-9"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => createNewCategory(index)}
                                disabled={!newCategoryForm[index]?.name.trim()}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                              >
                                <Plus className="mr-1 h-3 w-3" />
                                Create Category
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setIsCreatingNewCategory(prev => ({
                                    ...prev,
                                    [index]: false,
                                  }))
                                  setNewCategoryForm(prev => ({
                                    ...prev,
                                    [index]: { name: '', description: '' },
                                  }))
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Enter product name and description first for better
                        category suggestions
                      </p>
                    </div>

                    <div>
                      <Label className="mb-2 block text-sm font-semibold text-gray-900">
                        Product Status
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`productActive-${index}`}
                          checked={productForm.isActive}
                          onCheckedChange={checked =>
                            updateProductForm(index, { isActive: checked })
                          }
                        />
                        <Label
                          htmlFor={`productActive-${index}`}
                          className="font-normal"
                        >
                          Active
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Another Product Button */}
            {!editingProduct && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAnotherProduct}
                  className="border-2 border-dashed border-[#6366F1]/30 bg-[#6366F1]/5 text-[#6366F1] hover:bg-[#6366F1]/10 hover:text-[#6366F1]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Product
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 border-t bg-gray-50 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setShowProductDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white hover:from-[#3D2B79] hover:to-[#7376F1]"
              onClick={saveProduct}
            >
              {editingProduct ? 'Update' : 'Add'} Product
              {productForms.length > 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b bg-gradient-to-r from-[#2D1B69] to-[#6366F1] px-6 py-5 text-white">
            <DialogTitle className="text-2xl font-bold">
              Catalogue Settings
            </DialogTitle>
            <DialogDescription className="text-white/80">
              Configure display and visibility settings for your catalogue
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            {/* Display Settings */}
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Display Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Show Prices</Label>
                    <p className="text-sm text-gray-600">
                      Display product prices in the catalogue
                    </p>
                  </div>
                  <Switch
                    checked={
                      catalogue?.settings?.displaySettings?.showPrices || false
                    }
                    onCheckedChange={checked =>
                      setCatalogue(prev =>
                        prev
                          ? {
                            ...prev,
                            settings: {
                              ...prev.settings,
                              displaySettings: {
                                ...prev.settings?.displaySettings,
                                showPrices: checked,
                              },
                            },
                          }
                          : null
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Show Categories
                    </Label>
                    <p className="text-sm text-gray-600">
                      Group products by categories
                    </p>
                  </div>
                  <Switch
                    checked={
                      catalogue?.settings?.displaySettings?.showCategories ||
                      false
                    }
                    onCheckedChange={checked =>
                      setCatalogue(prev =>
                        prev
                          ? {
                            ...prev,
                            settings: {
                              ...prev.settings,
                              displaySettings: {
                                ...prev.settings?.displaySettings,
                                showCategories: checked,
                              },
                            },
                          }
                          : null
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Allow Search
                    </Label>
                    <p className="text-sm text-gray-600">
                      Enable search functionality
                    </p>
                  </div>
                  <Switch
                    checked={
                      catalogue?.settings?.displaySettings?.allowSearch || false
                    }
                    onCheckedChange={checked =>
                      setCatalogue(prev =>
                        prev
                          ? {
                            ...prev,
                            settings: {
                              ...prev.settings,
                              displaySettings: {
                                ...prev.settings?.displaySettings,
                                allowSearch: checked,
                              },
                            },
                          }
                          : null
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Show Product Codes
                    </Label>
                    <p className="text-sm text-gray-600">
                      Display product SKU/codes
                    </p>
                  </div>
                  <Switch
                    checked={
                      catalogue?.settings?.displaySettings?.showProductCodes ||
                      false
                    }
                    onCheckedChange={checked =>
                      setCatalogue(prev =>
                        prev
                          ? {
                            ...prev,
                            settings: {
                              ...prev.settings,
                              displaySettings: {
                                ...prev.settings?.displaySettings,
                                showProductCodes: checked,
                              },
                            },
                          }
                          : null
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Visibility Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Catalogue Visibility
                    </Label>
                    <p className="text-sm text-gray-600">
                      Control who can see your catalogue
                    </p>
                  </div>
                  <Switch
                    checked={catalogue?.isPublic || false}
                    onCheckedChange={checked => {
                      setCatalogue(prev => {
                        if (!prev) return null

                        // Auto-generate slug from catalogue name if making public and no slug exists
                        if (checked && !prev.slug && prev.name) {
                          const autoSlug = prev.name
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, '')
                            .substring(0, 50) // Limit length
                          return { ...prev, isPublic: checked, slug: autoSlug }
                        }

                        return { ...prev, isPublic: checked }
                      })
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {catalogue?.isPublic
                    ? 'Public - Visible to everyone'
                    : 'Private - Only visible to you'}
                </p>

                {/* Public Link - Only show when public and has slug */}
                {catalogue?.isPublic && catalogue?.slug && (
                  <div className="space-y-2 border-t pt-2">
                    <Label className="text-base font-medium">
                      Public Share Link
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/view/${catalogue.slug}`}
                        className="border-green-200 bg-green-50 font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = `${window.location.origin}/view/${catalogue.slug}`
                          navigator.clipboard.writeText(link)
                          toast.success('Public link copied!')
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-green-600">
                      ✓ Anyone with this link can view your catalogue
                    </p>

                    {/* Advanced: Edit slug */}
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                        Customize URL slug
                      </summary>
                      <div className="mt-2 space-y-2">
                        <Input
                          placeholder="e.g., my-product-catalog-2025"
                          value={catalogue?.slug || ''}
                          onChange={e => {
                            const value = e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, '-')
                              .replace(/-+/g, '-')
                              .replace(/^-|-$/g, '')
                              .substring(0, 50)
                            setCatalogue(prev =>
                              prev ? { ...prev, slug: value } : null
                            )
                          }}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500">
                          URL-friendly characters only (a-z, 0-9, -)
                        </p>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t bg-gray-50 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white hover:from-[#3D2B79] hover:to-[#7376F1]"
              onClick={() => {
                setShowSettingsDialog(false)
                saveCatalogue()
              }}
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Details Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col overflow-hidden p-0">
          <DialogHeader className="border-b bg-gradient-to-r from-[#2D1B69] to-[#6366F1] px-6 py-5 text-white">
            <DialogTitle className="text-2xl font-bold">
              Edit Catalogue Details
            </DialogTitle>
            <DialogDescription className="text-white/80">
              Update your catalogue branding and information
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable content with step indicators */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left sidebar - Section navigation */}
            <div className="w-64 border-r bg-gray-50 p-4">
              <div className="sticky top-0 space-y-2">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Form Sections
                  </p>
                </div>

                <a
                  href="#basic-info"
                  className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors hover:bg-white hover:shadow-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <span>Basic Info</span>
                </a>

                <a
                  href="#media-assets"
                  className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors hover:bg-white hover:shadow-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <span>Media & Assets</span>
                </a>

                <a
                  href="#company-info"
                  className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors hover:bg-white hover:shadow-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <span>Company Info</span>
                </a>

                <a
                  href="#contact-details"
                  className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors hover:bg-white hover:shadow-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <span className="text-xs font-bold">4</span>
                  </div>
                  <span>Contact Details</span>
                </a>

                <a
                  href="#social-media"
                  className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors hover:bg-white hover:shadow-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                    <span className="text-xs font-bold">5</span>
                  </div>
                  <span>Social Media</span>
                </a>
              </div>
            </div>

            {/* Right content area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-8">
                {/* Section 1: Basic Information */}
                <div id="basic-info" className="scroll-mt-6">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                      <span className="text-lg font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Basic Information
                      </h3>
                      <p className="text-sm text-gray-500">
                        Essential details about your catalogue
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div>
                      <Label
                        htmlFor="catalogueName"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Catalogue Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="catalogueName"
                        value={catalogue?.name || ''}
                        onChange={e =>
                          setCatalogue(prev =>
                            prev ? { ...prev, name: e.target.value } : null
                          )
                        }
                        placeholder="e.g., Summer Collection 2025"
                        className="mt-2 h-11"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="catalogueDescription"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="catalogueDescription"
                        value={catalogue?.description || ''}
                        onChange={e =>
                          setCatalogue(prev =>
                            prev
                              ? { ...prev, description: e.target.value }
                              : null
                          )
                        }
                        placeholder="Describe your catalogue and what makes it special..."
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="catalogueTagline"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Tagline
                        </Label>
                        <Input
                          id="catalogueTagline"
                          value={catalogue?.tagline || ''}
                          onChange={e =>
                            setCatalogue(prev =>
                              prev ? { ...prev, tagline: e.target.value } : null
                            )
                          }
                          placeholder="A catchy tagline"
                          className="mt-2 h-11"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="catalogueYear"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Catalogue Year
                        </Label>
                        <Input
                          id="catalogueYear"
                          value={(catalogue as any)?.year || ''}
                          onChange={e =>
                            setCatalogue(prev =>
                              prev
                                ? ({ ...prev, year: e.target.value } as any)
                                : null
                            )
                          }
                          placeholder="2025"
                          className="mt-2 h-11"
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="catalogueQuote"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Quote
                      </Label>
                      <Textarea
                        id="catalogueQuote"
                        value={catalogue?.quote || ''}
                        onChange={e =>
                          setCatalogue(prev =>
                            prev ? { ...prev, quote: e.target.value } : null
                          )
                        }
                        placeholder="An inspiring quote for your catalogue"
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block text-sm font-semibold text-gray-700">
                        Intro Image
                      </Label>
                      {!catalogue?.introImage ? (
                        <FileUpload
                          uploadType="catalogue"
                          catalogueId={catalogueId}
                          maxFiles={1}
                          accept={[
                            'image/jpeg',
                            'image/jpg',
                            'image/png',
                            'image/webp',
                          ]}
                          onUpload={files => {
                            if (files.length > 0) {
                              setCatalogue(prev =>
                                prev
                                  ? { ...prev, introImage: files[0].url }
                                  : null
                              )
                            }
                          }}
                          onError={error => {
                            setErrorWithAutoDismiss(
                              `Intro image upload failed: ${error}`
                            )
                          }}
                          className="mt-2"
                        />
                      ) : (
                        <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3">
                          <p className="mb-2 text-sm text-gray-600">
                            Current intro image:
                          </p>
                          <img
                            src={catalogue.introImage}
                            alt="Intro Image"
                            className="h-24 w-32 rounded border object-cover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCatalogue(prev =>
                                prev ? { ...prev, introImage: '' } : null
                              )
                            }
                            className="text-xs"
                          >
                            Change Image
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Media & Assets */}
                <div id="media-assets" className="scroll-mt-6">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                      <span className="text-lg font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Media & Assets
                      </h3>
                      <p className="text-sm text-gray-500">
                        Upload logos and cover images
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <Label className="mb-2 block text-sm font-semibold text-gray-700">
                          Company Logo
                        </Label>
                        {!catalogue?.settings?.mediaAssets?.logoUrl ? (
                          <FileUpload
                            uploadType="catalogue"
                            catalogueId={catalogueId}
                            maxFiles={1}
                            accept={[
                              'image/jpeg',
                              'image/jpg',
                              'image/png',
                              'image/webp',
                            ]}
                            onUpload={files => {
                              if (files.length > 0) {
                                setCatalogue(prev =>
                                  prev
                                    ? {
                                      ...prev,
                                      settings: {
                                        ...prev.settings,
                                        mediaAssets: {
                                          ...prev.settings?.mediaAssets,
                                          logoUrl: files[0].url,
                                        },
                                      },
                                    }
                                    : null
                                )
                              }
                            }}
                            onError={error => {
                              setErrorWithAutoDismiss(
                                `Logo upload failed: ${error}`
                              )
                            }}
                            className="mt-2"
                          />
                        ) : (
                          <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3">
                            <p className="mb-2 text-sm text-gray-600">
                              Current logo:
                            </p>
                            <img
                              src={catalogue.settings.mediaAssets.logoUrl}
                              alt="Company Logo"
                              className="h-20 w-20 rounded border object-contain"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCatalogue(prev =>
                                  prev
                                    ? {
                                      ...prev,
                                      settings: {
                                        ...prev.settings,
                                        mediaAssets: {
                                          ...prev.settings?.mediaAssets,
                                          logoUrl: '',
                                        },
                                      },
                                    }
                                    : null
                                )
                              }
                              className="text-xs"
                            >
                              Change Logo
                            </Button>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label className="mb-2 block text-sm font-medium">
                          Cover Image
                        </Label>
                        {!catalogue?.settings?.mediaAssets?.coverImageUrl ? (
                          <FileUpload
                            uploadType="catalogue"
                            catalogueId={catalogueId}
                            maxFiles={1}
                            accept={[
                              'image/jpeg',
                              'image/jpg',
                              'image/png',
                              'image/webp',
                            ]}
                            onUpload={files => {
                              if (files.length > 0) {
                                setCatalogue(prev =>
                                  prev
                                    ? {
                                      ...prev,
                                      settings: {
                                        ...prev.settings,
                                        mediaAssets: {
                                          ...prev.settings?.mediaAssets,
                                          coverImageUrl: files[0].url,
                                        },
                                      },
                                    }
                                    : null
                                )
                              }
                            }}
                            onError={error => {
                              setErrorWithAutoDismiss(
                                `Cover image upload failed: ${error}`
                              )
                            }}
                            className="mt-2"
                          />
                        ) : (
                          <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3">
                            <p className="mb-2 text-sm text-gray-600">
                              Current cover image:
                            </p>
                            <img
                              src={catalogue.settings.mediaAssets.coverImageUrl}
                              alt="Cover Image"
                              className="h-32 w-full rounded border object-cover"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCatalogue(prev =>
                                  prev
                                    ? {
                                      ...prev,
                                      settings: {
                                        ...prev.settings,
                                        mediaAssets: {
                                          ...prev.settings?.mediaAssets,
                                          coverImageUrl: '',
                                        },
                                      },
                                    }
                                    : null
                                )
                              }
                              className="text-xs"
                            >
                              Change Cover Image
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Company Information */}
                <div id="company-info" className="scroll-mt-6">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                      <span className="text-lg font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Company Information
                      </h3>
                      <p className="text-sm text-gray-500">
                        Tell us about your company
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div>
                      <Label
                        htmlFor="companyName"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Company Name
                      </Label>
                      <Input
                        id="companyName"
                        value={
                          catalogue?.settings?.companyInfo?.companyName || ''
                        }
                        onChange={e =>
                          setCatalogue(prev =>
                            prev
                              ? {
                                ...prev,
                                settings: {
                                  ...(prev.settings || {}),
                                  companyInfo: {
                                    ...(prev.settings?.companyInfo || {}),
                                    companyName: e.target.value,
                                  },
                                },
                              }
                              : null
                          )
                        }
                        placeholder="Your company name"
                        className="mt-2 h-11"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="companyDescription"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Company Description
                      </Label>
                      <Textarea
                        id="companyDescription"
                        value={
                          catalogue?.settings?.companyInfo
                            ?.companyDescription || ''
                        }
                        onChange={e =>
                          setCatalogue(prev =>
                            prev
                              ? {
                                ...prev,
                                settings: {
                                  ...(prev.settings || {}),
                                  companyInfo: {
                                    ...(prev.settings?.companyInfo || {}),
                                    companyDescription: e.target.value,
                                  },
                                },
                              }
                              : null
                          )
                        }
                        placeholder="Describe your company"
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Contact Details */}
                <div id="contact-details" className="scroll-mt-6">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                      <span className="text-lg font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Contact Details
                      </h3>
                      <p className="text-sm text-gray-500">
                        How customers can reach you
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <Label
                          htmlFor="contactEmail"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Email
                        </Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={
                            catalogue?.settings?.contactDetails?.email || ''
                          }
                          onChange={e =>
                            setCatalogue(prev =>
                              prev
                                ? {
                                  ...prev,
                                  settings: {
                                    ...(prev.settings || {}),
                                    contactDetails: {
                                      ...(prev.settings?.contactDetails ||
                                        {}),
                                      email: e.target.value,
                                    },
                                  },
                                }
                                : null
                            )
                          }
                          placeholder="contact@company.com"
                          className="mt-2 h-11"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="contactPhone"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Phone
                        </Label>
                        <Input
                          id="contactPhone"
                          value={
                            catalogue?.settings?.contactDetails?.phone || ''
                          }
                          onChange={e =>
                            setCatalogue(prev =>
                              prev
                                ? {
                                  ...prev,
                                  settings: {
                                    ...(prev.settings || {}),
                                    contactDetails: {
                                      ...(prev.settings?.contactDetails ||
                                        {}),
                                      phone: e.target.value,
                                    },
                                  },
                                }
                                : null
                            )
                          }
                          placeholder="+1 234 567 8900"
                          className="mt-2 h-11"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="contactWebsite"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Website
                        </Label>
                        <Input
                          id="contactWebsite"
                          value={
                            catalogue?.settings?.contactDetails?.website || ''
                          }
                          onChange={e =>
                            setCatalogue(prev =>
                              prev
                                ? {
                                  ...prev,
                                  settings: {
                                    ...(prev.settings || {}),
                                    contactDetails: {
                                      ...(prev.settings?.contactDetails ||
                                        {}),
                                      website: e.target.value,
                                    },
                                  },
                                }
                                : null
                            )
                          }
                          placeholder="https://www.company.com"
                          className="mt-2 h-11"
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="contactAddress"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Address
                      </Label>
                      <Input
                        id="contactAddress"
                        value={
                          (catalogue?.settings as any)?.contactDetails
                            ?.address || ''
                        }
                        onChange={e =>
                          setCatalogue(prev =>
                            prev
                              ? {
                                ...prev,
                                settings: {
                                  ...(prev.settings || {}),
                                  contactDetails: {
                                    ...(prev.settings as any)?.contactDetails,
                                    address: e.target.value,
                                  },
                                },
                              }
                              : null
                          )
                        }
                        placeholder="123 Main Street, City, State 12345"
                        className="mt-2 h-11"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="contactDescription"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Contact Page Description
                      </Label>
                      <Textarea
                        id="contactDescription"
                        value={
                          (catalogue?.settings as any)?.contactDescription || ''
                        }
                        onChange={e =>
                          setCatalogue(prev =>
                            prev
                              ? {
                                ...prev,
                                settings: {
                                  ...(prev.settings || {}),
                                  contactDescription: e.target.value,
                                },
                              }
                              : null
                          )
                        }
                        placeholder="Get in touch with us for more information about our products"
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-700">
                        Contact Page Customization
                      </h4>

                      <div>
                        <Label
                          htmlFor="contactImage"
                          className="text-sm font-medium text-gray-600"
                        >
                          Contact Image
                        </Label>
                        {!(catalogue?.settings as any)?.contactDetails
                          ?.contactImage ? (
                          <FileUpload
                            uploadType="catalogue"
                            catalogueId={catalogueId}
                            maxFiles={1}
                            accept={[
                              'image/jpeg',
                              'image/jpg',
                              'image/png',
                              'image/webp',
                            ]}
                            onUpload={files => {
                              if (files.length > 0) {
                                setCatalogue(prev =>
                                  prev
                                    ? {
                                      ...prev,
                                      settings: {
                                        ...(prev.settings || {}),
                                        contactDetails: {
                                          ...(prev.settings as any)
                                            ?.contactDetails,
                                          contactImage: files[0].url,
                                        },
                                      },
                                    }
                                    : null
                                )
                              }
                            }}
                            onError={error => {
                              setErrorWithAutoDismiss(
                                `Contact image upload failed: ${error}`
                              )
                            }}
                            className="mt-2"
                          />
                        ) : (
                          <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3">
                            <img
                              src={
                                (catalogue.settings as any).contactDetails
                                  .contactImage
                              }
                              alt="Contact"
                              className="h-32 w-full rounded border object-cover"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCatalogue(prev =>
                                  prev
                                    ? {
                                      ...prev,
                                      settings: {
                                        ...(prev.settings || {}),
                                        contactDetails: {
                                          ...(prev.settings as any)
                                            ?.contactDetails,
                                          contactImage: '',
                                        },
                                      },
                                    }
                                    : null
                                )
                              }
                            >
                              Change Image
                            </Button>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="contactQuote"
                          className="text-sm font-medium text-gray-600"
                        >
                          Contact Quote
                        </Label>
                        <Textarea
                          id="contactQuote"
                          value={
                            (catalogue?.settings as any)?.contactDetails
                              ?.contactQuote || ''
                          }
                          onChange={e =>
                            setCatalogue(prev =>
                              prev
                                ? {
                                  ...prev,
                                  settings: {
                                    ...(prev.settings || {}),
                                    contactDetails: {
                                      ...(prev.settings as any)
                                        ?.contactDetails,
                                      contactQuote: e.target.value,
                                    },
                                  },
                                }
                                : null
                            )
                          }
                          placeholder="A meaningful quote for your contact page"
                          rows={2}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="contactQuoteBy"
                          className="text-sm font-medium text-gray-600"
                        >
                          Quote Attribution
                        </Label>
                        <Input
                          id="contactQuoteBy"
                          value={
                            (catalogue?.settings as any)?.contactDetails
                              ?.contactQuoteBy || ''
                          }
                          onChange={e =>
                            setCatalogue(prev =>
                              prev
                                ? {
                                  ...prev,
                                  settings: {
                                    ...(prev.settings || {}),
                                    contactDetails: {
                                      ...(prev.settings as any)
                                        ?.contactDetails,
                                      contactQuoteBy: e.target.value,
                                    },
                                  },
                                }
                                : null
                            )
                          }
                          placeholder="e.g., 'John Smith, CEO'"
                          className="mt-2 h-11"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 5: Social Media */}
                <div id="social-media" className="scroll-mt-6">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg">
                      <span className="text-lg font-bold">5</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Social Media
                      </h3>
                      <p className="text-sm text-gray-500">
                        Connect your social profiles
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label
                          htmlFor="socialFacebook"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Facebook
                        </Label>
                        <Input
                          id="socialFacebook"
                          value={
                            catalogue?.settings?.socialMedia?.facebook || ''
                          }
                          onChange={e =>
                            setCatalogue(prev =>
                              prev
                                ? {
                                  ...prev,
                                  settings: {
                                    ...(prev.settings || {}),
                                    socialMedia: {
                                      ...(prev.settings?.socialMedia || {}),
                                      facebook: e.target.value,
                                    },
                                  },
                                }
                                : null
                            )
                          }
                          placeholder="https://facebook.com/yourpage"
                          className="mt-2 h-11"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="socialTwitter"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Twitter
                        </Label>
                        <Input
                          id="socialTwitter"
                          value={
                            catalogue?.settings?.socialMedia?.twitter || ''
                          }
                          onChange={e =>
                            setCatalogue(prev =>
                              prev
                                ? {
                                  ...prev,
                                  settings: {
                                    ...(prev.settings || {}),
                                    socialMedia: {
                                      ...(prev.settings?.socialMedia || {}),
                                      twitter: e.target.value,
                                    },
                                  },
                                }
                                : null
                            )
                          }
                          placeholder="https://twitter.com/yourhandle"
                          className="mt-2 h-11"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="socialInstagram"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Instagram
                        </Label>
                        <Input
                          id="socialInstagram"
                          value={
                            catalogue?.settings?.socialMedia?.instagram || ''
                          }
                          onChange={e =>
                            setCatalogue(prev =>
                              prev
                                ? {
                                  ...prev,
                                  settings: {
                                    ...(prev.settings || {}),
                                    socialMedia: {
                                      ...(prev.settings?.socialMedia || {}),
                                      instagram: e.target.value,
                                    },
                                  },
                                }
                                : null
                            )
                          }
                          placeholder="https://instagram.com/yourhandle"
                          className="mt-2 h-11"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="socialLinkedin"
                          className="text-sm font-semibold text-gray-700"
                        >
                          LinkedIn
                        </Label>
                        <Input
                          id="socialLinkedin"
                          value={
                            catalogue?.settings?.socialMedia?.linkedin || ''
                          }
                          onChange={e =>
                            setCatalogue(prev =>
                              prev
                                ? {
                                  ...prev,
                                  settings: {
                                    ...(prev.settings || {}),
                                    socialMedia: {
                                      ...(prev.settings?.socialMedia || {}),
                                      linkedin: e.target.value,
                                    },
                                  },
                                }
                                : null
                            )
                          }
                          placeholder="https://linkedin.com/company/yourcompany"
                          className="mt-2 h-11"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t bg-gray-50 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isSaving}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                const success = await saveCatalogue()
                if (success) {
                  setShowEditDialog(false)
                }
              }}
              disabled={isSaving}
              className="h-11 bg-gradient-to-r from-[#2D1B69] to-[#6366F1] px-6 text-white hover:from-[#1E1338] hover:to-[#4F46E5]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="product and category management"
        currentPlan={currentPlan}
      />

      {/* Version conflict dialog */}
      <VersionConflictDialog
        open={showConflictDialog}
        onOpenChange={setShowConflictDialog}
        onReload={() => window.location.reload()}
        onOverwrite={async () => {
          setShowConflictDialog(false)
          await saveCatalogue(true) // Force update
        }}
        updatedAt={conflictData?.updatedAt}
      />
    </div>
  )
}
