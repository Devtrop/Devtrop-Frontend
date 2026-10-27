import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function RolesSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Roles Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-4 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="h-3 w-48 rounded-md" />
                <Skeleton className="h-3 w-36 rounded-md" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
              <Skeleton className="h-8 w-32 rounded-lg" />
              <div className="flex items-center gap-1.5">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="size-8 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
