'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
        <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Active Users ({users.length})
                </CardTitle>
                <CardDescription className="text-xs">
                    Currently editing this catalogue
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {users.map((user) => (
                    <div
                        key={user.userId}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="relative">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                    {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <Circle
                                    className="h-3 w-3 absolute -bottom-0.5 -right-0.5 fill-green-500 text-green-500 animate-pulse"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.fullName}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="text-xs ml-2 shrink-0">
                            {getSectionLabel(user.section)}
                        </Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
