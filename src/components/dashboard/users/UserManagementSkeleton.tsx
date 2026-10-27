import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function UserManagementSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-52 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Filters Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card/60">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="size-9 rounded-xl" />
        </div>
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <div className="w-full p-3.5 border-b border-border/80 bg-muted/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-[220px] flex-1">
              <Skeleton className="size-4 rounded-md" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
            <Skeleton className="h-4 w-24 rounded-md min-w-[130px]" />
            <Skeleton className="h-4 w-20 rounded-md min-w-[110px]" />
            <Skeleton className="h-4 w-28 rounded-md min-w-[130px]" />
            <Skeleton className="h-4 w-12 rounded-md min-w-[60px]" />
          </div>

          <div className="divide-y divide-border/60">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="w-full p-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-[220px] flex-1">
                  <Skeleton className="size-4 rounded-md shrink-0" />
                  <Skeleton className="size-9 rounded-full shrink-0" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-44 rounded-md" />
                  </div>
                </div>

                <div className="min-w-[130px]">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>

                <div className="min-w-[110px]">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>

                <div className="min-w-[130px]">
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>

                <div className="min-w-[60px] flex justify-end">
                  <Skeleton className="size-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Cards Skeleton */}
      <div className="md:hidden space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-9 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-3 w-36 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
