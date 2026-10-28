import { api } from '@/lib/api'

export interface TaskAssignment {
  id: string
  jobTaskId: string
  applicationId: string
  status: 'SENT' | 'SUBMITTED' | 'EXPIRED'
  assignedAt: string
  updatedAt: string
  applicant?: {
    id: string
    name: string
    email: string
  }
  jobTask?: {
    id: string
    jobId: string
    title: string
    description: string
  }
}

interface ApiResponse<T> {
  success?: boolean
  message?: string
  data: T
}

export interface AssignTaskPayload {
  applicationIds: string[]
  expiresAt: string
  templateId?: string
}

export interface AssignTaskResponse {
  message: string
  assignmentsCreated: number
  emailsSent: number
  results: Array<{
    applicationId: string
    applicantEmail: string
    applicantName: string
    status: string
    assignmentId?: string
    emailSent?: boolean
    error?: string
  }>
}

export async function assignTaskToApplications(jobId: string, payload: AssignTaskPayload) {
  const response = await api.post<ApiResponse<AssignTaskResponse>>(
    `/job-tasks/${jobId}/assign`,
    payload,
  )

  return response.data
}

export async function getTaskAssignments(params?: { jobTaskId?: string; applicationId?: string }) {
  const response = await api.get<ApiResponse<TaskAssignment[]>>('/job-tasks/assignments', {
    jobTaskId: params?.jobTaskId,
    applicationId: params?.applicationId,
  })

  return response.data
}
