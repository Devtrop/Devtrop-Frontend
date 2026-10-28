'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { AdminSectionSkeleton } from '@/components/dashboard/admin/AdminSectionSkeleton'
import { api } from '@/lib/api'
import { getAdminJobs } from '@/lib/jobs'
import { deleteJobTask, getJobTasks, updateJobTask, type JobTask } from '@/lib/job-tasks'
import type { Job } from '@/types/job'

import { JobTaskModal } from './JobTaskModal'
import { JobTasksHeader } from './JobTasksHeader'
import { JobTasksTable } from './JobTasksTable'

export function JobTasksHub() {
  const router = useRouter()
  const [tasks, setTasks] = useState<JobTask[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [jobsLoading, setJobsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'edit' | 'view'>('view')
  const [selectedTask, setSelectedTask] = useState<JobTask | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadJobs = useCallback(async () => {
    try {
      setJobsLoading(true)

      if (!api.isAuthenticated()) {
        setJobs([])
        toast.error('You are not authenticated.')
        return
      }

      const result = await getAdminJobs({ page: 1, limit: 100 })

      const jobsData = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : []

      setJobs(jobsData)
    } catch (error) {
      setJobs([])
      toast.error(error instanceof Error ? error.message : 'Failed to load jobs.')
    } finally {
      setJobsLoading(false)
    }
  }, [])

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)

      if (!api.isAuthenticated()) {
        setTasks([])
        toast.error('You are not authenticated.')
        return
      }

      const response = await getJobTasks()

      const taskList = Array.isArray(response)
        ? response
        : Array.isArray((response as { data?: JobTask[] } | undefined)?.data)
          ? ((response as { data?: JobTask[] }).data ?? [])
          : []

      setTasks(taskList)
    } catch (error) {
      setTasks([])
      toast.error(error instanceof Error ? error.message : 'Failed to load job tasks.')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshData = useCallback(async () => {
    await Promise.all([loadJobs(), loadTasks()])
  }, [loadJobs, loadTasks])

  useEffect(() => {
    void refreshData()
  }, [refreshData])

  const jobNameMap = useMemo(
    () => Object.fromEntries(jobs.map((job) => [job.id, job.title])),
    [jobs],
  )

  const navigateToCreate = () => {
    router.push('/dashboard/admin/job-tasks/create')
  }

  const openViewModal = (task: JobTask) => {
    setSelectedTask(task)
    setModalMode('view')
    setModalOpen(true)
  }

  const openEditModal = (task: JobTask) => {
    setSelectedTask(task)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleSubmit = async (values: { title: string; description: string }) => {
    try {
      setIsSubmitting(true)

      if (modalMode === 'edit' && selectedTask) {
        const response = await updateJobTask(selectedTask.id, {
          title: values.title.trim(),
          description: values.description.trim(),
        })

        const updated: JobTask =
          response && typeof response === 'object' && 'data' in response
            ? (response.data as JobTask)
            : (response as unknown as JobTask)

        setTasks((prev) =>
          prev.map((task) => (task.id === selectedTask.id ? { ...task, ...updated } : task)),
        )
        toast.success('Job task updated successfully.')
      }

      setModalOpen(false)
      setSelectedTask(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save job task.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = (task: JobTask) => {
    toast(`Delete "${task.title}"?`, {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await deleteJobTask(task.id)
            setTasks((prev) => prev.filter((item) => item.id !== task.id))
            toast.success('Job task deleted successfully.')
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete job task.')
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    })
  }

  if (loading && tasks.length === 0) {
    return <AdminSectionSkeleton />
  }

  return (
    <RoleGuard
      fallback={<AdminSectionSkeleton />}
      permissions={[
        'task.read',
        'task.create',
        'task.update',
        'task.delete',
        'task.assign',
        'task.reassign',
        'task.status.update',
        'task_report.read',
        'task_report.create',
        'task_report.update',
        'task_report.approve',
        'job_task.read',
        'job_task.create',
        'job_task.update',
        'job_task.delete',
        'job-tasks.manage',
      ]}
      allowedRoles={['SUPER_ADMIN', 'ADMIN']}
    >
      <div className="space-y-6">
        <JobTasksHeader
          onCreateTask={navigateToCreate}
          onRefresh={() => void refreshData()}
          loading={loading || jobsLoading}
        />

        <JobTasksTable
          tasks={tasks}
          jobNameMap={jobNameMap}
          loading={loading}
          onViewTask={openViewModal}
          onEditTask={openEditModal}
          onDeleteTask={handleDeleteTask}
          onCreateTask={navigateToCreate}
        />

        <JobTaskModal
          key={`${modalMode}-${selectedTask?.id ?? 'new'}-${jobs.length}`}
          open={modalOpen}
          mode={modalMode}
          task={selectedTask}
          jobs={jobs}
          jobNameMap={jobNameMap}
          isSubmitting={isSubmitting}
          onClose={() => {
            setModalOpen(false)
            setSelectedTask(null)
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </RoleGuard>
  )
}
