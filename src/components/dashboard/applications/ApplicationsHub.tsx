'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { AdminSectionSkeleton } from '@/components/dashboard/admin/AdminSectionSkeleton'
import { api, type RawApiResponse } from '@/lib/api'
import { getAdminJobs } from '@/lib/jobs'

import { ApplicationsFilters } from './ApplicationsFilters'
import { ApplicationsHeader } from './ApplicationsHeader'
import { ApplicationsStats } from './ApplicationsStats'
import { ApplicationsTable } from './ApplicationsTable'
import { AssignTaskModal } from './AssignTaskModal'

export type ApplicationStatus =
  | 'APPLIED'
  | 'SELECTED'
  | 'TASK_ASSIGNED'
  | 'TASK_SUBMITTED'
  | 'INTERVIEW_SELECTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_COMPLETED'
  | 'OFFER_PENDING'
  | 'OFFER_SENT'
  | 'DOCS_SUBMITTED'
  | 'HIRED'
  | 'REJECTED'
  | 'CLOSED'

export type ApplicationSortOrder = 'latest' | 'oldest'

export interface ApplicationDocument {
  id: string
  type: string
  storageKey: string
  mimeType: string
  size: number
  createdAt: string
}

export interface Application {
  id: string
  applicationCode?: string
  status: ApplicationStatus
  appliedAt: string
  createdAt?: string
  updatedAt?: string

  applicant: {
    id: string
    name: string
    email: string
    phone?: string
    address?: string
    github?: string
    portfolio?: string
    linkedin?: string
  }

  job: {
    id: string
    jobCode?: string
    title: string
    experience?: string
    salaryRange?: string
    status?: string
  }

  documents?: ApplicationDocument[]

  _count?: {
    documents?: number
    interviews?: number
    taskAssignments?: number
  }
}

interface ApplicationsMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

interface ApplicationsApiData {
  success: boolean
  message: string
  data: Application[]
  meta: ApplicationsMeta
}

interface ApplicationsStatsData {
  total: number
  applied: number
  selected: number
  hired: number
  rejected: number
}

const ASSIGNABLE_STATUSES = new Set<ApplicationStatus>(['SELECTED'])

const LIMIT = 20

