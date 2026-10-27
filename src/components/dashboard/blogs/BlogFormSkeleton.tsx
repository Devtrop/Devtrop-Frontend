import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function BlogFormSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-200 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-52 rounded-xl" />
            <Skeleton className="h-4 w-80 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Post Details & Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card 1: Post Details */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
            <Skeleton className="h-5 w-28 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-16 rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-16 rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
          </div>

          {/* Card 2: Content Editor */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
            <Skeleton className="h-5 w-24 rounded-md" />
            <div className="min-h-[400px] rounded-md border border-input bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="size-7 rounded-md" />
                <div className="h-4 w-px bg-border mx-1" />
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="size-7 rounded-md" />
              </div>
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-5/6 rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
            </div>
          </div>
        </div>

        {/* Right Column: Featured Image, Publish Settings, Tags */}
        <div className="space-y-6">
          {/* Card 1: Featured Image */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="aspect-video w-full rounded-lg border-2 border-dashed border-border/80" />
          </div>

          {/* Card 2: Publish Settings */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
            <Skeleton className="h-5 w-36 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-16 rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-20 rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* Card 3: Tags */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
            <Skeleton className="h-5 w-16 rounded-md" />
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-md" />
              <Skeleton className="h-7 w-14 rounded-md" />
              <Skeleton className="h-7 w-18 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
