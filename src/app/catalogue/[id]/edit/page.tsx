'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// import { formatDistanceToNow } from 'date-fns'
import { Header } from '@/components/Header'
import { TeamManagement } from '@/components/TeamManagement'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  FolderOpen,
  Gem,
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
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    priceDisplay: 'show' as 'show' | 'hide' | 'contact',
    categoryId: '',
    isActive: true,
    imageUrl: '',
    tags: [] as string[],
  })
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [selectedThemeCategory, setSelectedThemeCategory] = useState('all')
  const [selectedTheme, setSelectedTheme] = useState('modern')
  const [products, setProducts] = useState<Product[]>([])
  const [smartSortEnabled, setSmartSortEnabled] = useState(false)

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
    } catch (error: any) {
      console.error('Error fetching catalogue:', error)
      setErrorWithAutoDismiss(error.message || 'Failed to load catalogue')
    } finally {
      setIsLoading(false)
    }
  }

  const saveCatalogue = async () => {
    console.log('saveCatalogue called, catalogue state:', catalogue)

    if (!catalogue) {
      console.error('Catalogue is null or undefined')
      toast.error('Catalogue data not loaded. Please refresh the page.')
      return
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
        theme: catalogue.theme,
        settings: catalogue.settings,
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

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save catalogue')
      }

      toast.success('Catalogue saved successfully!')
      await fetchCatalogue()
    } catch (error: any) {
      console.error('Error saving catalogue:', error)
      toast.error(error.message || 'Failed to save catalogue')
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
    setProductForm({
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      priceDisplay:
        (product?.priceDisplay as 'show' | 'hide' | 'contact') || 'show',
      categoryId: product?.categoryId || '',
      isActive: product?.isActive ?? true,
      imageUrl: product?.imageUrl || '',
      tags: product?.tags || [],
    })
    setShowProductDialog(true)
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

  const saveProduct = async () => {
    if (!productForm.name.trim()) {
      toast.error('Product name is required')
      return
    }

    try {
      const url = editingProduct
        ? `/api/catalogues/${catalogueId}/products/${editingProduct.id}`
        : `/api/catalogues/${catalogueId}/products`

      const method = editingProduct ? 'PUT' : 'POST'

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

      toast.success(
        `Product ${editingProduct ? 'updated' : 'created'} successfully!`
      )
      setShowProductDialog(false)
      setProductForm({
        name: '',
        description: '',
        price: 0,
        priceDisplay: 'show' as 'show' | 'hide' | 'contact',
        categoryId: '',
        isActive: true,
        imageUrl: '',
        tags: [],
      })
      setEditingProduct(null)
      await fetchCatalogue()
    } catch (error: any) {
      console.error('Error saving product:', error)
      toast.error(error.message || 'Failed to save product')
    }
  }

  // AI Features
  const handleGenerateDescription = async (product: Product) => {
    setIsGeneratingDescription(true)

    try {
      const response = await fetch('/api/ai/description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${product.name} ${product.tags || ''}`,
        }),
      })

      const data = await response.json()

      if (data.success && data.description) {
        setProductForm(prev => ({ ...prev, description: data.description }))
        toast.success('AI description generated successfully!')
      } else {
        throw new Error(data.error || 'Failed to generate description')
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
  }

  const handleSuggestCategory = async (product: Product) => {
    try {
      const response = await fetch('/api/ai/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `${product.name} ${product.description || ''}`,
        }),
      })

      const data = await response.json()

      if (data.success && data.category) {
        setProductForm(prev => ({ ...prev, categoryId: data.category.id }))
        toast.success('AI category suggestion applied!')
      } else {
        throw new Error(data.error || 'Failed to suggest category')
      }
    } catch (error) {
      console.error('AI Suggestion Error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to suggest category'
      )
    }
  }

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
        <Header title="Edit Catalogue" showGradientBanner={true} />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!catalogue) {
    return (
      <>
        <Header title="Edit Catalogue" showGradientBanner={true} />
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
    <>
      <Header
        title="Edit Catalogue"
        catalogueName={catalogue.name}
        lastUpdated={new Date(catalogue.updatedAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
        showGradientBanner={true}
        onPreview={handlePreview}
        onSave={saveCatalogue}
        isSaving={isSaving}
      />
      <div className="-mt-6 min-h-screen bg-gray-100">
        {/* Main Layout Container */}
        <div className="flex">
          {/* Left Sidebar */}
          <div className="ml-8 min-h-screen w-64 bg-white">
            {/* Navigation */}
            <nav className="p-4">
              <div className="space-y-1">
                {/* Dashboard/Back Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="mb-4 w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-3 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>

                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex w-full items-center px-3 py-3 text-sm font-medium transition-colors ${activeTab === 'overview'
                      ? 'rounded-lg bg-gray-100 text-gray-900'
                      : 'rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Eye className="mr-3 h-4 w-4" />
                  Overview
                </button>

                <button
                  onClick={() => setActiveTab('categories')}
                  className={`flex w-full items-center px-3 py-3 text-sm font-medium transition-colors ${activeTab === 'categories'
                      ? 'rounded-lg bg-gray-100 text-gray-900'
                      : 'rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <FolderOpen className="mr-3 h-4 w-4" />
                  Categories
                  <span
                    className={`ml-auto rounded-full px-2 py-1 text-xs ${activeTab === 'categories'
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-gray-200 text-gray-600'
                      }`}
                  >
                    {catalogue.categories.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex w-full items-center px-3 py-3 text-sm font-medium transition-colors ${activeTab === 'products'
                      ? 'rounded-lg bg-gray-100 text-gray-900'
                      : 'rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Package className="mr-3 h-4 w-4" />
                  Products
                  <span className="ml-auto rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-600">
                    {catalogue.products.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('theme')}
                  className={`flex w-full items-center px-3 py-3 text-sm font-medium transition-colors ${activeTab === 'theme'
                      ? 'rounded-lg bg-gray-100 text-gray-900'
                      : 'rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Palette className="mr-3 h-4 w-4" />
                  Template
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex w-full items-center px-3 py-3 text-sm font-medium transition-colors ${activeTab === 'settings'
                      ? 'rounded-lg bg-gray-100 text-gray-900'
                      : 'rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
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

                    {/* Recent Categories and Quick Actions Layout */}
                    <div className="grid grid-cols-5 gap-6">
                      {/* Recent Categories - Left Column (2/3) */}
                      <div className="col-span-4">
                        <div className="rounded-lg bg-white p-6">
                          <div className="mb-6 flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-[#1A1B41]">
                                Recent Categories
                              </h3>
                              <p className="text-xs text-gray-500">
                                Showing 3 of {catalogue.categories.length}{' '}
                                categories
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="xs"
                              className="border-[#301F70]/20 text-[#301F70] hover:bg-[#301F70]/10"
                              onClick={() => setActiveTab('categories')}
                            >
                              Advanced Search
                            </Button>
                          </div>

                          {catalogue.categories.length === 0 ? (
                            <div className="py-8 text-center">
                              <FolderOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                              <h3 className="mb-2 text-lg font-medium text-gray-900">
                                No categories yet
                              </h3>
                              <p className="mb-4 text-gray-600">
                                Create your first category to organize your
                                products
                              </p>
                              <Button
                                onClick={() => openCategoryDialog()}
                                className="bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Category
                              </Button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                              {catalogue.categories
                                .slice(0, 3)
                                .map(category => {
                                  const categoryProducts =
                                    catalogue.products.filter(
                                      p => p.categoryId === category.id
                                    )
                                  const previewImage = categoryProducts.find(
                                    p => p.imageUrl
                                  )?.imageUrl

                                  return (
                                    <div
                                      key={category.id}
                                      className="group relative transform-gpu cursor-pointer overflow-hidden rounded-2xl border border-gray-200/60 bg-gradient-to-br from-white via-white to-gray-50/50 shadow-md backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#301F70]/10"
                                      onClick={e => {
                                        e.stopPropagation()
                                        openCategoryDialog(category)
                                      }}
                                      style={{
                                        backgroundImage:
                                          'radial-gradient(circle at top right, rgba(48, 31, 112, 0.03), transparent 50%)',
                                      }}
                                    >
                                      {/* Animated Background Effects */}
                                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#301F70]/5 to-[#A2E8DD]/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                      {/* Category Image Section - Reduced height */}
                                      <div className="relative h-32 overflow-hidden rounded-t-2xl bg-gradient-to-br from-gray-50 to-gray-100/80">
                                        {previewImage ? (
                                          <>
                                            <img
                                              src={previewImage}
                                              alt={category.name}
                                              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            />
                                            {/* Image overlay gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                          </>
                                        ) : (
                                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#779CAB]/20 via-[#A2E8DD]/15 to-[#301F70]/10 transition-all duration-500 group-hover:from-[#301F70]/15 group-hover:via-[#A2E8DD]/20 group-hover:to-[#779CAB]/15">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/50 bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:scale-110">
                                              <Package className="h-7 w-7 text-[#1A1B41] transition-colors duration-300 group-hover:text-[#301F70]" />
                                            </div>
                                          </div>
                                        )}

                                        {/* Compact Badge */}
                                        <div className="absolute left-2 top-2">
                                          <Badge
                                            variant="secondary"
                                            className="rounded-full bg-white/60 px-2 py-0.5   text-[10px] text-xs font-medium text-[#1A1B41] shadow-md backdrop-blur-md transition-all duration-300"
                                          >
                                            Public
                                          </Badge>
                                        </div>
                                      </div>

                                      {/* Compact Category Info */}
                                      <div className="relative z-10 p-4">
                                        <div className="mb-3">
                                          <h4 className="mb-2 line-clamp-1 text-sm font-semibold text-[#1A1B41] transition-colors duration-300 group-hover:text-[#301F70]">
                                            {category.name}
                                          </h4>

                                          {/* Compact stats */}
                                          <div className="mb-3 flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-[#A2E8DD] transition-colors duration-300 group-hover:bg-[#301F70]" />
                                            <p className="text-xs font-medium text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                                              {category._count.products}{' '}
                                              {category._count.products === 1
                                                ? 'Product'
                                                : 'Products'}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Compact Product Thumbnails */}
                                        {categoryProducts.length > 0 && (
                                          <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Featured
                                              </p>
                                            </div>
                                            <div className="flex gap-1.5">
                                              {categoryProducts
                                                .slice(0, 3)
                                                .map((product, index) => (
                                                  <div
                                                    key={product.id}
                                                    className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200/60 shadow-sm"
                                                  >
                                                    {product.imageUrl ? (
                                                      <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                      />
                                                    ) : (
                                                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                                                        <Package className="h-3 w-3 text-gray-400" />
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              {categoryProducts.length > 3 && (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200/60 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
                                                  <span className="text-xs font-medium text-gray-600">
                                                    +
                                                    {categoryProducts.length -
                                                      3}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* Compact footer - only show on hover */}
                                        <div className="mt-3 border-t border-gray-100/80 opacity-0 transition-all duration-300 group-hover:opacity-100">
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                              Click to edit
                                            </span>
                                            <div className="text-xs font-medium text-[#301F70]">
                                              Edit Category
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
                      </div>

                      {/* Quick Actions - Right Column (1/3) - Remove background */}
                      <div className="col-span-1">
                        <div className="px-1">
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-[#1A1B41]">
                              Quick Actions
                            </h3>
                            <p className="text-xs text-gray-500">
                              Tasks for managing your catalogue
                            </p>
                          </div>
                          <div className="space-y-3">
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

                {/* Settings Tab */}
                {activeTab === 'settings' && (
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Update category information'
                : 'Create a new category for your products'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={e =>
                  setCategoryForm(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter category name"
              />
            </div>

            <div>
              <Label htmlFor="categoryDescription">Description</Label>
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
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCategoryDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveCategory}>
              {editingCategory ? 'Update' : 'Create'} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="h-full max-h-[95vh] max-w-2xl overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update product information'
                : 'Add a new product to your catalogue'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={productForm.name}
                onChange={e =>
                  setProductForm(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter product name"
              />
            </div>

            <div>
              <Label htmlFor="productDescription">Description</Label>
              <div className="space-y-2">
                <Textarea
                  id="productDescription"
                  value={productForm.description}
                  onChange={e =>
                    setProductForm(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter product description"
                  rows={3}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="w-fit border-blue-400/20 bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-xs text-blue-600"
                  disabled={isGeneratingDescription || !productForm.name.trim()}
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
                        setProductForm(prev => ({
                          ...prev,
                          description: data.description,
                        }))
                        toast.success('AI description generated successfully!')
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

            <div>
              <Label className="mb-2 block text-sm font-medium">
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
                      setProductForm(prev => ({
                        ...prev,
                        imageUrl: files[0].url,
                      }))
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
                  <p className="mb-2 text-sm text-gray-600">Current image:</p>
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
                      setProductForm(prev => ({ ...prev, imageUrl: '' }))
                    }
                    className="text-xs"
                  >
                    Change Image
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="productTags">Tags</Label>
              <Input
                id="productTags"
                value={productForm.tags?.join(', ') || ''}
                onChange={e => {
                  const tagsArray = e.target.value
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0)
                  setProductForm(prev => ({ ...prev, tags: tagsArray }))
                }}
                placeholder="Enter tags separated by commas (e.g., electronics, gadgets, premium)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productPrice">Price</Label>
                <Input
                  id="productPrice"
                  type="number"
                  value={productForm.price}
                  onChange={e =>
                    setProductForm(prev => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="productPriceDisplay">Price Display</Label>
                <Select
                  value={productForm.priceDisplay}
                  onValueChange={(value: 'show' | 'hide' | 'contact') =>
                    setProductForm(prev => ({ ...prev, priceDisplay: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select price display" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="show">Show Price</SelectItem>
                    <SelectItem value="hide">Hide Price</SelectItem>
                    <SelectItem value="contact">Contact for Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productCategory">Category</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={productForm.categoryId}
                    onValueChange={value =>
                      setProductForm(prev => ({ ...prev, categoryId: value }))
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogue.categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    className="border-blue-400/20 bg-blue-500/10 text-xs text-blue-600"
                    disabled={!productForm.name || !productForm.description}
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/ai/category', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            text: `${productForm.name} ${productForm.description}`,
                            existingCategories: catalogue.categories,
                          }),
                        })

                        const data = await response.json()

                        if (data.success && data.category) {
                          setProductForm(prev => ({
                            ...prev,
                            categoryId: data.category.id,
                          }))
                          toast.success('Category suggested successfully!')
                        } else {
                          throw new Error(
                            data.error || 'Failed to suggest category'
                          )
                        }
                      } catch (error) {
                        console.error('AI Category Suggestion Error:', error)
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
                        <Sparkles className="mr-1 h-3 w-3" /> Suggest Category
                      </>
                    )}
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter product name and description first for better category
                  suggestions
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="productActive"
                  checked={productForm.isActive}
                  onCheckedChange={checked =>
                    setProductForm(prev => ({ ...prev, isActive: checked }))
                  }
                />
                <Label htmlFor="productActive">Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProductDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveProduct}>
              {editingProduct ? 'Update' : 'Add'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Settings</DialogTitle>
            <DialogDescription>
              Configure display and visibility settings for your catalogue
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Display Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Display Settings</h3>

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
                  <Label className="text-base font-medium">Allow Search</Label>
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

            {/* Visibility Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Visibility Settings</h3>

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
                  onCheckedChange={checked =>
                    setCatalogue(prev =>
                      prev ? { ...prev, isPublic: checked } : null
                    )
                  }
                />
              </div>
              <p className="text-sm text-gray-600">
                {catalogue?.isPublic
                  ? 'Public - Visible to everyone'
                  : 'Private - Only visible to you'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(false)}
            >
              Cancel
            </Button>
            <Button
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
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Catalogue Details</DialogTitle>
            <DialogDescription>
              Update your catalogue branding and information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div>
                <Label htmlFor="catalogueName">Catalogue Name</Label>
                <Input
                  id="catalogueName"
                  value={catalogue?.name || ''}
                  onChange={e =>
                    setCatalogue(prev =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  placeholder="Enter catalogue name"
                />
              </div>

              <div>
                <Label htmlFor="catalogueDescription">Description</Label>
                <Textarea
                  id="catalogueDescription"
                  value={catalogue?.description || ''}
                  onChange={e =>
                    setCatalogue(prev =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  placeholder="Describe your catalogue"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="catalogueTagline">Tagline</Label>
                <Input
                  id="catalogueTagline"
                  value={catalogue?.tagline || ''}
                  onChange={e =>
                    setCatalogue(prev =>
                      prev ? { ...prev, tagline: e.target.value } : null
                    )
                  }
                  placeholder="Enter a catchy tagline for your catalogue"
                />
              </div>

              <div>
                <Label htmlFor="catalogueQuote">Quote</Label>
                <Textarea
                  id="catalogueQuote"
                  value={catalogue?.quote || ''}
                  onChange={e =>
                    setCatalogue(prev =>
                      prev ? { ...prev, quote: e.target.value } : null
                    )
                  }
                  placeholder="Enter an inspiring quote for your catalogue"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="catalogueYear">Catalogue Year</Label>
                <Input
                  id="catalogueYear"
                  value={(catalogue as any)?.year || ''}
                  onChange={e =>
                    setCatalogue(prev =>
                      prev ? ({ ...prev, year: e.target.value } as any) : null
                    )
                  }
                  placeholder="2025"
                />
              </div>

              <div>
                <Label className="mb-2 block text-sm font-medium">
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
                          prev ? { ...prev, introImage: files[0].url } : null
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

            {/* Media & Assets */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Media & Assets</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label className="mb-2 block text-sm font-medium">
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
                        setErrorWithAutoDismiss(`Logo upload failed: ${error}`)
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

            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={catalogue?.settings?.companyInfo?.companyName || ''}
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
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <Label htmlFor="companyDescription">
                    Company Description
                  </Label>
                  <Textarea
                    id="companyDescription"
                    value={
                      catalogue?.settings?.companyInfo?.companyDescription || ''
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
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={catalogue?.settings?.contactDetails?.email || ''}
                    onChange={e =>
                      setCatalogue(prev =>
                        prev
                          ? {
                            ...prev,
                            settings: {
                              ...(prev.settings || {}),
                              contactDetails: {
                                ...(prev.settings?.contactDetails || {}),
                                email: e.target.value,
                              },
                            },
                          }
                          : null
                      )
                    }
                    placeholder="contact@company.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    value={catalogue?.settings?.contactDetails?.phone || ''}
                    onChange={e =>
                      setCatalogue(prev =>
                        prev
                          ? {
                            ...prev,
                            settings: {
                              ...(prev.settings || {}),
                              contactDetails: {
                                ...(prev.settings?.contactDetails || {}),
                                phone: e.target.value,
                              },
                            },
                          }
                          : null
                      )
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="contactWebsite">Website</Label>
                  <Input
                    id="contactWebsite"
                    value={catalogue?.settings?.contactDetails?.website || ''}
                    onChange={e =>
                      setCatalogue(prev =>
                        prev
                          ? {
                            ...prev,
                            settings: {
                              ...(prev.settings || {}),
                              contactDetails: {
                                ...(prev.settings?.contactDetails || {}),
                                website: e.target.value,
                              },
                            },
                          }
                          : null
                      )
                    }
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>

              {/* Address and Contact Description */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="contactAddress">Address</Label>
                  <Input
                    id="contactAddress"
                    value={
                      (catalogue?.settings as any)?.contactDetails?.address ||
                      ''
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
                  />
                </div>

                <div>
                  <Label htmlFor="contactDescription">
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
                  />
                </div>
              </div>

              {/* Contact Page Customization */}
              <div className="space-y-4">
                <h4 className="text-md font-medium">
                  Contact Page Customization
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {/* Contact Image */}
                  <div>
                    <Label className="mb-2 block text-sm font-medium">
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
                        <p className="mb-2 text-sm text-gray-600">
                          Current contact image:
                        </p>
                        <img
                          src={
                            (catalogue.settings as any).contactDetails
                              .contactImage
                          }
                          alt="Contact Image"
                          className="h-24 w-32 rounded border object-cover"
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
                          className="text-xs"
                        >
                          Change Contact Image
                        </Button>
                      </div>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Upload an image to display on the contact page (e.g.,
                      office, team photo, or workspace)
                    </p>
                  </div>

                  {/* Contact Quote */}
                  <div>
                    <Label htmlFor="contactQuote">Contact Quote</Label>
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
                                  ...(prev.settings as any)?.contactDetails,
                                  contactQuote: e.target.value,
                                },
                              },
                            }
                            : null
                        )
                      }
                      placeholder="Enter an inspiring quote for the contact page (e.g., 'Where creativity meets craftsmanship')"
                      rows={2}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      A quote or message that will be displayed over the contact
                      image
                    </p>
                  </div>

                  {/* Contact Quote By */}
                  <div>
                    <Label htmlFor="contactQuoteBy">Quote Attribution</Label>
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
                                  ...(prev.settings as any)?.contactDetails,
                                  contactQuoteBy: e.target.value,
                                },
                              },
                            }
                            : null
                        )
                      }
                      placeholder="Enter who the quote is from (e.g., 'John Smith, CEO' or 'COMPANY NAME')"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Attribution for the contact quote (company name, founder,
                      or team member)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Social Media</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="socialFacebook">Facebook</Label>
                  <Input
                    id="socialFacebook"
                    value={catalogue?.settings?.socialMedia?.facebook || ''}
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
                  />
                </div>

                <div>
                  <Label htmlFor="socialTwitter">Twitter</Label>
                  <Input
                    id="socialTwitter"
                    value={catalogue?.settings?.socialMedia?.twitter || ''}
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
                  />
                </div>

                <div>
                  <Label htmlFor="socialInstagram">Instagram</Label>
                  <Input
                    id="socialInstagram"
                    value={catalogue?.settings?.socialMedia?.instagram || ''}
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
                  />
                </div>

                <div>
                  <Label htmlFor="socialLinkedin">LinkedIn</Label>
                  <Input
                    id="socialLinkedin"
                    value={catalogue?.settings?.socialMedia?.linkedin || ''}
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
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowEditDialog(false)
                saveCatalogue()
              }}
            >
              Save Changes
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
    </>
  )
}
