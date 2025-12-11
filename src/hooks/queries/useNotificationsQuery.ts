import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

interface Notification {
  id: string
  type: 'PLAN_SHARED' | 'TEAM_INVITATION' | 'CATALOGUE_SHARED' | 'SYSTEM'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  metadata?: any
}

interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
}

/**
 * Fetch notifications from API
 */
async function fetchNotifications(): Promise<NotificationsResponse> {
  const response = await fetch('/api/notifications')

  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Hook to fetch and cache notifications with automatic polling
 * Polls every 60 seconds and refetches when window gains focus
 */
export function useNotificationsQuery() {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: fetchNotifications,
    staleTime: 30 * 1000, // Consider stale after 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchInterval: 60 * 1000, // Poll every 60 seconds (reduced from 30s)
    refetchOnMount: false, // Never refetch on mount if cached, rely on polling
    refetchIntervalInBackground: false, // Only poll when window is visible
  })
}

/**
 * Hook to fetch only unread notifications count
 */
export function useUnreadNotificationsQuery() {
  return useQuery({
    queryKey: queryKeys.notifications.unread,
    queryFn: async () => {
      const response = await fetch('/api/notifications?unreadOnly=true')
      if (!response.ok) throw new Error('Failed to fetch unread notifications')
      const data = await response.json()
      return data.unreadCount || 0
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
  })
}

/**
 * Hook to mark a notification as read
 */
export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: 'POST',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      return response.json()
    },
    onMutate: async notificationId => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all })

      // Snapshot previous value
      const previousNotifications =
        queryClient.getQueryData<NotificationsResponse>(
          queryKeys.notifications.all
        )

      // Optimistically update
      if (previousNotifications) {
        queryClient.setQueryData<NotificationsResponse>(
          queryKeys.notifications.all,
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
          queryKeys.notifications.all,
          context.previousNotifications
        )
      }
    },
    onSuccess: () => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unread,
      })
    },
  })
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read')
      }

      return response.json()
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all })

      const previousNotifications =
        queryClient.getQueryData<NotificationsResponse>(
          queryKeys.notifications.all
        )

      // Optimistically mark all as read
      if (previousNotifications) {
        queryClient.setQueryData<NotificationsResponse>(
          queryKeys.notifications.all,
          {
            ...previousNotifications,
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
    onError: (err, _, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          queryKeys.notifications.all,
          context.previousNotifications
        )
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unread,
      })
    },
  })
}
