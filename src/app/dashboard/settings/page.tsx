'use client'

import { useState, useEffect, useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import {
  Bell,
  Globe,
  Shield,
  Trash2,
  Users,
  User,
  Lock,
  Palette,
  Save,
  AlertTriangle,
  Crown,
  Zap,
  Check,
  X,
  Calendar,
  Loader2,
  ExternalLink,
  Sparkles,
  Gift,
  Building2,
  ChevronRight,
  Rocket,
  TrendingUp,
  Star,
  Award,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast as sonnerToast } from 'sonner'
import { format } from 'date-fns'
import { SubscriptionPlan } from '@prisma/client'
import {
  PLAN_FEATURES,
  formatPrice,
  getYearlySavingsPercentage,
} from '@/lib/subscription'
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useBillingQuery,
  useValidateCouponMutation,
  useCreateCheckoutMutation,
  useOpenBillingPortalMutation,
  type CurrentSubscriptionResponse,
} from '@/hooks/queries'

interface AppSettings {
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    showEmail: boolean
    showPhone: boolean
  }
  language: string
  timezone: string
}

interface UserProfile {
  fullName: string
  email: string
  companyName: string
  phone?: string
  website?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  accountType?: 'INDIVIDUAL' | 'BUSINESS'
}

export default function SettingsPage() {
  // React Query hooks
  const {
    data: profileData,
    isLoading: profileLoading,
    isFetching: profileFetching,
  } = useProfileQuery()
  const {
    data: billingData,
    isLoading: billingIsLoading,
    isFetching: billingFetching,
  } = useBillingQuery()
  const updateProfileMutation = useUpdateProfileMutation()
  const validateCouponMutation = useValidateCouponMutation()
  const createCheckoutMutation = useCreateCheckoutMutation()
  const openPortalMutation = useOpenBillingPortalMutation()

  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      email: true,
      push: true,
      marketing: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
    },
    language: 'en',
    timezone: 'UTC',
  })
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    email: '',
    companyName: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    accountType: 'INDIVIDUAL',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Billing states
  const [billingIsProcessing, setBillingIsProcessing] = useState(false)
  const [billingError, setBillingError] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly'
  )

  // Populate profile from React Query cache
  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Populate profile from React Query data
    if (!profileLoading && profileData?.profile) {
      const fetchedProfile = profileData.profile
      setProfile({
        fullName: (fetchedProfile.fullName as string) || '',
        email:
          (profileData.user?.email as string) || fetchedProfile.email || '',
        companyName: (fetchedProfile.companyName as string) || '',
        phone: (fetchedProfile.phone as string) || '',
        website: (fetchedProfile.website as string) || '',
        address: (fetchedProfile.address as string) || '',
        city: (fetchedProfile.city as string) || '',
        state: (fetchedProfile.state as string) || '',
        country: (fetchedProfile.country as string) || '',
        postalCode: (fetchedProfile.postalCode as string) || '',
        accountType:
          (fetchedProfile.accountType as 'INDIVIDUAL' | 'BUSINESS') ||
          'INDIVIDUAL',
      })
      setLoading(false)
    }

    // Only show loading on initial load without cached data
    if (profileLoading && !profileData) setLoading(true)
    else setLoading(false)
  }, [profileLoading, profileData])

  const handleSaveSettings = async (
    section:
      | 'profile'
      | 'notifications'
      | 'privacy'
      | 'preferences'
      | 'other' = 'other'
  ) => {
    setSaving(true)
    try {
      // Profile section should save to DB via React Query mutation
      if (section === 'profile') {
        // map our simple profile shape to backend fields
        const updateBody: any = {
          fullName: profile.fullName,
          companyName: profile.companyName,
          phone: profile.phone,
          website: profile.website,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          country: profile.country,
          postalCode: profile.postalCode,
          accountType: profile.accountType,
        }

        await updateProfileMutation.mutateAsync(updateBody)

        toast({
          title: 'Profile saved',
          description: 'Profile updated successfully.',
        })
      } else {
        // Other sections: persist locally for now
        localStorage.setItem('appSettings', JSON.stringify(settings))
        toast({
          title: 'Settings saved',
          description: 'Your preferences have been updated successfully.',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const updateSettings = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      const keys = path.split('.')
      let current: any = newSettings

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  // Billing functions (now using React Query)
  const validateBillingCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponDiscount(null)
      return
    }
    try {
      // We validate against monthly by default; amount will be applied server-side
      const amount =
        billingCycle === 'monthly'
          ? PLAN_FEATURES[SubscriptionPlan.STANDARD].monthlyPrice
          : PLAN_FEATURES[SubscriptionPlan.STANDARD].yearlyPrice

      const result = await validateCouponMutation.mutateAsync({
        code: couponCode,
        billingCycle: billingCycle.toUpperCase() as 'MONTHLY' | 'YEARLY',
        amount,
      })

      setCouponDiscount(result.discountAmount || null)
      sonnerToast.success(`Coupon applied! ${result.discountAmount}% discount`)
    } catch (error) {
      setCouponDiscount(null)
      sonnerToast.error(
        error instanceof Error ? error.message : 'Failed to validate coupon'
      )
    }
  }

  const createBillingCheckoutSession = async (cycle: 'monthly' | 'yearly') => {
    setBillingIsProcessing(true)
    setBillingError('')
    try {
      const result = await createCheckoutMutation.mutateAsync({
        plan: cycle,
        couponCode: couponCode.trim() || undefined,
      })

      // For free after discount, backend may redirect or return success
      const url = result.redirectUrl || result.url
      if (url) {
        window.location.href = url
      } else {
        sonnerToast.success('Subscription created successfully!')
      }
    } catch (error) {
      setBillingError(
        error instanceof Error ? error.message : 'Failed to process payment'
      )
    } finally {
      setBillingIsProcessing(false)
    }
  }

  const openBillingCustomerPortal = async () => {
    if (!billingData?.subscription?.stripeCustomerId) {
      sonnerToast.error('No billing information found')
      return
    }
    setBillingIsProcessing(true)
    try {
      const result = await openPortalMutation.mutateAsync()
      window.location.href = result.url
    } catch (error) {
      sonnerToast.error('Failed to open billing portal')
    } finally {
      setBillingIsProcessing(false)
    }
  }

  const getBillingNextPlan = () => {
    if (!billingData?.plan) return null // Add this null check

    const plans = [
      SubscriptionPlan.FREE,
      SubscriptionPlan.STANDARD,
      SubscriptionPlan.PROFESSIONAL,
      SubscriptionPlan.BUSINESS,
    ]
    const currentIndex = plans.indexOf(billingData.plan)
    return currentIndex < plans.length - 1 ? plans[currentIndex + 1] : null
  }

  const billingNextPlan = getBillingNextPlan()
  const billingNextPlanFeatures = billingNextPlan
    ? PLAN_FEATURES[billingNextPlan]
    : null

  const billingPlanFeatures = useMemo(
    () => PLAN_FEATURES[billingData?.plan || SubscriptionPlan.FREE],
    [billingData?.plan]
  )
  const billingUsage = billingData?.usage

  const calculateDiscounted = (price: number) => {
    if (!couponDiscount) return price
    return Math.max(0, price * (1 - couponDiscount / 100))
  }

  const recommendedPlan = useMemo(() => {
    if (!billingUsage) return null
    const order = [
      SubscriptionPlan.FREE,
      SubscriptionPlan.STANDARD,
      SubscriptionPlan.PROFESSIONAL,
      SubscriptionPlan.BUSINESS,
    ]
    const currentIdx = order.indexOf(billingData?.plan || SubscriptionPlan.FREE)
    // Recommend next plan if user hits limits
    const current = PLAN_FEATURES[order[currentIdx]]
    const atCatalogueLimit =
      current.maxCatalogues !== -1 &&
      billingUsage.catalogues >= current.maxCatalogues
    const atExportLimit =
      current.maxExportsPerMonth !== -1 &&
      billingUsage.monthlyExports >= current.maxExportsPerMonth
    if (atCatalogueLimit || atExportLimit) {
      return order[Math.min(currentIdx + 1, order.length - 1)]
    }
    return null
  }, [billingUsage, billingData?.plan])

  // No longer need useEffect to load billing - React Query handles it automatically

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-blue-50">
        <div className="ml-24 flex-1">
          <DashboardHeader
            title="Settings"
            subtitle="Manage your account and preferences"
          />

          <div className="p-8">
            {/* Tabs header skeleton */}
            <div className="mb-6">
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>

            {/* Main content skeleton: profile card + actions */}
            <div className="space-y-6">
              <div className="grid gap-6">
                <Skeleton className="h-48 w-full rounded-3xl" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </div>

              {/* Save buttons skeleton */}
              <div className="flex justify-end gap-3 pt-3">
                <Skeleton className="h-12 w-28 rounded-2xl" />
                <Skeleton className="h-12 w-40 rounded-2xl" />
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
        <DashboardHeader
          title="Settings"
          subtitle="Manage your account and preferences"
        />

        <div className="p-8">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 grid h-14 w-full grid-cols-6 rounded-2xl border-0 bg-white/80 px-2 shadow-lg backdrop-blur-sm">
              <TabsTrigger
                value="profile"
                className="flex items-center gap-2 rounded-xl py-3 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6366F1] data-[state=active]:to-[#2D1B69] data-[state=active]:text-white"
              >
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="flex items-center gap-2 rounded-xl py-3 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6366F1] data-[state=active]:to-[#2D1B69] data-[state=active]:text-white"
              >
                <Crown className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2 rounded-xl py-3 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6366F1] data-[state=active]:to-[#2D1B69] data-[state=active]:text-white"
              >
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="flex items-center gap-2 rounded-xl py-3 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6366F1] data-[state=active]:to-[#2D1B69] data-[state=active]:text-white"
              >
                <Globe className="h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center gap-2 rounded-xl py-3 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6366F1] data-[state=active]:to-[#2D1B69] data-[state=active]:text-white"
              >
                <Lock className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger
                value="danger"
                className="flex items-center gap-2 rounded-xl py-3 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff5f6d] data-[state=active]:to-[#ffc371] data-[state=active]:text-white"
              >
                <AlertTriangle className="h-4 w-4" />
                Account Actions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="group relative overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
                <div className="absolute -right-12 -top-12 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-[#6366F1]/20 to-[#2D1B69]/20 blur-2xl" />
                <CardHeader className="relative pb-4">
                  <CardTitle className="text-xl">Profile</CardTitle>
                  <CardDescription className="text-sm">
                    Manage your basic account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="fullName"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={profile.fullName}
                        onChange={e =>
                          updateProfile('fullName', e.target.value)
                        }
                        className="rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm transition-all duration-200 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={profile.email}
                        disabled
                        className="rounded-xl border-2 border-gray-200 bg-gray-50/60 px-4 py-2 text-sm text-gray-600 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="companyName"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Company
                      </Label>
                      <Input
                        id="companyName"
                        placeholder="Your company name"
                        value={profile.companyName}
                        onChange={e =>
                          updateProfile('companyName', e.target.value)
                        }
                        className="rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm transition-all duration-200 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        placeholder="Phone number"
                        value={profile.phone}
                        onChange={e => updateProfile('phone', e.target.value)}
                        className="rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm transition-all duration-200 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="website"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Website
                      </Label>
                      <Input
                        id="website"
                        placeholder="https://yourwebsite.com"
                        value={profile.website}
                        onChange={e => updateProfile('website', e.target.value)}
                        className="rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm transition-all duration-200 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="city"
                        className="text-sm font-semibold text-gray-700"
                      >
                        City
                      </Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={profile.city}
                        onChange={e => updateProfile('city', e.target.value)}
                        className="rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm transition-all duration-200 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="address"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Address
                    </Label>
                    <Input
                      id="address"
                      placeholder="Street address"
                      value={profile.address}
                      onChange={e => updateProfile('address', e.target.value)}
                      className="rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm transition-all duration-200 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor="state"
                        className="text-sm font-semibold text-gray-700"
                      >
                        State
                      </Label>
                      <Input
                        id="state"
                        placeholder="State/Region"
                        value={profile.state}
                        onChange={e => updateProfile('state', e.target.value)}
                        className="rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm transition-all duration-200 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="country"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Country
                      </Label>
                      <Input
                        id="country"
                        placeholder="Country"
                        value={profile.country}
                        onChange={e => updateProfile('country', e.target.value)}
                        className="rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm transition-all duration-200 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="postalCode"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Postal Code
                      </Label>
                      <Input
                        id="postalCode"
                        placeholder="Postal code"
                        value={profile.postalCode}
                        onChange={e =>
                          updateProfile('postalCode', e.target.value)
                        }
                        className="rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm transition-all duration-200 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="rounded-2xl border-2 px-6 py-2 font-semibold transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSaveSettings('profile')}
                  disabled={saving}
                  className="rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] px-6 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-[#5558E3] hover:to-[#1e0f4d] hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              {/* Notification Settings */}
              <Card className="group relative overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
                <div className="absolute -right-12 -top-12 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-green-200/20 to-blue-200/20 blur-2xl" />
                <CardHeader className="relative pb-4">
                  <CardTitle className="text-xl">Notifications</CardTitle>
                  <CardDescription className="text-sm">
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border-2 border-gray-100 bg-white/30 p-4 backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-white/50">
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold text-gray-800">
                        Email Notifications
                      </Label>
                      <p className="text-xs text-gray-600">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={checked =>
                        updateSettings('notifications.email', checked)
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#6366F1] data-[state=checked]:to-[#2D1B69]"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border-2 border-gray-100 bg-white/30 p-4 backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-white/50">
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold text-gray-800">
                        Push Notifications
                      </Label>
                      <p className="text-xs text-gray-600">
                        Receive push notifications in browser
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.push}
                      onCheckedChange={checked =>
                        updateSettings('notifications.push', checked)
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#6366F1] data-[state=checked]:to-[#2D1B69]"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border-2 border-gray-100 bg-white/30 p-4 backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-white/50">
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold text-gray-800">
                        Marketing Communications
                      </Label>
                      <p className="text-xs text-gray-600">
                        Receive updates about new features and offers
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.marketing}
                      onCheckedChange={checked =>
                        updateSettings('notifications.marketing', checked)
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#6366F1] data-[state=checked]:to-[#2D1B69]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="rounded-2xl border-2 px-6 py-2 font-semibold transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSaveSettings('notifications')}
                  disabled={saving}
                  className="rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] px-6 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-[#5558E3] hover:to-[#1e0f4d] hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Notifications'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              {billingIsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-3xl" />
                  <div className="grid gap-6">
                    <Skeleton className="h-32 w-full rounded-3xl" />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Skeleton className="h-12 w-full rounded-xl" />
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {billingError && (
                    <div className="mb-6 rounded-2xl border-2 border-red-200 bg-red-50 p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span className="text-red-800">{billingError}</span>
                      </div>
                    </div>
                  )}

                  {/* Current Plan Overview */}
                  <Card className="group relative overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
                    <div className="absolute -right-12 -top-12 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-indigo-200/20 to-purple-200/20 blur-2xl" />
                    <CardHeader className="relative pb-4">
                      <CardTitle className="text-xl">Current Plan</CardTitle>
                      <CardDescription className="text-sm">
                        Your subscription and usage details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-4">
                      {billingData && (
                        <>
                          <div className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${billingData.plan === SubscriptionPlan.FREE ? 'from-gray-400 to-gray-600' : 'from-indigo-500 to-purple-600'} shadow-sm`}
                              >
                                {billingData.plan === SubscriptionPlan.FREE ? (
                                  <Zap className="h-6 w-6 text-white" />
                                ) : (
                                  <Crown className="h-6 w-6 text-white" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-bold text-gray-900">
                                    {PLAN_FEATURES[billingData.plan].name} Plan
                                  </h3>
                                  {billingData.subscription ? (
                                    <span
                                      className={`rounded-full px-2 py-1 text-xs font-semibold ${billingData.subscription.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
                                    >
                                      {billingData.subscription.status}
                                    </span>
                                  ) : (
                                    <span className="rounded-full bg-indigo-500 px-2 py-1 text-xs font-semibold text-white">
                                      Free
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {PLAN_FEATURES[billingData.plan].description}
                                </p>
                              </div>
                            </div>
                            {billingData.plan !== SubscriptionPlan.FREE && (
                              <button
                                onClick={openBillingCustomerPortal}
                                disabled={billingIsProcessing}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#2D1B69] px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                              >
                                {billingIsProcessing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ExternalLink className="h-4 w-4" />
                                )}
                                Manage
                              </button>
                            )}
                          </div>

                          {billingData.subscription && (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <div className="rounded-2xl border-2 border-gray-100 bg-white/30 p-4 backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-white/50">
                                <div className="mb-1 flex items-center gap-2 text-gray-700">
                                  <Calendar className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    Current Period
                                  </span>
                                </div>
                                <div className="text-sm font-bold text-gray-900">
                                  {billingData.subscription
                                    .currentPeriodStart &&
                                  billingData.subscription.currentPeriodEnd ? (
                                    <>
                                      {format(
                                        new Date(
                                          billingData.subscription.currentPeriodStart
                                        ),
                                        'MMM d, yyyy'
                                      )}{' '}
                                      -{' '}
                                      {format(
                                        new Date(
                                          billingData.subscription.currentPeriodEnd
                                        ),
                                        'MMM d, yyyy'
                                      )}
                                    </>
                                  ) : (
                                    'Not available'
                                  )}
                                </div>
                              </div>
                              <div className="rounded-2xl border-2 border-gray-100 bg-white/30 p-4 backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-white/50">
                                <div className="mb-1 flex items-center gap-2 text-gray-700">
                                  <Sparkles className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    Next Billing
                                  </span>
                                </div>
                                <div className="text-sm font-bold text-gray-900">
                                  {billingData.subscription.cancelAtPeriodEnd
                                    ? 'Cancels at period end'
                                    : billingData.subscription.currentPeriodEnd
                                      ? format(
                                          new Date(
                                            billingData.subscription.currentPeriodEnd
                                          ),
                                          'MMM d, yyyy'
                                        )
                                      : 'Not available'}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="rounded-2xl border-2 border-gray-100 bg-white/30 p-4 backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-white/50">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                  Catalogues Used
                                </span>
                                <TrendingUp className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div className="mb-2 flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                  {billingUsage?.catalogues ?? 0}
                                </span>
                                <span className="text-sm text-gray-500">
                                  /{' '}
                                  {billingPlanFeatures.maxCatalogues === -1
                                    ? '∞'
                                    : billingPlanFeatures.maxCatalogues}
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
                                  style={{
                                    width: `${billingPlanFeatures.maxCatalogues === -1 ? 100 : Math.min(100, ((billingUsage?.catalogues || 0) / billingPlanFeatures.maxCatalogues) * 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="rounded-2xl border-2 border-gray-100 bg-white/30 p-4 backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-white/50">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                  Monthly Exports
                                </span>
                                <Award className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div className="mb-2 flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                  {billingUsage?.monthlyExports ?? 0}
                                </span>
                                <span className="text-sm text-gray-500">
                                  /{' '}
                                  {billingPlanFeatures.maxExportsPerMonth === -1
                                    ? '∞'
                                    : billingPlanFeatures.maxExportsPerMonth}
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all"
                                  style={{
                                    width: `${billingPlanFeatures.maxExportsPerMonth === -1 ? 100 : Math.min(100, ((billingUsage?.monthlyExports || 0) / billingPlanFeatures.maxExportsPerMonth) * 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Upgrade CTA */}
                  {billingNextPlan &&
                    billingNextPlanFeatures &&
                    billingData?.subscription && (
                      <Card className="group relative overflow-hidden rounded-3xl border-0 border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
                        <div className="absolute -right-12 -top-12 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-amber-200/30 to-orange-200/30 blur-2xl" />
                        <CardHeader className="relative pb-4">
                          <CardTitle className="text-xl text-amber-700">
                            Ready to Level Up?
                          </CardTitle>
                          <CardDescription className="text-sm text-amber-600">
                            Upgrade to unlock more powerful features
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="relative space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="mb-1 text-lg font-bold text-gray-900">
                                Upgrade to {billingNextPlanFeatures.name}
                              </h3>
                              <p className="mb-3 text-sm text-gray-600">
                                Unlock more powerful features and capabilities
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {billingNextPlanFeatures.included
                                  .slice(0, 3)
                                  .map((feature, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
                                    >
                                      <Check className="h-3 w-3" />
                                      {feature}
                                    </span>
                                  ))}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                createBillingCheckoutSession(billingCycle)
                              }
                              disabled={billingIsProcessing}
                              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                            >
                              {billingIsProcessing ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="ml-1">Processing...</span>
                                </>
                              ) : (
                                <>
                                  <span>Upgrade</span>
                                  <ChevronRight className="h-4 w-4" />
                                </>
                              )}
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                  {/* Plan Selection */}
                  <Card className="group relative overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
                    <div className="absolute -right-12 -top-12 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-blue-200/20 to-cyan-200/20 blur-2xl" />
                    <CardHeader className="relative pb-4">
                      <CardTitle className="text-xl">
                        Choose Your Plan
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Select the perfect plan for your creative needs
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-4">
                      <div className="flex items-center justify-center">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 p-1">
                          <button
                            className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
                            onClick={() => setBillingCycle('monthly')}
                          >
                            Monthly
                          </button>
                          <button
                            className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
                            onClick={() => setBillingCycle('yearly')}
                          >
                            <div className="flex items-center gap-2 text-sm">
                              Yearly
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                                Save{' '}
                                {getYearlySavingsPercentage(
                                  PLAN_FEATURES[SubscriptionPlan.STANDARD]
                                    .monthlyPrice,
                                  PLAN_FEATURES[SubscriptionPlan.STANDARD]
                                    .yearlyPrice
                                )}
                                %
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[
                          SubscriptionPlan.FREE,
                          SubscriptionPlan.STANDARD,
                          SubscriptionPlan.PROFESSIONAL,
                          SubscriptionPlan.BUSINESS,
                        ].map((plan, idx) => {
                          const features = PLAN_FEATURES[plan]
                          const rawPrice =
                            billingCycle === 'monthly'
                              ? features.monthlyPrice
                              : features.yearlyPrice
                          const displayPrice =
                            billingCycle === 'yearly' ? rawPrice / 12 : rawPrice
                          const discountedDisplay =
                            calculateDiscounted(displayPrice)
                          const isCurrentPlan = billingData?.plan === plan
                          const isRecommended = recommendedPlan === plan

                          const colors = [
                            'from-gray-400 to-gray-600',
                            'from-blue-500 to-cyan-600',
                            'from-purple-500 to-pink-600',
                            'from-orange-500 to-red-600',
                          ]

                          return (
                            <div
                              key={plan}
                              className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 transition-all hover:shadow-2xl ${
                                isCurrentPlan
                                  ? 'border-emerald-500 bg-emerald-50/10 shadow-2xl ring-4 ring-emerald-200'
                                  : isRecommended
                                    ? 'border-purple-500 shadow-lg'
                                    : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {isRecommended && !isCurrentPlan && (
                                <div className="absolute left-0 right-0 top-0 bg-gradient-to-r from-purple-600 to-pink-600 py-2 text-center text-xs font-bold text-white">
                                  ⭐ RECOMMENDED
                                </div>
                              )}
                              {isCurrentPlan && (
                                <div className="absolute left-0 right-0 top-0 bg-gradient-to-r from-emerald-500 to-teal-600 py-2 text-center text-xs font-bold text-white">
                                  ✓ YOUR PLAN
                                </div>
                              )}

                              <div
                                className={`p-4 ${isRecommended || isCurrentPlan ? 'pt-10' : ''} flex-1`}
                              >
                                <div
                                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${colors[idx]} shadow-sm`}
                                >
                                  {plan === SubscriptionPlan.FREE ? (
                                    <Zap className="h-6 w-6 text-white" />
                                  ) : plan === SubscriptionPlan.BUSINESS ? (
                                    <Building2 className="h-6 w-6 text-white" />
                                  ) : (
                                    <Crown className="h-6 w-6 text-white" />
                                  )}
                                </div>

                                <h3 className="mb-1 text-xl font-bold text-gray-900">
                                  {features.name}
                                </h3>
                                <p className="mb-3 text-sm text-gray-600">
                                  {features.description}
                                </p>

                                <div className="mb-4">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-gray-900">
                                      {formatPrice(discountedDisplay)}
                                    </span>
                                    <span className="text-gray-600">/mo</span>
                                  </div>
                                  {couponDiscount && displayPrice > 0 && (
                                    <div className="mt-1">
                                      <span className="text-sm text-gray-500 line-through">
                                        {formatPrice(displayPrice)}
                                      </span>
                                      <span className="ml-2 text-sm font-semibold text-emerald-600">
                                        {couponDiscount}% off
                                      </span>
                                    </div>
                                  )}
                                  {billingCycle === 'yearly' &&
                                    displayPrice > 0 && (
                                      <div className="mt-1 text-xs text-gray-500">
                                        Billed ${rawPrice}/year
                                      </div>
                                    )}
                                </div>
                                <div className="mb-4 space-y-2">
                                  {features.included.map((feature, fidx) => (
                                    <div
                                      key={fidx}
                                      className="flex items-start gap-2"
                                    >
                                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                                      <span className="text-sm text-gray-700">
                                        {feature}
                                      </span>
                                    </div>
                                  ))}
                                  {features.excluded.map((feature, fidx) => (
                                    <div
                                      key={fidx}
                                      className="flex items-start gap-2"
                                    >
                                      <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-300" />
                                      <span className="text-sm text-gray-400">
                                        {feature}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="p-4 pt-0">
                                {isCurrentPlan ? (
                                  <button
                                    disabled
                                    className="w-full rounded-md bg-gray-100 py-2 text-sm font-semibold text-gray-500"
                                  >
                                    Current Plan
                                  </button>
                                ) : plan === SubscriptionPlan.FREE ? (
                                  <button
                                    disabled
                                    className="w-full rounded-md border-2 border-gray-200 bg-white py-2 text-sm font-semibold text-gray-400"
                                  >
                                    Downgrade
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      createBillingCheckoutSession(billingCycle)
                                    }
                                    disabled={billingIsProcessing}
                                    className={`w-full rounded-md bg-gradient-to-r ${colors[idx]} py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow disabled:opacity-50`}
                                  >
                                    {billingIsProcessing
                                      ? 'Processing...'
                                      : `Upgrade to ${features.name}`}
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Billing Information */}
                  <Card className="group relative overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
                    <div className="absolute -right-12 -top-12 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-indigo-200/20 to-blue-200/20 blur-2xl" />
                    <CardHeader className="relative pb-4">
                      <CardTitle className="text-xl">
                        Secure & Transparent Billing
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Your billing information and security details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                            <Check className="h-4 w-4 text-emerald-500" />
                            Payment & Security
                          </h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-500">•</span>
                              <span>Secure payments powered by Stripe</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-500">•</span>
                              <span>Cancel anytime, no hidden fees</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-500">•</span>
                              <span>
                                Money-back guarantee on eligible plans
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-500">•</span>
                              <span>Automatic billing on renewal date</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="mb-3 font-semibold text-gray-900">
                            Need Help?
                          </h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                              <span className="text-purple-500">•</span>
                              <span>Contact support for billing questions</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-500">•</span>
                              <span>View invoices in billing portal</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-500">•</span>
                              <span>Update payment methods anytime</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-500">•</span>
                              <span>Download receipts for tax purposes</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="mb-4 font-semibold text-gray-900">
                            Coupon Code
                          </h4>
                          <p className="mb-4 text-sm text-gray-600">
                            Enter your code to unlock special discounts
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="ENTER CODE"
                              value={couponCode}
                              onChange={e =>
                                setCouponCode(e.target.value.toUpperCase())
                              }
                              onBlur={validateBillingCoupon}
                              className="flex-1 rounded-xl border-2 border-gray-200 bg-white/50 px-3 py-2 font-mono text-sm font-semibold uppercase text-gray-900 placeholder-gray-400 backdrop-blur-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                            />
                            <button
                              onClick={validateBillingCoupon}
                              className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow"
                            >
                              Apply
                            </button>
                          </div>
                          {couponDiscount && (
                            <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                              <Check className="h-4 w-4" />
                              <span className="font-semibold">
                                {couponDiscount}% discount applied!
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              {/* Language & Region */}
              <Card className="group relative overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
                <div className="absolute -right-12 -top-12 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-orange-200/20 to-red-200/20 blur-2xl" />
                <CardHeader className="relative pb-4">
                  <CardTitle className="text-xl">Language & Region</CardTitle>
                  <CardDescription className="text-sm">
                    Set your language and regional preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="language"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Language
                    </Label>
                    <Select
                      value={settings.language}
                      onValueChange={value => updateSettings('language', value)}
                    >
                      <SelectTrigger className="rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm transition-all duration-200 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="timezone"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Timezone
                    </Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={value => updateSettings('timezone', value)}
                    >
                      <SelectTrigger className="rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm transition-all duration-200 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">
                          Eastern Time
                        </SelectItem>
                        <SelectItem value="America/Chicago">
                          Central Time
                        </SelectItem>
                        <SelectItem value="America/Denver">
                          Mountain Time
                        </SelectItem>
                        <SelectItem value="America/Los_Angeles">
                          Pacific Time
                        </SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                        <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card className="group relative overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
                <div className="absolute -right-12 -top-12 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-pink-200/20 to-purple-200/20 blur-2xl" />
                <CardHeader className="relative pb-4">
                  <CardTitle className="text-xl">Appearance</CardTitle>
                  <CardDescription className="text-sm">
                    Customize the look and feel of your workspace
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border-2 border-gray-100 bg-white/30 p-4 backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-white/50">
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold text-gray-800">
                        Theme
                      </Label>
                      <p className="text-xs text-gray-600">
                        Currently using light theme
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-2 bg-white px-3 py-1 text-xs font-semibold transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                      >
                        Light
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-2 px-3 py-1 text-xs transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                      >
                        Dark
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="rounded-2xl border-2 px-6 py-2 font-semibold transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSaveSettings('preferences')}
                  disabled={saving}
                  className="rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] px-6 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-[#5558E3] hover:to-[#1e0f4d] hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              {/* Security */}
              <Card className="group relative overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
                <div className="absolute -right-12 -top-12 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-indigo-200/20 to-blue-200/20 blur-2xl" />
                <CardHeader className="relative pb-4">
                  <CardTitle className="text-xl">Security</CardTitle>
                  <CardDescription className="text-sm">
                    Manage your account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="rounded-2xl border-2 border-gray-100 bg-white/30 p-4 backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-white/50">
                    <h4 className="mb-2 text-base font-semibold text-gray-900">
                      Password
                    </h4>
                    <p className="mb-3 text-xs text-gray-600">
                      Last changed 3 months ago
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                    >
                      Change Password
                    </Button>
                  </div>
                  <div className="rounded-2xl border-2 border-gray-100 bg-white/30 p-4 backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-white/50">
                    <h4 className="mb-2 text-base font-semibold text-gray-900">
                      Two-Factor Authentication
                    </h4>
                    <p className="mb-3 text-xs text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                    >
                      Enable 2FA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="danger" className="space-y-6">
              {/* Danger Zone */}
              <Card className="group relative overflow-hidden rounded-3xl border-0 border-red-200/50 bg-gradient-to-br from-red-50/50 to-orange-50/50 shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
                <div className="absolute -right-12 -top-12 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-red-200/30 to-orange-200/30 blur-2xl" />
                <CardHeader className="relative pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl text-red-600">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Account Actions
                  </CardTitle>
                  <CardDescription className="text-sm text-red-500">
                    Important account actions and data management
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-4">
                    <div className="rounded-2xl border-2 border-red-200 bg-white/50 p-4 backdrop-blur-sm transition-all duration-200 hover:border-red-300 hover:bg-white/70">
                      <h4 className="mb-2 text-base font-semibold text-red-800">
                        Clear All Data
                      </h4>
                      <p className="mb-3 text-xs text-red-600">
                        This will permanently delete all your data and cannot be
                        undone.
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 hover:shadow-md"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All Data
                      </Button>
                    </div>
                    <div className="rounded-2xl border-2 border-red-200 bg-white/50 p-4 backdrop-blur-sm transition-all duration-200 hover:border-red-300 hover:bg-white/70">
                      <h4 className="mb-2 text-base font-semibold text-red-800">
                        Delete Account
                      </h4>
                      <p className="mb-3 text-xs text-red-600">
                        Permanently delete your account and all associated data.
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 hover:shadow-md"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
