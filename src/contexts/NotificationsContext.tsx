'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'

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
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
)

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [list, setList] = useState<NotificationItem[]>([])
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = useMemo(() => list.filter(n => !n.read).length, [list])

  const fetchList = async ({ reset = true, filterBy = filter } = {}) => {
    try {
      const params = new URLSearchParams()
      params.set('limit', '20')
      if (!reset && cursor) params.set('cursor', cursor)
      if (filterBy === 'unread') params.set('filter', 'unread')

      const res = await fetch(`/api/notifications?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const items: NotificationItem[] = data.items || []
        if (reset) {
          setList(items)
        } else {
          setList(prev => [...prev, ...items])
        }
        setCursor(data.nextCursor || null)
        setHasMore(Boolean(data.nextCursor))
      }
    } catch (e) {
      // ignore for now
    }
  }

  useEffect(() => {
    // initial fetch
    fetchList({ reset: true, filterBy: filter })

    // polling fallback (30s)
    const id = window.setInterval(() => {
      fetchList({ reset: true, filterBy: filter })
    }, 30000)

    // listen to legacy open event for compatibility
    const onOpen = () => setOpen(true)
    window.addEventListener('dashboard:openNotifications', onOpen)

    // realtime subscription using Supabase (if configured)
    let channel: any = null
    try {
      const supabase = createSupabaseClient()
      channel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          payload => {
            try {
              const newItem = payload.new as NotificationItem
              // only add if it's for this user or global
              if (!newItem) return
              // fetch profile id from server once if needed
              // we conservatively add new items; server-side filtering will be applied on next fetch
              setList(prev => [newItem, ...prev])
            } catch (e) {
              /* ignore */
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications' },
          payload => {
            try {
              const newItem = payload.new as NotificationItem
              if (!newItem) return
              setList(prev =>
                prev.map(p => (p.id === newItem.id ? newItem : p))
              )
            } catch (e) {}
          }
        )
        .subscribe()
    } catch (e) {
      // ignore if supabase not configured or errors
    }

    return () => {
      window.clearInterval(id)
      window.removeEventListener('dashboard:openNotifications', onOpen)
      try {
        if (channel && typeof channel.unsubscribe === 'function')
          channel.unsubscribe()
      } catch (e) {}
    }
  }, [])

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/mark-read`, { method: 'POST' })
    } catch (e) {
      // ignore
    }
    setList(prev => prev.map(p => (p.id === id ? { ...p, read: true } : p)))
  }

  const markAllRead = async () => {
    try {
      await fetch(`/api/notifications/mark-all-read`, { method: 'POST' })
    } catch (e) {
      // ignore
    }
    setList(prev => prev.map(p => ({ ...p, read: true })))
  }

  const loadMore = async () => {
    if (!hasMore) return
    await fetchList({ reset: false, filterBy: filter })
  }

  const setFilterAndReload = async (f: 'all' | 'unread') => {
    setFilter(f)
    setCursor(null)
    setHasMore(true)
    await fetchList({ reset: true, filterBy: f })
  }

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
        hasMore,
        setFilter: setFilterAndReload,
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
