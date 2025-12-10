/**
 * Centralized React Query Hooks
 *
 * This module provides all query hooks for the application.
 * All hooks use React Query for caching, deduplication, and background refetching.
 *
 * Benefits:
 * - Instant loading with cached data
 * - Automatic background updates
 * - Request deduplication
 * - Optimistic updates
 * - Better performance and UX
 */

export * from './queryKeys'
export * from './useProfileQuery'
export * from './useSubscriptionQuery'
export * from './useCataloguesQuery'
export * from './useNotificationsQuery'
export * from './useDashboardStatsQuery'
