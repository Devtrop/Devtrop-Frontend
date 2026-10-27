'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HeroDatePicker } from '@/components/ui/hero-date-picker'
import { Input } from '@/components/ui/input'
import { interviewsApi } from '@/lib/interviews'
import { toast } from '@/lib/toast'
import React, { useEffect, useMemo, useState } from 'react'
import { TimeCombobox, TimeOption, formatTime24to12 } from './TimeCombobox'
import { InterviewIcons } from './interview-icons'
import { Job, SlotGroup } from './types'

interface CreateSlotsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  jobs?: Job[]
}

// 15-minute time interval options across all 24 hours (00:00 to 23:45, plus 23:59)
export const TIME_OPTIONS: TimeOption[] = (() => {
  const list: TimeOption[] = []
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      const period = h >= 12 ? 'PM' : 'AM'
      const h12 = h % 12 === 0 ? 12 : h % 12
      const label = `${String(h12).padStart(2, '0')}:${mm} ${period}`
      list.push({ value: `${hh}:${mm}`, label })
    }
  }
  list.push({ value: '23:59', label: '11:59 PM' })
  return list
})()

const WEEK_DAYS = [
  { day: 0, label: 'Sun' },
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
]

export function CreateSlotsModal({
  isOpen,
  onClose,
  onSuccess,
  jobs: initialJobs = [],
}: CreateSlotsModalProps) {
  const [fetchedJobs, setFetchedJobs] = useState<Job[]>([])
  const rawJobs = initialJobs && initialJobs.length > 0 ? initialJobs : fetchedJobs
  const jobs = rawJobs.filter((job) => job.status === 'ACTIVE')
  const [selectedJobId, setSelectedJobId] = useState('')
  const activeJobId = selectedJobId || jobs[0]?.id || ''

  const [groupName, setGroupName] = useState('')
  const [groupMode, setGroupMode] = useState<'new' | 'extend'>('new')
  const [existingGroups, setExistingGroups] = useState<SlotGroup[]>([])
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const inThreeDays = new Date()
    inThreeDays.setDate(inThreeDays.getDate() + 4)
    return inThreeDays.toISOString().split('T')[0]
  })
  const [dailyStartTime, setDailyStartTime] = useState('19:00')
  const [dailyEndTime, setDailyEndTime] = useState('23:59')
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(30)
  const [bufferMinutes, setBufferMinutes] = useState(5)
  const [excludedDays, setExcludedDays] = useState<number[]>([5, 6]) // Default Friday & Saturday off
  const [hasBreak, setHasBreak] = useState(true)
  const [breakStartTime, setBreakStartTime] = useState('21:30')
  const [breakEndTime, setBreakEndTime] = useState('22:00')
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/')
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch jobs if missing
  useEffect(() => {
    if (!isOpen || initialJobs.length > 0) return

    let active = true
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true)
        const res = await interviewsApi.getJobsList()
        if (!active) return
        const apiJobs = (res.data || []) as Job[]
        setFetchedJobs(apiJobs)
      } catch (err) {
        console.error('Failed to load jobs list:', err)
      } finally {
        if (active) setLoadingJobs(false)
      }
    }

    void fetchJobs()
    return () => {
      active = false
    }
  }, [isOpen, initialJobs])

  // Auto-select first available job when loaded
  useEffect(() => {
    if (isOpen && !selectedJobId && jobs.length > 0) {
      setSelectedJobId(jobs[0].id)
    }
  }, [isOpen, jobs, selectedJobId])

  // Load existing slot groups for the selected job (enables extend mode)
  useEffect(() => {
    if (!isOpen || !activeJobId) return
    let active = true
    void interviewsApi
      .getSlotGroups(activeJobId)
      .then((res) => {
        if (active) setExistingGroups(res.data || [])
      })
      .catch((err) => console.error('Failed to load slot groups:', err))
    return () => {
      active = false
    }
  }, [isOpen, activeJobId])

  const selectedGroupStats = existingGroups.find((g) => g.groupName === groupName)

  // Extend mode only holds while the chosen batch still exists (job switch / group delete)
  const effectiveMode: 'new' | 'extend' = groupMode === 'extend' && selectedGroupStats ? 'extend' : 'new'

  // Auto-generate a default group name if empty
  const selectedJob = jobs.find((j) => j.id === activeJobId)
  useEffect(() => {
    if (isOpen && effectiveMode === 'new' && !groupName) {
      const jobPrefix = selectedJob?.title ? `${selectedJob.title.slice(0, 16).trim()} - ` : ''
      const dateTag = new Date().toISOString().slice(5, 10).replace('-', '/')
      setGroupName(`${jobPrefix}Batch ${dateTag}`)
    }
  }, [isOpen, selectedJob, activeJobId, groupName, effectiveMode])

  // Helper date preset handler
  const handleDatePreset = (daysFromNow: number) => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() + 1)
    const end = new Date(today)
    end.setDate(end.getDate() + daysFromNow)

    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }

  const toggleDayExclusion = (day: number) => {
    setExcludedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  // Reactive slot count preview estimator
  const estimatedSlots = useMemo(() => {
    try {
      const [sY, sM, sD] = startDate.split('-').map(Number)
      const [eY, eM, eD] = endDate.split('-').map(Number)
      const start = new Date(Date.UTC(sY, sM - 1, sD))
      const end = new Date(Date.UTC(eY, eM - 1, eD))
      if (start > end) return 0

      const [startH, startM] = dailyStartTime.split(':').map(Number)
      const [endH, endM] = dailyEndTime.split(':').map(Number)
      const startMins = startH * 60 + startM
      const endMins = endH * 60 + endM
      if (endMins <= startMins) return 0

      const [bStartH, bStartM] = breakStartTime.split(':').map(Number)
      const [bEndH, bEndM] = breakEndTime.split(':').map(Number)
      const breakStartMins = hasBreak ? bStartH * 60 + bStartM : null
      const breakEndMins = hasBreak ? bEndH * 60 + bEndM : null

      let activeDaysCount = 0
      const curr = new Date(start)
      while (curr <= end) {
        if (!excludedDays.includes(curr.getUTCDay())) {
          activeDaysCount++
        }
        curr.setUTCDate(curr.getUTCDate() + 1)
      }

      let dailySlotCount = 0
      let currentMinute = startMins
      while (currentMinute + slotDurationMinutes <= endMins) {
        const slotEnd = currentMinute + slotDurationMinutes
        if (
          breakStartMins !== null &&
          breakEndMins !== null &&
          !(slotEnd <= breakStartMins || currentMinute >= breakEndMins)
        ) {
          currentMinute = breakEndMins
          continue
        }
        dailySlotCount++
        currentMinute += slotDurationMinutes + bufferMinutes
      }

      return dailySlotCount * activeDaysCount
    } catch {
      return 0
    }
  }, [
    startDate,
    endDate,
    dailyStartTime,
    dailyEndTime,
    hasBreak,
    breakStartTime,
    breakEndTime,
    excludedDays,
    slotDurationMinutes,
    bufferMinutes,
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeJobId) {
      setError('Please select a target job position')
      return
    }

    if (!groupName.trim()) {
      setError('Please enter a group/batch name for this slot generation.')
      return
    }

    if (!meetingUrl.trim()) {
      setError('Meeting URL is required.')
      return
    }

    const [startH, startM] = dailyStartTime.split(':').map(Number)
    const [endH, endM] = dailyEndTime.split(':').map(Number)
    const startMins = startH * 60 + startM
    const endMins = endH * 60 + endM

    if (isNaN(startMins) || isNaN(endMins)) {
      setError('Please select valid start and end times.')
      return
    }

    if (endMins <= startMins) {
      setError('Daily end time must be after daily start time.')
      return
    }

    if (endMins - startMins < Number(slotDurationMinutes)) {
      setError(
        `Daily time window must be at least ${slotDurationMinutes} minutes to generate a slot.`,
      )
      return
    }

    if (hasBreak) {
      const [bStartH, bStartM] = breakStartTime.split(':').map(Number)
      const [bEndH, bEndM] = breakEndTime.split(':').map(Number)
      const bStartMins = bStartH * 60 + bStartM
      const bEndMins = bEndH * 60 + bEndM

      if (bEndMins <= bStartMins) {
        setError('Break end time must be after break start time.')
        return
      }
      if (bStartMins < startMins || bEndMins > endMins) {
        setError('Break window must fall within daily working hours.')
        return
      }
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const res = await interviewsApi.createSlots({
        jobId: activeJobId,
        groupName: groupName.trim(),
        mode: effectiveMode,
        startDate,
        endDate,
        startTime: dailyStartTime,
        endTime: dailyEndTime,
        slotDuration: Number(slotDurationMinutes),
        breakDuration: Number(bufferMinutes),
        breakStartTime: hasBreak ? breakStartTime : undefined,
        breakEndTime: hasBreak ? breakEndTime : undefined,
        excludedDays: excludedDays.length > 0 ? excludedDays : undefined,
        meetingUrl: meetingUrl.trim(),
      })

      if (res.success) {
        toast.success(
          res.data?.message ||
            (effectiveMode === 'extend'
              ? `Added ${res.data?.slotsCreated || ''} slot(s) to batch "${groupName}".`
              : `Generated ${res.data?.slotsCreated || ''} interview slots under group "${groupName}".`),
        )
        onSuccess()
        onClose()
      } else {
        const errorMsg = res.message || 'Failed to generate interview slots'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'An unexpected network error occurred.'
      console.error(err)
      setError(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedJobTitle =
    jobs.find((j) => j.id === activeJobId)?.title || 'Choose a job position...'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pr-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Generate Interview Slot Pool
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Configure calendar batches, working windows, breaks, and off-days.
              </DialogDescription>
            </div>
            {estimatedSlots > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-soft border border-accent text-accent text-[11px] font-semibold self-start sm:self-auto">
                <InterviewIcons.Sparkles className="size-3" />
                <span>~{estimatedSlots} slots estimated</span>
              </div>
            )}
          </div>
        </DialogHeader>

        {error && (
          <div className="p-2.5 text-xs rounded-none bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 py-1">
          {/* 1. Job Position & Group Name Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Job Position Dropdown */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Position
              </span>
              {loadingJobs ? (
                <div className="py-1.5 text-xs text-muted-foreground flex items-center gap-2">
                  <InterviewIcons.Loader className="size-3 animate-spin text-primary" /> Loading...
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 px-3 rounded-none border border-border bg-card/80 text-xs font-medium justify-between gap-2 cursor-pointer hover:bg-muted/40"
                    >
                      <span className="truncate text-foreground font-semibold">
                        {selectedJobTitle}
                      </span>
                      <InterviewIcons.ChevronDown className="size-3 text-muted-foreground shrink-0 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-80 rounded-none text-xs max-h-60 overflow-y-auto"
                  >
                    {jobs.map((job) => (
                      <DropdownMenuItem
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        className="cursor-pointer gap-2 rounded-none"
                      >
                        <span className="truncate">{job.title}</span>
                        {activeJobId === job.id && (
                          <InterviewIcons.Check className="size-3 ml-auto text-primary shrink-0" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Group / Batch Name: input holds the name, dropdown switches between batches */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Slot Group Name
              </span>
              <div className="flex items-center gap-1.5">
                <Input
                  placeholder="e.g. Batch 1 - Technical"
                  value={groupName}
                  onChange={(e) => {
                    setGroupMode('new')
                    setGroupName(e.target.value)
                  }}
                  readOnly={effectiveMode === 'extend'}
                  required
                  className={`h-8 flex-1 rounded-none bg-card text-xs font-medium border-border ${
                    effectiveMode === 'extend' ? 'text-sky-400 border-sky-500/40' : ''
                  }`}
                />
                {existingGroups.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label="Choose slot batch"
                        className="h-8 w-8 p-0 shrink-0 rounded-none border border-border bg-card/80 cursor-pointer hover:bg-muted/40"
                      >
                        <InterviewIcons.ChevronDown className="size-3.5 text-muted-foreground opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-80 rounded-none text-xs max-h-60 overflow-y-auto"
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          setGroupMode('new')
                          setGroupName('')
                        }}
                        className="cursor-pointer gap-2 rounded-none"
                      >
                        <InterviewIcons.Plus className="size-3 text-accent shrink-0" />
                        <span>Create new group</span>
                        {effectiveMode === 'new' && (
                          <InterviewIcons.Check className="size-3 ml-auto text-primary shrink-0" />
                        )}
                      </DropdownMenuItem>
                      {existingGroups.map((grp) => (
                        <DropdownMenuItem
                          key={grp.groupName}
                          onClick={() => {
                            setGroupMode('extend')
                            setGroupName(grp.groupName)
                          }}
                          className="cursor-pointer gap-2 rounded-none"
                        >
                          <InterviewIcons.Layers className="size-3 text-sky-400 shrink-0" />
                          <span className="truncate">{grp.groupName}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {grp.availableSlots} open / {grp.totalSlots}
                          </span>
                          {effectiveMode === 'extend' && groupName === grp.groupName && (
                            <InterviewIcons.Check className="size-3 ml-auto text-primary shrink-0" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>

          {effectiveMode === 'extend' && selectedGroupStats && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 rounded-none border border-sky-500/30 bg-sky-500/10 text-[11px] text-sky-400">
              <span className="font-semibold text-foreground">Managing batch</span>
              <span>{selectedGroupStats.totalSlots} slots total</span>
              <span>{selectedGroupStats.bookedSlots} booked</span>
              <span>{selectedGroupStats.availableSlots} open</span>
              {selectedGroupStats.startDate && selectedGroupStats.endDate && (
                <span>
                  {new Date(selectedGroupStats.startDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  &ndash;{' '}
                  {new Date(selectedGroupStats.endDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
              <span className="text-muted-foreground">
                This run appends new slots to the batch &mdash; booked slots are never touched.
              </span>
            </div>
          )}

          {/* 2. Date Range & Selectable Weekends */}
          <div className="flex flex-col gap-2 p-3 rounded-none border border-border/80 bg-muted/20 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                <InterviewIcons.Calendar className="size-3.5 text-accent" /> Date Range &
                Off-Days
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleDatePreset(2)}
                  className="px-2 py-0.5 rounded-none bg-card border border-border/60 hover:bg-muted text-[10px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  2d
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset(4)}
                  className="px-2 py-0.5 rounded-none bg-card border border-border/60 hover:bg-muted text-[10px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  4d
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset(7)}
                  className="px-2 py-0.5 rounded-none bg-card border border-border/60 hover:bg-muted text-[10px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  1w
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <HeroDatePicker
                value={startDate}
                onChange={setStartDate}
                label="Start Date"
                isRequired
              />
              <HeroDatePicker value={endDate} onChange={setEndDate} label="End Date" isRequired />
            </div>

            {/* Selectable Days of Week (Weekends) */}
            <div className="pt-1.5 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-muted-foreground font-medium">Active Days:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {WEEK_DAYS.map(({ day, label }) => {
                    const isExcluded = excludedDays.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDayExclusion(day)}
                        className={`size-6 rounded-none text-[10px] font-semibold transition-all cursor-pointer ${
                          !isExcluded
                            ? 'bg-accent-soft text-accent border border-accent'
                            : 'bg-card text-muted-foreground/50 border border-border/40 line-through hover:text-muted-foreground'
                        }`}
                        title={isExcluded ? `${label} is excluded (off-day)` : `${label} is active`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Day presets */}
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setExcludedDays([5, 6])}
                  className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                    excludedDays.length === 2 &&
                    excludedDays.includes(5) &&
                    excludedDays.includes(6)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Fri-Sat Off
                </button>
                <button
                  type="button"
                  onClick={() => setExcludedDays([0, 6])}
                  className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                    excludedDays.length === 2 &&
                    excludedDays.includes(0) &&
                    excludedDays.includes(6)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Sat-Sun Off
                </button>
                <button
                  type="button"
                  onClick={() => setExcludedDays([])}
                  className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                    excludedDays.length === 0
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  All Days
                </button>
              </div>
            </div>
          </div>

          {/* 3. Working Hours & Dedicated Break Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Working Hours */}
            <div className="flex flex-col gap-1.5 p-3 rounded-none border border-border/80 bg-muted/20 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                  <InterviewIcons.Clock className="size-3.5 text-sky-400" /> Daily Hours
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDailyStartTime('19:00')
                      setDailyEndTime('23:59')
                    }}
                    className="px-1.5 py-0.5 rounded bg-card border border-border/60 hover:bg-muted text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    7-12am
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDailyStartTime('10:00')
                      setDailyEndTime('18:00')
                    }}
                    className="px-1.5 py-0.5 rounded bg-card border border-border/60 hover:bg-muted text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    10-6
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-0.5">
                <TimeCombobox
                  label="Start"
                  value={dailyStartTime}
                  onChange={setDailyStartTime}
                  options={TIME_OPTIONS}
                />
                <TimeCombobox
                  label="End"
                  value={dailyEndTime}
                  onChange={setDailyEndTime}
                  options={TIME_OPTIONS}
                />
              </div>
            </div>

            {/* Single Specific Break Time Form */}
            <div className="flex flex-col gap-1.5 p-3 rounded-none border border-border/80 bg-muted/20 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-foreground flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasBreak}
                    onChange={(e) => setHasBreak(e.target.checked)}
                    className="rounded border-border size-3.5 accent-primary cursor-pointer"
                  />
                  <span>Break Window</span>
                </label>
                {hasBreak && (
                  <button
                    type="button"
                    onClick={() => {
                      setBreakStartTime('21:30')
                      setBreakEndTime('22:00')
                    }}
                    className="px-1.5 py-0.5 rounded bg-card border border-border/60 hover:bg-muted text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    9:30pm-10pm
                  </button>
                )}
              </div>

              {hasBreak ? (
                <div className="grid grid-cols-2 gap-2 mt-0.5">
                  <TimeCombobox
                    label="Break Start"
                    value={breakStartTime}
                    onChange={setBreakStartTime}
                    options={TIME_OPTIONS}
                  />
                  <TimeCombobox
                    label="Break End"
                    value={breakEndTime}
                    onChange={setBreakEndTime}
                    options={TIME_OPTIONS}
                  />
                </div>
              ) : (
                <div className="py-2.5 text-center text-[11px] text-muted-foreground/60 italic border border-dashed border-border/40 rounded-none">
                  No daily break window configured (continuous slots).
                </div>
              )}
            </div>
          </div>

          {/* 4. Slot Duration & Buffer Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-muted-foreground">Slot Duration</span>
              <div className="flex items-center gap-1">
                {[15, 30, 45, 60].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setSlotDurationMinutes(dur)}
                    className={`flex-1 py-1 rounded-none text-xs font-semibold border transition-all cursor-pointer ${
                      slotDurationMinutes === dur
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-border/60 bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Buffer Between Slots
              </span>
              <div className="flex items-center gap-1">
                {[0, 5, 10, 15].map((buf) => (
                  <button
                    key={buf}
                    type="button"
                    onClick={() => setBufferMinutes(buf)}
                    className={`flex-1 py-1 rounded-none text-xs font-semibold border transition-all cursor-pointer ${
                      bufferMinutes === buf
                        ? 'border-sky-500 bg-sky-500/20 text-sky-400'
                        : 'border-border/60 bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {buf}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Meeting URL */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Meeting Room URL
            </span>
            <div className="relative">
              <InterviewIcons.Link className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id="meetingUrl"
                placeholder="https://meet.google.com/abc-defg-hij"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                required
                className="pl-8 h-8 rounded-none bg-card text-xs font-mono border-border"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2.5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between">
            <div className="text-xs text-muted-foreground text-center sm:text-left">
              {estimatedSlots > 0 ? (
                <span>
                  Will {effectiveMode === 'extend' ? 'add' : 'create'}{' '}
                  <strong className="text-foreground">{estimatedSlots}</strong> slots{' '}
                  {effectiveMode === 'extend'
                    ? <>to batch &ldquo;{groupName}&rdquo;</>
                    : <>under &ldquo;{groupName || 'Batch'}&rdquo;</>}
                </span>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !activeJobId}
                size="sm"
                className="flex-1 sm:flex-initial gap-1.5 bg-accent hover:bg-accent text-white text-xs h-8 px-4 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <InterviewIcons.Loader className="size-3 animate-spin" />
                    Generating...
                  </>
                ) : effectiveMode === 'extend' ? (
                  'Extend Batch'
                ) : (
                  'Generate Slots'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
