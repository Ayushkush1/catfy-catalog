import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

interface Catalogue {
  id: string
  name: string
  description: string | null
  quote?: string
  tagline?: string
  isPublic: boolean
  theme: string
  createdAt: string
  updatedAt: string
  _count: {
    products: number
    categories: number
  }
}

interface CataloguesResponse {
  catalogues: Catalogue[]
  total: number
}

interface CatalogueDetailResponse {
  catalogue: Catalogue & {
    products?: any[]
    categories?: any[]
    team?: any[]
  }
}

async function fetchCatalogues(filters?: {
  search?: string
  sort?: string
}): Promise<CataloguesResponse> {
  const params = new URLSearchParams()
  if (filters?.search) params.append('search', filters.search)
  if (filters?.sort) params.append('sort', filters.sort)

  const response = await fetch(`/api/catalogues?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch catalogues: ${response.status}`)
  }

  return response.json()
}

async function fetchCatalogue(id: string): Promise<CatalogueDetailResponse> {
  const response = await fetch(`/api/catalogues/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch catalogue: ${response.status}`)
  }

  return response.json()
}

async function createCatalogue(data: any): Promise<CatalogueDetailResponse> {
  const response = await fetch('/api/catalogues', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create catalogue')
  }

  return response.json()
}

async function deleteCatalogue(id: string): Promise<void> {
  const response = await fetch(`/api/catalogues/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete catalogue: ${response.status}`)
  }
}

/**
 * Hook to fetch and cache catalogues list
 * - Supports search and sort filters
 * - Caches for 3 minutes
 */
export function useCataloguesQuery(filters?: {
  search?: string
  sort?: string
}) {
  return useQuery({
    queryKey: queryKeys.catalogues.list(filters),
    queryFn: () => fetchCatalogues(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch a single catalogue with details
 * - Caches for 5 minutes
 * - Includes products, categories, and team data
 */
export function useCatalogueQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.catalogues.detail(id),
    queryFn: () => fetchCatalogue(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    enabled: !!id,
  })
}

/**
 * Hook to create a new catalogue
 * - Optimistically updates the catalogue list
 * - Invalidates subscription to refresh usage
 */
export function useCreateCatalogueMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCatalogue,
    onSuccess: () => {
      // Invalidate catalogues list to show new catalogue
      queryClient.invalidateQueries({ queryKey: queryKeys.catalogues.lists() })
      // Invalidate subscription to update usage count
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscription.current(),
      })
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
    },
  })
}

/**
 * Hook to delete a catalogue
 * - Removes from cache immediately
 * - Invalidates related queries
 */
export function useDeleteCatalogueMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCatalogue,
    onMutate: async catalogueId => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.catalogues.lists(),
      })

      // Snapshot previous value
      const previousCatalogues = queryClient.getQueryData<CataloguesResponse>(
        queryKeys.catalogues.list()
      )

      // Optimistically remove from cache
      if (previousCatalogues) {
        queryClient.setQueryData<CataloguesResponse>(
          queryKeys.catalogues.list(),
          {
            ...previousCatalogues,
            catalogues: previousCatalogues.catalogues.filter(
              c => c.id !== catalogueId
            ),
            total: previousCatalogues.total - 1,
          }
        )
      }

      return { previousCatalogues }
    },
    onError: (err, catalogueId, context) => {
      // Rollback on error
      if (context?.previousCatalogues) {
        queryClient.setQueryData(
          queryKeys.catalogues.list(),
          context.previousCatalogues
        )
      }
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: queryKeys.catalogues.lists() })
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscription.current(),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
    },
  })
}
