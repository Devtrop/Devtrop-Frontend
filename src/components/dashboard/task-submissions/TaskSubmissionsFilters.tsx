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
import { Search, RotateCcw, X } from 'lucide-react'
import { getAdminJobs } from '@/lib/jobs'
import type { Job } from '@/types/job'

interface TaskSubmissionsFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  jobId: string
  onJobChange: (value: string) => void
  jobTaskId?: string
  onJobTaskIdChange?: (value: string) => void
  evaluationStatus: string
  onEvaluationStatusChange: (value: string) => void
  loading?: boolean
  onReset: () => void
}

export function TaskSubmissionsFilters({
  search,
  onSearchChange,
  jobId,
  onJobChange,
  evaluationStatus,
  onEvaluationStatusChange,
  loading,
  onReset,
}: TaskSubmissionsFiltersProps) {
  const [jobs, setJobs] = React.useState<Job[]>([])
  const [jobsLoading, setJobsLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function loadJobs() {
      try {
        setJobsLoading(true)
        const result = await getAdminJobs({ page: 1, limit: 100 })
        const jobsData = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : []
        if (!cancelled) setJobs(jobsData)
      } catch {
        if (!cancelled) setJobs([])
      } finally {
        if (!cancelled) setJobsLoading(false)
      }
    }
    void loadJobs()
    return () => {
      cancelled = true
    }
  }, [])

  const hasActiveFilters = Boolean(search || jobId || (evaluationStatus && evaluationStatus !== 'ALL'))

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
      {/* Search Input with Clear Button */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search candidates..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 text-xs rounded-none border-border pl-9 pr-8 bg-card transition-all focus-visible:ring-1 focus-visible:ring-accent"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer transition-colors"
            title="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Job Filter */}
      <Select
        value={jobId || 'ALL'}
        onValueChange={(val) => onJobChange(val === 'ALL' ? '' : val)}
      >
        <SelectTrigger className="h-10 w-full sm:w-48 text-xs rounded-none border-border bg-card transition-all focus:ring-1 focus:ring-accent">
          <SelectValue placeholder={jobsLoading ? 'Loading jobs...' : 'All Jobs'} />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="ALL">All Jobs</SelectItem>
          {jobs.map((job) => (
            <SelectItem key={job.id} value={job.id}>
              {job.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Evaluation Status Filter */}
      <Select
        value={evaluationStatus || 'ALL'}
        onValueChange={onEvaluationStatusChange}
      >
        <SelectTrigger className="h-10 w-full sm:w-44 text-xs rounded-none border-border bg-card transition-all focus:ring-1 focus:ring-accent">
          <SelectValue placeholder="All Results" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="ALL">All Results</SelectItem>
          <SelectItem value="INTERVIEW_SELECTED">Passed (Interview Ready)</SelectItem>
          <SelectItem value="REJECTED">Rejected / Failed</SelectItem>
          <SelectItem value="TASK_SUBMITTED">Needs Review</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={loading}
          className="h-10 px-3 text-xs rounded-none border-border bg-card hover:bg-muted transition-colors shrink-0 gap-1.5"
          title="Reset Filters"
        >
          <RotateCcw className="size-3.5 text-muted-foreground" />
          <span className="hidden md:inline">Reset</span>
        </Button>
      )}
    </div>
  )
}
