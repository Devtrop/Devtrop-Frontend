import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export interface BlogTaxonomySkeletonProps {
  statCardsCount?: number
}

export function BlogTaxonomySkeleton({ statCardsCount = 3 }: BlogTaxonomySkeletonProps) {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 rounded-none" />
          <Skeleton className="h-4 w-72 rounded-none" />
        </div>
        <Skeleton className="h-9 w-36 rounded-none" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        {Array.from({ length: statCardsCount }).map((_, i) => (
          <div
            key={i}
            className="rounded-none border border-border bg-card p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3"
          >
            <Skeleton className="size-8 sm:size-10 rounded-none shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-3 w-20 sm:w-24 rounded-none" />
              <Skeleton className="h-5 sm:h-6 w-10 sm:w-12 rounded-none" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden lg:block rounded-none border border-border bg-card overflow-hidden w-full">
        <div className="overflow-x-auto">
          <div className="w-full min-w-[700px]">
            <div className="w-full p-3.5 border-b border-border/80 bg-muted/40 flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-10 rounded-none" />
              <Skeleton className="h-4 w-28 rounded-none min-w-[140px]" />
              <Skeleton className="h-4 w-24 rounded-none min-w-[120px]" />
              <Skeleton className="h-4 w-40 rounded-none min-w-[200px] flex-1" />
              <Skeleton className="h-4 w-16 rounded-none min-w-[80px]" />
              <Skeleton className="h-4 w-16 rounded-none min-w-[80px]" />
            </div>

            <div className="divide-y divide-border/60">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-full p-4 flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-6 rounded-none" />
                  <Skeleton className="h-4 w-28 rounded-none min-w-[140px]" />
                  <Skeleton className="h-4 w-24 rounded-none min-w-[120px]" />
                  <Skeleton className="h-3.5 w-48 rounded-none min-w-[200px] flex-1" />
                  <Skeleton className="h-5 w-16 rounded-full min-w-[80px]" />
                  <div className="min-w-[80px] flex justify-end gap-1.5">
                    <Skeleton className="size-7 rounded-none" />
                    <Skeleton className="size-7 rounded-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cards Skeleton */}
      <div className="lg:hidden space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`taxonomy-card-skel-${i}`}
            className="p-4 rounded-none border border-border bg-card space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-36 rounded-none" />
                <Skeleton className="h-3 w-20 rounded-none" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Skeleton className="h-8 flex-1 rounded-none" />
              <Skeleton className="h-8 w-16 rounded-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
