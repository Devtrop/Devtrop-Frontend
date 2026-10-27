'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Loader2,
  CheckCircle,
  XCircle,
  Mail,
  RefreshCw,
  Clock,
  AlertCircle,
  Award,
} from 'lucide-react'
import type { TaskSubmissionDetail } from '@/types/job'

interface TaskSubmissionsTableProps {
  submissions: TaskSubmissionDetail[]
  loading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  total: number
  onViewSubmission: (submission: TaskSubmissionDetail) => void
  onDeleteSubmission: (submission: TaskSubmissionDetail) => void
  onUpdateStatus?: (applicationId: string, status: string) => Promise<void>
  onAssignTask?: (submission: TaskSubmissionDetail) => void
  onRequestResubmit?: (submission: TaskSubmissionDetail) => void
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getSubmissionStatusInfo(sub: TaskSubmissionDetail) {
  const appStatus = sub.application?.status ?? ''
  const result = sub.result ?? ''

  // 1. Pass / Interview Ready
  if (
    result === 'PASS' ||
    appStatus === 'INTERVIEW_SELECTED' ||
    appStatus === 'INTERVIEW_SCHEDULED' ||
    appStatus === 'INTERVIEW_COMPLETED' ||
    appStatus === 'OFFER_PENDING' ||
    appStatus === 'OFFER_SENT' ||
    appStatus === 'HIRED'
  ) {
    return {
      type: 'PASS' as const,
      label: 'Pass',
      sublabel: 'Interview Ready',
      badgeClass: 'bg-accent-soft text-accent dark:text-accent ring-accent border border-accent',
      icon: CheckCircle,
    }
  }

  // 2. Reject / Failed
  if (result === 'FAIL' || appStatus === 'REJECTED') {
    return {
      type: 'REJECT' as const,
      label: 'Fail',
      sublabel: 'Rejected',
      badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/30 border border-red-500/30',
      icon: XCircle,
    }
  }

  // 3. Submitted / Pending Review
  if (sub.status === 'SUBMITTED' || appStatus === 'TASK_SUBMITTED') {
    return {
      type: 'PENDING' as const,
      label: 'Needs Review',
      sublabel: 'Submitted',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/30 border border-amber-500/30',
      icon: Clock,
    }
  }

  // 4. Expired
  if (sub.status === 'EXPIRED') {
    return {
      type: 'EXPIRED' as const,
      label: 'Expired',
      sublabel: 'Overdue',
      badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/30 border border-rose-500/30',
      icon: AlertCircle,
    }
  }

  // 5. Sent / Pending submission
  return {
    type: 'SENT' as const,
    label: 'Task Sent',
    sublabel: 'Pending',
    badgeClass: 'bg-accent-soft/10 text-accent dark:text-accent ring-blue-500/30 border border-blue-500/30',
    icon: Mail,
  }
}

export function TaskSubmissionsTable({
  submissions,
  loading,
  page,
  totalPages,
  onPageChange,
  total,
  onViewSubmission,
  onDeleteSubmission,
  onUpdateStatus,
  onAssignTask,
  onRequestResubmit,
}: TaskSubmissionsTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="hidden md:block rounded-none border border-border/80 bg-card overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <div className="w-full p-3.5 border-b border-border/80 bg-muted/40 flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-32 rounded-none min-w-[180px] flex-1" />
              <Skeleton className="h-4 w-28 rounded-none min-w-[160px]" />
              <Skeleton className="h-4 w-20 rounded-none min-w-[110px]" />
              <Skeleton className="h-4 w-24 rounded-none min-w-[130px]" />
              <Skeleton className="h-4 w-12 rounded-none min-w-[70px]" />
            </div>
            <div className="divide-y divide-border/60">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-full p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-[180px] flex-1">
                    <Skeleton className="h-4 w-36 rounded-none" />
                    <Skeleton className="h-3 w-48 rounded-none" />
                  </div>
                  <div className="min-w-[160px] space-y-1">
                    <Skeleton className="h-4 w-32 rounded-none" />
                    <Skeleton className="h-3 w-20 rounded-none" />
                  </div>
                  <div className="min-w-[110px]">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <div className="min-w-[130px]">
                    <Skeleton className="h-4 w-24 rounded-none" />
                  </div>
                  <div className="min-w-[70px] flex justify-end gap-1.5">
                    <Skeleton className="size-8 rounded-none" />
                    <Skeleton className="size-8 rounded-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="md:hidden space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-none border border-border/80 bg-card space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32 rounded-none" />
                  <Skeleton className="h-3 w-44 rounded-none" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded-none" />
                <Skeleton className="h-4 w-20 rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-none border border-border bg-card p-12 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-2xl">
          📋
        </div>
        <h2 className="mt-4 text-base font-semibold text-foreground">No task submissions found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters or search criteria.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block rounded-none border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-3.5 bg-muted/40">
          <h2 className="text-sm font-semibold text-foreground">Task Submissions</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {total} submission{total !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table className="text-xs w-full">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="min-w-[190px] px-3">Applicant</TableHead>
                <TableHead className="min-w-[150px] px-3">Job & Task</TableHead>
                <TableHead className="min-w-[150px] px-3">Evaluation / Status</TableHead>
                <TableHead className="min-w-[90px] px-3">Marks</TableHead>
                <TableHead className="min-w-[130px] px-3">Deadline</TableHead>
                <TableHead className="min-w-[110px] px-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => {
                const statusInfo = getSubmissionStatusInfo(sub)
                const StatusIcon = statusInfo.icon

                return (
                  <TableRow key={sub.id} className="hover:bg-muted/30">
                    {/* Applicant */}
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent dark:text-accent">
                          {sub.applicant?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate">
                            {sub.applicant?.name || 'Unknown'}
                          </div>
                          <div className="mt-0.5 text-[10px] text-muted-foreground truncate">
                            {sub.applicant?.email || ''}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Job & Task */}
                    <TableCell className="px-3 py-3">
                      <div className="font-medium text-foreground truncate max-w-[180px]">
                        {sub.jobTitle || sub.jobTask?.jobId || '—'}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                        {sub.jobTask?.title || '—'}
                      </div>
                      {(sub.jobCode || sub.applicationCode || sub.application?.applicationCode) && (
                        <div className="flex flex-wrap items-center gap-1 mt-0.5 font-mono text-[10px] text-muted-foreground/70">
                          {sub.jobCode && <span>Job #{sub.jobCode}</span>}
                          {sub.jobCode && (sub.applicationCode || sub.application?.applicationCode) && <span>•</span>}
                          {(sub.applicationCode || sub.application?.applicationCode) && (
                            <span>App #{sub.applicationCode || sub.application?.applicationCode}</span>
                          )}
                        </div>
                      )}
                    </TableCell>

                    {/* Status & Pass/Reject Indicator */}
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusInfo.badgeClass}`}
                        >
                          <StatusIcon className="size-3" />
                          <span>{statusInfo.label}</span>
                        </span>

                        {onUpdateStatus && (
                          <StatusChangeDropdown
                            submission={sub}
                            onUpdateStatus={onUpdateStatus}
                          />
                        )}
                      </div>
                    </TableCell>

                    {/* Marks / Score */}
                    <TableCell className="px-3 py-3">
                      {sub.score !== null && sub.score !== undefined ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none font-bold text-xs bg-accent-soft text-accent dark:text-accent border border-accent">
                          <Award className="size-3" />
                          {sub.score} / 100
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          Not graded
                        </span>
                      )}
                    </TableCell>

                    {/* Deadline */}
                    <TableCell className="px-3 py-3">
                      <span className="text-muted-foreground text-[11px]">
                        {sub.expiresAt ? formatDate(sub.expiresAt) : '—'}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-3 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onViewSubmission(sub)}
                          className="h-7 gap-1.5 text-[11px] border-border hover:bg-muted font-medium"
                        >
                          <Eye className="size-3 text-accent" />
                          Check & Mark
                        </Button>
                        {Boolean(
                          sub.status === 'SUBMITTED' ||
                          sub.submittedAt ||
                          sub.githubRepoUrl ||
                          sub.backendRepoUrl ||
                          sub.liveUrl ||
                          sub.application?.status === 'TASK_SUBMITTED' ||
                          sub.result !== null ||
                          sub.score !== null
                        ) ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (onRequestResubmit) {
                                onRequestResubmit(sub)
                              }
                            }}
                            className="h-7 gap-1 text-[11px] border-border hover:bg-muted"
                            title="Resend Task"
                          >
                            <RefreshCw className="size-3" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (onAssignTask) {
                                onAssignTask(sub)
                              } else {
                                toast.error('Cannot re-assign task at this time.')
                              }
                            }}
                            className="h-7 gap-1 text-[11px] border-border hover:bg-muted"
                            title="Send Task"
                          >
                            <Mail className="size-3" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteSubmission(sub)}
                          className="h-7 px-2 text-[11px] border-destructive/30 text-destructive hover:bg-destructive/10"
                          title="Delete Submission"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="h-8 gap-1.5 text-xs border-border hover:bg-muted"
              >
                <ChevronLeft className="size-3.5" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="h-8 gap-1.5 text-xs border-border hover:bg-muted"
              >
                Next
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-3">
        {submissions.map((sub) => {
          const statusInfo = getSubmissionStatusInfo(sub)
          const StatusIcon = statusInfo.icon

          return (
            <div
              key={sub.id}
              className="rounded-none border border-border bg-card p-4 space-y-3"
            >
              {/* Applicant Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent dark:text-accent">
                    {sub.applicant?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-foreground truncate">
                      {sub.applicant?.name || 'Unknown'}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {sub.applicant?.email || ''}
                    </div>
                  </div>
                </div>

                {/* Score badge in mobile */}
                {sub.score !== null && sub.score !== undefined && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none font-bold text-xs bg-accent-soft text-accent dark:text-accent border border-accent">
                    <Award className="size-3" />
                    {sub.score} / 100
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-muted-foreground">Job & Task:</span>
                  <div className="font-medium text-foreground truncate">
                    {sub.jobTitle || '—'} • {sub.jobTask?.title || '—'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusInfo.badgeClass}`}
                    >
                      <StatusIcon className="size-3" />
                      <span>{statusInfo.label}</span>
                    </span>

                    {onUpdateStatus && (
                      <StatusChangeDropdown
                        submission={sub}
                        onUpdateStatus={onUpdateStatus}
                      />
                    )}
                  </div>

                  {sub.expiresAt && (
                    <span className="text-[11px] text-muted-foreground">
                      Due: {formatDate(sub.expiresAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-border flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onViewSubmission(sub)}
                  className="flex-1 h-8 gap-1.5 text-xs border-border px-1 font-medium"
                >
                  <Eye className="size-3.5 text-accent" />
                  Check & Mark
                </Button>
                {Boolean(
                  sub.status === 'SUBMITTED' ||
                  sub.submittedAt ||
                  sub.githubRepoUrl ||
                  sub.backendRepoUrl ||
                  sub.liveUrl ||
                  sub.application?.status === 'TASK_SUBMITTED' ||
                  sub.result !== null ||
                  sub.score !== null
                ) ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (onRequestResubmit) {
                        onRequestResubmit(sub)
                      }
                    }}
                    className="h-8 px-2.5 text-xs border-border"
                    title="Resend Task"
                  >
                    <RefreshCw className="size-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (onAssignTask) {
                        onAssignTask(sub)
                      } else {
                        toast.error('Cannot re-assign task at this time.')
                      }
                    }}
                    className="h-8 px-2.5 text-xs border-border"
                    title="Send Task"
                  >
                    <Mail className="size-3.5" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteSubmission(sub)}
                  className="h-8 px-2.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                  title="Delete Submission"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          )
        })}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-2">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="h-8 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="h-8 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function StatusChangeDropdown({
  submission,
  onUpdateStatus,
}: {
  submission: TaskSubmissionDetail
  onUpdateStatus: (applicationId: string, status: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  const handleAction = async (newStatus: string) => {
    const appId = submission.applicationId || submission.application?.id
    if (!appId) {
      toast.error('Cannot update status: missing application ID.')
      return
    }
    try {
      setUpdating(true)
      await onUpdateStatus(appId, newStatus)
      setOpen(false)
    } catch {
      // Error toast is handled by parent
    } finally {
      setUpdating(false)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-none border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          disabled={updating}
          title="Quick Status Change"
        >
          {updating ? (
            <Loader2 className="size-2.5 animate-spin" />
          ) : (
            <ArrowUpDown className="size-2.5" />
          )}
          Change
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleAction('INTERVIEW_SELECTED')}
          disabled={updating}
          className="gap-2 text-xs cursor-pointer text-accent dark:text-accent focus:text-accent font-medium"
        >
          <CheckCircle className="size-3.5" />
          Pass (Interview Ready)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleAction('REJECTED')}
          disabled={updating}
          className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive font-medium"
        >
          <XCircle className="size-3.5" />
          Reject / Fail
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleAction('TASK_SUBMITTED')}
          disabled={updating}
          className="gap-2 text-xs cursor-pointer text-amber-500 focus:text-amber-400"
        >
          <Clock className="size-3.5" />
          Mark as Needs Review
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleAction('CLOSED')}
          disabled={updating}
          className="gap-2 text-xs cursor-pointer text-muted focus:text-muted"
        >
          <XCircle className="size-3.5" />
          Close Application
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
