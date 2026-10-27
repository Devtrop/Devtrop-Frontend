import { api, type RawApiResponse } from './api'

export interface ApplicantJob {
  id: string
  title: string
  jobCode?: string
}

export interface ApplicantApplication {
  id: string
  applicationCode?: string
  status: string
  appliedAt: string
  createdAt?: string
  updatedAt?: string
  job?: ApplicantJob
}

export interface Applicant {
  id: string
  name: string
  email: string
  phone?: string | null
  address?: string | null
  github?: string | null
  portfolio?: string | null
  linkedin?: string | null
  createdAt: string
  updatedAt: string
  applications?: ApplicantApplication[]
}

export interface ApplicantsMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

export interface ApplicantsResponse {
  data: Applicant[]
  meta: ApplicantsMeta
}

export interface ApplicantFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  jobId?: string
  jobCode?: string
  dateFrom?: string
  dateTo?: string
}

/**
 * Fetch paginated list of applicants with applications summary (Client Side).
 * GET /api/v1/applicants
 */
export async function getApplicants(
  filters: ApplicantFilters = {},
): Promise<RawApiResponse<Applicant[]>> {
  const query: Record<string, string | number | undefined> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  }

  if (filters.search?.trim()) query.search = filters.search.trim()
  if (filters.status?.trim()) query.status = filters.status.trim()
  if (filters.jobId?.trim()) query.jobId = filters.jobId.trim()
  if (filters.jobCode?.trim()) query.jobCode = filters.jobCode.trim()
  if (filters.dateFrom?.trim()) query.dateFrom = filters.dateFrom.trim()
  if (filters.dateTo?.trim()) query.dateTo = filters.dateTo.trim()

  return api.getRaw<Applicant[]>('/applicants', query)
}

/**
 * Export filtered applicants to an Excel file (.xlsx).
 * GET /api/v1/applicants/export
 * Note: Intentionally ignores pagination (page and limit).
 */
export async function exportApplicants(
  filters: Omit<ApplicantFilters, 'page' | 'limit'> = {},
): Promise<void> {
  const query: Record<string, string> = {}

  if (filters.search?.trim()) query.search = filters.search.trim()
  if (filters.status?.trim()) query.status = filters.status.trim()
  if (filters.jobId?.trim()) query.jobId = filters.jobId.trim()
  if (filters.jobCode?.trim()) query.jobCode = filters.jobCode.trim()
  if (filters.dateFrom?.trim()) query.dateFrom = filters.dateFrom.trim()
  if (filters.dateTo?.trim()) query.dateTo = filters.dateTo.trim()

  const blob = await api.getBlob('/applicants/export', query)

  // Trigger client-side download of the binary XLSX blob
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'applicants.xlsx'
  document.body.appendChild(link)
  link.click()

  // Clean up DOM and memory
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
