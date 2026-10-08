'use client'

import { openBooking } from '@/lib/booking'

export function BookDiscoveryCallButton() {
  return (
    <button
      onClick={() => openBooking()}
      className="inline-flex items-center bg-accent px-8 py-4 text-sm font-bold uppercase tracking-wider text-inverse hover:bg-accent-hover transition-all duration-150 cursor-pointer touch-manipulation active:scale-95 active:translate-y-0.5 md:active:scale-100 md:active:translate-y-0"
    >
      Book a Discovery Call
    </button>
  )
}
