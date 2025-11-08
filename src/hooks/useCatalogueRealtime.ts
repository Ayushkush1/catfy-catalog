'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface RealtimeUpdate {
    type: 'catalogue' | 'category' | 'product'
    action: 'INSERT' | 'UPDATE' | 'DELETE'
    record: any
    old?: any
}

interface UseCatalogueRealtimeOptions {
    catalogueId: string
    onUpdate?: (update: RealtimeUpdate) => void
    enabled?: boolean
}

export function useCatalogueRealtime({
    catalogueId,
    onUpdate,
    enabled = true,
}: UseCatalogueRealtimeOptions) {
    const { toast } = useToast()
    const [lastUpdate, setLastUpdate] = useState<RealtimeUpdate | null>(null)

    // Memoize the update handler to prevent recreating on every render
    const handleUpdate = useCallback((update: RealtimeUpdate) => {
        setLastUpdate(update)
        onUpdate?.(update)
    }, [onUpdate])

    useEffect(() => {
        if (!enabled || !catalogueId) {
            return
        }

        const supabase = createClient()

        // Subscribe to catalogue changes
        const catalogueChannel = supabase
            .channel(`catalogue:${catalogueId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'catalogues',
                    filter: `id=eq.${catalogueId}`,
                },
                (payload) => {
                    const update: RealtimeUpdate = {
                        type: 'catalogue',
                        action: payload.eventType as any,
                        record: payload.new,
                        old: payload.old,
                    }

                    handleUpdate(update)

                    if (payload.eventType === 'UPDATE') {
                        toast({
                            title: 'Catalogue Updated',
                            description: 'This catalogue has been modified by another user. Click to reload.',
                            duration: 10000,
                        })
                    }
                }
            )
            .subscribe()

        // Subscribe to category changes
        const categoryChannel = supabase
            .channel(`categories:${catalogueId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'categories',
                    filter: `catalogueId=eq.${catalogueId}`,
                },
                (payload) => {
                    const update: RealtimeUpdate = {
                        type: 'category',
                        action: payload.eventType as any,
                        record: payload.new,
                        old: payload.old,
                    }

                    handleUpdate(update)

                    const eventMessages = {
                        INSERT: 'A category has been added',
                        UPDATE: 'A category has been updated',
                        DELETE: 'A category has been deleted',
                    }

                    toast({
                        title: 'Category Changed',
                        description: (eventMessages[payload.eventType] || 'Category changed by another user.') + ' Click to reload.',
                        duration: 10000,
                    })
                }
            )
            .subscribe()

        // Subscribe to product changes
        const productChannel = supabase
            .channel(`products:${catalogueId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'products',
                    filter: `catalogueId=eq.${catalogueId}`,
                },
                (payload) => {
                    const update: RealtimeUpdate = {
                        type: 'product',
                        action: payload.eventType as any,
                        record: payload.new,
                        old: payload.old,
                    }

                    handleUpdate(update)

                    const eventMessages = {
                        INSERT: 'A product has been added',
                        UPDATE: 'A product has been updated',
                        DELETE: 'A product has been deleted',
                    }

                    toast({
                        title: 'Product Changed',
                        description: (eventMessages[payload.eventType] || 'Product changed by another user.') + ' Click to reload.',
                        duration: 10000,
                    })
                }
            )
            .subscribe()

        // Cleanup subscriptions on unmount
        return () => {
            supabase.removeChannel(catalogueChannel)
            supabase.removeChannel(categoryChannel)
            supabase.removeChannel(productChannel)
        }
    }, [catalogueId, enabled, handleUpdate, toast])

    return {
        lastUpdate,
    }
}
