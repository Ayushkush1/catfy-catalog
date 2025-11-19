'use client'

import { motion } from 'framer-motion'
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
import { Poppins } from 'next/font/google'
import { toast } from 'sonner'
import Image from 'next/image'
import { formatDistanceToNow, format } from 'date-fns'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { CataloguesModal } from '@/components/dashboard/CataloguesModal'
import Head from 'next/head'

// Framer Motion variants for hero staggered animations
const heroContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      when: 'beforeChildren',
    },
  },
}

const heroItemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const heroButtonVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

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
  const [toolSearch, setToolSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [error, setError] = useState('')
  const [showCataloguesModal, setShowCataloguesModal] = useState(false)
  const [catalogueStickerError, setCatalogueStickerError] = useState(false)
  const [pdfStickerError, setPdfStickerError] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail
        setToolSearch((detail?.query || '').toLowerCase())
      } catch (err) {
        setToolSearch('')
      }
    }
    window.addEventListener('dashboard:search', handler)
    return () => window.removeEventListener('dashboard:search', handler)
  }, [])

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

    // Add Google Fonts
    const link1 = document.createElement('link')
    link1.rel = 'preconnect'
    link1.href = 'https://fonts.googleapis.com'
    document.head.appendChild(link1)

    const link2 = document.createElement('link')
    link2.rel = 'preconnect'
    link2.href = 'https://fonts.gstatic.com'
    link2.crossOrigin = 'anonymous'
    document.head.appendChild(link2)

    const link3 = document.createElement('link')
    link3.href =
      'https://fonts.googleapis.com/css2?family=Caveat+Brush&family=Caveat:wght@400..700&display=swap'
    link3.rel = 'stylesheet'
    document.head.appendChild(link3)

    return () => {
      if (document.head.contains(link1)) document.head.removeChild(link1)
      if (document.head.contains(link2)) document.head.removeChild(link2)
      if (document.head.contains(link3)) document.head.removeChild(link3)
      if (document.head.contains(style)) document.head.removeChild(style)
    }
  }, [])

  const loadDashboardData = async () => {
    // Try to read cached dashboard data from sessionStorage to avoid
    // showing the loader on every client-side tab/navigation change.
    const CACHE_KEY = 'catfy:dashboardData'
    const CACHE_TTL = 1000 * 60 * 5 // 5 minutes
    let profileDataVar: any = null

    try {
      const raw = sessionStorage.getItem(CACHE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?._ts && Date.now() - parsed._ts < CACHE_TTL) {
          setProfile(parsed.profile || null)
          setCatalogues(parsed.catalogues || [])
          setStats(parsed.stats || null)
          setRecentItems(parsed.recentItems || [])
          setIsLoading(false)
          return
        }
      }
    } catch (err) {
      // ignore cache read errors and fall back to network
    }

    try {
      setIsLoading(true)

      // Load user profile
      const profileResponse = await fetch('/api/auth/profile')
      if (profileResponse.ok) {
        profileDataVar = await profileResponse.json()
        setProfile(profileDataVar.profile)
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
          .sort(
            (a: Catalogue, b: Catalogue) =>
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
        // Cache the dashboard payload in sessionStorage so subsequent
        // client-side navigations don't re-show the skeleton.
        try {
          const payload = {
            _ts: Date.now(),
            profile: profileDataVar?.profile || null,
            catalogues: cataloguesData.catalogues || [],
            stats: {
              totalCatalogues: cataloguesData.catalogues.length,
              totalProducts,
              totalViews: 0,
              totalExports: 0,
              totalProjects: cataloguesData.catalogues.length,
              activeTools: 2,
            },
            recentItems: recent,
          }
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload))
        } catch (err) {
          // ignore cache write errors
        }
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
        try {
          sessionStorage.removeItem('catfy:dashboardData')
        } catch (err) {
          // ignore
        }
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
  // (kept previous logic: no extra public status variable needed)

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-blue-50">
        <div className="ml-24 flex-1">
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
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-blue-50">
      <div className="ml-24 flex-1">
        <DashboardHeader />

        <div className="px-8 pb-10 pt-5">
          {/* Branding Intro Section with Top Cards */}
          {stats && (
            <div className="mb-6">
              {/* Hero / Branding Intro (first view for new users) */}
              <div className="relative mb-8">
                <div className="rounded-[3rem] shadow-lg">
                  <div className="relative rounded-[3rem] bg-gradient-to-br from-[#6366F1] to-[#2D1B69] p-10 py-[5.5rem] text-white">
                    <motion.div
                      className="flex flex-col items-center gap-6 md:flex-row"
                      variants={heroContainerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      <motion.div
                        className="flex-1 space-y-2"
                        variants={heroItemVariants}
                      >
                        <motion.h1
                          className={`-pl-2 text-2xl font-bold leading-[50px] md:text-[3rem]`}
                          variants={heroItemVariants}
                        >
                          Build Smarter,
                          <br /> Faster with <i className="font-light">
                            CATFY
                          </i>{' '}
                          <span className=" -pl-2 text-xl font-semibold">
                            {' '}
                            ( AI powered builder ){' '}
                          </span>
                        </motion.h1>

                        <motion.p
                          className={` max-w-2xl pb-5 pt-1 text-sm leading-normal text-white/90 md:text-[1rem]`}
                          variants={heroItemVariants}
                        >
                          Craft beautiful, high-performing catalogues in minutes
                          with CATFY’s AI-powered tools. Design, track
                          analytics, and manage versions all in one seamless
                          workspace.
                        </motion.p>
                      </motion.div>

                      <motion.div
                        className="w-full md:w-1/3"
                        variants={heroItemVariants}
                      >
                        <div className="relative flex w-full items-center justify-center">
                          {/* floating decorative icons */}
                          <div className="absolute -right-2 -top-36 flex flex-col items-center gap-3">
                            <div
                              className="animate-float flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
                              style={{ ['--rotation' as any]: '8deg' }}
                            >
                              <Sparkles className="h-4 w-4 text-white/90" />
                            </div>
                            <div
                              className="animate-float-reverse flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"
                              style={{ ['--rotation' as any]: '-6deg' }}
                            >
                              <Book className="h-5 w-5 text-white/90" />
                            </div>
                          </div>

                          <motion.div
                            className="absolute -top-[15.5rem] right-14 h-[470px] w-[460px]"
                            initial={{ scale: 0.98, rotate: -2 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                          >
                            <Image
                              src="/assets/illustration 2.png"
                              alt="Catfy preview"
                              fill
                              className="object-contain"
                              priority
                            />
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Overlay Stat Cards */}
                    <div className="absolute -bottom-20 left-0 right-0 grid grid-cols-1 gap-4 px-10 md:grid-cols-4">
                      {/* Card 1 - Total Catalogues */}
                      <div className="group flex cursor-pointer items-center justify-between rounded-2xl bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <div>
                          <p className="text-sm text-gray-500">
                            Total Catalogues
                          </p>
                          <p className="mt-1 text-2xl font-extrabold text-gray-900">
                            {catalogueCount}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            Active projects
                          </p>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#f1b363] to-[#cc7d2f] text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                          <Book className="h-6 w-6" />
                        </div>
                      </div>

                      {/* Card 2 - Total Products */}
                      <div className="group flex cursor-pointer items-center justify-between rounded-2xl bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <div>
                          <p className="text-sm text-gray-500">
                            Total Products
                          </p>
                          <p className="mt-1 text-2xl font-extrabold text-gray-900">
                            {productCount}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            Across catalogues
                          </p>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                          <Package className="h-6 w-6" />
                        </div>
                      </div>

                      {/* Card 3 - Recent Updates */}
                      <div className="group flex cursor-pointer items-center justify-between rounded-2xl bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <div>
                          <p className="text-sm text-gray-500">
                            Recent Updates
                          </p>
                          <p className="mt-1 text-2xl font-extrabold text-gray-900">
                            {recentItems.length}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            Last 7 days
                          </p>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-pink-400 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                          <Clock className="h-6 w-6" />
                        </div>
                      </div>

                      {/* Card 4 - Platform Tools */}
                      <div className="group flex cursor-pointer items-center justify-between rounded-2xl bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <div>
                          <p className="text-sm text-gray-500">
                            Platform Tools
                          </p>
                          <p className="mt-1 text-2xl font-extrabold text-gray-900">
                            {stats?.activeTools || 2}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            More coming soon
                          </p>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                          <Zap className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tools Overview Section */}
          <div
            id="tools-section"
            tabIndex={-1}
            className="mt-28 px-10 focus:outline-none focus-visible:outline-none"
            style={{ outline: 'none' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Tools
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {(() => {
                const q = toolSearch.trim()
                const matches = (text: string) => text.toLowerCase().includes(q)
                const showCatalogue =
                  !q ||
                  matches('catalogue') ||
                  matches('catalogue builder') ||
                  matches('ai-powered') ||
                  matches('catalogues')
                const showPdf =
                  !q ||
                  matches('pdf') ||
                  matches('pdf editor') ||
                  matches('documents')

                if (!showCatalogue && !showPdf) {
                  return (
                    <Card className="rounded-3xl border-0 bg-white p-32 text-center shadow-lg">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                          <BarChart3 className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          No tools match “{toolSearch}”
                        </p>
                        <p className="text-sm text-gray-500">
                          Try different keywords like “catalogue” or “pdf”
                        </p>
                      </div>
                    </Card>
                  )
                }

                return (
                  <>
                    {showCatalogue && (
                      <Card
                        className="group relative cursor-pointer overflow-hidden rounded-3xl border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl"
                        onClick={() => setShowCataloguesModal(true)}
                      >
                        <div className="absolute right-0 top-0 h-40 w-40 -translate-y-12 translate-x-12 transform opacity-10">
                          <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-400 to-purple-600" />
                        </div>
                        <CardContent className="relative p-8">
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex h-[70px] w-24 items-center rounded-full p-1 justify-center bg-gradient-to-r from-[#6366F1] to-[#2D1B69] transition-transform duration-300 group-hover:scale-110">
                              {catalogueStickerError ? (
                                <Book className="h-7 w-7 text-white" />
                              ) : (
                                <Image
                                  src="/assets/stickers/cataloguelogo.png"
                                  alt="Catalogue Sticker"
                                  width={100}
                                  height={100}
                                  className="h-14 w-14"
                                  onError={() => setCatalogueStickerError(true)}
                                  style={{ objectFit: 'contain' }}
                                />
                              )}
                            </div>
                            <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                              Active
                            </Badge>
                          </div>

                          <h3 className="mb-2 text-2xl font-bold text-gray-900">
                            Catalogue Builder
                          </h3>
                          <p className="mb-4 text-sm text-gray-600">
                            Create beautiful, professional product catalogues
                            with AI-powered descriptions and stunning templates.
                          </p>

                          <div className="mb-6 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-2xl font-bold text-gray-900">
                                {catalogueCount}
                              </p>
                              <p className="text-xs text-gray-600">
                                Catalogues
                              </p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-2xl font-bold text-gray-900">
                                {productCount}
                              </p>
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
                            className="mt-6 w-full bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white shadow-md transition-all duration-200 hover:from-[#5558E3] hover:to-[#1e0f4d] hover:shadow-lg"
                            onClick={e => {
                              e.stopPropagation()
                              setShowCataloguesModal(true)
                            }}
                          >
                            Open Tool
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {showPdf && (
                      <Card className="group relative overflow-hidden rounded-3xl border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl">
                        <div className="absolute right-0 top-0 h-40 w-40 -translate-y-12 translate-x-12 transform opacity-10">
                          <div className="h-full w-full rounded-full bg-gradient-to-br from-emerald-400 to-teal-600" />
                        </div>
                        <CardContent className="relative p-8">
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex h-[70px] w-24 items-center rounded-full justify-center bg-gradient-to-r from-[#6366F1] to-[#2D1B69] transition-transform duration-300 group-hover:scale-110">
                              {pdfStickerError ? (
                                <FileText className="h-7 w-7 text-white" />
                              ) : (
                                <Image
                                  src="/assets/stickers/pdfwhite.png"
                                  alt="PDF Sticker"
                                  width={100}
                                  height={100}
                                  className="h-14 w-14"
                                  onError={() => setPdfStickerError(true)}
                                  style={{ objectFit: 'contain' }}
                                />
                              )}
                            </div>
                            <Badge className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100">
                              Coming Soon
                            </Badge>
                          </div>

                          <h3 className="mb-2 text-2xl font-bold text-gray-900">
                            PDF Editor
                          </h3>
                          <p className="mb-4 text-sm text-gray-600">
                            Professional PDF editing with advanced features for
                            creating, editing, and managing documents.
                          </p>

                          <div className="mb-6 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-2xl font-bold text-gray-900">
                                0
                              </p>
                              <p className="text-xs text-gray-600">Documents</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-2xl font-bold text-gray-900">
                                0
                              </p>
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
                            className="mt-6 w-full cursor-not-allowed bg-gray-200 text-gray-500 hover:bg-gray-200"
                            disabled
                          >
                            Coming Soon
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )
              })()}
            </div>
          </div>

          {/* Invoices Section - Main Content */}
          <div className="grid grid-cols-1 gap-6 px-10 pt-7 lg:grid-cols-3 lg:items-start">
            {/* Left: Large Purple Card with Progress */}
            <div className="pt-2 lg:col-span-1 lg:flex lg:flex-col lg:h-full">
              <h2 className="text-lg font-semibold text-gray-900">
                Total Projects
              </h2>

              {/* Smaller Stat Cards Below */}
              <div className="mt-4 grid grid-cols-1 gap-4 rounded-3xl bg-white p-4 lg:flex-1">
                <Card className="rounded-2xl border-0 bg-gray-50 shadow-sm hover:shadow-md">
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

                <Card className="rounded-3xl border-0 bg-gray-50 shadow-sm hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">PDF Documents</p>
                        <h4 className="text-xl font-bold text-gray-900">0</h4>
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
            <div className="lg:col-span-2 lg:flex lg:flex-col lg:h-full">
              {/* History Section */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Work
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCataloguesModal(true)}
                >
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {/* Recent Activity Cards Grid */}
              {recentItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:flex-1">
                  {recentItems.slice(0, 6).map(item => {
                    const catalogue = catalogues.find(c => c.id === item.id)
                    if (!catalogue) return null

                    return (
                      <Card
                        key={item.id}
                        className="group relative cursor-pointer overflow-hidden rounded-2xl border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl"
                        onClick={() => router.push(`/catalogue/${item.id}/edit`)}
                      >
                        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                          <iframe
                            src={`/preview/${catalogue.id}`}
                            className="h-full w-full border-0"
                            style={{
                              width: '400%',
                              height: '400%',
                              transform: 'scale(0.25)',
                              transformOrigin: 'top left',
                              opacity: 1,
                              transition: 'opacity 0.3s ease-in-out',
                            }}
                            title={`Preview of ${catalogue.name}`}
                          />
                          <div className="absolute right-2 top-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 bg-white/80 p-0 backdrop-blur-sm hover:bg-white"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={(e: any) => {
                                    e.stopPropagation()
                                    router.push(`/catalogue/${catalogue.id}/edit`)
                                  }}
                                >
                                  <Edit className="mr-2 h-3 w-3" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e: any) => {
                                    e.stopPropagation()
                                    if (!catalogue.isPublic) return
                                    shareCatalogue(catalogue)
                                  }}
                                  disabled={!catalogue.isPublic}
                                >
                                  <Share2 className="mr-2 h-3 w-3" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e: any) => {
                                    e.stopPropagation()
                                    deleteCatalogue(catalogue.id)
                                  }}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="mr-2 h-3 w-3" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <CardContent className="p-3">
                          <div className="mb-2 flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className="mb-1 truncate text-sm font-semibold text-gray-900">
                                {catalogue.name}
                              </h3>
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {catalogue.theme}
                                </Badge>
                                <Badge
                                  className={`text-xs ${catalogue.isPublic
                                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                  {catalogue.isPublic ? 'Public' : 'Private'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {catalogue._count?.products || 0} products
                            </span>
                            <span>
                              {formatDistanceToNow(
                                new Date(catalogue.updatedAt),
                                { addSuffix: true }
                              )}
                            </span>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-[#6366F1] to-[#2D1B69] px-2 py-1 text-xs text-white hover:from-[#5558E3] hover:to-[#1e0f4d]"
                              onClick={e => {
                                e.stopPropagation()
                                router.push(`/catalogue/${catalogue.id}/edit`)
                              }}
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-2 py-1 text-xs"
                              onClick={e => {
                                e.stopPropagation()
                                router.push(`/preview/${catalogue.id}`)
                              }}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Preview
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="rounded-3xl border-0 bg-white p-8 text-center shadow-lg">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <FolderOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        No projects yet
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Start creating with our tools
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowCataloguesModal(true)}
                      className="mt-2 bg-gradient-to-r from-[#6366F1] to-[#2D1B69] text-white shadow-md transition-all duration-200 hover:from-[#5558E3] hover:to-[#1e0f4d] hover:shadow-lg"
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
