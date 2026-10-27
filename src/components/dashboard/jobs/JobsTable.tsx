'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Edit, Users, ChevronRight, Loader2 } from 'lucide-react'
import { type Job, JobStatus } from '@/types/job'
import JobStatusBadge from '@/components/jobs/JobStatusBadge'
import DeleteJobButton from '@/components/jobs/DeleteJobButton'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusCombobox } from '@/components/ui/status-combobox'
import { formatJobLocation } from '@/lib/jobs'

interface JobsTableProps {
  jobs: Job[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  changingStatus: Record<string, boolean>
  onStatusChange: (jobId: string, status: JobStatus) => void
  onDeleteJob: (jobId: string) => void
  total: number
}

const JOB_STATUS_OPTIONS: JobStatus[] = [JobStatus.DRAFT, JobStatus.ACTIVE, JobStatus.CLOSED]

function formatJobStatus(status: JobStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

// Convert job status options to combobox format
const getJobStatusOptions = () => {
  return JOB_STATUS_OPTIONS.map((status) => ({
    value: status,
    label: formatJobStatus(status),
    badge: <JobStatusBadge status={status} />,
  }))
}

export function JobsTable({
  jobs,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  changingStatus,
  onStatusChange,
  onDeleteJob,
  total,
}: JobsTableProps) {
  if (loading && jobs.length === 0) {
    return (
      <div className="space-y-3">
        {/* Desktop Table Skeleton */}
        <div className="hidden lg:block rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-16 px-3">SL</TableHead>
                  <TableHead className="min-w-60 px-3">Job</TableHead>
                  <TableHead className="min-w-32 px-3">Experience</TableHead>
                  <TableHead className="min-w-32 px-3">Salary</TableHead>
                  <TableHead className="min-w-32 px-3">Status</TableHead>
                  <TableHead className="min-w-24 px-3 text-center">Applications</TableHead>
                  <TableHead className="min-w-32 px-3 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={`job-skeleton-${i}`}>
                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-4 w-6 rounded-md" />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-44 rounded-md" />
                        <Skeleton className="h-3 w-28 rounded-md" />
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-4 w-16 rounded-md" />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-7 w-28 rounded-md" />
                    </TableCell>
                    <TableCell className="px-3 py-3 text-center">
                      <Skeleton className="h-7 w-12 mx-auto rounded-md" />
                    </TableCell>
                    <TableCell className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <Skeleton className="h-7 w-7 rounded-md" />
                      </div>
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
              key={`job-card-skel-${i}`}
              className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-40 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-4 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-2xl">
          💼
        </div>
        <h2 className="mt-4 text-base font-semibold text-foreground">No jobs found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {jobs.length === 0
            ? 'Create your first job posting to get started.'
            : 'Try adjusting your filters.'}
        </p>
        <Link href="/dashboard/admin/jobs/create">
          <Button size="sm" className="mt-4 gap-1.5 bg-emerald-600 hover:bg-emerald-500">
            Create Job
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-16 px-3">SL</TableHead>
                <TableHead className="min-w-60 px-3">Job</TableHead>
                <TableHead className="min-w-32 px-3">Experience</TableHead>
                <TableHead className="min-w-32 px-3">Salary</TableHead>
                <TableHead className="min-w-32 px-3">Status</TableHead>
                <TableHead className="min-w-24 px-3 text-center">Applications</TableHead>
                <TableHead className="min-w-32 px-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job, index) => (
                <TableRow key={job.id} className="hover:bg-muted/30">
                  {/* Serial Number */}
                  <TableCell className="px-3 py-3">
                    <span className="text-muted-foreground font-medium">{index + 1}</span>
                  </TableCell>

                  {/* Job */}
                  <TableCell className="px-3 py-3">
                    <div className="font-semibold text-foreground">{job.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>#{job.jobCode}</span>
                      <span>•</span>
                      <span className="text-emerald-500/90 font-medium">
                        {formatJobLocation(job)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Experience */}
                  <TableCell className="px-3 py-3">
                    <span className="text-muted-foreground">{job.experience || '—'}</span>
                  </TableCell>

                  {/* Salary */}
                  <TableCell className="px-3 py-3">
                    <span className="text-muted-foreground">{job.salaryRange || 'Negotiable'}</span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-3 py-3">
                    <StatusCombobox
                      value={job.status}
                      options={getJobStatusOptions()}
                      onValueChange={(value) => onStatusChange(job.id, value as JobStatus)}
                      disabled={changingStatus[job.id]}
                      triggerClassName="h-7 w-28 text-[11px] border-border"
                      placeholder="Select status"
                    />
                  </TableCell>

                  {/* Applications */}
                  <TableCell className="px-3 py-3 text-center">
                    <Link href={`/dashboard/admin/jobs/${job.id}/applications`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-[11px] border-border hover:bg-muted"
                      >
                        <Users className="size-3" />
                        {job._count?.applications ?? 0}
                      </Button>
                    </Link>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/dashboard/admin/jobs/${job.id}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 border-border hover:bg-muted"
                          title="Edit job"
                        >
                          <Edit className="size-3" />
                        </Button>
                      </Link>

                      <DeleteJobButton
                        jobId={job.id}
                        jobTitle={job.title}
                        onSuccess={() => onDeleteJob(job.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Load More & Count Footer */}
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{jobs.length}</span> of{' '}
            <span className="font-medium text-foreground">{total}</span> jobs
          </div>

          {hasMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="w-full sm:w-auto gap-1.5 text-xs border-border hover:bg-muted"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Load More
                  <ChevronRight className="size-3.5" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-foreground truncate">{job.title}</h3>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>#{job.jobCode}</span>
                  <span>•</span>
                  <span className="text-emerald-500/90 font-medium">{formatJobLocation(job)}</span>
                </div>
              </div>
              <JobStatusBadge status={job.status} />
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Experience:</span>
                <div className="font-medium text-foreground">{job.experience || '—'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Salary:</span>
                <div className="font-medium text-foreground">{job.salaryRange || 'Negotiable'}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Link href={`/dashboard/admin/jobs/${job.id}/applications`} className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 gap-1.5 text-xs border-border"
                >
                  <Users className="size-3.5" />
                  Applications ({job._count?.applications ?? 0})
                </Button>
              </Link>
              <Link href={`/dashboard/admin/jobs/${job.id}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-border"
                  title="Edit"
                >
                  <Edit className="size-3.5" />
                </Button>
              </Link>
              <DeleteJobButton
                jobId={job.id}
                jobTitle={job.title}
                onSuccess={() => onDeleteJob(job.id)}
              />
            </div>
          </div>
        ))}

        {/* Mobile Pagination & Count Footer */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="text-center text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{jobs.length}</span> of{' '}
            <span className="font-medium text-foreground">{total}</span> jobs
          </div>

          {hasMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="w-full h-9 gap-1.5 text-xs border-border"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Load More
                  <ChevronRight className="size-3.5" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
