'use client'

import React from 'react'
import { useNotifications } from '@/contexts/NotificationsContext'

function timeAgo(dateStr?: string) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

export function NotificationsDrawer() {
  const { list, open, closeDrawer, markRead, markAllRead, unreadCount } =
    useNotifications()

  if (!open) return null

  const items = [...list].sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <aside className="fixed right-4 top-16 z-50 max-h-[60vh] w-[320px] overflow-auto rounded-lg bg-white shadow ring-1 ring-black/5">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          <span className="text-xs text-gray-400">{unreadCount} unread</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => markAllRead()}
            className="text-xs text-indigo-600 hover:underline"
          >
            Clear all
          </button>
          <button
            onClick={() => closeDrawer()}
            className="text-xs text-gray-500"
          >
            Close
          </button>
        </div>
      </div>

      <div>
        {items.length === 0 && (
          <div className="p-3 text-sm text-gray-500">No notifications</div>
        )}

        {items.map((n: any) => (
          <div
            key={n.id}
            className={`flex items-center gap-3 border-b px-3 py-2 ${n.read ? 'bg-white' : 'bg-indigo-50'}`}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
              {n.title?.[0] ?? '•'}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium">{n.title}</p>
                <span className="ml-2 text-xs text-gray-400">
                  {timeAgo(n.createdAt)}
                </span>
              </div>
              {n.message && (
                <p className="truncate text-xs text-gray-500">{n.message}</p>
              )}
            </div>

            <div className="flex-shrink-0">
              {!n.read ? (
                <button
                  onClick={() => markRead(n.id)}
                  className="text-xs text-indigo-600"
                >
                  Clear
                </button>
              ) : (
                <span className="text-xs text-gray-400">Read</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 text-center text-sm">
        <a
          href="/dashboard/notifications"
          onClick={() => closeDrawer()}
          className="text-xs text-indigo-600"
        >
          View all
        </a>
      </div>
    </aside>
  )
}
