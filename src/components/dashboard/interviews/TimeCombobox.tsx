'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { InterviewIcons } from './interview-icons'

export interface TimeOption {
  value: string
  label: string
}

interface TimeComboboxProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: TimeOption[]
  className?: string
}

/** Format 24-hour time ("HH:mm") into 12-hour format ("hh:mm AM/PM"). */
export function formatTime24to12(timeStr: string): string {
  if (!timeStr) return ''
  const parts = timeStr.split(':')
  if (parts.length < 2) return timeStr
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (isNaN(h) || isNaN(m)) return timeStr
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`
}

/** Parse user input into normalized 24-hour time and 12-hour label. */
export function parseCustomTime(input: string): { value: string; label: string } | null {
  const trimmed = input.trim().toLowerCase()
  if (!trimmed) return null

  // 1. 12-hour format with AM/PM: e.g. "9pm", "9:30pm", "9:30 pm", "09:00 am", "11 pm"
  const match12 = trimmed.match(/^([0-1]?[0-9])(?::([0-5][0-9]))?\s*([ap]\.?m?\.?)$/)
  if (match12) {
    let h = parseInt(match12[1], 10)
    const m = match12[2] ? parseInt(match12[2], 10) : 0
    const isPm = match12[3].startsWith('p')

    if (h >= 1 && h <= 12 && m >= 0 && m <= 59) {
      if (h === 12) {
        h = isPm ? 12 : 0
      } else if (isPm) {
        h += 12
      }
      const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      return { value: val, label: formatTime24to12(val) }
    }
  }

  // 2. 24-hour format: e.g. "09:00", "21:30", "23:59", "8:15"
  const match24 = trimmed.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/)
  if (match24) {
    const h = parseInt(match24[1], 10)
    const m = parseInt(match24[2], 10)
    const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    return { value: val, label: formatTime24to12(val) }
  }

  // 3. Compact 3 or 4 digits: e.g. "930" -> "09:30", "2130" -> "21:30"
  const matchDigits = trimmed.match(/^([0-9]{3,4})$/)
  if (matchDigits) {
    const str = matchDigits[1]
    const h = parseInt(str.length === 3 ? str.slice(0, 1) : str.slice(0, 2), 10)
    const m = parseInt(str.slice(-2), 10)
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      return { value: val, label: formatTime24to12(val) }
    }
  }

  // 4. Single or double digit hour alone: e.g. "9", "21"
  const matchHour = trimmed.match(/^([0-1]?[0-9]|2[0-3])$/)
  if (matchHour) {
    const h = parseInt(matchHour[1], 10)
    const val = `${String(h).padStart(2, '0')}:00`
    return { value: val, label: formatTime24to12(val) }
  }

  return null
}

export function TimeCombobox({ label, value, onChange, options, className }: TimeComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const selectedRef = useRef<HTMLButtonElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const selectedOption = options.find((opt) => opt.value === value)
  const displayLabel = selectedOption?.label || formatTime24to12(value) || value || 'Select time'

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return options

    return options.filter((opt) => {
      const labelMatch = opt.label.toLowerCase().includes(q)
      const valueMatch = opt.value.toLowerCase().includes(q)
      const strippedNumber = q.replace(/[^0-9]/g, '')
      const numberMatch =
        strippedNumber && (opt.label.includes(strippedNumber) || opt.value.includes(strippedNumber))

      return labelMatch || valueMatch || Boolean(numberMatch)
    })
  }, [options, search])

  const customParsed = useMemo(() => parseCustomTime(search), [search])
  const showCustomOption = useMemo(() => {
    if (!customParsed) return false
    return !filteredOptions.some((opt) => opt.value === customParsed.value)
  }, [customParsed, filteredOptions])

  // Auto-scroll to selected option when dropdown opens
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        selectedRef.current?.scrollIntoView({ block: 'nearest' })
      }, 60)
      return () => clearTimeout(t)
    }
  }, [open])

  // Attach native non-passive stopPropagation to prevent parent Dialog scroll locks from blocking scroll
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el || !open) return

    const stopScroll = (e: Event) => {
      e.stopPropagation()
    }

    el.addEventListener('wheel', stopScroll, { passive: true })
    el.addEventListener('touchmove', stopScroll, { passive: true })

    return () => {
      el.removeEventListener('wheel', stopScroll)
      el.removeEventListener('touchmove', stopScroll)
    }
  }, [open])

  const handleSelect = (timeVal: string) => {
    onChange(timeVal)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover
      modal={true}
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) setSearch('')
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className={`h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-mono justify-between cursor-pointer hover:bg-muted/40 w-full ${className || ''}`}
        >
          <span className="truncate">
            {label}: {displayLabel}
          </span>
          <InterviewIcons.ChevronDown className="size-3 text-muted-foreground opacity-60 shrink-0 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="w-56 p-1.5 rounded-xl shadow-xl border-border bg-popover text-popover-foreground z-50 pointer-events-auto"
      >
        <div className="relative mb-1.5">
          <InterviewIcons.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (showCustomOption && customParsed) {
                  handleSelect(customParsed.value)
                } else if (filteredOptions.length > 0) {
                  handleSelect(filteredOptions[0].value)
                }
              }
            }}
            placeholder="Search or type time (e.g. 9pm)..."
            className="h-7 pl-7 pr-2 text-xs font-mono rounded-lg bg-card/60 border-border"
            autoFocus
          />
        </div>

        <div
          ref={scrollContainerRef}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="max-h-56 overflow-y-auto space-y-0.5 overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
        >
          {showCustomOption && customParsed && (
            <button
              type="button"
              onClick={() => handleSelect(customParsed.value)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono text-left bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer border border-emerald-500/20 mb-1"
            >
              <div className="flex items-center gap-1.5 truncate">
                <InterviewIcons.Plus className="size-3 text-emerald-400 shrink-0" />
                <span className="truncate">
                  Set: <strong>{customParsed.label}</strong>
                </span>
              </div>
              <span className="text-[10px] opacity-70 ml-1 shrink-0 font-mono">
                ({customParsed.value})
              </span>
            </button>
          )}

          {filteredOptions.length === 0 && !showCustomOption ? (
            <div className="py-3 text-center text-xs text-muted-foreground font-sans">
              No matching time
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  ref={isSelected ? selectedRef : null}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary/15 text-primary font-medium'
                      : 'hover:bg-muted/70 text-foreground'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <InterviewIcons.Check className="size-3 text-primary shrink-0 ml-2" />
                  )}
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
