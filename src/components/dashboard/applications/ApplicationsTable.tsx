'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArchiveX,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Globe,
  Loader2,
  MoreHorizontal,
  Send,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.49 1.49 0 1 0 0 2.97 1.49 1.49 0 0 0 0-2.97z" />
    </svg>
  )
}

function formatUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusCombobox } from '@/components/ui/status-combobox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { deleteApplication, downloadDocument, updateApplicationStatus } from '@/lib/applications'

import type { Application, ApplicationDocument, ApplicationStatus } from './ApplicationsHub'
import { ApplicationStatusBadge } from './ApplicationStatusBadge'

interface ApplicationsTableProps {
  applications: Application[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  total: number
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  onAssignTask: (application?: Application) => void
  assignableCount: number
  onApplicationUpdated?: () => void
  onStatusChange?: (applicationId: string, newStatus: ApplicationStatus) => void
  onDeleteApplication?: (applicationId: string) => void
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  'APPLIED',
  'SELECTED',
  'TASK_ASSIGNED',
  'TASK_SUBMITTED',
  'INTERVIEW_SELECTED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_COMPLETED',
  'OFFER_PENDING',
  'OFFER_SENT',
  'DOCS_SUBMITTED',
  'HIRED',
  'REJECTED',
  'CLOSED',
]

const ASSIGNABLE_STATUSES = new Set<ApplicationStatus>(['SELECTED'])

function formatStatus(status: ApplicationStatus) {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getStatusOptions() {
  return STATUS_OPTIONS.map((status) => ({
    value: status,
    label: formatStatus(status),
    badge: <ApplicationStatusBadge status={status} />,
  }))
}

function formatDate(date: string) {
  if (!date) {
    return '—'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return '—'
  }

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getCvDocument(application: Application): ApplicationDocument | undefined {
  return application.documents?.find((document) => {
    const type = document.type?.toUpperCase()

    return type === 'CV' || type === 'RESUME'
  })
}

export function ApplicationsTable({
  applications,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  total,
  selectedIds,
  onSelectionChange,
  onAssignTask,
  assignableCount,
  onApplicationUpdated,
  onStatusChange,
  onDeleteApplication,
}: ApplicationsTableProps) {
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null)

  const [deleting, setDeleting] = useState(false)

  const [closeDialogOpen, setCloseDialogOpen] = useState(false)

  const [applicationToClose, setApplicationToClose] = useState<Application | null>(null)

  const [closing, setClosing] = useState(false)

  const allApplicationsSelected = useMemo(() => {
    if (applications.length === 0) {
      return false
    }

    return applications.every((application) => selectedIds.has(application.id))
  }, [applications, selectedIds])

  const someApplicationsSelected = useMemo(
    () => applications.some((application) => selectedIds.has(application.id)),
    [applications, selectedIds],
  )

  const handleSelectAll = (checked: boolean) => {
    const nextSelected = new Set(selectedIds)

    if (checked) {
      applications.forEach((application) => {
        nextSelected.add(application.id)
      })
    } else {
      applications.forEach((application) => {
        nextSelected.delete(application.id)
      })
    }

    onSelectionChange(nextSelected)
  }

  const handleSelectApplication = (applicationId: string, checked: boolean) => {
    const nextSelected = new Set(selectedIds)

    if (checked) {
      nextSelected.add(applicationId)
    } else {
      nextSelected.delete(applicationId)
    }

    onSelectionChange(nextSelected)
  }

  const handleStatusChange = async (application: Application, newStatus: ApplicationStatus) => {
    if (application.status === newStatus) {
      return
    }

    if (newStatus === 'CLOSED') {
      try {
        setUpdatingStatusId(application.id)
        onStatusChange?.(application.id, 'CLOSED')
        await updateApplicationStatus(application.id, 'CLOSED')
        const nextSelected = new Set(selectedIds)
        nextSelected.delete(application.id)
        onSelectionChange(nextSelected)
        toast.success('Application marked as closed and sent to Closed Applications page.', {
          action: {
            label: 'View',
            onClick: () => window.location.assign('/dashboard/admin/applications/closed'),
          },
        })
        if (!onStatusChange) {
          onApplicationUpdated?.()
        }
      } catch (error) {
        onStatusChange?.(application.id, application.status)
        toast.error(error instanceof Error ? error.message : 'Failed to update application status.')
      } finally {
        setUpdatingStatusId(null)
      }
      return
    }

    try {
      setUpdatingStatusId(application.id)

      // Optimistic update
      onStatusChange?.(application.id, newStatus)

      await updateApplicationStatus(application.id, newStatus)

      toast.success('Application status updated successfully.')

      if (!onStatusChange) {
        onApplicationUpdated?.()
      }
    } catch (error) {
      // Revert optimistic update if failed
      onStatusChange?.(application.id, application.status)
      toast.error(error instanceof Error ? error.message : 'Failed to update application status.')
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const openDeleteDialog = (application: Application) => {
    setApplicationToDelete(application)
    setDeleteDialogOpen(true)
  }

  const openCloseDialog = (application: Application) => {
    setApplicationToClose(application)
    setCloseDialogOpen(true)
  }

  const handleCloseApplication = async () => {
    if (!applicationToClose) {
      return
    }

    const closedId = applicationToClose.id

    try {
      setClosing(true)

      onStatusChange?.(closedId, 'CLOSED')

      await updateApplicationStatus(closedId, 'CLOSED')

      const nextSelected = new Set(selectedIds)
      nextSelected.delete(closedId)
      onSelectionChange(nextSelected)

      toast.success('Application marked as closed.')

      setCloseDialogOpen(false)
      setApplicationToClose(null)

      if (!onStatusChange) {
        onApplicationUpdated?.()
      }
    } catch (error) {
      onStatusChange?.(closedId, applicationToClose.status)
      toast.error(error instanceof Error ? error.message : 'Failed to close application.')
    } finally {
      setClosing(false)
    }
  }

  const handleDelete = async () => {
    if (!applicationToDelete) {
      return
    }

    const deletedId = applicationToDelete.id

    try {
      setDeleting(true)

      await deleteApplication(deletedId)

      const nextSelected = new Set(selectedIds)

      nextSelected.delete(deletedId)

      onSelectionChange(nextSelected)

      toast.success('Application deleted successfully.')

      setDeleteDialogOpen(false)
      setApplicationToDelete(null)

      if (onDeleteApplication) {
        onDeleteApplication(deletedId)
      } else {
        onApplicationUpdated?.()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete application.')
    } finally {
      setDeleting(false)
    }
  }

  const handleViewCV = async (application: Application) => {
    try {
      let document = getCvDocument(application)

      /**
       * If documents were not included in the initial application
       * response, fetch them separately.
       */
      if (!document) {
        const response = await api.get<ApplicationDocument[]>(
          `/applications/admin/${application.id}/documents`,
        )

        const documents = Array.isArray(response) ? response : []

        document = documents.find((item) => {
          const type = item.type?.toUpperCase()

          return type === 'CV' || type === 'RESUME'
        })
      }

      if (!document) {
        toast.error('CV not found for this application.')
        return
      }

      /**
       * PDF files can be opened directly in a new browser tab.
       */
      if (document.mimeType === 'application/pdf') {
        const blob = await api.getBlob(`/applications/admin/documents/${document.id}/view`)

        const objectUrl = URL.createObjectURL(blob)

        window.open(objectUrl, '_blank', 'noopener,noreferrer')

        setTimeout(() => {
          URL.revokeObjectURL(objectUrl)
        }, 5000)

        return
      }

      /**
       * For non-PDF documents, use the download endpoint.
       */
      if (!document.storageKey) {
        toast.error('Document storage information is unavailable.')
        return
      }

      const filename = document.storageKey.split('/').pop() || 'cv-document'

      await downloadDocument(application.id, filename, filename)

      toast.success('CV download started.')
    } catch (error) {
      console.error('Failed to open CV:', error)

      toast.error(error instanceof Error ? error.message : 'Failed to open the CV.')
    }
  }

  /**
   * Initial table loading skeleton.
   */
  if (loading && applications.length === 0) {
    return (
      <div className="space-y-3">
        {/* Desktop Table Skeleton */}
        <div className="hidden lg:block overflow-hidden rounded-none border border-border bg-card">
          <div className="overflow-x-auto">
            <Table className="text-xs min-w-[950px]">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-12 px-3" />
                  <TableHead className="w-14 px-3">SL</TableHead>
                  <TableHead className="min-w-48 px-3">Candidate</TableHead>
                  <TableHead className="min-w-44 px-3">Job</TableHead>
                  <TableHead className="min-w-40 px-3">Status</TableHead>
                  <TableHead className="min-w-28 px-3">Applied</TableHead>
                  <TableHead className="min-w-36 px-3">Profiles</TableHead>
                  <TableHead className="min-w-20 px-3 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={`application-skeleton-${index}`}>
                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-4 w-4" />
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-4 w-6" />
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-4 w-32" />
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-7 w-28 rounded-none" />
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="size-6 rounded" />
                        <Skeleton className="size-6 rounded" />
                        <Skeleton className="size-6 rounded" />
                        <Skeleton className="h-7 w-12 rounded-none" />
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-3 text-right">
                      <Skeleton className="ml-auto h-7 w-7 rounded-none" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Cards Skeleton */}
        <div className="lg:hidden space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`app-card-skel-${i}`}
              className="p-4 rounded-none border border-border bg-card space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1">
                  <Skeleton className="h-4 w-4 rounded-sm shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-36 rounded-none" />
                    <Skeleton className="h-3 w-24 rounded-none" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full shrink-0" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                <Skeleton className="h-3.5 w-28 rounded-none" />
                <Skeleton className="h-3.5 w-20 rounded-none" />
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Skeleton className="h-8 flex-1 rounded-none" />
                <Skeleton className="h-8 w-16 rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /**
   * Empty state.
   */
  if (!loading && applications.length === 0) {
    return (
      <div className="rounded-none border border-dashed border-border bg-card px-6 py-14 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          <FileText className="size-5 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-foreground">No applications found</h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Try changing your filters or search terms.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block overflow-hidden rounded-none border border-border bg-card">
        <div className="overflow-x-auto">
          <Table className="text-xs min-w-[950px]">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-12 px-3">
                  <Checkbox
                    checked={
                      allApplicationsSelected
                        ? true
                        : someApplicationsSelected
                          ? 'indeterminate'
                          : false
                    }
                    onCheckedChange={(checked) => handleSelectAll(checked === true)}
                    aria-label="Select all applications"
                  />
                </TableHead>

                <TableHead className="w-14 px-3">SL</TableHead>

                <TableHead className="min-w-48 px-3">Candidate</TableHead>

                <TableHead className="min-w-44 px-3">Job</TableHead>

                <TableHead className="min-w-40 px-3">Status</TableHead>

                <TableHead className="min-w-28 px-3">Applied</TableHead>

                <TableHead className="min-w-36 px-3">Profiles</TableHead>

                <TableHead className="min-w-20 px-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {applications.map((application, index) => {
                const isSelected = selectedIds.has(application.id)

                const isUpdating = updatingStatusId === application.id

                const canAssignTask = ASSIGNABLE_STATUSES.has(application.status)

                const cvDocument = getCvDocument(application)
                const githubUrl = formatUrl(application.applicant?.github)
                const linkedinUrl = formatUrl(application.applicant?.linkedin)
                const portfolioUrl = formatUrl(application.applicant?.portfolio)

                return (
                  <TableRow
                    key={application.id}
                    data-state={isSelected ? 'selected' : undefined}
                    className="hover:bg-muted/30"
                  >
                    <TableCell className="px-3 py-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectApplication(application.id, checked === true)
                        }
                        aria-label={`Select ${application.applicant.name}`}
                      />
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <div className="min-w-[180px]">
                        <Link
                          href={`/dashboard/admin/applications/${application.id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {application.applicant.name}
                        </Link>

                        <p className="max-w-[220px] truncate text-sm text-muted-foreground">
                          {application.applicant.email}
                        </p>

                        {application.applicant.phone && (
                          <p className="text-xs text-muted-foreground">
                            {application.applicant.phone}
                          </p>
                        )}

                        {application.applicationCode ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-accent-soft text-accent dark:text-accent border border-accent">
                            #{application.applicationCode}
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <div className="min-w-[160px]">
                        <Link
                          href={`/dashboard/admin/jobs/${application.job.id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {application.job.title}
                        </Link>
                        {application.job?.jobCode ? (
                          <p className="mt-1 text-xs font-mono font-medium text-muted-foreground">
                            #{application.job.jobCode}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs font-mono text-muted-foreground">—</p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <StatusCombobox
                        value={application.status}
                        options={getStatusOptions()}
                        onValueChange={(value) => {
                          void handleStatusChange(application, value as ApplicationStatus)
                        }}
                        disabled={isUpdating}
                        triggerClassName="w-[150px] text-xs h-8"
                        placeholder="Select status"
                      />
                    </TableCell>

                    <TableCell className="px-3 py-3 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(application.appliedAt)}
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <div className="flex items-center gap-2 min-w-[130px]">
                        {githubUrl ? (
                          <a
                            href={githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted/80 rounded"
                            title="GitHub Profile"
                          >
                            <GithubIcon className="size-4" />
                          </a>
                        ) : null}

                        {linkedinUrl ? (
                          <a
                            href={linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-sky-500 transition-colors p-1 hover:bg-muted/80 rounded"
                            title="LinkedIn Profile"
                          >
                            <LinkedinIcon className="size-4" />
                          </a>
                        ) : null}

                        {portfolioUrl ? (
                          <a
                            href={portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-accent transition-colors p-1 hover:bg-muted/80 rounded"
                            title="Portfolio Website"
                          >
                            <Globe className="size-4" />
                          </a>
                        ) : null}

                        {cvDocument ? (
                          <button
                            type="button"
                            onClick={() => void handleViewCV(application)}
                            className="text-muted-foreground hover:text-amber-500 transition-colors p-1 hover:bg-muted/80 rounded cursor-pointer"
                            title="View CV"
                          >
                            <FileText className="size-4" />
                          </button>
                        ) : null}

                        {!githubUrl && !linkedinUrl && !portfolioUrl && !cvDocument && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Application actions"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/applications/${application.id}`}>
                              <Eye className="mr-2 size-4" />
                              View application
                            </Link>
                          </DropdownMenuItem>

                          {cvDocument && (
                            <DropdownMenuItem onClick={() => void handleViewCV(application)}>
                              <Download className="mr-2 size-4" />
                              View CV
                            </DropdownMenuItem>
                          )}

                          {canAssignTask && (
                            <>
                              <DropdownMenuSeparator />

                              <DropdownMenuItem onClick={() => onAssignTask(application)}>
                                <Send className="mr-2 size-4" />
                                Send Task
                              </DropdownMenuItem>
                            </>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-amber-600 dark:text-amber-400 focus:text-amber-600 focus:bg-amber-500/10"
                            onClick={() => openCloseDialog(application)}
                          >
                            <ArchiveX className="mr-2 size-4" />
                            Close application
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => openDeleteDialog(application)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete application
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Desktop Footer */}
        <div className="flex flex-col items-center justify-center gap-3 border-t border-border px-4 py-4">
          {hasMore ? (
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="rounded-full px-7 py-2 h-9 text-xs font-medium border border-border/80 bg-card/80 backdrop-blur-xs hover:bg-accent-soft hover:border-accent hover:text-accent transition-all gap-2 cursor-pointer"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="size-3.5 animate-spin text-accent" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Load More</span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </>
              )}
            </Button>
          ) : applications.length > 0 ? (
            <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 bg-muted/40 border border-border/50 text-[11px] font-medium text-muted-foreground">
              <span>All {total} applications loaded</span>
            </div>
          ) : null}

          <div className="text-xs text-muted-foreground text-center">
            {selectedIds.size > 0 ? (
              <>
                <span className="font-semibold text-foreground">{selectedIds.size}</span> selected
                {assignableCount > 0 && (
                  <>
                    {' '}
                    · <span className="font-semibold text-foreground">{assignableCount}</span> ready
                    for task assignment
                  </>
                )}
                {' '}· Showing <span className="font-semibold text-foreground">{applications.length}</span>{' '}
                of <span className="font-semibold text-foreground">{total}</span> applications
              </>
            ) : (
              <>
                Showing <span className="font-semibold text-foreground">{applications.length}</span>{' '}
                of <span className="font-semibold text-foreground">{total}</span> applications
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-3">
        {/* Mobile Select All Header */}
        <div className="flex items-center justify-between p-3 rounded-none border border-border bg-card text-xs">
          <div className="flex items-center gap-2">
            <Checkbox
              id="mobile-select-all"
              checked={
                allApplicationsSelected ? true : someApplicationsSelected ? 'indeterminate' : false
              }
              onCheckedChange={(checked) => handleSelectAll(checked === true)}
              aria-label="Select all applications"
            />
            <label
              htmlFor="mobile-select-all"
              className="font-medium cursor-pointer text-foreground select-none"
            >
              Select All
            </label>
          </div>
          <div className="text-muted-foreground text-[11px]">
            {selectedIds.size > 0 ? (
              <span className="font-semibold text-foreground">{selectedIds.size} selected</span>
            ) : (
              <span>{applications.length} applications</span>
            )}
          </div>
        </div>

        {/* Mobile Cards */}
        {applications.map((application, index) => {
          const isSelected = selectedIds.has(application.id)
          const isUpdating = updatingStatusId === application.id
          const canAssignTask = ASSIGNABLE_STATUSES.has(application.status)
          const cvDocument = getCvDocument(application)
          const githubUrl = formatUrl(application.applicant?.github)
          const linkedinUrl = formatUrl(application.applicant?.linkedin)
          const portfolioUrl = formatUrl(application.applicant?.portfolio)

          return (
            <div
              key={application.id}
              className={cn(
                'rounded-none border border-border bg-card p-4 space-y-3 transition-colors',
                isSelected && 'border-accent bg-accent/[0.03]',
              )}
            >
              {/* Header: Checkbox + Name + Code + Dropdown */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleSelectApplication(application.id, checked === true)
                    }
                    aria-label={`Select ${application.applicant.name}`}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <Link
                        href={`/dashboard/admin/applications/${application.id}`}
                        className="font-semibold text-sm text-foreground hover:underline truncate"
                      >
                        {application.applicant.name}
                      </Link>
                      {application.applicationCode && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-accent-soft text-accent dark:text-accent border border-accent">
                          #{application.applicationCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {application.applicant.email}
                    </p>
                    {application.applicant.phone && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {application.applicant.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      aria-label="Application actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/admin/applications/${application.id}`}>
                        <Eye className="mr-2 size-4" />
                        View application
                      </Link>
                    </DropdownMenuItem>

                    {cvDocument && (
                      <DropdownMenuItem onClick={() => void handleViewCV(application)}>
                        <Download className="mr-2 size-4" />
                        View CV
                      </DropdownMenuItem>
                    )}

                    {canAssignTask && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onAssignTask(application)}>
                          <Send className="mr-2 size-4" />
                          Send Task
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => openDeleteDialog(application)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete application
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Job Info & Applied Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
                <div>
                  <span className="text-[11px] text-muted-foreground">Job: </span>
                  <Link
                    href={`/dashboard/admin/jobs/${application.job.id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {application.job.title}
                  </Link>
                  {application.job?.jobCode && (
                    <span className="ml-1 text-[11px] font-mono text-muted-foreground">
                      (#{application.job.jobCode})
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Applied: </span>
                  <span className="font-medium text-foreground">
                    {formatDate(application.appliedAt)}
                  </span>
                </div>
              </div>

              {/* Status Combobox & Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                <div className="flex-1 min-w-[140px]">
                  <StatusCombobox
                    value={application.status}
                    options={getStatusOptions()}
                    onValueChange={(value) => {
                      void handleStatusChange(application, value as ApplicationStatus)
                    }}
                    disabled={isUpdating}
                    triggerClassName="w-full h-8 text-xs"
                    placeholder="Select status"
                  />
                </div>

                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted/80 rounded"
                    title="GitHub Profile"
                  >
                    <GithubIcon className="size-4" />
                  </a>
                )}

                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-sky-500 transition-colors p-1 hover:bg-muted/80 rounded"
                    title="LinkedIn Profile"
                  >
                    <LinkedinIcon className="size-4" />
                  </a>
                )}

                {portfolioUrl && (
                  <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-accent transition-colors p-1 hover:bg-muted/80 rounded"
                    title="Portfolio Website"
                  >
                    <Globe className="size-4" />
                  </a>
                )}

                {cvDocument && (
                  <button
                    type="button"
                    onClick={() => void handleViewCV(application)}
                    className="text-muted-foreground hover:text-amber-500 transition-colors p-1 hover:bg-muted/80 rounded cursor-pointer"
                    title="View CV"
                  >
                    <FileText className="size-4" />
                  </button>
                )}

                {canAssignTask && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssignTask(application)}
                    className="h-8 gap-1.5 text-xs border-accent text-accent dark:text-accent hover:bg-accent-soft"
                  >
                    <Send className="size-3.5" />
                    Send Task
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openCloseDialog(application)}
                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-amber-600 hover:border-amber-500/30"
                >
                  <ArchiveX className="size-3.5" />
                  Close
                </Button>
              </div>
            </div>
          )
        })}

        {/* Mobile Pagination & Count Footer */}
        <div className="flex flex-col gap-3 rounded-none border border-border bg-card p-4">
          <div className="text-center text-xs text-muted-foreground">
            {selectedIds.size > 0 ? (
              <>
                <span className="font-medium text-foreground">{selectedIds.size}</span> selected
                {assignableCount > 0 && (
                  <>
                    {' '}
                    · <span className="font-medium text-foreground">{assignableCount}</span> ready
                    for task assignment
                  </>
                )}
              </>
            ) : (
              <>
                Showing <span className="font-medium text-foreground">{applications.length}</span>{' '}
                of <span className="font-medium text-foreground">{total}</span> applications
              </>
            )}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={onLoadMore}
                disabled={loadingMore}
                className="rounded-full px-7 py-2 h-9 text-xs font-medium border border-border/80 bg-card/80 hover:bg-accent-soft hover:border-accent hover:text-accent transition-all gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin text-accent" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Load More</span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (deleting) {
            return
          }

          setDeleteDialogOpen(open)

          if (!open) {
            setApplicationToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete application?</DialogTitle>

            <DialogDescription>
              This will permanently delete the application
              {applicationToDelete?.applicant.name
                ? ` from ${applicationToDelete.applicant.name}`
                : ''}
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={deleting}
              onClick={() => {
                setDeleteDialogOpen(false)
                setApplicationToDelete(null)
              }}
            >
              Cancel
            </Button>

            <Button variant="destructive" disabled={deleting} onClick={() => void handleDelete()}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 size-4" />
                  Delete application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={closeDialogOpen}
        onOpenChange={(open) => {
          if (closing) {
            return
          }

          setCloseDialogOpen(open)

          if (!open) {
            setApplicationToClose(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Application?</DialogTitle>

            <DialogDescription>
              Are you sure you want to close the application for{' '}
              <span className="font-semibold text-foreground">
                {applicationToClose?.applicant.name}
              </span>
              ?
              <br />
              <br />
              Once closed, this application will be removed from all active pipelines (Applications,
              Interviews, Onboarding, Task Submissions) and moved to the dedicated{' '}
              <strong>Closed</strong> page.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={closing}
              onClick={() => {
                setCloseDialogOpen(false)
                setApplicationToClose(null)
              }}
            >
              Cancel
            </Button>

            <Button
              disabled={closing}
              onClick={() => void handleCloseApplication()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {closing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Closing...
                </>
              ) : (
                <>
                  <ArchiveX className="mr-2 size-4" />
                  Close Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
