import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from './keys'
import { ApiError } from '@/lib/api'
import {
  getJobTasks,
  getJobTask,
  getJobTaskByJobId,
  createJobTask,
  updateJobTask,
  deleteJobTask,
  type JobTask,
  type CreateJobTaskPayload,
  type UpdateJobTaskPayload,
} from '@/lib/job-tasks'
import {
  getTaskSubmissions,
  getTaskSubmissionDetail,
  deleteTaskSubmission,
  deleteTaskAssignment,
  type TaskSubmissionDetail,
  type TaskSubmissionListResponse,
  type GetTaskSubmissionsParams,
} from '@/lib/task-submissions'

// ============= Job Task Queries =============

export function useJobTasks(options?: Partial<UseQueryOptions<JobTask[], Error>>) {
  return useQuery({
    queryKey: queryKeys.jobTasks.lists(),
    queryFn: () => getJobTasks(),
    ...options,
  })
}

export function useJobTask(id: string, options?: Partial<UseQueryOptions<JobTask, Error>>) {
  return useQuery({
    queryKey: queryKeys.jobTasks.detail(id),
    queryFn: () => getJobTask(id),
    enabled: !!id,
    ...options,
  })
}

export function useJobTaskByJobId(
  jobId: string,
  options?: Partial<UseQueryOptions<JobTask, Error>>,
) {
  return useQuery({
    queryKey: queryKeys.jobTasks.byJob(jobId),
    queryFn: () => getJobTaskByJobId(jobId),
    enabled: !!jobId,
    ...options,
  })
}

// ============= Task Submission Queries =============

export function useTaskSubmissions(
  params?: GetTaskSubmissionsParams,
  options?: Partial<UseQueryOptions<TaskSubmissionListResponse, Error>>,
) {
  return useQuery({
    queryKey: queryKeys.taskSubmissions.list(params),
    queryFn: () => getTaskSubmissions(params),
    placeholderData: (previousData) => previousData,
    ...options,
  })
}

export function useTaskSubmissionDetail(
  id: string,
  options?: Partial<UseQueryOptions<TaskSubmissionDetail, Error>>,
) {
  return useQuery({
    queryKey: queryKeys.taskSubmissions.detail(id),
    queryFn: () => getTaskSubmissionDetail(id),
    enabled: !!id,
    ...options,
  })
}

// ============= Job Task Mutations =============

export function useCreateJobTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: CreateJobTaskPayload }) =>
      createJobTask(jobId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobTasks.all })
      toast.success('Job task created successfully')
    },
    onError: (error: Error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to create job task'
      toast.error(message)
    },
  })
}

export function useUpdateJobTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateJobTaskPayload }) =>
      updateJobTask(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobTasks.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobTasks.all })
      toast.success('Job task updated successfully')
    },
    onError: (error: Error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to update job task'
      toast.error(message)
    },
  })
}

export function useDeleteJobTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteJobTask(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.jobTasks.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobTasks.all })
      toast.success('Job task deleted successfully')
    },
    onError: (error: Error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to delete job task'
      toast.error(message)
    },
  })
}

// ============= Task Submission Mutations =============

export function useDeleteTaskSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (applicationId: string) => deleteTaskSubmission(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taskSubmissions.all })
      toast.success('Task submission deleted successfully')
    },
    onError: (error: Error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to delete submission'
      toast.error(message)
    },
  })
}

// ============= Task Assignment Mutations =============

export function useDeleteTaskAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assignmentId: string) => deleteTaskAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taskSubmissions.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all })
      toast.success('Task assignment deleted successfully')
    },
    onError: (error: Error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to delete assignment'
      toast.error(message)
    },
  })
}
