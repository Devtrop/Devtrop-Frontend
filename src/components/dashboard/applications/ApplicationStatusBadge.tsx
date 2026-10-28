'use client'

import React from 'react'
import { ApplicationStatus } from './ApplicationsHub'

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus
}

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  const styles: Record<ApplicationStatus, string> = {
    APPLIED: 'bg-accent-soft/10 text-accent dark:text-accent ring-blue-500/20',
    SELECTED: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-violet-500/20',
    TASK_ASSIGNED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20',
    TASK_SUBMITTED: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-orange-500/20',
    INTERVIEW_SELECTED: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-violet-500/20',
    INTERVIEW_SCHEDULED: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-cyan-500/20',
    INTERVIEW_COMPLETED: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-indigo-500/20',
    OFFER_PENDING: 'bg-accent-soft text-accent dark:text-accent ring-accent',
    OFFER_SENT: 'bg-accent-soft/10 text-accent dark:text-accent ring-teal-500/20',
    DOCS_SUBMITTED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20',
    HIRED: 'bg-accent-soft text-accent dark:text-accent ring-accent',
    REJECTED: 'bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20',
    CLOSED: 'bg-zinc-500/10 text-muted dark:text-muted ring-zinc-500/20',
  }

  const labels: Record<ApplicationStatus, string> = {
    APPLIED: 'Applied',
    SELECTED: 'Selected',
    TASK_ASSIGNED: 'Task Assigned',
    TASK_SUBMITTED: 'Task Submitted',
    INTERVIEW_SELECTED: 'Interview Ready',
    INTERVIEW_SCHEDULED: 'Scheduled',
    INTERVIEW_COMPLETED: 'Completed',
    OFFER_PENDING: 'Offer Pending',
    OFFER_SENT: 'Offer Sent',
    DOCS_SUBMITTED: 'Docs Submitted',
    HIRED: 'Hired',
    REJECTED: 'Rejected',
    CLOSED: 'Closed',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
