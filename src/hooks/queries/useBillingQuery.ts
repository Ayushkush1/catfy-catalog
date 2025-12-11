import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { SubscriptionPlan } from '@prisma/client'

export interface CurrentSubscriptionResponse {
  plan: SubscriptionPlan
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE'
  usage: {
    catalogues: number
    monthlyExports: number
  }
  limits: {
    maxCatalogues: number
    maxProductsPerCatalogue: number
    maxCategoriesPerCatalogue: number
    maxExportsPerMonth: number
  }
  subscription?: {
    id?: string
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    currentPeriodStart?: string
    currentPeriodEnd?: string
    cancelAtPeriodEnd?: boolean
    status?: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE'
  }
}

/**
 * Fetch current subscription/billing data
 */
async function fetchBillingData(): Promise<CurrentSubscriptionResponse> {
  const response = await fetch('/api/subscription/current')

  if (!response.ok) {
    throw new Error(`Failed to fetch billing data: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Hook to fetch and cache billing/subscription data
 * Returns complete subscription info including Stripe details
 */
export function useBillingQuery() {
  return useQuery({
    queryKey: queryKeys.billing,
    queryFn: fetchBillingData,
    staleTime: 10 * 60 * 1000, // 10 minutes - billing data changes very infrequently
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false, // Use global default
    refetchOnMount: false, // Never refetch on mount if cached
  })
}

/**
 * Validate coupon code
 */
interface ValidateCouponParams {
  code: string
  billingCycle: 'MONTHLY' | 'YEARLY'
  amount: number
}

interface ValidateCouponResponse {
  valid: boolean
  discountAmount?: number
  error?: string
}

async function validateCoupon(
  params: ValidateCouponParams
): Promise<ValidateCouponResponse> {
  const response = await fetch('/api/coupons/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to validate coupon')
  }

  return data
}

export function useValidateCouponMutation() {
  return useMutation({
    mutationFn: validateCoupon,
  })
}

/**
 * Create checkout session
 */
interface CreateCheckoutParams {
  plan: 'monthly' | 'yearly'
  couponCode?: string
}

interface CreateCheckoutResponse {
  url?: string
  redirectUrl?: string
  sessionId?: string
}

async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<CreateCheckoutResponse> {
  const response = await fetch('/api/checkout/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create checkout session')
  }

  return data
}

export function useCreateCheckoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: () => {
      // Invalidate billing data after checkout
      queryClient.invalidateQueries({ queryKey: queryKeys.billing })
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription })
    },
  })
}

/**
 * Open billing portal
 */
interface BillingPortalResponse {
  url: string
}

async function openBillingPortal(): Promise<BillingPortalResponse> {
  const response = await fetch('/api/billing/portal', {
    method: 'POST',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to open billing portal')
  }

  return data
}

export function useOpenBillingPortalMutation() {
  return useMutation({
    mutationFn: openBillingPortal,
  })
}

/**
 * Hook to manually refresh billing data
 */
export function useRefreshBilling() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.billing })
    queryClient.invalidateQueries({ queryKey: queryKeys.subscription })
  }
}
