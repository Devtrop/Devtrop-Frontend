'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TableCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useInterviewContext } from '@/contexts/InterviewContext'
import { downloadDocument } from '@/lib/applications'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { APPLICATION_STATUS_OPTIONS, getAvailableStatusTransitions } from './constants'
import { InterviewCommunicationBadge } from './InterviewCommunicationBadge'
import { InterviewIcons } from './interview-icons'
import { Interview } from './types'

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function PortfolioIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function formatUrl(url?: string | null): string | null {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  return `https://${url}`
}

interface RowProps {
  item: Interview
  serialNumber?: number
  isSelected?: boolean
  onToggleSelect?: (id: string) => void
  onOpenFeedback?: (interview: Interview) => void
  onRescheduleInterview?: (interview: Interview) => void
  onUpdateApplicationStatus?: (applicationId: string, status: string) => Promise<boolean | void>
}

export function InterviewTableRow(props: RowProps) {
  const context = useInterviewContext()
  const { item, serialNumber } = props

  const isSelected = props.isSelected ?? context.selectedIds.includes(item.id)
  const onToggleSelect = props.onToggleSelect ?? context.toggleSelect
  const onOpenFeedback = props.onOpenFeedback ?? ((target) => context.openModal('FEEDBACK', target))
  const onRescheduleInterview =
    props.onRescheduleInterview ?? ((target) => context.openModal('RESCHEDULE', target))
  const onUpdateApplicationStatus =
    props.onUpdateApplicationStatus ?? context.updateApplicationStatus
  const openDrawer = context.openDrawer
  const deleteInterview = context.deleteInterview
  const sendInvitations = context.sendInvitations
  const sendOutcomes = context.sendOutcomes

  const [updating, setUpdating] = useState(false)

  const applicant = item.application?.applicant as (typeof item.application.applicant & {
    linkedin?: string | null
    github?: string | null
    portfolio?: string | null
  })
  const job = item.application?.job
  const targetAppId = item.application?.id || item.applicationId
  const rawAppStatus = item.application?.status || 'APPLIED'

  // If candidate has a booked slot or confirmed interview, stage is at least INTERVIEW_SCHEDULED
  const appStatus =
    (item.status === 'SCHEDULED' || Boolean(item.slot)) &&
    (rawAppStatus === 'INTERVIEW_SELECTED' || rawAppStatus === 'SELECTED')
      ? 'INTERVIEW_SCHEDULED'
      : rawAppStatus

  const statusConfig = APPLICATION_STATUS_OPTIONS.find((s) => s.value === appStatus) || {
    value: appStatus,
    label: appStatus,
    color: 'text-muted-foreground border-border bg-muted/20',
    dotColor: 'bg-muted-foreground',
  }

  const availableTransitions = getAvailableStatusTransitions(appStatus)

  const handleStatusChange = async (newStatus: string) => {
    if (!targetAppId || !onUpdateApplicationStatus) return
    setUpdating(true)
    try {
      await onUpdateApplicationStatus(targetAppId, newStatus)
    } finally {
      setUpdating(false)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'AP'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const isBooked =
    Boolean(item.slot) ||
    item.status === 'SCHEDULED' ||
    item.status === 'COMPLETED' ||
    appStatus === 'INTERVIEW_COMPLETED' ||
    appStatus === 'OFFER_PENDING' ||
    appStatus === 'REJECTED'

  const isTerminal =
    appStatus === 'OFFER_PENDING' ||
    appStatus === 'REJECTED' ||
    appStatus === 'INTERVIEW_COMPLETED' ||
    item.status === 'COMPLETED'

  const avgScore = item.feedback
    ? ((item.feedback.technicalSkill + item.feedback.communication) / 2).toFixed(1)
    : null

  return (
    <TableRow
      data-state={isSelected ? 'selected' : undefined}
      onClick={() => openDrawer(item)}
      className="group hover:bg-muted/40 transition-colors cursor-pointer border-b border-border/60"
    >
      {/* 0. Select Checkbox */}
      <TableCell className="w-8 py-3 pl-3 pr-1 text-center" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(item.id)}
          aria-label={`Select ${applicant?.name}`}
          className="shrink-0 cursor-pointer"
        />
      </TableCell>

      {/* 0.1 SL */}
      <TableCell className="w-10 py-3 px-1 text-center font-mono text-[11px] font-semibold text-muted-foreground">
        {serialNumber ?? '-'}
      </TableCell>

      {/* 1. Candidate */}
      <TableCell className="py-3 px-3 min-w-[200px]">
        <div className="flex items-center gap-2.5">
          <div
            onClick={() => openDrawer(item)}
            className="size-8 rounded-none bg-primary/10 border border-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
          >
            {getInitials(applicant?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <span
              onClick={() => openDrawer(item)}
              className="font-semibold text-foreground truncate block text-xs hover:text-primary transition-colors cursor-pointer"
              title={applicant?.email}
            >
              {applicant?.name || 'Applicant'}
            </span>
            <span className="text-[11px] text-muted-foreground truncate block font-medium">
              {job?.title || 'Open Position'}
            </span>
          </div>
        </div>
      </TableCell>

      {/* 2. Stage (Clean Equal-Width Pill Dropdown) */}
      <TableCell className="py-3 px-3 min-w-[180px]" onClick={(e) => e.stopPropagation()}>
        {availableTransitions.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={updating}
                className={`inline-flex items-center justify-between w-[165px] min-w-[155px] px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer hover:opacity-85 whitespace-nowrap ${statusConfig.color}`}
              >
                {updating ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <InterviewIcons.Loader className="size-3 animate-spin text-muted-foreground shrink-0" />
                    <span className="truncate">{statusConfig.label}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`size-1.5 rounded-full ${statusConfig.dotColor || 'bg-muted-foreground'} shrink-0`}
                      />
                      <span className="truncate">{statusConfig.label}</span>
                    </div>
                    <InterviewIcons.ChevronDown className="size-3 opacity-60 shrink-0 ml-1" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 text-xs rounded-none">
              {availableTransitions.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className="cursor-pointer gap-2 my-0.5 rounded-none text-xs font-medium"
                >
                  <span
                    className={`size-1.5 rounded-full ${opt.dotColor || 'bg-muted-foreground'} shrink-0`}
                  />
                  <span className="truncate">{opt.label}</span>
                  {appStatus === opt.value && (
                    <InterviewIcons.Check className="size-3 ml-auto text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div
            className={`inline-flex items-center justify-between w-[165px] min-w-[155px] px-3 py-1 rounded-full text-xs font-medium border select-none whitespace-nowrap ${statusConfig.color}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`size-1.5 rounded-full ${statusConfig.dotColor || 'bg-muted-foreground'} shrink-0`}
              />
              <span className="truncate">{statusConfig.label}</span>
            </div>
            <span className="size-3 shrink-0 ml-1 opacity-0 pointer-events-none" />
          </div>
        )}
      </TableCell>

      {/* 3. Notice (Dedicated Email/Dispatch status) */}
      <TableCell className="py-3 px-3 min-w-[110px]" onClick={(e) => e.stopPropagation()}>
        <InterviewCommunicationBadge item={item} />
      </TableCell>

      {/* 4. Schedule */}
      <TableCell className="py-3 px-3 min-w-[150px]">
        {item.slot ? (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground text-xs whitespace-nowrap">
                    {new Date(item.slot.startTime).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                    ,{' '}
                    {new Date(item.slot.startTime).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                  {item.slot.meetingUrl && (
                    <a
                      href={item.slot.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-none text-primary hover:bg-primary/10 transition-colors shrink-0"
                      title="Open Google Meet"
                    >
                      <InterviewIcons.Video className="size-3.5" />
                    </a>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="p-2.5 max-w-xs bg-canvas border-hairline-light text-muted rounded-none text-xs space-y-0.5"
              >
                <div className="font-semibold text-muted">Interview Session</div>
                <div className="text-[11px] text-muted font-mono">
                  {new Date(item.slot.startTime).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  ·{' '}
                  {new Date(item.slot.startTime).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}{' '}
                  –{' '}
                  {new Date(item.slot.endTime).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : isTerminal ? (
          <span className="text-xs text-muted-foreground/50 font-mono select-none">—</span>
        ) : (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center gap-1 text-muted-foreground/70 hover:text-amber-400 transition-colors cursor-default">
                  <InterviewIcons.Hourglass className="size-3.5 text-amber-500/80 shrink-0" />
                  <span className="sr-only">Pending Booking</span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="p-2 text-xs bg-canvas border-hairline-light text-muted"
              >
                Pending Booking
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </TableCell>

      {/* 5. Action (Score + Hover Micro-actions with guaranteed spacing) */}
      <TableCell
        className="py-3 px-2 w-[140px] min-w-[130px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1.5 w-full">
          <div className="flex-1 flex items-center justify-center">
          {/* Review Score Pill or Star button */}
          {item.feedback ? (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onOpenFeedback(item)}
                    className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors cursor-pointer"
                  >
                    <span>{avgScore}/5</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="p-2.5 max-w-xs bg-canvas border-hairline-light text-muted rounded-none text-xs space-y-0.5 text-left"
                >
                  <div className="font-semibold text-amber-400">Evaluation: {avgScore}/5</div>
                  <div className="text-[11px] text-muted">
                    Tech: {item.feedback.technicalSkill}/5 · Comm: {item.feedback.communication}/5
                  </div>
                  {item.feedback.comments && (
                    <div className="text-[10px] text-muted italic pt-0.5">
                      &quot;{item.feedback.comments}&quot;
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : isBooked ? (
            <button
              type="button"
              onClick={() => onOpenFeedback(item)}
              className="p-1 rounded-none text-muted-foreground/60 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
              title="Score candidate"
            >
              <InterviewIcons.Star className="size-4" />
            </button>
          ) : (
            <span className="text-xs text-muted-foreground/40 font-mono select-none">—</span>
          )}

        </div>

          {/* Hover Micro Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">


            {/* Reschedule Button */}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onRescheduleInterview(item)}
              className="h-7 w-7 rounded-none text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
              title="Reschedule interview"
            >
              <InterviewIcons.Calendar className="size-3.5" />
            </Button>

            {/* View Details Button */}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => openDrawer(item)}
              className="h-7 w-7 rounded-none text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
              title="View Details"
            >
              <InterviewIcons.Eye className="size-3.5" />
            </Button>

            {/* Send Invitation Button */}
            {(appStatus === 'INTERVIEW_SELECTED' ||
              appStatus === 'SELECTED' ||
              item.status === 'PENDING_BOOKING') &&
              !item.slot &&
              job?.id &&
              targetAppId && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => sendInvitations(job.id, [targetAppId])}
                  className="h-7 w-7 rounded-none text-accent/70 hover:text-accent hover:bg-accent-soft cursor-pointer shrink-0"
                  title={item.token ? 'Resend Invitation' : 'Send Invitation'}
                >
                  <InterviewIcons.MailPlus className="size-3.5" />
                </Button>
              )}

            {/* Dispatch Rejection Button */}
            {appStatus === 'REJECTED' && job?.id && targetAppId && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() =>
                  sendOutcomes({
                    jobId: job.id,
                    applicationIds: [targetAppId],
                    forceResend: true,
                  })
                }
                className="h-7 w-7 rounded-none text-accent/70 hover:text-accent hover:bg-accent-soft/10 cursor-pointer shrink-0"
                title="Dispatch Rejection"
              >
                <InterviewIcons.Send className="size-3.5" />
              </Button>
            )}

            {/* Delete Interview Button */}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => deleteInterview(item.id)}
              className="h-7 w-7 rounded-none text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer shrink-0"
              title="Delete Interview"
            >
              <InterviewIcons.Trash className="size-3.5" />
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}
