import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { SubscriptionPlan } from '@prisma/client'

interface SubscriptionData {
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
}

/**
 * Fetch subscription data from API
 */
async function fetchSubscription(): Promise<SubscriptionData> {
  const response = await fetch('/api/subscription/current')

  if (!response.ok) {
    throw new Error(`Failed to fetch subscription: ${response.statusText}`)
  }

  const data = await response.json()

  // Provide defaults for free plan if no subscription exists
  return {
    plan: data.plan || SubscriptionPlan.FREE,
    status: data.status || 'ACTIVE',
    usage: data.usage || { catalogues: 0, monthlyExports: 0 },
    limits: data.limits || {
      maxCatalogues: 2,
      maxProductsPerCatalogue: 50,
      maxCategoriesPerCatalogue: 10,
      maxExportsPerMonth: 5,
    },
  }
}

/**
 * Hook to fetch and cache subscription data
 * Returns cached data immediately and revalidates in background
 */
export function useSubscriptionQuery() {
  return useQuery({
    queryKey: queryKeys.subscription,
    queryFn: fetchSubscription,
    staleTime: 10 * 60 * 1000, // 10 minutes (increased for performance)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Use global default
    refetchOnMount: false, // Never refetch on mount if cached
  })
}

/**
 * Hook to manually refresh subscription data
 * Useful after subscription changes or upgrades
 */
export function useRefreshSubscription() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.subscription })
  }
}
