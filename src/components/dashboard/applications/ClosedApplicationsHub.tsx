'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArchiveRestore,
  ArchiveX,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { AdminSectionSkeleton } from '@/components/dashboard/admin/AdminSectionSkeleton'
import { CandidateDrawer, type DrawerCandidate } from '@/components/dashboard/common/CandidateDrawer'
import { ApplicationStatusBadge } from '@/components/dashboard/applications/ApplicationStatusBadge'
import { api } from '@/lib/api'
import { getAdminJobs } from '@/lib/jobs'
import {
  downloadDocument,
  getDocumentDownloadUrl,
  updateApplicationStatus,
} from '@/lib/applications'
import type { Application, ApplicationDocument, ApplicationStatus } from './ApplicationsHub'

const LIMIT = 20

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getCvDocument(application: Application): ApplicationDocument | undefined {
  return application.documents?.find((doc) => {
    const t = doc.type?.toUpperCase()
    return t === 'CV' || t === 'RESUME'
  })
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function ClosedApplicationsHub() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [jobId, setJobId] = useState('')
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest')

  // Pagination
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  // Jobs dropdown
  const [jobsList, setJobsList] = useState<Array<{ id: string; title: string; jobCode?: string }>>([])

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerCandidate, setDrawerCandidate] = useState<DrawerCandidate | null>(null)

  // Re-open dialog state
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false)
  const [applicationToReopen, setApplicationToReopen] = useState<Application | null>(null)
  const [reopenTargetStatus, setReopenTargetStatus] = useState<ApplicationStatus>('APPLIED')
  const [reopening, setReopening] = useState(false)

  // Load jobs list for dropdown filter
  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await getAdminJobs({ limit: 100 })
        if (Array.isArray(res?.data)) {
          setJobsList(res.data.map((j) => ({ id: j.id, title: j.title, jobCode: j.jobCode })))
        }
      } catch {
        // gracefully continue
      }
    }
    void loadJobs()
  }, [])

  // Load closed applications
  const loadApplications = useCallback(
    async (targetPage: number, append = false) => {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      try {
        if (!api.isAuthenticated()) {
          setApplications([])
          setTotal(0)
          setPage(1)
          setHasMore(false)
          toast.error('You are not authenticated.')
          return
        }

        const response = await api.getRaw<{
          data: Application[]
          meta: { total: number; page: number; limit: number; totalPages: number; hasMore: boolean }
        }>('/applications/admin', {
          page: targetPage,
          limit: LIMIT,
          status: 'CLOSED',
          jobId: jobId || undefined,
          search: search.trim() || undefined,
          sort,
        })

        const data = Array.isArray(response.data?.data) ? response.data.data : []
        const meta = response.data?.meta

        if (append) {
          setApplications((prev) => {
            const existingIds = new Set(prev.map((app) => app.id))
            const newRows = data.filter((app) => !existingIds.has(app.id))
            return [...prev, ...newRows]
          })
        } else {
          setApplications(data)
        }

        setTotal(meta?.total ?? data.length)
        setPage(meta?.page ?? targetPage)
        setHasMore(meta?.hasMore ?? false)
      } catch (error) {
        console.error('Failed to load closed applications:', error)
        if (!append) {
          setApplications([])
          setTotal(0)
          setPage(1)
          setHasMore(false)
        }
        toast.error(error instanceof Error ? error.message : 'Failed to load closed applications.')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [jobId, search, sort],
  )

  // Debounced load on filter changes
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1)
      void loadApplications(1, false)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [loadApplications])

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return
    void loadApplications(page + 1, true)
  }, [loading, loadingMore, hasMore, page, loadApplications])

  const handleResetFilters = useCallback(() => {
    setSearch('')
    setJobId('')
    setSort('latest')
    setPage(1)
  }, [])

  const handleViewCV = async (app: Application) => {
    const doc = getCvDocument(app)
    if (!doc) {
      toast.error('No CV uploaded for this application.')
      return
    }

    try {
      const url = getDocumentDownloadUrl(app.id, doc.storageKey)
      window.open(url, '_blank')
    } catch {
      await downloadDocument(app.id, doc.storageKey, `${app.applicant.name}-CV.pdf`)
    }
  }

  const openDrawerForApp = (app: Application) => {
    setDrawerCandidate({
      id: app.id,
      applicationId: app.id,
      status: app.status,
      appliedAt: app.appliedAt,
      applicant: {
        id: app.applicant.id,
        name: app.applicant.name,
        email: app.applicant.email,
        phone: app.applicant.phone,
        address: app.applicant.address,
        github: app.applicant.github,
        portfolio: app.applicant.portfolio,
        linkedin: app.applicant.linkedin,
      },
      job: {
        id: app.job.id,
        title: app.job.title,
        jobCode: app.job.jobCode,
      },
      documents: app.documents?.map((d) => ({
        id: d.id,
        type: d.type,
        storageKey: d.storageKey,
        mimeType: d.mimeType,
        size: d.size,
        createdAt: d.createdAt,
      })),
    })
    setDrawerOpen(true)
  }

  const openReopenDialog = (app: Application) => {
    setApplicationToReopen(app)
    setReopenTargetStatus('APPLIED')
    setReopenDialogOpen(true)
  }

  const handleReopen = async () => {
    if (!applicationToReopen) return

    try {
      setReopening(true)
      const targetId = applicationToReopen.id
      await updateApplicationStatus(targetId, reopenTargetStatus)

      // Remove immediately from closed applications list
      setApplications((prev) => prev.filter((a) => a.id !== targetId))
      setTotal((prev) => Math.max(0, prev - 1))

      toast.success(
        `Application re-opened and returned to active pipeline as ${reopenTargetStatus}.`,
      )
      setReopenDialogOpen(false)
      setApplicationToReopen(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to re-open application.')
    } finally {
      setReopening(false)
    }
  }

  return (
    <RoleGuard
      permissions={['application.read']}
      fallback={<AdminSectionSkeleton />}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-none bg-zinc-500/10 text-muted ring-1 ring-zinc-500/20">
                <ArchiveX className="size-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Closed Applications
              </h1>
              {!loading && (
                <span className="inline-flex items-center rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-semibold text-muted ring-1 ring-inset ring-zinc-500/20">
                  {total}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Archive of terminated applications. Closed applications are excluded from active
              pipelines and can be re-opened at any time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadApplications(1, false)}
              disabled={loading}
              className="gap-1.5 text-xs h-9"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs h-9">
              <Link href="/dashboard/admin/applications">
                <Eye className="size-3.5" />
                Active Applications
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <Card className="border border-border/80 bg-card/60 backdrop-blur-xs">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search candidate name, email, or code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Job Filter */}
                <div className="w-full sm:w-[220px]">
                  <Select value={jobId || 'ALL'} onValueChange={(val) => setJobId(val === 'ALL' ? '' : val)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="All Jobs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Jobs</SelectItem>
                      {jobsList.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title} {job.jobCode ? `(#${job.jobCode})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="w-full sm:w-[150px]">
                  <Select
                    value={sort}
                    onValueChange={(val) => setSort(val as 'latest' | 'oldest')}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(search || jobId || sort !== 'latest') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-9"
                >
                  <RotateCcw className="size-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {loading ? (
          <div className="rounded-none border border-border bg-card p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-none border border-dashed border-border bg-card/40 py-16 px-4 text-center">
            <div className="rounded-full bg-muted/60 p-4 ring-1 ring-border">
              <ArchiveX className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">
              No closed applications found
            </h3>
            <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
              {search || jobId
                ? 'No closed applications matched your search or filters.'
                : 'There are currently no closed applications. Applications marked as Closed will be stored in this archive.'}
            </p>
            {(search || jobId) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-4 gap-1.5 text-xs"
              >
                <RotateCcw className="size-3.5" />
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block rounded-none border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[280px]">Candidate</TableHead>
                    <TableHead>Applied Job</TableHead>
                    <TableHead className="w-[120px]">Application Code</TableHead>
                    <TableHead className="w-[130px]">Applied Date</TableHead>
                    <TableHead className="w-[110px]">Status</TableHead>
                    <TableHead className="w-[80px]">CV</TableHead>
                    <TableHead className="w-[110px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => {
                    const cv = getCvDocument(app)
                    return (
                      <TableRow key={app.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-muted/80 ring-1 ring-border flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
                              {getInitials(app.applicant.name)}
                            </div>
                            <div className="min-w-0">
                              <button
                                onClick={() => openDrawerForApp(app)}
                                className="font-medium text-foreground hover:underline text-left truncate block max-w-[200px]"
                              >
                                {app.applicant.name}
                              </button>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {app.applicant.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground text-xs">{app.job.title}</p>
                            {app.job.jobCode && (
                              <p className="text-[11px] font-mono text-muted-foreground">
                                #{app.job.jobCode}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground">
                            {app.applicationCode ? `#${app.applicationCode}` : '—'}
                          </span>
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(app.appliedAt)}
                        </TableCell>

                        <TableCell>
                          <ApplicationStatusBadge status="CLOSED" />
                        </TableCell>

                        <TableCell>
                          {cv ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void handleViewCV(app)}
                              className="h-7 text-xs gap-1 px-2 text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="size-3" />
                              CV
                            </Button>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReopenDialog(app)}
                              className="h-8 gap-1.5 text-xs border-accent text-accent dark:text-accent hover:bg-accent-soft"
                              title="Re-open Application"
                            >
                              <ArchiveRestore className="size-3.5" />
                              Re-open
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openDrawerForApp(app)}>
                                  <Eye className="mr-2 size-4" />
                                  View Candidate Details
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/admin/applications/${app.id}`}>
                                    <FileText className="mr-2 size-4" />
                                    Full Application View
                                  </Link>
                                </DropdownMenuItem>

                                {cv && (
                                  <DropdownMenuItem onClick={() => void handleViewCV(app)}>
                                    <Download className="mr-2 size-4" />
                                    Download CV
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  className="text-accent dark:text-accent focus:text-accent focus:bg-accent-soft"
                                  onClick={() => openReopenDialog(app)}
                                >
                                  <ArchiveRestore className="mr-2 size-4" />
                                  Re-open Application
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {applications.map((app) => {
                const cv = getCvDocument(app)
                return (
                  <Card key={app.id} className="border border-border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground">
                          {getInitials(app.applicant.name)}
                        </div>
                        <div>
                          <button
                            onClick={() => openDrawerForApp(app)}
                            className="font-medium text-foreground hover:underline text-sm text-left block"
                          >
                            {app.applicant.name}
                          </button>
                          <p className="text-xs text-muted-foreground">{app.applicant.email}</p>
                        </div>
                      </div>
                      <ApplicationStatusBadge status="CLOSED" />
                    </div>

                    <div className="border-t border-border/50 pt-2 text-xs text-muted-foreground flex justify-between">
                      <span>Job: {app.job.title}</span>
                      <span>Applied: {formatDate(app.appliedAt)}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/50">
                      {cv && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleViewCV(app)}
                          className="h-8 gap-1.5 text-xs"
                        >
                          <Eye className="size-3.5" />
                          CV
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReopenDialog(app)}
                        className="h-8 gap-1.5 text-xs border-accent text-accent dark:text-accent hover:bg-accent-soft"
                      >
                        <ArchiveRestore className="size-3.5" />
                        Re-open
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDrawerForApp(app)}
                        className="h-8 gap-1 text-xs"
                      >
                        Details
                        <ChevronRight className="size-3.5" />
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Pagination footer with centered pill Load More */}
            <div className="flex flex-col items-center justify-center gap-3 pt-4 pb-2">
              {hasMore ? (
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="rounded-full px-7 py-2 h-9 text-xs font-medium border border-border/80 bg-card/80 backdrop-blur-xs hover:bg-accent-soft hover:border-accent hover:text-accent transition-all gap-2 cursor-pointer"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin text-accent" />
                      <span>Loading more...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More</span>
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                    </>
                  )}
                </Button>
              ) : applications.length > 0 ? (
                <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 bg-muted/30 border border-border/50 text-[11px] font-medium text-muted-foreground">
                  <span>All {total} closed applications loaded</span>
                </div>
              ) : null}

              <p className="text-[11px] text-muted-foreground text-center">
                Showing <span className="font-semibold text-foreground">{applications.length}</span> of{' '}
                <span className="font-semibold text-foreground">{total}</span> closed applications
              </p>
            </div>
          </div>
        )}

        {/* Candidate Slide-Over Drawer */}
        <CandidateDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          candidate={drawerCandidate}
        />

        {/* Re-open Confirmation Dialog */}
        <Dialog open={reopenDialogOpen} onOpenChange={setReopenDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArchiveRestore className="size-5 text-accent" />
                Re-open Application
              </DialogTitle>
              <DialogDescription>
                Restore the application for{' '}
                <span className="font-semibold text-foreground">
                  {applicationToReopen?.applicant.name}
                </span>{' '}
                to the active hiring pipeline.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <label className="text-xs font-medium text-muted-foreground">
                Select Active Pipeline Stage:
              </label>
              <Select
                value={reopenTargetStatus}
                onValueChange={(val) => setReopenTargetStatus(val as ApplicationStatus)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPLIED">Applied (Initial review stage)</SelectItem>
                  <SelectItem value="SELECTED">Selected (Assessment ready)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                disabled={reopening}
                onClick={() => {
                  setReopenDialogOpen(false)
                  setApplicationToReopen(null)
                }}
              >
                Cancel
              </Button>

              <Button
                disabled={reopening}
                onClick={() => void handleReopen()}
                className="bg-accent hover:bg-accent text-white"
              >
                {reopening ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <ArchiveRestore className="mr-2 size-4" />
                    Re-open to {reopenTargetStatus}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  )
}
