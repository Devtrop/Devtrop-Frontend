'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { getAdminJobs } from '@/lib/jobs'
import { api } from '@/lib/api'
import type { Job, JobStatus, JobType } from '@/types/job'

import { JobsHeader } from './JobsHeader'
import { JobsStats } from './JobsStats'
import { JobsFilters } from './JobsFilters'
import { JobsTable } from './JobsTable'
import { JobsSkeleton } from './JobsSkeleton'

interface JobsStatsData {
  total: number
  active: number
  draft: number
  closed: number
}

/**
 * =============================================================================
 * JobsHub - Master Jobs Management Component
 * =============================================================================
 */
export function JobsHub() {
  // ---------------------------------------------------------------------------
  // 1. Module State
  // ---------------------------------------------------------------------------
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobStatus | ''>('')
  const [jobTypeFilter, setJobTypeFilter] = useState<JobType | ''>('')
  const [changingStatus, setChangingStatus] = useState<Record<string, boolean>>({})
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest') // Default: latest first

  // Page-based pagination state
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<JobsStatsData>({
    total: 0,
    active: 0,
    draft: 0,
    closed: 0,
  })
  const limit = 20

  // ---------------------------------------------------------------------------
  // 2. Data Fetching
  // ---------------------------------------------------------------------------
  const fetchJobs = useCallback(
    async (loadMore = false) => {
      try {
        if (loadMore) {
          setLoadingMore(true)
        } else {
          setLoading(true)
        }

        if (!api.isAuthenticated()) {
          setJobs([])
          toast.error('You are not authenticated.')
          return
        }

        const currentPage = loadMore ? page + 1 : 1

        const result = await getAdminJobs({
          page: currentPage,
          limit,
          status: statusFilter || undefined,
          jobType: jobTypeFilter || undefined,
          search: search.trim() || undefined,
          sort,
        })

        if (loadMore) {
          // Append new jobs without duplicate IDs
          setJobs((current) => {
            const existingIds = new Set(current.map((job) => job.id))
            const newJobs = (result.data || []).filter((job) => !existingIds.has(job.id))
            return [...current, ...newJobs]
          })
          setPage(currentPage)
        } else {
          // Replace jobs with new data
          setJobs(result.data || [])
          setPage(1)
        }

        setTotal(result.meta.total)
        setHasMore(result.meta.hasMore ?? currentPage < result.meta.totalPages)

        // Update stats from API response if available
        if (result.meta.stats) {
          setStats(result.meta.stats)
        } else {
          setStats({
            total: result.meta.total,
            active: result.data.filter((j) => j.status === 'ACTIVE').length,
            draft: result.data.filter((j) => j.status === 'DRAFT').length,
            closed: result.data.filter((j) => j.status === 'CLOSED').length,
          })
        }
      } catch (error) {
        if (!loadMore) {
          setJobs([])
        }
        toast.error(error instanceof Error ? error.message : 'Failed to load jobs.')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [page, statusFilter, jobTypeFilter, search, sort],
  )

  // Debounced fetch for filters, search and sort order
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchJobs(false)
    }, 350)

    return () => {
      window.clearTimeout(timer)
    }
  }, [statusFilter, jobTypeFilter, sort, search])

  // ---------------------------------------------------------------------------
  // 3. Action Handlers
  // ---------------------------------------------------------------------------
  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      void fetchJobs(true)
    }
  }

  const handleReset = () => {
    setSearch('')
    setStatusFilter('')
    setJobTypeFilter('')
    setSort('latest')
  }

  const handleToggleSort = () => {
    setSort((prev) => (prev === 'latest' ? 'oldest' : 'latest'))
  }

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    try {
      setChangingStatus((prev) => ({ ...prev, [jobId]: true }))

      await api.patch(`/jobs/${jobId}/status`, { status: newStatus })

      // Update local state optimistically & recalculate stats immediately
      setJobs((prev) => {
        const nextJobs = prev.map((job) => (job.id === jobId ? { ...job, status: newStatus } : job))
        setStats((prevStats) => ({
          total: prevStats.total,
          active: nextJobs.filter((j) => j.status === 'ACTIVE').length,
          draft: nextJobs.filter((j) => j.status === 'DRAFT').length,
          closed: nextJobs.filter((j) => j.status === 'CLOSED').length,
        }))
        return nextJobs
      })

      toast.success(`Job status updated to ${newStatus}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update job status')
    } finally {
      setChangingStatus((prev) => ({ ...prev, [jobId]: false }))
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    // Optimistically remove from UI & update stats
    setJobs((prev) => {
      const nextJobs = prev.filter((job) => job.id !== jobId)
      setStats((prevStats) => ({
        total: Math.max(0, prevStats.total - 1),
        active: nextJobs.filter((j) => j.status === 'ACTIVE').length,
        draft: nextJobs.filter((j) => j.status === 'DRAFT').length,
        closed: nextJobs.filter((j) => j.status === 'CLOSED').length,
      }))
      return nextJobs
    })
    setTotal((prev) => Math.max(0, prev - 1))
    toast.success('Job deleted successfully')
  }

  // ---------------------------------------------------------------------------
  // 4. Layout Composition
  // ---------------------------------------------------------------------------
  return (
    <RoleGuard
      fallback={<JobsSkeleton />}
      permissions={[
        'job_post.read',
        'job_post.create',
        'job_post.update',
        'job_post.delete',
        'job_post.publish',
        'job.read',
        'job.create',
        'job.update',
        'job.delete',
        'jobs.read',
        'jobs.manage',
      ]}
      allowedRoles={['SUPER_ADMIN', 'ADMIN']}
    >
      <div className="space-y-6">
        {/* Header */}
        <JobsHeader onToggleSort={handleToggleSort} sort={sort} />

        {/* Stats */}
        <JobsStats stats={stats} />

        {/* Filters */}
        <JobsFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          jobTypeFilter={jobTypeFilter}
          onJobTypeChange={setJobTypeFilter}
          sort={sort}
          onSortChange={setSort}
          onReset={handleReset}
          loading={loading}
        />

        {/* Table */}
        <JobsTable
          jobs={jobs}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          changingStatus={changingStatus}
          onStatusChange={handleStatusChange}
          onDeleteJob={handleDeleteJob}
          total={total}
        />
      </div>
    </RoleGuard>
  )
}
