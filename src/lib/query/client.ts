import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'

/**
 * Configure React Query with sensible defaults for caching and retry behavior
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 5 minutes
        staleTime: 5 * 60 * 1000,

        // Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,

        // Don't refetch when window regains focus (can be enabled per-query)
        refetchOnWindowFocus: false,

        // Refetch when internet connection is restored
        refetchOnReconnect: true,

        // Retry failed requests, but not for 4xx errors
        retry: (failureCount, error) => {
          // Don't retry on client errors (4xx)
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            return false
          }
          // Retry up to 2 times for network errors or 5xx errors
          return failureCount < 2
        },

        // Exponential backoff for retries: 1s, 2s, 4s...
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },

      mutations: {
        // Don't retry mutations automatically (mutations should be idempotent if retried)
        retry: false,
      },
    },
  })
}
