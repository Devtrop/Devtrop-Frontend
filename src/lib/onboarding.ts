import { API_BASE_URL, getAuthToken, refreshAccessToken } from './api-config'
import type {
  ApplicationStatus,
  DocumentType,
  EmailLog,
  ApplicationStatusHistory,
} from '@/types/job'

export interface OnboardingCandidate {
  id: string
  applicationCode: string
  status: ApplicationStatus
  appliedAt: string
  onboardingToken?: string | null
  onboardingTokenExpiresAt?: string | null
  offerSentAt?: string | null
  docsSubmittedAt?: string | null
  docsVerifiedAt?: string | null
  orientationSentAt?: string | null
  applicant: {
    id: string
    name: string
    email: string
    phone?: string | null
  }
  job: {
    id: string
    title: string
    jobCode: string
  }
  documents: Array<{
    id: string
    type: DocumentType | string
    storageKey: string
    mimeType: string
    size: number
    createdAt: string
  }>
  emailLogs: EmailLog[]
  applicationStatusHistories?: ApplicationStatusHistory[]
}

export type OnboardingCandidateItem = OnboardingCandidate

export interface PaginatedOnboardingResponse {
  data: OnboardingCandidate[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface QueryOnboardingParams {
  page?: number
  limit?: number
  status?: ApplicationStatus | ''
  jobId?: string
  search?: string
  sort?: string
}

export interface SendOfferPayload {
  applicationIds: string[]
  customMessage?: string
  expiresInDays?: number
  offerLetterFile?: File | null
  agreementFile?: File | null
  templateId?: string
}

export interface SendOrientationPayload {
  applicationIds: string[]
  meetingUrl: string
  orientationDate?: string
  notes?: string
  templateId?: string
}

export interface PortalChecklistResult {
  valid: boolean
  applicationId: string
  applicantName: string
  applicantEmail: string
  jobTitle: string
  jobCode: string
  applicationCode: string
  status: string
  expiresAt: string | null
  alreadySubmitted: boolean
  requiredDocuments: Array<{
    type: string
    label: string
    required: boolean
  }>
}

function getApiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/+$/, '')
  const endpoint = path.startsWith('/') ? path : `/${path}`
  return `${base}${endpoint}`
}

async function authenticatedFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = getAuthToken()
  const headers = new Headers(init?.headers || {})
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response = await fetch(url, { ...init, headers })

  if (response.status === 401) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`)
      response = await fetch(url, { ...init, headers })
    }
  }

  return response
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

function extractMeta(payload: unknown): {
  total: number
  page: number
  limit: number
  totalPages: number
} {
  const defaultMeta = { total: 0, page: 1, limit: 20, totalPages: 1 }
  if (!payload || typeof payload !== 'object') return defaultMeta
  const obj = payload as Record<string, unknown>
  const dataObj =
    obj.data && typeof obj.data === 'object' ? (obj.data as Record<string, unknown>) : undefined
  const meta = (obj.meta || dataObj?.meta) as Record<string, unknown> | undefined
  if (meta && typeof meta === 'object') {
    return {
      total: Number(meta.total) || 0,
      page: Number(meta.page) || 1,
      limit: Number(meta.limit) || 20,
      totalPages: Number(meta.totalPages) || 1,
    }
  }
  return defaultMeta
}

/** Fetch candidates in onboarding pipeline (admin). */
export async function getOnboardingCandidates(
  params?: QueryOnboardingParams,
): Promise<PaginatedOnboardingResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) {
    const safeLimit = Math.min(100, Math.max(1, params.limit))
    searchParams.set('limit', String(safeLimit))
  }
  if (params?.status) searchParams.set('status', params.status)
  if (params?.jobId && params.jobId !== 'ALL') searchParams.set('jobId', params.jobId)
  if (params?.search?.trim()) searchParams.set('search', params.search.trim())
  if (params?.sort) searchParams.set('sort', params.sort)

  const url = `${API_BASE_URL}/onboarding/candidates?${searchParams.toString()}`
  const res = await authenticatedFetch(url, { method: 'GET' })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to fetch candidates (${res.status})`)
  }

  const json = await res.json()
  const data = extractArray<OnboardingCandidate>(json)
  const meta = extractMeta(json)

  return {
    data,
    meta,
  }
}

/** Send Offer & Agreement email packets (admin). */
export async function sendOfferPacket(payload: SendOfferPayload): Promise<{
  message: string
  total: number
  results: Array<{ applicationId: string; success: boolean; error?: string }>
}> {
  const formData = new FormData()

  payload.applicationIds.forEach((id) => {
    formData.append('applicationIds', id)
  })

  if (payload.customMessage) {
    formData.append('customMessage', payload.customMessage)
  }
  formData.append('expiresInDays', String(payload.expiresInDays ?? 7))
  if (payload.offerLetterFile) {
    formData.append('offerLetter', payload.offerLetterFile)
  }
  if (payload.agreementFile) {
    formData.append('agreement', payload.agreementFile)
  }
  if (payload.templateId) {
    formData.append('templateId', payload.templateId)
  }

  const token = getAuthToken()
  const res = await fetch(`${API_BASE_URL}/onboarding/offer`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message
    throw new Error(msg || `Failed to dispatch offer letters (${res.status})`)
  }

  return res.json()
}

export interface OnboardingTemplateItem {
  configured: boolean
  exists: boolean
  name: string
  filename?: string | null
  storageKey?: string | null
  updatedAt?: string
}

export interface OnboardingTemplateStatus {
  offerLetter: OnboardingTemplateItem
  agreement: OnboardingTemplateItem
}

