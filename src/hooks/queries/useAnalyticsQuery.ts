import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

interface AnalyticsData {
  views: number
  catalogues: Array<{
    id: string
    name: string
    isPublic?: boolean
    [key: string]: any
  }>
  templates: number
  themes: number
  overview?: {
    totalCatalogues?: number
    publishedCatalogues?: number
    totalViews?: number
    userTemplates?: number
    availableTemplates?: number
    totalExports?: number
    completedExports?: number
    pendingExports?: number
  }
  growth?: {
    catalogueGrowth?: number
  }
  dailyActivity?: Array<{
    date: string
    catalogues: number
    views: number
  }>
  recentActivity: Array<{
    id: string
    action: string
    timestamp: string
    catalogueName?: string
  }>
}

/**
 * Fetch analytics data from API
 */
async function fetchAnalytics(): Promise<AnalyticsData> {
  const response = await fetch('/api/analytics')

  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Hook to fetch and cache analytics data
 * Returns cached data immediately and revalidates in background
 */
export function useAnalyticsQuery() {
  return useQuery({
    queryKey: queryKeys.analytics.overview,
    queryFn: fetchAnalytics,
    staleTime: 10 * 60 * 1000, // 10 minutes - analytics don't change frequently
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false, // Use global default
    refetchOnMount: false, // Never refetch on mount if cached
  })
}
