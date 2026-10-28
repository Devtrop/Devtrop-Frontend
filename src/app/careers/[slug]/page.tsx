'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageShell } from '@/components/shared/layout/PageShell'
import { JobDetail } from '@/components/careers/JobDetail'
import { getPublicJob } from '@/lib/jobs'
import { Loader2 } from 'lucide-react'
import type { Job } from '@/types/job'

export default function JobPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true)
        const slug = params.slug as string
        const jobData = await getPublicJob(slug)
        setJob(jobData)
      } catch (err) {
        console.error('Failed to fetch job:', err)
        setError('Job not found')
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchJob()
    }
  }, [params.slug])

  if (loading) {
    return (
      <PageShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-accent" />
            <p className="text-sm text-muted">Loading job details...</p>
          </div>
        </div>
      </PageShell>
    )
  }

  if (error || !job) {
    return (
      <PageShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-display mb-4">
              Job Not Found
            </h1>
            <p className="text-muted mb-6">
              The job you're looking for doesn't exist or is no longer available.
            </p>
            <button
              onClick={() => router.push('/careers')}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-display bg-accent text-inverse font-bold uppercase tracking-wider hover:bg-accent-dark transition-colors"
            >
              Back to Careers
            </button>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <JobDetail job={job} />
    </PageShell>
  )
}
