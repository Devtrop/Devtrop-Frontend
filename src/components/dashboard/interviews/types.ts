import type { ApplicationStatus, InterviewScheduleStatus } from '@/types/job'

export type { InterviewScheduleStatus, ApplicationStatus }

export interface ApplicationStatusOption {
  value: ApplicationStatus
  label: string
  color: string
  dotColor: string
}

export interface Applicant {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
}

export interface Job {
  id: string
  title: string
  description?: string
  status?: string
  deadline?: string | null
}

export interface InterviewSlot {
  id: string
  jobId?: string
  groupName?: string
  startTime: string
  endTime: string
  meetingUrl?: string
  isBooked: boolean
}

export interface SlotGroup {
  groupName: string
  totalSlots: number
  availableSlots: number
  bookedSlots: number
  startDate: string | null
  endDate: string | null
  latestCreatedAt: string
}

export interface InterviewFeedback {
  id?: string
  technicalSkill: number
  communication: number
  comments?: string
  createdAt?: string
}

export interface CommunicationLog {
  id?: string
  type: string
  sentAt: string
}

export interface Interview {
  id: string
  applicationId: string
  slotId?: string | null
  token?: string | null
  tokenExpiresAt?: string | null
  status: InterviewScheduleStatus
  createdAt: string
  application: {
    id: string
    status: ApplicationStatus | string
    appliedAt?: string
    applicant: Applicant
    job: Job
    communicationLogs?: CommunicationLog[]
    documents?: Array<{ id: string; storageKey: string; mimeType: string }>
  }
  slot?: InterviewSlot | null
  feedback?: InterviewFeedback | null
  communicationLogs?: CommunicationLog[]
}

export interface InterviewStatsData {
  total: number
  selected: number
  pendingBooking: number
  scheduled: number
  completed: number
  cancelled: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
