import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function CandidateTaskSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-in fade-in-50 duration-200">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Back link & Header */}
        <div className="space-y-3">
          <Skeleton className="h-7 w-20 rounded-md" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-52 rounded-xl" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
        </div>

        {/* Task Info Card */}
        <div className="rounded-2xl border border-border/80 bg-card/60 p-6 space-y-4 shadow-xs">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-5 w-48 rounded-md" />
          </div>
          <div className="pt-3 border-t border-border/60 space-y-2">
            <Skeleton className="h-3 w-28 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
          </div>
          <div className="pt-3 border-t border-border/60 space-y-1.5">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-4 w-36 rounded-md" />
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border/80 bg-card/60 p-6 space-y-4 shadow-xs">
          <Skeleton className="h-5 w-32 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-40 rounded-md" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-36 rounded-md" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
