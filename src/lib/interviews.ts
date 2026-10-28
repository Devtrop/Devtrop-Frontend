import { interviewCache } from './interviews-cache'
import { API_BASE_URL, getAuthHeaders, refreshAccessToken } from './api-config'
import type {
  Interview,
  InterviewSlot,
  PaginationMeta,
  SlotGroup,
} from '@/components/dashboard/interviews/types'

export interface CreateInterviewSlotsPayload {
  jobId: string
  groupName: string
  mode?: 'new' | 'extend'
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  slotDuration: number
  breakDuration?: number
  lunchBreakStart?: string
  lunchBreakEnd?: string
  breakStartTime?: string
  breakEndTime?: string
  excludedDays?: number[]
  meetingUrl: string
}

export interface CreateSlotsResponse {
  message: string
  slotsCreated: number
  groupTotalSlots?: number
  extended?: boolean
  jobId: string
  jobTitle: string
}

export interface InviteCandidatesPayload {
  jobId: string
  applicationIds: string[]
  groupName: string
  templateId?: string
  customSubject?: string
  customBody?: string
}

export interface SendBulkOutcomeEmailsPayload {
  jobId: string
  applicationIds: string[]
  customHiredMessage?: string
  customRejectedMessage?: string
  forceResend?: boolean
  hiredTemplateId?: string
  rejectedTemplateId?: string
}

export interface SubmitFeedbackPayload {
  technicalSkill: number
  communication: number
  comments?: string
}

export interface AvailableBookingSlot {
  id: string
  startTime: string
  endTime: string
}

export interface BookingTokenVerificationResponse {
  applicantName: string
  jobTitle: string
  availableSlots: AvailableBookingSlot[]
}

export interface InterviewStatsSummary {
  total: number
  pendingBooking: number
  scheduled: number
  completed: number
  cancelled: number
}

export interface BookingConfirmationResponse {
  message: string
  interviewDetails: {
    startTime: string
    endTime: string
    meetingUrl: string
  }
}

