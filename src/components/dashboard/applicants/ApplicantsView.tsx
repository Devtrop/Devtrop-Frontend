'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { getAdminJobs } from '@/lib/jobs'
import {
  exportApplicants,
  getApplicants,
  type Applicant,
  type ApplicantFilters,
  type ApplicantsMeta,
} from '@/lib/applicants'

import { ApplicantsFilters, type JobOption } from './ApplicantsFilters'
import { ApplicantsHeader } from './ApplicantsHeader'
import { ApplicantsTable } from './ApplicantsTable'

const LIMIT = 20

export interface ApplicantsViewProps {
  initialApplicants?: Applicant[]
  initialMeta?: ApplicantsMeta
  initialJobs?: JobOption[]
  initialFilters?: ApplicantFilters
}

export function ApplicantsView({
  initialApplicants = [],
  initialMeta,
  initialJobs = [],
  initialFilters,
}: ApplicantsViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State initialization from SSR initialFilters or URL query parameters
  const [search, setSearch] = useState(() => initialFilters?.search ?? searchParams?.get('search') ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  const [status, setStatus] = useState(() => initialFilters?.status ?? searchParams?.get('status') ?? '')
  const [jobId, setJobId] = useState(() => initialFilters?.jobId ?? searchParams?.get('jobId') ?? '')
  const [jobCode, setJobCode] = useState(() => initialFilters?.jobCode ?? searchParams?.get('jobCode') ?? '')
  const [dateFrom, setDateFrom] = useState(() => initialFilters?.dateFrom ?? searchParams?.get('dateFrom') ?? '')
  const [dateTo, setDateTo] = useState(() => initialFilters?.dateTo ?? searchParams?.get('dateTo') ?? '')
  const [page, setPage] = useState(1)

  // Debounce search input changes (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 350)
    return () => clearTimeout(handler)
  }, [search])

  // Data & loading states initialized with SSR data
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants)
  const [meta, setMeta] = useState<ApplicantsMeta>(
    initialMeta || {
      total: initialApplicants.length,
      page: 1,
      limit: LIMIT,
      totalPages: Math.ceil(initialApplicants.length / LIMIT) || 1,
      hasMore: false,
    },
  )
  const [total, setTotal] = useState(() => initialMeta?.total ?? initialApplicants.length)
  const [hasMore, setHasMore] = useState(() => initialMeta?.hasMore ?? false)

  const [loading, setLoading] = useState(() => initialApplicants.length === 0 && !initialMeta)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Jobs dropdown options initialized with SSR data
  const [jobsList, setJobsList] = useState<JobOption[]>(initialJobs)

  const isInitialMount = useRef(true)

  // Load jobs list for dropdown filter if not provided via SSR
  useEffect(() => {
    if (initialJobs.length > 0) return
    async function loadJobs() {
      try {
        const res = await getAdminJobs({ limit: 100 })
        if (Array.isArray(res?.data)) {
          setJobsList(
            res.data.map((j) => ({
              id: j.id,
              title: j.title,
              jobCode: j.jobCode,
            })),
          )
        }
      } catch {
        // Continue gracefully if jobs list fails to load
      }
    }
    void loadJobs()
  }, [initialJobs.length])

  // Sync state back to URL query string
  const updateUrlQueryParams = useCallback(
    (newParams: Record<string, string | number | undefined>) => {
      const currentUrl = new URL(window.location.href)

      Object.entries(newParams).forEach(([key, val]) => {
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          currentUrl.searchParams.set(key, String(val))
        } else {
          currentUrl.searchParams.delete(key)
        }
      })

      window.history.replaceState(null, '', currentUrl.toString())
    },
    [],
  )

  // Sync debounced search to URL query string
  const isDebounceMount = useRef(true)
  useEffect(() => {
    if (isDebounceMount.current) {
      isDebounceMount.current = false
      return
    }
    setPage(1)
    updateUrlQueryParams({ search: debouncedSearch })
  }, [debouncedSearch, updateUrlQueryParams])

  // Fetch applicants data on client state changes or Load More
  const fetchApplicantsList = useCallback(
    async (targetPage = 1, append = false) => {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      try {
        const filters: ApplicantFilters = {
          page: targetPage,
          limit: LIMIT,
          search: debouncedSearch,
          status,
          jobId,
          jobCode,
          dateFrom,
          dateTo,
        }

        const res = await getApplicants(filters)

        let list: Applicant[] = []
        let metaData: ApplicantsMeta = {
          total: 0,
          page: targetPage,
          limit: LIMIT,
          totalPages: 1,
          hasMore: false,
        }

        if (res) {
          const rawObj = res as Record<string, any>
          let foundData: any = null
          let foundMeta: any = null

          if (Array.isArray(res)) {
            foundData = res
          } else if (Array.isArray(rawObj.data)) {
            foundData = rawObj.data
            foundMeta = rawObj.meta
          } else if (Array.isArray(rawObj.applicants)) {
            foundData = rawObj.applicants
            foundMeta = rawObj.meta
          } else if (rawObj.data && typeof rawObj.data === 'object' && !Array.isArray(rawObj.data)) {
            const innerData = rawObj.data as Record<string, any>
            if (Array.isArray(innerData.data)) {
              foundData = innerData.data
            } else if (Array.isArray(innerData.applicants)) {
              foundData = innerData.applicants
            } else if (Array.isArray(innerData.items)) {
              foundData = innerData.items
            }
            foundMeta = innerData.meta || innerData.pagination || rawObj.meta
          }

          if (Array.isArray(foundData)) {
            list = foundData as Applicant[]
          }

          if (foundMeta && typeof foundMeta === 'object') {
            metaData = {
              total: Number(foundMeta.total ?? list.length),
              page: Number(foundMeta.page ?? targetPage),
              limit: Number(foundMeta.limit ?? LIMIT),
              totalPages: Number(foundMeta.totalPages ?? (Math.ceil(list.length / LIMIT) || 1)),
              hasMore: Boolean(foundMeta.hasMore),
            }
          } else {
            metaData = {
              total: list.length,
              page: targetPage,
              limit: LIMIT,
              totalPages: Math.ceil(list.length / LIMIT) || 1,
              hasMore: false,
            }
          }
        }

        if (append) {
          setApplicants((current) => {
            const existingIds = new Set(current.map((item) => item.id))
            const newItems = list.filter((item) => !existingIds.has(item.id))
            return [...current, ...newItems]
          })
        } else {
          setApplicants(list)
          setSelectedIds(new Set())
        }

        setMeta(metaData)
        setTotal(metaData.total)
        setPage(metaData.page)
        setHasMore(metaData.hasMore)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to load applicants.'
        setError(msg)
        toast.error(msg)
        if (!append) {
          setApplicants([])
          setTotal(0)
          setPage(1)
          setHasMore(false)
        }
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [debouncedSearch, status, jobId, jobCode, dateFrom, dateTo],
  )

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      if (initialApplicants.length > 0 || initialMeta) {
        return
      }
    }
    void fetchApplicantsList(1, false)
  }, [fetchApplicantsList, initialApplicants.length, initialMeta])

  // Load next page of applicants
  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) {
      return
    }
    void fetchApplicantsList(page + 1, true)
  }, [loading, loadingMore, hasMore, page, fetchApplicantsList])

  // Handlers for filter state changes
  const handleSearchChange = (val: string) => {
    setSearch(val)
  }

  const handleStatusChange = (val: string) => {
    setStatus(val)
    setPage(1)
    updateUrlQueryParams({ status: val })
  }

  const handleJobIdChange = (val: string) => {
    setJobId(val)
    setPage(1)
    updateUrlQueryParams({ jobId: val })
  }

  const handleJobCodeChange = (val: string) => {
    setJobCode(val)
    setPage(1)
    updateUrlQueryParams({ jobCode: val })
  }

  const handleDateFromChange = (val: string) => {
    setDateFrom(val)
    setPage(1)
    updateUrlQueryParams({ dateFrom: val })
  }

  const handleDateToChange = (val: string) => {
    setDateTo(val)
    setPage(1)
    updateUrlQueryParams({ dateTo: val })
  }

  const handleResetFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setStatus('')
    setJobId('')
    setJobCode('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
    window.history.replaceState(null, '', pathname)
  }

  // Handle Export Applicants to Excel
  const handleExport = async () => {
    if (isExporting) return

    try {
      setIsExporting(true)
      await exportApplicants({
        search,
        status,
        jobId,
        jobCode,
        dateFrom,
        dateTo,
      })
      toast.success('Applicants exported successfully.')
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to export applicants. Please try again.'
      toast.error(msg)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <ApplicantsHeader
        onExport={handleExport}
        isExporting={isExporting}
        totalCount={total}
      />

      {/* Filters Toolbar */}
      <ApplicantsFilters
        search={search}
        onSearchChange={handleSearchChange}
        jobId={jobId}
        onJobIdChange={handleJobIdChange}
        jobCode={jobCode}
        onJobCodeChange={handleJobCodeChange}
        jobs={jobsList}
        status={status}
        onStatusChange={handleStatusChange}
        dateFrom={dateFrom}
        onDateFromChange={handleDateFromChange}
        dateTo={dateTo}
        onDateToChange={handleDateToChange}
        loading={loading}
        onReset={handleResetFilters}
      />

      {/* Error State Banner */}
      {error && !loading && (
        <div className="flex items-center justify-between rounded-none border border-destructive/50 bg-destructive/10 p-4 text-xs text-destructive">
          <span>{error}</span>
          <button
            onClick={() => void fetchApplicantsList(1, false)}
            className="font-semibold underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Applicants Data Table with Load More pagination */}
      <ApplicantsTable
        applicants={applicants}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        total={total}
        page={page}
        limit={LIMIT}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRetry={() => void fetchApplicantsList(1, false)}
      />
    </div>
  )
}
