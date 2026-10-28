'use client'

import { useState, useEffect } from 'react'
import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { JobCard } from './JobCard'
import { getPublicJobs } from '@/lib/jobs'
import type { Job } from '@/types/job'
import { JobStatus } from '@/types/job'
import { Loader2 } from 'lucide-react'

export function JobsListings() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true)
        const result = await getPublicJobs({ status: JobStatus.ACTIVE, sort: 'latest', limit: 50 })
        setJobs(result.data || [])
      } catch (err) {
        console.error('Failed to fetch jobs:', err)
        setError('Failed to load job listings. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  return (
    <section className="border-b-4 border-display" id="jobs">
      <SectionContainer className="py-20 lg:py-28">
        {/* Section heading */}
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-display">
            Open Positions
          </h2>
          <p className="mt-3 text-sm text-muted max-w-2xl">
            We&apos;re looking for exceptional engineers to join our team. All positions are based
            in Dhaka, Bangladesh unless marked as Remote.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16 border-2 border-display">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-8 animate-spin text-accent" />
              <p className="text-sm text-muted">Loading positions...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="p-8 border-2 border-display bg-accent-soft">
            <p className="text-sm text-body">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && jobs.length === 0 && (
          <div className="p-12 text-center border-2 border-display">
            <p className="text-lg font-bold uppercase tracking-wide text-display">
              No Open Positions
            </p>
            <p className="mt-2 text-sm text-muted">
              We don&apos;t have any open positions at the moment. Check back soon or follow us on
              social media for updates.
            </p>
          </div>
        )}

        {/* Jobs grid */}
        {!loading && !error && jobs.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </SectionContainer>
    </section>
  )
}
