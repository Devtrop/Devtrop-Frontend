'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw, Search } from 'lucide-react'
import type { JobStatus, JobType } from '@/types/job'

interface JobsFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: JobStatus | ''
  onStatusChange: (value: JobStatus | '') => void
  jobTypeFilter: JobType | ''
  onJobTypeChange: (value: JobType | '') => void
  sort: 'latest' | 'oldest'
  onSortChange: (value: 'latest' | 'oldest') => void
  onReset: () => void
  loading: boolean
}

export function JobsFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  jobTypeFilter,
  onJobTypeChange,
  sort,
  onSortChange,
  onReset,
  loading,
}: JobsFiltersProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title, job code..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs rounded-lg border-border"
          />
        </div>

        {/* Work Mode Filter */}
        <Select
          value={jobTypeFilter || 'ALL'}
          onValueChange={(val) => onJobTypeChange(val === 'ALL' ? '' : (val as JobType))}
        >
          <SelectTrigger className="w-full sm:w-36 h-9 text-xs rounded-lg border-border">
            <SelectValue placeholder="All Work Modes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Work Modes</SelectItem>
            <SelectItem value="REMOTE">Remote</SelectItem>
            <SelectItem value="ONSITE">Onsite</SelectItem>
            <SelectItem value="HYBRID">Hybrid</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={statusFilter || 'ALL'}
          onValueChange={(val) => onStatusChange(val === 'ALL' ? '' : (val as JobStatus))}
        >
          <SelectTrigger className="w-full sm:w-36 h-9 text-xs rounded-lg border-border">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Filter */}
        <Select value={sort} onValueChange={(val) => onSortChange(val as 'latest' | 'oldest')}>
          <SelectTrigger className="w-full sm:w-32 h-9 text-xs rounded-lg border-border">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset / Refresh Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={loading}
          className="gap-1.5 h-9 px-3 text-xs rounded-lg border-border hover:bg-muted"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Results update automatically as you type.
      </p>
    </div>
  )
}
