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
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { className?: string }>
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
    isActive: true
  },
  {
    id: 'projects',
    label: 'My Projects',
    icon: FolderOpen,
    href: '/dashboard/projects',
    isActive: true
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/dashboard/analytics',
    isActive: true
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    href: '/dashboard/team',
    isActive: true
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpCircle,
    href: '/dashboard/help',
    isActive: true
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-4 top-4 z-40 h-[calc(100vh-2rem)] w-[70px]">
      {/* Curved background wrapper */}
      <div className="sidebar-curved absolute inset-0">
        <style jsx>{`
          .sidebar-curved {
            background: #FFFFFF;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }
          
          .sidebar-curved::before {
            content: '';
            position: absolute;
            top: 15%;
            right: 0;
            width: 15px;
            height: 100px;
            background: #FFFFFF;
            border-radius: 0 80px 80px 0;
          }
          
          .sidebar-curved::after {
            content: '';
            position: absolute;
            bottom: 20%;
            right: 0;
            width: 15px;
            height: 100px;
            background: #FFFFFF;
            border-radius: 0 80px 80px 0;
          }

          /* Premium Icon Animations */
          @keyframes iconBounce {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-3px) scale(1.1); }
          }

          @keyframes iconPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }

          @keyframes iconRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes iconGlow {
            0%, 100% { 
              box-shadow: 0 0 0px rgba(99, 102, 241, 0);
            }
            50% { 
              box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
            }
          }

          @keyframes iconSlideIn {
            0% { transform: translateX(-10px); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }

          @keyframes buttonGlow {
            0%, 100% {
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            50% {
              box-shadow: 0 8px 20px -2px rgba(99, 102, 241, 0.3);
            }
          }

          /* Lightweight, very smooth transitions for interactive states */
          .nav-link {
            transition: transform 420ms cubic-bezier(.16,.84,.3,1),
                        box-shadow 420ms cubic-bezier(.16,.84,.3,1),
                        background 380ms cubic-bezier(.16,.84,.3,1),
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
            transition: transform 360ms cubic-bezier(.16,.84,.3,1), color 260ms ease, opacity 260ms ease;
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
            box-shadow: 0 14px 36px rgba(99,102,241,0.16);
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
            animation: iconSlideIn 0.44s cubic-bezier(.16,.84,.3,1) forwards;
            opacity: 0;
          }

          .nav-item:nth-child(1) { animation-delay: 0.05s; }
          .nav-item:nth-child(2) { animation-delay: 0.1s; }
          .nav-item:nth-child(3) { animation-delay: 0.15s; }
          .nav-item:nth-child(4) { animation-delay: 0.2s; }
          .nav-item:nth-child(5) { animation-delay: 0.25s; }
        `}</style>
      </div>

      {/* Content */}
      <div className="relative flex h-full flex-col items-center pb-4 pt-1 z-10">
        {/* Logo */}
        <div className="mb-16">
          <Link href="/dashboard" className="group relative flex items-center justify-center">
            <div className="relative flex flex-col h-20 w-20 items-center justify-center  overflow-hidden">
              <Image
                src="/assets/CATFYLogo.png"
                alt="CatFy Logo"
                width={60}
                height={60}
                className="object-contain"
                priority
              />
              <p className='font-bold text-xs bg-gradient-to-r from-[#6366F1] to-[#2D1B69] bg-clip-text text-transparent -mt-1.5'>CATFY</p>
            </div>
            {/* Tooltip */}
            <div className="pointer-events-none absolute left-full ml-4 hidden whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
              CATFY Dashboard
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 w-full px-3">
          <div className="space-y-4">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon
              // Exact match for home, prefix match for others
              const isCurrentPath = item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <div key={item.id} className="relative nav-item">
                  <Link
                    href={item.isActive ? item.href : '#'}
                    className={cn(
                      'nav-link group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ease-out',
                      isCurrentPath
                        ? 'nav-link-active bg-gradient-to-br from-[#6366F1] to-[#2D1B69] shadow-lg shadow-purple-500/40 scale-105'
                        : item.isActive
                          ? 'bg-gray-100/80 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 hover:shadow-lg hover:scale-110'
                          : 'cursor-not-allowed bg-gray-50/50 opacity-40'
                    )}
                  >
                    <Icon
                      className={cn(
                        'transition-all duration-300 ease-out',
                        isCurrentPath
                          ? 'h-6 w-6 text-white icon-active'
                          : item.isActive
                            ? 'h-5 w-5 text-gray-700 icon-hover group-hover:scale-105 group-hover:text-[#6366F1]'
                            : 'h-6 w-6 text-gray-400'
                      )}
                      strokeWidth={2.2}
                    />
                    {item.badge && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white animate-pulse">
                        !
                      </span>
                    )}
                    {/* Tooltip */}
                    {item.isActive && (
                      <div className="pointer-events-none absolute left-full ml-4 hidden whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm text-white opacity-0 transition-all duration-200 group-hover:block group-hover:opacity-100 group-hover:translate-x-1">
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
        <div className="mt-auto w-full px-3">
          <div className="relative">
            <Link
              href="/dashboard/settings"
              className={cn(
                'nav-link group relative flex h-11 w-full items-center justify-center rounded-xl transition-all duration-300 ease-out',
                // Use startsWith to correctly detect nested routes under /dashboard/settings
                pathname?.startsWith('/dashboard/settings')
                  ? 'nav-link-active bg-gradient-to-br from-[#6366F1] to-[#2D1B69] shadow-lg shadow-purple-500/40 scale-105'
                  : 'bg-gray-100/80 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 hover:shadow-lg hover:scale-110'
              )}
            >
              <Settings
                className={cn(
                  'transition-all duration-300 ease-out',
                  pathname?.startsWith('/dashboard/settings')
                    ? 'h-6 w-6 text-white  icon-active'
                    : 'h-5 w-5 text-gray-700 icon-settings group-hover:text-[#6366F1]'
                )}
                strokeWidth={2}
              />
              {/* Tooltip */}
              <div className="pointer-events-none absolute left-full ml-4 hidden whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm text-white opacity-0 transition-all duration-200 group-hover:block group-hover:opacity-100 group-hover:translate-x-1">
                Settings
              </div>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