export interface ApiResponse<T> {
  success?: boolean
  message?: string
  data?: T
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isPublic = false,
  retryCount = 0,
): Promise<{ success: boolean; data?: T; message?: string }> {
  const cleanBase = API_BASE_URL.replace(/\/+$/, '')
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${cleanBase}${cleanEndpoint}`
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(isPublic ? {} : (getAuthHeaders() as Record<string, string>)),
    ...(options.headers as Record<string, string>),
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    })

    if (res.status === 401 && !isPublic && retryCount === 0) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        return request<T>(endpoint, options, isPublic, retryCount + 1)
      }
    }

    const result = await res.json().catch(() => null)

    if (!res.ok) {
      const errorMsg =
        result?.message && Array.isArray(result.message)
          ? result.message.join(', ')
          : result?.message || result?.error || `Request failed with status ${res.status}`
      return { success: false, message: errorMsg }
    }

    // Unwrap response data if wrapped in standard { success: true, data: ... }
    const responseData =
      result && typeof result === 'object' && 'data' in result ? result.data : result

    return {
      success: true,
      data: responseData as T,
      message: result?.message || 'Success',
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error occurred'
    return { success: false, message: errorMsg }
  }
}

function extractArray<T>(payload: unknown): T[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload as T[]
  if (typeof payload === 'object') {
    const obj = payload as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (
      obj.data &&
      typeof obj.data === 'object' &&
      Array.isArray((obj.data as Record<string, unknown>).data)
    ) {
      return (obj.data as Record<string, unknown>).data as T[]
    }
  }
  return []
}

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const clientCache = new Map<string, CacheEntry<unknown>>()
const DEFAULT_CACHE_TTL = 30_000 // 30 seconds

export function clearInterviewCache(keyPrefix?: string) {
  interviewCache.invalidateAll()
  if (keyPrefix) {
    for (const key of clientCache.keys()) {
      if (key.startsWith(keyPrefix)) {
        clientCache.delete(key)
      }
    }
  } else {
    clientCache.clear()
  }
}

export const interviewsApi = {
  // 1. Slot Management
  async createSlots(payload: CreateInterviewSlotsPayload) {
    clearInterviewCache()
    return request<CreateSlotsResponse>('/interview/slot', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async getSlotGroups(jobId: string) {
    return request<SlotGroup[]>(`/interview/slots/${jobId}/groups`, {
      method: 'GET',
    })
  },

  async deleteSlotGroup(jobId: string, groupName: string, force = false) {
    clearInterviewCache()
    return request<{
      message: string
      deletedCount: number
      cancelledBookedCount: number
      remainingBookedCount: number
    }>(
      `/interview/slots/${jobId}/group/${encodeURIComponent(groupName)}${force ? '?force=true' : ''}`,
      {
        method: 'DELETE',
      },
    )
  },

  async getSlotsByJob(jobId: string, options?: { forceRefresh?: boolean }) {
    const cacheKey = `slots:${jobId}`
    if (!options?.forceRefresh) {
      const cached = clientCache.get(cacheKey)
      if (cached) {
        return { success: true, data: cached.data as InterviewSlot[], message: 'From cache' }
      }
    }
    const res = await request<InterviewSlot[]>(`/interview/slots/${jobId}`, {
      method: 'GET',
    })
    const items = extractArray<InterviewSlot>(res.data)
    if (res.success) {
      clientCache.set(cacheKey, { data: items, timestamp: Date.now() })
    }
    return {
      success: res.success,
      data: items,
      message: res.message,
    }
  },

  async deleteSlot(slotId: string) {
    clearInterviewCache()
    return request<{ message: string }>(`/interview/slot/${slotId}`, {
      method: 'DELETE',
    })
  },

  // 2. Candidate Invitations & Bulk Outcomes
  async inviteCandidates(payload: InviteCandidatesPayload) {
    clearInterviewCache()
    return request<{
      message: string
      invitationsSent: number
      totalRequested: number
      results: Array<{
        applicationId: string
        applicantEmail: string
        status: string
        error?: string
      }>
    }>('/interview/invite', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async sendOutcomeEmails(payload: SendBulkOutcomeEmailsPayload) {
    clearInterviewCache()
    const res = await request<{
      message: string
      jobId: string
      jobTitle: string
      totalProcessed: number
      sentHiredCount: number
      sentRejectedCount: number
      skippedCount: number
      results: Array<{
        applicationId: string
        applicantEmail: string
        applicantName: string
        status: string
        emailSent: boolean
        action: string
        reason?: string
      }>
    }>('/interview/outcome', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    // Fallback to /interview/send-bulk-email if endpoint not yet deployed
    if (!res.success && res.message?.includes('Cannot POST /api/v1/interview/outcome')) {
      return request<{
        message: string
        jobId: string
        jobTitle: string
        totalProcessed: number
        sentHiredCount: number
        sentRejectedCount: number
        skippedCount: number
        results: Array<{
          applicationId: string
          applicantEmail: string
          applicantName: string
          status: string
          emailSent: boolean
          action: string
          reason?: string
        }>
      }>('/interview/send-bulk-email', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    }

    return res
  },

  async sendBulkOutcomeEmails(payload: SendBulkOutcomeEmailsPayload) {
    return this.sendOutcomeEmails(payload)
  },

  // 3. Interview Records (Admin Dashboard)
  async getInterviews(params?: {
    status?: string
    tab?: string
    jobId?: string
    search?: string
    sort?: string
    page?: number
    limit?: number
    forceRefresh?: boolean
  }) {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    const limit = params?.limit ?? 100
    query.append('limit', limit.toString())
    if (params?.status && params.status !== 'ALL') query.append('status', params.status)
    if (params?.tab && params.tab !== 'ALL') query.append('tab', params.tab)
    if (params?.jobId && params.jobId !== 'ALL') query.append('jobId', params.jobId)
    if (params?.search?.trim()) query.append('search', params.search.trim())
    if (params?.sort) query.append('sort', params.sort)

    const queryString = query.toString()
    const endpoint = queryString ? `/interview?${queryString}` : '/interview'
    const cacheKey = `interviews:${endpoint}`

    if (params?.forceRefresh) {
      query.append('_t', Date.now().toString())
      clearInterviewCache()
    } else {
      const cached = clientCache.get(cacheKey)
      if (cached) {
        const cachedPayload = cached.data as {
          data: Interview[]
          meta?: PaginationMeta
          stats?: InterviewStatsSummary
        }
        return {
          success: true,
          data: cachedPayload?.data || (cached.data as Interview[]),
          meta: cachedPayload?.meta,
          stats: cachedPayload?.stats,
          message: 'From cache',
        }
      }
    }

    const res = await request<unknown>(endpoint, {
      method: 'GET',
    })

    let items: Interview[] = []
    let meta: PaginationMeta | undefined = undefined
    let stats: InterviewStatsSummary | undefined = undefined

    if (res.data) {
      if (Array.isArray(res.data)) {
        items = res.data
      } else if (
        typeof res.data === 'object' &&
        res.data !== null &&
        'data' in res.data &&
        Array.isArray((res.data as { data: unknown }).data)
      ) {
        const payload = res.data as {
          data: Interview[]
          meta?: PaginationMeta
          stats?: InterviewStatsSummary
        }
        items = payload.data
        meta = payload.meta
        stats = payload.stats
      }
    }

    if (res.success) {
      clientCache.set(cacheKey, { data: { data: items, meta, stats }, timestamp: Date.now() })
    }

    return {
      success: res.success,
      data: items,
      meta,
      stats,
      message: res.message,
    }
  },

  async getInterviewById(id: string) {
    return request<Interview>(`/interview/${id}`, {
      method: 'GET',
    })
  },

  async rescheduleInterview(interviewId: string, slotId: string) {
    clearInterviewCache()
    return request<{
      message: string
      slotDetails: {
        startTime: string
        endTime: string
        meetingUrl: string
      }
    }>(`/interview/${interviewId}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ slotId }),
    })
  },

  async submitFeedback(interviewId: string, payload: SubmitFeedbackPayload) {
    clearInterviewCache()
    return request<{ message: string }>(`/interview/${interviewId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async deleteInterview(id: string) {
    clearInterviewCache()
    return request<{ message: string }>(`/interview/${id}`, {
      method: 'DELETE',
    })
  },

  // 4. Candidate Self-Booking (Public)
  async verifyBookingToken(token: string) {
    return request<BookingTokenVerificationResponse>(
      `/interview/book/verify?token=${encodeURIComponent(token)}`,
      { method: 'GET' },
      true,
    )
  },

  async confirmBooking(payload: { token: string; slotId: string }) {
    clearInterviewCache()
    return request<BookingConfirmationResponse>(
      '/interview/book/confirm',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      true,
    )
  },

  // 5. Application Status Updates (Admin)
  async updateApplicationStatus(applicationId: string, status: string) {
    clearInterviewCache()
    return request<{
      id: string
      status: string
      appliedAt: string
      applicant: { id: string; name: string; email: string }
    }>(`/applications/admin/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  // 6. Shortlisted Applications for Interview Invitation (Admin)
  async getShortlistedApplications(params?: { jobId?: string; forceRefresh?: boolean }) {
    const query = new URLSearchParams()
    query.set('status', 'INTERVIEW_SELECTED')
    query.set('limit', '100')
    if (params?.jobId && params.jobId !== 'ALL') {
      query.set('jobId', params.jobId)
    }
    const endpoint = `/applications/admin?${query.toString()}`
    const cacheKey = `shortlisted:${endpoint}`

    if (!params?.forceRefresh) {
      const cached = clientCache.get(cacheKey)
      if (cached) {
        return {
          success: true,
          data: cached.data as Array<{
            id: string
            status: string
            appliedAt: string
            applicant: { id: string; name: string; email: string; phone?: string; address?: string }
            job: { id: string; title: string; jobCode?: string; status?: string }
          }>,
          message: 'From cache',
        }
      }
    }

    const res = await request<unknown>(endpoint, {
      method: 'GET',
    })

    const items = extractArray<{
      id: string
      status: string
      appliedAt: string
      applicant: { id: string; name: string; email: string; phone?: string; address?: string }
      job: { id: string; title: string; jobCode?: string; status?: string }
    }>(res.data)

    if (res.success) {
      clientCache.set(cacheKey, { data: items, timestamp: Date.now() })
    }

    return {
      success: res.success,
      data: items,
      message: res.message,
    }
  },

  // 7. Active Job Postings List with caching (Admin)
  async getJobsList(forceRefresh = false) {
    const cacheKey = 'jobs:list:all'
    if (!forceRefresh) {
      const cached = clientCache.get(cacheKey)
      if (cached) {
        return {
          success: true,
          data: cached.data as Array<{
            id: string
            title: string
            jobCode?: string
            status?: string
            deadline?: string
          }>,
          message: 'From cache',
        }
      }
    }

    const res = await request<unknown>('/jobs/admin/all?limit=100', { method: 'GET' })
    const items = extractArray<{ id: string; title: string; jobCode?: string; status?: string; deadline?: string }>(
      res.data,
    )
    if (res.success) {
      clientCache.set(cacheKey, { data: items, timestamp: Date.now() })
    }

    return {
      success: res.success,
      data: items,
      message: res.message,
    }
  },
}
