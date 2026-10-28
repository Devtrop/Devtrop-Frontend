import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function SupportSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl w-full animate-in fade-in-50 duration-200">
      {/* Header Skeleton */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-none" />
          <Skeleton className="h-7 w-52 rounded-none" />
        </div>
        <Skeleton className="h-4 w-96 rounded-none" />
      </div>

      {/* 2 Quick Help Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-none border border-border/80 bg-card/60 p-6 space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-none" />
                <Skeleton className="h-4 w-36 rounded-none" />
              </div>
              <Skeleton className="h-3 w-56 rounded-none" />
            </div>
            <Skeleton className="h-9 w-full rounded-none" />
          </div>
        ))}
      </div>

      {/* FAQs Accordion Card Skeleton */}
      <div className="rounded-none border border-border/80 bg-card/60 p-6 space-y-5">
        <Skeleton className="h-5 w-48 rounded-none" />
        <div className="divide-y divide-border/60">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="py-4 flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-72 rounded-none" />
              <Skeleton className="size-4 rounded-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
