'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { experimental_createQueryPersister } from '@tanstack/query-persist-client-core'
import type {
  PersistedClient,
  Persister,
} from '@tanstack/react-query-persist-client'
import { ThemeProvider } from 'next-themes'
import { useState, useEffect } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/auth-provider'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'

export function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache data for 10 minutes before considering it stale (increased for better performance)
            staleTime: 10 * 60 * 1000,
            // Keep unused data in cache for 30 minutes
            gcTime: 30 * 60 * 1000,
            // Only refetch on window focus if data is stale
            refetchOnWindowFocus: false,
            // Refetch when reconnecting
            refetchOnReconnect: true,
            // Never refetch on mount if we have cached data
            refetchOnMount: false,
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
                return false
              }
              return failureCount < 3
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  )

  // Create persister only on client side
  const [persister] = useState<Persister | undefined>(() => {
    if (!isClient) return undefined

    // Simple localStorage persister
    return {
      persistClient: async (client: PersistedClient) => {
        try {
          window.localStorage.setItem('CATFY_CACHE', JSON.stringify(client))
        } catch (error) {
          console.error('Failed to persist cache:', error)
        }
      },
      restoreClient: async () => {
        try {
          const cached = window.localStorage.getItem('CATFY_CACHE')
          if (cached) {
            return JSON.parse(cached) as PersistedClient
          }
        } catch (error) {
          console.error('Failed to restore cache:', error)
        }
        return undefined
      },
      removeClient: async () => {
        try {
          window.localStorage.removeItem('CATFY_CACHE')
        } catch (error) {
          console.error('Failed to remove cache:', error)
        }
      },
    }
  })

  // Use PersistQueryClientProvider only on client side with persister
  if (isClient && persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          buster: '', // Add version to bust cache on deploy if needed
          dehydrateOptions: {
            shouldDehydrateQuery: query => {
              // Only persist queries that have data and are successful
              return (
                query.state.status === 'success' &&
                query.state.data !== undefined
              )
            },
          },
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <SubscriptionProvider>
              {children}
              <Toaster />
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-right"
          />
        )}
      </PersistQueryClientProvider>
    )
  }

  // Fallback for SSR or when persister is not ready
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <AuthProvider>
          <SubscriptionProvider>
            {children}
            <Toaster />
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}
