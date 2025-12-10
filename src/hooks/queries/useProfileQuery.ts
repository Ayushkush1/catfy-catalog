import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

interface UserProfile {
    id: string
    fullName: string
    email: string
    avatarUrl?: string
    subscriptionPlan?: string
    companyName?: string
    companyDescription?: string
    phone?: string
    website?: string
    address?: string
    city?: string
    state?: string
    country?: string
    logoUrl?: string
    coverImageUrl?: string
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    subscription?: {
        plan: 'FREE' | 'MONTHLY' | 'YEARLY'
        status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE'
    } | null
}

interface ProfileResponse {
    success: boolean
    profile: UserProfile
    user: {
        id: string
        email: string
    }
}

async function fetchProfile(): Promise<ProfileResponse> {
    const response = await fetch('/api/auth/profile')

    if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`)
    }

    return response.json()
}

async function updateProfile(
    data: Partial<UserProfile>
): Promise<ProfileResponse> {
    const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.status}`)
    }

    return response.json()
}

/**
 * Hook to fetch and cache user profile data
 * - Caches for 5 minutes
 * - Refetches on window focus
 * - Shows stale data immediately while revalidating
 */
export function useProfileQuery() {
    return useQuery({
        queryKey: queryKeys.profile.detail(),
        queryFn: fetchProfile,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: true,
    })
}

/**
 * Hook to update user profile
 * - Optimistically updates the cache
 * - Rolls back on error
 */
export function useUpdateProfileMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateProfile,
        onMutate: async newProfile => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: queryKeys.profile.detail() })

            // Snapshot previous value
            const previousProfile = queryClient.getQueryData<ProfileResponse>(
                queryKeys.profile.detail()
            )

            // Optimistically update
            if (previousProfile) {
                queryClient.setQueryData<ProfileResponse>(queryKeys.profile.detail(), {
                    ...previousProfile,
                    profile: {
                        ...previousProfile.profile,
                        ...newProfile,
                    },
                })
            }

            return { previousProfile }
        },
        onError: (err, newProfile, context) => {
            // Rollback on error
            if (context?.previousProfile) {
                queryClient.setQueryData(
                    queryKeys.profile.detail(),
                    context.previousProfile
                )
            }
        },
        onSettled: () => {
            // Refetch to ensure sync
            queryClient.invalidateQueries({ queryKey: queryKeys.profile.detail() })
        },
    })
}