export function ApplicationsHub() {
  const [applications, setApplications] = useState<Application[]>([])

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const [jobSearch, setJobSearch] = useState('')
  const [jobCode, setJobCode] = useState('')
  const [applicationCode, setApplicationCode] = useState('')
  const [status, setStatus] = useState<ApplicationStatus | ''>('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<ApplicationSortOrder>('latest')

  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [jobsList, setJobsList] = useState<Array<{ id: string; title: string; jobCode?: string }>>(
    [],
  )

  const [assignModalOpen, setAssignModalOpen] = useState(false)

  useEffect(() => {
    async function loadJobsList() {
      try {
        const res = await getAdminJobs({ limit: 100 })
        if (Array.isArray(res?.data)) {
          setJobsList(res.data.map((j) => ({ id: j.id, title: j.title, jobCode: j.jobCode })))
        }
      } catch {
        // Continue gracefully if jobs list cannot be loaded
      }
    }
    void loadJobsList()
  }, [])

  /**
   * Load applications.
   *
   * append = false
   * Replaces the current list.
   *
   * append = true
   * Appends the next page for Load More.
   */
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

        const response = await api.getRaw<ApplicationsApiData>('/applications/admin', {
          page: targetPage,
          limit: LIMIT,

          jobName: jobSearch.trim() || undefined,

          jobCode: jobCode.trim() || undefined,

          applicationCode: applicationCode.trim() || undefined,

          status: status || undefined,

          search: search.trim() || undefined,

          sort,
        })

        const data = Array.isArray(response.data?.data) ? response.data.data : []

        const meta: ApplicationsMeta = {
          total: response.data?.meta?.total ?? 0,
          page: response.data?.meta?.page ?? targetPage,
          limit: response.data?.meta?.limit ?? LIMIT,
          totalPages: response.data?.meta?.totalPages ?? 0,
          hasMore: response.data?.meta?.hasMore ?? false,
        }

        if (append) {
          setApplications((current) => {
            const existingIds = new Set(current.map((application) => application.id))

            const newApplications = data.filter((application) => !existingIds.has(application.id))

            return [...current, ...newApplications]
          })
        } else {
          setApplications(data)
          setSelectedIds(new Set())
        }

        setTotal(meta.total)
        setPage(meta.page)
        setHasMore(meta.hasMore)
      } catch (error) {
        console.error('Failed to load applications:', error)

        if (!append) {
          setApplications([])
          setTotal(0)
          setPage(1)
          setHasMore(false)
        }

        toast.error(error instanceof Error ? error.message : 'Failed to load applications.')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [jobSearch, jobCode, applicationCode, status, search, sort],
  )
  /**
   * Initial applications load only.
   *
   * Do NOT add loadApplications to this dependency list.
   * loadApplications depends on filter values, and adding it here
   * would cause requests while typing in the filters.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSelectedIds(new Set())
      setPage(1)
      void loadApplications(1, false)
    }, 350)

    return () => {
      window.clearTimeout(timer)
    }
  }, [loadApplications])

  /**
   * Load next page.
   */
  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) {
      return
    }

    void loadApplications(page + 1, true)
  }, [loading, loadingMore, hasMore, page, loadApplications])

  /**
   * Reset all filters and reload the first page.
   */
  const handleReset = useCallback(() => {
    setJobSearch('')
    setJobCode('')
    setApplicationCode('')
    setStatus('')
    setSearch('')
    setSort('latest')

    setSelectedIds(new Set())
    setPage(1)
  }, [])

  /**
   * Optimistic status change handler without resetting list or full page reload.
   */
  const handleApplicationStatusChange = useCallback(
    (applicationId: string, newStatus: ApplicationStatus) => {
      if (newStatus === 'CLOSED') {
        setApplications((prev) => prev.filter((app) => app.id !== applicationId))
        setTotal((prev) => Math.max(0, prev - 1))
      } else {
        setApplications((prev) =>
          prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app)),
        )
      }
    },
    [],
  )

  /**
   * Optimistic delete handler without resetting list.
   */
  const handleApplicationDeleted = useCallback((applicationId: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== applicationId))
    setTotal((prev) => Math.max(0, prev - 1))
  }, [])

  /**
   * Refresh applications after task assignment or other non-optimistic action.
   */
  const handleApplicationUpdated = useCallback(async () => {
    await loadApplications(1, false)
  }, [loadApplications])

  /**
   * Open Assign Task modal.
   *
   * If called from a specific row, automatically select that application.
   */
  const handleAssignTask = useCallback((application?: Application) => {
    if (application) {
      setSelectedIds(new Set([application.id]))
    }

    setAssignModalOpen(true)
  }, [])

  /**
   * Bulk selected applications.
   */
  const selectedApplications = useMemo(
    () => applications.filter((application) => selectedIds.has(application.id)),
    [applications, selectedIds],
  )

  /**
   * Only SELECTED applications can receive a task.
   */
  const assignableCount = useMemo(
    () =>
      selectedApplications.filter((application) => ASSIGNABLE_STATUSES.has(application.status))
        .length,
    [selectedApplications],
  )

  /**
   * Dashboard stats.
   *
   * `total` is the server-side total.
   * Status-specific values are based on currently loaded applications.
   */
  const stats: ApplicationsStatsData = useMemo(
    () => ({
      total,

      applied: applications.filter((application) => application.status === 'APPLIED').length,

      selected: applications.filter((application) => application.status === 'SELECTED').length,

      hired: applications.filter((application) => application.status === 'HIRED').length,

      rejected: applications.filter((application) => application.status === 'REJECTED').length,
    }),
    [applications, total],
  )

  const handleAssignTaskComplete = useCallback(async () => {
    setSelectedIds(new Set())
    setAssignModalOpen(false)

    await handleApplicationUpdated()
  }, [handleApplicationUpdated])

  return (
    <RoleGuard
      fallback={<AdminSectionSkeleton titleWidth="w-52" statCardsCount={5} />}
      permissions={[
        'application.read',
        'application.create',
        'application.update',
        'application.delete',
        'applications.read',
        'applications.manage',
      ]}
      allowedRoles={['SUPER_ADMIN', 'ADMIN']}
    >
      <div className="space-y-6">
        <ApplicationsHeader />

        <ApplicationsStats stats={stats} />

        <ApplicationsFilters
          jobSearch={jobSearch}
          onJobSearchChange={setJobSearch}
          jobCode={jobCode}
          onJobCodeChange={setJobCode}
          applicationCode={applicationCode}
          onApplicationCodeChange={setApplicationCode}
          search={search}
          onSearchChange={setSearch}
          jobs={jobsList}
          status={status}
          onStatusChange={setStatus}
          sort={sort}
          onSortChange={setSort}
          loading={loading}
          onReset={handleReset}
        />

        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 shadow-xs">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{selectedIds.size}</span> selected
              {assignableCount > 0 && (
                <>
                  {' '}
                  · <span className="font-medium text-foreground">{assignableCount}</span> ready for
                  task assignment
                </>
              )}
            </p>

            <Button
              size="sm"
              onClick={() => setAssignModalOpen(true)}
              disabled={selectedIds.size === 0}
              className="gap-1.5 text-xs"
            >
              <Send className="size-3.5" />
              Send Task
            </Button>
          </div>
        )}

        <ApplicationsTable
          applications={applications}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          total={total}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onAssignTask={handleAssignTask}
          assignableCount={assignableCount}
          onApplicationUpdated={handleApplicationUpdated}
          onStatusChange={handleApplicationStatusChange}
          onDeleteApplication={handleApplicationDeleted}
        />

        <AssignTaskModal
          open={assignModalOpen}
          selectedApplications={selectedApplications}
          onClose={() => setAssignModalOpen(false)}
          onComplete={handleAssignTaskComplete}
        />
      </div>
    </RoleGuard>
  )
}
