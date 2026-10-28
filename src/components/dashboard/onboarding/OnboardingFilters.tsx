'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, X, RefreshCw, Briefcase, ChevronDown, Check } from 'lucide-react'
import type { ApplicationStatus } from '@/types/job'
import type {
  OnboardingCounts,
  OnboardingModalType,
  OnboardingSortOption,
  OnboardingTabKey,
  UniqueJobOption,
} from './types'

interface OnboardingFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  selectedJobId: string
  onJobChange: (jobId: string) => void
  jobs: UniqueJobOption[]
  sortOrder: OnboardingSortOption
  onSortOrderChange: (order: OnboardingSortOption) => void
  activeTab: OnboardingTabKey
  onTabChange: (tabId: OnboardingTabKey) => void
  counts: OnboardingCounts
  loading?: boolean
  onRefresh: () => void
}

const TABS: Array<{
  id: OnboardingTabKey
  label: string
  status?: ApplicationStatus
  key: keyof OnboardingCounts
}> = [
  { id: 'ALL', label: 'All', key: 'all' },
  { id: 'OFFER_PENDING', label: 'Offer Pending', status: 'OFFER_PENDING', key: 'pending' },
  { id: 'OFFER_SENT', label: 'Offer Sent', status: 'OFFER_SENT', key: 'sent' },
  { id: 'DOCS_SUBMITTED', label: 'Docs Submitted', status: 'DOCS_SUBMITTED', key: 'submitted' },
  { id: 'HIRED', label: 'Hired', status: 'HIRED', key: 'hired' },
  { id: 'REJECTED', label: 'Rejected', status: 'REJECTED', key: 'rejected' },
]

const SORT_OPTIONS: Array<{ value: OnboardingSortOption; label: string }> = [
  { value: 'recent_desc', label: 'Recent update (Newest first)' },
  { value: 'recent_asc', label: 'Recent update (Oldest first)' },
  { value: 'name_asc', label: 'Name (A → Z)' },
  { value: 'name_desc', label: 'Name (Z → A)' },
  { value: 'applied_desc', label: 'Application date (Newest)' },
]

export function OnboardingFilters({
  search,
  onSearchChange,
  selectedJobId,
  onJobChange,
  jobs,
  sortOrder,
  onSortOrderChange,
  activeTab,
  onTabChange,
  counts,
  loading,
  onRefresh,
}: OnboardingFiltersProps) {
  const selectedJob = jobs.find((job) => job.id === selectedJobId)

  return (
    <div className="space-y-3.5">
      {/* Top Filter Bar: Search + Job Filter + Sort Order + Refresh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search candidate name, email, or job title..."
            className="pl-9 pr-8 text-xs h-9 bg-card/60 border-border/80 rounded-none"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Job Position Dropdown Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs gap-2 border-border/80 bg-card/60 rounded-none shrink-0 cursor-pointer justify-between sm:justify-start"
            >
              <Briefcase className="size-3.5 text-accent shrink-0" />
              <span className="truncate max-w-[150px]">
                {selectedJob ? selectedJob.title : 'All Positions'}
              </span>
              <ChevronDown className="size-3 opacity-60 ml-1 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 max-h-64 overflow-y-auto bg-popover border-border text-foreground rounded-none p-1"
          >
            <DropdownMenuItem
              onClick={() => onJobChange('ALL')}
              className={`text-xs cursor-pointer ${selectedJobId === 'ALL' ? 'bg-primary/10 text-primary font-medium' : ''}`}
            >
              All Positions
            </DropdownMenuItem>
            {jobs.map((job) => (
              <DropdownMenuItem
                key={job.id}
                onClick={() => onJobChange(job.id)}
                className={`text-xs cursor-pointer truncate ${selectedJobId === job.id ? 'bg-primary/10 text-primary font-medium' : ''}`}
              >
                {job.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Order Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs gap-2 border-border/80 bg-card/60 rounded-none shrink-0 cursor-pointer justify-between sm:justify-start"
            >
              <span className="truncate max-w-[160px]">
                {SORT_OPTIONS.find((s) => s.value === sortOrder)?.label || 'Sort by'}
              </span>
              <ChevronDown className="size-3 opacity-60 ml-1 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-none text-xs bg-popover border-border p-1"
          >
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => onSortOrderChange(opt.value)}
                className={`text-xs cursor-pointer rounded-none gap-2 ${
                  sortOrder === opt.value ? 'bg-primary/10 text-primary font-medium' : ''
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {sortOrder === opt.value && (
                  <Check className="size-3 ml-auto text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-9 px-3 text-xs gap-1.5 border-border/80 bg-card/60 rounded-none shrink-0 cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin text-accent' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Tabs with Counters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide border-b border-border/60">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const count = counts[tab.key]

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
