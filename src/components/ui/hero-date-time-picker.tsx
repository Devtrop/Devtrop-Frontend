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

export interface HeroDateTimePickerProps {
  /** 'YYYY-MM-DD', 'YYYY-MM-DDTHH:mm', or '' */
  value?: string
  onChange?: (value: string) => void
  label?: string
  isRequired?: boolean
  minValue?: string // YYYY-MM-DD
  className?: string
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

export function formatTime24to12(time: string): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h)) return ''
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m ?? 0).padStart(2, '0')} ${period}`
}

// 15-minute interval options (00:00-23:45) + 23:59 for end of day
const TIME_OPTIONS = [
  ...Array.from({ length: 96 }, (_, i) => {
    const h = String(Math.floor(i / 4)).padStart(2, '0')
    const m = String((i % 4) * 15).padStart(2, '0')
    const value = `${h}:${m}`
    return { value, label: formatTime24to12(value) }
  }),
  { value: '23:59', label: '11:59 PM' },
]

function toCalendarDateString(d: CalendarDate): string {
  return `${d.year.toString().padStart(4, '0')}-${d.month.toString().padStart(2, '0')}-${d.day.toString().padStart(2, '0')}`
}

export function HeroDateTimePicker({
  value = '',
  onChange,
  label,
  isRequired = false,
  minValue,
  className,
  disabled = false,
}: HeroDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const tz = getLocalTimeZone()
  const currentToday = useMemo(() => today(tz), [tz])

  const datePart = value.slice(0, 10)
  const timePart = value.length > 10 ? value.slice(11, 16) : ''

  const parsedValue = useMemo<CalendarDate | null>(() => {
    if (!datePart) return null
    try {
      return parseDate(datePart)
    } catch {
      return null
    }
  }, [datePart])

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

  const [viewYear, setViewYear] = useState(parsedValue ? parsedValue.year : currentToday.year)
  const [viewMonth, setViewMonth] = useState(parsedValue ? parsedValue.month : currentToday.month)

  useEffect(() => {
    if (parsedValue) {
      setViewYear(parsedValue.year)
      setViewMonth(parsedValue.month)
    }
  }, [parsedValue])

  const selectedTimeRef = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    if (isOpen && timePart) {
      const t = setTimeout(() => {
        selectedTimeRef.current?.scrollIntoView({ block: 'nearest' })
      }, 60)
      return () => clearTimeout(t)
    }
  }, [isOpen, timePart])

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

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth - 1, 1).getDay()
    const daysInCurrentMonth = new Date(viewYear, viewMonth, 0).getDate()
    const daysInPrevMonth = new Date(viewYear, viewMonth - 1, 0).getDate()

    const days: Array<{
      day: number
      isCurrentMonth: boolean
      dateObj: CalendarDate
    }> = []

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const m = viewMonth === 1 ? 12 : viewMonth - 1
      const y = viewMonth === 1 ? viewYear - 1 : viewYear
      days.push({ day: d, isCurrentMonth: false, dateObj: new CalendarDate(y, m, d) })
    }

    for (let d = 1; d <= daysInCurrentMonth; d++) {
      days.push({
        day: d,
        isCurrentMonth: true,
        dateObj: new CalendarDate(viewYear, viewMonth, d),
      })
    }

    const remaining = (7 - (days.length % 7)) % 7
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 12 ? 1 : viewMonth + 1
      const y = viewMonth === 12 ? viewYear + 1 : viewYear
      days.push({ day: d, isCurrentMonth: false, dateObj: new CalendarDate(y, m, d) })
    }

    return days
  }, [viewYear, viewMonth])

  const emit = (dateStr: string, time: string) => {
    onChange?.(time ? `${dateStr}T${time}` : dateStr)
  }

  const handleSelectDate = (d: CalendarDate) => {
    emit(toCalendarDateString(d), timePart)
  }

  const handleSelectTime = (time: string) => {
    const dateStr = datePart || toCalendarDateString(currentToday)
    emit(dateStr, time)
    setIsOpen(false)
  }

  const displayText = useMemo(() => {
    if (!parsedValue) {
      return timePart ? formatTime24to12(timePart) : null
    }
    const dateLabel = new Date(`${datePart}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return timePart ? `${dateLabel} at ${formatTime24to12(timePart)}` : dateLabel
  }, [parsedValue, datePart, timePart])

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
              'border-border/80 hover:border-border focus-visible:border-primary',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <span
              className={cn(
                'truncate font-medium',
                displayText ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {displayText || 'Select date & time'}
            </span>
            <div className="text-muted-foreground hover:text-foreground transition pl-2">
              <CalendarIcon className="size-4 opacity-70" />
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-auto p-0 rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl backdrop-blur-xl flex overflow-hidden"
        >
          {/* Calendar column */}
          <div className="p-3.5 w-72">
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

            <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground py-2">
              {DAY_NAMES.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

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
          </div>

          {/* Time column */}
          <div className="w-28 border-l border-border/40 flex flex-col">
            <div className="px-3 py-2 text-[11px] font-semibold text-muted-foreground border-b border-border/40">
              Time
            </div>
            <div className="overflow-y-auto scrollbar-slim py-1 max-h-[272px]">
              {TIME_OPTIONS.map((opt) => {
                const isSelected = opt.value === timePart
                
                let isTimeDisabled = false
                const [h, m] = opt.value.split(':').map(Number)
                const now = new Date()
                
                if (parsedValue) {
                  if (isSameDay(parsedValue, currentToday)) {
                    if (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes())) {
                      isTimeDisabled = true
                    }
                  } else if (parsedValue.compare(currentToday) < 0) {
                    isTimeDisabled = true
                  }
                } else {
                  if (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes())) {
                    isTimeDisabled = true
                  }
                }

                return (
                  <button
                    key={opt.value}
                    ref={isSelected ? selectedTimeRef : undefined}
                    type="button"
                    onClick={() => !isTimeDisabled && handleSelectTime(opt.value)}
                    disabled={isTimeDisabled}
                    className={cn(
                      'w-full text-left px-3 py-1.5 text-[11px] font-medium transition',
                      isTimeDisabled
                        ? 'opacity-40 cursor-not-allowed'
                        : 'cursor-pointer',
                      !isTimeDisabled && isSelected
                        ? 'bg-[#006fee] text-white font-bold'
                        : !isTimeDisabled && 'text-foreground hover:bg-muted/60',
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
