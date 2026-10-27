import Link from 'next/link'
import { ArrowRight, Calendar, MapPin } from 'lucide-react'

import type { Job } from '@/types/job'
import { formatJobLocation } from '@/lib/jobs'

interface Props {
  job: Job
}

export default function JobCard({ job }: Props) {
  const formatDeadline = (deadline?: string | null) => {
    if (!deadline) return null

    const date = new Date(deadline)
    const now = new Date()

    const diffMs = date.getTime() - now.getTime()
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    return {
      formatted: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      daysLeft,
      isExpired: diffMs < 0,
    }
  }

  const deadline = formatDeadline(job.deadline)
  const isExpired = deadline?.isExpired ?? false
  const formattedLocation = formatJobLocation(job)

  const daysLeftLabel = deadline
    ? isExpired
      ? 'Closed'
      : deadline.daysLeft === 0
        ? 'Closes today'
        : deadline.daysLeft === 1
          ? '1 day left'
          : `${deadline.daysLeft} days left`
    : null

  return (
    <article className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-emerald-500/5 sm:p-6">
      {/* ── MOBILE LAYOUT (hidden on sm+) ── */}
      <div className="flex flex-col gap-4 sm:hidden">
        {/* Row 1: Job Title + Type/Location badges */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-bold leading-tight tracking-tight text-white transition-colors group-hover:text-emerald-400">
            {job.title}
          </h2>

          {/* Stacked badges top-right */}
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {/* Location badge — split into type line + location line */}
            {formattedLocation &&
              (() => {
                const [typePart, locationPart] = formattedLocation.split(' · ')
                return locationPart ? (
                  <span className="flex flex-col items-end gap-1">
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                      {typePart}
                    </span>
                    <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                      <MapPin className="size-3 shrink-0 text-slate-400" />
                      <span>{locationPart}</span>
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                    <MapPin className="size-3 shrink-0 text-slate-400" />
                    <span>{typePart}</span>
                  </span>
                )
              })()}
          </div>
        </div>

        {/* Row 2: Salary + Experience */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          {job.salaryRange && (
            <span>
              Salary: <strong className="font-semibold text-slate-200">{job.salaryRange}</strong>
            </span>
          )}
          {job.experience && (
            <span>
              Experience: <strong className="font-semibold text-slate-200">{job.experience}</strong>
            </span>
          )}
        </div>

        {/* Row 3: Deadline left + days-left badge */}
        {deadline && (
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className={isExpired ? 'text-red-400' : 'text-slate-400'}>
              Deadline:{' '}
              <strong className={`font-semibold ${isExpired ? 'text-red-300' : 'text-slate-200'}`}>
                {deadline.formatted}
              </strong>
            </span>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                isExpired
                  ? 'border-red-500/30 bg-red-500/10 text-red-400'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              }`}
            >
              {daysLeftLabel}
            </span>
          </div>
        )}

        {/* Row 4: See Details button — full width */}
        {isExpired ? (
          <button
            type="button"
            disabled
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-2 text-xs font-semibold text-slate-500"
          >
            Applications Closed
          </button>
        ) : (
          <Link
            href={`/careers/${job.slug}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20"
          >
            Apply Now
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      {/* ── DESKTOP LAYOUT (hidden below sm) ── */}
      <div className="hidden sm:block">
        {/* Header row */}
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-emerald-400">
              {job.title}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <MapPin className="size-3.5 shrink-0 text-emerald-400" />
                <span className="truncate">{formattedLocation}</span>
              </div>

              {deadline && (
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                    isExpired
                      ? 'border-red-500/20 bg-red-500/10 text-red-400'
                      : 'border-white/10 bg-white/5 text-slate-300'
                  }`}
                >
                  <Calendar className="size-3.5 shrink-0" />
                  <span>{daysLeftLabel}</span>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0">
            {isExpired ? (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-slate-500"
              >
                Applications Closed
              </button>
            ) : (
              <Link
                href={`/careers/${job.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20"
              >
                Apply Now
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Metadata row */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-sm text-slate-400">
          {job.salaryRange && (
            <span>
              Salary: <strong className="font-medium text-slate-200">{job.salaryRange}</strong>
            </span>
          )}
          {job.experience && (
            <span>
              Experience: <strong className="font-medium text-slate-200">{job.experience}</strong>
            </span>
          )}
          {deadline && (
            <div
              className={`ml-auto flex items-center gap-2 ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}
            >
              <Calendar className="size-4 shrink-0" />
              <span>
                Deadline: <strong className="font-medium">{deadline.formatted}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
