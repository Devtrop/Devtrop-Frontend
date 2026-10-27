import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function JobFormSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 w-full">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-28 rounded-xl shrink-0" />
      </div>

      {/* Main Form Card */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="border-b border-border bg-muted/40 px-4 sm:px-6 py-4 space-y-1.5">
          <Skeleton className="h-5 w-36 rounded-md" />
          <Skeleton className="h-3.5 w-72 rounded-md" />
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-6 space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-3 w-56 rounded-md" />
            </div>

            <div className="space-y-4">
              {/* Job Title */}
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-20 rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>

              {/* Experience (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-16 rounded-md" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-20 rounded-md" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              </div>

              {/* Salary Range & Status (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-16 rounded-md" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Job Description Section */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-3 w-64 rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-36 w-full rounded-md" />
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Requirements Section */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-72 rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-28 w-full rounded-md" />
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Actions Row */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>
      </div>

      {/* Tip Card */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex gap-3 shadow-xs">
        <Skeleton className="size-8 rounded-lg bg-emerald-500/20 shrink-0" />
        <div className="space-y-1.5 flex-1 pt-1">
          <Skeleton className="h-3 w-full max-w-lg rounded-md bg-emerald-500/20" />
          <Skeleton className="h-3 w-3/4 rounded-md bg-emerald-500/20" />
        </div>
      </div>
    </div>
  )
}
