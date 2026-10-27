'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  FileText,
  Loader2,
  MoreHorizontal,
  RotateCcw,
  Search,
  Users,
  XCircle,
} from 'lucide-react'
import type { Application, ApplicationStatus } from '@/types/job'
import { updateApplicationStatus } from '@/lib/applications'

interface JobDetails {
  id: string
  jobCode?: string
  title: string
  experience?: string
  salaryRange?: string
  status?: string
}

const STATUS_OPTIONS: Array<{ value: ApplicationStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SELECTED', label: 'Selected' },
  { value: 'TASK_ASSIGNED', label: 'Task Assigned' },
  { value: 'TASK_SUBMITTED', label: 'Task Submitted' },
  { value: 'INTERVIEW_SELECTED', label: 'Interview Selected' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  { value: 'INTERVIEW_COMPLETED', label: 'Interview Completed' },
  { value: 'OFFER_PENDING', label: 'Offer Pending' },
  { value: 'OFFER_SENT', label: 'Offer Sent' },
  { value: 'DOCS_SUBMITTED', label: 'Docs Submitted' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CLOSED', label: 'Closed' },
]

const LIMIT = 20

export default function JobApplications() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const jobId = params?.id

  // Data state
  const [applications, setApplications] = useState<Application[]>([])
  const [job, setJob] = useState<JobDetails | null>(null)
  const [total, setTotal] = useState(0)

  // Loading states
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Pagination state
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  // Filters state
  const [search, setSearch] = useState('')
  const [applicationCode, setApplicationCode] = useState('')
  const [status, setStatus] = useState<ApplicationStatus | ''>('')
  const [dateFilter, setDateFilter] = useState('')
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest')

  /**
   * Load applications from backend
   */
  const loadApplications = useCallback(
    async (targetPage: number, append = false) => {
      if (!jobId) return

      try {
        if (append) {
          setLoadingMore(true)
        } else {
          setLoading(true)
        }

        if (!api.isAuthenticated()) {
          setApplications([])
          setTotal(0)
          toast.error('You are not authenticated.')
          return
        }

        // Use getRaw so that response metadata and job object are preserved
        const response = await api.getRaw<any>(`/applications/admin/jobs/${jobId}`, {
          page: targetPage,
          limit: LIMIT,
          search: search.trim() || undefined,
          applicationCode: applicationCode.trim() || undefined,
          status: status || undefined,
          sort,
        })

        const rawData = response.data
        const appList: Application[] = Array.isArray(rawData?.data)
          ? rawData.data
          : Array.isArray(rawData)
            ? rawData
            : []

        // Extract total application count safely
        const totalCount =
          rawData?.meta?.total ??
          (typeof rawData?.total === 'number' ? rawData.total : appList.length)

        const totalPages = rawData?.meta?.totalPages ?? Math.ceil(totalCount / LIMIT)
        const moreAvailable =
          rawData?.meta?.hasMore ?? (targetPage < totalPages && appList.length === LIMIT)

        // Capture job details
        if (rawData?.job) {
          setJob(rawData.job)
        } else if (appList.length > 0 && appList[0].job) {
          setJob(appList[0].job as unknown as JobDetails)
        }

        if (append) {
          setApplications((prev) => {
            const existingIds = new Set(prev.map((app) => app.id))
            const newApps = appList.filter((app) => !existingIds.has(app.id))
            return [...prev, ...newApps]
          })
          setPage(targetPage)
        } else {
          setApplications(appList)
          setPage(1)
        }

        setTotal(totalCount)
        setHasMore(moreAvailable)
      } catch (error) {
        if (!append) {
          setApplications([])
          setTotal(0)
        }
        toast.error(error instanceof Error ? error.message : 'Failed to load applications.')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [jobId, search, applicationCode, status, sort],
  )

  // Fetch job details directly if not already present
  useEffect(() => {
    async function fetchJobInfo() {
      if (!jobId || job) return
      try {
        const jobData = await api.get<any>(`/jobs/admin/${jobId}`)
        if (jobData) {
          setJob(jobData)
        }
      } catch {
        // Continue gracefully
      }
    }
    void fetchJobInfo()
  }, [jobId, job])

  // Debounced search & filter reload
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadApplications(1, false)
    }, 350)

    return () => {
      window.clearTimeout(timer)
    }
  }, [loadApplications])

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      void loadApplications(page + 1, true)
    }
  }

  const handleReset = () => {
    setSearch('')
    setApplicationCode('')
    setStatus('')
    setDateFilter('')
    setSort('latest')
    setPage(1)
  }

  const handleCloseApplication = async (applicationId: string) => {
    try {
      await updateApplicationStatus(applicationId, 'CLOSED')
      setApplications((prev) => prev.filter((app) => app.id !== applicationId))
      setTotal((prev) => Math.max(0, prev - 1))
      toast.success('Application marked as closed.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to close application.')
    }
  }

  // Client-side date filter and sorting reinforcement
  const displayedApplications = useMemo(() => {
    let list = [...applications]

    // Date filtering (matches appliedAt date in YYYY-MM-DD format)
    if (dateFilter) {
      list = list.filter((app) => {
        if (!app.appliedAt) return false
        const appDateStr = new Date(app.appliedAt).toISOString().slice(0, 10)
        return appDateStr === dateFilter
      })
    }

    // Sort order reinforcement
    list.sort((a, b) => {
      const timeA = new Date(a.appliedAt || 0).getTime()
      const timeB = new Date(b.appliedAt || 0).getTime()
      return sort === 'latest' ? timeB - timeA : timeA - timeB
    })

    return list
  }, [applications, dateFilter, sort])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
        <div className="min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/admin/jobs')}
            className="gap-1.5 mb-3 h-8 px-2 text-xs hover:bg-muted"
          >
            <ArrowLeft className="size-3.5" />
            Back to Jobs
          </Button>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {job?.title ? `${job.title} — Applications` : 'Job Applications'}
            </h1>
            {job?.jobCode && (
              <Badge variant="outline" className="text-xs font-mono">
                #{job.jobCode}
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {job?.experience ? `${job.experience} • ` : ''}
            {job?.salaryRange ? `${job.salaryRange} • ` : ''}
            Review and manage candidates who applied for this position
          </p>
        </div>

        {/* Stats Card */}
        <Card className="w-full lg:w-auto border-border bg-card/60 backdrop-blur-xs shadow-xs shrink-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Users className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold text-foreground">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {/* 1. Candidate Name / Email Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-lg border-border"
            />
          </div>

          {/* 2. Application Code Filter */}
          <Input
            type="text"
            placeholder="App Code (10000001)..."
            value={applicationCode}
            onChange={(e) => setApplicationCode(e.target.value)}
            className="h-9 text-xs rounded-lg border-border"
          />

          {/* 3. Status Filter */}
          <Select
            value={status || 'ALL'}
            onValueChange={(val) => setStatus(val === 'ALL' ? '' : (val as ApplicationStatus))}
          >
            <SelectTrigger className="h-9 text-xs rounded-lg border-border">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value || 'all-statuses'} value={opt.value || 'ALL'}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 4. Applied Date Filter */}
          <div className="relative">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 text-xs rounded-lg border-border"
              title="Filter by application date"
            />
          </div>

          {/* 4. Sort Order */}
          <Select value={sort} onValueChange={(val) => setSort(val as 'latest' | 'oldest')}>
            <SelectTrigger className="h-9 text-xs rounded-lg border-border">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          {/* 5. Reset Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={loading}
            className="h-9 gap-1.5 rounded-lg border-border text-xs hover:bg-muted"
          >
            <RotateCcw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reset Filters</span>
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Results update automatically as you type or change filters.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && applications.length === 0 && (
        <div className="hidden lg:block rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-14 px-3">SL</TableHead>
                <TableHead className="min-w-60 px-3">Applicant</TableHead>
                <TableHead className="min-w-28 px-3">App Code</TableHead>
                <TableHead className="min-w-36 px-3">Phone</TableHead>
                <TableHead className="min-w-32 px-3">Status</TableHead>
                <TableHead className="min-w-24 px-3 text-center">Documents</TableHead>
                <TableHead className="min-w-32 px-3">Applied Date</TableHead>
                <TableHead className="min-w-24 px-3 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`app-skel-${i}`}>
                  <TableCell className="px-3 py-3">
                    <Skeleton className="h-4 w-6 rounded-md" />
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="size-8 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-36 rounded-md" />
                        <Skeleton className="h-3 w-28 rounded-md" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="px-3 py-3 text-center">
                    <Skeleton className="h-4 w-12 mx-auto rounded-md" />
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <Skeleton className="h-4 w-20 rounded-md" />
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right">
                    <Skeleton className="h-7 w-14 ml-auto rounded-md" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Empty State */}
      {!loading && displayedApplications.length === 0 && (
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted mx-auto text-3xl">
              📄
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              {applications.length === 0 ? 'No applications yet' : 'No matching applications'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {applications.length === 0
                ? 'No candidates have applied for this job yet.'
                : 'Try adjusting your search terms, status, or date filter.'}
            </p>
            {(search || status || dateFilter) && (
              <Button onClick={handleReset} variant="outline" size="sm" className="mt-4 text-xs">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Applications Content */}
      {displayedApplications.length > 0 && (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block rounded-xl border border-border bg-card shadow-xs overflow-hidden">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-14 px-3">SL</TableHead>
                  <TableHead className="min-w-60 px-3">Applicant</TableHead>
                  <TableHead className="min-w-28 px-3">App Code</TableHead>
                  <TableHead className="min-w-36 px-3">Phone</TableHead>
                  <TableHead className="min-w-32 px-3">Status</TableHead>
                  <TableHead className="min-w-24 px-3 text-center">Documents</TableHead>
                  <TableHead className="min-w-32 px-3">Applied Date</TableHead>
                  <TableHead className="min-w-24 px-3 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedApplications.map((application, index) => (
                  <TableRow key={application.id} className="hover:bg-muted/30">
                    {/* SL */}
                    <TableCell className="px-3 py-3">
                      <span className="text-muted-foreground font-medium">{index + 1}</span>
                    </TableCell>

                    {/* Applicant */}
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {application.applicant?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {application.applicant?.name || 'Unknown Applicant'}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {application.applicant?.email || '—'}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* App Code */}
                    <TableCell className="px-3 py-3">
                      {application.applicationCode ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          #{application.applicationCode}
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="px-3 py-3">
                      <span className="text-muted-foreground">
                        {application.applicant?.phone || '—'}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-3 py-3">
                      <ApplicationStatusBadge status={application.status} />
                    </TableCell>

                    {/* Documents */}
                    <TableCell className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FileText className="size-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {application.documents?.length ?? 0}
                        </span>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="px-3 py-3">
                      <span className="text-muted-foreground">
                        {application.appliedAt
                          ? new Date(application.appliedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </span>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="px-3 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Link href={`/dashboard/admin/applications/${application.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1.5 text-[11px] border-border hover:bg-muted"
                          >
                            <Eye className="size-3" />
                            View
                          </Button>
                        </Link>
                        {application.status !== 'CLOSED' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0 border-border hover:bg-muted"
                              >
                                <MoreHorizontal className="size-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => handleCloseApplication(application.id)}
                                className="gap-2 text-xs cursor-pointer text-zinc-400 focus:text-zinc-300"
                              >
                                <XCircle className="size-3.5" />
                                Close Application
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Desktop Load More & Count Footer */}
            <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground">{displayedApplications.length}</span>{' '}
                of <span className="font-medium text-foreground">{total}</span> applications
              </div>

              {hasMore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
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

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {displayedApplications.map((application, index) => (
              <Card key={application.id} className="border-border bg-card shadow-xs">
                <CardContent className="p-4 space-y-3">
                  {/* Header: SL & Applicant */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {application.applicant?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {application.applicant?.name || 'Unknown Applicant'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {application.applicant?.email || '—'}
                      </p>
                      {application.applicant?.phone && (
                        <p className="text-xs text-muted-foreground">
                          {application.applicant.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div className="mt-1">
                        <ApplicationStatusBadge status={application.status} />
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Documents:</span>
                      <div className="font-medium text-foreground mt-1">
                        {application.documents?.length ?? 0} files
                      </div>
                    </div>
                    {application.applicationCode && (
                      <div>
                        <span className="text-muted-foreground">App Code:</span>
                        <div className="mt-1 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          #{application.applicationCode}
                        </div>
                      </div>
                    )}
                    <div className={application.applicationCode ? '' : 'col-span-2'}>
                      <span className="text-muted-foreground">Applied:</span>
                      <div className="font-medium text-foreground mt-1">
                        {application.appliedAt
                          ? new Date(application.appliedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-2 border-t border-border flex items-center gap-2">
                    <Link href={`/dashboard/admin/applications/${application.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 gap-1.5 text-xs border-border"
                      >
                        <Eye className="size-3.5" />
                        View Application
                      </Button>
                    </Link>
                    {application.status !== 'CLOSED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCloseApplication(application.id)}
                        className="h-8 gap-1 text-xs border-border text-zinc-400 hover:text-zinc-200"
                      >
                        <XCircle className="size-3.5" />
                        Close
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Mobile Load More Footer */}
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="text-center text-xs text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground">{displayedApplications.length}</span>{' '}
                of <span className="font-medium text-foreground">{total}</span> applications
              </div>

              {hasMore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
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
      )}
    </div>
  )
}

function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const styles: Record<ApplicationStatus, string> = {
    APPLIED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    SELECTED: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    TASK_ASSIGNED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    TASK_SUBMITTED: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    INTERVIEW_SELECTED:
      'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    INTERVIEW_SCHEDULED:
      'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    INTERVIEW_COMPLETED: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    OFFER_PENDING: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    OFFER_SENT: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    DOCS_SUBMITTED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    HIRED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    REJECTED: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    CLOSED: 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20',
  }

  return (
    <Badge variant="outline" className={`text-[10px] font-medium px-2 py-0.5 ${styles[status]}`}>
      {status ? status.replaceAll('_', ' ') : '—'}
    </Badge>
  )
}
