import { api } from '@/lib/api'

export interface JobTask {
  id: string
  jobId: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
}

export async function getJobTasks(): Promise<JobTask[]> {
  // api.get() auto-unwraps { success, message, data } -> returns data directly
  const response = await api.get<JobTask[]>('/job-tasks')
  return response
}

export async function getJobTask(id: string): Promise<JobTask> {
  const response = await api.get<JobTask>(`/job-tasks/${id}`)
  return response
}

export async function getJobTaskByJobId(jobId: string): Promise<JobTask> {
  const response = await api.get<JobTask>(`/job-tasks/job/${jobId}`)
  return response
}

export interface CreateJobTaskPayload {
  title: string
  description: string
}

export async function createJobTask(
  jobId: string,
  payload: CreateJobTaskPayload,
): Promise<JobTask> {
  const response = await api.post<JobTask>(`/job-tasks/${jobId}`, payload)
  return response
}

export interface UpdateJobTaskPayload {
  title?: string
  description?: string
}

export async function updateJobTask(id: string, payload: UpdateJobTaskPayload): Promise<JobTask> {
  const response = await api.patch<JobTask>(`/job-tasks/${id}`, payload)
  return response
}

export async function deleteJobTask(id: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/job-tasks/${id}`)
}
