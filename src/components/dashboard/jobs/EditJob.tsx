'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import JobForm from '@/components/jobs/JobForm'
import { getAdminJob, updateJob } from '@/lib/jobs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Loader2, Briefcase } from 'lucide-react'
import type { Job, UpdateJobPayload } from '@/types/job'
import { JobFormSkeleton } from '@/components/dashboard/jobs/JobFormSkeleton'

export default function EditJobPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const id = params.id

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadJob() {
      try {
        setLoading(true)
        setError('')

        const result = await getAdminJob(id)

        setJob(result)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load job')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadJob()
    }
  }, [id])

  async function handleUpdate(data: UpdateJobPayload) {
    try {
      await updateJob(id, data)
      toast.success('Job updated successfully!')
      router.push('/dashboard/admin/jobs')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update job')
      throw error
    }
  }

  if (loading) {
    return <JobFormSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-lg border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <p className="font-semibold text-destructive">Unable to load job</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/admin/jobs')}
              className="mt-4 gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-lg border-border bg-card">
          <CardContent className="p-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted mx-auto text-3xl">
              📋
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Job not found</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              The job you're trying to edit doesn't exist.
            </p>
            <Button
              onClick={() => router.push('/dashboard/admin/jobs')}
              className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/admin/jobs')}
            className="gap-1.5 w-fit h-8 px-2 text-xs hover:bg-muted"
          >
            <ArrowLeft className="size-3.5" />
            Back to Jobs
          </Button>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Edit Job
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Briefcase className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">{job.title}</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono font-medium text-muted-foreground">
                #{job.jobCode}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <JobForm
          initialData={job}
          submitLabel="Update Job"
          onSubmit={handleUpdate}
          isEditMode={true}
        />
      </div>
    </div>
  )
}
