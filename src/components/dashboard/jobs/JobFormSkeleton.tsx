import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function JobFormSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 w-full">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 rounded-none" />
          <Skeleton className="h-4 w-80 rounded-none" />
        </div>
        <Skeleton className="h-8 w-28 rounded-none shrink-0" />
      </div>

      {/* Main Form Card */}
      <div className="rounded-none border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/40 px-4 sm:px-6 py-4 space-y-1.5">
          <Skeleton className="h-5 w-36 rounded-none" />
          <Skeleton className="h-3.5 w-72 rounded-none" />
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-6 space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32 rounded-none" />
              <Skeleton className="h-3 w-56 rounded-none" />
            </div>

            <div className="space-y-4">
              {/* Job Title */}
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-20 rounded-none" />
                <Skeleton className="h-9 w-full rounded-none" />
              </div>

              {/* Experience (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-16 rounded-none" />
                  <Skeleton className="h-9 w-full rounded-none" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-20 rounded-none" />
                  <Skeleton className="h-9 w-full rounded-none" />
                </div>
              </div>

              {/* Salary Range & Status (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-24 rounded-none" />
                  <Skeleton className="h-9 w-full rounded-none" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-16 rounded-none" />
                  <Skeleton className="h-9 w-full rounded-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Job Description Section */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32 rounded-none" />
              <Skeleton className="h-3 w-64 rounded-none" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24 rounded-none" />
              <Skeleton className="h-36 w-full rounded-none" />
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Requirements Section */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-28 rounded-none" />
              <Skeleton className="h-3 w-72 rounded-none" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24 rounded-none" />
              <Skeleton className="h-28 w-full rounded-none" />
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Actions Row */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
            <Skeleton className="h-9 w-20 rounded-none" />
            <Skeleton className="h-9 w-28 rounded-none" />
          </div>
        </div>
      </div>

      {/* Tip Card */}
      <div className="rounded-none border border-accent bg-accent-soft p-4 flex gap-3">
        <Skeleton className="size-8 rounded-none bg-accent-soft shrink-0" />
        <div className="space-y-1.5 flex-1 pt-1">
          <Skeleton className="h-3 w-full max-w-lg rounded-none bg-accent-soft" />
          <Skeleton className="h-3 w-3/4 rounded-none bg-accent-soft" />
        </div>
      </div>
    </div>
  )
}
