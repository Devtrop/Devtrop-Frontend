'use client'

import Link from 'next/link'
import { ArrowUpRight, MapPin, Clock, Briefcase } from 'lucide-react'
import type { Job } from '@/types/job'
import { formatJobLocation } from '@/lib/jobs'

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  const location = formatJobLocation(job)

  return (
    <Link
      href={`/careers/${job.slug}`}
      className="group block border-2 border-display bg-canvas p-6 hover:bg-accent-soft transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-display leading-tight group-hover:text-accent transition-colors">
            {job.title}
          </h3>

          {/* Meta info */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              <span>{location}</span>
            </div>
            {job.experience && (
              <div className="flex items-center gap-1.5">
                <Briefcase className="size-3.5 shrink-0" />
                <span>Experience: {job.experience}</span>
              </div>
            )}
            {job.deadline && (
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 shrink-0" />
                <span>
                  Deadline:{' '}
                  {new Date(job.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Salary */}
          {job.salaryRange && (
            <div className="mt-3 inline-flex items-center border-2 border-display px-3 py-1 text-xs font-bold uppercase tracking-wider text-display">
              Salary: {job.salaryRange}
            </div>
          )}
        </div>

        {/* Arrow icon */}
        <div className="shrink-0">
          <div className="flex size-10 items-center justify-center border-2 border-display text-display group-hover:bg-accent group-hover:border-accent group-hover:text-inverse transition-all">
            <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </Link>
  )
}
