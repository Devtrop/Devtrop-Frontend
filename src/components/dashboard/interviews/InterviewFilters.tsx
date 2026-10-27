'use client'

import React, { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useInterviewContext, InterviewSortOption } from '@/contexts/InterviewContext'
import { InterviewIcons } from './interview-icons'
import { Interview, InterviewStatsData, Job } from './types'

interface InterviewFiltersProps {
  search?: string
  onSearchChange?: (value: string) => void
  selectedJobId?: string
  onJobChange?: (jobId: string) => void
  selectedDate?: string | null
  onDateChange?: (date: string | null) => void
  filterTab?: string
  onTabChange?: (value: string) => void
  sortOrder?: InterviewSortOption
  onSortChange?: (sort: InterviewSortOption) => void
  stats?: InterviewStatsData
  interviews?: Interview[]
  jobs?: Job[]
  onRefresh?: () => void
}

const SORT_OPTIONS: Array<{ value: InterviewSortOption; label: string }> = [
  { value: 'schedule_asc', label: 'Schedule time (Earliest)' },
  { value: 'schedule_desc', label: 'Schedule time (Latest)' },
  { value: 'recent_desc', label: 'Recent update (Newest)' },
  { value: 'recent_asc', label: 'Recent update (Oldest)' },
  { value: 'name_asc', label: 'Name (A → Z)' },
  { value: 'name_desc', label: 'Name (Z → A)' },
  { value: 'applied_desc', label: 'Applied date (Newest)' },
]

