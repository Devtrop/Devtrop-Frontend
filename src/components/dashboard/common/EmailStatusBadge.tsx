'use client'

import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { EmailLog } from '@/types/job'

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return 'Recently'
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return 'Recently'
  }
}

function getEmailTypeLabel(type?: string): string {
  switch (type) {
    case 'OFFER_AND_AGREEMENT':
      return 'Offer & Agreement Letter'
    case 'ORIENTATION_AND_CREDENTIALS':
      return 'Orientation Meeting & Login Credentials'
    case 'INTERVIEW_INVITATION':
      return 'Interview Booking Invitation'
    case 'INTERVIEW_CONFIRMATION':
      return 'Interview Slot Confirmation'
    case 'INTERVIEW_RESCHEDULED':
      return 'Interview Reschedule Notice'
    case 'OUTCOME_HIRED':
      return 'Hiring Outcome Notice'
    case 'OUTCOME_REJECTED':
      return 'Rejection Notice'
    case 'APPLICATION_RECEIVED':
      return 'Application Confirmation'
    case 'APPLICATION_SELECTED':
      return 'Application Shortlist Notice'
    default:
      return type ? type.replace(/_/g, ' ') : 'Email Notification'
  }
}

interface EmailStatusBadgeProps {
  logs?: EmailLog[]
  log?: EmailLog
  targetEmail?: string
  expectedType?: string
  pendingFallback?: boolean
}

export function EmailStatusBadge({
  logs = [],
  log,
  targetEmail,
  expectedType,
  pendingFallback = false,
}: EmailStatusBadgeProps) {
  const allLogs = log ? [log] : logs
  // Find log matching expectedType if provided, otherwise latest log
  const activeLog = expectedType ? allLogs.find((l) => l.type === expectedType) : allLogs[0]

  const status = activeLog?.status

  // 1. Sent
  if (status === 'SENT') {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 cursor-default select-none transition-colors">
              Sent
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="p-2.5 max-w-xs space-y-1 bg-zinc-950 border-zinc-800 text-zinc-100 shadow-xl rounded-lg text-xs"
          >
            <div className="font-semibold text-emerald-400">
              {getEmailTypeLabel(activeLog?.type || expectedType)}
            </div>
            {targetEmail && (
              <div className="text-[11px] text-zinc-400 font-mono">
                To: <span className="text-zinc-200">{targetEmail}</span>
              </div>
            )}
            <div className="text-[10px] text-zinc-500 font-mono">
              Sent {formatRelativeTime(activeLog?.sentAt || activeLog?.createdAt)}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // 2. Pending
  if (status === 'PENDING' || pendingFallback) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 cursor-default select-none transition-colors">
              Pending
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="p-2.5 max-w-xs space-y-1 bg-zinc-950 border-zinc-800 text-zinc-100 shadow-xl rounded-lg text-xs"
          >
            <div className="font-semibold text-amber-400">
              {getEmailTypeLabel(expectedType || activeLog?.type)} Pending
            </div>
            {targetEmail && (
              <div className="text-[11px] text-zinc-400 font-mono">
                To: <span className="text-zinc-200">{targetEmail}</span>
              </div>
            )}
            <div className="text-[11px] text-zinc-400">Scheduled or awaiting dispatch</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // 3. Failed
  if (status === 'FAILED') {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 cursor-default select-none transition-colors">
              Failed
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="p-2.5 max-w-xs space-y-1 bg-zinc-950 border-zinc-800 text-zinc-100 shadow-xl rounded-lg text-xs"
          >
            <div className="font-semibold text-rose-400">
              {getEmailTypeLabel(activeLog?.type || expectedType)} Delivery Failed
            </div>
            {targetEmail && (
              <div className="text-[11px] text-zinc-400 font-mono">
                To: <span className="text-zinc-200">{targetEmail}</span>
              </div>
            )}
            <div className="text-[10px] text-zinc-500 font-mono">
              Attempted {formatRelativeTime(activeLog?.createdAt)}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // 4. Not Sent / None
  return (
    <span
      className="text-xs text-muted-foreground/40 font-mono select-none"
      title="No email dispatched"
    >
      —
    </span>
  )
}
