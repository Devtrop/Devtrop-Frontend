'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function SupportBadge({ text, featured }: { text: ReactNode; featured: boolean }) {
  return (
    <span
      className={cn(
        'shrink-0 inline-block bg-accent px-2.5 py-1',
        'text-[10px] font-black uppercase tracking-[0.1em] leading-tight text-inverse',
        'animate-support-badge',
        featured && 'ring-1 ring-white/20',
      )}
    >
      {text}
    </span>
  )
}
