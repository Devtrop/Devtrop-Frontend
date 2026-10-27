'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { BlogStatus } from '@/types/blog'

interface BlogStatusBadgeProps {
  status: BlogStatus
  className?: string
}

export function BlogStatusBadge({ status, className }: BlogStatusBadgeProps) {
  const getBadgeConfig = (status: BlogStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return {
          label: 'Published',
          className:
            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        }
      case 'DRAFT':
        return {
          label: 'Draft',
          className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        }
      case 'ARCHIVED':
        return {
          label: 'Archived',
          className: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
        }
      default:
        return {
          label: status,
          className: 'bg-muted text-muted-foreground border-border',
        }
    }
  }

  const config = getBadgeConfig(status)

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] font-semibold px-2 py-0.5 rounded-full',
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  )
}
