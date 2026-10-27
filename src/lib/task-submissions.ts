import { api } from '@/lib/api'
import type { TaskAssignmentStatus } from '@/types/job'

export interface TaskSubmissionDetail {
  id: string
  jobTaskId: string
  applicationId: string
  applicationCode?: string
  status: TaskAssignmentStatus
  assignedAt: string
  updatedAt: string
  expiresAt?: string
  submittedAt?: string
  githubRepoUrl?: string
  backendRepoUrl?: string
  liveUrl?: string
  note?: string
  score?: number | null
  result?: string | null
  feedback?: string | null
  reviewedAt?: string | null
  reviewedBy?: string | null
  applicant: { id: string; name: string; email: string; phone?: string }
  jobTask: { id: string; jobId: string; jobCode?: string; title: string; description: string }
  jobTitle?: string
  jobCode?: string
  application: { id: string; status: string; applicationCode?: string; jobCode?: string }
}

export interface TaskSubmissionListResponse {
  data: TaskSubmissionDetail[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export interface GetTaskSubmissionsParams {
  page?: number
  limit?: number
  search?: string
  jobId?: string
  jobTaskId?: string
  status?: TaskAssignmentStatus | ''
}

/**
 * Get all task assignments (admin) - returns full response with meta
 * Uses getRaw to preserve the meta pagination info that auto-unwrap strips.
 */
export async function getTaskSubmissions(
  params?: GetTaskSubmissionsParams,
): Promise<TaskSubmissionListResponse> {
  const response = await api.get<TaskSubmissionListResponse>('/job-tasks/assignments/all', {
    page: params?.page,
    limit: params?.limit,
    search: params?.search,
    jobId: params?.jobId,
    jobTaskId: params?.jobTaskId,
    status: params?.status,
  })

  return response
}

export async function getTaskSubmissionDetail(assignmentId: string): Promise<TaskSubmissionDetail> {
  const response = await api.get<TaskSubmissionDetail>(`/job-tasks/assignments/${assignmentId}`)
  return response
}

export async function getAssignmentDetail(assignmentId: string) {
  const response = await api.get<{
    id: string
    applicationId: string
    applicationCode?: string
    applicantName: string
    applicantEmail: string
    jobId: string
    jobCode: string
    jobTitle: string
    taskTitle: string
    taskDescription: string
    taskJobId: string
    applicationStatus: string
    assignmentStatus: string
    sentAt: string
    expiresAt: string | null
    submittedAt: string | null
    githubRepoUrl: string | null
    backendRepoUrl: string | null
    liveUrl: string | null
    note: string | null
  }>(`/job-tasks/assignments/${assignmentId}`)
  return response
}

export interface SubmitTaskPayload {
  githubRepoUrl: string
  backendRepoUrl?: string
  liveUrl: string
  note?: string
}

export async function submitTask(assignmentId: string, payload: SubmitTaskPayload) {
  const response = await api.post<{ success: boolean; message: string }>(
    `/job-tasks/assignments/${assignmentId}/submit`,
    payload,
  )
  return response
}

export async function getMyTaskAssignment(token: string) {
  const response = await api.get<{
    applicationId: string
    applicationCode?: string
    applicationStatus: string
    jobTitle: string
    taskTitle: string
    taskDescription: string
    deadline: string
    assignmentStatus: string
    hasSubmission: boolean
    submission: {
      githubRepoUrl: string
      backendRepoUrl?: string
      liveUrl: string
      note: string
      submittedAt: string
    } | null
  }>('/job-tasks/candidate/assignment', {
    token,
  })
  return response
}

export async function submitCandidateTask(token: string, payload: SubmitTaskPayload) {
  const response = await api.post<{ success: boolean; message: string }>(
    `/job-tasks/candidate/submit?token=${encodeURIComponent(token)}`,
    payload,
  )
  return response
}

export async function deleteTaskSubmission(applicationId: string) {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/job-tasks/submissions/${applicationId}`,
  )
  return response
}

export async function deleteTaskAssignment(assignmentId: string) {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/job-tasks/assignments/${assignmentId}`,
  )
  return response
}

export interface EvaluateTaskSubmissionPayload {
  score?: number | null
  result?: string | null
  feedback?: string | null
  status?: string
}

export async function evaluateTaskSubmission(
  applicationId: string,
  payload: EvaluateTaskSubmissionPayload,
) {
  const response = await api.patch<{ success: boolean; message: string; data: any }>(
    `/job-tasks/submissions/${applicationId}/evaluate`,
    payload,
  )
  return response
}

