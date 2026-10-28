'use client'

import React, { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, RotateCcw, Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface JobOption {
  id: string
  title: string
  jobCode?: string
}

interface ApplicantsFiltersProps {
  search: string
  onSearchChange: (value: string) => void

  jobId: string
  onJobIdChange: (value: string) => void

  jobCode: string
  onJobCodeChange: (value: string) => void

  jobs?: JobOption[]

  status: string
  onStatusChange: (value: string) => void

  dateFrom: string
  onDateFromChange: (value: string) => void

  dateTo: string
  onDateToChange: (value: string) => void

  loading?: boolean
  onReset: () => void
}

const APPLICANT_STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SELECTED', label: 'Selected' },
  { value: 'TASK_ASSIGNED', label: 'Task Assigned' },
  { value: 'TASK_SUBMITTED', label: 'Task Submitted' },
  { value: 'INTERVIEW_SELECTED', label: 'Interview Selected' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  { value: 'INTERVIEW_COMPLETED', label: 'Interview Completed' },
  { value: 'OFFER_PENDING', label: 'Offer Pending' },
  { value: 'OFFER_SENT', label: 'Offer Sent' },
  { value: 'DOCS_SUBMITTED', label: 'Docs Submitted' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
]

interface DatePickerFilterProps {
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
  placeholder?: string
  minDate?: string // YYYY-MM-DD
  maxDate?: string // YYYY-MM-DD
  disabled?: boolean
  className?: string
}

function DatePickerFilter({
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  className,
}: DatePickerFilterProps) {
  const [open, setOpen] = useState(false)

  const selectedDate = useMemo(() => {
    if (!value) return undefined
    const parsed = new Date(`${value}T00:00:00`)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }, [value])

  const formattedDisplay = useMemo(() => {
    if (!selectedDate) return null
    return format(selectedDate, 'MMM dd, yyyy')
  }, [selectedDate])

  const minDateObj = useMemo(() => {
    if (!minDate) return undefined
    const parsed = new Date(`${minDate}T00:00:00`)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }, [minDate])

  const maxDateObj = useMemo(() => {
    if (!maxDate) return undefined
    const parsed = new Date(`${maxDate}T00:00:00`)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }, [maxDate])

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          type="button"
          className={cn(
            'w-full justify-between bg-subtle/80 border-border/70 text-xs px-3 font-normal cursor-pointer hover:bg-muted/80 transition-colors group',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">{formattedDisplay || placeholder}</span>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {value && (
              <span
                onClick={handleClear}
                className="p-0.5 rounded-sm hover:bg-subtle/60 text-muted hover:text-muted transition-colors"
                title="Clear date"
              >
                <X className="size-3" />
              </span>
            )}
            <CalendarIcon className="size-4 text-accent group-hover:text-accent transition-colors" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-hairline-light bg-canvas z-50"
        align="start"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={selectedDate}
          onSelect={(date) => {
            if (date) {
              const yyyy = date.getFullYear()
              const mm = String(date.getMonth() + 1).padStart(2, '0')
              const dd = String(date.getDate()).padStart(2, '0')
              onChange(`${yyyy}-${mm}-${dd}`)
            } else {
              onChange('')
            }
            setOpen(false)
          }}
          disabled={(date) => {
            if (minDateObj && date < minDateObj) return true
            if (maxDateObj && date > maxDateObj) return true
            return false
          }}
          className="rounded-none border-0 bg-canvas p-3 text-muted"
        />
        {value && (
          <div className="flex items-center justify-between border-t border-hairline-light px-3 py-2 text-xs bg-subtle/50">
            <span className="text-muted">{formattedDisplay}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
              className="h-6 px-2 text-[11px] text-muted hover:text-muted hover:bg-muted cursor-pointer"
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function ApplicantsFilters({
  search,
  onSearchChange,
  jobId,
  onJobIdChange,
  jobCode,
  onJobCodeChange,
  jobs = [],
  status,
  onStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  loading = false,
  onReset,
}: ApplicantsFiltersProps) {
  const hasActiveFilters =
    Boolean(search) ||
    Boolean(jobId) ||
    Boolean(jobCode) ||
    (Boolean(status) && status !== 'ALL') ||
    Boolean(dateFrom) ||
    Boolean(dateTo)

  const handleJobSelect = (value: string) => {
    if (value === 'ALL') {
      onJobIdChange('')
    } else {
      onJobIdChange(value)
      // Auto-fill matching job code if available
      const matchedJob = jobs.find((j) => j.id === value)
      if (matchedJob?.jobCode) {
        onJobCodeChange(matchedJob.jobCode)
      }
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-none border border-border/60 bg-canvas/60 p-4 backdrop-blur-md">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search applicants..."
            className="h-9 pl-9 text-xs bg-subtle/80 border-border/70 focus:border-accent"
          />
        </div>

        {/* Job Dropdown */}
        <div>
          <Select
            value={jobId || 'ALL'}
            onValueChange={handleJobSelect}
          >
            <SelectTrigger className="h-9 text-xs bg-subtle/80 border-border/70">
              <SelectValue placeholder="All Jobs" />
            </SelectTrigger>
            <SelectContent className="bg-subtle border-hairline-light text-xs">
              <SelectItem value="ALL">All Jobs</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title} {job.jobCode ? `(${job.jobCode})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Application Status Dropdown */}
        <div>
          <Select
            value={status || 'ALL'}
            onValueChange={(val) => onStatusChange(val === 'ALL' ? '' : val)}
          >
            <SelectTrigger className="h-9 text-xs bg-subtle/80 border-border/70">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-subtle border-hairline-light text-xs max-h-60">
              {APPLICANT_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Toolbar Footer: Date Range & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-[11px] font-medium text-muted">Date Range:</span>
          <div className="flex items-center gap-2">
            <DatePickerFilter
              value={dateFrom}
              onChange={onDateFromChange}
              placeholder="Select date"
              maxDate={dateTo}
              className="h-8 text-[11px] w-38 bg-subtle/80 border-border/70"
            />
            <span className="text-muted">to</span>
            <DatePickerFilter
              value={dateTo}
              onChange={onDateToChange}
              placeholder="Select date"
              minDate={dateFrom}
              className="h-8 text-[11px] w-38 bg-subtle/80 border-border/70"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-8 text-xs gap-1.5 border-border/70 hover:bg-muted text-muted cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
