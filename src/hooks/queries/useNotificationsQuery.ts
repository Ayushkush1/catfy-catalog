import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  catalogueId?: string
  metadata?: any
}

interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
}

async function fetchNotifications(filters?: {
  unreadOnly?: boolean
}): Promise<NotificationsResponse> {
  const params = new URLSearchParams()
  if (filters?.unreadOnly) params.append('unreadOnly', 'true')

  const response = await fetch(`/api/notifications?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.status}`)
  }

  return response.json()
}

async function markAsRead(notificationId: string): Promise<void> {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Failed to mark notification as read: ${response.status}`)
  }
}

async function markAllAsRead(): Promise<void> {
  const response = await fetch('/api/notifications/mark-all-read', {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Failed to mark all as read: ${response.status}`)
  }
}

/**
 * Hook to fetch and cache notifications
 * - Polls every 60 seconds (reduced from 30s for better performance)
 * - Refetches on window focus
 * - Caches for 30 seconds
 */
export function useNotificationsQuery(filters?: { unreadOnly?: boolean }) {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: () => fetchNotifications(filters),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Poll every 60 seconds (reduced from 30s)
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchIntervalInBackground: false, // Don't poll when tab is hidden
  })
}

/**
 * Hook to fetch unread count only
 * - Lighter query for header badge
 * - Polls every 60 seconds
 */
export function useUnreadCountQuery() {
  const query = useNotificationsQuery()
  return {
    ...query,
    data: query.data?.unreadCount ?? 0,
  }
}

/**
 * Hook to mark a notification as read
 * - Optimistically updates the cache
 */
export function useMarkAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAsRead,
    onMutate: async notificationId => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all })

      // Snapshot previous value
      const previousNotifications =
        queryClient.getQueryData<NotificationsResponse>(
          queryKeys.notifications.list()
        )

      // Optimistically update
      if (previousNotifications) {
        queryClient.setQueryData<NotificationsResponse>(
          queryKeys.notifications.list(),
          {
            ...previousNotifications,
            notifications: previousNotifications.notifications.map(n =>
              n.id === notificationId ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, previousNotifications.unreadCount - 1),
          }
        )
      }

      return { previousNotifications }
    },
    onError: (err, notificationId, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          queryKeys.notifications.list(),
          context.previousNotifications
        )
      }
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })
}

/**
 * Hook to mark all notifications as read
 * - Optimistically updates the cache
 */
export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllAsRead,
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all })

      // Snapshot previous value
      const previousNotifications =
        queryClient.getQueryData<NotificationsResponse>(
          queryKeys.notifications.list()
        )

      // Optimistically update
      if (previousNotifications) {
        queryClient.setQueryData<NotificationsResponse>(
          queryKeys.notifications.list(),
          {
            notifications: previousNotifications.notifications.map(n => ({
              ...n,
              isRead: true,
            })),
            unreadCount: 0,
          }
        )
      }

      return { previousNotifications }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          queryKeys.notifications.list(),
          context.previousNotifications
        )
      }
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })
}
