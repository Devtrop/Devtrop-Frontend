'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { api } from '@/lib/api'
import { getAdminJobs } from '@/lib/jobs'
import { useCreateJobTask } from '@/lib/query'
import type { Job } from '@/types/job'
import { ArrowLeft, Loader2, ListTodo } from 'lucide-react'

const TiptapEditor = dynamic(
  () => import('@/components/editor/TiptapEditor').then((mod) => ({ default: mod.TiptapEditor })),
  {
    loading: () => (
      <div className="w-full min-h-[300px] rounded-none border border-input bg-muted/50 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false,
  },
)

export function CreateJobTaskView() {
  const router = useRouter()
  const createMutation = useCreateJobTask()

  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobId, setJobId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

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

  useEffect(() => {
    void loadJobs()
  }, [loadJobs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!jobId) {
      toast.error('Please select a job for this task.')
      return
    }

    if (!trimmedTitle) {
      toast.error('Task title is required.')
      return
    }

    if (!trimmedDescription) {
      toast.error('Task description is required.')
      return
    }

    createMutation.mutate(
      {
        jobId,
        payload: {
          title: trimmedTitle,
          description: trimmedDescription,
        },
      },
      {
        onSuccess: () => {
          toast.success('Job task created successfully.')
          router.push('/dashboard/admin/job-tasks')
        },
      },
    )
  }

  if (jobsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard
      permissions={['job_task.create', 'task.create']}
      allowedRoles={['SUPER_ADMIN', 'ADMIN']}
    >
      <form onSubmit={handleSubmit} className="max-w-[900px] mx-auto space-y-6 pb-8">
        <div className="flex flex-col gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/admin/job-tasks')}
            className="gap-1.5 w-fit h-8 px-2 text-xs hover:bg-muted"
          >
            <ArrowLeft className="size-3.5" />
            Back to Job Tasks
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Create Job Task
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a new task for a job posting.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/admin/job-tasks')}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !jobId}
                className="gap-2 bg-accent hover:bg-accent"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <ListTodo className="size-4" />
                    Create Task
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Job Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Job *</CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex items-center gap-2 rounded-none border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent" />
                  Loading jobs...
                </div>
              ) : jobs.length === 0 ? (
                <div className="rounded-none border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  No jobs available. Create a job first.
                </div>
              ) : (
                <Select value={jobId} onValueChange={setJobId} disabled={createMutation.isPending}>
                  <SelectTrigger className="h-9 text-xs border-border bg-background">
                    <SelectValue placeholder="Select a job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-task-title" className="text-xs font-medium">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="job-task-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={createMutation.isPending}
                  placeholder="Backend Developer Task"
                  className="h-9 text-xs border-border bg-background"
                />
              </div>
            </CardContent>
          </Card>

          {/* Description Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Description *</CardTitle>
            </CardHeader>
            <CardContent>
              <TiptapEditor
                content={description}
                onChange={setDescription}
                placeholder="Build a REST API using NestJS and Prisma."
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </RoleGuard>
  )
}
