'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface ComboboxOption {
  value: string
  label: string
  badge?: React.ReactNode
  disabled?: boolean
  description?: string
  keywords?: string[]
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  isLoading?: boolean
  className?: string
  triggerClassName?: string
  contentClassName?: string
  align?: 'start' | 'center' | 'end'
  renderTrigger?: (selectedOption: ComboboxOption | undefined, isOpen: boolean) => React.ReactNode
  renderOption?: (option: ComboboxOption, isSelected: boolean) => React.ReactNode
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  disabled = false,
  isLoading = false,
  className,
  triggerClassName,
  contentClassName,
  align = 'start',
  renderTrigger,
  renderOption,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === value)
  }, [options, value])

  const handleSelect = React.useCallback(
    (selectedValue: string) => {
      onValueChange(selectedValue)
      setOpen(false)
    },
    [onValueChange],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className={cn(
            'justify-between font-normal transition-colors text-left',
            !selectedOption && 'text-muted-foreground',
            triggerClassName,
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin shrink-0 text-muted-foreground" />
              <span className="truncate text-xs">Updating...</span>
            </div>
          ) : renderTrigger ? (
            renderTrigger(selectedOption, open)
          ) : (
            <span className="truncate flex items-center gap-1.5">
              {selectedOption?.badge || selectedOption?.label || placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        className={cn('w-auto min-w-[200px] p-0 shadow-lg', contentClassName, className)}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9 text-xs" />
          <CommandList className="max-h-[260px] overflow-y-auto">
            <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
              {emptyText}
            </CommandEmpty>
            <CommandGroup className="p-1">
              {options.map((option) => {
                const isSelected = option.value === value
                return (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.value} ${option.keywords?.join(' ') || ''}`}
                    disabled={option.disabled}
                    onSelect={() => handleSelect(option.value)}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm cursor-pointer select-none',
                      isSelected && 'bg-accent font-medium text-accent-foreground',
                    )}
                  >
                    <Check
                      className={cn(
                        'size-3.5 shrink-0 text-emerald-400',
                        isSelected ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {renderOption ? (
                      renderOption(option, isSelected)
                    ) : (
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate">
                          {option.badge || (
                            <span className="truncate text-foreground">{option.label}</span>
                          )}
                        </div>
                        {option.description && (
                          <span className="text-[10px] text-muted-foreground truncate">
                            {option.description}
                          </span>
                        )}
                      </div>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
