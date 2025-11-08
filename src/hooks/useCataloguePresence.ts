'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface PresenceUser {
    userId: string
    fullName: string
    email: string
    section?: string // 'general', 'products', 'categories', 'settings'
    lastSeen: string
}

interface UseCataloguePresenceOptions {
    catalogueId: string
    currentUser: {
        userId: string
        fullName: string
        email: string
    } | null
    currentSection?: string
    enabled?: boolean
}

export function useCataloguePresence({
    catalogueId,
    currentUser,
    currentSection = 'general',
    enabled = true,
}: UseCataloguePresenceOptions) {
    const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([])
    const [isTracking, setIsTracking] = useState(false)
    const channelRef = useRef<any>(null)

    // Main effect for setting up presence channel
    useEffect(() => {
        if (!enabled || !catalogueId || !currentUser) {
            setActiveUsers([])
            setIsTracking(false)
            return
        }

        const supabase = createClient()
        const channelName = `presence:catalogue:${catalogueId}`

        const channel = supabase.channel(channelName, {
            config: {
                presence: {
                    key: currentUser.userId,
                },
            },
        })

        channelRef.current = channel

        // Track presence
        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState()
                const users: PresenceUser[] = []

                Object.keys(state).forEach((key) => {
                    const presences = state[key]
                    if (presences && presences.length > 0) {
                        const presence = presences[0] as any
                        users.push({
                            userId: presence.userId,
                            fullName: presence.fullName,
                            email: presence.email,
                            section: presence.section,
                            lastSeen: presence.lastSeen || new Date().toISOString(),
                        })
                    }
                })

                // Filter out current user
                setActiveUsers(users.filter(u => u.userId !== currentUser.userId))
            })
            .on('presence', { event: 'join' }, () => {
                // Silent join - no console log to avoid spam
            })
            .on('presence', { event: 'leave' }, () => {
                // Silent leave - no console log to avoid spam
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Track our presence
                    await channel.track({
                        userId: currentUser.userId,
                        fullName: currentUser.fullName,
                        email: currentUser.email,
                        section: currentSection,
                        lastSeen: new Date().toISOString(),
                    })
                    setIsTracking(true)
                }
            })

        // Cleanup on unmount
        return () => {
            if (channelRef.current) {
                channelRef.current.untrack()
                supabase.removeChannel(channelRef.current)
            }
            setIsTracking(false)
            channelRef.current = null
        }
    }, [catalogueId, currentUser?.userId, enabled])

    // Separate effect for updating section
    useEffect(() => {
        if (!isTracking || !channelRef.current || !currentUser) return

        const updatePresence = async () => {
            try {
                await channelRef.current.track({
                    userId: currentUser.userId,
                    fullName: currentUser.fullName,
                    email: currentUser.email,
                    section: currentSection,
                    lastSeen: new Date().toISOString(),
                })
            } catch (error) {
                // Silently fail - don't break UI
            }
        }

        updatePresence()
    }, [currentSection, isTracking, currentUser?.userId])

    return {
        activeUsers,
        isTracking,
        totalActiveUsers: activeUsers.length,
    }
}
