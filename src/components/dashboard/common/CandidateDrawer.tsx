'use client'

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ApplicationStatusTimeline } from '@/components/dashboard/applications/ApplicationStatusTimeline'
import { getApplicationStatusHistory, downloadDocument } from '@/lib/applications'
import type { EmailLog, ApplicationStatusHistory } from '@/types/job'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Mail,
  Phone,
  ExternalLink,
  Copy,
  Check,
  Star,
  FileText,
  User,
  ChevronDown,
} from 'lucide-react'

export interface DrawerCandidate {
  id: string
  applicationId?: string
  status: string
  appliedAt?: string
  applicant?: {
    id?: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    github?: string | null
    portfolio?: string | null
    linkedin?: string | null
  }
  job?: {
    id?: string
    title: string
    jobCode?: string
  }
  // Onboarding documents
  documents?: Array<{
    id: string
    type: string
    storageKey?: string
    mimeType?: string
    size?: number
    createdAt?: string
  }>
  // Interview slot & token
  token?: string | null
  slot?: {
    id?: string
    startTime?: string
    endTime?: string
    meetingUrl?: string | null
  } | null
  feedback?: {
    technicalSkill: number
    communication: number
    comments?: string | null
  } | null
  // Logs
  emailLogs?: EmailLog[]
  communicationLogs?: EmailLog[]
  applicationStatusHistories?: ApplicationStatusHistory[]
}

export interface CandidateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: DrawerCandidate | null
  hideJobCode?: boolean

  // Header options & transitions
  headerActions?: React.ReactNode
  availableTransitions?: Array<{ label: string; value: string; color?: string; dotColor?: string }>
  onStatusChange?: (newStatus: string) => Promise<void> | void

  // Interview actions
  bookingLink?: string
  onScoreInterview?: () => void

  // Onboarding actions
  onOpenViewer?: () => void

  // Sticky footer
  footerActions?: React.ReactNode
}

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  APPLIED: {
    label: 'Applied',
    badge: 'text-slate-300 border-slate-700/60 bg-slate-500/10 hover:bg-slate-500/20',
    dot: 'bg-slate-400',
  },
  SELECTED: {
    label: 'Selected',
    badge: 'text-blue-400 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20',
    dot: 'bg-blue-400',
  },
  TASK_ASSIGNED: {
    label: 'Task Assigned',
    badge: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20',
    dot: 'bg-indigo-400',
  },
  TASK_SUBMITTED: {
    label: 'Task Submitted',
    badge: 'text-purple-400 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20',
    dot: 'bg-purple-400',
  },
  INTERVIEW_SELECTED: {
    label: 'Interview Ready',
    badge: 'text-violet-400 border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20',
    dot: 'bg-violet-400',
  },
  INTERVIEW_SCHEDULED: {
    label: 'Scheduled',
    badge: 'text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20',
    dot: 'bg-sky-400',
  },
  INTERVIEW_COMPLETED: {
    label: 'Completed',
    badge: 'text-teal-400 border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20',
    dot: 'bg-teal-400',
  },
  OFFER_PENDING: {
    label: 'Offer Pending',
    badge: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  OFFER_SENT: {
    label: 'Offer Sent',
    badge: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20',
    dot: 'bg-cyan-400',
  },
  DOCS_SUBMITTED: {
    label: 'Docs Submitted',
    badge: 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20',
    dot: 'bg-amber-400',
  },
  HIRED: {
    label: 'Hired',
    badge: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  REJECTED: {
    label: 'Rejected',
    badge: 'text-rose-400 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20',
    dot: 'bg-rose-400',
  },
  CLOSED: {
    label: 'Closed',
    badge: 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10 hover:bg-zinc-500/20',
    dot: 'bg-zinc-400',
  },
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatFullDate(dateStr?: string | null): string {
  if (!dateStr) return 'Not set'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function ScrollableDocumentList({
  documents,
  onOpenViewer,
}: {
  documents: Array<{ id: string; type: string; mimeType?: string }>
  onOpenViewer?: () => void
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollDown, setCanScrollDown] = React.useState(false)

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current
    if (el) {
      const hasMore = el.scrollHeight - el.scrollTop - el.clientHeight > 8
      setCanScrollDown(hasMore)
    }
  }, [])

  React.useEffect(() => {
    checkScroll()
    const timer1 = setTimeout(checkScroll, 250)
    const timer2 = setTimeout(checkScroll, 600)
    const el = scrollRef.current
    let ro: ResizeObserver | null = null
    if (el) {
      el.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(() => checkScroll())
        ro.observe(el)
      }
    }
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      if (el) {
        el.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
      if (ro) ro.disconnect()
    }
  }, [documents, checkScroll])

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
      >
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={onOpenViewer ? onOpenViewer : undefined}
            className={`flex items-center justify-between p-2 rounded-xl border border-zinc-800 bg-zinc-900/70 ${
              onOpenViewer ? 'hover:bg-zinc-800/80 cursor-pointer' : ''
            } transition-colors`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="size-3.5 text-emerald-400 shrink-0" />
              <span className="text-xs text-zinc-200 font-medium truncate">
                {(doc.type ?? 'DOCUMENT').replace(/_/g, ' ')}
              </span>
            </div>
            <Badge
              variant="outline"
              className="text-[9px] text-zinc-400 border-zinc-700 bg-zinc-800 py-0 h-4"
            >
              {doc.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
            </Badge>
          </div>
        ))}
      </div>

      {/* SVG Icon indicator that there is more to scroll */}
      {canScrollDown && (
        <div
          onClick={() => scrollRef.current?.scrollBy({ top: 72, behavior: 'smooth' })}
          className="absolute -bottom-1 inset-x-0 h-8 bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-transparent flex items-end justify-center pb-0.5 cursor-pointer select-none"
          title="Scroll or click to reveal more documents"
        >
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-900/95 border border-zinc-700/60 shadow-lg text-[10px] text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors">
            <span className="text-[10px] font-medium text-zinc-400">More</span>
            <ChevronDown className="size-3 text-emerald-400 animate-bounce" />
          </div>
        </div>
      )}
    </div>
  )
}

