import { api, ApiError } from '@/lib/api'
import type { Application, ApplicationItem } from '@/types/job'

export type { ApplicationItem }

export interface ApplyJobPayload {
  name: string
  email: string
  phone: string
  verificationToken?: string
  otp?: string
  github: string
  portfolio: string
  linkedin: string
  address?: string
  cv: File
}

export interface RequestOtpResponse {
  success?: boolean
  message?: string
  expiresInMinutes?: number
}

export type RequestEmailVerificationResponse = RequestOtpResponse

export interface VerifyJobOtpPayload {
  email: string
  otp: string
}

export interface VerifyJobOtpResponse {
  success?: boolean
  verified?: boolean
  verificationToken?: string
  email: string
  jobId: string
  message?: string
}

export type VerifyEmailTokenResponse = VerifyJobOtpResponse

export interface ApplyJobDocument {
  type: string
  mimeType: string
  size: number
}

export interface ApplyJobData {
  id: string
  applicationCode: string
  status: string
  appliedAt: string
  jobId: string
  applicantId?: string
  documents?: ApplyJobDocument[]
}

export interface ApplyJobResponse {
  success?: boolean
  message?: string
  data?: ApplyJobData
  // In case of unwrapped response:
  id?: string
  applicationCode?: string
  status?: string
  appliedAt?: string
  jobId?: string
  applicantId?: string
  documents?: ApplyJobDocument[]
}

/**
 * Request a 6-digit OTP verification code sent to applicant email.
 * POST /api/v1/applications/jobs/:jobId/request-otp
 */
export async function requestJobOtp(jobId: string, email: string): Promise<RequestOtpResponse> {
  const normalizedEmail = email.trim().toLowerCase()
  try {
    return await api.post<RequestOtpResponse>(`/applications/jobs/${jobId}/request-otp`, {
      email: normalizedEmail,
    })
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 404) {
      try {
        return await api.post<RequestOtpResponse>(`/applications/${jobId}/request-otp`, {
          email: normalizedEmail,
        })
      } catch (innerErr: unknown) {
        if (innerErr instanceof ApiError && innerErr.status === 404) {
          // Backward-compatible fallback to legacy endpoint
          return await api.post<RequestOtpResponse>(
            `/applications/jobs/${jobId}/request-email-verification`,
            {
              email: normalizedEmail,
            },
          )
        }
        throw innerErr
      }
    }
    throw err
  }
}

/**
 * Alias for backward compatibility.
 */
export async function requestEmailVerification(
  jobId: string,
  email: string,
): Promise<RequestOtpResponse> {
  return requestJobOtp(jobId, email)
}

/**
 * Verify applicant 6-digit OTP.
 * POST /api/v1/applications/jobs/:jobId/verify-otp
 */
export async function verifyJobOtp(
  jobId: string,
  payload: VerifyJobOtpPayload,
): Promise<VerifyJobOtpResponse> {
  const body = {
    email: payload.email.trim().toLowerCase(),
    otp: payload.otp.trim(),
  }

  try {
    return await api.post<VerifyJobOtpResponse>(`/applications/jobs/${jobId}/verify-otp`, body)
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 404) {
      try {
        return await api.post<VerifyJobOtpResponse>(`/applications/${jobId}/verify-otp`, body)
      } catch (innerErr: unknown) {
        if (innerErr instanceof ApiError && innerErr.status === 404) {
          // Fallback to legacy endpoint with token/otp
          return await api.post<VerifyJobOtpResponse>(`/applications/jobs/${jobId}/verify-email`, {
            token: body.otp,
            email: body.email,
          })
        }
        throw innerErr
      }
    }
    throw err
  }
}

/**
 * Verify token or OTP for backward compatibility.
 */
export async function verifyEmailToken(
  jobId: string,
  token: string,
  email?: string,
): Promise<VerifyJobOtpResponse> {
  if (email && token.trim().length === 6 && /^\d{6}$/.test(token.trim())) {
    return verifyJobOtp(jobId, { email, otp: token.trim() })
  }

  try {
    return await api.post<VerifyJobOtpResponse>(`/applications/jobs/${jobId}/verify-email`, {
      token,
      ...(email ? { email } : {}),
    })
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 404) {
      return await api.post<VerifyJobOtpResponse>(`/applications/${jobId}/verify-email`, {
        token,
        ...(email ? { email } : {}),
      })
    }
    throw err
  }
}

