'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BarChart3,
  Users,
  CreditCard,
  HelpCircle,
  Settings,
  FolderOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<
    React.SVGProps<SVGSVGElement> & { className?: string }
  >
  href: string
  badge?: string
  isActive?: boolean
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/dashboard',
    isActive: true,
  },
  {
    id: 'projects',
    label: 'My Projects',
    icon: FolderOpen,
    href: '/dashboard/projects',
    isActive: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/dashboard/analytics',
    isActive: true,
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    href: '/dashboard/team',
    isActive: true,
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpCircle,
    href: '/dashboard/help',
    isActive: true,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed z-40 h-[100vh] w-[70px] pl-2">
      {/* Curved background wrapper */}
      <div className="sidebar-curved absolute inset-0">
        <style jsx>{`
          /* Premium Icon Animations */
          @keyframes iconBounce {
            0%,
            100% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-3px) scale(1.1);
            }
          }

          @keyframes iconPulse {
            0%,
            100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }

          @keyframes iconRotate {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          @keyframes iconGlow {
            0%,
            100% {
              box-shadow: 0 0 0px rgba(99, 102, 241, 0);
            }
            50% {
              box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
            }
          }

          @keyframes iconSlideIn {
            0% {
              transform: translateX(-10px);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes buttonGlow {
            0%,
            100% {
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            50% {
              box-shadow: 0 8px 20px -2px rgba(99, 102, 241, 0.3);
            }
          }

          /* Lightweight, very smooth transitions for interactive states */
          .nav-link {
            transition:
              transform 420ms cubic-bezier(0.16, 0.84, 0.3, 1),
              box-shadow 420ms cubic-bezier(0.16, 0.84, 0.3, 1),
              background 380ms cubic-bezier(0.16, 0.84, 0.3, 1),
              color 260ms ease;
            will-change: transform, box-shadow, background, color;
            -webkit-font-smoothing: antialiased;
            backface-visibility: hidden;
            transform: translateZ(0);
          }

          /* Icon transition (hover / active) */
          .nav-link .icon-active,
          .nav-link .icon-hover,
          .nav-link .icon-settings {
            transition:
              transform 360ms cubic-bezier(0.16, 0.84, 0.3, 1),
              color 260ms ease,
              opacity 260ms ease;
            transform-origin: center center;
            backface-visibility: hidden;
            transform: translateZ(0);
          }

          /* Subtle, smooth pop for hover */
          .nav-link:hover {
            transform: translateY(-4px) scale(1.03);
          }

          .nav-link:hover .icon-hover {
            transform: translateY(-2px) scale(1.12);
            opacity: 0.98;
          }

          /* Active state: gentle lift + soft shadow */
          .nav-link-active {
            transform: translateY(-4px) scale(1.07);
            box-shadow: 0 14px 36px rgba(99, 102, 241, 0.16);
          }

          .nav-link-active .icon-active {
            transform: translateY(-1px) scale(1.12) rotate(4deg);
            color: #ffffff;
            opacity: 1;
          }

          /* Settings icon rotation on hover (subtle) */
          .nav-link:hover .icon-settings {
            transform: rotate(8deg) scale(1.06);
          }

          /* Slide in animation (initial mount) */
          .nav-item {
            animation: iconSlideIn 0.44s cubic-bezier(0.16, 0.84, 0.3, 1)
              forwards;
            opacity: 0;
          }

          .nav-item:nth-child(1) {
            animation-delay: 0.05s;
          }
          .nav-item:nth-child(2) {
            animation-delay: 0.1s;
          }
          .nav-item:nth-child(3) {
            animation-delay: 0.15s;
          }
          .nav-item:nth-child(4) {
            animation-delay: 0.2s;
          }
          .nav-item:nth-child(5) {
            animation-delay: 0.25s;
          }
        `}</style>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center pb-4 pt-1">
        {/* Logo */}
        <div className="mb-16">
          <Link
            href="/dashboard"
            className="group relative flex items-center justify-center"
          >
            <div className="relative mt-2 flex h-20 w-16 flex-col items-center justify-center  overflow-hidden">
              <Image
                src="/assets/CATFYLogo.png"
                alt="CatFy Logo"
                width={64}
                height={64}
                className="object-contain"
                priority
              />
              <p className="-mt-1.5 bg-gradient-to-r from-[#6366F1] to-[#2D1B69] bg-clip-text text-xs font-bold text-transparent">
                CATFY
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="w-full flex-1">
          <div className="space-y-5">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon
              // Exact match for home, prefix match for others
              const isCurrentPath =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href ||
                    pathname.startsWith(item.href + '/')

              return (
                <div
                  key={item.id}
                  className="nav-item relative flex justify-center"
                >
                  <Link
                    href={item.isActive ? item.href : '#'}
                    className={cn(
                      'nav-link group relative flex h-[2.6rem] w-[2.6rem] items-center justify-center rounded-xl transition-all duration-300 ease-out hover:scale-110 hover:ring-1 hover:ring-[#6366F1]/5',
                      isCurrentPath
                        ? 'nav-link-active scale-110 bg-gradient-to-br from-[#6366F1] to-[#2D1B69] shadow-lg shadow-purple-500/40'
                        : item.isActive
                          ? 'bg-white shadow-sm hover:scale-110 hover:bg-white hover:shadow-lg hover:backdrop-blur-sm'
                          : 'cursor-not-allowed bg-gray-50/50 opacity-40'
                    )}
                  >
                    <Icon
                      className={cn(
                        'transition-all duration-300 ease-out',
                        isCurrentPath
                          ? 'icon-active h-[1.3rem] w-[1.3em] text-white'
                          : item.isActive
                            ? 'icon-hover h-[1.3rem] w-[1.3rem] text-gray-700 group-hover:scale-105 group-hover:text-[#6366F1]'
                            : 'h-[1.3rem] w-[1.3rem] text-gray-400'
                      )}
                      strokeWidth={2.2}
                    />
                    {item.badge && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
                        !
                      </span>
                    )}
                    {/* Tooltip */}
                    {item.isActive && (
                      <div className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 transition-all duration-200 group-hover:block group-hover:translate-x-1 group-hover:opacity-100">
                        {item.label}
                        {item.badge && (
                          <span className="ml-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs text-gray-900">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
        </nav>

        {/* Settings at Bottom */}
        <div className="mt-auto w-full">
          <div className="relative flex justify-center pb-4">
            <Link
              href="/dashboard/settings"
              className={cn(
                'nav-link group relative flex h-[2.6rem] w-[2.6rem] items-center justify-center rounded-xl transition-all duration-300 ease-out hover:scale-110 hover:ring-1 hover:ring-[#6366F1]/5',
                // Use startsWith to correctly detect nested routes under /dashboard/settings
                pathname?.startsWith('/dashboard/settings')
                  ? 'nav-link-active scale-110 bg-gradient-to-br from-[#6366F1] to-[#2D1B69] shadow-lg shadow-purple-500/40'
                  : 'bg-white shadow-sm hover:scale-110 hover:bg-white hover:shadow-lg hover:backdrop-blur-sm'
              )}
            >
              <Settings
                className={cn(
                  'transition-all duration-300 ease-out',
                  pathname?.startsWith('/dashboard/settings')
                    ? 'icon-active h-[1.3rem] w-[1.3rem] text-white'
                    : 'icon-settings h-[1.3rem] w-[1.3rem] text-gray-700 group-hover:text-[#6366F1]'
                )}
                strokeWidth={2}
              />
              {/* Tooltip */}
              <div className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 transition-all duration-200 group-hover:block group-hover:translate-x-1 group-hover:opacity-100">
                Settings
              </div>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
