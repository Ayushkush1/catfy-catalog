'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

/**
 * Renders the dashboard Sidebar globally, hidden on editor-related routes.
 * Hidden on:
 * - `/editor` and subpaths
 * - `/editor-test` and subpaths
 * - `/pdf-editor` and subpaths
 * - `/catalogue/[id]/edit` and subpaths
 */
export function GlobalSidebar() {
  const pathname = usePathname()

  const hideOnEditorRoutes = (() => {
    if (!pathname) return false
    // Hide on main landing page
    if (pathname === '/') return true
    if (pathname.startsWith('/editor')) return true
    if (pathname.startsWith('/editor-test')) return true
    if (pathname.startsWith('/pdf-editor')) return true
    if (pathname.startsWith('/auth')) return true
    if (pathname.startsWith('/admin/')) return true
    if (pathname.startsWith('/onboarding')) return true
    // Hide on preview routes
    if (/^\/catalogue\/[^/]+\/preview(\/.*)?$/.test(pathname)) return true
    if (pathname.startsWith('/preview')) return true
    return false
  })()

  if (hideOnEditorRoutes) {
    return null
  }

  return <Sidebar />
}