/**
 * Submit job application with CV and applicant details.
 * POST /api/v1/applications/jobs/:jobId/apply
 */
export async function applyForJob(jobId: string, payload: ApplyJobPayload | FormData) {
  let formData: FormData

  if (payload instanceof FormData) {
    formData = payload
  } else {
    formData = new FormData()

    formData.append('name', payload.name.trim())
    formData.append('email', payload.email.trim().toLowerCase())
    formData.append('phone', payload.phone.trim())

    const tokenOrOtp = (payload.verificationToken || payload.otp || '').trim()
    if (tokenOrOtp) {
      formData.append('verificationToken', tokenOrOtp)
      formData.append('otp', tokenOrOtp)
    }

    formData.append('github', payload.github.trim())
    formData.append('portfolio', payload.portfolio.trim())
    formData.append('linkedin', payload.linkedin.trim())

    if (payload.address?.trim()) {
      formData.append('address', payload.address.trim())
    }

    formData.append('cv', payload.cv)
  }

  try {
    return await api.upload<ApplyJobResponse>(`/applications/jobs/${jobId}/apply`, formData)
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 404) {
      return await api.upload<ApplyJobResponse>(`/applications/${jobId}/apply`, formData)
    }
    throw err
  }
}

export interface GetJobApplicationsParams {
  page?: number
  limit?: number
  search?: string
  applicationCode?: string
  status?: string
  sort?: string
}

export async function getJobApplications(jobId: string, params?: GetJobApplicationsParams) {
  const query: Record<string, string | number | undefined> = {
    page: params?.page,
    limit: params?.limit,
    search: params?.search?.trim() || undefined,
    applicationCode: params?.applicationCode?.trim() || undefined,
    status: params?.status || undefined,
    sort: params?.sort || undefined,
  }

  const response = await api.get<any>(`/applications/admin/jobs/${jobId}`, query)
  // Backend returns { success, message, data: { data: [...], meta: {...} } }
  const responseData = response?.data || response
  return responseData?.data || responseData
}

export async function getApplicationById(id: string) {
  const response = await api.get<any>(`/applications/admin/${id}`)
  // Backend returns { success, message, data: {...} }
  const responseData = response.data || response
  return responseData.data || responseData
}

export async function updateApplicationStatus(id: string, status: string) {
  const response = await api.patch<any>(`/applications/admin/${id}/status`, { status })
  // Backend returns { success, message, data: {...} }
  const responseData = response.data || response
  return responseData.data || responseData
}

export async function getApplicationStatusHistory(id: string) {
  const response = await api.get<any>(`/applications/admin/${id}/status-history`)
  const responseData = response.data || response
  return responseData.data || responseData
}

export async function deleteApplication(id: string) {
  const response = await api.delete<any>(`/applications/admin/${id}`)
  // Backend returns { success, message, data: {...} }
  const responseData = response.data || response
  return responseData
}

export function getDocumentDownloadUrl(applicationId: string, filename: string): string {
  const token = typeof window !== 'undefined' ? localStorage.getItem('dt_auth_token') : null

  // Use relative path that will be proxied by Next.js
  const downloadUrl = `/api/v1/applications/admin/download/${applicationId}/${encodeURIComponent(filename)}`

  // For iframe viewing, we need to pass the token
  // The backend should accept token as query parameter for document viewing
  if (token) {
    return `${downloadUrl}?authorization=${encodeURIComponent(token)}`
  }

  return downloadUrl
}

export async function downloadDocument(
  applicationId: string,
  filename: string,
  displayName?: string,
) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dt_auth_token') : null

    // Use relative path that will be proxied by Next.js
    const downloadUrl = `/api/v1/applications/admin/download/${applicationId}/${encodeURIComponent(filename)}`

    console.log('Downloading from:', downloadUrl)
    console.log('Token present:', !!token)

    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      let errorMessage = `Failed to download: ${response.status}`

      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
        console.error('Error response:', errorData)
      } else {
        const errorText = await response.text()
        errorMessage = `Failed to download: ${response.status} - ${errorText}`
        console.error('Error text:', errorText)
      }

      throw new Error(errorMessage)
    }

    const blob = await response.blob()
    console.log('Blob size:', blob.size, 'type:', blob.type)

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = displayName || filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 100)
  } catch (error) {
    console.error('Download error:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to download document')
  }
}
