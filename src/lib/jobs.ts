import { api } from '@/lib/api'
import {
  type CreateJobPayload,
  type Job,
  type JobQueryParams,
  JobType,
  type PaginatedJobs,
  type UpdateJobPayload,
} from '@/types/job'

// API client automatically unwraps { success, message, data } -> returns data only
// So we receive the actual data type directly, not wrapped in ApiResponse

/**
 * Formats the display of a job's work mode and location:
 * - Remote: 'Remote · Anywhere in Bangladesh' (never saved in location field)
 * - Onsite: 'Onsite · {location}'
 * - Hybrid: 'Hybrid · {location}'
 */
export function formatJobLocation(job: {
  jobType?: JobType | string | null
  location?: string | null
}): string {
  if (job.jobType === JobType.REMOTE || job.jobType === 'REMOTE') {
    return 'Remote · Anywhere in Bangladesh'
  }
  const loc = job.location?.trim() || 'Dhaka, Bangladesh'
  if (job.jobType === JobType.HYBRID || job.jobType === 'HYBRID') {
    return `Hybrid · ${loc}`
  }
  if (job.jobType === JobType.ONSITE || job.jobType === 'ONSITE') {
    return `Onsite · ${loc}`
  }
  return loc
}

export async function getPublicJobs(params?: JobQueryParams) {
  // After unwrapping: { data: Job[], meta: {...} }
  return api.get<PaginatedJobs>('/jobs', {
    page: params?.page,
    limit: params?.limit,
    search: params?.search,
    jobType: params?.jobType,
    status: params?.status,
    sort: params?.sort,
  })
}

export async function getPublicJob(slug: string) {
  // After unwrapping: Job object directly
  return api.get<Job>(`/jobs/public/${encodeURIComponent(slug)}`)
}

export async function getAdminJobs(
  params?: JobQueryParams & {
    cursor?: string | null
    sortOrder?: 'asc' | 'desc'
  },
) {
  const sort = params?.sort ?? (params?.sortOrder === 'asc' ? 'oldest' : 'latest')
  // After unwrapping: { data: Job[], meta: {...} }
  return api.get<PaginatedJobs>('/jobs/admin/all', {
    page: params?.page,
    limit: params?.limit,
    cursor: params?.cursor,
    search: params?.search,
    status: params?.status,
    jobType: params?.jobType,
    sort,
  })
}

export async function getAdminJob(id: string) {
  // After unwrapping: Job object directly
  return api.get<Job>(`/jobs/admin/${id}`)
}

export async function createJob(payload: CreateJobPayload) {
  // After unwrapping: Job object directly
  return api.post<Job>('/jobs', payload)
}

export async function updateJob(id: string, payload: UpdateJobPayload) {
  // After unwrapping: Job object directly
  return api.patch<Job>(`/jobs/${id}`, payload)
}

export async function deleteJob(id: string) {
  // After unwrapping: response object
  return api.delete<{ message: string }>(`/jobs/${id}`)
}
