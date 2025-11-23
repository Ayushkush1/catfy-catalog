'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signOut, isClientAdmin } from '@/lib/client-auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ActiveUsersNavbar } from '@/components/editor/ActiveUsersNavbar'
import { PresenceUser } from '@/hooks/useCataloguePresence'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  Crown,
  HelpCircle,
  FileText,
  Search,
  Bell,
  Sparkles,
  Package,
  Edit,
  Eye,
  Save,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'
import { DashboardHeader } from './dashboard/DashboardHeader'
import { Skeleton } from '@/components/ui/skeleton'

interface HeaderProps {
  title?: string
  showBackButton?: boolean
  backHref?: string
  catalogueName?: string
  lastUpdated?: string
  showGradientBanner?: boolean
  onPreview?: () => void
  onSave?: () => void
  isSaving?: boolean
  hasPremiumAccess?: boolean
  activeUsers?: PresenceUser[]
  isTrackingPresence?: boolean
}

interface UserProfile {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  subscriptionPlan: string
}

export function Header({
  title,
  showBackButton = false,
  backHref = '/dashboard',
  catalogueName,
  lastUpdated,
  showGradientBanner = false,
  onPreview,
  onSave,
  isSaving = false,
  hasPremiumAccess = false,
  activeUsers = [],
  isTrackingPresence = false,
}: HeaderProps) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Check if user is admin
          const adminStatus = await isClientAdmin()
          setIsAdmin(adminStatus)

          // Fetch user profile
          const response = await fetch('/api/auth/profile')
          if (response.ok) {
            const data = await response.json()

            // If user is admin, set plan to BUSINESS (unlimited)
            if (adminStatus) {
              setProfile({
                ...data.profile,
                subscriptionPlan: 'BUSINESS',
              })
            } else {
              setProfile(data.profile)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')

      // Redirect based on user type
      if (isAdmin) {
        window.location.href = '/admin/login'
      } else {
        window.location.href = '/auth/login'
      }
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Error signing out')
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'monthly':
      case 'yearly':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <>
        <header className="border-b border-gray-200 bg-[#E8EAF6]">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {showBackButton && (
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-300" />
                )}
                <div className="h-6 w-32 animate-pulse rounded bg-gray-300" />
              </div>
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300" />
            </div>
          </div>
        </header>

        {showGradientBanner && (
          <div className="bg-[#E8EAF6] pt-2">
            <div className="mx-8 h-40 rounded-t-[3rem] px-8 pt-8">
              <div className="container mx-auto">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-48" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-28" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <DashboardHeader />

      {/* Gradient Banner Section for Edit Catalogue */}
      {showGradientBanner && (
        <div className=" pt-2">
          <div className="mx-8 h-40 rounded-t-[3rem] bg-gradient-to-r from-[#2D1B69] to-[#6366F1] px-8 pt-8 text-white">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <div className="mb-3 flex flex-col gap-2">
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <h1 className="text-3xl font-bold">
                          {title || 'Edit Catalogue'}
                        </h1>
                        {hasPremiumAccess && (
                          <div className="flex items-center gap-1.5 rounded-full border border-purple-300/30 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 backdrop-blur-sm">
                            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                            <span className="text-xs font-semibold text-white">
                              Premium Access
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-purple-100">
                        <span className="font-medium text-white">
                          {catalogueName}
                        </span>
                        {lastUpdated && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Last updated {lastUpdated}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Action Buttons and Decorative Icon */}
                <div className="flex items-center gap-6">
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/20"
                      onClick={onPreview}
                      disabled={!onPreview}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="bg-white font-medium text-[#2D1B69] hover:bg-white/90"
                      onClick={onSave}
                      disabled={isSaving || !onSave}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
