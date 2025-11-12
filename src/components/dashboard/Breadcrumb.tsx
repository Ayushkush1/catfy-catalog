'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

interface BreadcrumbItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface BreadcrumbProps {
  variant?: 'light' | 'dark'
}

export function Breadcrumb({ variant = 'dark' }: BreadcrumbProps) {
  const pathname = usePathname()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/dashboard', icon: Home }
    ]

    let currentPath = ''
    paths.forEach((path, index) => {
      if (path === 'dashboard') return // Skip the dashboard itself in breadcrumbs after home

      currentPath += `/${path}`

      // Customize labels for better UX
      let label = path.charAt(0).toUpperCase() + path.slice(1)
      if (label === 'Catalogue') label = 'Catalogues'
      if (label === 'Pdf-editor') label = 'PDF Editor'
      if (label === 'Edit') label = 'Editor'
      if (label === 'New') label = 'Create New'

      breadcrumbs.push({
        label,
        href: currentPath,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Don't show breadcrumbs on main dashboard
  if (pathname === '/dashboard') return null

  const textColorClass = variant === 'light' ? 'text-white/70' : 'text-gray-600'
  const activeTextColorClass = variant === 'light' ? 'text-white' : 'text-gray-900'
  const hoverColorClass = variant === 'light' ? 'hover:text-white' : 'hover:text-[#6366F1]'
  const separatorColorClass = variant === 'light' ? 'text-white/50' : 'text-gray-400'

  return (
    <nav className={`flex items-center space-x-1 text-sm ${textColorClass} mb-4`}>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1
        const Icon = crumb.icon

        return (
          <Fragment key={crumb.href}>
            {index > 0 && (
              <ChevronRight className={`h-4 w-4 ${separatorColorClass}`} />
            )}
            {isLast ? (
              <span className={`flex items-center gap-1 font-medium ${activeTextColorClass}`}>
                {Icon && <Icon className="h-4 w-4" />}
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className={`flex items-center gap-1 ${hoverColorClass} transition-colors`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {crumb.label}
              </Link>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
