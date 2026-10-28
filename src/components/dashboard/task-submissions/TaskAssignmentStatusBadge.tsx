'use client'

import React from 'react'
import type { TaskAssignmentStatus } from '@/types/job'

interface TaskAssignmentStatusBadgeProps {
  status: TaskAssignmentStatus
}

export function TaskAssignmentStatusBadge({ status }: TaskAssignmentStatusBadgeProps) {
  const styles: Record<TaskAssignmentStatus, string> = {
    SENT: 'bg-accent-soft/10 text-accent dark:text-accent ring-blue-500/20',
    SUBMITTED: 'bg-accent-soft text-accent dark:text-accent ring-accent',
    EXPIRED: 'bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20',
  }

  const labels: Record<TaskAssignmentStatus, string> = {
    SENT: 'Sent',
    SUBMITTED: 'Submitted',
    EXPIRED: 'Expired',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
