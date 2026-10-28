'use client'

import React from 'react'
import { RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { ApplicationSortOrder, ApplicationStatus } from './ApplicationsHub'

export interface JobOption {
  id: string
  title: string
  jobCode?: string
}

interface ApplicationsFiltersProps {
  search: string
  onSearchChange: (value: string) => void

  applicationCode?: string
  onApplicationCodeChange?: (value: string) => void

  jobCode?: string
  onJobCodeChange?: (value: string) => void
  jobId?: string
  onJobIdChange?: (value: string) => void

  jobSearch: string
  onJobSearchChange: (value: string) => void

  jobs?: JobOption[]

  status: ApplicationStatus | ''
  onStatusChange: (value: ApplicationStatus | '') => void

  sort: ApplicationSortOrder
  onSortChange: (value: ApplicationSortOrder) => void

  loading: boolean
  onReset: () => void
}

const STATUS_OPTIONS: Array<{
  value: ApplicationStatus | ''
  label: string
}> = [
  {
    value: '',
    label: 'All Statuses',
  },
  {
    value: 'APPLIED',
    label: 'Applied',
  },
  {
    value: 'SELECTED',
    label: 'Selected',
  },
  {
    value: 'TASK_ASSIGNED',
    label: 'Task Assigned',
  },
  {
    value: 'TASK_SUBMITTED',
    label: 'Task Submitted',
  },
  {
    value: 'INTERVIEW_SELECTED',
    label: 'Interview Selected',
  },
  {
    value: 'INTERVIEW_SCHEDULED',
    label: 'Interview Scheduled',
  },
  {
    value: 'INTERVIEW_COMPLETED',
    label: 'Interview Completed',
  },
  {
    value: 'OFFER_PENDING',
    label: 'Offer Pending',
  },
  {
    value: 'OFFER_SENT',
    label: 'Offer Sent',
  },
  {
    value: 'DOCS_SUBMITTED',
    label: 'Documents Submitted',
  },
  {
    value: 'HIRED',
    label: 'Hired',
  },
  {
    value: 'REJECTED',
    label: 'Rejected',
  },
]

export function ApplicationsFilters({
  search,
  onSearchChange,
  applicationCode,
  onApplicationCodeChange,
  jobCode,
  onJobCodeChange,
  jobId,
  onJobIdChange,
  jobSearch,
  onJobSearchChange,
  jobs = [],
  status,
  onStatusChange,
  sort,
  onSortChange,
  loading,
  onReset,
}: ApplicationsFiltersProps) {
  const currentJobCode = jobCode ?? jobId ?? ''
  const handleJobCodeChange = (val: string) => {
    onJobCodeChange?.(val)
    onJobIdChange?.(val)
  }

  return (
    <div className="rounded-none border border-border bg-card p-3 sm:p-4">
      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 lg:grid-cols-7">
        {/* 1. Applicant Name / Email (First) */}
        <Input
          type="text"
          placeholder="Search name, email..."
          value={search}
          onChange={(event) => {
            onSearchChange(event.target.value)
          }}
          className="h-9 rounded-none border-border text-xs"
        />

        {/* 2. Application Code */}
        <Input
          type="text"
          placeholder="App Code (10000001)..."
          value={applicationCode || ''}
          onChange={(event) => {
            onApplicationCodeChange?.(event.target.value)
          }}
          className="h-9 rounded-none border-border text-xs"
        />

        {/* 3. Job Code (Third) */}
        <Input
          type="text"
          placeholder="Search by job ID..."
          value={currentJobCode}
          onChange={(event) => {
            handleJobCodeChange(event.target.value)
          }}
          className="h-9 rounded-none border-border text-xs"
        />

        {/* 3. Job Name dropdown (Third) */}
        <Select
          value={jobSearch || 'ALL'}
          onValueChange={(value) => {
            onJobSearchChange(value === 'ALL' ? '' : value)
          }}
        >
          <SelectTrigger className="h-9 rounded-none border-border text-xs">
            <SelectValue placeholder="All Jobs" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">All Jobs</SelectItem>
            {jobs.map((job) => (
              <SelectItem key={job.id} value={job.title}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={status || 'ALL'}
          onValueChange={(value) => {
            onStatusChange(value === 'ALL' ? '' : (value as ApplicationStatus))
          }}
        >
          <SelectTrigger className="h-9 rounded-none border-border text-xs">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>

          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value || 'all-statuses'} value={option.value || 'ALL'}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={sort}
          onValueChange={(value) => {
            onSortChange(value as ApplicationSortOrder)
          }}
        >
          <SelectTrigger className="h-9 rounded-none border-border text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>

            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset */}
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={loading}
          className="h-9 w-full gap-1.5 rounded-none border-border text-xs hover:bg-muted"
        >
          <RotateCcw className="size-3.5" />

          {loading ? 'Loading...' : 'Reset'}
        </Button>
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        Results update automatically as you type.
      </p>
    </div>
  )
}
