import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

interface DashboardStats {
  totalCatalogues: number
  totalProducts: number
  totalViews: number
  monthlyExports: number
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
  }>
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/dashboard/stats')

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${response.status}`)
  }

  return response.json()
}

/**
 * Hook to fetch and cache dashboard statistics
 * - Caches for 2 minutes (stats update frequently)
 * - Refetches on window focus
 */
export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch analytics data with date range
 */
export function useDashboardAnalyticsQuery(dateRange?: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.analytics(dateRange),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateRange) params.append('range', dateRange)

      const response = await fetch(
        `/api/dashboard/analytics?${params.toString()}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`)
      }

      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!dateRange,
  })
}
