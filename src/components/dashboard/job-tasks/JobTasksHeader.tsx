'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ListTodo, RefreshCw } from 'lucide-react'

interface JobTasksHeaderProps {
  onCreateTask: () => void
  onRefresh: () => void
  loading?: boolean
}

export function JobTasksHeader({ onCreateTask, onRefresh, loading = false }: JobTasksHeaderProps) {
  return (
    <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between w-full">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Job Tasks Management
        </h1>
        <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground max-w-2xl">
          Create, review, and manage task assignments for active recruitment roles.
        </p>
      </div>

      <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 gap-1.5 border-border hover:bg-muted text-xs px-3 rounded-xl"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onCreateTask}
          className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs px-3 rounded-xl"
        >
          <ListTodo className="size-3.5" />
          New Task
        </Button>
      </div>
    </div>
  )
}
