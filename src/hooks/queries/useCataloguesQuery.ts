import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

interface Catalogue {
  id: string
  name: string
  description: string | null
  quote?: string
  tagline?: string
  year?: string
  isPublic: boolean
  theme: string
  templateId: string
  createdAt: string
  updatedAt: string
  _count: {
    products: number
    categories: number
  }
}

interface CatalogueListResponse {
  catalogues: Catalogue[]
  total: number
  page: number
  pageSize: number
}

interface CatalogueFilters {
  search?: string
  page?: number
  pageSize?: number
}

/**
 * Fetch list of catalogues
 */
async function fetchCatalogues(
  filters?: CatalogueFilters
): Promise<CatalogueListResponse> {
  const params = new URLSearchParams()

  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString())

  const response = await fetch(`/api/catalogues?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch catalogues: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch single catalogue by ID
 */
async function fetchCatalogue(id: string): Promise<Catalogue> {
  const response = await fetch(`/api/catalogues/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch catalogue: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Hook to fetch and cache catalogues list
 */
export function useCataloguesQuery(filters?: CatalogueFilters) {
  return useQuery({
    queryKey: queryKeys.catalogues.list(filters),
    queryFn: () => fetchCatalogues(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes (increased for performance)
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false, // Never refetch on mount if cached
  })
}

/**
 * Hook to fetch and cache a single catalogue
 */
export function useCatalogueQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.catalogues.detail(id),
    queryFn: () => fetchCatalogue(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!id, // Only run if id is provided
  })
}

/**
 * Hook to create a new catalogue with optimistic updates
 */
export function useCreateCatalogueMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/catalogues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create catalogue')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate catalogues list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.catalogues.all })
      // Invalidate subscription to update usage
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription })
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })
    },
  })
}

/**
 * Hook to delete a catalogue
 */
export function useDeleteCatalogueMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/catalogues/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete catalogue')
      }

      return response.json()
    },
    onMutate: async deletedId => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.catalogues.all })

      // Snapshot previous values
      const previousCatalogues =
        queryClient.getQueryData<CatalogueListResponse>(
          queryKeys.catalogues.list()
        )

      // Optimistically remove from cache
      if (previousCatalogues) {
        queryClient.setQueryData<CatalogueListResponse>(
          queryKeys.catalogues.list(),
          {
            ...previousCatalogues,
            catalogues: previousCatalogues.catalogues.filter(
              c => c.id !== deletedId
            ),
            total: previousCatalogues.total - 1,
          }
        )
      }

      return { previousCatalogues }
    },
    onError: (err, deletedId, context) => {
      // Rollback on error
      if (context?.previousCatalogues) {
        queryClient.setQueryData(
          queryKeys.catalogues.list(),
          context.previousCatalogues
        )
      }
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.catalogues.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })
    },
  })
}

/**
 * Hook to update a catalogue
 */
export function useUpdateCatalogueMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<Catalogue>
    }) => {
      const response = await fetch(`/api/catalogues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update catalogue')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate specific catalogue
      queryClient.invalidateQueries({
        queryKey: queryKeys.catalogues.detail(variables.id),
      })
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: queryKeys.catalogues.all })
    },
  })
}
