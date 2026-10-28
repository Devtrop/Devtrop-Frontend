'use client'

import * as React from 'react'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DateTimePickerProps {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  disabled?: boolean
  minDate?: Date
  placeholder?: string
  className?: string
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toTimeInputValue(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  minDate,
  placeholder = 'Pick a date and time',
  className,
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [time, setTime] = React.useState<string>(value ? toTimeInputValue(value) : '00:00')
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (value) {
      setDate(value)
      setTime(toTimeInputValue(value))
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined)
      onChange(undefined)
      return
    }

    const [hours, minutes] = time.split(':').map(Number)
    selectedDate.setHours(hours, minutes, 0, 0)
    setDate(selectedDate)
    onChange(selectedDate)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)

    if (date) {
      const [hours, minutes] = newTime.split(':').map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours, minutes, 0, 0)
      setDate(newDate)
      onChange(newDate)
    }
  }

  const handleClear = () => {
    setDate(undefined)
    setTime('00:00')
    onChange(undefined)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatDateTime(date) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          {/* Date Input */}
          <div className="space-y-2">
            <Label className="text-xs">Date</Label>
            <Input
              type="date"
              value={date ? toDateInputValue(date) : ''}
              min={minDate ? toDateInputValue(minDate) : undefined}
              onChange={(e) => {
                const selectedDate = e.target.value ? new Date(e.target.value) : undefined
                handleDateSelect(selectedDate)
              }}
              className="w-full"
            />
          </div>

          {/* Time Input */}
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Time
            </Label>
            <Input
              type="time"
              value={time}
              onChange={handleTimeChange}
              disabled={!date}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={handleClear} className="flex-1">
              Clear
            </Button>
            <Button size="sm" onClick={() => setIsOpen(false)} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
