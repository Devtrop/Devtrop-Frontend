import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function NotificationsSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl w-full animate-in fade-in-50 duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-lg" />
            <Skeleton className="h-7 w-64 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      {/* Notifications List Skeleton */}
      <div className="rounded-xl border border-border/80 bg-card/60 shadow-xs divide-y divide-border/60 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 flex items-start gap-3.5">
            <Skeleton className="size-9 rounded-xl shrink-0" />
            <div className="flex flex-col flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-44 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
              <Skeleton className="h-3 w-full max-w-md rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
