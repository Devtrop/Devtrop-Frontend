'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { ApplicationStatusBadge } from './ApplicationStatusBadge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { ApplicationStatusHistory, ApplicationStatus } from '@/types/job'
import { Clock, User, Shield, Bot, History, Info, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ApplicationStatusTimelineProps {
  history?: ApplicationStatusHistory[]
  title?: string
  maxHeight?: string
  className?: string
  emptyMessage?: string
}

const STATUS_DESCRIPTIONS: Record<string, { title: string; desc: string }> = {
  APPLIED: {
    title: 'Application Received',
    desc: 'Candidate submitted their initial application and profile materials.',
  },
  SELECTED: {
    title: 'Candidate Shortlisted',
    desc: 'Candidate passed initial screening and was selected for practical assessment.',
  },
  TASK_ASSIGNED: {
    title: 'Assignment Dispatched',
    desc: 'Technical assessment task was assigned to candidate with completion deadline.',
  },
  TASK_SUBMITTED: {
    title: 'Assignment Submitted',
    desc: 'Candidate completed assessment and submitted repository & demo links for review.',
  },
  INTERVIEW_SELECTED: {
    title: 'Selected for Interview',
    desc: 'Candidate passed assessment review and approved to self-book an interview slot.',
  },
  INTERVIEW_SCHEDULED: {
    title: 'Interview Confirmed',
    desc: 'Meeting slot confirmed on calendar with Google Meet conference link.',
  },
  INTERVIEW_COMPLETED: {
    title: 'Interview Evaluated',
    desc: 'Interview completed with evaluation scores and interviewer feedback recorded.',
  },
  OFFER_PENDING: {
    title: 'Offer In Preparation',
    desc: 'Hiring decision confirmed; preparing formal offer letter & agreements.',
  },
  OFFER_SENT: {
    title: 'Offer Packet Sent',
    desc: 'Formal offer letter and onboarding agreement dispatched with verification token.',
  },
  DOCS_SUBMITTED: {
    title: 'Documents Submitted',
    desc: 'Candidate signed agreements and uploaded identity/verification documents.',
  },
  HIRED: {
    title: 'Candidate Officially Hired',
    desc: 'Orientation meeting dispatched and workspace credentials issued to candidate.',
  },
  REJECTED: {
    title: 'Application Rejected',
    desc: 'Application rejected and candidate marked as not moving forward.',
  },
  CLOSED: {
    title: 'Application Closed',
    desc: 'Application officially closed. Removed from active pipelines.',
  },
}

/**
 * Format relative time according to user spec:
 * 1m ago, 5m ago, 1h ago, 5h ago, 24h ago, 2d ago
 */
export function formatRelativeTime(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return 'recently'
  const date = new Date(dateInput)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  if (diffInMs < 0) return 'just now'

  const diffInSecs = Math.floor(diffInMs / 1000)
  const diffInMins = Math.floor(diffInSecs / 60)
  const diffInHours = Math.floor(diffInMins / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMins < 1) return 'just now'
  if (diffInMins < 60) return `${diffInMins}m ago`
  if (diffInHours <= 24) return `${diffInHours}h ago`
  if (diffInDays < 30) return `${diffInDays}d ago`
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) return `${diffInMonths}mo ago`
  return `${Math.floor(diffInDays / 365)}y ago`
}

