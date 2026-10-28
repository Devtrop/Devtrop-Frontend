'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import JobForm from '@/components/jobs/JobForm'
import { createJob } from '@/lib/jobs'
import type { CreateJobPayload } from '@/types/job'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { JobFormSkeleton } from '@/components/dashboard/jobs/JobFormSkeleton'

export function CreateJobView() {
  const router = useRouter()

  async function handleCreate(data: CreateJobPayload) {
    try {
      await createJob(data)
      toast.success('Job created successfully!')
      router.push('/dashboard/admin/jobs')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create job')
      throw error
    }
  }

  return (
    <RoleGuard
      fallback={<JobFormSkeleton />}
      permissions={[
        'job_post.create',
        'job_post.publish',
        'job.create',
        'jobs.create',
        'jobs.manage',
      ]}
      allowedRoles={['SUPER_ADMIN', 'ADMIN']}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 w-full">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Create New Job
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl">
              Create a new job posting and publish it for candidates.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
            <Link href="/dashboard/admin/jobs" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-border hover:bg-muted text-xs h-8 px-3 rounded-none w-full sm:w-auto"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to Jobs</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-border bg-card rounded-none overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/40 px-4 sm:px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">Job Information</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Provide the details candidates need to understand this position.
            </p>
          </CardHeader>

          <CardContent className="px-4 py-5 sm:px-6 sm:py-6">
            <JobForm submitLabel="Create Job" onSubmit={handleCreate} />
          </CardContent>
        </Card>

        {/* Tip Card */}
        <Card className="border-accent bg-accent-soft rounded-none overflow-hidden">
          <CardContent className="p-4 flex gap-3">
            <div className="p-2 rounded-none bg-accent-soft shrink-0 h-fit">
              <Lightbulb className="size-4 text-accent dark:text-accent" />
            </div>
            <div>
              <p className="text-xs font-medium text-accent dark:text-accent">
                <span className="font-semibold">Tip:</span> Save the job as Draft if you're not
                ready to publish it. You can publish it later from the Jobs page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
