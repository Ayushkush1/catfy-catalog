'use client'

import { PresenceUser } from '@/hooks/useCataloguePresence'
import { Users, Circle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ActiveUsersNavbarProps {
  users: PresenceUser[]
  isTracking: boolean
}

export function ActiveUsersNavbar({
  users,
  isTracking,
}: ActiveUsersNavbarProps) {
  if (!isTracking || users.length === 0) {
    return null
  }

  const getSectionLabel = (section?: string) => {
    const labels: Record<string, string> = {
      general: 'General',
      products: 'Products',
      categories: 'Categories',
      settings: 'Settings',
    }
    return labels[section || 'general'] || section || 'Viewing'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Show max 3 avatars, then +X more
  const displayUsers = users.slice(0, 3)
  const remainingCount = users.length - 3

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100">
          <div className="flex items-center -space-x-2">
            {displayUsers.map((user, index) => (
              <div
                key={user.userId}
                className="relative"
                style={{ zIndex: displayUsers.length - index }}
              >
                <Avatar className="h-7 w-7 border-2 border-white ring-1 ring-gray-200">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-[10px] font-semibold text-white">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <Circle className="absolute -bottom-0.5 -right-0.5 h-2 w-2 animate-pulse fill-green-500 text-green-500" />
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[10px] font-semibold text-gray-600 ring-1 ring-gray-200">
                +{remainingCount}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {users.length}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">
              Active Users
            </h4>
            <Badge variant="secondary" className="text-xs">
              {users.length} online
            </Badge>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {users.map(user => (
              <div
                key={user.userId}
                className="flex items-center gap-3 rounded-lg bg-gray-50 p-2"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-semibold text-white">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <Circle className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 animate-pulse fill-green-500 text-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {user.fullName}
                  </p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {getSectionLabel(user.section)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
