'use client'

import {
  Plus,
  Eye,
  Crown,
  CheckCircle2,
  Share2,
  MoreVertical,
  Trash2,
  Edit,
  Palette,
  FolderOpen,
  ArrowRight,
  Book,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Poppins } from 'next/font/google'
import { toast } from 'sonner'
import { isClientAdmin } from '@/lib/client-auth'
import { formatDistanceToNow, format } from 'date-fns'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { CataloguesModal } from '@/components/dashboard/CataloguesModal'
import { ShareDialog } from '@/components/shared/ShareDialog'
import Head from 'next/head'
import { SubscriptionPlan } from '@prisma/client'

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

interface UserProfile {
  id: string
  fullName: string
  accountType: 'INDIVIDUAL' | 'BUSINESS'
  subscription: {
    plan: 'FREE' | 'MONTHLY' | 'YEARLY'
    status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE'
    currentPeriodEnd: string | null
  } | null
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  isPremium: boolean
  version: string
  previewImage: string | null
  features: string[]
  tags: string[]
  pageCount: number
  supportedFields: {
    products: string[]
    categories: string[]
    profile: string[]
  }
  compatibleThemes: string[]
  requiredThemeFeatures: string[]
  customProperties: any
  createdAt: string
  updatedAt: string
}

export default function ProjectsPage() {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  )
  const [activeTab, setActiveTab] = useState('projects')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCataloguesModal, setShowCataloguesModal] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProjectsData()

    // Add custom animations
    const style = document.createElement('style')
    style.textContent = `
      @keyframes float {
        0%, 100% {
          transform: translateY(0px) rotate(var(--rotation, 0deg));
        }
        50% {
          transform: translateY(-5px) rotate(var(--rotation, 0deg));
        }
      }

      @keyframes floatReverse {
        0%, 100% {
          transform: translateY(0px) rotate(var(--rotation, 0deg));
        }
        50% {
          transform: translateY(5px) rotate(var(--rotation, 0deg));
        }
      }

      @keyframes slowSpin {
        from {
          transform: rotate(0deg) translateY(var(--float-y, 0px));
        }
        to {
          transform: rotate(360deg) translateY(var(--float-y, 0px));
        }
      }

      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }

      @keyframes glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.1), 0 0 40px rgba(147, 51, 234, 0.1);
        }
        50% {
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.2), 0 0 60px rgba(147, 51, 234, 0.2);
        }
      }

      @keyframes pulseGlow {
        0%, 100% {
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          transform: scale(1);
        }
        50% {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(147, 51, 234, 0.4);
          transform: scale(1.05);
        }
      }

      @keyframes gentleBob {
        0%, 100% { transform: translateY(0px); }
        25% { transform: translateY(-3px); }
        75% { transform: translateY(3px); }
      }

      @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0); }
        50% { opacity: 1; transform: scale(1); }
      }

      @keyframes breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      @keyframes pulseSlow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }

      .animate-float {
        animation: float 4s ease-in-out infinite;
      }

      .animate-float-reverse {
        animation: floatReverse 3.5s ease-in-out infinite;
      }

      .animate-float.delay-500 {
        animation-delay: 0.5s;
      }

      .animate-float.delay-1000 {
        animation-delay: 1s;
      }

      .animate-slow-spin {
        animation: slowSpin 20s linear infinite;
      }

      .animate-shimmer {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        background-size: 200% 100%;
        animation: shimmer 3s infinite;
      }

      .animate-glow {
        animation: glow 4s ease-in-out infinite;
      }

      .animate-pulse-slow {
        animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      .animate-pulse-glow {
        animation: pulseGlow 3s ease-in-out infinite;
      }

      .animate-gentle-bob {
        animation: gentleBob 2.5s ease-in-out infinite;
      }

      .animate-sparkle {
        animation: sparkle 2s ease-in-out infinite;
      }

      .animate-breathe {
        animation: breathe 4s ease-in-out infinite;
      }

      .animate-pulse-slow {
        animation: pulseSlow 3s ease-in-out infinite;
      }
    `
    document.head.appendChild(style)

    return () => {
      if (document.head.contains(style)) document.head.removeChild(style)
    }
  }, [])

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
      router.push('/catalogue/new')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to navigate to catalogue creation')
    }
  }

  const loadProjectsData = async () => {
    try {
      setIsLoading(true)

      // Load user profile
      const profileResponse = await fetch('/api/auth/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData.profile)
      }

      // Load catalogues
      const cataloguesResponse = await fetch('/api/catalogues')
      if (cataloguesResponse.ok) {
        const cataloguesData = await cataloguesResponse.json()
        setCatalogues(cataloguesData.catalogues)
      }

      // Load templates
      const templatesResponse = await fetch('/api/templates')
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json()
        setTemplates(templatesData.templates)
      }
    } catch (err) {
      setError('Failed to load projects data')
      console.error('Projects error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCatalogue = async (catalogueId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this project? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/catalogues/${catalogueId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCatalogues(prev => prev.filter(cat => cat.id !== catalogueId))
        toast.success('Project deleted successfully')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete project')
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete project'
      )
    }
  }

  const shareCatalogue = async (catalogue: Catalogue) => {
    if (!catalogue.isPublic) {
      toast.error('Only public projects can be shared')
      return
    }

    const shareUrl = `${window.location.origin}/preview/${catalogue.id}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied to clipboard!')
    } catch (err) {
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Share link copied to clipboard!')
    }
  }

  const createFromTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setShowCataloguesModal(true)
  }

  const { canCreateCatalogue } = useSubscription()
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareDialogUrl, setShareDialogUrl] = useState('')
  const [shareDialogName, setShareDialogName] = useState('')

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-blue-50">
        <div className="ml-24 flex-1">
          <DashboardHeader title="My Projects" />
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-blue-50">
      <div className="ml-20 flex-1">
        <DashboardHeader
          title="My Projects"
          subtitle="Manage your catalogue projects and templates"
        />

        <div className="px-8 pb-10 pt-5">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-8 flex h-12 w-full items-center justify-between bg-transparent">
              <div className="rounded-2xl bg-white p-1.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <TabsTrigger
                    value="projects"
                    className="flex items-center gap-2 rounded-xl px-10 py-2.5 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6366F1] data-[state=active]:to-[#2D1B69] data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span>My Projects</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="templates"
                    className="flex items-center gap-2 rounded-xl px-10 py-2.5 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6366F1] data-[state=active]:to-[#2D1B69] data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    <Palette className="h-4 w-4" />
                    <span>Templates</span>
                  </TabsTrigger>
                </div>
              </div>

              <div className="flex items-center">
                <Button
                  size="sm"
                  className="ml-4 h-10 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] px-4 pr-5 text-white shadow-md hover:from-[#5558E3] hover:to-[#1e0f4d]"
                  onClick={handleCreateCatalogue}
                >
                  <Plus className="mr-2 h-5 w-4" />
                  New Catalogue
                </Button>
              </div>
            </TabsList>

            <TabsContent value="projects" className="mt-0">
              {/* Projects Grid */}
              <div className="mb-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Your Projects
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Manage and create your catalogue projects
                    </p>
                  </div>
                </div>

                {catalogues.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {catalogues.map(catalogue => (
                      <Card
                        key={catalogue.id}
                        className="group relative cursor-pointer overflow-hidden rounded-[1.6rem]  bg-white  shadow-sm transition-all duration-300 hover:shadow-2xl "
                        onClick={() =>
                          router.push(
                            `/catalogue/${catalogue.id}/preview?mode=edit`
                          )
                        }
                      >
                        <div className="relative h-36 rounded-[2rem] bg-gradient-to-br from-gray-50/30 to-white/50 px-3 py-4 md:h-40 lg:h-56">
                          <iframe
                            src={`/catalogue/${catalogue.id}/preview?embed=true`}
                            className="scrollbar-hide h-full w-full overflow-hidden rounded-[3rem] border-0 shadow-inner"
                            style={{
                              width: '400%',
                              height: '410%',
                              transform: 'scale(0.25)',
                              transformOrigin: 'top left',
                              opacity: 1,
                              transition: 'opacity 0.3s ease-in-out',
                            }}
                            title={`Preview of ${catalogue.name}`}
                          />
                          {/* Action buttons - visible on hover */}
                          <div className="duration-400 absolute right-4 top-3 flex translate-x-3 gap-1.5 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="xs"
                              className="h-7 w-7 border border-blue-100/50 bg-white/90 p-1.5 text-blue-600 shadow-md backdrop-blur-md transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                              onClick={(e: any) => {
                                e.stopPropagation()
                                router.push(
                                  `/catalogue/${catalogue.id}/preview?mode=edit`
                                )
                              }}
                              title="Edit Project"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              className="h-7 w-7 border border-green-100/50 bg-white/90 p-1.5 text-green-600 shadow-md backdrop-blur-md transition-all duration-200 hover:bg-green-50 hover:text-green-700"
                              onClick={(e: any) => {
                                e.stopPropagation()
                                if (!catalogue.isPublic) return
                                setShareDialogUrl(
                                  `${typeof window !== 'undefined' ? window.location.origin : ''}/preview/${catalogue.id}`
                                )
                                setShareDialogName(catalogue.name)
                                setShareDialogOpen(true)
                              }}
                              disabled={!catalogue.isPublic}
                              title="Share Project"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              className="h-7 w-7 border border-red-100/50 bg-white/90 p-1.5 text-red-600 shadow-md backdrop-blur-md transition-all duration-200 hover:bg-red-50 hover:text-red-700"
                              onClick={(e: any) => {
                                e.stopPropagation()
                                deleteCatalogue(catalogue.id)
                              }}
                              title="Delete Project"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <CardContent className="p-0 px-4 pb-4">
                          <div className="">
                            <h3 className="text-md font-semibold text-gray-900">
                              {catalogue.name}
                            </h3>
                          </div>

                          {catalogue.description && (
                            <p className="mb-2 text-xs  text-gray-600">
                              {catalogue.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-[10px]">
                            <Badge
                              className={`rounded-full px-2.5 py-[2px] pr-3 text-[10px] font-medium ${
                                catalogue.isPublic
                                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              <div className="mr-1 flex items-center justify-center">
                                ●
                              </div>
                              <div>
                                {catalogue.isPublic ? 'Public' : 'Private'}
                              </div>
                            </Badge>
                            <span className="flex items-center gap-1 text-gray-500">
                              <Edit className="h-3 w-3" />
                              Edited{' '}
                              {formatDistanceToNow(
                                new Date(catalogue.updatedAt),
                                { addSuffix: true }
                              )}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="rounded-3xl border-0 bg-white p-12 text-center shadow-lg">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <FolderOpen className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          No projects yet
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Choose a template above to create your first catalogue
                          project
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="mt-0">
              {/* Templates Section */}
              <div className="mb-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Available Templates
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Choose from professional templates to start your project
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {templates
                    .filter(template => {
                      // Filter out test templates - add template IDs or names to exclude here
                      const testTemplateIds: string[] = [
                        // example: 'test-template-id'
                      ]

                      const testTemplateNames: string[] = [
                        // Exclude known test templates by display name
                        'Test Template',
                      ]

                      return (
                        !testTemplateIds.includes(template.id) &&
                        !testTemplateNames.includes(template.name)
                      )
                    })
                    .map(template => {
                      const getTemplateDisplayName = (template: Template) => {
                        // Map template IDs to user-friendly names
                        const nameMap: Record<string, string> = {
                          'furniture-catalog': 'Furniture Catalogue',
                          'fashion-catalogue': 'Fashion Catalogue',
                          'skincare-catalogue': 'Skincare Catalogue',
                          'fmcg-catalogue': 'FMCG Catalogue',
                          'home-decor-catalogue': 'Home Decor Catalogue',
                        }
                        return nameMap[template.id] || template.name
                      }

                      const getTemplateDescription = (template: Template) => {
                        // Provide better descriptions for real templates
                        const descMap: Record<string, string> = {
                          'furniture-catalog':
                            'Professional furniture catalogue with modern design',
                          'fashion-catalogue':
                            'Elegant fashion catalogue showcasing clothing collections',
                          'skincare-catalogue':
                            'Beautiful skincare product catalogue with clean aesthetics',
                          'fmcg-catalogue':
                            'Comprehensive FMCG product catalogue for retail',
                          'home-decor-catalogue':
                            'Stunning home decor catalogue with lifestyle imagery',
                        }
                        return descMap[template.id] || template.description
                      }

                      return (
                        <Card
                          key={template.id}
                          className="group overflow-hidden rounded-3xl border transition-all duration-200 hover:shadow-xl"
                        >
                          <CardContent className="p-0">
                            {/* Template Preview */}
                            <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-white">
                              {template.previewImage ? (
                                <img
                                  src={template.previewImage}
                                  alt={template.name}
                                  className="h-full w-full object-cover"
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
                                    <Crown className="mr-1 h-3 w-3" />
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
                                    onClick={() => createFromTemplate(template)}
                                    className="mx-auto flex w-fit bg-white px-4 text-xs font-semibold text-gray-900 shadow-xl hover:bg-gray-100"
                                    size="xs"
                                  >
                                    <Plus className="mr-2 h-3 w-3" />
                                    Use Template
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Info */}
                            <div className="bg-white p-4">
                              <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-gray-900">
                                {getTemplateDisplayName(template)}
                              </h3>
                              <p className="mb-2 line-clamp-2 text-xs text-gray-600">
                                {getTemplateDescription(template)}
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
                      )
                    })}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Catalogues Modal */}
          <CataloguesModal
            open={showCataloguesModal}
            onOpenChange={setShowCataloguesModal}
          />

          {/* Share Dialog (controlled) */}
          <ShareDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            shareUrl={shareDialogUrl}
            catalogueName={shareDialogName}
          />

          {/* Upgrade Prompt Modal */}
          <UpgradePrompt
            isOpen={showUpgradePrompt}
            onClose={() => setShowUpgradePrompt(false)}
            feature="projects"
            currentPlan={(() => {
              // Map the simple profile plan string to the Prisma SubscriptionPlan enum
              const planStr = profile?.subscription?.plan
              switch (planStr) {
                case 'FREE':
                  return SubscriptionPlan.FREE
                case 'MONTHLY':
                  return SubscriptionPlan.STANDARD
                case 'YEARLY':
                  return SubscriptionPlan.PROFESSIONAL
                default:
                  return SubscriptionPlan.FREE
              }
            })()}
          />
        </div>
      </div>
    </div>
  )
}
