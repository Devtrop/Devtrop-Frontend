'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export function TaskSubmissionsHeader({
  onRefresh,
  loading,
}: {
  onRefresh: () => void
  loading: boolean
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 w-full">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Task Submissions
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl">
          Review and manage candidate job task submissions.
        </p>
      </div>

      <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="gap-1.5 border-border hover:bg-muted text-xs h-8 px-3 rounded-xl"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </div>
  )
}
