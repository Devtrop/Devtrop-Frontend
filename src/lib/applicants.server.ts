import { serverFetch } from './server-api'
import type { Applicant, ApplicantFilters, ApplicantsMeta } from './applicants'

/**
 * Server-side data fetcher for Server Components (SSR).
 * Uses HTTP cookies and server-side fetch.
 */
export async function getServerApplicants(filters: ApplicantFilters = {}): Promise<{
  list: Applicant[]
  meta: ApplicantsMeta
}> {
  const query = new URLSearchParams()
  query.set('page', String(filters.page ?? 1))
  query.set('limit', String(filters.limit ?? 20))

  if (filters.search?.trim()) query.set('search', filters.search.trim())
  if (filters.status?.trim()) query.set('status', filters.status.trim())
  if (filters.jobId?.trim()) query.set('jobId', filters.jobId.trim())
  if (filters.jobCode?.trim()) query.set('jobCode', filters.jobCode.trim())
  if (filters.dateFrom?.trim()) query.set('dateFrom', filters.dateFrom.trim())
  if (filters.dateTo?.trim()) query.set('dateTo', filters.dateTo.trim())

  const res = await serverFetch<any>(`/applicants?${query.toString()}`)

  let list: Applicant[] = []
  let meta: ApplicantsMeta = {
    total: 0,
    page: filters.page ?? 1,
    limit: 20,
    totalPages: 1,
    hasMore: false,
  }

  if (res.success && res.data) {
    const rawObj = res.data as Record<string, any>
    let foundData: any = null
    let foundMeta: any = null

    if (Array.isArray(rawObj)) {
      foundData = rawObj
    } else if (Array.isArray(rawObj.data)) {
      foundData = rawObj.data
      foundMeta = rawObj.meta
    } else if (Array.isArray(rawObj.applicants)) {
      foundData = rawObj.applicants
      foundMeta = rawObj.meta
    } else if (typeof rawObj === 'object') {
      if (Array.isArray(rawObj.data)) {
        foundData = rawObj.data
      } else if (Array.isArray(rawObj.applicants)) {
        foundData = rawObj.applicants
      } else if (Array.isArray(rawObj.items)) {
        foundData = rawObj.items
      }
      foundMeta = rawObj.meta || rawObj.pagination
    }

    if (Array.isArray(foundData)) {
      list = foundData
    }

    if (foundMeta && typeof foundMeta === 'object') {
      meta = {
        total: Number(foundMeta.total ?? list.length),
        page: Number(foundMeta.page ?? (filters.page ?? 1)),
        limit: Number(foundMeta.limit ?? 20),
        totalPages: Number(foundMeta.totalPages ?? (Math.ceil(list.length / 20) || 1)),
        hasMore: Boolean(foundMeta.hasMore),
      }
    } else {
      meta = {
        total: list.length,
        page: filters.page ?? 1,
        limit: 20,
        totalPages: Math.ceil(list.length / 20) || 1,
        hasMore: false,
      }
    }
  }

  return { list, meta }
}

/**
 * Server-side fetcher for Jobs list (SSR).
 */
export async function getServerJobs(): Promise<Array<{ id: string; title: string; jobCode?: string }>> {
  const res = await serverFetch<any>('/jobs/admin/all?limit=100')
  let list: Array<{ id: string; title: string; jobCode?: string }> = []
  if (res.success && res.data) {
    const rawData = Array.isArray(res.data)
      ? res.data
      : Array.isArray((res.data as Record<string, any>).data)
        ? (res.data as Record<string, any>).data
        : []
    list = rawData.map((j: any) => ({
      id: j.id,
      title: j.title,
      jobCode: j.jobCode,
    }))
  }
  return list
}
