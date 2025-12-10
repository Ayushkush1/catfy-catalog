'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import {
  useNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '@/hooks/queries'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/hooks/queries'

export interface NotificationItem {
  id: string
  type: string
  title: string
  message?: string
  url?: string
  createdAt: string
  read?: boolean
  meta?: any
}

interface NotificationsContextValue {
  list: NotificationItem[]
  unreadCount: number
  open: boolean
  openDrawer: () => void
  closeDrawer: () => void
  fetchList: (opts?: {
    reset?: boolean
    filterBy?: 'all' | 'unread'
  }) => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  loadMore: () => Promise<void>
  hasMore: boolean
  setFilter: (f: 'all' | 'unread') => Promise<void>
  isLoading: boolean
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
)

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false)
  const [filter, setFilterState] = useState<'all' | 'unread'>('all')

  // Use React Query for notifications - automatic polling + caching!
  const { data, isLoading, refetch } = useNotificationsQuery({
    unreadOnly: filter === 'unread',
  })

  const markReadMutation = useMarkAsReadMutation()
  const markAllReadMutation = useMarkAllAsReadMutation()
  const queryClient = useQueryClient()

  const list = data?.notifications || []
  const unreadCount = data?.unreadCount || 0

  // Fetch list - now uses React Query refetch
  const fetchList = async ({ reset = true, filterBy = filter } = {}) => {
    await refetch()
  }

  // Mark notification as read - uses optimistic updates
  const markRead = async (id: string) => {
    await markReadMutation.mutateAsync(id)
  }

  // Mark all as read - uses optimistic updates
  const markAllRead = async () => {
    await markAllReadMutation.mutateAsync()
  }

  // Load more - pagination (if needed in future)
  const loadMore = async () => {
    // Pagination can be implemented later if needed
  }

  // Set filter and reload
  const setFilter = async (f: 'all' | 'unread') => {
    setFilterState(f)
    // React Query will automatically refetch with new filter
  }

  useEffect(() => {
    // Listen to legacy open event for compatibility
    const onOpen = () => setOpen(true)
    window.addEventListener('dashboard:openNotifications', onOpen)

    // Realtime subscription using Supabase (if configured)
    let channel: any = null
    try {
      const supabase = createSupabaseClient()
      channel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          () => {
            // Invalidate query to refetch with new notification
            queryClient.invalidateQueries({
              queryKey: queryKeys.notifications.all,
            })
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications' },
          () => {
            // Invalidate query to refetch updated notification
            queryClient.invalidateQueries({
              queryKey: queryKeys.notifications.all,
            })
          }
        )
        .subscribe()
    } catch (e) {
      // Ignore if supabase not configured or errors
    }

    return () => {
      window.removeEventListener('dashboard:openNotifications', onOpen)
      try {
        if (channel && typeof channel.unsubscribe === 'function')
          channel.unsubscribe()
      } catch (e) {}
    }
  }, [queryClient])

  return (
    <NotificationsContext.Provider
      value={{
        list,
        unreadCount,
        open,
        openDrawer: () => setOpen(true),
        closeDrawer: () => setOpen(false),
        fetchList,
        markRead,
        markAllRead,
        loadMore,
        hasMore: false, // Pagination to be implemented if needed
        setFilter,
        isLoading,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext)
  if (!ctx)
    throw new Error(
      'useNotifications must be used inside NotificationsProvider'
    )
  return ctx
}
