'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signOut, isClientAdmin } from '@/lib/client-auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Package,
  Edit,
  Eye,
  Save,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'

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
}

interface UserProfile {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  subscriptionPlan: string
}

export function Header({ title, showBackButton = false, backHref = '/dashboard', catalogueName, lastUpdated, showGradientBanner = false, onPreview, onSave, isSaving = false }: HeaderProps) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Check if user is admin
          const adminStatus = await isClientAdmin()
          setIsAdmin(adminStatus)

          // Fetch user profile
          const response = await fetch('/api/auth/profile')
          if (response.ok) {
            const data = await response.json()
            setProfile(data.profile)
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
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
              )}
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <header className="bg-white  shadow-sm">
        <div className="  px-8 py-5">
          <div className="flex items-center justify-between">
            {/* Left Section - Logo and Search */}
            <div className="flex items-center space-x-6">
              {/* CATFY Logo */}
              <Link href="/dashboard" className="flex items-center space-x-2 group">
                <div className="relative w-8 h-8 border rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200 overflow-hidden">
                  <Image
                    src="/assets/CATFYLogo.png"
                    alt="Catafy Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-[#2D1B69] tracking-tight">CATFY</span>
                  <span className="text-xs text-[#2d1b69a2] -mt-1">AI Catalogue Editor</span>
                </div>
              </Link>

              {/* Search Bar
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#779CAB]" />
                <Input
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-80 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#301F70] focus:ring-[#301F70] rounded-lg text-sm"
                />
              </div> */}
            </div>

            {/* Right Section - Actions and Profile */}
            <div className="flex items-center space-x-1">
              {/* Plan Badge */}
              <Badge
                variant={profile?.subscriptionPlan?.toLowerCase() === 'free' ? 'secondary' : 'default'}
                className={`flex items-center space-x-1 text-xs px-3 py-1 rounded-full ${profile?.subscriptionPlan?.toLowerCase() === 'free'
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-transparent border-2 border-[#2D1B69]/10 text-[#2D1B69] hover:bg-[#2D1B69]/5'
                  }`}
              >
                {(profile?.subscriptionPlan && profile.subscriptionPlan.toLowerCase() !== 'free') && (
                  <Crown className="h-3 w-3" />
                )}
                <span>
                  {profile?.subscriptionPlan
                    ? profile.subscriptionPlan.charAt(0).toUpperCase() + profile.subscriptionPlan.slice(1)
                    : 'Free'
                  }
                </span>
              </Badge>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative h-10 w-10 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 p-0"
              >
                <Bell className="h-5 w-5" />
              </Button>

              {/* Settings */}
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-10 w-10 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 p-0"
              >
                <Link href="/settings">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>



              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatarUrl || ''} alt={profile?.fullName || user.email} />
                      <AvatarFallback className="text-xs bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white font-bold">
                        <div className="flex flex-col space-y-2 p-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10 border-2 border-[#A2E8DD]">
                              <AvatarImage src={profile?.avatarUrl || ''} alt={profile?.fullName || user.email} />
                              <AvatarFallback className="bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white font-semibold">
                                {getInitials(profile?.fullName || null, user.email)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 p-2 rounded-xl" align="end" forceMount>
                  <div className="flex flex-col space-y-2 p-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border-2 border-[#A2E8DD]">
                        <AvatarImage src={profile?.avatarUrl || ''} alt={profile?.fullName || user.email} />
                        <AvatarFallback className="bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white font-semibold">
                          {getInitials(profile?.fullName || null, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#1A1B41]">
                          {profile?.fullName || 'User'}
                        </p>
                        <p className="text-xs text-[#779CAB]">
                          {user.email}
                        </p>
                        {profile?.subscriptionPlan && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Crown className="h-3 w-3 text-[#301F70]" />
                            <span className="text-xs font-medium text-[#301F70]">
                              {profile.subscriptionPlan.charAt(0).toUpperCase() + profile.subscriptionPlan.slice(1)} Plan
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer text-[#1A1B41] hover:bg-gray-50">
                        <User className="mr-3 h-4 w-4 text-[#779CAB]" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={isAdmin ? '/admin' : '/dashboard'} className="cursor-pointer text-[#1A1B41] hover:bg-gray-50">
                        <Sparkles className="mr-3 h-4 w-4 text-[#779CAB]" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/billing" className="cursor-pointer text-[#1A1B41] hover:bg-gray-50">
                        <CreditCard className="mr-3 h-4 w-4 text-[#779CAB]" />
                        <span>Billing & Plans</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="my-1" />
                  <div className="py-1">
                    <DropdownMenuItem asChild>
                      <Link href="/help" className="cursor-pointer text-[#1A1B41] hover:bg-gray-50">
                        <HelpCircle className="mr-3 h-4 w-4 text-[#779CAB]" />
                        <span>Help & Support</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/documentation" className="cursor-pointer text-[#1A1B41] hover:bg-gray-50">
                        <FileText className="mr-3 h-4 w-4 text-[#779CAB]" />
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

      {/* Gradient Banner Section for Edit Catalogue */}
      {showGradientBanner && (
        <div className=' bg-gray-100 pt-4'>
          <div className="bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white px-8 mx-8 rounded-t-3xl pt-8 h-40">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <div className="flex flex-col gap-2 mb-3">

                    <div>
                      <h1 className="text-3xl font-bold pb-1">
                        {title || 'Edit Catalogue'}
                      </h1>
                      <div className="flex items-center text-purple-100 text-sm">
                        <span className="font-medium text-white">{catalogueName}</span>
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
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
                      onClick={onPreview}
                      disabled={!onPreview}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="bg-white text-[#2D1B69] hover:bg-white/90 font-medium"
                      onClick={onSave}
                      disabled={isSaving || !onSave}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
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