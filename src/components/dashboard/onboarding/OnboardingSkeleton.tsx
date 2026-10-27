import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function OnboardingSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-56 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* 2. Filters Row Skeleton */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card/60">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          <Skeleton className="h-8 w-16 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-44 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
          <Skeleton className="size-9 rounded-xl" />
        </div>
      </div>

      {/* 3. Desktop Table Skeleton */}
      <div className="hidden md:block rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <div className="w-full p-3.5 border-b border-border/80 bg-muted/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-[200px] flex-1">
              <Skeleton className="size-4 rounded-md" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
            <Skeleton className="h-4 w-28 rounded-md min-w-[140px]" />
            <Skeleton className="h-4 w-28 rounded-md min-w-[140px]" />
            <Skeleton className="h-4 w-24 rounded-md min-w-[120px]" />
            <Skeleton className="h-4 w-28 rounded-md min-w-[130px]" />
            <Skeleton className="h-4 w-12 rounded-md min-w-[80px]" />
          </div>

          <div className="divide-y divide-border/60">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-full p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-[200px] flex-1">
                  <Skeleton className="size-4 rounded-md shrink-0" />
                  <Skeleton className="size-9 rounded-full shrink-0" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-36 rounded-md" />
                    <Skeleton className="h-3 w-48 rounded-md" />
                  </div>
                </div>

                <div className="min-w-[140px] space-y-1">
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                  <Skeleton className="h-2.5 w-16 rounded-md" />
                </div>

                <div className="min-w-[140px]">
                  <Skeleton className="h-7 w-32 rounded-lg" />
                </div>

                <div className="min-w-[120px]">
                  <Skeleton className="h-6 w-24 rounded-lg" />
                </div>

                <div className="min-w-[130px] space-y-1">
                  <Skeleton className="h-3.5 w-20 rounded-md" />
                  <Skeleton className="h-2.5 w-16 rounded-md" />
                </div>

                <div className="min-w-[80px] flex justify-end">
                  <Skeleton className="size-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Mobile Card Skeleton (< md) */}
      <div className="md:hidden space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-9 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-40 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <Skeleton className="h-3.5 w-28 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