export function InterviewFilters(props: InterviewFiltersProps) {
  const context = useInterviewContext()

  const search = props.search ?? context.search
  const onSearchChange = props.onSearchChange ?? context.setSearch
  const selectedJobId = props.selectedJobId ?? context.selectedJobFilter
  const onJobChange = props.onJobChange ?? context.setSelectedJobFilter
  const selectedDate = props.selectedDate ?? context.selectedDateFilter
  const onDateChange = props.onDateChange ?? context.setDateFilter
  const sortOrder = props.sortOrder ?? context.sortOrder
  const onSortChange = props.onSortChange ?? context.setSortOrder
  const filterTab = props.filterTab ?? context.filterTab
  const onTabChange = props.onTabChange ?? context.setFilterTab
  const stats = props.stats ?? context.stats
  const interviews = props.interviews ?? context.interviews
  const jobs = props.jobs ?? context.jobs
  const onRefresh = props.onRefresh ?? (() => context.fetchData(true))

  const mergedJobs = useMemo(() => {
    const map = new Map<string, Job>()
    jobs.forEach((j: Job) => map.set(j.id, j))
    interviews.forEach((item) => {
      if (item.application?.job?.id && item.application?.job?.title) {
        if (!map.has(item.application.job.id)) {
          map.set(item.application.job.id, {
            id: item.application.job.id,
            title: item.application.job.title,
          })
        }
      }
    })
    return Array.from(map.values())
  }, [jobs, interviews])

  const selectedJobTitle =
    selectedJobId === 'ALL'
      ? 'All Job Positions'
      : mergedJobs.find((j: Job) => j.id === selectedJobId)?.title || 'Filter by Position'

  const currentSortLabel = SORT_OPTIONS.find((s) => s.value === sortOrder)?.label || 'Sort by'

  const [dateOpen, setDateOpen] = useState(false)
  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return undefined
    const parsed = new Date(`${selectedDate}T00:00:00`)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }, [selectedDate])
  const displayLabel = selectedDateObj ? format(selectedDateObj, 'MMM dd, yyyy') : null

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Row 1: Search + Job + Date + Sort */}
      <div className="flex items-center gap-2 w-full min-w-0">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <InterviewIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search candidates, roles, emails..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 bg-card/60 border-border text-xs h-8 rounded-none w-full"
          />
        </div>

        {/* Job Position Dropdown */}
        <div className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-none border border-border bg-card/80 text-xs font-medium justify-between gap-2 cursor-pointer hover:bg-muted/40 w-[170px]"
              >
                <span className="truncate text-foreground">{selectedJobTitle}</span>
                <InterviewIcons.ChevronDown className="size-3 text-muted-foreground shrink-0 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 rounded-none text-xs max-h-64 overflow-y-auto"
            >
              <DropdownMenuItem
                onClick={() => onJobChange('ALL')}
                className="cursor-pointer gap-2 rounded-none font-medium"
              >
                <span className="truncate">All Job Positions</span>
                {selectedJobId === 'ALL' && (
                  <InterviewIcons.Check className="size-3 ml-auto text-primary shrink-0" />
                )}
              </DropdownMenuItem>
              {mergedJobs.map((job: Job) => (
                <DropdownMenuItem
                  key={job.id}
                  onClick={() => onJobChange(job.id)}
                  className="cursor-pointer gap-2 rounded-none"
                >
                  <span className="truncate">{job.title}</span>
                  {selectedJobId === job.id && (
                    <InterviewIcons.Check className="size-3 ml-auto text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Date Filter */}
        <div className="shrink-0">
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                type="button"
                className={`h-8 px-3 rounded-none border border-border bg-card/80 text-xs font-medium justify-between gap-2 cursor-pointer hover:bg-muted/40 w-[150px] ${!selectedDate ? 'text-muted-foreground' : 'text-foreground'}`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <InterviewIcons.Calendar className="size-3.5 shrink-0 text-accent" />
                  <span className="truncate">{displayLabel || 'Filter by date'}</span>
                </span>
                {selectedDate && (
                  <span
                    onClick={(e) => { e.stopPropagation(); onDateChange(null) }}
                    className="p-0.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    title="Clear date"
                  >
                    <InterviewIcons.X className="size-3" />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-hairline-light bg-canvas z-50" align="start">
              <Calendar
                mode="single"
                selected={selectedDateObj}
                defaultMonth={selectedDateObj}
                onSelect={(date) => {
                  if (date) {
                    const yyyy = date.getFullYear()
                    const mm = String(date.getMonth() + 1).padStart(2, '0')
                    const dd = String(date.getDate()).padStart(2, '0')
                    onDateChange(`${yyyy}-${mm}-${dd}`)
                  } else {
                    onDateChange(null)
                  }
                  setDateOpen(false)
                }}
                className="rounded-none border-0 bg-canvas p-3 text-muted"
              />
              {selectedDate && (
                <div className="flex items-center justify-between border-t border-hairline-light px-3 py-2 text-xs bg-subtle/50">
                  <span className="text-muted">{displayLabel}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { onDateChange(null); setDateOpen(false) }}
                    className="h-6 px-2 text-[11px] text-muted hover:text-muted hover:bg-muted cursor-pointer"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Sort Order Dropdown */}
        <div className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-none border border-border bg-card/80 text-xs font-medium justify-between gap-2 cursor-pointer hover:bg-muted/40 w-[150px]"
              >
                <span className="truncate text-foreground">{currentSortLabel}</span>
                <InterviewIcons.ChevronDown className="size-3 text-muted-foreground shrink-0 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-none text-xs">
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => onSortChange(opt.value)}
                  className="cursor-pointer gap-2 rounded-none text-xs"
                >
                  <span>{opt.label}</span>
                  {sortOrder === opt.value && (
                    <InterviewIcons.Check className="size-3 ml-auto text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Row 2: Status Tabs + Refresh */}
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <Tabs value={filterTab} onValueChange={onTabChange}>
            <TabsList className="bg-muted/40 p-1 border border-border/80 h-8 rounded-none w-max">
              <TabsTrigger value="ALL" className="text-xs px-2.5 py-1 rounded-none whitespace-nowrap">
                All ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="INTERVIEW_SELECTED" className="text-xs px-2.5 py-1 rounded-none whitespace-nowrap">
                Interview Ready ({stats.selected})
              </TabsTrigger>
              <TabsTrigger value="PENDING" className="text-xs px-2.5 py-1 rounded-none whitespace-nowrap">
                Pending ({stats.pendingBooking})
              </TabsTrigger>
              <TabsTrigger value="SCHEDULED" className="text-xs px-2.5 py-1 rounded-none whitespace-nowrap">
                Scheduled ({stats.scheduled})
              </TabsTrigger>
              <TabsTrigger value="COMPLETED" className="text-xs px-2.5 py-1 rounded-none whitespace-nowrap">
                Completed ({stats.completed})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Button
          variant="outline"
          size="icon-xs"
          onClick={onRefresh}
          className="cursor-pointer shrink-0 border-border h-8 w-8 rounded-none hover:bg-muted"
          title="Refresh Data"
        >
          <InterviewIcons.Refresh className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
