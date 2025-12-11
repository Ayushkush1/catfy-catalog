import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

interface UserProfile {
  id: string
  fullName: string
  email: string
  companyName?: string
  companyDescription?: string
  phone?: string
  website?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  accountType?: 'INDIVIDUAL' | 'BUSINESS'
  logoUrl?: string
  coverImageUrl?: string
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  subscriptionPlan: 'free' | 'monthly' | 'yearly'
  subscriptionStatus: 'active' | 'inactive' | 'cancelled'
}

interface ProfileResponse {
  profile: UserProfile | null
  user: {
    id: string
    email: string
  }
}

/**
 * Fetch user profile from API
 */
async function fetchProfile(): Promise<ProfileResponse> {
  const response = await fetch('/api/auth/profile')

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Hook to fetch and cache user profile
 * Returns cached data immediately and revalidates in background
 */
export function useProfileQuery() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchProfile,
    staleTime: 10 * 60 * 1000, // 10 minutes (increased for performance)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnMount: false, // Never refetch on mount if cached
  })
}

/**
 * Hook to update user profile with optimistic updates
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      return response.json()
    },
    onMutate: async newData => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.profile })

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<ProfileResponse>(
        queryKeys.profile
      )

      // Optimistically update
      if (previousProfile) {
        queryClient.setQueryData<ProfileResponse>(queryKeys.profile, {
          ...previousProfile,
          profile: previousProfile.profile
            ? { ...previousProfile.profile, ...newData }
            : null,
        })
      }

      return { previousProfile }
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(queryKeys.profile, context.previousProfile)
      }
    },
    onSuccess: () => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.profile })
    },
  })
}
