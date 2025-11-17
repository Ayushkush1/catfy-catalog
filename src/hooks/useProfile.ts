import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ProfileShape {
    id?: string
    fullName?: string
    companyName?: string
    phone?: string
    website?: string
    address?: string
    city?: string
    country?: string
    state?: string
    postalCode?: string
    timezone?: string
    avatarUrl?: string
    accountType?: 'INDIVIDUAL' | 'BUSINESS'
    email?: string
}

export function useProfile() {
    const [profile, setProfile] = useState<ProfileShape | null>(null)
    const [userData, setUserData] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const fetchProfile = useCallback(async () => {
        setLoading(true)
        const CACHE_KEY = 'catfy:profile'
        const CACHE_TTL = 1000 * 60 * 5 // 5 minutes

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) {
                // not authenticated - route to login on caller decision
                router.push('/auth/login')
                return
            }

            // Try session cache first (stale-while-revalidate)
            try {
                const raw = sessionStorage.getItem(CACHE_KEY)
                if (raw) {
                    const parsed = JSON.parse(raw)
                    if (parsed?._ts && Date.now() - parsed._ts < CACHE_TTL) {
                        setProfile(parsed.profile)
                        setUserData(parsed.user)
                        setLoading(false)
                            // revalidate in background
                            ; (async () => {
                                try {
                                    const response = await fetch('/api/auth/profile')
                                    if (response.ok) {
                                        const data = await response.json()
                                        setProfile(data.profile || null)
                                        setUserData(data.user || null)
                                        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ _ts: Date.now(), profile: data.profile || null, user: data.user || null })) } catch (e) { }
                                    }
                                } catch (e) { }
                            })()
                        return
                    }
                }
            } catch (e) {
                // ignore cache errors
            }

            const response = await fetch('/api/auth/profile')
            if (!response.ok) {
                throw new Error('Failed to fetch profile')
            }

            const data = await response.json()
            setProfile(data.profile || null)
            setUserData(data.user || null)
            try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ _ts: Date.now(), profile: data.profile || null, user: data.user || null })) } catch (e) { }
        } catch (err) {
            console.error('useProfile fetch error', err)
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }, [supabase, router])

    const updateProfile = useCallback(async (updateBody: Partial<ProfileShape>) => {
        setSaving(true)
        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateBody),
            })

            if (!response.ok) throw new Error('Failed to update profile')

            toast.success('Profile updated')
            await fetchProfile()
            return true
        } catch (err) {
            console.error('useProfile update error', err)
            toast.error('Failed to update profile')
            return false
        } finally {
            setSaving(false)
        }
    }, [fetchProfile])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    return { profile, userData, loading, saving, fetchProfile, updateProfile }
}
