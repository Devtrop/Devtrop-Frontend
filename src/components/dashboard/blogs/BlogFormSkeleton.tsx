import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function BlogFormSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-200 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-32 rounded-none" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-52 rounded-none" />
            <Skeleton className="h-4 w-80 rounded-none" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-none" />
            <Skeleton className="h-9 w-28 rounded-none" />
          </div>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Post Details & Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card 1: Post Details */}
          <div className="rounded-none border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-28 rounded-none" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-16 rounded-none" />
              <Skeleton className="h-10 w-full rounded-none" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-16 rounded-none" />
              <Skeleton className="h-20 w-full rounded-none" />
            </div>
          </div>

          {/* Card 2: Content Editor */}
          <div className="rounded-none border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-24 rounded-none" />
            <div className="min-h-[400px] rounded-none border border-input bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <Skeleton className="size-7 rounded-none" />
                <Skeleton className="size-7 rounded-none" />
                <Skeleton className="size-7 rounded-none" />
                <Skeleton className="size-7 rounded-none" />
                <div className="h-4 w-px bg-border mx-1" />
                <Skeleton className="size-7 rounded-none" />
                <Skeleton className="size-7 rounded-none" />
              </div>
              <Skeleton className="h-4 w-3/4 rounded-none" />
              <Skeleton className="h-4 w-full rounded-none" />
              <Skeleton className="h-4 w-5/6 rounded-none" />
              <Skeleton className="h-4 w-2/3 rounded-none" />
            </div>
          </div>
        </div>

        {/* Right Column: Featured Image, Publish Settings, Tags */}
        <div className="space-y-6">
          {/* Card 1: Featured Image */}
          <div className="rounded-none border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-32 rounded-none" />
            <Skeleton className="aspect-video w-full rounded-none border-2 border-dashed border-border/80" />
          </div>

          {/* Card 2: Publish Settings */}
          <div className="rounded-none border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-36 rounded-none" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-16 rounded-none" />
              <Skeleton className="h-10 w-full rounded-none" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-20 rounded-none" />
              <Skeleton className="h-10 w-full rounded-none" />
            </div>
          </div>

          {/* Card 3: Tags */}
          <div className="rounded-none border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-16 rounded-none" />
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Skeleton className="h-7 w-16 rounded-none" />
              <Skeleton className="h-7 w-20 rounded-none" />
              <Skeleton className="h-7 w-14 rounded-none" />
              <Skeleton className="h-7 w-18 rounded-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
