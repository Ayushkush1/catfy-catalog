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
    currentPeriodEnd?: string
    cancelAtPeriodEnd?: boolean
}

async function fetchSubscription(): Promise<SubscriptionData> {
    const response = await fetch('/api/subscription/current')

    if (!response.ok) {
        // Return default FREE plan on error
        return {
            plan: SubscriptionPlan.FREE,
            status: 'ACTIVE',
            usage: {
                catalogues: 0,
                monthlyExports: 0,
            },
        }
    }

    return response.json()
}

/**
 * Hook to fetch and cache subscription data
 * - Caches for 5 minutes (subscriptions don't change often)
 * - Refetches on window focus
 * - Returns FREE plan as default while loading
 */
export function useSubscriptionQuery() {
    return useQuery({
        queryKey: queryKeys.subscription.current(),
        queryFn: fetchSubscription,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: true,
        placeholderData: {
            plan: SubscriptionPlan.FREE,
            status: 'ACTIVE' as const,
            usage: {
                catalogues: 0,
                monthlyExports: 0,
            },
        },
    })
}

/**
 * Hook to manually refresh subscription data
 * Useful after subscription changes
 */
export function useRefreshSubscription() {
    const queryClient = useQueryClient()

    return () => {
        queryClient.invalidateQueries({
            queryKey: queryKeys.subscription.current(),
        })
    }
}
