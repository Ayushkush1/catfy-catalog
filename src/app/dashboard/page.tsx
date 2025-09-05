'use client'

import {
  Plus,
  Search,
  Filter,
  Package,
  Eye,
  Edit,
  Share2,
  Download,
  Trash2,
  MoreVertical,
  FolderOpen,
  TrendingUp,
  Crown,
  Calendar,
  Palette,
  Sparkles
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/Header'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { i } from 'vitest/dist/reporters-w_64AS5f.js'

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
}

export default function DashboardPage() {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
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
          (sum: number, cat: Catalogue) => sum + (cat._count?.products || 0), 0
        )
        setStats({
          totalCatalogues: cataloguesData.catalogues.length,
          totalProducts,
          totalViews: 0, // Would come from analytics
          totalExports: 0, // Would come from exports table
        })
      }
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCatalogue = async (catalogueId: string) => {
    if (!confirm('Are you sure you want to delete this catalogue? This action cannot be undone.')) {
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
      toast.error(err instanceof Error ? err.message : 'Failed to delete catalogue')
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
          orientation: 'portrait'
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
      toast.error(err instanceof Error ? err.message : 'Failed to export PDF', { id: 'pdf-export' })
    }
  }

  const filteredCatalogues = catalogues.filter(catalogue => {
    const matchesSearch = catalogue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catalogue.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterType === 'all' ||
      (filterType === 'public' && catalogue.isPublic) ||
      (filterType === 'private' && !catalogue.isPublic)

    return matchesSearch && matchesFilter
  })

  const { currentPlan, canCreateCatalogue, canExport } = useSubscription()
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  if (isLoading) {
    return (
      <>
        <Header title="Dashboard" />
        <div className="container mx-auto py-8 px-4">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Dashboard" />
      <div className="min-h-screen pb-10 bg-gray-50">
        {/* Purple Gradient Hero Section */}
        <div className="bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white px-6 mx-8 rounded-3xl py-12">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="text-white pb-2">
                <div className="flex flex-col gap-3 mb-4">
                  
                  <div>
                    <h1 className="text-3xl font-bold pb-4">
                      Hi, {profile?.fullName || 'Ayush Kumar'}
                    </h1>
                    <p className="text-white text-sm">Welcome back to your AI-powered catalogue studio</p>
                    <p className="text-white text-xs mt-1 max-w-[400px]">
                      Effortlessly create, manage, and share beautiful product catalogues.
                      Try out instant PDF export, pro themes, and more!
                    </p>
                    {profile?.subscription?.plan === 'FREE' && (
                      <div className="mt-2">
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-2 py-1 text-xs font-medium">
                          Free Plan
                        </Badge>
                        <span className="ml-2 text-amber-200 text-xs">
                          Upgrade for unlimited exports and premium features.
                        </span>
                      </div>
                    )}
                  </div>
                </div>


                {/* Feature Highlights */}
                <div className="flex flex-wrap gap-2 mt-2 mb-8">
                  <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                    <div className="w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white text-xs font-medium">AI-Powered</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                    <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white text-xs font-medium">5 Pro Themes</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                    <div className="w-5 h-5 bg-purple-400 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white text-xs font-medium">Instant Export</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (canCreateCatalogue()) {
                      router.push('/catalogue/new')
                    } else {
                      setShowUpgradePrompt(true)
                    }
                  }}
                  className="bg-white text-[#2D1B69] hover:bg-purple-50 font-semibold px-6 py-3 rounded-lg"
                >
                  Create Catalog
                </Button>
              </div>

              <div className='relative right-40'>
                {/* Floating Catalogue Cards */}


                <div className="absolute -top-16 right-20 w-32 h-40 bg-gradient-to-br from-white/25 to-white/15 rounded-2xl transform -rotate-6 shadow-2xl backdrop-blur-sm border border-white/30 animate-float delay-500">
                  <div className="p-4 h-full flex flex-col">
                    <div className="w-8 h-8 bg-blue-400 rounded-xl mb-3 flex items-center justify-center">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-2 bg-white/50 rounded"></div>
                      <div className="h-2 bg-white/40 rounded w-4/5"></div>
                      <div className="h-2 bg-white/30 rounded w-3/5"></div>
                      <div className="h-2 bg-white/20 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>


                <div className="absolute -bottom-10 right-8 w-24 h-32 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl transform rotate-6 shadow-2xl backdrop-blur-sm border border-white/30 animate-float delay-1000">
                  <div className="p-3 h-full flex flex-col">
                    <div className="w-5 h-5 bg-purple-400 rounded-lg mb-2"></div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-1.5 bg-white/40 rounded"></div>
                      <div className="h-1.5 bg-white/30 rounded w-3/4"></div>
                      <div className="h-1.5 bg-white/20 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-4 w-28 h-36 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl transform rotate-12 shadow-2xl backdrop-blur-sm border border-white/30 animate-float">
                  <div className="p-4 h-full flex flex-col">
                    <div className="w-6 h-6 bg-emerald-400 rounded-lg mb-2"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-2 bg-white/40 rounded"></div>
                      <div className="h-2 bg-white/30 rounded w-3/4"></div>
                      <div className="h-2 bg-white/20 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 -mt-6 relative z-10">

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="group bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden h-24">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#779CAB] mb-1">Total Catalogues</p>
                      <p className="text-2xl font-bold text-[#1A1B41]">{stats.totalCatalogues}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-[#43d8a9] to-[#2784e0d3]   rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden h-24">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#779CAB] mb-1">Total Products</p>
                      <p className="text-2xl font-bold text-[#1A1B41]">{stats.totalProducts}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-[#43d8a9] to-[#2784e0d3] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden h-24">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#779CAB] mb-1">Total Views</p>
                      <p className="text-2xl font-bold text-[#1A1B41]">{stats.totalViews}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-[#43d8a9] to-[#2784e0d3] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden h-24">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#779CAB] mb-1">Total Exports</p>
                      <p className="text-2xl font-bold text-[#1A1B41]">{stats.totalExports}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-[#43d8a9] to-[#2784e0d3] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Download className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Catalogues Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Catalogues</h2>
                <p className="text-gray-600 mt-1">Manage and organize your creative collections</p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button
                  variant="ghost"
                  className="text-[#2D1B69] hover:text-[#2d1b69b8] hover:bg-purple-50"
                >
                  VIEW ALL
                </Button>
                <Button
                  onClick={() => {
                    if (canCreateCatalogue()) {
                      router.push('/catalogue/new')
                    } else {
                      setShowUpgradePrompt(true)
                    }
                  }}
                  className=" px-6 py-2 rounded-lg text-white bg-gradient-to-r from-[#2D1B69] to-[#6366F1] font-medium"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Catalog
                </Button>
              </div>
            </div>

            {/* Catalogues Grid */}
            {filteredCatalogues.length === 0 ? (
              <Card className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#2D1B69] to-[#6366F1] rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <Package className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {catalogues.length === 0 ? 'No catalogues yet' : 'No catalogues found'}
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
                    {catalogues.length === 0
                      ? 'Create your first catalogue to get started and showcase your amazing products'
                      : 'Try adjusting your search or filter criteria to find what you\'re looking for'
                    }
                  </p>
                  {catalogues.length === 0 && (
                    <Button
                      onClick={() => {
                        if (canCreateCatalogue()) {
                          router.push('/catalogue/new')
                        } else {
                          setShowUpgradePrompt(true)
                        }
                      }}
                      className="bg-gradient-to-r from-[#2D1B69] to-[#6366F1] hover:from-[#1e1348] hover:to-[#4f46e5] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Create Your First Catalogue
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCatalogues.map((catalogue) => (
                  <Card key={catalogue.id} className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 bg-white shadow-lg hover:-translate-y-2 rounded-2xl relative">
                    {/* Enhanced Image Header with Gradient */}
                    <div className="relative h-48 overflow-hidden">
                      {/* Dynamic Theme-based Gradients */}
                      {catalogue.name === "Fragrance" && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700" />
                      )}
                      {catalogue.name === "Fashion Collection" && (
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-rose-600 to-red-700" />
                      )}
                      {catalogue.name === "Tech Gadgets" && (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700" />
                      )}
                      {!["Fragrance", "Fashion Collection", "Tech Gadgets"].includes(catalogue.name) && (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B69] via-[#6366F1] to-[#8B5CF6]" />
                      )}

                      {/* Beautiful Pattern Overlay */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-full"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/30 rounded-full"></div>
                      </div>

                      {/* Content Overlay */}
                      <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
                        {/* Catalogue Icon */}
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 ">
                          <Package className="h-8 w-8 text-white" />
                        </div>

                        {/* Catalogue Name */}
                        <h3 className="text-2xl font-bold text-white mb-2 ">
                          {catalogue.name}
                        </h3>

                        {/* Quick Stats */}
                        <div className="flex items-center space-x-4 text-white/90 text-sm">
                          <div className="flex items-center space-x-1">
                            <Package className="h-4 w-4" />
                            <span>{catalogue._count?.products || 0} items</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{Math.floor(Math.random() * 100)} views</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge
                          variant={catalogue.isPublic ? 'default' : 'secondary'}
                          className={`text-xs px-3 py-1 font-medium backdrop-blur-sm border ${catalogue.isPublic
                            ? 'bg-emerald-500/90 text-white border-emerald-400'
                            : 'bg-red-500/90 text-white border-red-400'
                            }`}
                        >
                          {catalogue.isPublic ? 'Public' : 'Private'}
                        </Badge>
                      </div>

                      {/* Direct Action Buttons - Show on Hover */}
                      <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <Button
                          size="sm"
                          onClick={() => router.push(`/catalogue/${catalogue.id}/preview`)}
                          className="h-9 w-9 p-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:text-white transition-all duration-200"
                          title="Preview Catalogue"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => router.push(`/catalogue/${catalogue.id}/edit`)}
                          className="h-9 w-9 p-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:text-white transition-all duration-200"
                          title="Edit Catalogue"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              className="h-9 w-9 p-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:text-white transition-all duration-200"
                              title="More Options"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-sm">
                            <DropdownMenuItem
                              onClick={() => shareCatalogue(catalogue)}
                              className="cursor-pointer hover:bg-gray-50"
                            >
                              <Share2 className="mr-3 h-4 w-4 text-blue-600" />
                              Share Catalogue
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => exportToPDF(catalogue.id)}
                              disabled={!canExport()}
                              className="cursor-pointer hover:bg-gray-50"
                            >
                              <Download className="mr-3 h-4 w-4 text-green-600" />
                              Export PDF
                              {!canExport() && <Crown className="ml-auto h-3 w-3 text-amber-500" />}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50"
                              onClick={() => deleteCatalogue(catalogue.id)}
                            >
                              <Trash2 className="mr-3 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Enhanced Content Section */}
                    <div className="p-6 bg-white">
                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {catalogue.description || 'A beautifully crafted catalogue showcasing premium products with modern design and user-friendly interface.'}
                      </p>

                      {/* Enhanced Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 text-center border border-blue-100">
                          <div className="text-lg font-bold text-blue-700 mb-1">{catalogue._count?.products || 0}</div>
                          <div className="text-xs text-blue-600 font-medium">Products</div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 text-center border border-purple-100">
                          <div className="text-lg font-bold text-purple-700 mb-1">{catalogue._count?.categories || 0}</div>
                          <div className="text-xs text-purple-600 font-medium">Categories</div>
                        </div>
                      </div>

                      {/* Theme and Date Info */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-700 text-xs px-3 py-1">
                          <Palette className="h-3 w-3 mr-1" />
                          {catalogue.theme || 'Modern'}
                        </Badge>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(catalogue.updatedAt), { addSuffix: true })}
                        </div>
                      </div>


                    </div>

                    {/* Subtle Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-pink-400/0 group-hover:from-blue-400/5 group-hover:via-purple-400/5 group-hover:to-pink-400/5 transition-all duration-500 pointer-events-none"></div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Upgrade Prompt Modal */}
          <UpgradePrompt
            isOpen={showUpgradePrompt}
            onClose={() => setShowUpgradePrompt(false)}
            feature="catalogue creation"
            currentPlan={currentPlan}
          />
        </div>
      </div>
    </>
  )
}