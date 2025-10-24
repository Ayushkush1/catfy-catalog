'use client'

import React, { useState, useEffect, useRef } from 'react'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  fullName: string
  email: string
  accountType: 'INDIVIDUAL' | 'BUSINESS'
  companyName?: string
}

export const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile({
          id: data.profile.id,
          fullName: data.profile.fullName || 'User',
          email: data.user.email,
          accountType: data.profile.accountType,
          companyName: data.profile.companyName,
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-gray-300">
        <User className="h-4 w-4 text-gray-600" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
        <User className="h-4 w-4 text-gray-600" />
      </div>
    )
  }

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg p-1 transition-colors hover:bg-gray-100"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-xs font-medium text-white">
          {getInitials(profile.fullName)}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
          {/* Profile Info */}
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#2D1B69] to-[#6366F1] font-medium text-white">
                {getInitials(profile.fullName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {profile.fullName}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {profile.email}
                </p>
                {profile.companyName && (
                  <p className="truncate text-xs text-gray-400">
                    {profile.companyName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/profile')
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Settings className="mr-3 h-4 w-4" />
              Profile Settings
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
