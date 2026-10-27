import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in-50 duration-200">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-xl shrink-0" />
              <Skeleton className="h-7 w-56 rounded-xl" />
            </div>
            <Skeleton className="h-4 w-full max-w-xl rounded-md" />
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="size-9 rounded-xl" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Large Grid Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card/60 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="size-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-44 rounded-md" />
                    <Skeleton className="h-3 w-28 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/60 p-6 space-y-4 shadow-xs">
          <Skeleton className="h-5 w-32 rounded-md" />
          <div className="space-y-2.5 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
