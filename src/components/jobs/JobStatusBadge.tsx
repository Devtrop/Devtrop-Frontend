import type { JobStatus } from '@/types/job'

interface Props {
  status: JobStatus
}

const statusClasses: Record<JobStatus, string> = {
  DRAFT: 'border-white/10 bg-white/5 text-white/60',

  ACTIVE: 'border-primary/20 bg-primary/10 text-primary',

  CLOSED: 'border-red-500/20 bg-red-500/10 text-red-400',
}

export default function JobStatusBadge({ status }: Props) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[status]}`}
    >
      {status}
    </span>
  )
}