export function CandidateDrawer({
  open,
  onOpenChange,
  candidate,
  hideJobCode = false,
  headerActions,
  availableTransitions = [],
  onStatusChange,
  bookingLink,
  onScoreInterview,
  onOpenViewer,
  footerActions,
}: CandidateDrawerProps) {
  const [copied, setCopied] = useState(false)
  const [copiedContact, setCopiedContact] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [fetchedHistories, setFetchedHistories] = useState<ApplicationStatusHistory[]>([])

  const targetAppId = candidate?.applicationId || candidate?.id
  const appStatusHistories = candidate?.applicationStatusHistories || []

  useEffect(() => {
    if (!targetAppId) return
    if (appStatusHistories.length > 0) {
      setFetchedHistories(appStatusHistories)
      return
    }
    getApplicationStatusHistory(targetAppId)
      .then((data) => {
        if (Array.isArray(data)) setFetchedHistories(data)
      })
      .catch(() => {})
  }, [targetAppId, appStatusHistories])

  const appStatus = candidate?.status || 'APPLIED'

  const effectiveTransitions = React.useMemo(() => {
    if (!availableTransitions || availableTransitions.length === 0) return availableTransitions
    if (availableTransitions.some((t) => t.value === 'CLOSED') || appStatus === 'CLOSED') {
      return availableTransitions
    }
    return [
      ...availableTransitions,
      {
        value: 'CLOSED',
        label: 'Closed',
        color: 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10',
        dotColor: 'bg-zinc-400',
      },
    ]
  }, [availableTransitions, appStatus])

  if (!candidate) return null

  const applicant = candidate.applicant
  const job = candidate.job
  const documents = candidate.documents || []
  const logs: EmailLog[] = candidate.emailLogs || candidate.communicationLogs || []

  const handleCopyContact = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedContact(type)
    setTimeout(() => setCopiedContact(null), 1500)
  }

  const handleCopy = () => {
    if (!bookingLink) return
    navigator.clipboard.writeText(bookingLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStatusSelect = async (val: string) => {
    if (!onStatusChange) return
    try {
      setUpdating(true)
      await onStatusChange(val)
      if (val === 'CLOSED') {
        onOpenChange(false)
      }
    } finally {
      setUpdating(false)
    }
  }

  const statusConfig = STATUS_CONFIG[appStatus] || {
    label: appStatus.replace(/_/g, ' '),
    badge: 'text-zinc-300 border-zinc-700/60 bg-zinc-800/80 hover:bg-zinc-800',
    dot: 'bg-zinc-400',
  }

  const avgScore = candidate.feedback
    ? ((candidate.feedback.technicalSkill + candidate.feedback.communication) / 2).toFixed(1)
    : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        overlayClassName="bg-black/60 backdrop-blur-xs cursor-pointer"
        onOverlayClick={() => onOpenChange(false)}
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement | null
          if (
            target?.closest?.(
              '[role="menu"], [role="tooltip"], [data-radix-popper-content-wrapper]',
            )
          ) {
            return
          }
          onOpenChange(false)
        }}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement | null
          if (
            target?.closest?.(
              '[role="menu"], [role="tooltip"], [data-radix-popper-content-wrapper]',
            )
          ) {
            return
          }
          onOpenChange(false)
        }}
        className="sm:max-w-md w-full bg-zinc-950 border-zinc-800 text-zinc-100 p-0 flex flex-col h-full overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="pt-4 pb-3.5 px-5 pr-12 border-b border-zinc-800 bg-zinc-900/60 shrink-0 space-y-3">
          {/* Identity & Status */}
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Initials Avatar */}
            <div className="size-11 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/70 text-zinc-100 font-bold text-sm flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              {getInitials(applicant?.name)}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <SheetTitle className="text-base font-bold text-white truncate leading-tight">
                  {applicant?.name || 'Applicant'}
                </SheetTitle>

                {/* Semantic Status Badge Dropdown */}
                {effectiveTransitions.length > 0 && onStatusChange ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        disabled={updating}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer shadow-xs',
                          statusConfig.badge,
                          updating && 'opacity-60 cursor-not-allowed',
                        )}
                      >
                        <span className={cn('size-1.5 rounded-full shrink-0', statusConfig.dot)} />
                        <span>{statusConfig.label}</span>
                        <ChevronDown className="size-3 opacity-60 ml-0.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-52 text-xs bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl"
                    >
                      {effectiveTransitions.map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          onClick={() => handleStatusSelect(opt.value)}
                          className="cursor-pointer gap-2.5 my-0.5 rounded-lg text-xs font-medium focus:bg-zinc-800 focus:text-zinc-100"
                        >
                          <span
                            className={cn(
                              'size-1.5 rounded-full shrink-0',
                              opt.dotColor || 'bg-zinc-400',
                            )}
                          />
                          <span>{opt.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[11px] font-semibold gap-1.5 px-2.5 py-0.5 rounded-full border',
                      statusConfig.badge,
                    )}
                  >
                    <span className={cn('size-1.5 rounded-full shrink-0', statusConfig.dot)} />
                    {statusConfig.label}
                  </Badge>
                )}
              </div>

              {/* Subtitle with unclipped Job Title & Code */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400">
                <span className="text-zinc-300 font-medium">{job?.title || 'Job Application'}</span>
                {!hideJobCode && job?.jobCode && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 shrink-0">
                    #{job.jobCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Clean Contact Metadata Line */}
          {(applicant?.email || applicant?.phone) && (
            <div className="flex items-center gap-2 text-xs text-zinc-300 flex-wrap pt-0.5">
              {applicant?.email && (
                <div className="flex items-center gap-1.5 group min-w-0">
                  <Mail className="size-3.5 text-zinc-500 shrink-0 group-hover:text-emerald-400 transition-colors" />
                  <a
                    href={`mailto:${applicant.email}`}
                    className="hover:text-white transition-colors truncate text-xs"
                    title={applicant.email}
                  >
                    {applicant.email}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyContact(applicant.email, 'email')}
                    className="text-zinc-500 hover:text-emerald-400 opacity-40 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                    title="Copy email"
                  >
                    {copiedContact === 'email' ? (
                      <Check className="size-3 text-emerald-400" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              )}

              {applicant?.email && applicant?.phone && (
                <span className="text-zinc-700 select-none mx-0.5">•</span>
              )}

              {applicant?.phone && (
                <div className="flex items-center gap-1.5 group">
                  <Phone className="size-3.5 text-zinc-500 shrink-0 group-hover:text-emerald-400 transition-colors" />
                  <a
                    href={`tel:${applicant.phone}`}
                    className="hover:text-white transition-colors text-xs"
                    title={applicant.phone}
                  >
                    {applicant.phone}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyContact(applicant.phone!, 'phone')}
                    className="text-zinc-500 hover:text-emerald-400 opacity-40 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                    title="Copy phone"
                  >
                    {copiedContact === 'phone' ? (
                      <Check className="size-3 text-emerald-400" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Social Links Row */}
          {(applicant?.linkedin || applicant?.github || applicant?.portfolio || (candidate?.documents && candidate.documents.length > 0)) && (
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              {applicant?.linkedin && (
                <a
                  href={/^https?:\/\//i.test(applicant.linkedin) ? applicant.linkedin : `https://${applicant.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 text-[11px] text-zinc-400 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10 transition-colors"
                  title="LinkedIn Profile"
                >
                  <svg className="size-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              )}
              {applicant?.github && (
                <a
                  href={/^https?:\/\//i.test(applicant.github) ? applicant.github : `https://${applicant.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 text-[11px] text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-800/80 transition-colors"
                  title="GitHub Profile"
                >
                  <svg className="size-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  GitHub
                </a>
              )}
              {applicant?.portfolio && (
                <a
                  href={/^https?:\/\//i.test(applicant.portfolio) ? applicant.portfolio : `https://${applicant.portfolio}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 text-[11px] text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-colors"
                  title="Portfolio"
                >
                  <svg className="size-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Portfolio
                </a>
              )}
              {(() => {
                const cvDoc = candidate?.documents?.find(d => (d.type || '').toUpperCase() === 'CV' || (d.type || '').toUpperCase() === 'RESUME') || candidate?.documents?.[0]
                if (!cvDoc) return null
                const filename = cvDoc.storageKey?.split('/').pop() || 'cv'
                
                const handleViewCV = async (e: React.MouseEvent) => {
                  e.stopPropagation()
                  try {
                    const appId = candidate?.applicationId || candidate?.id
                    if (!appId) {
                      toast.error('Application ID not found')
                      return
                    }
                    if (cvDoc.mimeType === 'application/pdf') {
                      const blob = await api.getBlob(`/applications/admin/documents/${cvDoc.id}/view`)
                      const objectUrl = URL.createObjectURL(blob)
                      window.open(objectUrl, '_blank', 'noopener,noreferrer')
                      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000)
                    } else {
                      await downloadDocument(appId, filename, `${applicant?.name || 'CV'}-Resume`)
                      toast.success('CV download started.')
                    }
                  } catch {
                    toast.error('Failed to open CV.')
                  }
                }
                
                return (
                  <button
                    type="button"
                    onClick={handleViewCV}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 text-[11px] text-zinc-400 hover:text-orange-400 hover:border-orange-500/30 hover:bg-orange-500/10 transition-colors cursor-pointer"
                    title="View CV / Resume"
                  >
                    <ExternalLink className="size-3 shrink-0" />
                    CV / Resume
                  </button>
                )
              })()}
            </div>
          )}

          {/* Dedicated Action Toolbar (Separated by 1px hairline border) */}
          {headerActions && (
            <div className="pt-2.5 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap">
              {headerActions}
            </div>
          )}
        </SheetHeader>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* 1. Interview Schedule Card (Rendered if slot, token, or booking link exists) */}
          {(candidate.slot || candidate.token || bookingLink) && (
            <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-2.5 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Interview Schedule
                </span>
                {candidate.slot ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                  >
                    Confirmed
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-amber-400 border-amber-500/30 bg-amber-500/10"
                  >
                    Pending Booking
                  </Badge>
                )}
              </div>

              {candidate.slot ? (
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Confirmed Slot:</span>
                    <span className="font-semibold text-zinc-200">
                      {formatFullDate(candidate.slot.startTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Meeting Link:</span>
                    {candidate.slot.meetingUrl ? (
                      <a
                        href={candidate.slot.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-emerald-400 hover:underline text-xs flex items-center gap-1"
                      >
                        <span>Google Meet</span>
                        <ExternalLink className="size-2.5" />
                      </a>
                    ) : (
                      <span className="text-zinc-500">Not configured</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-1 text-xs">
                  <p className="text-zinc-400">
                    {!candidate.token
                      ? 'Candidate has not been issued a self-booking invitation token yet.'
                      : 'Candidate has received a booking token and has not selected a slot.'}
                  </p>
                  {bookingLink && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="font-mono text-[11px] text-zinc-400 truncate flex-1">
                        {bookingLink}
                      </span>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={handleCopy}
                        className="h-6 px-2 text-[11px] gap-1 cursor-pointer shrink-0 text-zinc-300 hover:bg-zinc-800"
                      >
                        {copied ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. Interviewer Evaluation Card (Rendered if feedback exists or scoring is enabled) */}
          {(candidate.feedback || onScoreInterview) && (
            <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-2.5 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Evaluation & Feedback
                </span>
                {avgScore && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold text-amber-400 border-amber-500/30 bg-amber-500/10"
                  >
                    Score: {avgScore} / 5
                  </Badge>
                )}
              </div>

              {candidate.feedback ? (
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Technical Skill:</span>
                    <div className="flex items-center gap-0.5 text-amber-400 font-bold">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${i < candidate.feedback!.technicalSkill ? 'fill-amber-400' : 'opacity-20 text-zinc-600'}`}
                        />
                      ))}
                      <span className="text-zinc-200 ml-1 font-mono">
                        {candidate.feedback.technicalSkill}/5
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Communication:</span>
                    <div className="flex items-center gap-0.5 text-amber-400 font-bold">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${i < candidate.feedback!.communication ? 'fill-amber-400' : 'opacity-20 text-zinc-600'}`}
                        />
                      ))}
                      <span className="text-zinc-200 ml-1 font-mono">
                        {candidate.feedback.communication}/5
                      </span>
                    </div>
                  </div>

                  {candidate.feedback.comments && (
                    <div className="mt-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 leading-relaxed italic">
                      &quot;{candidate.feedback.comments}&quot;
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-2 text-xs text-zinc-400 text-center">
                  No evaluation recorded yet.{' '}
                  {onScoreInterview && (
                    <button
                      type="button"
                      onClick={onScoreInterview}
                      className="text-emerald-400 underline font-medium cursor-pointer ml-1"
                    >
                      Score now
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. Uploaded Documents Card (Rendered if candidate has documents or viewer exists) */}
          {(documents.length > 0 || onOpenViewer) && (
            <div className="space-y-2.5 p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/40 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Uploaded Documents ({documents.length})
                </span>
                {documents.length > 0 && onOpenViewer && (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={onOpenViewer}
                    className="h-6 px-2 text-[10px] gap-1 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg cursor-pointer"
                  >
                    View All
                  </Button>
                )}
              </div>

              {documents.length === 0 ? (
                <div className="p-3 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-500 text-xs">
                  No documents uploaded yet.
                </div>
              ) : (
                <ScrollableDocumentList documents={documents} onOpenViewer={onOpenViewer} />
              )}
            </div>
          )}

          {/* 4. Application Status History Timeline */}
          <ApplicationStatusTimeline
            history={appStatusHistories.length > 0 ? appStatusHistories : fetchedHistories}
            title="Application Status History"
            className="flex-1 min-h-[220px]"
          />
        </div>

        {/* Action Footer */}
        {footerActions && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 shrink-0 flex items-center gap-2">
            {footerActions}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
