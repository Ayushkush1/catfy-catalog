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
  FileEdit,
  ImageIcon,
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
import { useState, useEffect, useRef, type MouseEvent } from 'react'
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
import {
  useProfileQuery,
  useCataloguesQuery,
  useDeleteCatalogueMutation,
} from '@/hooks/queries'

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

/**
 * PreviewIframe
 * - lazy loads a scaled, non-interactive iframe when the card is near viewport
 * - unloads the iframe a short time after it leaves the viewport to free memory
 * - expects a lightweight preview route at `/preview/:id` (consider `?thumb=true` for a minimal render)
 */
function PreviewIframe({
  projectId,
  title,
}: {
  projectId: string
  title?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [src, setSrc] = useState<string>('')

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setVisible(true)
          else setVisible(false)
        })
      },
      { root: null, rootMargin: '300px', threshold: 0.01 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    let timer: number | undefined
    if (visible) {
      // Load the canonical preview page but in embed mode so the iframe shows
      // the exact same content as the preview page while allowing the page
      // to hide toolbars when `embed=true` is present.
      setSrc(`/catalogue/${projectId}/preview?embed=true`)
    } else {
      // Unload after a short delay to avoid rapid reloads on small scrolls
      timer = window.setTimeout(() => setSrc(''), 2500)
    }
    return () => {
      if (timer) window.clearTimeout(timer)
    }
  }, [visible, projectId])

  return (
    <div
      ref={containerRef}
      className="relative h-36 cursor-pointer overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200"
      aria-hidden={!src}
      title={title || 'Live preview'}
    >
      {src ? (
        <iframe
          src={src}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          className="h-full w-full border-0"
          style={{
            width: '400%',
            height: '400%',
            transform: 'scale(0.25)',
            transformOrigin: 'top left',
            pointerEvents: 'none',
            transition: 'opacity 0.25s ease-in-out',
          }}
          title={`Preview of ${title || projectId}`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
          Preview
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  // Use React Query for data fetching - instant cached responses!
  const { data: profileData, isLoading: profileLoading } = useProfileQuery()
  const { data: cataloguesData, isLoading: cataloguesLoading } =
    useCataloguesQuery()
  const deleteCatalogueMutation = useDeleteCatalogueMutation()

  const profile = profileData?.profile || null
  const catalogues = cataloguesData?.catalogues || []
  const isLoading = profileLoading || cataloguesLoading

  // Calculate stats from catalogues
  const stats: DashboardStats = {
    totalCatalogues: catalogues.length,
    totalProducts: catalogues.reduce(
      (sum, cat) => sum + (cat._count?.products || 0),
      0
    ),
    totalViews: 0,
    totalExports: 0,
    totalProjects: catalogues.length,
    activeTools: 2,
  }

  // Get recent items (last 6 updated catalogues)
  const recentItems: RecentItem[] = [...catalogues]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 6)
    .map(cat => ({
      id: cat.id,
      type: 'CATALOGUE' as const,
      name: cat.name,
      description: cat.description || undefined,
      updatedAt: cat.updatedAt,
      productCount: cat._count?.products || 0,
      theme: cat.theme,
    }))

  const [toolSearch, setToolSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [error, setError] = useState('')
  const [showCataloguesModal, setShowCataloguesModal] = useState(false)
  const [catalogueStickerError, setCatalogueStickerError] = useState(false)
  const [pdfStickerError, setPdfStickerError] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareDialogUrl, setShareDialogUrl] = useState('')
  const [shareDialogName, setShareDialogName] = useState('')

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

  // Add custom animations (font loading)
  useEffect(() => {
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

  const deleteCatalogue = async (catalogueId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this catalogue? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      await deleteCatalogueMutation.mutateAsync(catalogueId)
      toast.success('Catalogue deleted successfully')
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
        <div className="ml-20 flex-1">
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
      <div className="ml-20 flex-1">
        <DashboardHeader />

        <div className="px-8 pb-10 pt-2">
          {/* Branding Intro Section with Top Cards */}
          {stats && (
            <div className="mb-6">
              {/* Hero / Branding Intro (first view for new users) */}
              <div className="relative mb-8">
                <div className="rounded-[3rem] shadow-lg">
                  <div className="relative rounded-[3rem] bg-gradient-to-br from-[#6366F1] to-[#2D1B69] p-10 px-14 py-[3.5rem] text-white">
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
                        {/* AI Powered Badge */}
                        <motion.div
                          className="mb-4 flex items-center gap-2"
                          variants={heroItemVariants}
                        >
                          <Badge className="inline-flex items-center gap-1 rounded-full border-0 bg-gradient-to-r from-purple-400 to-blue-500 px-3 py-1 text-xs font-normal text-white shadow-sm">
                            <Sparkles className="h-3 w-3" />
                            AI Powered Builder
                          </Badge>
                        </motion.div>

                        <motion.h1
                          className={`-pl-2 text-2xl font-bold leading-[55px] md:text-[3rem]`}
                          variants={heroItemVariants}
                        >
                          Build Smarter,
                          <br /> Faster with <i className="font-light">
                            CATFY
                          </i>{' '}
                          {/* <span className=" -pl-2 text-xl font-semibold">
                            {' '}
                            ( AI powered builder ){' '}
                          </span> */}
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
                          <motion.div
                            className="absolute -top-[13rem] right-1 h-[400px] w-[400px]"
                            initial={{ scale: 0.98, rotate: -2 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                          >
                            <Image
                              src="/assets/illustration3.png"
                              alt="Catfy preview"
                              quality={100}
                              fill
                              className="object-contain"
                              priority
                            />
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Overlay Stat Cards */}
                    <div className="absolute -bottom-20 left-0 right-0 grid grid-cols-1 gap-4 px-14 md:grid-cols-4">
                      {/* Card 1 - Total Catalogues */}
                      <div className="group flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <div>
                          <p className="text-sm text-gray-500">
                            Total Catalogues
                          </p>
                          <p className="mt-1 text-2xl font-extrabold text-gray-900">
                            {catalogueCount}
                          </p>
                          <p className="text-xs text-gray-400">
                            Active projects
                          </p>
                        </div>
                        <div className="flex h-14 w-28 items-center justify-center pt-4 transition-transform duration-300 group-hover:scale-110">
                          <svg
                            width="134"
                            height="112"
                            viewBox="0 0 134 112"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M128.985 32.4002H22.1749C19.8342 32.4002 17.9863 30.5523 17.9863 28.2116V4.18862C17.9863 1.84792 19.8342 0 22.1749 0H128.862C131.202 0 133.05 1.84792 133.05 4.18862V28.2116C133.173 30.5523 131.202 32.4002 128.985 32.4002Z"
                              fill="#D8F0FF"
                            />
                            <path
                              d="M43.8562 16.139C43.8562 18.8493 42.6242 21.3132 40.7763 23.0379C39.1748 24.5163 36.9573 25.3786 34.6166 25.3786C32.2759 25.3786 30.0584 24.5163 28.4568 23.0379C26.4857 21.3132 25.377 18.8493 25.377 16.139C25.377 11.088 29.5656 6.89941 34.6166 6.89941C39.6675 6.89941 43.8562 11.088 43.8562 16.139Z"
                              fill="#24ABFF"
                            />
                            <path
                              d="M74.1624 13.4265H50.509C49.893 13.4265 49.5234 12.9337 49.5234 12.4409V9.36105C49.5234 8.74507 50.0162 8.37549 50.509 8.37549H74.1624C74.7784 8.37549 75.148 8.86827 75.148 9.36105V12.4409C75.148 13.0569 74.7784 13.4265 74.1624 13.4265Z"
                              fill="#24ABFF"
                            />
                            <path
                              d="M102.251 23.9006H50.509C49.893 23.9006 49.5234 23.4078 49.5234 22.915V19.8352C49.5234 19.2192 50.0162 18.8496 50.509 18.8496H102.251C102.867 18.8496 103.236 19.3424 103.236 19.8352V22.915C103.236 23.531 102.744 23.9006 102.251 23.9006Z"
                              fill="#24ABFF"
                            />
                            <path
                              d="M128.985 113.217H22.1749C19.8342 113.217 17.9863 111.369 17.9863 109.028V85.005C17.9863 82.6643 19.8342 80.8164 22.1749 80.8164H128.862C131.202 80.8164 133.05 82.6643 133.05 85.005V109.028C133.173 111.369 131.202 113.217 128.985 113.217Z"
                              fill="#D8F0FF"
                            />
                            <path
                              d="M43.8562 96.9574C43.8562 99.6677 42.6242 102.132 40.7763 103.856C39.1748 105.335 36.9573 106.197 34.6166 106.197C32.2759 106.197 30.0584 105.335 28.4568 103.856C26.4857 102.132 25.377 99.6677 25.377 96.9574C25.377 91.9064 29.5656 87.7178 34.6166 87.7178C39.6675 87.7178 43.8562 91.9064 43.8562 96.9574Z"
                              fill="#24ABFF"
                            />
                            <path
                              d="M74.1624 94.362H50.509C49.893 94.362 49.5234 93.8692 49.5234 93.3765V90.2966C49.5234 89.6806 50.0162 89.311 50.509 89.311H74.1624C74.7784 89.311 75.148 89.8038 75.148 90.2966V93.3765C75.148 93.8692 74.7784 94.362 74.1624 94.362Z"
                              fill="#24ABFF"
                            />
                            <path
                              d="M102.251 104.836H50.509C49.893 104.836 49.5234 104.343 49.5234 103.851V100.771C49.5234 100.155 50.0162 99.7852 50.509 99.7852H102.251C102.867 99.7852 103.236 100.278 103.236 100.771V103.851C103.236 104.343 102.744 104.836 102.251 104.836Z"
                              fill="#24ABFF"
                            />
                            <path
                              d="M110.875 72.8084H4.18862C1.84792 72.8084 0 70.9605 0 68.6198V44.5968C0 42.2561 1.84792 40.4082 4.18862 40.4082H110.875C113.216 40.4082 115.064 42.2561 115.064 44.5968V68.6198C115.187 70.9605 113.216 72.8084 110.875 72.8084Z"
                              fill="#D8F0FF"
                            />
                            <path
                              d="M56.1761 53.8376H32.5227C31.9067 53.8376 31.5371 53.3448 31.5371 52.852V49.7722C31.5371 49.1562 32.0299 48.7866 32.5227 48.7866H56.1761C56.792 48.7866 57.1616 49.2794 57.1616 49.7722V52.852C57.1616 53.468 56.792 53.8376 56.1761 53.8376Z"
                              fill="#24ABFF"
                            />
                            <path
                              d="M84.2645 64.4343H32.5227C31.9067 64.4343 31.5371 63.9415 31.5371 63.4487V60.3689C31.5371 59.7529 32.0299 59.3833 32.5227 59.3833H84.1413C84.7573 59.3833 85.1268 59.8761 85.1268 60.3689V63.4487C85.25 63.9415 84.7573 64.4343 84.2645 64.4343Z"
                              fill="#24ABFF"
                            />
                            <path
                              d="M25.995 56.5502C25.995 59.1372 24.8862 61.4779 23.1615 63.2027C23.0383 63.3259 23.0383 63.3259 22.9151 63.4491C21.3136 64.9274 19.0961 65.7898 16.7554 65.7898C14.4147 65.7898 12.3204 64.9274 10.7188 63.5723C10.7188 63.5723 10.7188 63.5723 10.5956 63.5723C8.62453 61.8475 7.39258 59.3836 7.39258 56.5502C7.39258 51.4992 11.5812 47.3105 16.6322 47.3105C21.8064 47.3105 25.995 51.4992 25.995 56.5502Z"
                              fill="#24ABFF"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Card 2 - Total Products */}
                      <div className="group flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <div>
                          <p className="text-sm text-gray-500">
                            Total Products
                          </p>
                          <p className="mt-1 text-2xl font-extrabold text-gray-900">
                            {productCount}
                          </p>
                          <p className=" text-xs text-gray-400">
                            Across catalogues
                          </p>
                        </div>
                        <div className="flex h-14 w-36 items-center justify-center pt-4  transition-transform duration-300 group-hover:scale-110">
                          <svg
                            width="162"
                            height="122"
                            viewBox="0 0 162 122"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M151.416 62.0816V110.54C151.416 120.608 143.228 128.796 133.026 128.796H47.9213C37.8538 128.796 29.6655 120.742 29.5312 110.674C29.5312 110.54 29.5312 110.54 29.5312 110.406V62.0816C29.5312 61.9474 29.5312 61.9474 29.5312 61.8132C29.5312 61.5447 29.5312 61.2762 29.6655 61.0078C29.7997 60.605 29.934 60.3366 30.0682 59.9339L52.888 16.3077C53.6934 14.5627 55.4385 13.623 57.3177 13.623H123.495C125.375 13.623 126.985 14.5627 127.925 16.3077L150.745 59.9339C150.879 60.2023 151.013 60.605 151.148 61.0078C151.416 61.2762 151.416 61.6789 151.416 62.0816Z"
                              fill="#C0AEFF"
                            />
                            <g filter="url(#filter0_d_98_379)">
                              <path
                                d="M107.927 62.4846H73.4288C71.9522 62.4846 70.7441 61.4108 70.7441 59.7999V12.6837C70.7441 11.2071 71.818 9.99902 73.4288 9.99902H107.793C109.269 9.99902 110.477 11.0729 110.477 12.6837V59.7999C110.477 61.2765 109.404 62.4846 107.927 62.4846Z"
                                fill="#E2DBFA"
                              />
                            </g>
                            <g filter="url(#filter1_d_98_379)">
                              <path
                                d="M119.336 73.6267H62.018C60.1387 73.6267 58.6621 72.0159 58.6621 70.2709V24.497C58.6621 22.6177 60.2729 21.1411 62.018 21.1411H119.336C121.215 21.1411 122.692 22.7519 122.692 24.497V70.2709C122.558 72.1502 121.215 73.6267 119.336 73.6267Z"
                                fill="#E2DBFA"
                              />
                            </g>
                            <g filter="url(#filter2_d_98_379)">
                              <path
                                d="M125.912 86.6492H55.573C53.5595 86.6492 51.8145 84.9042 51.8145 83.0249V37.9222C51.8145 35.9087 53.5595 34.2979 55.573 34.2979H125.912C127.925 34.2979 129.67 36.0429 129.67 37.9222V82.8907C129.536 85.0384 127.925 86.6492 125.912 86.6492Z"
                                fill="#E2DBFA"
                              />
                            </g>
                            <g filter="url(#filter3_d_98_379)">
                              <path
                                d="M133.024 99.2669H48.4567C46.1747 99.2669 44.4297 97.3877 44.4297 95.3742V50.9426C44.4297 48.6606 46.309 47.0498 48.4567 47.0498H133.024C135.306 47.0498 137.051 48.9291 137.051 50.9426V95.2399C136.917 97.5219 135.306 99.2669 133.024 99.2669Z"
                                fill="#E2DBFA"
                              />
                            </g>
                            <path
                              d="M107.657 64.6347H75.8432C75.0378 64.6347 74.2324 63.9635 74.2324 63.0239C74.2324 62.2185 74.9036 61.4131 75.8432 61.4131H107.657C108.462 61.4131 109.268 62.0843 109.268 63.0239C109.268 63.9635 108.596 64.6347 107.657 64.6347Z"
                              fill="#9374FF"
                            />
                            <path
                              d="M98.3935 74.0282H58.1232C57.5863 74.0282 57.1836 73.6255 57.1836 73.0886C57.1836 72.5516 57.5863 72.1489 58.1232 72.1489H98.2593C98.7962 72.1489 99.1989 72.5516 99.1989 73.0886C99.4674 73.357 99.0647 74.0282 98.3935 74.0282Z"
                              fill="#9374FF"
                            />
                            <path
                              d="M124.84 74.0282H104.57C104.034 74.0282 103.631 73.6255 103.631 73.0886C103.631 72.5516 104.034 72.1489 104.57 72.1489H124.706C125.243 72.1489 125.645 72.5516 125.645 73.0886C125.914 73.357 125.511 74.0282 124.84 74.0282Z"
                              fill="#9375FC"
                            />
                            <g filter="url(#filter4_d_98_379)">
                              <path
                                d="M144.41 64.512V110.455C144.41 116.989 139.183 122.217 132.53 122.217H48.4139C41.8795 122.217 36.5332 116.989 36.5332 110.455V64.2744C36.5332 64.0368 36.5332 63.7991 36.652 63.5615H59.7131C63.7525 63.5615 67.0791 66.7693 67.0791 70.9276C67.0791 72.9473 67.9108 74.8482 69.2177 76.1551C70.6434 77.5808 72.3067 78.2936 74.4452 78.2936H107.959C111.999 78.2936 115.326 75.0858 115.326 70.9276C115.326 68.9079 116.157 67.0069 117.464 65.7001C118.89 64.2744 120.553 63.5615 122.573 63.5615H144.173C144.41 63.7991 144.41 64.1556 144.41 64.512Z"
                                fill="white"
                              />
                            </g>
                            <g filter="url(#filter5_d_98_379)">
                              <path
                                d="M151.416 62.0812V115.506C151.416 122.889 145.51 128.796 137.993 128.796H42.9547C35.5718 128.796 29.5312 122.889 29.5312 115.506V61.8127C29.5312 61.5443 29.5312 61.2758 29.6655 61.0073H60.2709C64.8349 61.0073 68.5934 64.6317 68.5934 69.3299C68.5934 71.6118 69.5331 73.7596 71.0096 75.2362C72.6205 76.847 74.4997 77.6524 76.916 77.6524H104.166C108.729 77.6524 112.488 74.0281 112.488 69.3299C112.488 67.0479 113.428 64.9001 114.904 63.4235C116.515 61.8127 118.394 61.0073 120.676 61.0073H151.148C151.416 61.2758 151.416 61.6785 151.416 62.0812Z"
                                fill="#9374FF"
                              />
                            </g>
                            <defs>
                              <filter
                                id="filter0_d_98_379"
                                x="41.2126"
                                y="-18.1902"
                                width="98.7955"
                                height="111.549"
                                filterUnits="userSpaceOnUse"
                                color-interpolation-filters="sRGB"
                              >
                                <feFlood
                                  flood-opacity="0"
                                  result="BackgroundImageFix"
                                />
                                <feColorMatrix
                                  in="SourceAlpha"
                                  type="matrix"
                                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                  result="hardAlpha"
                                />
                                <feOffset dy="1.34234" />
                                <feGaussianBlur stdDeviation="14.7658" />
                                <feColorMatrix
                                  type="matrix"
                                  values="0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.18 0"
                                />
                                <feBlend
                                  mode="normal"
                                  in2="BackgroundImageFix"
                                  result="effect1_dropShadow_98_379"
                                />
                                <feBlend
                                  mode="normal"
                                  in="SourceGraphic"
                                  in2="effect1_dropShadow_98_379"
                                  result="shape"
                                />
                              </filter>
                              <filter
                                id="filter1_d_98_379"
                                x="29.1306"
                                y="-7.04809"
                                width="123.092"
                                height="111.549"
                                filterUnits="userSpaceOnUse"
                                color-interpolation-filters="sRGB"
                              >
                                <feFlood
                                  flood-opacity="0"
                                  result="BackgroundImageFix"
                                />
                                <feColorMatrix
                                  in="SourceAlpha"
                                  type="matrix"
                                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                  result="hardAlpha"
                                />
                                <feOffset dy="1.34234" />
                                <feGaussianBlur stdDeviation="14.7658" />
                                <feColorMatrix
                                  type="matrix"
                                  values="0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.18 0"
                                />
                                <feBlend
                                  mode="normal"
                                  in2="BackgroundImageFix"
                                  result="effect1_dropShadow_98_379"
                                />
                                <feBlend
                                  mode="normal"
                                  in="SourceGraphic"
                                  in2="effect1_dropShadow_98_379"
                                  result="shape"
                                />
                              </filter>
                              <filter
                                id="filter2_d_98_379"
                                x="22.2829"
                                y="6.10865"
                                width="136.919"
                                height="111.415"
                                filterUnits="userSpaceOnUse"
                                color-interpolation-filters="sRGB"
                              >
                                <feFlood
                                  flood-opacity="0"
                                  result="BackgroundImageFix"
                                />
                                <feColorMatrix
                                  in="SourceAlpha"
                                  type="matrix"
                                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                  result="hardAlpha"
                                />
                                <feOffset dy="1.34234" />
                                <feGaussianBlur stdDeviation="14.7658" />
                                <feColorMatrix
                                  type="matrix"
                                  values="0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.18 0"
                                />
                                <feBlend
                                  mode="normal"
                                  in2="BackgroundImageFix"
                                  result="effect1_dropShadow_98_379"
                                />
                                <feBlend
                                  mode="normal"
                                  in="SourceGraphic"
                                  in2="effect1_dropShadow_98_379"
                                  result="shape"
                                />
                              </filter>
                              <filter
                                id="filter3_d_98_379"
                                x="14.8981"
                                y="18.8606"
                                width="151.684"
                                height="111.28"
                                filterUnits="userSpaceOnUse"
                                color-interpolation-filters="sRGB"
                              >
                                <feFlood
                                  flood-opacity="0"
                                  result="BackgroundImageFix"
                                />
                                <feColorMatrix
                                  in="SourceAlpha"
                                  type="matrix"
                                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                  result="hardAlpha"
                                />
                                <feOffset dy="1.34234" />
                                <feGaussianBlur stdDeviation="14.7658" />
                                <feColorMatrix
                                  type="matrix"
                                  values="0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.18 0"
                                />
                                <feBlend
                                  mode="normal"
                                  in2="BackgroundImageFix"
                                  result="effect1_dropShadow_98_379"
                                />
                                <feBlend
                                  mode="normal"
                                  in="SourceGraphic"
                                  in2="effect1_dropShadow_98_379"
                                  result="shape"
                                />
                              </filter>
                              <filter
                                id="filter4_d_98_379"
                                x="19.0827"
                                y="42.084"
                                width="142.778"
                                height="93.5562"
                                filterUnits="userSpaceOnUse"
                                color-interpolation-filters="sRGB"
                              >
                                <feFlood
                                  flood-opacity="0"
                                  result="BackgroundImageFix"
                                />
                                <feColorMatrix
                                  in="SourceAlpha"
                                  type="matrix"
                                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                  result="hardAlpha"
                                />
                                <feOffset dy="-4.02703" />
                                <feGaussianBlur stdDeviation="8.72523" />
                                <feColorMatrix
                                  type="matrix"
                                  values="0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.27 0"
                                />
                                <feBlend
                                  mode="normal"
                                  in2="BackgroundImageFix"
                                  result="effect1_dropShadow_98_379"
                                />
                                <feBlend
                                  mode="normal"
                                  in="SourceGraphic"
                                  in2="effect1_dropShadow_98_379"
                                  result="shape"
                                />
                              </filter>
                              <filter
                                id="filter5_d_98_379"
                                x="-0.000295639"
                                y="46.2416"
                                width="180.948"
                                height="126.851"
                                filterUnits="userSpaceOnUse"
                                color-interpolation-filters="sRGB"
                              >
                                <feFlood
                                  flood-opacity="0"
                                  result="BackgroundImageFix"
                                />
                                <feColorMatrix
                                  in="SourceAlpha"
                                  type="matrix"
                                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                  result="hardAlpha"
                                />
                                <feOffset dy="14.7658" />
                                <feGaussianBlur stdDeviation="14.7658" />
                                <feColorMatrix
                                  type="matrix"
                                  values="0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.27 0"
                                />
                                <feBlend
                                  mode="normal"
                                  in2="BackgroundImageFix"
                                  result="effect1_dropShadow_98_379"
                                />
                                <feBlend
                                  mode="normal"
                                  in="SourceGraphic"
                                  in2="effect1_dropShadow_98_379"
                                  result="shape"
                                />
                              </filter>
                            </defs>
                          </svg>
                        </div>
                      </div>

                      {/* Card 3 - Recent Updates */}
                      <div className="group flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <div>
                          <p className="text-sm text-gray-500">
                            Recent Updates
                          </p>
                          <p className="mt-1 text-2xl font-extrabold text-gray-900">
                            {recentItems.length}
                          </p>
                          <p className=" text-xs text-gray-400">Last 7 days</p>
                        </div>
                        <div className="flex h-14 w-36 items-center justify-end pt-4  transition-transform duration-300 group-hover:scale-110">
                          <svg
                            width="151"
                            height="106"
                            viewBox="0 0 151 106"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M84.7488 14.5508H73.959V21.5732H84.7488V14.5508Z"
                              fill="#CAF4E7"
                            />
                            <path
                              d="M43.8513 28.534L37.9961 34.3862L42.2544 38.6424L48.1096 32.7902L43.8513 28.534Z"
                              fill="#CAF4E7"
                            />
                            <path
                              d="M112.319 32.3626L118.174 38.2148L121.989 34.402L116.133 28.5498L112.319 32.3626Z"
                              fill="#CAF4E7"
                            />
                            <g filter="url(#filter0_d_98_407)">
                              <path
                                d="M80.2324 124.148C108.919 124.148 132.174 100.904 132.174 72.232C132.174 43.5598 108.919 20.3164 80.2324 20.3164C51.546 20.3164 28.291 43.5598 28.291 72.232C28.291 100.904 51.546 124.148 80.2324 124.148Z"
                                fill="#047854"
                              />
                            </g>
                            <path
                              opacity="0.3"
                              d="M120.758 72.2298C120.758 72.7314 120.758 73.1076 120.758 73.6092C120.005 95.3034 102.189 112.734 80.2333 112.734C58.2774 112.734 40.4618 95.3034 39.709 73.6092C39.709 73.1076 39.709 72.7314 39.709 72.2298C39.709 50.4102 57.0228 32.478 78.7278 31.7256C79.2296 31.7256 79.7315 31.7256 80.2333 31.7256C102.44 31.7256 120.381 49.5324 120.758 71.4774C120.758 71.7282 120.758 71.979 120.758 72.2298Z"
                              fill="#CAF4E7"
                            />
                            <path
                              d="M120.758 73.6133C120.005 95.3074 102.189 112.738 80.2333 112.738C58.2774 112.738 40.4618 95.3074 39.709 73.6133C40.4618 51.9191 58.2774 34.4885 80.2333 34.4885C102.189 34.3631 120.005 51.7937 120.758 73.6133Z"
                              fill="#F3FFFB"
                            />
                            <path
                              d="M115.362 74.2355H108.712C107.583 74.2355 106.705 73.3577 106.705 72.2291C106.705 71.1005 107.583 70.2227 108.712 70.2227H115.362C116.491 70.2227 117.369 71.1005 117.369 72.2291C117.369 73.3577 116.366 74.2355 115.362 74.2355Z"
                              fill="#CAF4E7"
                            />
                            <path
                              d="M49.7448 74.2355H43.0953C41.9661 74.2355 41.0879 73.3577 41.0879 72.2291C41.0879 71.1005 41.9661 70.2227 43.0953 70.2227H49.7448C50.874 70.2227 51.7522 71.1005 51.7522 72.2291C51.7522 73.3577 50.7485 74.2355 49.7448 74.2355Z"
                              fill="#CAF4E7"
                            />
                            <path
                              d="M79.2281 110.478C78.0989 110.478 77.2207 109.6 77.2207 108.471V101.825C77.2207 100.697 78.0989 99.8188 79.2281 99.8188C80.3573 99.8188 81.2355 100.697 81.2355 101.825V108.471C81.11 109.6 80.2318 110.478 79.2281 110.478Z"
                              fill="#CAF4E7"
                            />
                            <path
                              d="M79.2281 44.8949C78.0989 44.8949 77.2207 44.0171 77.2207 42.8885V36.3677C77.2207 35.2391 78.0989 34.3613 79.2281 34.3613C80.3573 34.3613 81.2355 35.2391 81.2355 36.3677V43.0139C81.11 44.0171 80.2318 44.8949 79.2281 44.8949Z"
                              fill="#CAF4E7"
                            />
                            <path
                              d="M79.7277 77.7506C83.123 77.7506 85.8754 74.9996 85.8754 71.606C85.8754 68.2125 83.123 65.4614 79.7277 65.4614C76.3325 65.4614 73.5801 68.2125 73.5801 71.606C73.5801 74.9996 76.3325 77.7506 79.7277 77.7506Z"
                              fill="#CAF4E7"
                            />
                            <path
                              opacity="0.3"
                              d="M113.12 74.5282C113.079 73.6119 112.367 72.8302 111.538 72.7913L82.0561 72.1547C81.977 72.0679 81.977 72.0679 81.8979 71.981C80.8696 70.852 79.2106 70.7741 78.0822 71.8018C77.9954 71.8808 77.9086 71.9599 77.8218 72.0389L73.0898 71.8998C72.1735 71.9399 71.3922 72.6514 71.3537 73.4809C71.3305 73.9786 71.481 74.3182 71.7974 74.6656C72.1138 75.013 72.517 75.2814 72.9356 75.2179L77.6676 75.357C77.7467 75.4439 77.8258 75.5307 77.8258 75.5307C78.854 76.6597 80.513 76.7377 81.6415 75.7099C81.7283 75.6309 81.8151 75.5518 81.9019 75.4728L111.297 76.1884C112.379 76.1561 113.16 75.4446 113.12 74.5282Z"
                              fill="#CAF4E7"
                            />
                            <path
                              d="M113.046 72.5253C113.005 71.6089 112.293 70.8273 111.464 70.7883L81.9818 70.1518C81.9027 70.0649 81.9028 70.0649 81.8237 69.9781C80.7954 68.8491 79.1364 68.7711 78.008 69.7989C77.9212 69.8779 77.8343 69.957 77.7475 70.036L73.0156 69.8969C72.0992 69.937 71.318 70.6485 71.2795 71.478C71.2563 71.9757 71.4068 72.3153 71.7232 72.6627C72.0396 73.0101 72.4428 73.2784 72.8614 73.215L77.5933 73.3541C77.6724 73.4409 77.7515 73.5278 77.7515 73.5278C78.7798 74.6568 80.4388 74.7347 81.5672 73.707C81.654 73.628 81.7408 73.5489 81.8276 73.4698L111.223 74.1855C112.305 74.1532 113.007 73.3548 113.046 72.5253Z"
                              fill="#047854"
                            />
                            <path
                              d="M89.8912 4.6398V11.4114C89.8912 14.0448 87.7583 16.0512 85.2491 16.0512H73.7066C71.0718 16.0512 69.0645 13.9194 69.0645 11.4114V4.6398C69.0645 2.0064 71.1973 0 73.7066 0H85.2491C87.8838 0 89.8912 2.1318 89.8912 4.6398Z"
                              fill="#047854"
                            />
                            <path
                              d="M44.9753 29.0953L38.7022 35.3653C37.3221 36.7447 35.0638 36.7447 33.5582 35.3653L29.9198 31.7287C28.5397 30.3493 28.5397 28.0921 29.9198 26.5873L36.1929 20.3173C37.573 18.9379 39.8314 18.9379 41.3369 20.3173L44.9753 23.9539C46.3554 25.4587 46.3554 27.7159 44.9753 29.0953Z"
                              fill="#047854"
                            />
                            <path
                              d="M114.984 29.0953L121.257 35.3653C122.637 36.7447 124.896 36.7447 126.401 35.3653L130.04 31.7287C131.42 30.3493 131.42 28.0921 130.04 26.5873L123.767 20.3173C122.387 18.9379 120.128 18.9379 118.623 20.3173L114.984 23.9539C113.604 25.4587 113.604 27.7159 114.984 29.0953Z"
                              fill="#047854"
                            />
                            <path
                              d="M79.479 72.1135C79.6538 72.3053 79.9509 72.3192 80.1428 72.1445C80.3347 71.9697 80.3485 71.6726 80.1738 71.4807C79.9991 71.2888 79.7019 71.2749 79.51 71.4497C79.3182 71.6244 79.3043 71.9216 79.479 72.1135Z"
                              fill="white"
                            />
                            <defs>
                              <filter
                                id="filter0_d_98_407"
                                x="-0.000747681"
                                y="6.17052"
                                width="160.466"
                                height="160.415"
                                filterUnits="userSpaceOnUse"
                                color-interpolation-filters="sRGB"
                              >
                                <feFlood
                                  flood-opacity="0"
                                  result="BackgroundImageFix"
                                />
                                <feColorMatrix
                                  in="SourceAlpha"
                                  type="matrix"
                                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                  result="hardAlpha"
                                />
                                <feOffset dy="14.1459" />
                                <feGaussianBlur stdDeviation="14.1459" />
                                <feColorMatrix
                                  type="matrix"
                                  values="0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.27 0"
                                />
                                <feBlend
                                  mode="normal"
                                  in2="BackgroundImageFix"
                                  result="effect1_dropShadow_98_407"
                                />
                                <feBlend
                                  mode="normal"
                                  in="SourceGraphic"
                                  in2="effect1_dropShadow_98_407"
                                  result="shape"
                                />
                              </filter>
                            </defs>
                          </svg>
                        </div>
                      </div>

                      {/* Card 4 - Platform Tools */}
                      <div className="group flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <div>
                          <p className="text-sm text-gray-500">
                            Platform Tools
                          </p>
                          <p className="mt-1 text-2xl font-extrabold text-gray-900">
                            {stats?.activeTools || 2}
                          </p>
                          <p className=" text-xs text-gray-400">
                            More coming soon
                          </p>
                        </div>
                        <div className="flex h-14 w-28 items-center justify-center pt-4 transition-transform duration-300 group-hover:scale-110">
                          <svg
                            width="128"
                            height="114"
                            viewBox="0 0 128 114"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M54.4351 118.405H17.0366C12.3781 118.405 8.60156 114.628 8.60156 109.97V72.5712C8.60156 67.9127 12.3781 64.1362 17.0366 64.1362H62.8701V109.97C62.8701 114.628 59.0936 118.405 54.4351 118.405Z"
                              fill="#FFCD01"
                            />
                            <path
                              d="M54.4353 119.029H17.0366C12.0408 119.029 7.97656 114.965 7.97656 109.969V72.5703C7.97656 67.5745 12.0408 63.5103 17.0366 63.5103H62.8701C63.2153 63.5103 63.4951 63.79 63.4951 64.1353V109.969C63.4951 114.965 59.4311 119.029 54.4353 119.029ZM17.0366 64.76C12.7301 64.76 9.22656 68.2638 9.22656 72.57V109.969C9.22656 114.275 12.7301 117.779 17.0366 117.779H54.4353C58.7418 117.779 62.2453 114.275 62.2453 109.969V64.76H17.0366Z"
                              fill="#FFCD01"
                            />
                            <path
                              d="M55.7195 88.0116C55.9985 88.4148 56.6307 88.2174 56.6307 87.7271V70.8716C56.6307 70.5954 56.4068 70.3716 56.1307 70.3716H18.7932C16.6077 70.3716 14.8359 72.1433 14.8359 74.3288V89.4943C14.8359 89.9386 15.3721 90.1622 15.6878 89.8496L27.4042 78.2445C27.5957 78.0549 27.9029 78.0511 28.099 78.2359L45.9882 95.0942C46.1834 95.2781 46.4888 95.2753 46.6806 95.0879L54.5701 87.3766C54.7915 87.1602 55.1545 87.195 55.3307 87.4497L55.7195 88.0116Z"
                              fill="#FFF6D2"
                            />
                            <path
                              d="M54.4607 101.414L46.4907 109.384L27.6187 91.5674L14.8359 104.247V108.21C14.8359 110.396 16.6077 112.168 18.7932 112.168H52.6734C54.8589 112.168 56.6307 110.396 56.6307 108.21L56.6412 103.917L54.4607 101.414Z"
                              fill="#FFF6D2"
                            />
                            <path
                              d="M52.6734 112.416H18.7932C16.4732 112.416 14.5859 110.528 14.5859 108.209V104.245C14.5859 104.178 14.6124 104.115 14.6599 104.068L27.4424 91.388C27.5379 91.293 27.6922 91.291 27.7902 91.3835L46.4857 109.033L54.2837 101.235C54.3327 101.187 54.3997 101.156 54.4689 101.162C54.5382 101.165 54.6034 101.196 54.6489 101.248L56.8294 103.751C56.8692 103.797 56.8912 103.855 56.8909 103.916L56.8804 108.21C56.8807 110.528 54.9932 112.416 52.6734 112.416ZM15.0859 104.349V108.209C15.0859 110.253 16.7489 111.916 18.7932 111.916H52.6734C54.7177 111.916 56.3807 110.253 56.3807 108.209L56.3909 104.009L54.4482 101.778L46.6677 109.559C46.5722 109.654 46.4177 109.657 46.3192 109.564L27.6229 91.9135L15.0859 104.349Z"
                              fill="#FFF6D2"
                            />
                            <path
                              d="M48.671 73.2173C51.3663 73.2173 53.551 75.4023 53.551 78.0973C53.551 80.7925 51.3663 82.9773 48.671 82.9773C45.9758 82.9773 43.791 80.7923 43.791 78.0973C43.791 75.4023 45.976 73.2173 48.671 73.2173Z"
                              fill="#FFCD01"
                            />
                            <path
                              d="M48.6713 83.2295C45.8425 83.2295 43.541 80.9282 43.541 78.0992C43.541 75.2707 45.8425 72.9692 48.6713 72.9692C51.5 72.9692 53.8013 75.2705 53.8013 78.0992C53.8013 80.9282 51.4998 83.2295 48.6713 83.2295ZM48.6713 73.4695C46.1183 73.4695 44.041 75.5465 44.041 78.0995C44.041 80.6525 46.118 82.7297 48.6713 82.7297C51.2243 82.7297 53.3013 80.6525 53.3013 78.0995C53.3013 75.5465 51.224 73.4695 48.6713 73.4695Z"
                              fill="#FFF6D2"
                            />
                            <path
                              d="M109.527 63.914H63.6934V18.0805C63.6934 13.422 67.4699 9.64551 72.1284 9.64551H109.527C114.186 9.64551 117.962 13.422 117.962 18.0805V55.4793C117.962 60.1378 114.186 63.914 109.527 63.914Z"
                              fill="#FFCD01"
                            />
                            <path
                              d="M109.529 64.5336H63.6953C63.3501 64.5336 63.0703 64.2539 63.0703 63.9086V18.0749C63.0703 13.0794 67.1346 9.01514 72.1303 9.01514H109.529C114.525 9.01514 118.589 13.0794 118.589 18.0749V55.4736C118.589 60.4694 114.525 64.5336 109.529 64.5336ZM64.3203 63.2836H109.529C113.835 63.2836 117.339 59.7799 117.339 55.4736V18.0749C117.339 13.7684 113.835 10.2651 109.529 10.2651H72.1303C67.8238 10.2651 64.3203 13.7686 64.3203 18.0749V63.2836Z"
                              fill="#FFCD01"
                            />
                            <path
                              d="M111.726 19.8425C111.726 17.657 109.955 15.8853 107.769 15.8853H73.8889C71.7034 15.8853 69.9316 17.657 69.9316 19.8425V57.68H107.769C109.955 57.68 111.726 55.9083 111.726 53.7228V19.8425Z"
                              fill="#FFF6D2"
                            />
                            <path
                              d="M107.769 57.9278H69.9316C69.7936 57.9278 69.6816 57.8161 69.6816 57.6778V19.8406C69.6816 17.5208 71.5689 15.6333 73.8889 15.6333H107.769C110.089 15.6333 111.976 17.5208 111.976 19.8406V53.7208C111.976 56.0406 110.089 57.9278 107.769 57.9278ZM70.1816 57.4278H107.769C109.813 57.4278 111.476 55.7648 111.476 53.7206V19.8406C111.476 17.7963 109.813 16.1333 107.769 16.1333H73.8889C71.8446 16.1333 70.1816 17.7963 70.1816 19.8406V57.4278Z"
                              fill="#FFF6D2"
                            />
                            <path
                              d="M84.9986 49.666V48.023H88.4775V25.6093H80.8288V31.04H78.5918V24.0088H103.061V31.04H100.824V25.6093H93.2603V48.023H96.7818V49.666H84.9986Z"
                              fill="#FFCD01"
                            />
                            <path
                              d="M96.7818 49.9141H84.9986C84.8606 49.9141 84.7486 49.8023 84.7486 49.6641V48.0211C84.7486 47.8828 84.8606 47.7711 84.9986 47.7711H88.2278V25.8573H81.0788V31.0383C81.0788 31.1766 80.9668 31.2883 80.8288 31.2883H78.5918C78.4538 31.2883 78.3418 31.1766 78.3418 31.0383V24.0068C78.3418 23.8686 78.4538 23.7568 78.5918 23.7568H103.061C103.199 23.7568 103.311 23.8686 103.311 24.0068V31.0381C103.311 31.1763 103.199 31.2881 103.061 31.2881H100.824C100.686 31.2881 100.574 31.1763 100.574 31.0381V25.8571H93.5103V47.7708H96.7818C96.9198 47.7708 97.0318 47.8826 97.0318 48.0208V49.6638C97.0318 49.8023 96.9198 49.9141 96.7818 49.9141ZM85.2486 49.4141H96.5318V48.2711H93.2603C93.1223 48.2711 93.0103 48.1593 93.0103 48.0211V25.6073C93.0103 25.4691 93.1223 25.3573 93.2603 25.3573H100.824C100.962 25.3573 101.074 25.4691 101.074 25.6073V30.7883H102.811V24.2568H78.8418V30.7881H80.5788V25.6071C80.5788 25.4688 80.6908 25.3571 80.8288 25.3571H88.4775C88.6155 25.3571 88.7275 25.4688 88.7275 25.6071V48.0208C88.7275 48.1591 88.6155 48.2708 88.4775 48.2708H85.2483V49.4141H85.2486Z"
                              fill="#FFCD01"
                            />
                            <path
                              d="M48.5149 9.67139H12.6074C9.846 9.67139 7.60742 11.91 7.60742 14.6714V50.5789C7.60742 53.3403 9.846 55.5789 12.6074 55.5789H48.5149C51.2763 55.5789 53.5149 53.3403 53.5149 50.5789V14.6714C53.5149 11.91 51.2763 9.67139 48.5149 9.67139Z"
                              fill="#FFCD01"
                            />
                            <path
                              d="M44.9706 16H16.1523C15.0478 16 14.1523 16.8954 14.1523 18V46.8183C14.1523 47.9228 15.0478 48.8183 16.1523 48.8183H44.9706C46.0752 48.8183 46.9706 47.9228 46.9706 46.8183V18C46.9706 16.8954 46.0752 16 44.9706 16Z"
                              fill="#FFF6D2"
                            />
                            <g clip-path="url(#clip0_98_440)">
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M24.5585 20.0283H32.4132L39.0703 26.9672V40.4634C39.0703 42.1541 37.7025 43.5219 36.0177 43.5219H24.5585C22.8678 43.5219 21.5 42.1541 21.5 40.4634V23.0868C21.5 21.3961 22.8678 20.0283 24.5585 20.0283Z"
                                fill="#FFCD01"
                              />
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M32.4082 20.0283V26.9144H39.0712L32.4082 20.0283Z"
                                fill="white"
                                fill-opacity="0.301961"
                              />
                              <path
                                d="M24.8984 37.5574V33.2661H26.7242C27.1762 33.2661 27.5343 33.3894 27.8043 33.6418C28.0744 33.8884 28.2094 34.223 28.2094 34.6398C28.2094 35.0566 28.0744 35.3912 27.8043 35.6378C27.5343 35.8902 27.1762 36.0135 26.7242 36.0135H25.9962V37.5574H24.8984ZM25.9962 35.0801H26.6009C26.7652 35.0801 26.8944 35.0449 26.9825 34.9627C27.0705 34.8864 27.1175 34.7807 27.1175 34.6398C27.1175 34.4989 27.0705 34.3932 26.9825 34.3169C26.8944 34.2347 26.7652 34.1995 26.6009 34.1995H25.9962V35.0801ZM28.6614 37.5574V33.2661H30.1819C30.4813 33.2661 30.763 33.3072 31.0272 33.3953C31.2914 33.4833 31.5321 33.6066 31.7434 33.7768C31.9547 33.9412 32.125 34.1643 32.2483 34.4461C32.3657 34.7279 32.4302 35.0507 32.4302 35.4147C32.4302 35.7728 32.3657 36.0957 32.2483 36.3775C32.125 36.6592 31.9547 36.8823 31.7434 37.0467C31.5321 37.2169 31.2914 37.3402 31.0272 37.4283C30.763 37.5163 30.4813 37.5574 30.1819 37.5574H28.6614ZM29.7357 36.624H30.0527C30.223 36.624 30.3815 36.6064 30.5282 36.5653C30.6691 36.5242 30.8041 36.4596 30.9333 36.3716C31.0566 36.2835 31.1564 36.1603 31.2268 35.9959C31.2972 35.8315 31.3325 35.6378 31.3325 35.4147C31.3325 35.1858 31.2972 34.992 31.2268 34.8277C31.1564 34.6633 31.0566 34.54 30.9333 34.4519C30.8041 34.3639 30.6691 34.2993 30.5282 34.2582C30.3815 34.2171 30.223 34.1995 30.0527 34.1995H29.7357V36.624ZM32.9821 37.5574V33.2661H36.0347V34.1995H34.0799V34.8864H35.6414V35.8139H34.0799V37.5574H32.9821Z"
                                fill="white"
                              />
                            </g>
                            <path
                              d="M113.546 71.9043H77.6387C74.8772 71.9043 72.6387 74.1429 72.6387 76.9043V112.812C72.6387 115.573 74.8773 117.812 77.6387 117.812H113.546C116.308 117.812 118.546 115.573 118.546 112.812V76.9043C118.546 74.1429 116.308 71.9043 113.546 71.9043Z"
                              fill="#FFCD01"
                            />
                            <path
                              d="M110 78.4531H81.1816C80.0771 78.4531 79.1816 79.3486 79.1816 80.4531V109.271C79.1816 110.376 80.0771 111.271 81.1816 111.271H110C111.104 111.271 112 110.376 112 109.271V80.4531C112 79.3486 111.104 78.4531 110 78.4531Z"
                              fill="#FFF6D2"
                            />
                            <g clip-path="url(#clip1_98_440)">
                              <path
                                d="M90.9429 83.1162C90.8816 83.1816 90.8438 83.2693 90.8438 83.3659V85.9282H98.7909L90.9429 83.1162Z"
                                fill="#FFCD01"
                              />
                              <path
                                d="M103.679 83H91.7539L99.5879 85.8069C99.8848 85.9133 100.084 86.1967 100.084 86.512V103.064H103.679C103.88 103.064 104.044 102.9 104.044 102.698V83.3658C104.044 83.1641 103.88 83 103.679 83Z"
                                fill="#FFCD01"
                              />
                              <path
                                d="M86.8659 86.3115C86.6642 86.3115 86.5 86.4756 86.5 86.6773V106.009C86.5 106.211 86.6642 106.375 86.8659 106.375H99.336C99.5377 106.375 99.7018 106.211 99.7018 106.009V86.5123C99.7018 86.4394 99.6799 86.3699 99.6415 86.3115H86.8659ZM89.2426 87.849H96.9591C97.6145 87.849 98.1458 88.5196 98.1458 89.347C98.1458 90.1743 97.6145 90.845 96.9591 90.845H89.2426C88.5873 90.845 88.056 90.1743 88.056 89.347C88.056 88.5196 88.5873 87.849 89.2426 87.849ZM96.9035 93.1573C96.9035 93.2631 96.8177 93.3489 96.7119 93.3489H92.9541C92.8483 93.3489 92.7625 93.2631 92.7625 93.1573C92.7625 93.0515 92.8483 92.9657 92.9541 92.9657H96.7119C96.8177 92.9657 96.9035 93.0515 96.9035 93.1573ZM88.056 92.5767C88.056 92.2688 88.3055 92.0193 88.6134 92.0193H91.2703C91.5781 92.0193 91.8277 92.2688 91.8277 92.5767V95.2336C91.8277 95.5414 91.5781 95.791 91.2703 95.791H88.6134C88.3055 95.791 88.056 95.5414 88.056 95.2336V92.5767ZM96.7119 102.013C96.8177 102.013 96.9035 102.098 96.9035 102.204C96.9035 102.31 96.8177 102.396 96.7119 102.396H92.9541C92.8483 102.396 92.7625 102.31 92.7625 102.204C92.7625 102.098 92.8483 102.013 92.9541 102.013H96.7119ZM94.3741 99.757V97.1001C94.3741 96.7923 94.6236 96.5427 94.9315 96.5427H97.5884C97.8962 96.5427 98.1458 96.7923 98.1458 97.1001V99.757C98.1458 100.065 97.8962 100.314 97.5884 100.314H94.9315C94.6237 100.314 94.3741 100.065 94.3741 99.757ZM93.2477 97.4891C93.3535 97.4891 93.4392 97.5749 93.4392 97.6807C93.4392 97.7865 93.3535 97.8723 93.2477 97.8723H89.4899C89.3841 97.8723 89.2983 97.7865 89.2983 97.6807C89.2983 97.5749 89.3841 97.4891 89.4899 97.4891H93.2477ZM87.8644 99.1764C87.8644 99.0706 87.9502 98.9848 88.056 98.9848H93.2477C93.3535 98.9848 93.4392 99.0706 93.4392 99.1764C93.4392 99.2822 93.3535 99.368 93.2477 99.368H88.056C87.9502 99.368 87.8644 99.2822 87.8644 99.1764ZM91.8277 104.28C91.8277 104.588 91.5781 104.838 91.2703 104.838H88.6134C88.3055 104.838 88.056 104.588 88.056 104.28V101.624C88.056 101.316 88.3055 101.066 88.6134 101.066H91.2703C91.5781 101.066 91.8277 101.316 91.8277 101.624V104.28ZM98.1458 103.891H92.9541C92.8483 103.891 92.7625 103.806 92.7625 103.7C92.7625 103.594 92.8483 103.508 92.9541 103.508H98.1458C98.2516 103.508 98.3374 103.594 98.3374 103.7C98.3374 103.806 98.2516 103.891 98.1458 103.891ZM98.1458 94.8446H92.9541C92.8483 94.8446 92.7625 94.7588 92.7625 94.653C92.7625 94.5472 92.8483 94.4614 92.9541 94.4614H98.1458C98.2516 94.4614 98.3374 94.5472 98.3374 94.653C98.3374 94.7588 98.2516 94.8446 98.1458 94.8446Z"
                                fill="#FFCD01"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_98_440">
                                <rect
                                  width="17.5703"
                                  height="23.5497"
                                  fill="white"
                                  transform="translate(21.5 20)"
                                />
                              </clipPath>
                              <clipPath id="clip1_98_440">
                                <rect
                                  width="17.5452"
                                  height="23.375"
                                  fill="white"
                                  transform="translate(86.5 83)"
                                />
                              </clipPath>
                            </defs>
                          </svg>
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
            className="mb-10 mt-36 focus:outline-none focus-visible:outline-none"
            style={{ outline: 'none' }}
          >
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
                        className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border-0 bg-gradient-to-br from-[#A0A0FF] via-[#d8d3fb] to-[#F3F1FF] p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                        onClick={() => setShowCataloguesModal(true)}
                      >
                        <div className="relative flex items-center gap-6">
                          {/* Left text content */}
                          <div className="flex-1">
                            <p className="text-2xl font-bold leading-tight text-gray-900">
                              Catalogue Builder
                            </p>

                            <p className="mt-3 max-w-xl text-sm text-gray-700">
                              Create beautiful, professional catalogues with
                              AI-powered descriptions and on-brand layouts.
                            </p>
                          </div>

                          {/* Right visual - SVG background with catalogue image overlay */}
                          <div className="relative h-44 w-64 flex-shrink-0 ">
                            {/* Decorative SVG shape (provided) */}
                            <svg
                              className="absolute -right-16 -top-6 z-0 h-[240px] w-[420px] overflow-visible"
                              viewBox="0 0 447 227"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M-0.000206942 226.311C0.186658 225.979 0.376252 225.645 0.567472 225.313C29.6378 174.8 90.9765 154.444 143.604 175.292C98.9539 140.737 85.5422 77.6592 114.495 27.351C146.113 -27.5894 216.282 -46.4958 271.223 -14.8777L272.218 -14.3052C217.06 -46.0485 197.862 -116.264 228.999 -171.603L626.904 57.3909C594.698 112.115 524.344 130.793 469.185 99.0494L470.18 99.6219C525.12 131.24 544.027 201.41 512.408 256.35C483.456 306.658 422.179 326.753 369.869 305.508C414.334 340.537 427.552 403.799 398.481 454.312C398.29 454.645 398.097 454.976 397.905 455.305L-0.000206942 226.311Z"
                                fill="#A0A0FF"
                              />
                            </svg>

                            {/* Catalogue image overlay - sits above SVG */}
                            <div className="absolute -right-6 top-2 z-10 h-48 w-72  transform overflow-visible  rounded-xl">
                              <Image
                                src="/assets/catalogue_preview.png"
                                alt="Catalogue preview"
                                width={430}
                                height={320}
                                className="h-full w-full rounded-xl object-cover"
                                priority
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}

                    {showPdf && (
                      <Card className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border-0 bg-gradient-to-br from-[#E9B8FF] via-[#f2d7fe] to-[#F9ECFF] p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                        <div className="relative flex items-center gap-6">
                          {/* Left text */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-2xl font-bold text-gray-900">
                                PDF Editor
                              </h3>
                              <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-purple-700 shadow">
                                Coming Soon
                              </span>
                            </div>

                            <p className="mt-3 max-w-xl text-sm text-gray-700">
                              Advanced PDF editing for creating, updating and
                              managing documents launching soon.
                            </p>
                          </div>

                          {/* Right visual: SVG decorative background + single overlay preview (match Catalogue layout) */}
                          <div className="relative h-44 w-64 flex-shrink-0">
                            {/* SVG decorative shape (same vector provided) */}
                            <svg
                              className="absolute -right-16 -top-6 z-0 h-[240px] w-[420px] overflow-visible"
                              viewBox="0 0 447 227"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M-0.000206942 226.311C0.186658 225.979 0.376252 225.645 0.567472 225.313C29.6378 174.8 90.9765 154.444 143.604 175.292C98.9539 140.737 85.5422 77.6592 114.495 27.351C146.113 -27.5894 216.282 -46.4958 271.223 -14.8777L272.218 -14.3052C217.06 -46.0485 197.862 -116.264 228.999 -171.603L626.904 57.3909C594.698 112.115 524.344 130.793 469.185 99.0494L470.18 99.6219C525.12 131.24 544.027 201.41 512.408 256.35C483.456 306.658 422.179 326.753 369.869 305.508C414.334 340.537 427.552 403.799 398.481 454.312C398.29 454.645 398.097 454.976 397.905 455.305L-0.000206942 226.311Z"
                                fill="#E9B8FF"
                              />
                            </svg>

                            {/* Single overlay preview (matches Catalogue card composition) */}
                            <div className="absolute -right-8 top-10 z-10 h-40 w-[17rem] transform overflow-visible rounded-xl">
                              <Image
                                src="/assets/pdf_preview.png"
                                alt="PDF preview"
                                width={430}
                                height={320}
                                className="h-full w-full rounded-xl object-cover"
                                priority
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </>
                )
              })()}
            </div>
          </div>

          {/* Recent Work Section - Full Width */}
          <div className="py-4">
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

            {/* Recent Activity Cards Grid - Bigger Cards */}
            {recentItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recentItems.slice(0, 8).map(item => {
                  const catalogue = catalogues.find(c => c.id === item.id)
                  if (!catalogue) return null

                  return (
                    <Card
                      key={catalogue.id}
                      className="group relative cursor-pointer overflow-hidden rounded-[1.6rem]  bg-white  shadow-md transition-all duration-300 hover:shadow-xl "
                      onClick={() =>
                        router.push(`/catalogue/${catalogue.id}/preview`)
                      }
                    >
                      <div className="relative h-36 rounded-[2rem] bg-gradient-to-br from-gray-50/30 to-white/50 p-4 md:h-40 lg:h-56">
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
                        <div className="duration-400 absolute right-4 top-3 flex translate-x-3 gap-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 border border-blue-100/50 bg-white/90 p-1.5 text-blue-600 shadow-md backdrop-blur-md transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                            onClick={(e: any) => {
                              e.stopPropagation()
                              router.push(`/catalogue/${catalogue.id}/preview`)
                            }}
                            title="Edit Project"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 border border-green-100/50 bg-white/90 p-1.5 text-green-600 shadow-md backdrop-blur-md transition-all duration-200 hover:bg-green-50 hover:text-green-700"
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
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 border border-red-100/50 bg-white/90 p-1.5 text-red-600 shadow-md backdrop-blur-md transition-all duration-200 hover:bg-red-50 hover:text-red-700"
                            onClick={(e: any) => {
                              e.stopPropagation()
                              deleteCatalogue(catalogue.id)
                            }}
                            title="Delete Project"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-0 px-4 pb-4 pt-1">
                        <div className="">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {catalogue.name}
                          </h3>
                        </div>

                        {catalogue.description && (
                          <p className="mb-4 text-sm text-gray-600">
                            {catalogue.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
                          <Badge
                            className={`rounded-full px-2.5 py-[2.5px] pr-3 text-xs font-medium ${
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
