'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerTimeProps {
  value?: Date | undefined
  onChange?: (date: Date | undefined) => void
  disabled?: boolean
  className?: string
}

export function DatePickerTime({
  value,
  onChange,
  disabled = false,
  className,
}: DatePickerTimeProps = {}) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [time, setTime] = React.useState<string>(() => {
    if (value) {
      const hours = String(value.getHours()).padStart(2, '0')
      const minutes = String(value.getMinutes()).padStart(2, '0')
      const seconds = String(value.getSeconds()).padStart(2, '0')
      return `${hours}:${minutes}:${seconds}`
    }
    return '10:30:00'
  })

  React.useEffect(() => {
    if (value) {
      setDate(value)
      const hours = String(value.getHours()).padStart(2, '0')
      const minutes = String(value.getMinutes()).padStart(2, '0')
      const seconds = String(value.getSeconds()).padStart(2, '0')
      setTime(`${hours}:${minutes}:${seconds}`)
    } else {
      setDate(undefined)
    }
  }, [value])

  const updateDateTime = (newDate: Date | undefined, newTime: string) => {
    if (!newDate) {
      onChange?.(undefined)
      return
    }
    const [h = '10', m = '30', s = '00'] = newTime.split(':')
    const combined = new Date(newDate)
    combined.setHours(Number(h) || 0, Number(m) || 0, Number(s) || 0, 0)
    onChange?.(combined)
  }

  return (
    <FieldGroup className={cn('flex-row gap-3', className)}>
      <Field className="min-w-0 flex-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                id="date-picker-optional"
                disabled={disabled}
                className="w-full justify-between font-normal"
              >
                <span className="truncate">{date ? format(date, 'PPP') : 'Select date'}</span>
                <ChevronDownIcon data-icon="inline-end" />
              </Button>
            }
          />
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              defaultMonth={date}
              onSelect={(selectedDate) => {
                setDate(selectedDate)
                setOpen(false)
                updateDateTime(selectedDate, time)
              }}
            />
          </PopoverContent>
        </Popover>
      </Field>
      <Field className="w-32 shrink-0">
        <Input
          type="time"
          id="time-picker-optional"
          step="1"
          value={time}
          onChange={(e) => {
            const newTime = e.target.value
            setTime(newTime)
            if (date) {
              updateDateTime(date, newTime)
            }
          }}
          disabled={disabled}
          className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </Field>
    </FieldGroup>
  )
}
