'use client'

import {
  Plus,
  Package,
  Eye,
  TrendingUp,
  Crown,
  Calendar,
  Sparkles,
  Book,
  Clock,
  FileText,
  ArrowRight,
  DollarSign,
  ShoppingCart,
  Download,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Share2,
  MoreVertical,
  Trash2,
  Edit,
  Palette,
  FolderOpen,
  Zap,
  Star,
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import Image from 'next/image'
import { formatDistanceToNow, format } from 'date-fns'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { CataloguesModal } from '@/components/dashboard/CataloguesModal'

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

interface DashboardStats {
  totalCatalogues: number
  totalProducts: number
  totalViews: number
  totalExports: number
  totalProjects?: number
  activeTools?: number
}

interface RecentItem {
  id: string
  type: 'CATALOGUE' | 'PDF'
  name: string
  description?: string
  updatedAt: string
  productCount?: number
  theme?: string
}

export default function DashboardPage() {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [error, setError] = useState('')
  const [showCataloguesModal, setShowCataloguesModal] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()

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
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  const loadDashboardData = async () => {
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

        // Calculate basic stats
        const totalProducts = cataloguesData.catalogues.reduce(
          (sum: number, cat: Catalogue) => sum + (cat._count?.products || 0),
          0
        )
        setStats({
          totalCatalogues: cataloguesData.catalogues.length,
          totalProducts,
          totalViews: 0, // Would come from analytics
          totalExports: 0, // Would come from exports table
          totalProjects: cataloguesData.catalogues.length,
          activeTools: 2, // Catalogue and PDF Editor
        })

        // Get recent items (last 6 updated catalogues)
        const recent = cataloguesData.catalogues
          .sort((a: Catalogue, b: Catalogue) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          .slice(0, 6)
          .map((cat: Catalogue) => ({
            id: cat.id,
            type: 'CATALOGUE' as const,
            name: cat.name,
            description: cat.description,
            updatedAt: cat.updatedAt,
            productCount: cat._count?.products || 0,
            theme: cat.theme,
          }))
        setRecentItems(recent)
      }
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCatalogue = async (catalogueId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this catalogue? This action cannot be undone.'
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
        toast.success('Catalogue deleted successfully')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete catalogue')
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete catalogue'
      )
    }
  }

  const shareCatalogue = async (catalogue: Catalogue) => {
    if (!catalogue.isPublic) {
      toast.error('Only public catalogues can be shared')
      return
    }

    const shareUrl = `${window.location.origin}/preview/${catalogue.id}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied to clipboard!')
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Share link copied to clipboard!')
    }
  }

  const exportToPDF = async (catalogueId: string) => {
    if (!canExport()) {
      setShowUpgradePrompt(true)
      return
    }

    try {
      toast.loading('Generating PDF...', { id: 'pdf-export' })

      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          catalogueId,
          theme: 'modern',
          format: 'A4',
          orientation: 'portrait',
        }),
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type')

        if (contentType && contentType.includes('application/pdf')) {
          // Direct PDF download for public catalogues
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `catalogue-${catalogueId}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          toast.success('PDF exported successfully!', { id: 'pdf-export' })
        } else {
          // JSON response with download URL for authenticated users
          const data = await response.json()
          if (data.export?.downloadUrl) {
            // Open download URL in new tab
            window.open(data.export.downloadUrl, '_blank')
            toast.success('PDF exported successfully!', { id: 'pdf-export' })
          } else {
            throw new Error('No download URL received')
          }
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to export PDF')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export PDF', {
        id: 'pdf-export',
      })
    }
  }

  const filteredCatalogues = catalogues.filter(catalogue => {
    const matchesSearch =
      catalogue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catalogue.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'public' && catalogue.isPublic) ||
      (filterType === 'private' && !catalogue.isPublic)

    return matchesSearch && matchesFilter
  })

  const { currentPlan, canCreateCatalogue, canExport } = useSubscription()
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  // Computed values for the UI
  const catalogueCount = stats?.totalCatalogues || 0
  const productCount = stats?.totalProducts || 0

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#F7F8FC]">
        <div className="ml-32 flex-1">
          <DashboardHeader />
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
    <div className="flex min-h-screen bg-[#E8EAF6]">
      <div className="ml-24 flex-1">
        <DashboardHeader />

        <div className="p-8">


          {/* Bills Section - Top Cards */}
          {stats && (
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Overview</h2>

              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {/* Total Catalogues - Blue theme */}
                <Card className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 shadow-md transition-all hover:shadow-xl hover:scale-[1.01]">
                  {/* subtle animated blob */}
                  <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-blue-200/40 blur-2xl animate-float" />

                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      {/* Left: Icon + Title */}
                      <div className="flex flex-col gap-3">
                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center animate-gentle-bob">
                          <Book className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-4xl font-extrabold text-gray-900">{catalogueCount}</h3>
                          <p className="mt-2 text-sm text-gray-600 font-semibold">Total Catalogues</p>
                          <p className="mt-0.5 text-xs text-gray-400">Active projects</p>
                        </div>
                      </div>

                      {/* Right: Circular Progress - Completion Rate */}
                      <div className="relative h-16 w-16">
                        <svg className="h-full w-full -rotate-90 transform">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#E0E7FF"
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#3B82F6"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - (catalogueCount > 0 && productCount > 0 ? Math.min((catalogues.filter(c => c._count?.products > 0).length / catalogueCount), 1) : 0))}`}
                            strokeLinecap="round"
                            className="animate-pulse-slow"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-blue-600">
                          {catalogueCount > 0 && productCount > 0 ? Math.round((catalogues.filter(c => c._count?.products > 0).length / catalogueCount) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Products - Green theme */}
                <Card className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-green-50/50 via-white to-green-50/30 shadow-md transition-all hover:shadow-xl hover:scale-[1.01]">
                  <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-green-200/40 blur-2xl animate-float-reverse" />

                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-3">
                        <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center animate-gentle-bob">
                          <Package className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-4xl font-extrabold text-gray-900">{productCount}</h3>
                          <p className="mt-2 text-sm text-gray-600 font-semibold">Total Products</p>
                          <p className="mt-0.5 text-xs text-gray-400">Across catalogues</p>
                        </div>
                      </div>

                      {/* Average Products per Catalogue */}
                      <div className="relative h-16 w-16">
                        <svg className="h-full w-full -rotate-90 transform">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#D1FAE5"
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#10B981"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - (catalogueCount > 0 ? Math.min((productCount / catalogueCount) / 20, 1) : 0))}`}
                            strokeLinecap="round"
                            className="animate-pulse-slow"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-green-600">
                          {catalogueCount > 0 ? Math.round((productCount / catalogueCount) * 100 / 20) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity - Red theme */}
                <Card className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-red-50/50 via-white to-red-50/30 shadow-md transition-all hover:shadow-xl hover:scale-[1.01]">
                  <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-red-200/40 blur-2xl animate-slow-spin" />

                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-3">
                        <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center animate-gentle-bob">
                          <Clock className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-4xl font-extrabold text-gray-900">{recentItems.length}</h3>
                          <p className="mt-2 text-sm text-gray-600 font-semibold">Recent Updates</p>
                          <p className="mt-0.5 text-xs text-gray-400">Last 7 days</p>
                        </div>
                      </div>

                      {/* Activity Rate - Projects updated recently */}
                      <div className="relative h-16 w-16">
                        <svg className="h-full w-full -rotate-90 transform">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#FEE2E2"
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#EF4444"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - (catalogueCount > 0 ? Math.min(recentItems.length / catalogueCount, 1) : 0))}`}
                            strokeLinecap="round"
                            className="animate-pulse-slow"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-red-600">
                          {catalogueCount > 0 ? Math.round((recentItems.length / catalogueCount) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Platform Tools - Purple theme */}
                <Card className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30 shadow-md transition-all hover:shadow-xl hover:scale-[1.01]">
                  <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-purple-200/40 blur-2xl animate-pulse-slow" />

                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-3">
                        <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center animate-gentle-bob">
                          <Zap className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-4xl font-extrabold text-gray-900">{stats?.activeTools || 2}</h3>
                          <p className="mt-2 text-sm text-gray-600 font-semibold">Platform Tools</p>
                          <p className="mt-0.5 text-xs text-gray-400">More coming soon</p>
                        </div>
                      </div>

                      {/* Tool Adoption Rate - Currently 2 of planned 5 tools */}
                      <div className="relative h-16 w-16">
                        <svg className="h-full w-full -rotate-90 transform">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#EDE9FE"
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#9333EA"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - ((stats?.activeTools || 2) / 5))}`}
                            strokeLinecap="round"
                            className="animate-pulse-slow"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-purple-600">
                          {Math.round(((stats?.activeTools || 2) / 5) * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Tools Overview Section */}
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Available Tools</h2>

            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Catalogue Tool */}
              <Card
                className="group relative overflow-hidden rounded-3xl border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl cursor-pointer"
                onClick={() => setShowCataloguesModal(true)}
              >
                <div className="absolute right-0 top-0 h-40 w-40 translate-x-12 -translate-y-12 transform opacity-10">
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-400 to-purple-600" />
                </div>
                <CardContent className="relative p-8">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#2D1B69] shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <Book className="h-7 w-7 text-white" />
                    </div>
                    <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                      Active
                    </Badge>
                  </div>

                  <h3 className="mb-2 text-2xl font-bold text-gray-900">Product Catalogue</h3>
                  <p className="mb-4 text-sm text-gray-600">
                    Create beautiful, professional product catalogues with AI-powered descriptions and stunning templates.
                  </p>

                  <div className="mb-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-2xl font-bold text-gray-900">{catalogueCount}</p>
                      <p className="text-xs text-gray-600">Catalogues</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-2xl font-bold text-gray-900">{productCount}</p>
                      <p className="text-xs text-gray-600">Products</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>AI-powered descriptions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Professional templates</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Export to PDF</span>
                    </div>
                  </div>

                  <Button
                    className="mt-6 w-full bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white hover:from-[#5558E3] hover:to-[#1e0f4d] shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowCataloguesModal(true)
                    }}
                  >
                    Open Tool
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* PDF Editor Tool */}
              <Card className="group relative overflow-hidden rounded-3xl border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl">
                <div className="absolute right-0 top-0 h-40 w-40 translate-x-12 -translate-y-12 transform opacity-10">
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-emerald-400 to-teal-600" />
                </div>
                <CardContent className="relative p-8">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <FileText className="h-7 w-7 text-white" />
                    </div>
                    <Badge className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100">
                      Coming Soon
                    </Badge>
                  </div>

                  <h3 className="mb-2 text-2xl font-bold text-gray-900">PDF Editor</h3>
                  <p className="mb-4 text-sm text-gray-600">
                    Professional PDF editing with advanced features for creating, editing, and managing documents.
                  </p>

                  <div className="mb-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-2xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600">Documents</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-2xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600">Templates</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-gray-400" />
                      <span>Advanced PDF editing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-gray-400" />
                      <span>Text and image support</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-gray-400" />
                      <span>Professional templates</span>
                    </div>
                  </div>

                  <Button
                    className="mt-6 w-full bg-gray-200 text-gray-500 hover:bg-gray-200 cursor-not-allowed"
                    disabled
                  >
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Invoices Section - Main Content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 pt-14">
            {/* Left: Large Purple Card with Progress */}
            <div className="lg:col-span-1 pt-2">

              <h2 className="text-lg font-semibold text-gray-900">Total Projects</h2>

              {/* Smaller Stat Cards Below */}
              <div className="mt-4 grid grid-cols-1 gap-4">
                <Card className="rounded-3xl border-0 bg-white shadow-lg">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                        <Book className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Catalogues</p>
                        <h4 className="text-xl font-bold text-gray-900">
                          {catalogueCount}
                        </h4>
                      </div>
                    </div>
                    <Badge className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                      {productCount} items
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-0 bg-white shadow-lg">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">PDF Documents</p>
                        <h4 className="text-xl font-bold text-gray-900">
                          0
                        </h4>
                      </div>
                    </div>
                    <div className="relative h-10 w-10">
                      <svg className="h-full w-full -rotate-90 transform">
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke="#E5E7EB"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke="#8B5CF6"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 16}`}
                          strokeDashoffset={`${2 * Math.PI * 16}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-purple-600">
                        0%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right: Chart and Activity */}
            <div className="lg:col-span-2">


              {/* History Section */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Work</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCataloguesModal(true)}>
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {/* Recent Activity List */}
              {recentItems.length > 0 ? (
                <Card className="rounded-3xl border-0 bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {recentItems.slice(0, 3).map((item) => {
                        const catalogue = catalogues.find(c => c.id === item.id)
                        const toolIcon = item.type === 'CATALOGUE' ? Book : FileText
                        const ToolIcon = toolIcon

                        return (
                          <div
                            key={item.id}
                            onClick={() => router.push(`/editor/${item.id}`)}
                            className="group flex cursor-pointer items-center gap-4 rounded-2xl bg-gray-50 p-4 transition-all hover:bg-gray-100 hover:shadow-md"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#2D1B69] shadow-md">
                              <ToolIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                                <Badge variant="outline" className="text-xs h-5 px-1.5">
                                  {item.type === 'CATALOGUE' ? 'Catalogue' : 'PDF'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-gray-500">
                                  Updated {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                                </p>
                                {catalogue && catalogue.theme && (
                                  <>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500 capitalize">{catalogue.theme}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="hidden items-center gap-6 md:flex">
                              <div className="text-center">
                                <p className="text-sm font-semibold text-gray-900">{item.productCount || 0}</p>
                                <p className="text-xs text-gray-500">Items</p>
                              </div>
                              <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ${catalogue?.isPublic
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                                }`}>
                                {catalogue?.isPublic ? 'Public' : 'Private'}
                              </Badge>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="rounded-3xl border-0 bg-white p-8 text-center shadow-lg">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <FolderOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">No projects yet</p>
                      <p className="text-sm text-gray-500 mt-1">Start creating with our tools</p>
                    </div>
                    <Button
                      onClick={() => setShowCataloguesModal(true)}
                      className="mt-2 bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white hover:from-[#5558E3] hover:to-[#1e0f4d] shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Get Started
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>



          {/* Catalogues Modal */}
          <CataloguesModal
            open={showCataloguesModal}
            onOpenChange={setShowCataloguesModal}
          />

          {/* Upgrade Prompt Modal */}
          <UpgradePrompt
            isOpen={showUpgradePrompt}
            onClose={() => setShowUpgradePrompt(false)}
            feature="dashboard"
            currentPlan={currentPlan}
          />
        </div>
      </div>
    </div>
  )
}