/** Check whether Offer Letter and Agreement Form templates exist in DB. */
export async function getOnboardingTemplates(): Promise<OnboardingTemplateStatus> {
  const res = await authenticatedFetch(`${API_BASE_URL}/onboarding/templates`, {
    method: 'GET',
  })
  if (!res.ok) {
    return {
      offerLetter: { configured: false, exists: false, name: 'Default Offer Letter.pdf' },
      agreement: { configured: false, exists: false, name: 'Default Employment Agreement.pdf' },
    }
  }
  const json = await res.json()
  return (json.data || json) as OnboardingTemplateStatus
}

/** Mark documents verified (admin). */
export async function verifyCandidateDocuments(
  applicationId: string,
): Promise<{ success: boolean; message: string }> {
  const res = await authenticatedFetch(`${API_BASE_URL}/onboarding/${applicationId}/verify-docs`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to verify documents')
  }

  return res.json()
}

/** Send Orientation email & credentials (admin). */
export async function sendOrientationPacket(payload: SendOrientationPayload): Promise<{
  message: string
  total: number
  results: Array<{ applicationId: string; accountCreated: boolean; emailSent: boolean }>
}> {
  const res = await authenticatedFetch(`${API_BASE_URL}/onboarding/orientation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Failed to dispatch orientation packet (${res.status})`)
  }

  return res.json()
}

/** Verify candidate upload portal token (public). */
export async function verifyPortalToken(token: string): Promise<PortalChecklistResult> {
  const res = await fetch(getApiUrl(`/onboarding/verify?token=${encodeURIComponent(token)}`), {
    method: 'GET',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err.message || err.error || `HTTP ${res.status} error from onboarding service`
    throw new Error(msg)
  }

  const json = await res.json()
  return (json.data || json) as PortalChecklistResult
}

/** Submit signed documents and personal files (public). */
export async function submitPortalDocuments(
  token: string,
  files: {
    signedOffer?: File | null
    signedAgreement?: File | null
    nid?: File[] | File | null
    certificate?: File | null
    electricityBill?: File | null
    other?: File | null
  },
): Promise<{ success: boolean; message: string; uploadedCount: number }> {
  const formData = new FormData()
  formData.append('token', token)

  if (files.signedOffer) formData.append('signedOffer', files.signedOffer)
  if (files.signedAgreement) formData.append('signedAgreement', files.signedAgreement)
  if (files.nid) {
    if (Array.isArray(files.nid)) {
      files.nid.forEach((f) => formData.append('nid', f))
    } else {
      formData.append('nid', files.nid)
    }
  }
  if (files.certificate) formData.append('certificate', files.certificate)
  if (files.electricityBill) formData.append('electricityBill', files.electricityBill)
  if (files.other) formData.append('other', files.other)

  const res = await fetch(getApiUrl('/onboarding/submit-docs'), {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to submit documents')
  }

  return res.json()
}

/** Get download/view streaming URL for an application document. */
export function getDocumentStreamUrl(applicationId: string, storageKey: string): string {
  const token = getAuthToken()
  const filename = storageKey.split('/').pop() || 'document'
  const url = `${API_BASE_URL}/applications/admin/download/${applicationId}/${encodeURIComponent(filename)}`
  return token ? `${url}?authorization=${encodeURIComponent(token)}` : url
}

/** Download a document file to client machine. */
export async function downloadDocumentFile(documentId: string, displayName?: string) {
  const url = `${API_BASE_URL}/onboarding/document/${documentId}?download=true`

  const token = getAuthToken()
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to download document (${response.status})`)
  }

  const blob = await response.blob()
  const objectUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = displayName || 'document.pdf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl)
  }, 100)
}

/** Update candidate application status (admin). */
export async function updateCandidateStatus(applicationId: string, status: string): Promise<void> {
  const url = `${API_BASE_URL}/onboarding/${applicationId}/status`
  const res = await authenticatedFetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })

  if (!res.ok) {
    // If onboarding route fails (e.g. 403 due to missing onboarding.verify on prod), fallback to applications admin route
    try {
      const fallbackUrl = `${API_BASE_URL}/applications/admin/${applicationId}/status`
      const fallbackRes = await authenticatedFetch(fallbackUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (fallbackRes.ok) return
    } catch {
      // ignore fallback error and throw original error
    }

    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Failed to update status (${res.status})`)
  }
}

/** Get configured default templates metadata. */
export async function getDefaultTemplates(): Promise<OnboardingTemplateStatus> {
  return getOnboardingTemplates()
}

/** Upload or replace default templates. */
export async function uploadDefaultTemplates(files: {
  offerLetter?: File | null
  agreement?: File | null
}): Promise<void> {
  const formData = new FormData()
  if (files.offerLetter) formData.append('offerLetter', files.offerLetter)
  if (files.agreement) formData.append('agreement', files.agreement)

  const url = `${API_BASE_URL}/onboarding/templates`
  const res = await authenticatedFetch(url, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Failed to upload templates (${res.status})`)
  }
}

/** Request document resubmission from candidate (admin). */
export async function requestDocumentResubmission(
  applicationId: string,
  payload: { notes?: string; expiresInDays?: number; templateId?: string },
): Promise<{ success: boolean; message: string; emailSent: boolean }> {
  const res = await authenticatedFetch(
    `${API_BASE_URL}/onboarding/${applicationId}/request-resubmission`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to request document resubmission')
  }

  return res.json()
}

/** Dispatch onboarding-specific rejection notice (admin). */
export async function sendOnboardingRejection(payload: {
  applicationIds: string[]
  customMessage?: string
  templateId?: string
}): Promise<{
  success: boolean
  message: string
  results?: Array<{ applicationId: string; success: boolean }>
}> {
  const res = await authenticatedFetch(`${API_BASE_URL}/onboarding/send-rejection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to dispatch rejection notice')
  }

  return res.json()
}
