"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Crown, Zap, Check, X, Calendar, Shield, Loader2, ExternalLink, AlertTriangle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { SubscriptionPlan } from '@prisma/client'
import { PLAN_FEATURES, formatPrice, getYearlySavingsPercentage } from '@/lib/subscription'

type CurrentSubscriptionResponse = {
  plan: SubscriptionPlan
  usage: {
    catalogues: number
    monthlyExports: number
  }
  subscription: {
    id: string
    plan: SubscriptionPlan
    status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE'
    currentPeriodStart: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
    stripePriceId: string | null
  } | null
}

export default function DashboardBillingPage() {
  const [data, setData] = useState<CurrentSubscriptionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const router = useRouter()

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/subscription/current')
      if (!res.ok) {
        throw new Error('Failed to load current subscription')
      }
      const json: CurrentSubscriptionResponse = await res.json()
      setData(json)
    } catch (err) {
      console.error('Subscription error:', err)
      setError('Failed to load subscription')
    } finally {
      setIsLoading(false)
    }
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponDiscount(null)
      return
    }
    try {
      // We validate against monthly by default; amount will be applied server-side
      const amount = billingCycle === 'monthly' ? PLAN_FEATURES[SubscriptionPlan.STANDARD].monthlyPrice : PLAN_FEATURES[SubscriptionPlan.STANDARD].yearlyPrice
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, billingCycle: billingCycle.toUpperCase(), amount })
      })
      if (!res.ok) {
        const e = await res.json()
        toast.error(e.error || 'Invalid coupon code')
        setCouponDiscount(null)
        return
      }
      const j = await res.json()
      setCouponDiscount(j.discountAmount)
      toast.success(`Coupon applied! ${j.discountAmount}% discount`)
    } catch {
      setCouponDiscount(null)
      toast.error('Failed to validate coupon')
    }
  }

  const createCheckoutSession = async (cycle: 'monthly' | 'yearly') => {
    setIsProcessing(true)
    setError('')
    try {
      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: cycle, couponCode: couponCode.trim() || undefined })
      })
      const j = await res.json()
      if (!res.ok) {
        throw new Error(j.error || 'Failed to create checkout session')
      }
      // For free after discount, backend may redirect or return success
      const url = j.redirectUrl || j.url
      if (url) {
        window.location.href = url
      } else {
        toast.success('Subscription created successfully!')
        await loadSubscription()
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
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to open billing portal')
      const j = await res.json()
      window.location.href = j.url
    } catch (err) {
      toast.error('Failed to open billing portal')
    } finally {
      setIsProcessing(false)
    }
  }

  const planFeatures = useMemo(() => PLAN_FEATURES[data?.plan || SubscriptionPlan.FREE], [data?.plan])
  const usage = data?.usage

  const calculateDiscounted = (price: number) => {
    if (!couponDiscount) return price
    return Math.max(0, price * (1 - couponDiscount / 100))
  }

  const recommendedPlan = useMemo(() => {
    if (!usage) return null
    const order = [SubscriptionPlan.FREE, SubscriptionPlan.STANDARD, SubscriptionPlan.PROFESSIONAL, SubscriptionPlan.BUSINESS]
    const currentIdx = order.indexOf(data?.plan || SubscriptionPlan.FREE)
    // Recommend next plan if user hits limits
    const current = PLAN_FEATURES[order[currentIdx]]
    const atCatalogueLimit = current.maxCatalogues !== -1 && usage.catalogues >= current.maxCatalogues
    const atExportLimit = current.maxExportsPerMonth !== -1 && usage.monthlyExports >= current.maxExportsPerMonth
    if (atCatalogueLimit || atExportLimit) {
      return order[Math.min(currentIdx + 1, order.length - 1)]
    }
    return null
  }, [usage, data?.plan])

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#E8EAF6]">
        <div className="ml-24 flex-1">
          <DashboardHeader title="Billing & Plans" subtitle="Manage your subscription and billing information" />
          <div className="p-8">
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-xl" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-96 rounded-xl" />
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
        <DashboardHeader title="Billing & Plans" subtitle="Manage your subscription and billing information" />
        <div className="p-8">

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Current Subscription */}
          {data?.subscription && (
            <Card className="border-0 shadow-lg mb-8 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${data.plan === SubscriptionPlan.FREE ? 'from-gray-400 to-gray-500' : 'from-[#6366F1] to-[#8B5CF6]'} flex items-center justify-center shadow-lg`}>
                      {data.plan === SubscriptionPlan.FREE ? (
                        <Zap className="h-8 w-8 text-white" />
                      ) : (
                        <Crown className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {PLAN_FEATURES[data.plan].name} Plan
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={data.subscription.status === 'ACTIVE' ? 'default' : 'destructive'} className={data.subscription.status === 'ACTIVE' ? 'bg-green-500' : ''}>
                          {data.subscription.status}
                        </Badge>
                        {data.plan !== SubscriptionPlan.FREE && (
                          <span className="text-sm text-gray-600">
                            {data.subscription.stripePriceId ? 'Payment method on file' : 'No payment method'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {data.plan !== SubscriptionPlan.FREE && (
                    <Button variant="outline" size="sm" onClick={openCustomerPortal} disabled={isProcessing} className="bg-white hover:bg-gray-50">
                      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                      Manage Subscription
                    </Button>
                  )}
                </div>

                {/* Usage and next billing */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 bg-white rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <Label className="text-xs font-medium text-gray-500">Current Period</Label>
                      <div className="text-sm font-medium text-gray-900">
                        {format(new Date(data.subscription.currentPeriodStart), 'MMM d, yyyy')} - {format(new Date(data.subscription.currentPeriodEnd), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <div>
                      <Label className="text-xs font-medium text-gray-500">Next Billing</Label>
                      <div className="text-sm font-medium text-gray-900">
                        {data.subscription.cancelAtPeriodEnd ? 'Cancels at period end' : format(new Date(data.subscription.currentPeriodEnd), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage metrics */}
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <Label className="text-xs font-medium text-gray-500">Catalogues</Label>
                    <div className="mt-1 flex items-baseline justify-between">
                      <div className="text-sm font-medium text-gray-900">{usage?.catalogues ?? 0}</div>
                      <div className="text-xs text-gray-600">Limit: {planFeatures.maxCatalogues === -1 ? 'Unlimited' : planFeatures.maxCatalogues}</div>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]"
                        style={{ width: `${planFeatures.maxCatalogues === -1 ? 100 : Math.min(100, ((usage?.catalogues || 0) / planFeatures.maxCatalogues) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <Label className="text-xs font-medium text-gray-500">Monthly Exports</Label>
                    <div className="mt-1 flex items-baseline justify-between">
                      <div className="text-sm font-medium text-gray-900">{usage?.monthlyExports ?? 0}</div>
                      <div className="text-xs text-gray-600">Limit: {planFeatures.maxExportsPerMonth === -1 ? 'Unlimited' : planFeatures.maxExportsPerMonth}</div>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#10B981] to-[#34D399]"
                        style={{ width: `${planFeatures.maxExportsPerMonth === -1 ? 100 : Math.min(100, ((usage?.monthlyExports || 0) / planFeatures.maxExportsPerMonth) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upgrade Plans */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Available Plans</h3>
            <div className="inline-flex items-center rounded-lg bg-white p-1 shadow-sm">
              <button
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${billingCycle === 'yearly' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">Save {getYearlySavingsPercentage(PLAN_FEATURES[SubscriptionPlan.STANDARD].monthlyPrice, PLAN_FEATURES[SubscriptionPlan.STANDARD].yearlyPrice)}%</Badge>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[SubscriptionPlan.FREE, SubscriptionPlan.STANDARD, SubscriptionPlan.PROFESSIONAL, SubscriptionPlan.BUSINESS].map(plan => {
              const features = PLAN_FEATURES[plan]
              const rawPrice = billingCycle === 'monthly' ? features.monthlyPrice : features.yearlyPrice
              const displayPrice = billingCycle === 'yearly' ? rawPrice / 12 : rawPrice
              const discountedDisplay = calculateDiscounted(displayPrice)
              const isCurrentPlan = data?.plan === plan
              const isRecommended = recommendedPlan === plan
              return (
                <Card key={plan} className={`relative border-0 shadow-lg hover:shadow-xl transition-all ${isRecommended ? 'ring-2 ring-purple-500' : ''} ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}>
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                      <Badge className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white border-0">Recommended</Badge>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-green-500 text-white">Current Plan</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${plan === SubscriptionPlan.FREE ? 'from-gray-400 to-gray-500' : 'from-[#6366F1] to-[#8B5CF6]'} flex items-center justify-center shadow-lg`}>
                        {plan === SubscriptionPlan.FREE ? <Zap className="h-8 w-8 text-white" /> : <Crown className="h-8 w-8 text-white" />}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{features.name}</CardTitle>
                    <CardDescription>{features.description}</CardDescription>
                    <div className="mt-4">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold">{formatPrice(discountedDisplay)}</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      {couponDiscount && displayPrice > 0 && (
                        <div className="mt-1 text-sm text-gray-500">
                          <span className="line-through">{formatPrice(displayPrice)}</span>
                          <span className="ml-2 font-medium text-green-600">{couponDiscount}% off</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {features.included.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                      {features.excluded.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <X className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4">
                      {isCurrentPlan ? (
                        <Button className="w-full" disabled>
                          <Check className="mr-2 h-4 w-4" /> Current Plan
                        </Button>
                      ) : plan === SubscriptionPlan.FREE ? (
                        <Button variant="outline" className="w-full" disabled>
                          Downgrade
                        </Button>
                      ) : (
                        <Button className="w-full" onClick={() => createCheckoutSession(billingCycle)} disabled={isProcessing}>
                          {isProcessing ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>) : (<>Upgrade to {features.name}</>)}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Coupon Code */}
          <Card className="mt-8 mb-8 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" /> Have a coupon code?
              </CardTitle>
              <CardDescription>Enter your coupon code to get a discount on your subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input placeholder="Enter coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} onBlur={validateCoupon} />
                </div>
                <Button variant="outline" onClick={validateCoupon}>Apply</Button>
              </div>
              {couponDiscount && (
                <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="h-4 w-4" />
                    <span className="font-medium">{couponDiscount}% discount applied!</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* FAQ or Additional Info */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <Shield className="h-12 w-12 text-purple-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Secure Billing with Stripe</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 font-medium text-gray-900">Payment & Security</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Secure payments powered by Stripe</li>
                        <li>• Cancel anytime, no hidden fees</li>
                        <li>• Money-back guarantee on eligible plans</li>
                        <li>• Automatic billing on renewal date</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium text-gray-900">Need Help?</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Contact support for billing questions</li>
                        <li>• View invoices in billing portal</li>
                        <li>• Update payment methods anytime</li>
                        <li>• Download receipts for tax purposes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}