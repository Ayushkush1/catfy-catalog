'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signOut, isClientAdmin } from '@/lib/client-auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
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
  X,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useNotifications } from '@/contexts/NotificationsContext'
import { useProfileQuery } from '@/hooks/queries'

interface UserProfile {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  subscriptionPlan: string
}

interface DashboardHeaderProps {
  title?: string
  subtitle?: string
}

export function DashboardHeader({
  title,
  subtitle,
}: DashboardHeaderProps = {}) {
  // Use React Query for instant cached profile data
  const { data: profileData, isLoading: profileLoading } = useProfileQuery()

  const [search, setSearch] = useState('')
  const searchDebounceRef = useRef<number | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const profile = profileData?.profile || null

  const router = useRouter()
  const supabase = createClient()
  const { openDrawer, unreadCount } = useNotifications()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const adminStatus = await isClientAdmin()
          setIsAdmin(adminStatus)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [])

  useEffect(() => {
    // debounce live search dispatch (event-only; do not update URL)
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current)
    }
    searchDebounceRef.current = window.setTimeout(() => {
      try {
        window.dispatchEvent(
          new CustomEvent('dashboard:search', { detail: { query: search } })
        )
      } catch (e) {
        // ignore
      }
    }, 300)

    return () => {
      if (searchDebounceRef.current)
        window.clearTimeout(searchDebounceRef.current)
    }
  }, [search])

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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  // Smooth scroll helper with easing and offset (for fixed header)
  const smoothScrollTo = (
    target: HTMLElement,
    offset = 120,
    duration = 700
  ) => {
    const start = window.scrollY || window.pageYOffset
    const rect = target.getBoundingClientRect()
    const targetY = start + rect.top - offset
    const startTime = performance.now()

    const easeInOutQuad = (t: number) => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    }

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeInOutQuad(progress)
      window.scrollTo(0, Math.round(start + (targetY - start) * eased))
      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        try {
          target.focus()
        } catch (e) {
          /* ignore focus errors */
        }
      }
    }

    requestAnimationFrame(step)
  }

  if (isLoading) {
    return (
      <header className="bg-transparent">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
          </div>
        </div>
      </header>
    )
  }

  if (!user) {
    return null
  }

  return (
    <header className="border-none bg-transparent">
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Left Section - Title or Greeting */}
          <div className="flex flex-col">
            {title ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600">{subtitle}</p>
                )}
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getGreeting()}, {profile?.fullName?.split(' ')[0] || 'David'}
                </h1>
                <p className="text-sm text-gray-600">
                  Your weekly creative update
                </p>
              </>
            )}
          </div>

          {/* Right Section - Search and Profile */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    // immediate dispatch for in-page filtering (no URL navigation)
                    if (searchDebounceRef.current)
                      window.clearTimeout(searchDebounceRef.current)
                    try {
                      window.dispatchEvent(
                        new CustomEvent('dashboard:search', {
                          detail: { query: search },
                        })
                      )
                    } catch (err) {}
                    // scroll to tools section on Enter so results are visible
                    try {
                      const el = document.getElementById('tools-section')
                      if (el) {
                        el.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        })
                        // ensure focus for screen readers
                        ;(el as HTMLElement).focus()

                        // rely on smooth scroll + focus; no temporary highlight
                      }
                    } catch (err) {
                      // ignore if DOM not available
                    }
                  }
                }}
                placeholder="Search here"
                className="w-64 rounded-lg border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-purple-300 focus:ring-purple-300"
                aria-label="Search catalogues"
              />
              {search ? (
                <button
                  onClick={() => {
                    setSearch('')
                    try {
                      window.dispatchEvent(
                        new CustomEvent('dashboard:search', {
                          detail: { query: '' },
                        })
                      )
                    } catch (err) {}
                  }}
                  className="absolute right-10 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-gray-700"
                  aria-label="Clear search"
                ></button>
              ) : null}
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative h-10 w-10 rounded-full p-0 text-gray-600 hover:bg-white hover:text-gray-900"
              onClick={() => {
                try {
                  openDrawer()
                } catch (e) {
                  try {
                    window.dispatchEvent(
                      new CustomEvent('dashboard:openNotifications')
                    )
                  } catch (err) {
                    /* ignore */
                  }
                }
              }}
              aria-label="Open notifications"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500/0" />
              )}
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 hover:bg-white"
                >
                  <Avatar className="h-10 w-10 border-2 border-gray-200">
                    <AvatarImage
                      src={profile?.avatarUrl || ''}
                      alt={profile?.fullName || user.email}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-[#6366F1] to-[#2D1B69] text-xs font-bold text-white">
                      {getInitials(profile?.fullName || null, user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-72 rounded-xl p-2"
                align="end"
                forceMount
              >
                <div className="flex flex-col space-y-2 border-b border-gray-100 p-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border-2 border-purple-200">
                      <AvatarImage
                        src={profile?.avatarUrl || ''}
                        alt={profile?.fullName || user.email}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-[#6366F1] to-[#2D1B69] font-semibold text-white">
                        {getInitials(profile?.fullName || null, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {profile?.fullName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {profile?.subscriptionPlan && (
                        <div className="mt-1 flex items-center space-x-1">
                          <Crown className="h-3 w-3 text-purple-600" />
                          <span className="text-xs font-medium text-purple-600">
                            {profile.subscriptionPlan.charAt(0).toUpperCase() +
                              profile.subscriptionPlan.slice(1)}{' '}
                            Plan
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="cursor-pointer text-gray-700 hover:bg-gray-50"
                    >
                      <User className="mr-3 h-4 w-4 text-gray-500" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={isAdmin ? '/admin' : '/dashboard'}
                      className="cursor-pointer text-gray-700 hover:bg-gray-50"
                    >
                      <Sparkles className="mr-3 h-4 w-4 text-gray-500" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/billing"
                      className="cursor-pointer text-gray-700 hover:bg-gray-50"
                    >
                      <CreditCard className="mr-3 h-4 w-4 text-gray-500" />
                      <span>Billing & Plans</span>
                    </Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="my-1" />
                <div className="py-1">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/help"
                      className="cursor-pointer text-gray-700 hover:bg-gray-50"
                    >
                      <HelpCircle className="mr-3 h-4 w-4 text-gray-500" />
                      <span>Help & Support</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/documentation"
                      className="cursor-pointer text-gray-700 hover:bg-gray-50"
                    >
                      <FileText className="mr-3 h-4 w-4 text-gray-500" />
                      <span>Documentation</span>
                    </Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
