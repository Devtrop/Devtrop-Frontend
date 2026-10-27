'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, ArrowUpDown } from 'lucide-react'

interface JobsHeaderProps {
  onToggleSort?: () => void
  sort?: 'latest' | 'oldest'
  sortOrder?: 'asc' | 'desc'
}

export function JobsHeader({ onToggleSort, sort = 'latest', sortOrder }: JobsHeaderProps) {
  const currentSort = sort ?? (sortOrder === 'asc' ? 'oldest' : 'latest')

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 w-full">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Jobs Management
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl">
          Create, manage, and track job postings and their applications.
        </p>
      </div>

      <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
        {onToggleSort && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSort}
            className="gap-1.5 border-border hover:bg-muted text-xs h-8 px-3 rounded-none"
            title={`Sort by ${currentSort === 'latest' ? 'oldest' : 'latest'} first`}
          >
            <ArrowUpDown className="size-3.5" />
            <span className="hidden sm:inline">
              {currentSort === 'latest' ? 'Latest First' : 'Oldest First'}
            </span>
          </Button>
        )}

        <Link href="/dashboard/admin/jobs/create" className="w-full sm:w-auto">
          <Button
            size="sm"
            className="gap-1.5 bg-accent hover:bg-accent text-white cursor-pointer text-xs h-8 px-3.5 rounded-none w-full sm:w-auto"
          >
            <Plus className="size-3.5" />
            <span>Create Job</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
