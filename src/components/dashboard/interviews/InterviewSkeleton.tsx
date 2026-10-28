import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function InterviewSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 rounded-none" />
          <Skeleton className="h-4 w-72 rounded-none" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-none" />
          <Skeleton className="h-9 w-28 rounded-none" />
          <Skeleton className="h-9 w-28 rounded-none" />
        </div>
      </div>

      {/* 2. KPI Stats Skeletons (4 Grid Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-none border border-border bg-card space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-none" />
              <Skeleton className="size-8 rounded-none" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-7 w-16 rounded-none" />
              <Skeleton className="h-3 w-32 rounded-none" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Filters Row Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-none border border-border bg-card/60">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Skeleton className="h-8 w-16 rounded-none" />
          <Skeleton className="h-8 w-24 rounded-none" />
          <Skeleton className="h-8 w-24 rounded-none" />
          <Skeleton className="h-8 w-24 rounded-none" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-44 rounded-none" />
          <Skeleton className="h-8 w-36 rounded-none" />
        </div>
      </div>

      {/* 4. Minimalist 4-Column Table Skeleton (Desktop) */}
      <div className="hidden lg:block rounded-none border border-border bg-card overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <div className="w-full p-3.5 border-b border-border/80 bg-muted/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-[200px] flex-1">
              <Skeleton className="size-4 rounded-none" />
              <Skeleton className="h-4 w-32 rounded-none" />
            </div>
            <Skeleton className="h-4 w-28 rounded-none min-w-[160px] flex-1" />
            <Skeleton className="h-4 w-20 rounded-none min-w-[110px] flex-1" />
            <Skeleton className="h-4 w-28 rounded-none min-w-[150px] flex-1" />
            <Skeleton className="h-4 w-20 mx-auto rounded-none min-w-[120px]" />
          </div>
          <div className="divide-y divide-border/40">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3.5 flex items-center justify-between gap-4">
                {/* 1. Candidate */}
                <div className="flex items-center gap-2.5 min-w-[200px] flex-1">
                  <Skeleton className="size-4 rounded-none shrink-0" />
                  <Skeleton className="size-8 rounded-none shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3.5 w-28 rounded-none" />
                    <Skeleton className="h-3 w-36 rounded-none" />
                  </div>
                </div>

                {/* 2. Stage */}
                <div className="flex items-center min-w-[160px] flex-1">
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>

                {/* 3. Notice */}
                <div className="flex items-center min-w-[110px] flex-1">
                  <Skeleton className="h-4 w-16 rounded-none" />
                </div>

                {/* 4. Schedule */}
                <div className="flex items-center gap-1.5 min-w-[150px] flex-1">
                  <Skeleton className="h-4 w-24 rounded-none" />
                  <Skeleton className="size-5 rounded-none" />
                </div>

                {/* 5. Action */}
                <div className="flex items-center justify-center min-w-[120px]">
                  <Skeleton className="size-6 rounded-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Mobile Card Skeletons (<lg) */}
      <div className="block lg:hidden space-y-3 w-full">
        <div className="flex items-center justify-between px-1">
          <Skeleton className="h-4 w-36 rounded-none" />
          <Skeleton className="h-4 w-16 rounded-none" />
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 w-full">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-3.5 rounded-none border border-border bg-card space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-4 rounded-none" />
                  <Skeleton className="size-8 rounded-none" />
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-28 rounded-none" />
                    <Skeleton className="h-3 w-36 rounded-none" />
                  </div>
                </div>
                <Skeleton className="h-5 w-12 rounded-none" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <Skeleton className="h-5 w-24 rounded-none" />
                <Skeleton className="h-4 w-28 rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
