'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import {
  Crown,
  Zap,
  Check,
  X,
  Calendar,
  Shield,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Gift,
  Building2,
  ChevronRight,
  Rocket,
  TrendingUp,
  Star,
  Award,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { SubscriptionPlan } from '@prisma/client'
import {
  PLAN_FEATURES,
  formatPrice,
  getYearlySavingsPercentage,
} from '@/lib/subscription'
import {
  useBillingQuery,
  useValidateCouponMutation,
  useCreateCheckoutMutation,
  useOpenBillingPortalMutation,
  type CurrentSubscriptionResponse,
} from '@/hooks/queries'

export default function DashboardBillingPage() {
  const { data, isLoading, isFetching, error: queryError } = useBillingQuery()
  const validateCouponMutation = useValidateCouponMutation()
  const createCheckoutMutation = useCreateCheckoutMutation()
  const openPortalMutation = useOpenBillingPortalMutation()

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly'
  )

  const router = useRouter()

  // No longer need loadSubscription - React Query handles it automatically

  const validateCoupon = async () => {
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
      toast.success(`Coupon applied! ${result.discountAmount}% discount`)
    } catch (error) {
      setCouponDiscount(null)
      toast.error(
        error instanceof Error ? error.message : 'Failed to validate coupon'
      )
    }
  }

  const createCheckoutSession = async (cycle: 'monthly' | 'yearly') => {
    setIsProcessing(true)
    setError('')
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
        toast.success('Subscription created successfully!')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const openCustomerPortal = async () => {
    if (!data?.subscription?.stripeCustomerId) {
      toast.error('No billing information found')
      return
    }
    setIsProcessing(true)
    try {
      const result = await openPortalMutation.mutateAsync()
      window.location.href = result.url
    } catch (err) {
      toast.error('Failed to open billing portal')
    } finally {
      setIsProcessing(false)
    }
  }

  const getNextPlan = () => {
    if (!data?.plan) return null // Add this null check

    const plans = [
      SubscriptionPlan.FREE,
      SubscriptionPlan.STANDARD,
      SubscriptionPlan.PROFESSIONAL,
      SubscriptionPlan.BUSINESS,
    ]
    const currentIndex = plans.indexOf(data.plan)
    return currentIndex < plans.length - 1 ? plans[currentIndex + 1] : null
  }

  const nextPlan = getNextPlan()
  const nextPlanFeatures = nextPlan ? PLAN_FEATURES[nextPlan] : null

  const planFeatures = useMemo(
    () => PLAN_FEATURES[data?.plan || SubscriptionPlan.FREE],
    [data?.plan]
  )
  const usage = data?.usage

  const calculateDiscounted = (price: number) => {
    if (!couponDiscount) return price
    return Math.max(0, price * (1 - couponDiscount / 100))
  }

  const recommendedPlan = useMemo(() => {
    if (!usage) return null
    const order = [
      SubscriptionPlan.FREE,
      SubscriptionPlan.STANDARD,
      SubscriptionPlan.PROFESSIONAL,
      SubscriptionPlan.BUSINESS,
    ]
    const currentIdx = order.indexOf(data?.plan || SubscriptionPlan.FREE)
    // Recommend next plan if user hits limits
    const current = PLAN_FEATURES[order[currentIdx]]
    const atCatalogueLimit =
      current.maxCatalogues !== -1 && usage.catalogues >= current.maxCatalogues
    const atExportLimit =
      current.maxExportsPerMonth !== -1 &&
      usage.monthlyExports >= current.maxExportsPerMonth
    if (atCatalogueLimit || atExportLimit) {
      return order[Math.min(currentIdx + 1, order.length - 1)]
    }
    return null
  }, [usage, data?.plan])

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="ml-24 flex-1">
          <DashboardHeader
            title="Billing & Plans"
            subtitle="Manage your subscription and billing information"
          />
          <div className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-56 rounded-lg" />
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
        <DashboardHeader
          title="Billing & Plans"
          subtitle="Manage your subscription and billing information"
        />
        <div className="p-6">
          <div className="mx-auto">
            {error && (
              <div className="mb-6 rounded-2xl border-2 border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Hero Section - Current Plan (compact) */}
            <div className="relative mb-6">
              {data && (
                <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 shadow-lg">
                  <div className="relative">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 shadow-md backdrop-blur-md`}
                        >
                          {data.plan === SubscriptionPlan.FREE ? (
                            <Zap className="h-6 w-6 text-white" />
                          ) : (
                            <Crown className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-white">
                              {PLAN_FEATURES[data.plan].name} Plan
                            </h1>
                            {data.subscription ? (
                              <span
                                className={`rounded-full px-3 py-1 text-sm font-semibold ${data.subscription.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
                              >
                                {data.subscription.status}
                              </span>
                            ) : (
                              <span className="rounded-full bg-indigo-500 px-3 py-1 text-sm font-semibold text-white">
                                Free
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-purple-100">
                            {PLAN_FEATURES[data.plan].description}
                          </p>
                        </div>
                      </div>

                      {data.plan !== SubscriptionPlan.FREE && (
                        <button
                          onClick={openCustomerPortal}
                          disabled={isProcessing}
                          className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/30 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ExternalLink className="h-4 w-4" />
                          )}
                          Manage Billing
                        </button>
                      )}
                    </div>

                    {/* Period Info */}
                    {data.subscription && (
                      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="rounded-lg bg-white/10 p-4 backdrop-blur-md">
                          <div className="mb-1 flex items-center gap-2 text-white/80">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              Current Period
                            </span>
                          </div>
                          <div className="text-sm font-bold text-white">
                            {format(
                              new Date(data.subscription.currentPeriodStart),
                              'MMM d, yyyy'
                            )}{' '}
                            -{' '}
                            {format(
                              new Date(data.subscription.currentPeriodEnd),
                              'MMM d, yyyy'
                            )}
                          </div>
                        </div>

                        <div className="rounded-lg bg-white/10 p-4 backdrop-blur-md">
                          <div className="mb-1 flex items-center gap-2 text-white/80">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              Next Billing
                            </span>
                          </div>
                          <div className="text-sm font-bold text-white">
                            {data.subscription.cancelAtPeriodEnd
                              ? 'Cancels at period end'
                              : format(
                                  new Date(data.subscription.currentPeriodEnd),
                                  'MMM d, yyyy'
                                )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Usage Stats */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="rounded-lg bg-white p-4 shadow-sm">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">
                            Catalogues Used
                          </span>
                          <TrendingUp className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="mb-1 flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {usage?.catalogues ?? 0}
                          </span>
                          <span className="text-xs text-gray-500">
                            /{' '}
                            {planFeatures.maxCatalogues === -1
                              ? '∞'
                              : planFeatures.maxCatalogues}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
                            style={{
                              width: `${planFeatures.maxCatalogues === -1 ? 100 : Math.min(100, ((usage?.catalogues || 0) / planFeatures.maxCatalogues) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="rounded-lg bg-white p-4 shadow-sm">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">
                            Monthly Exports
                          </span>
                          <Award className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="mb-1 flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {usage?.monthlyExports ?? 0}
                          </span>
                          <span className="text-xs text-gray-500">
                            /{' '}
                            {planFeatures.maxExportsPerMonth === -1
                              ? '∞'
                              : planFeatures.maxExportsPerMonth}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all"
                            style={{
                              width: `${planFeatures.maxExportsPerMonth === -1 ? 100 : Math.min(100, ((usage?.monthlyExports || 0) / planFeatures.maxExportsPerMonth) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Upgrade CTA - if not on highest plan (compact) */}
            {nextPlan && nextPlanFeatures && data?.subscription && (
              <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md">
                      <Rocket className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-white">
                      <h2 className="mb-1 text-2xl font-bold">
                        Ready to Level Up?
                      </h2>
                      <p className="mb-2 text-sm text-orange-100">
                        Upgrade to <strong>{nextPlanFeatures.name}</strong> and
                        unlock more powerful features
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {nextPlanFeatures.included
                          .slice(0, 3)
                          .map((feature, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium backdrop-blur-md"
                            >
                              <Check className="h-3 w-3" />
                              {feature}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => createCheckoutSession(billingCycle)}
                    disabled={isProcessing}
                    className="hover:scale-102 flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-orange-600 shadow-md transition-all disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="ml-1 text-sm">Processing...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">Upgrade</span>
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Billing Cycle Toggle & Plans (compact) */}
            <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="mb-1 text-2xl font-bold text-gray-900">
                    Choose Your Plan
                  </h2>
                  <p className="text-sm text-gray-600">
                    Select the perfect plan for your creative needs
                  </p>
                </div>
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
                          PLAN_FEATURES[SubscriptionPlan.STANDARD].monthlyPrice,
                          PLAN_FEATURES[SubscriptionPlan.STANDARD].yearlyPrice
                        )}
                        %
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Plans Comparison */}
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
                  const discountedDisplay = calculateDiscounted(displayPrice)
                  const isCurrentPlan = data?.plan === plan
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
                      className={`group relative overflow-hidden rounded-2xl border-2 transition-all hover:shadow-2xl ${
                        isCurrentPlan
                          ? 'border-emerald-500 shadow-xl'
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
                        className={`p-4 ${isRecommended || isCurrentPlan ? 'pt-10' : ''}`}
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
                          {billingCycle === 'yearly' && displayPrice > 0 && (
                            <div className="mt-1 text-xs text-gray-500">
                              Billed ${rawPrice}/year
                            </div>
                          )}
                        </div>
                        <div className="mb-4 space-y-2">
                          {features.included.map((feature, fidx) => (
                            <div key={fidx} className="flex items-start gap-2">
                              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                              <span className="text-sm text-gray-700">
                                {feature}
                              </span>
                            </div>
                          ))}
                          {features.excluded.map((feature, fidx) => (
                            <div key={fidx} className="flex items-start gap-2">
                              <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-300" />
                              <span className="text-sm text-gray-400">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
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
                            onClick={() => createCheckoutSession(billingCycle)}
                            disabled={isProcessing}
                            className={`w-full rounded-md bg-gradient-to-r ${colors[idx]} py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow disabled:opacity-50`}
                          >
                            {isProcessing
                              ? 'Processing...'
                              : `Upgrade to ${features.name}`}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Coupon Section (compact) */}
            <div className="mb-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-xl font-bold text-gray-900">
                    Have a Coupon Code?
                  </h3>
                  <p className="mb-2 text-sm text-gray-600">
                    Enter your code to unlock special discounts
                  </p>
                  <div className="flex max-w-md gap-2">
                    <input
                      type="text"
                      placeholder="ENTER CODE"
                      value={couponCode}
                      onChange={e =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      onBlur={validateCoupon}
                      className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 font-mono font-semibold uppercase text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      onClick={validateCoupon}
                      className="rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow"
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
            </div>

            {/* Security Info (compact) */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    Secure & Transparent Billing
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                        <Check className="h-4 w-4 text-emerald-500" />
                        Payment & Security
                      </h4>
                      <ul className="space-y-1 text-xs text-gray-600">
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
                          <span>Money-back guarantee on eligible plans</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-500">•</span>
                          <span>Automatic billing on renewal date</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        Need Help?
                      </h4>
                      <ul className="space-y-1 text-xs text-gray-600">
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
