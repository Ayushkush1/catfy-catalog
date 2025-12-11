import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

interface Template {
  id: string
  name: string
  description: string
  category: string
  isPremium: boolean
  version: string
  previewImage: string | null
  features: string[]
  tags: string[]
  pageCount: number
  supportedFields: {
    products: string[]
    categories: string[]
    profile: string[]
  }
  compatibleThemes: string[]
  requiredThemeFeatures: string[]
  customProperties: any
  createdAt: string
  updatedAt: string
}

/**
 * Hook to fetch and cache templates
 */
export function useTemplatesQuery() {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: async () => {
      const response = await fetch('/api/templates')
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()
      return data.templates as Template[]
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}
