import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl w-full animate-in fade-in-50 duration-200">
      {/* Header Skeleton */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-none" />
          <Skeleton className="h-7 w-48 rounded-none" />
        </div>
        <Skeleton className="h-4 w-96 rounded-none" />
      </div>

      {/* Tabs List (5 Tabs: Profile, Avatar, Password, Email, Notifications) */}
      <div className="flex items-center gap-1 p-1 rounded-none border border-border/60 bg-muted/40 w-fit flex-wrap">
        <Skeleton className="h-7 w-20 rounded-none" />
        <Skeleton className="h-7 w-20 rounded-none" />
        <Skeleton className="h-7 w-22 rounded-none" />
        <Skeleton className="h-7 w-18 rounded-none" />
        <Skeleton className="h-7 w-28 rounded-none" />
      </div>

      {/* Active Tab Content Card (Profile Information) */}
      <div className="rounded-none border border-border/80 bg-card/60 overflow-hidden">
        <div className="p-6 border-b border-border/40 space-y-1.5">
          <Skeleton className="h-5 w-36 rounded-none" />
          <Skeleton className="h-3.5 w-64 rounded-none" />
        </div>

        <div className="p-6 space-y-4 max-w-lg">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-16 rounded-none" />
            <Skeleton className="h-9 w-full rounded-none" />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24 rounded-none" />
            <Skeleton className="h-9 w-full rounded-none" />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3.5 w-24 rounded-none" />
            <Skeleton className="h-9 w-full rounded-none" />
          </div>

          {/* Assigned Role */}
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3.5 w-20 rounded-none" />
            <Skeleton className="h-7 w-28 rounded-none" />
          </div>

          {/* Save Profile Button */}
          <div className="pt-2">
            <Skeleton className="h-9 w-28 rounded-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
