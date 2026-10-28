export enum JobType {
  REMOTE = 'REMOTE',
  ONSITE = 'ONSITE',
  HYBRID = 'HYBRID',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export interface Job {
  id: string
  jobCode: string
  title: string
  slug: string
  jobType: JobType
  location?: string | null
  category?: string | null
  experience?: string | null
  salaryRange?: string | null
  description: string
  requirements?: string | null
  status: JobStatus
  publishedAt?: string | null
  deadline?: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    applications: number
  }
}

export interface CreateJobPayload {
  title: string
  description: string
  jobType: JobType
  location?: string
  experience?: string
  salaryRange?: string
  requirements?: string
  status?: JobStatus
  deadline?: string
}

export interface UpdateJobPayload {
  title?: string
  description?: string
  jobType?: JobType
  location?: string
  experience?: string
  salaryRange?: string
  requirements?: string
  status?: JobStatus
  deadline?: string
}

export interface JobQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: JobStatus
  jobType?: JobType
  sort?: 'latest' | 'oldest'
}

export type ApplicationStatus =
  | 'APPLIED'
  | 'SELECTED'
  | 'TASK_ASSIGNED'
  | 'TASK_SUBMITTED'
  | 'INTERVIEW_SELECTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_COMPLETED'
  | 'OFFER_PENDING'
  | 'OFFER_SENT'
  | 'DOCS_SUBMITTED'
  | 'HIRED'
  | 'REJECTED'
  | 'CLOSED'

export type DocumentType =
  | 'CV'
  | 'NID'
  | 'ELECTRICITY_BILL'
  | 'CERTIFICATE'
  | 'SIGNED_OFFER_LETTER'
  | 'SIGNED_AGREEMENT'
  | 'OTHER'

export type EmailLogStatus = 'PENDING' | 'SENT' | 'FAILED'

export type EmailLogType =
  | 'APPLICATION_RECEIVED'
  | 'APPLICATION_SELECTED'
  | 'TASK_ASSIGNED'
  | 'TASK_SUBMITTED_CONFIRMATION'
  | 'INTERVIEW_INVITATION'
  | 'INTERVIEW_CONFIRMATION'
  | 'INTERVIEW_RESCHEDULED'
  | 'OUTCOME_HIRED'
  | 'OUTCOME_REJECTED'
  | 'OFFER_AND_AGREEMENT'
  | 'ORIENTATION_AND_CREDENTIALS'

export interface EmailLog {
  id: string
  type: EmailLogType | string
  status: EmailLogStatus | string
  sentAt?: string | null
  createdAt?: string
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export type AdminAccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED'

export type TaskAssignmentStatus = 'SENT' | 'SUBMITTED' | 'EXPIRED'

export type InterviewScheduleStatus = 'PENDING_BOOKING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'

export interface JobResponse {
  success: boolean
  message: string
  data: Job
}

export interface PaginatedJobs {
  data: Job[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    nextCursor?: string | null
    hasMore?: boolean
    stats?: {
      total: number
      active: number
      draft: number
      closed: number
    }
  }
}

export interface Applicant {
  id: string
  name: string
  email: string
  phone: string
  address: string | null
  github: string | null
  portfolio: string | null
  linkedin: string | null
}

export interface ApplicationDocument {
  id: string
  type: DocumentType
  storageKey: string
  mimeType: string
  size: number
  hash?: string
  createdAt?: string
}

export interface ApplicationStatusHistory {
  id: string
  applicationId?: string
  status: ApplicationStatus
  changedAt: string
  changedBy?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Application {
  id: string
  applicationCode?: string
  applicantId: string
  jobId: string
  status: ApplicationStatus
  appliedAt: string
  onboardingToken?: string | null
  onboardingTokenExpiresAt?: string | null
  offerSentAt?: string | null
  docsSubmittedAt?: string | null
  docsVerifiedAt?: string | null
  orientationSentAt?: string | null

  applicant: Applicant
  job?: {
    id: string
    title: string
    jobCode: string
  }

  documents: ApplicationDocument[]
  emailLogs?: EmailLog[]
  applicationStatusHistories?: ApplicationStatusHistory[]
}

export interface ApplicationItem {
  id: string
  applicationCode: string
  status: ApplicationStatus
  appliedAt: string
  createdAt: string
  updatedAt: string
  applicant: {
    id: string
    name: string
    email: string
    phone: string
    address?: string | null
    github: string
    portfolio: string
    linkedin: string
  }
  job: {
    id: string
    jobCode: string
    title: string
    experience?: string | null
    salaryRange?: string | null
    status: string
  }
  documents: Array<{
    id: string
    type: string
    storageKey: string
    mimeType: string
    size: number
  }>
}

export interface TaskSubmission {
  id: string
  assignmentId: string
  githubRepoUrl: string
  backendRepoUrl?: string
  liveUrl: string
  note?: string
  submittedAt: string
}

export interface TaskSubmissionDetail {
  id: string
  jobTaskId: string
  applicationId: string
  applicationCode?: string
  status: TaskAssignmentStatus
  assignedAt: string
  updatedAt: string
  expiresAt?: string
  submittedAt?: string
  githubRepoUrl?: string
  backendRepoUrl?: string
  liveUrl?: string
  note?: string
  score?: number | null
  result?: 'PASS' | 'FAIL' | string | null
  feedback?: string | null
  reviewedAt?: string | null
  reviewedBy?: string | null
  applicant: {
    id: string
    name: string
    email: string
    phone?: string
  }
  jobTask: {
    id: string
    jobId: string
    jobCode?: string
    title: string
    description: string
  }
  jobTitle?: string
  jobCode?: string
  application: {
    id: string
    status: ApplicationStatus
    applicationCode?: string
    jobCode?: string
  }
}

export interface TaskSubmissionListResponse {
  data: TaskSubmissionDetail[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
