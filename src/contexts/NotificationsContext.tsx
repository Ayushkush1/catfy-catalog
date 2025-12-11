'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '@/hooks/queries'

export interface NotificationItem {
  id: string
  type: string
  title: string
  message?: string
  url?: string
  createdAt: string
  read?: boolean
  isRead?: boolean
  meta?: any
}

interface NotificationsContextValue {
  list: NotificationItem[]
  unreadCount: number
  open: boolean
  openDrawer: () => void
  closeDrawer: () => void
  markRead: (id: string) => void
  markAllRead: () => void
  isLoading: boolean
  refetch: () => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
)

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false)

  // Use React Query hook for notifications with automatic polling
  const { data, isLoading, refetch } = useNotificationsQuery()
  const markReadMutation = useMarkNotificationReadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()

  const list = data?.notifications || []
  const unreadCount = data?.unreadCount || 0

  // Listen to Supabase realtime updates
  useEffect(() => {
    let channel: any = null
    try {
      const supabase = createSupabaseClient()
      channel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          () => {
            // Refetch notifications when new notification arrives
            refetch()
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications' },
          () => {
            // Refetch when notification is updated
            refetch()
          }
        )
        .subscribe()
    } catch (e) {
      // Ignore if Supabase not configured
      console.debug('Supabase realtime not configured:', e)
    }

    // Listen to legacy open event for compatibility
    const onOpen = () => setOpen(true)
    window.addEventListener('dashboard:openNotifications', onOpen)

    return () => {
      window.removeEventListener('dashboard:openNotifications', onOpen)
      try {
        if (channel && typeof channel.unsubscribe === 'function') {
          channel.unsubscribe()
        }
      } catch (e) {
        console.debug('Error unsubscribing from channel:', e)
      }
    }
  }, [refetch])

  const markRead = (id: string) => {
    markReadMutation.mutate(id)
  }

  const markAllRead = () => {
    markAllReadMutation.mutate()
  }

  return (
    <NotificationsContext.Provider
      value={{
        list,
        unreadCount,
        open,
        openDrawer: () => setOpen(true),
        closeDrawer: () => setOpen(false),
        markRead,
        markAllRead,
        isLoading,
        refetch,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error(
      'useNotifications must be used inside NotificationsProvider'
    )
  }
  return ctx
}