export function formatFullDateTime(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return 'Unknown date'
  return new Date(dateInput).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function ApplicationStatusTimeline({
  history = [],
  title = 'Application Status History',
  maxHeight,
  className = '',
  emptyMessage = 'No status history recorded yet.',
}: ApplicationStatusTimelineProps) {
  const isFlex = className.includes('flex-1') || className.includes('h-full')
  const effectiveMaxHeight = maxHeight ?? (isFlex ? 'flex-1 min-h-0' : 'max-h-72')
  const sortedHistory = React.useMemo(() => {
    return [...history].sort(
      (a, b) =>
        new Date(b.changedAt || b.createdAt || 0).getTime() -
        new Date(a.changedAt || a.createdAt || 0).getTime(),
    )
  }, [history])

  const timelineRef = React.useRef<HTMLDivElement>(null)
  const [canScrollTimeline, setCanScrollTimeline] = React.useState(false)

  const checkTimelineScroll = React.useCallback(() => {
    const el = timelineRef.current
    if (el) {
      const hasMore = el.scrollHeight - el.scrollTop - el.clientHeight > 8
      setCanScrollTimeline(hasMore)
    }
  }, [])

  React.useEffect(() => {
    checkTimelineScroll()
    const timer1 = setTimeout(checkTimelineScroll, 250)
    const timer2 = setTimeout(checkTimelineScroll, 600)
    const el = timelineRef.current
    let ro: ResizeObserver | null = null
    if (el) {
      el.addEventListener('scroll', checkTimelineScroll)
      window.addEventListener('resize', checkTimelineScroll)
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(() => checkTimelineScroll())
        ro.observe(el)
      }
    }
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      if (el) {
        el.removeEventListener('scroll', checkTimelineScroll)
        window.removeEventListener('resize', checkTimelineScroll)
      }
      if (ro) ro.disconnect()
    }
  }, [sortedHistory, checkTimelineScroll])

  return (
    <div
      className={cn(
        'p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3',
        isFlex && 'flex flex-col min-h-0',
        className,
      )}
    >
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <History className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
        </div>
        {sortedHistory.length > 0 && (
          <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/50">
            {sortedHistory.length} {sortedHistory.length === 1 ? 'event' : 'events'}
          </span>
        )}
      </div>

      {sortedHistory.length === 0 ? (
        <div className={cn(
          "p-4 rounded-xl border border-dashed border-border text-center text-muted-foreground text-xs",
          isFlex && "flex-1 flex items-center justify-center",
        )}>
          {emptyMessage}
        </div>
      ) : (
        <TooltipProvider delayDuration={150}>
          <div className={cn("relative", isFlex && "flex-1 min-h-0 flex flex-col")}>
            <div
              ref={timelineRef}
              className={cn(
                "relative pl-3.5 overflow-y-auto pr-1.5 space-y-3.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/70",
                effectiveMaxHeight,
              )}
            >
              {sortedHistory.map((item, idx) => {
                const isLatest = idx === 0
                const fullDate = formatFullDateTime(item.changedAt || item.createdAt)
                const relativeTime = formatRelativeTime(item.changedAt || item.createdAt)
                const actor = item.changedBy || 'SYSTEM'
                const isApplicant = actor.toUpperCase() === 'APPLICANT'
                const isSystem = actor.toUpperCase() === 'SYSTEM'
                const info = STATUS_DESCRIPTIONS[item.status] || {
                  title: item.status.replace(/_/g, ' '),
                  desc: 'Status milestone recorded in the candidate hiring pipeline.',
                }

                return (
                  <div
                    key={item.id || idx}
                    className="relative flex items-start gap-2.5 text-xs group"
                  >
                    {/* Timeline node dot */}
                    <span
                      className={`size-2.5 rounded-full ring-4 ring-background shrink-0 mt-1.5 transition-transform group-hover:scale-125 ${
                        isLatest
                          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                          : 'bg-muted-foreground/50'
                      }`}
                    />

                    {/* Hoverable Milestone Card with rich Tooltip */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1 min-w-0 p-2.5 rounded-xl border border-border/60 bg-card/60 hover:bg-card/90 transition-all hover:border-border hover:shadow-xs space-y-1.5 cursor-pointer">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <ApplicationStatusBadge status={item.status} />

                            {/* Short relative timestamp */}
                            <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground shrink-0">
                              <Clock className="size-3 opacity-70" />
                              <span>{relativeTime}</span>
                            </div>
                          </div>

                          {/* Actor details */}
                          <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-muted-foreground">
                            <span className="text-[10px] text-muted-foreground/80">by</span>
                            {isApplicant ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 h-4 gap-1 border-blue-500/30 text-blue-400 bg-blue-500/10 font-normal"
                              >
                                <User className="size-2.5" />
                                <span>Candidate</span>
                              </Badge>
                            ) : isSystem ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 h-4 gap-1 border-zinc-700 text-zinc-400 bg-zinc-800 font-normal"
                              >
                                <Bot className="size-2.5" />
                                <span>SYSTEM</span>
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 h-4 gap-1 border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-normal max-w-[190px] truncate"
                              >
                                <Shield className="size-2.5 shrink-0" />
                                <span className="truncate">{actor}</span>
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>

                      {/* Rich Hover Popover Content */}
                      <TooltipContent
                        side="left"
                        align="center"
                        className="w-72 p-3 space-y-2 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 text-zinc-100 shadow-2xl rounded-xl text-xs z-50 animate-in fade-in-0 zoom-in-95"
                      >
                        <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
                          <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
                            <span
                              className={`size-2 rounded-full ${isLatest ? 'bg-emerald-500' : 'bg-zinc-400'}`}
                            />
                            {info.title}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {relativeTime}
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-300 leading-relaxed">{info.desc}</p>

                        <div className="pt-1.5 border-t border-zinc-800/80 space-y-1 text-[10px] text-zinc-400">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500">Triggered by:</span>
                            <span className="font-medium text-zinc-200 truncate max-w-[160px]">
                              {isApplicant
                                ? 'Candidate (Self-Action)'
                                : isSystem
                                  ? 'Automated System Service'
                                  : actor}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500">Exact Date:</span>
                            <span className="font-mono text-zinc-300">{fullDate}</span>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )
              })}
            </div>

            {/* SVG Icon indicator for more timeline events */}
            {canScrollTimeline && (
              <div
                onClick={() => timelineRef.current?.scrollBy({ top: 80, behavior: 'smooth' })}
                className="absolute -bottom-1 inset-x-0 h-9 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent flex items-end justify-center pb-0.5 cursor-pointer select-none z-10"
                title="Scroll to see more history"
              >
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-900/95 border border-zinc-700/60 shadow-lg text-[10px] text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors">
                  <span className="text-[10px] font-medium text-zinc-400">More</span>
                  <ChevronDown className="size-3 text-emerald-400 animate-bounce" />
                </div>
              </div>
            )}
          </div>
        </TooltipProvider>
      )}
    </div>
  )
}
