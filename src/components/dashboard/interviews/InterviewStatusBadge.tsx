'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { SCHEDULE_STATUS_CONFIG } from './constants'
import { InterviewScheduleStatus } from './types'

interface BadgeProps {
  status: InterviewScheduleStatus
}

export function InterviewStatusBadge({ status }: BadgeProps) {
  const config = SCHEDULE_STATUS_CONFIG[status] || {
    label: status,
    color: 'text-muted-foreground border-border bg-muted/20',
    dot: 'bg-muted-foreground',
  }

  return (
    <Badge
      variant="outline"
      className={`text-[11px] font-medium gap-1.5 px-2 py-0.5 rounded-full ${config.color}`}
    >
      <span className={`size-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </Badge>
  )
}
