'use client'

import * as React from 'react'
import { useState, useRef, useEffect, useMemo } from 'react'
import {
  parseDate,
  today,
  getLocalTimeZone,
  CalendarDate,
  isSameDay,
} from '@internationalized/date'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

export interface HeroDatePickerProps {
  value?: string // YYYY-MM-DD
  onChange?: (dateString: string) => void
  label?: string
  isRequired?: boolean
  minValue?: string // YYYY-MM-DD
  name?: string
  className?: string
  placeholder?: string
  disabled?: boolean
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function HeroDatePicker({
  value,
  onChange,
  label,
  isRequired = false,
  minValue,
  name,
  className,
  placeholder = 'mm / dd / yyyy',
  disabled = false,
}: HeroDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const tz = getLocalTimeZone()
  const currentToday = useMemo(() => today(tz), [tz])

  // Parse current value
  const parsedValue = useMemo<CalendarDate | null>(() => {
    if (!value) return null
    try {
      return parseDate(value)
    } catch {
      return null
    }
  }, [value])

  // Parse min date
  const parsedMinValue = useMemo<CalendarDate>(() => {
    if (minValue) {
      try {
        return parseDate(minValue)
      } catch {
        // fallback
      }
    }
    return currentToday
  }, [minValue, currentToday])

  // Navigated month & year in calendar popover
  const [viewYear, setViewYear] = useState(parsedValue ? parsedValue.year : currentToday.year)
  const [viewMonth, setViewMonth] = useState(parsedValue ? parsedValue.month : currentToday.month)

  // Validation
  const isInvalid = useMemo(() => {
    if (!parsedValue) return false
    return parsedValue.compare(parsedMinValue) < 0
  }, [parsedValue, parsedMinValue])

  // Sync view when value changes
  useEffect(() => {
    if (parsedValue) {
      setViewYear(parsedValue.year)
      setViewMonth(parsedValue.month)
    }
  }, [parsedValue])

  // Month navigation
  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (viewMonth === 1) {
      setViewMonth(12)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (viewMonth === 12) {
      setViewMonth(1)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  // Generate calendar days matrix
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth - 1, 1).getDay()
    const daysInCurrentMonth = new Date(viewYear, viewMonth, 0).getDate()
    const daysInPrevMonth = new Date(viewYear, viewMonth - 1, 0).getDate()

    const days: Array<{
      day: number
      month: number
      year: number
      isCurrentMonth: boolean
      dateObj: CalendarDate
    }> = []

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const m = viewMonth === 1 ? 12 : viewMonth - 1
      const y = viewMonth === 1 ? viewYear - 1 : viewYear
      days.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        dateObj: new CalendarDate(y, m, d),
      })
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      days.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        dateObj: new CalendarDate(viewYear, viewMonth, d),
      })
    }

    // Next month filler days to complete grid (multiples of 7)
    const remaining = (7 - (days.length % 7)) % 7
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 12 ? 1 : viewMonth + 1
      const y = viewMonth === 12 ? viewYear + 1 : viewYear
      days.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        dateObj: new CalendarDate(y, m, d),
      })
    }

    return days
  }, [viewYear, viewMonth])

  const handleSelectDate = (d: CalendarDate) => {
    const str = `${d.year.toString().padStart(4, '0')}-${d.month.toString().padStart(2, '0')}-${d.day.toString().padStart(2, '0')}`
    onChange?.(str)
    setIsOpen(false)
  }

  // Display segments (mm / dd / yyyy)
  const displaySegments = useMemo(() => {
    if (!parsedValue) {
      return { month: 'mm', day: 'dd', year: 'yyyy' }
    }
    return {
      month: parsedValue.month.toString().padStart(2, '0'),
      day: parsedValue.day.toString().padStart(2, '0'),
      year: parsedValue.year.toString(),
    }
  }, [parsedValue])

  return (
    <div className={cn('flex flex-col gap-1 w-full', className)}>
      {label && (
        <label className="text-xs font-semibold text-foreground flex items-center gap-1">
          <span>{label}</span>
          {isRequired && <span className="text-destructive font-bold">*</span>}
        </label>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <div
            role="button"
            tabIndex={0}
            className={cn(
              'flex items-center justify-between h-9 px-3 rounded-xl border bg-card/60 transition cursor-pointer text-xs select-none',
              isInvalid
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-border/80 hover:border-border focus-visible:border-primary',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            {/* Segmented Date Input */}
            <div className="flex items-center gap-1 font-mono tracking-wider">
              <span
                className={cn(
                  'px-1 py-0.5 rounded',
                  parsedValue ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {displaySegments.month}
              </span>
              <span className="text-muted-foreground/60">/</span>
              <span
                className={cn(
                  'px-1 py-0.5 rounded',
                  parsedValue ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {displaySegments.day}
              </span>
              <span className="text-muted-foreground/60">/</span>
              <span
                className={cn(
                  'px-1 py-0.5 rounded',
                  parsedValue ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {displaySegments.year}
              </span>
            </div>

            {/* Calendar Suffix Indicator */}
            <div className="text-muted-foreground hover:text-foreground transition pl-2">
              <CalendarIcon className="size-4 opacity-70" />
            </div>
          </div>
        </PopoverTrigger>

        {/* Validation Field Error */}
        {isInvalid && (
          <span className="text-[11px] text-destructive font-medium mt-0.5 animate-fadeIn">
            Date must be today or in the future.
          </span>
        )}

        {/* HeroUI Popover Calendar Card */}
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-72 p-3.5 rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl backdrop-blur-xl"
        >
          {/* Header with Year/Month Trigger and Navigation */}
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <div className="flex items-center gap-1 text-xs font-bold text-foreground">
              <span>{MONTH_NAMES[viewMonth - 1]}</span>
              <span>{viewYear}</span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous month"
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground py-2">
            {DAY_NAMES.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Day Cells Matrix */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {calendarDays.map((item, idx) => {
              const isSelected = parsedValue ? isSameDay(item.dateObj, parsedValue) : false
              const isPast = item.dateObj.compare(parsedMinValue) < 0

              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectDate(item.dateObj)}
                  className={cn(
                    'size-8 rounded-full flex items-center justify-center transition cursor-pointer font-medium',
                    isSelected
                      ? 'bg-[#006fee] text-white font-bold shadow-md shadow-sky-500/30'
                      : !item.isCurrentMonth
                        ? 'text-muted-foreground/30 hover:bg-muted/30'
                        : isPast
                          ? 'text-muted-foreground/50 hover:bg-muted/40'
                          : 'text-foreground hover:bg-muted/60',
                  )}
                >
                  {item.day}
                </button>
              )
            })}
          </div>

          {/* Quick Presets */}
          <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => handleSelectDate(currentToday)}
              className="text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleSelectDate(currentToday.add({ days: 1 }))}
              className="text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleSelectDate(currentToday.add({ days: 7 }))}
              className="text-primary font-semibold hover:underline transition cursor-pointer"
            >
              Next Week
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
