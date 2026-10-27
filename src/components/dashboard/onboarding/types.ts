export type OnboardingTabKey =
  'ALL' | 'OFFER_PENDING' | 'OFFER_SENT' | 'DOCS_SUBMITTED' | 'HIRED' | 'REJECTED'

export type OnboardingModalType =
  | 'TEMPLATES'
  | 'BULK_OFFER'
  | 'BULK_ORIENTATION'
  | 'BULK_REJECTION'
  | 'SINGLE_OFFER'
  | 'SINGLE_ORIENTATION'
  | 'SINGLE_REJECTION'
  | 'RESUBMISSION'
  | 'VIEWER'
  | null

export interface OnboardingCounts {
  all: number
  pending: number
  sent: number
  submitted: number
  hired: number
  rejected: number
}

export interface UniqueJobOption {
  id: string
  title: string
}

export type OnboardingSortOption =
  'recent_desc' | 'recent_asc' | 'name_asc' | 'name_desc' | 'applied_desc'
