'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getAdminJob, deleteJob, formatJobLocation } from '@/lib/jobs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Loader2, AlertTriangle, Trash2 } from 'lucide-react'
import type { Job } from '@/types/job'
import { JobFormSkeleton } from '@/components/dashboard/jobs/JobFormSkeleton'

export default function DeleteJobPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const jobId = params.id

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadJob() {
      try {
        setLoading(true)
        setError('')

        const result = await getAdminJob(jobId)
        setJob(result)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load job')
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      loadJob()
    }
  }, [jobId])

  const handleDelete = async () => {
    if (!job) return

    try {
      setDeleting(true)
      setError('')

      await deleteJob(job.id)

      toast.success('Job deleted successfully!')
      // Redirect to jobs list
      router.push('/dashboard/admin/jobs')
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete job'
      setError(errorMessage)
      toast.error(errorMessage)
      setDeleting(false)
    }
  }

  if (loading) {
    return <JobFormSkeleton />
  }

  if (error && !job) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-lg border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <p className="font-semibold text-destructive">Error</p>
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
            <Button onClick={() => router.push('/dashboard/admin/jobs')} className="mt-5 gap-1.5">
              <ArrowLeft className="size-3.5" />
              Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="max-w-2xl mx-auto">
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
        </div>

        {/* Delete Confirmation Card */}
        <Card className="overflow-hidden border-destructive/30 bg-card">
          <CardHeader className="border-b border-destructive/20 bg-destructive/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Delete Job</h1>
                <p className="text-sm text-destructive">This action cannot be undone</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Job Details */}
            <div className="rounded-none border border-border bg-muted/50 p-4 space-y-3">
              <h2 className="font-semibold text-foreground">{job.title}</h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs font-mono">
                  #{job.jobCode}
                </Badge>
                {job.experience && (
                  <Badge variant="secondary" className="text-xs">
                    {job.experience}
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className="text-xs border-accent bg-accent-soft text-accent"
                >
                  {formatJobLocation(job)}
                </Badge>
              </div>
              {job._count && job._count.applications > 0 && (
                <div className="mt-3 rounded-none border border-amber-500/30 bg-amber-500/10 p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                        This job has {job._count.applications} application
                        {job._count.applications !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        Deleting this job will also delete all associated applications and data.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Warning Message */}
            <div className="space-y-3">
              <p className="font-medium text-foreground">
                Are you sure you want to delete this job posting?
              </p>
              <ul className="ml-5 list-disc space-y-1.5 text-sm text-muted-foreground">
                <li>The job will be permanently removed</li>
                <li>All applications will be deleted</li>
                <li>All interviews and task assignments will be removed</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-none border border-destructive/30 bg-destructive/10 p-4">
                <div className="flex gap-2">
                  <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-destructive">Failed to delete job</p>
                    <p className="text-xs text-destructive/80">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/admin/jobs')}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" />
                    Delete Job
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
