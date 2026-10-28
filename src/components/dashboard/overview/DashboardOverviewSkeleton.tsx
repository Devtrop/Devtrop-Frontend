import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in-50 duration-200">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-none border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-none shrink-0" />
              <Skeleton className="h-7 w-56 rounded-none" />
            </div>
            <Skeleton className="h-4 w-full max-w-xl rounded-none" />
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Skeleton className="h-9 w-32 rounded-none" />
            <Skeleton className="h-9 w-32 rounded-none" />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-none border border-border/80 bg-card/60 p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-none" />
              <Skeleton className="size-9 rounded-none" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-7 w-16 rounded-none" />
              <Skeleton className="h-3 w-32 rounded-none" />
            </div>
          </div>
        ))}
      </div>

      {/* Large Grid Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-none border border-border/80 bg-card/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36 rounded-none" />
            <Skeleton className="h-4 w-20 rounded-none" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3.5 rounded-none border border-border/60 bg-muted/20 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="size-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-44 rounded-none" />
                    <Skeleton className="h-3 w-28 rounded-none" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-none border border-border/80 bg-card/60 p-6 space-y-4">
          <Skeleton className="h-5 w-32 rounded-none" />
          <div className="space-y-2.5 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 rounded-none border border-border/60 bg-muted/20 space-y-2">
                <Skeleton className="h-4 w-28 rounded-none" />
                <Skeleton className="h-3 w-full rounded-none" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
