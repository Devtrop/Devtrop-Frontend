'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  /** Six single-character slots, e.g. ['1', '2', '', '', '', '']. */
  value: string[]
  onChange: (next: string[]) => void
  /** Accessible group label — supplied by the content layer. */
  label: string
  disabled?: boolean
  hasError?: boolean
}

const OTP_LENGTH = 6

/**
 * Six-slot verification code input.
 *
 * Keyboard contract: auto-advance on entry, Backspace clears and steps back,
 * Arrow keys move between slots, and paste distributes digits from the
 * focused slot onward.
 */
export function OtpInput({ value, onChange, label, disabled = false, hasError = false }: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const focusSlot = (index: number) => {
    const target = Math.min(Math.max(index, 0), OTP_LENGTH - 1)
    inputRefs.current[target]?.focus()
    inputRefs.current[target]?.select()
  }

  const writeDigits = (startIndex: number, digits: string) => {
    const next = [...value]
    for (let offset = 0; offset < digits.length && startIndex + offset < OTP_LENGTH; offset += 1) {
      next[startIndex + offset] = digits[offset]
    }
    onChange(next)
    focusSlot(startIndex + digits.length)
  }

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '')

    if (!digits) {
      const next = [...value]
      next[index] = ''
      onChange(next)
      return
    }

    // Autofill or paste landing inside a single slot.
    if (digits.length > 1) {
      writeDigits(index, digits)
      return
    }

    const next = [...value]
    next[index] = digits
    onChange(next)
    if (index < OTP_LENGTH - 1) focusSlot(index + 1)
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (value[index]) return // let the browser clear the current slot
      event.preventDefault()
      if (index > 0) {
        const next = [...value]
        next[index - 1] = ''
        onChange(next)
        focusSlot(index - 1)
      }
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusSlot(index - 1)
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusSlot(index + 1)
    }

    if (event.key === 'Home') {
      event.preventDefault()
      focusSlot(0)
    }

    if (event.key === 'End') {
      event.preventDefault()
      focusSlot(OTP_LENGTH - 1)
    }
  }

  const handlePaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!digits) return
    event.preventDefault()
    writeDigits(index, digits)
  }

  return (
    <div role="group" aria-label={label} className="flex items-center gap-2 sm:gap-3">
      {Array.from({ length: OTP_LENGTH }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`${label} — digit ${index + 1} of ${OTP_LENGTH}`}
          aria-invalid={hasError || undefined}
          disabled={disabled}
          value={value[index] ?? ''}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          className={cn(
            'h-12 w-full min-w-0 border-2 border-display bg-canvas text-center font-mono text-lg font-bold text-display caret-accent outline-none transition-colors duration-150 sm:h-14',
            'focus:border-accent focus:ring-2 focus:ring-accent/25',
            'disabled:cursor-not-allowed disabled:opacity-60',
            hasError && 'border-accent',
          )}
        />
      ))}
    </div>
  )
}
