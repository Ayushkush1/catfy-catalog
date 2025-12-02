'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Plus,
  Search,
  Book,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Sparkles,
  Globe,
  Lock,
  Calendar,
  Package,
  Palette,
  Layers,
  Star,
  Zap,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import Image from 'next/image'
import { getAllTemplates } from '@/templates'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { isClientAdmin } from '@/lib/client-auth'

interface Catalogue {
  id: string
  name: string
  description: string | null
  quote?: string
  tagline?: string
  isPublic: boolean
  theme: string
  createdAt: string
  updatedAt: string
  _count: {
    products: number
    categories: number
  }
}

interface Template {
  id: string
  name: string
  description: string
  preview?: string
  previewImage?: string
  theme?: string
  category?: string
  isPremium?: boolean
  features?: string[]
}

interface CataloguesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
const availableTemplates: Template[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary design',
    preview: '/templates/modern-preview.jpg',
    theme: 'modern',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional and elegant',
    preview: '/templates/classic-preview.jpg',
    theme: 'classic',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and focused',
    preview: '/templates/minimal-preview.jpg',
    theme: 'minimal',
  },
]

export function CataloguesModal({ open, onOpenChange }: CataloguesModalProps) {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'catalogues' | 'templates'>(
    'catalogues'
  )
  const [previewLoadedMap, setPreviewLoadedMap] = useState<{
    [key: string]: boolean
  }>({})
  const [previewErrorMap, setPreviewErrorMap] = useState<{
    [key: string]: boolean
  }>({})
  const router = useRouter()
  const supabase = createClient()
  const { canCreateCatalogue, currentPlan } = useSubscription()
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  useEffect(() => {
    if (open) {
      loadCatalogues()
      loadTemplates()
    }
  }, [open])

  const loadTemplates = () => {
    try {
      const allTemplates = getAllTemplates()
      setTemplates(allTemplates)
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const loadCatalogues = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/catalogues')
      if (!response.ok) throw new Error('Failed to fetch catalogues')

      const data = await response.json()
      setCatalogues(data.catalogues || [])
    } catch (error) {
      console.error('Error loading catalogues:', error)
      toast.error('Failed to load catalogues')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCatalogue = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create a catalogue')
        return
      }

      const admin = await isClientAdmin()
      if (!admin && !canCreateCatalogue()) {
        toast.error(
          'You have reached the catalogue limit for your current plan.'
        )
        setShowUpgradePrompt(true)
        return
      }

      // Close modal and redirect to catalogue creation wizard
      onOpenChange(false)
      router.push('/catalogue/new')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to navigate to catalogue creation')
    }
  }

  const handleDeleteCatalogue = async (id: string) => {
    if (!confirm('Are you sure you want to delete this catalogue?')) return

    try {
      const response = await fetch(`/api/catalogues/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete catalogue')

      toast.success('Catalogue deleted successfully')
      loadCatalogues()
    } catch (error) {
      console.error('Error deleting catalogue:', error)
      toast.error('Failed to delete catalogue')
    }
  }

  const handleOpenCatalogue = (id: string) => {
    onOpenChange(false)
    router.push(`/catalogue/${id}/preview?mode=edit`)
  }

  const handleUseTemplate = (template: Template) => {
    // Create catalogue with selected template
    handleCreateCatalogueWithTemplate(template.id)
  }

  const handleCreateCatalogueWithTemplate = async (templateId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create a catalogue')
        return
      }

      const admin = await isClientAdmin()
      if (!admin && !canCreateCatalogue()) {
        toast.error(
          'You have reached the catalogue limit for your current plan.'
        )
        setShowUpgradePrompt(true)
        return
      }

      // Close modal and redirect to catalogue creation wizard with template

      router.push(`/catalogue/new?template=${templateId}`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to navigate to catalogue creation')
    }
  }

  const filteredCatalogues = catalogues.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-7xl gap-0 overflow-hidden p-0">
        {/* Header */}
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Create a catalogue
            </DialogTitle>
            <div className="mr-16 flex items-center gap-3">
              <div className="relative min-w-[300px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="What would you like to create?"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="rounded-xl border-gray-300 pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="flex w-72 flex-col overflow-y-auto border-r bg-gradient-to-b from-gray-50 to-white">
            <div className="flex-1 space-y-3 p-6">
              {/* Create Button */}
              <Button
                onClick={handleCreateCatalogue}
                className="h-12 w-full bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-base font-semibold shadow-lg transition-all duration-200 hover:from-[#5558E3] hover:to-[#1e0f4d] hover:shadow-xl"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New
              </Button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-gradient-to-b from-gray-50 to-white px-3 font-medium text-gray-500">
                    Browse
                  </span>
                </div>
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={() => setActiveTab('catalogues')}
                className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'catalogues'
                    ? 'bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-700 hover:bg-white hover:shadow-md'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                    activeTab === 'catalogues'
                      ? 'bg-white/20'
                      : 'bg-gradient-to-br from-blue-50 to-purple-50 group-hover:from-blue-100 group-hover:to-purple-100'
                  }`}
                >
                  <Book
                    className={`h-5 w-5 ${activeTab === 'catalogues' ? 'text-white' : 'text-[#6366F1]'}`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">My Catalogues</div>
                  <div
                    className={`text-xs ${activeTab === 'catalogues' ? 'text-white/80' : 'text-gray-500'}`}
                  >
                    {catalogues.length} project
                    {catalogues.length !== 1 ? 's' : ''}
                  </div>
                </div>
                {activeTab === 'catalogues' && (
                  <Sparkles className="h-4 w-4 text-white/60" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('templates')}
                className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'templates'
                    ? 'bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-700 hover:bg-white hover:shadow-md'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                    activeTab === 'templates'
                      ? 'bg-white/20'
                      : 'bg-gradient-to-br from-amber-50 to-orange-50 group-hover:from-amber-100 group-hover:to-orange-100'
                  }`}
                >
                  <Layers
                    className={`h-5 w-5 ${activeTab === 'templates' ? 'text-white' : 'text-amber-600'}`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">Templates</div>
                  <div
                    className={`text-xs ${activeTab === 'templates' ? 'text-white/80' : 'text-gray-500'}`}
                  >
                    {templates.length} design{templates.length !== 1 ? 's' : ''}
                  </div>
                </div>
                {activeTab === 'templates' && (
                  <Zap className="h-4 w-4 text-white/60" />
                )}
              </button>
            </div>

            {/* Quick Tips - Now at bottom */}
            <div className="p-6 pt-0">
              <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#6366F1] to-[#2D1B69]">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-gray-900">
                      Pro Tip
                    </h4>
                    <p className="text-xs leading-relaxed text-gray-600">
                      Start with a template to create professional catalogues
                      faster!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="p-8">
              {activeTab === 'catalogues' && (
                <>
                  <div className="mb-6">
                    <h2 className="mb-2 text-xl font-semibold text-gray-900">
                      {searchQuery ? 'Search Results' : 'Recent catalogues'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {searchQuery
                        ? `${filteredCatalogues.length} catalogue${filteredCatalogues.length !== 1 ? 's' : ''} found`
                        : 'Continue working on your recent projects'}
                    </p>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {[1, 2, 3, 4].map(i => (
                        <Card key={i} className="border shadow-sm">
                          <CardContent className="p-0">
                            <Skeleton className="h-40 w-full rounded-t-lg" />
                            <div className="p-4">
                              <Skeleton className="mb-2 h-4 w-3/4" />
                              <Skeleton className="h-3 w-full" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredCatalogues.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                        <Book className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-gray-900">
                        No catalogues found
                      </h3>
                      <p className="mx-auto mb-6 max-w-sm text-sm text-gray-600">
                        {searchQuery
                          ? 'Try a different search term or create a new catalogue'
                          : 'Get started by creating your first product catalogue'}
                      </p>
                      {!searchQuery && (
                        <Button
                          onClick={handleCreateCatalogue}
                          className="bg-gradient-to-r from-[#6366F1] to-[#2D1B69] shadow-md hover:from-[#5558E3] hover:to-[#1e0f4d]"
                          size="lg"
                        >
                          <Plus className="mr-2 h-5 w-5" />
                          Create Your First Catalogue
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                      {filteredCatalogues.map(catalogue => (
                        <Card
                          key={catalogue.id}
                          className="group cursor-pointer overflow-hidden border transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl"
                          onClick={() => handleOpenCatalogue(catalogue.id)}
                        >
                          <CardContent className="p-0">
                            {/* Preview Area */}
                            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#6366F1]/20 via-[#2D1B69]/15 to-[#EC4899]/20">
                              {/* Live Preview Iframe */}
                              <div className="absolute inset-0">
                                {!previewLoadedMap[catalogue.id] &&
                                  !previewErrorMap[catalogue.id] && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#6366F1]/10 to-[#2D1B69]/10">
                                      <div className="text-center">
                                        <Book className="mx-auto mb-2 h-16 w-16 animate-pulse text-[#6366F1]/30" />
                                        <p className="text-xs text-gray-500">
                                          Loading preview...
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                {previewErrorMap[catalogue.id] ? (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                    <div className="p-4 text-center">
                                      <Book className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                                      <p className="text-xs text-gray-500">
                                        Preview unavailable
                                      </p>
                                      <p className="mt-1 text-xs text-gray-400">
                                        Click to edit
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <iframe
                                    src={`/catalogue/${catalogue.id}/preview?embed=true`}
                                    className="pointer-events-none h-full w-full border-0"
                                    style={{
                                      width: '400%',
                                      height: '400%',
                                      transform: 'scale(0.25)',
                                      transformOrigin: 'top left',
                                      opacity: previewLoadedMap[catalogue.id]
                                        ? 1
                                        : 0,
                                      transition: 'opacity 0.3s ease-in-out',
                                    }}
                                    title={`Preview of ${catalogue.name}`}
                                    onLoad={e => {
                                      // Check if iframe loaded successfully
                                      const iframe =
                                        e.target as HTMLIFrameElement
                                      try {
                                        // If we can't access contentDocument, it might be a cross-origin issue
                                        // But for same-origin, check if it loaded an error page
                                        const iframeDoc =
                                          iframe.contentDocument ||
                                          iframe.contentWindow?.document
                                        if (iframeDoc) {
                                          const bodyText =
                                            iframeDoc.body?.textContent || ''
                                          if (
                                            bodyText.includes(
                                              'Catalogue Not Found'
                                            ) ||
                                            bodyText.includes('not available')
                                          ) {
                                            setPreviewErrorMap(prev => ({
                                              ...prev,
                                              [catalogue.id]: true,
                                            }))
                                            return
                                          }
                                        }
                                      } catch (e) {
                                        // Cross-origin or other errors - assume it loaded fine
                                      }
                                      setPreviewLoadedMap(prev => ({
                                        ...prev,
                                        [catalogue.id]: true,
                                      }))
                                    }}
                                    onError={() => {
                                      setPreviewErrorMap(prev => ({
                                        ...prev,
                                        [catalogue.id]: true,
                                      }))
                                    }}
                                  />
                                )}
                              </div>

                              {/* Overlay gradient for better visibility */}
                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>

                              {/* Decorative Elements - reduced opacity */}
                              <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 blur-2xl"></div>
                              <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-tr from-blue-400/10 to-purple-400/10 blur-xl"></div>

                              {/* Product Count Badge - visible on hover */}
                              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                                <Badge className="bg-white/90 text-gray-700 shadow-lg backdrop-blur-sm">
                                  {catalogue._count.products} Products
                                </Badge>
                              </div>

                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 transition-all duration-200 group-hover:opacity-100">
                                <div className="absolute right-3 top-3 flex gap-2">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger
                                      asChild
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 bg-white/90 p-0 shadow-lg hover:bg-white"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={e => {
                                          e.stopPropagation()
                                          handleOpenCatalogue(catalogue.id)
                                        }}
                                      >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={e => {
                                          e.stopPropagation()
                                          // Open the preview route in a new tab
                                          window.open(
                                            `/catalogue/${catalogue.id}/preview`,
                                            '_blank'
                                          )
                                        }}
                                      >
                                        <Eye className="mr-2 h-4 w-4" />
                                        Preview
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={e => {
                                          e.stopPropagation()
                                          handleDeleteCatalogue(catalogue.id)
                                        }}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                <div className="absolute bottom-3 left-3 right-3">
                                  <Button
                                    onClick={e => {
                                      e.stopPropagation()
                                      handleOpenCatalogue(catalogue.id)
                                    }}
                                    className="mx-auto flex w-fit bg-white px-4 text-xs font-semibold text-gray-900 shadow-xl hover:bg-gray-100"
                                    size="xs"
                                  >
                                    <Edit className="mr-2 h-3 w-3" />
                                    Edit Catalogue
                                  </Button>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div className="absolute left-3 top-3">
                                {catalogue.isPublic ? (
                                  <Badge className="border-0 bg-emerald-500 text-xs text-white shadow-lg">
                                    <Globe className="mr-1 h-3 w-3" />
                                    Public
                                  </Badge>
                                ) : (
                                  <Badge className="border-0 bg-gray-700 text-xs text-white shadow-lg">
                                    <Lock className="mr-1 h-3 w-3" />
                                    Private
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Info */}
                            <div className="bg-white p-4">
                              <h3 className="text-md mb-1 truncate font-semibold text-gray-900">
                                {catalogue.name}
                              </h3>
                              <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Package className="h-3 w-3" />
                                  <span>{catalogue._count.products}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1 truncate">
                                  <Calendar className="h-3 w-3" />
                                  <span className="truncate">
                                    {formatDistanceToNow(
                                      new Date(catalogue.updatedAt),
                                      { addSuffix: true }
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'templates' && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Templates for you
                    </h2>
                    <p className="text-sm text-gray-600">
                      Choose from {templates.length} professional templates to
                      get started quickly
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {templates.map(template => (
                      <Card
                        key={template.id}
                        className="group overflow-hidden border transition-all duration-200 hover:shadow-xl"
                      >
                        <CardContent className="p-0">
                          {/* Template Preview */}
                          <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-white">
                            {template.previewImage ? (
                              <Image
                                src={template.previewImage}
                                alt={template.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Palette className="h-20 w-20 text-gray-300" />
                              </div>
                            )}

                            {/* Premium Badge */}
                            {template.isPremium && (
                              <div className="absolute right-3 top-3">
                                <Badge className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
                                  <Star className="mr-1 h-3 w-3 fill-white" />
                                  Premium
                                </Badge>
                              </div>
                            )}

                            {/* Category Badge */}
                            {template.category && (
                              <div className="absolute left-3 top-3">
                                <Badge className="bg-white/90 capitalize text-gray-900 shadow-md">
                                  {template.category}
                                </Badge>
                              </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <div className="absolute bottom-4 left-0 right-0 px-4">
                                <Button
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleUseTemplate(template)
                                  }}
                                  className="mx-auto flex w-fit bg-white px-4 text-xs font-semibold text-gray-900 shadow-xl hover:bg-gray-100"
                                  size="xs"
                                >
                                  <Zap className="mr-2 h-3 w-3" />
                                  Use this template
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="bg-white p-4">
                            <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-gray-900">
                              {template.name}
                            </h3>
                            <p className="mb-2 line-clamp-2 text-xs text-gray-600">
                              {template.description}
                            </p>
                            {template.features &&
                              template.features.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {template.features
                                    .slice(0, 3)
                                    .map((feature, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="px-2 py-0 text-xs"
                                      >
                                        {feature}
                                      </Badge>
                                    ))}
                                </div>
                              )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <UpgradePrompt
          isOpen={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          currentPlan={currentPlan}
          feature="additional catalogues"
          title="Catalogue limit reached"
          description="Upgrade your plan to create more catalogues."
        />
      </DialogContent>
    </Dialog>
  )
}
