import type { OnboardingTabKey } from './types'

export const ONBOARDING_STAGE_CONFIGS: Record<
  string,
  { label: string; color: string; dotColor: string }
> = {
  OFFER_PENDING: {
    label: 'Offer Pending',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    dotColor: 'bg-amber-400',
  },
  OFFER_SENT: {
    label: 'Offer Sent',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    dotColor: 'bg-blue-400',
  },
  DOCS_SUBMITTED: {
    label: 'Docs Submitted',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    dotColor: 'bg-purple-400',
  },
  HIRED: {
    label: 'Hired',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    dotColor: 'bg-emerald-400',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    dotColor: 'bg-rose-400',
  },
}

export const ONBOARDING_FILTER_TABS: Array<{ key: OnboardingTabKey; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'OFFER_PENDING', label: 'Offer Pending' },
  { key: 'OFFER_SENT', label: 'Offer Sent' },
  { key: 'DOCS_SUBMITTED', label: 'Docs Submitted' },
  { key: 'HIRED', label: 'Hired' },
  { key: 'REJECTED', label: 'Rejected' },
]

export function getInitials(candidateName?: string): string {
  if (!candidateName) return 'AP'
  return candidateName
    .split(' ')
    .map((namePart) => namePart[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}
