'use client'

import React, { useState } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { makeQueryClient } from '@/lib/query/client'

interface Props {
  children: React.ReactNode
}

/**
 * React Query provider for the entire application
 * Wraps the app to enable query caching, automatic refetching, and request deduplication
 */
export function QueryProvider({ children }: Props) {
  const [queryClient] = useState(() => makeQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only show in development (localhost) */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
