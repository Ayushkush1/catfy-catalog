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
  Sparkles,
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
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import Image from 'next/image'
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

  if (isLoading) {
    return (
      <>
        <Header title="Dashboard" />
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
      </>
    )
  }

  return (
    <>
      <Header title="Dashboard" />
      <div className="min-h-screen bg-gray-50 pb-10">
        {/* Purple Gradient Hero Section */}
        <div className="mx-8 rounded-3xl bg-gradient-to-r from-[#2D1B69] to-[#6366F1] px-6 py-12 text-white">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="pb-6 text-white">
                <div className="mb-6 flex flex-col gap-8">
                  <div>
                    <h1
                      className="pb-4 pt-4 text-4xl font-extrabold"
                      style={{
                        fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
                      }}
                    >
                      Hi, {profile?.fullName || 'Ayush Kumar'}
                    </h1>
                    <p
                      className="text-md max-w-[760px] text-white"
                      style={{
                        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
                      }}
                    >
                      Welcome back to your AI-powered catalogue studio.
                      Effortlessly create, manage, and share beautiful product
                      catalogues. Try out instant PDF export, pro themes, and
                      more!
                    </p>

                    {profile?.subscription?.plan === 'FREE' && (
                      <div className="mt-2">
                        <Badge className="border-amber-200 bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                          Free Plan
                        </Badge>
                        <span className="ml-2 text-xs text-amber-200">
                          Upgrade for unlimited exports and premium features.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feature Highlights */}
                <div className="mb-8 mt-2 flex flex-wrap gap-1">
                  <div className="flex items-center space-x-1 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 backdrop-blur-sm">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400">
                      <svg
                        className="h-2 w-2 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-[11px] font-medium text-white">
                      AI-Powered
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 backdrop-blur-sm">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-400">
                      <svg
                        className="h-2 w-2 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-[11px] font-medium text-white">
                      5 Pro Themes
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 backdrop-blur-sm">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-400">
                      <svg
                        className="h-2 w-2 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-[11px] font-medium text-white">
                      Instant Export
                    </span>
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
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 font-semibold text-[#2D1B69] shadow-md transition-all duration-300 hover:scale-105 hover:bg-purple-50  hover:shadow-xl"
                >
                  <FolderOpen className="h-5 w-5 transition-transform duration-300 group-hover:rotate-6" />
                  Create Catalogue
                </Button>
              </div>

              {/* Enhanced Floating Catalogue Cards with Micro Animations */}
              <div className="absolute right-56 top-16 hidden h-[350px] w-[410px] xl:block">
                <Image
                  height={350}
                  width={410}
                  src="/assets/heroImage.png"
                  alt="Catalogue Hero"
                  className="pointer-events-none z-10 h-full w-full select-none object-contain drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container relative z-10 mx-auto -mt-6 px-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
              <Card className="group h-24 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-sm font-medium text-[#779CAB]">
                        Total Catalogues
                      </p>
                      <p className="text-2xl font-bold text-[#1A1B41]">
                        {stats.totalCatalogues}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#43d8a9] to-[#2784e0d3] transition-transform duration-300 group-hover:scale-110">
                      <Book className="h-6 w-6 text-white" />
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
                        {stats.totalProducts}
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
                        Total Views
                      </p>
                      <p className="text-2xl font-bold text-[#1A1B41]">
                        {stats.totalViews}
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
                        Total Exports
                      </p>
                      <p className="text-2xl font-bold text-[#1A1B41]">
                        {stats.totalExports}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#43d8a9] to-[#2784e0d3] transition-transform duration-300 group-hover:scale-110">
                      <Download className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Catalogues Section */}
          <div className="space-y-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Catalogues
                </h2>
                <p className="mt-1 text-gray-600">
                  Manage and organize your creative collections
                </p>
              </div>

              <div className="flex w-full items-center gap-3 md:w-auto">
                <Button
                  variant="ghost"
                  className="text-[#2D1B69] hover:bg-purple-50 hover:text-[#2d1b69b8]"
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
                  className=" rounded-lg bg-gradient-to-r from-[#2D1B69] to-[#6366F1] px-6 py-2 font-medium text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Catalog
                </Button>
              </div>
            </div>

            {/* Catalogues Grid */}
            {filteredCatalogues.length === 0 ? (
              <Card className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2D1B69] to-[#6366F1]">
                    <Package className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900">
                    {catalogues.length === 0
                      ? 'No catalogues yet'
                      : 'No catalogues found'}
                  </h3>
                  <p className="mx-auto mb-8 max-w-sm leading-relaxed text-gray-600">
                    {catalogues.length === 0
                      ? 'Create your first catalogue to get started and showcase your amazing products'
                      : "Try adjusting your search or filter criteria to find what you're looking for"}
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
                      className="transform rounded-xl bg-gradient-to-r from-[#2D1B69] to-[#6366F1] px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-[#1e1348] hover:to-[#4f46e5] hover:shadow-xl"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Create Your First Catalogue
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCatalogues.map(catalogue => (
                  <Card
                    onClick={() =>
                      router.push(`/catalogue/${catalogue.id}/edit`)
                    }
                    key={catalogue.id}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border-0 bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  >
                    {/* Enhanced Image Header with Gradient */}
                    <div className="relative h-48 overflow-hidden">
                      {/* Dynamic Theme-based Gradients */}
                      {catalogue.name === 'Fragrance' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700" />
                      )}
                      {catalogue.name === 'Fashion Collection' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-rose-600 to-red-700" />
                      )}
                      {catalogue.name === 'Tech Gadgets' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700" />
                      )}
                      {![
                        'Fragrance',
                        'Fashion Collection',
                        'Tech Gadgets',
                      ].includes(catalogue.name) && (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B69] via-[#6366F1] to-[#8B5CF6]" />
                      )}

                      {/* Beautiful Pattern Overlay */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
                        <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-white/20"></div>
                        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-white/30"></div>
                      </div>

                      {/* Content Overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        {/* Catalogue Icon */}
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ">
                          <Package className="h-8 w-8 text-white" />
                        </div>

                        {/* Catalogue Name */}
                        <h3 className="mb-2 text-2xl font-bold text-white ">
                          {catalogue.name}
                        </h3>

                        {/* Quick Stats */}
                        <div className="flex items-center space-x-4 text-sm text-white/90">
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
                      <div className="absolute left-4 top-4">
                        <Badge
                          variant={catalogue.isPublic ? 'default' : 'secondary'}
                          className={`border px-3 py-1 text-xs font-medium backdrop-blur-sm ${
                            catalogue.isPublic
                              ? 'border-emerald-400 bg-emerald-500/90 text-white'
                              : 'border-red-400 bg-red-500/90 text-white'
                          }`}
                        >
                          {catalogue.isPublic ? 'Public' : 'Private'}
                        </Badge>
                      </div>

                      {/* Direct Action Buttons - Show on Hover */}
                      <div className="absolute right-4 top-4 flex translate-x-2 transform flex-col space-y-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                        <Button
                          size="sm"
                          onClick={e => {
                            e.stopPropagation()
                            router.push(`/catalogue/${catalogue.id}/preview`)
                          }}
                          className="h-9 w-9 rounded-lg border border-white/30 bg-white/20 p-0 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/30 hover:text-white"
                          title="Preview Catalogue"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              onClick={e => e.stopPropagation()}
                              className="h-9 w-9 rounded-lg border border-white/30 bg-white/20 p-0 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/30 hover:text-white"
                              title="More Options"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 bg-white/95 backdrop-blur-sm"
                          >
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation()
                                shareCatalogue(catalogue)
                              }}
                              className="cursor-pointer hover:bg-gray-50"
                            >
                              <Share2 className="mr-3 h-4 w-4 text-blue-600" />
                              Share Catalogue
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation()
                                exportToPDF(catalogue.id)
                              }}
                              disabled={!canExport()}
                              className="cursor-pointer hover:bg-gray-50"
                            >
                              <Download className="mr-3 h-4 w-4 text-green-600" />
                              Export PDF
                              {!canExport() && (
                                <Crown className="ml-auto h-3 w-3 text-amber-500" />
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600 hover:bg-red-50 focus:text-red-600"
                              onClick={e => {
                                e.stopPropagation()
                                deleteCatalogue(catalogue.id)
                              }}
                            >
                              <Trash2 className="mr-3 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Enhanced Content Section */}
                    <div className="bg-white p-6">
                      {/* Description */}
                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">
                        {catalogue.description ||
                          'A beautifully crafted catalogue showcasing premium products with modern design and user-friendly interface.'}
                      </p>

                      {/* Enhanced Stats Grid */}
                      <div className="mb-4 grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 text-center">
                          <div className="mb-1 text-lg font-bold text-blue-700">
                            {catalogue._count?.products || 0}
                          </div>
                          <div className="text-xs font-medium text-blue-600">
                            Products
                          </div>
                        </div>
                        <div className="rounded-lg border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-3 text-center">
                          <div className="mb-1 text-lg font-bold text-purple-700">
                            {catalogue._count?.categories || 0}
                          </div>
                          <div className="text-xs font-medium text-purple-600">
                            Categories
                          </div>
                        </div>
                      </div>

                      {/* Theme and Date Info */}
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-1 text-xs text-gray-700"
                        >
                          <Palette className="mr-1 h-3 w-3" />
                          {catalogue.theme || 'Modern'}
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDistanceToNow(new Date(catalogue.updatedAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Subtle Hover Glow Effect */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-pink-400/0 transition-all duration-500 group-hover:from-blue-400/5 group-hover:via-purple-400/5 group-hover:to-pink-400/5"></div>
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
