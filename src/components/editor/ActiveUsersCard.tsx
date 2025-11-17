'use client'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Users, Circle } from 'lucide-react'
import { PresenceUser } from '@/hooks/useCataloguePresence'

interface ActiveUsersCardProps {
  users: PresenceUser[]
  isTracking: boolean
}

export function ActiveUsersCard({ users, isTracking }: ActiveUsersCardProps) {
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

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          Active Users ({users.length})
        </CardTitle>
        <CardDescription className="text-xs">
          Currently editing this catalogue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {users.map(user => (
          <div
            key={user.userId}
            className="flex items-center justify-between rounded-lg bg-muted/50 p-2"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {user.fullName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 animate-pulse fill-green-500 text-green-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="ml-2 shrink-0 text-xs">
              {getSectionLabel(user.section)}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
