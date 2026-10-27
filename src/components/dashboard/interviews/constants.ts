import { ApplicationStatusOption, Interview, InterviewScheduleStatus } from './types'

export const APPLICATION_STATUS_OPTIONS: ApplicationStatusOption[] = [
  {
    value: 'APPLIED',
    label: 'Applied',
    color: 'text-slate-400 border-slate-500/30 bg-slate-500/10',
    dotColor: 'bg-slate-400',
  },
  {
    value: 'SELECTED',
    label: 'Selected',
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    dotColor: 'bg-blue-400',
  },
  {
    value: 'TASK_ASSIGNED',
    label: 'Task Assigned',
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    dotColor: 'bg-indigo-400',
  },
  {
    value: 'TASK_SUBMITTED',
    label: 'Task Submitted',
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    dotColor: 'bg-purple-400',
  },
  {
    value: 'INTERVIEW_SELECTED',
    label: 'Interview Ready',
    color: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    dotColor: 'bg-violet-400',
  },
  {
    value: 'INTERVIEW_SCHEDULED',
    label: 'Scheduled',
    color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    dotColor: 'bg-sky-400',
  },
  {
    value: 'INTERVIEW_COMPLETED',
    label: 'Completed',
    color: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
    dotColor: 'bg-teal-400',
  },
  {
    value: 'OFFER_PENDING',
    label: 'Offer Pending',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    dotColor: 'bg-emerald-400',
  },
  {
    value: 'OFFER_SENT',
    label: 'Offer Sent',
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    dotColor: 'bg-cyan-400',
  },
  {
    value: 'DOCS_SUBMITTED',
    label: 'Docs Submitted',
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    dotColor: 'bg-amber-400',
  },
  {
    value: 'REJECTED',
    label: 'Rejected',
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    dotColor: 'bg-rose-400',
  },
  {
    value: 'CLOSED',
    label: 'Closed',
    color: 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10',
    dotColor: 'bg-zinc-400',
  },
]

export const SCHEDULE_STATUS_CONFIG: Record<
  InterviewScheduleStatus,
  { label: string; color: string; dot: string }
> = {
  PENDING_BOOKING: {
    label: 'Pending Booking',
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    dot: 'bg-amber-400',
  },
  SCHEDULED: {
    label: 'Scheduled',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    dot: 'bg-emerald-400',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    dot: 'bg-blue-400',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    dot: 'bg-rose-400',
  },
}

/** Allowed manual status transitions for application in interview hub. */
export function getAvailableStatusTransitions(currentStatus: string): ApplicationStatusOption[] {
  let allowedValues: string[] = []

  switch (currentStatus) {
    case 'TASK_SUBMITTED':
      allowedValues = ['INTERVIEW_SCHEDULED', 'REJECTED', 'CLOSED']
      break
    case 'INTERVIEW_SELECTED':
    case 'SELECTED':
    case 'INTERVIEW_SCHEDULED':
    case 'INTERVIEW_COMPLETED':
      allowedValues = ['OFFER_PENDING', 'REJECTED', 'CLOSED']
      break
    case 'OFFER_PENDING':
      allowedValues = ['REJECTED', 'CLOSED']
      break
    case 'REJECTED':
      allowedValues = ['OFFER_PENDING', 'CLOSED']
      break
    default:
      allowedValues = ['OFFER_PENDING', 'REJECTED', 'CLOSED']
  }

  // Always ensure CLOSED is available if not already the current status
  if (currentStatus !== 'CLOSED' && !allowedValues.includes('CLOSED')) {
    allowedValues.push('CLOSED')
  }

  return APPLICATION_STATUS_OPTIONS.filter((opt) => allowedValues.includes(opt.value))
}

export type CandidateTabCategory =
  'COMPLETED' | 'SCHEDULED' | 'PENDING' | 'INTERVIEW_SELECTED' | 'SELECTED' | 'CANCELLED'

/** Assign interview candidate to mutually-exclusive status tab by priority. */
export function getCandidateTabCategory(item: Interview): CandidateTabCategory {
  const appStatus = item.application?.status

  // 1. COMPLETED: Interview evaluated, marked complete, or decided (OFFER_PENDING / REJECTED)
  if (
    item.status === 'COMPLETED' ||
    appStatus === 'INTERVIEW_COMPLETED' ||
    appStatus === 'OFFER_PENDING' ||
    appStatus === 'REJECTED' ||
    Boolean(item.feedback)
  ) {
    return 'COMPLETED'
  }

  // 2. CANCELLED: Session cancelled
  if (item.status === 'CANCELLED') {
    return 'CANCELLED'
  }

  // 3. SCHEDULED: Must actually have a booked slot or status is explicitly SCHEDULED
  if (item.status === 'SCHEDULED' || Boolean(item.slot) || Boolean(item.slotId)) {
    return 'SCHEDULED'
  }

  // 4. PENDING: Invitation token sent (PENDING_BOOKING), waiting for self-booking
  if (item.status === 'PENDING_BOOKING' && Boolean(item.token)) {
    return 'PENDING'
  }

  // 5. INTERVIEW_SELECTED: Shortlisted applicant for interview, ready to invite (synthetic or no token)
  return 'INTERVIEW_SELECTED'
}

/** Classify selected candidates into actionable dispatch categories. */
export function classifyInterviewCandidates(items: Interview[]) {
  const invitations: Interview[] = []
  const reschedules: Interview[] = []
  const outcomes: Interview[] = []

  items.forEach((item) => {
    const category = getCandidateTabCategory(item)
    const appStatus = item.application?.status

    // Only candidates whose decision is REJECTED can be sent rejection notice from interview hub
    if (appStatus === 'REJECTED') {
      outcomes.push(item)
    } else if (
      category === 'INTERVIEW_SELECTED' ||
      category === 'SELECTED' ||
      category === 'PENDING'
    ) {
      invitations.push(item)
    } else if (category === 'SCHEDULED' || category === 'CANCELLED') {
      reschedules.push(item)
    }
  })

  return { invitations, reschedules, outcomes }
}
