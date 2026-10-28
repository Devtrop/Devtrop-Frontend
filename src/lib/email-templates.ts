import { api } from '@/lib/api'
import { emailCache } from '@/lib/email-templates-cache'
import type {
  EmailTemplate,
  EmailMessage,
  EmailLayout,
  CreateEmailLayoutDto,
  UpdateEmailLayoutDto,
  EmailTemplateCategory,
  CreateEmailMessageDto,
  UpdateEmailMessageDto,
  QueryEmailTemplateDto,
  PreviewEmailMessageDto,
  PreviewEmailResponse,
  CategoryVariableDef,
} from '@/types/email-template'

export interface EmailTemplateListResponse {
  data: EmailTemplate[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

function buildQueryParams(query: Record<string, any>): Record<string, string> {
  const params: Record<string, string> = {}
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value)
    }
  })
  return params
}

export const emailLayoutsApi = {
  async list(forceRefresh = false): Promise<EmailLayout[]> {
    if (!forceRefresh) {
      const cached = emailCache.getLayouts()
      if (cached) return cached
    }
    const res: any = await api.getRaw<any>('/email-layouts')
    const body = res?.data ?? res
    let data: EmailLayout[] = []
    if (Array.isArray(body)) data = body
    else if (body && Array.isArray(body.data)) data = body.data
    emailCache.setLayouts(data)
    return data
  },

  async getById(id: string): Promise<EmailLayout> {
    const res: any = await api.get<EmailLayout>(`/email-layouts/${id}`)
    return res?.data ?? res
  },

  async create(dto: CreateEmailLayoutDto): Promise<EmailLayout> {
    const res: any = await api.post<EmailLayout>('/email-layouts', dto)
    const data = res?.data ?? res
    if (data && data.id) {
      emailCache.addLayout(data)
    } else {
      emailCache.invalidateLayouts()
    }
    return data
  },

  async update(id: string, dto: UpdateEmailLayoutDto): Promise<EmailLayout> {
    const res: any = await api.patch<EmailLayout>(`/email-layouts/${id}`, dto)
    const data = res?.data ?? res
    if (data && data.id) {
      emailCache.updateLayout(data)
    } else {
      emailCache.invalidateLayouts()
    }
    return data
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete<{ success: boolean; message: string }>(`/email-layouts/${id}`)
    emailCache.removeLayout(id)
    return res
  },

  async setDefault(id: string): Promise<EmailLayout> {
    const res: any = await api.patch<EmailLayout>(`/email-layouts/${id}`, { isDefault: true })
    return res?.data ?? res
  },
}

export const emailTemplatesApi = {
  async uploadImage(file: File): Promise<{ url: string; key: string }> {
    const formData = new FormData()
    formData.append('image', file)
    const res: any = await api.postRaw<{ data: { url: string; key: string } }>(
      '/email-templates/upload-image',
      formData,
    )
    const body = res?.data ?? res
    return body?.data ?? body
  },

  async list(
    query?: QueryEmailTemplateDto,
    forceRefresh = false,
  ): Promise<EmailTemplateListResponse> {
    const isUnfiltered = !query?.search && !query?.status && !query?.category
    if (!forceRefresh && isUnfiltered) {
      const cached = emailCache.getTemplates()
      if (cached && cached.length > 1) {
        return {
          data: cached,
          meta: { total: cached.length, page: 1, limit: cached.length, totalPages: 1 },
        }
      }
    }
    const params = query ? buildQueryParams(query as Record<string, any>) : undefined
    const res: any = await api.getRaw<EmailTemplateListResponse>('/email-templates', params)
    const body = res?.data ?? res
    let items: EmailTemplate[] = []
    let meta = { total: 0, page: 1, limit: 20, totalPages: 1 }

    if (body && Array.isArray(body.data)) {
      items = body.data
      const pagination = body.pagination || body.meta || {}
      meta = {
        total: pagination.total ?? items.length,
        page: pagination.page ?? 1,
        limit: pagination.limit ?? items.length,
        totalPages: pagination.totalPages ?? 1,
      }
    } else if (Array.isArray(body)) {
      items = body
      meta = { total: items.length, page: 1, limit: items.length, totalPages: 1 }
    }

    if (isUnfiltered) {
      emailCache.setTemplates(items)
    }
    return { data: items, meta }
  },

  async getByCategory(category: EmailTemplateCategory): Promise<EmailTemplate[]> {
    const res = await api.get<{ data: EmailTemplate[]; count: number }>(
      `/email-templates/category/${category}`,
    )
    if (Array.isArray(res)) return res
    if (res && Array.isArray(res.data)) return res.data
    return []
  },

  async getById(id: string): Promise<EmailTemplate> {
    const res: any = await api.get<EmailTemplate>(`/email-templates/${id}`)
    return res?.data ?? res
  },

  async create(dto: CreateEmailMessageDto): Promise<EmailTemplate> {
    const payload: any = { ...dto }
    if (dto.buttons && dto.buttons.length > 0) {
      if (dto.buttons.length === 1) {
        payload.buttonText = dto.buttons[0].label
        payload.buttonUrl = dto.buttons[0].url
      } else {
        payload.buttonText = JSON.stringify(dto.buttons)
        payload.buttonUrl = dto.buttons[0].url
      }
      delete payload.buttons
    }
    const res: any = await api.post<EmailTemplate>('/email-templates', payload)
    const result = res?.data ?? res
    if (result && result.id) {
      emailCache.addTemplate(result)
    } else {
      emailCache.invalidateTemplates()
    }
    return result
  },

  async update(id: string, dto: UpdateEmailMessageDto): Promise<EmailTemplate> {
    const payload: any = { ...dto }
    if (dto.buttons !== undefined) {
      if (dto.buttons.length === 0) {
        payload.buttonText = null
        payload.buttonUrl = null
      } else if (dto.buttons.length === 1) {
        payload.buttonText = dto.buttons[0].label
        payload.buttonUrl = dto.buttons[0].url
      } else {
        payload.buttonText = JSON.stringify(dto.buttons)
        payload.buttonUrl = dto.buttons[0].url
      }
      delete payload.buttons
    }
    const res: any = await api.patch<EmailTemplate>(`/email-templates/${id}`, payload)
    const result = res?.data ?? res
    if (result && result.id) {
      emailCache.updateTemplate(result)
    } else {
      emailCache.invalidateTemplates()
    }
    return result
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete<{ success: boolean; message: string }>(`/email-templates/${id}`)
    emailCache.removeTemplate(id)
    return res
  },

  async duplicate(id: string): Promise<EmailTemplate> {
    const res: any = await api.post<EmailTemplate>(`/email-templates/${id}/duplicate`, {})
    const result = res?.data ?? res
    if (result && result.id) {
      emailCache.addTemplate(result)
    }
    return result
  },

  async setDefault(id: string): Promise<EmailTemplate> {
    const res: any = await api.patch<EmailTemplate>(`/email-templates/${id}/default`, {})
    const result = res?.data ?? res
    if (result && result.id) {
      emailCache.updateTemplate(result)
    }
    return result
  },

  async preview(
    templateId: string = 'live',
    dto: PreviewEmailMessageDto,
  ): Promise<PreviewEmailResponse> {
    const res: any = await api.post<PreviewEmailResponse>(
      `/email-templates/${templateId}/preview`,
      dto,
    )
    return res?.data ?? res
  },
}

/** Universal tokens resolved in every template (companyName, year). */
export const GLOBAL_TOKENS: CategoryVariableDef[] = [
  {
    token: 'companyName',
    label: 'Company Name',
    description: 'Organization name (resolves in every email)',
    sampleValue: 'Rise Together',
  },
  {
    token: 'year',
    label: 'Current Year',
    description: 'Auto-filled calendar year',
    sampleValue: '2026',
  },
]

export const CATEGORY_VARIABLES_MAP: Record<EmailTemplateCategory, CategoryVariableDef[]> = {
  INTERVIEW_INVITATION: [
    {
      token: 'applicantName',
      label: 'Candidate Name',
      description: 'Full name of the candidate',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'applicantEmail',
      label: 'Candidate Email',
      description: 'Candidate email address',
      sampleValue: 'alex.morgan@example.com',
    },
    {
      token: 'jobTitle',
      label: 'Job Title',
      description: 'Job position applying for',
      sampleValue: 'Senior Full Stack Engineer',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
    {
      token: 'interviewDate',
      label: 'Interview Date',
      description: 'Preset or proposed interview date',
      sampleValue: 'Monday, March 16, 2026',
    },
    {
      token: 'bookingTime',
      label: 'Booking / Slot Time',
      description: 'Suggested slot time range',
      sampleValue: '10:00 AM - 10:30 AM',
    },
    {
      token: 'bookingUrl',
      label: 'Booking URL',
      description: 'Self-scheduling booking link',
      sampleValue: 'https://risetogether.com/interview/booking?token=abc',
    },
    {
      token: 'actionUrl',
      label: 'Action Link Button',
      description: 'Primary action link',
      sampleValue: 'https://risetogether.com/interview/booking?token=abc',
    },
    {
      token: 'tokenExpiresAt',
      label: 'Expiration Time',
      description: 'Invitation expiration date/time',
      sampleValue: 'March 18, 2026, 5:00 PM',
    },
    {
      token: 'expiresAt',
      label: 'Expiry Alias',
      description: 'Alias for expiration time',
      sampleValue: 'March 18, 2026',
    },
    {
      token: 'customMessage',
      label: 'Custom Message',
      description: 'Personal note from recruiter',
      sampleValue: 'We are excited to learn more about your experience.',
    },
  ],
  INTERVIEW_CONFIRMATION: [
    {
      token: 'applicantName',
      label: 'Candidate Name',
      description: 'Full name of the candidate',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'applicantEmail',
      label: 'Candidate Email',
      description: 'Candidate email address',
      sampleValue: 'alex.morgan@example.com',
    },
    {
      token: 'jobTitle',
      label: 'Job Title',
      description: 'Job position applying for',
      sampleValue: 'Senior Full Stack Engineer',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
    {
      token: 'interviewDate',
      label: 'Interview Date',
      description: 'Formatted interview date',
      sampleValue: 'Monday, March 16, 2026',
    },
    {
      token: 'interviewTime',
      label: 'Interview Time',
      description: 'Scheduled time range',
      sampleValue: '10:15 AM - 10:30 AM',
    },
    {
      token: 'scheduledTime',
      label: 'Scheduled Time',
      description: 'Formatted interview date and time',
      sampleValue: 'Monday, March 16, 2026 at 2:00 PM',
    },
    {
      token: 'startTime',
      label: 'Start Time',
      description: 'Slot start time',
      sampleValue: '2:00 PM',
    },
    { token: 'endTime', label: 'End Time', description: 'Slot end time', sampleValue: '2:45 PM' },
    {
      token: 'meetingUrl',
      label: 'Meeting Link',
      description: 'Video conference link (Google Meet / Zoom)',
      sampleValue: 'https://meet.google.com/abc-defg-hij',
    },
    {
      token: 'actionUrl',
      label: 'Join Meeting Button',
      description: 'Join meeting link',
      sampleValue: 'https://meet.google.com/abc-defg-hij',
    },
    {
      token: 'isRescheduled',
      label: 'Is Rescheduled',
      description: 'True when slot was rescheduled',
      sampleValue: 'false',
    },
    {
      token: 'meetingLink',
      label: 'Meeting Link Alias',
      description: 'Alias for the meeting link',
      sampleValue: 'https://meet.google.com/abc-defg-hij',
    },
    {
      token: 'date',
      label: 'Interview Date Alias',
      description: 'Alias for the interview date',
      sampleValue: 'Monday, March 16, 2026',
    },
    {
      token: 'time',
      label: 'Interview Time Alias',
      description: 'Alias for the interview time range',
      sampleValue: '10:15 AM - 10:30 AM',
    },
  ],
  INTERVIEW_OUTCOME: [
    {
      token: 'applicantName',
      label: 'Candidate Name',
      description: 'Full name of the candidate',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'applicantEmail',
      label: 'Candidate Email',
      description: 'Candidate email address',
      sampleValue: 'alex.morgan@example.com',
    },
    {
      token: 'jobTitle',
      label: 'Job Title',
      description: 'Job position applied for',
      sampleValue: 'Senior Full Stack Engineer',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
    {
      token: 'outcomeStatus',
      label: 'Outcome Status',
      description: 'Selected, Offered, or Alternate candidate',
      sampleValue: 'Selected',
    },
    {
      token: 'outcomeMessage',
      label: 'Outcome Message',
      description: 'Outcome explanation or custom rejection notes',
      sampleValue:
        'After careful consideration, we have decided to move forward with other candidates.',
    },
    {
      token: 'customMessage',
      label: 'Personalized Message',
      description: 'Custom message or rejection note',
      sampleValue: 'We appreciate the time you invested with our team.',
    },
    {
      token: 'feedbackNotes',
      label: 'Constructive Feedback',
      description: 'Interviewer feedback note',
      sampleValue: 'Your system design answers were exceptional.',
    },
    {
      token: 'portalUrl',
      label: 'Applicant Portal URL',
      description: 'Candidate portal link',
      sampleValue: 'https://risetogether.com/candidate/portal',
    },
    {
      token: 'careersUrl',
      label: 'Careers Page URL',
      description: 'Public job board link',
      sampleValue: 'https://risetogether.com/careers',
    },
  ],
  ONBOARDING_OFFER: [
    {
      token: 'applicantName',
      label: 'Candidate Name',
      description: 'Full name of candidate',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'applicantEmail',
      label: 'Candidate Email',
      description: 'Candidate email address',
      sampleValue: 'alex.morgan@example.com',
    },
    {
      token: 'candidateName',
      label: 'Candidate Alias',
      description: 'Alias for candidate name',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'jobTitle',
      label: 'Job Title',
      description: 'Position offered',
      sampleValue: 'Lead Backend Architect',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
    {
      token: 'customMessage',
      label: 'Leadership Note',
      description: 'Custom welcoming message',
      sampleValue: 'We are thrilled to welcome you to our growing engineering team!',
    },
    {
      token: 'portalUrl',
      label: 'Portal Upload URL',
      description: 'Candidate document upload link',
      sampleValue: 'https://risetogether.com/onboarding/portal?token=xyz',
    },
    {
      token: 'expiresInDays',
      label: 'Offer Expiry (Days)',
      description: 'Number of days to review and sign',
      sampleValue: '7',
    },
  ],
  ONBOARDING_ORIENTATION: [
    {
      token: 'applicantName',
      label: 'Candidate Name',
      description: 'Full name of new hire',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'applicantEmail',
      label: 'Candidate Email',
      description: 'Candidate email address',
      sampleValue: 'alex.morgan@example.com',
    },
    {
      token: 'candidateName',
      label: 'Candidate Alias',
      description: 'Alias for candidate name',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'jobTitle',
      label: 'Job Title',
      description: 'Position',
      sampleValue: 'Lead Backend Architect',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
    {
      token: 'orientationDate',
      label: 'Orientation Date',
      description: 'Orientation session date & time',
      sampleValue: 'April 1, 2026 at 9:00 AM',
    },
    {
      token: 'meetingUrl',
      label: 'Meeting Link',
      description: 'Google Meet / Zoom link',
      sampleValue: 'https://meet.google.com/xyz-onboard',
    },
    {
      token: 'loginEmail',
      label: 'Work Account Email',
      description: 'Corporate login email',
      sampleValue: 'alex.morgan@risetogether.com',
    },
    {
      token: 'temporaryPassword',
      label: 'Temporary Password',
      description: 'Initial account password',
      sampleValue: 'Rise#2026!Secure',
    },
    {
      token: 'dashboardUrl',
      label: 'Dashboard URL',
      description: 'Portal dashboard link used by email body and button',
      sampleValue: 'https://risetogether.com/login',
    },
    {
      token: 'meetingLink',
      label: 'Meeting Link Alias',
      description: 'Alias for the meeting link',
      sampleValue: 'https://meet.google.com/xyz-onboard',
    },
    {
      token: 'date',
      label: 'Orientation Date Alias',
      description: 'Alias for the orientation date',
      sampleValue: 'April 1, 2026 at 9:00 AM',
    },
    {
      token: 'loginUrl',
      label: 'Portal URL',
      description: 'Alias for dashboard URL',
      sampleValue: 'https://risetogether.com/login',
    },
    {
      token: 'actionUrl',
      label: 'Action Link',
      description: 'Alias for meeting link',
      sampleValue: 'https://meet.google.com/xyz-onboard',
    },
    {
      token: 'notes',
      label: 'Special Notes',
      description: 'Additional instructions or equipment notes',
      sampleValue: 'Please have your primary workstation ready.',
    },
  ],
  ONBOARDING_RESUBMIT: [
    {
      token: 'applicantName',
      label: 'Candidate Name',
      description: 'Candidate full name',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'applicantEmail',
      label: 'Candidate Email',
      description: 'Candidate email address',
      sampleValue: 'alex.morgan@example.com',
    },
    {
      token: 'jobTitle',
      label: 'Job Title',
      description: 'Job position',
      sampleValue: 'Lead Backend Architect',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
    {
      token: 'notes',
      label: 'Verification Feedback',
      description: 'Reviewer notes explaining the correction needed',
      sampleValue: 'Please provide a clearer scan of your National ID.',
    },
    {
      token: 'resubmitReason',
      label: 'Resubmission Reason',
      description: 'Reason documents must be resubmitted',
      sampleValue: 'National ID document was blurry and unreadable.',
    },
    {
      token: 'portalUrl',
      label: 'Re-upload URL',
      description: 'Document upload link',
      sampleValue: 'https://risetogether.com/onboarding/portal?token=resub123',
    },
    {
      token: 'expiresInDays',
      label: 'Expiry Days',
      description: 'Days before re-upload link expires',
      sampleValue: '3',
    },
    {
      token: 'date',
      label: 'Deadline Date',
      description: 'Re-upload deadline date',
      sampleValue: 'March 25, 2026',
    },
    {
      token: 'time',
      label: 'Deadline Time',
      description: 'Re-upload deadline time',
      sampleValue: '11:59 PM',
    },
  ],
  ONBOARDING_REJECTION: [
    {
      token: 'applicantName',
      label: 'Candidate Name',
      description: 'Candidate name',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'applicantEmail',
      label: 'Candidate Email',
      description: 'Candidate email address',
      sampleValue: 'alex.morgan@example.com',
    },
    {
      token: 'jobTitle',
      label: 'Job Title',
      description: 'Position applied for',
      sampleValue: 'Lead Backend Architect',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
    {
      token: 'rejectionReason',
      label: 'Rejection Reason',
      description: 'Detailed reason for candidate onboarding rejection',
      sampleValue: 'Failed background verification checks.',
    },
    {
      token: 'customMessage',
      label: 'Custom Message',
      description: 'Polite explanation or status update',
      sampleValue: 'We appreciate the effort and interest you showed in our organization.',
    },
    {
      token: 'careersUrl',
      label: 'Careers Page URL',
      description: 'Public careers link',
      sampleValue: 'https://risetogether.com/careers',
    },
  ],
  JOB_TASKS: [
    {
      token: 'applicantName',
      label: 'Applicant Name',
      description: 'Candidate full name',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'applicantEmail',
      label: 'Applicant Email',
      description: 'Candidate email address',
      sampleValue: 'alex.morgan@example.com',
    },
    {
      token: 'jobTitle',
      label: 'Job Title',
      description: 'Target job title',
      sampleValue: 'Full Stack Engineer',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
    {
      token: 'taskTitle',
      label: 'Task Title',
      description: 'Assessment task title',
      sampleValue: 'Build a Next.js Mini-App',
    },
    {
      token: 'taskDescription',
      label: 'Task Description',
      description: 'Brief description of task expectations',
      sampleValue: 'Implement a responsive dashboard with CRUD operations.',
    },
    {
      token: 'submissionDeadline',
      label: 'Submission Deadline',
      description: 'Cutoff date and time',
      sampleValue: 'Sunday, March 22, 2026 11:59 PM',
    },
    {
      token: 'expiresAt',
      label: 'Deadline Alias',
      description: 'Alias for submission deadline',
      sampleValue: 'March 22, 2026',
    },
    {
      token: 'submissionUrl',
      label: 'Submission Link',
      description: 'Alias for submit task link',
      sampleValue: 'https://risetogether.com/tasks/submit?id=task99',
    },
    {
      token: 'submitTaskUrl',
      label: 'Submit Task Link',
      description: 'Link to upload task solution',
      sampleValue: 'https://risetogether.com/tasks/submit?id=task99',
    },
    {
      token: 'actionUrl',
      label: 'Action Link',
      description: 'Alias for view task link',
      sampleValue: 'https://risetogether.com/tasks/view?id=task99',
    },
    {
      token: 'viewTaskUrl',
      label: 'View Instructions Link',
      description: 'Link to view full task prompt',
      sampleValue: 'https://risetogether.com/tasks/view?id=task99',
    },
    {
      token: 'date',
      label: 'Deadline Date Alias',
      description: 'Alias for the submission deadline date',
      sampleValue: 'March 22, 2026',
    },
    {
      token: 'time',
      label: 'Deadline Time Alias',
      description: 'Alias for the submission deadline time',
      sampleValue: '11:59 PM',
    },
    {
      token: 'submittedAt',
      label: 'Submitted At',
      description: 'Solution submission timestamp (submission emails)',
      sampleValue: 'Sunday, March 22, 2026 at 10:45 PM',
    },
    {
      token: 'githubRepoUrl',
      label: 'Repository URL',
      description: 'Submitted GitHub repository link',
      sampleValue: 'https://github.com/alex/task-solution',
    },
    {
      token: 'liveUrl',
      label: 'Live Demo URL',
      description: 'Submitted live deployment link',
      sampleValue: 'https://alex-task-demo.vercel.app',
    },
    {
      token: 'submissionNote',
      label: 'Submission Note',
      description: 'Candidate note attached to the submission',
      sampleValue: 'Implemented all requirements plus bonus filters.',
    },
  ],
  JOB_TASK_SUBMITTED: [
    {
      token: 'applicantName',
      label: 'Applicant Name',
      description: 'Candidate full name',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'applicantEmail',
      label: 'Applicant Email',
      description: 'Candidate email address',
      sampleValue: 'alex.morgan@example.com',
    },
    {
      token: 'jobTitle',
      label: 'Job Title',
      description: 'Target job title',
      sampleValue: 'Full Stack Engineer',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
    {
      token: 'taskTitle',
      label: 'Task Title',
      description: 'Submitted assessment task title',
      sampleValue: 'Build a Next.js Mini-App',
    },
    {
      token: 'taskDescription',
      label: 'Task Description',
      description: 'Brief description of task expectations',
      sampleValue: 'Implement a responsive dashboard with CRUD operations.',
    },
    {
      token: 'submittedAt',
      label: 'Submitted At',
      description: 'Solution submission timestamp',
      sampleValue: 'Sunday, March 22, 2026 at 10:45 PM',
    },
    {
      token: 'date',
      label: 'Submission Date',
      description: 'Date the solution was submitted',
      sampleValue: 'March 22, 2026',
    },
    {
      token: 'time',
      label: 'Submission Time',
      description: 'Time the solution was submitted',
      sampleValue: '10:45 PM',
    },
    {
      token: 'githubRepoUrl',
      label: 'Repository URL',
      description: 'Submitted GitHub repository link',
      sampleValue: 'https://github.com/alex/task-solution',
    },
    {
      token: 'liveUrl',
      label: 'Live Demo URL',
      description: 'Submitted live deployment link',
      sampleValue: 'https://alex-task-demo.vercel.app',
    },
    {
      token: 'submissionNote',
      label: 'Submission Note',
      description: 'Candidate note attached to the submission',
      sampleValue: 'Implemented all requirements plus bonus filters.',
    },
    {
      token: 'portalUrl',
      label: 'Portal Link',
      description: 'Candidate portal link',
      sampleValue: 'https://risetogether.com/candidate/portal',
    },
  ],
  GENERAL: [
    {
      token: 'recipientName',
      label: 'Recipient Name',
      description: 'Name of the recipient',
      sampleValue: 'Valued Member',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
    {
      token: 'headline',
      label: 'Headline',
      description: 'Main notification title',
      sampleValue: 'Important Announcement',
    },
    {
      token: 'message',
      label: 'Message',
      description: 'Notification body message',
      sampleValue: 'We have an important announcement to share.',
    },
    {
      token: 'actionUrl',
      label: 'Action URL',
      description: 'Clickable button URL',
      sampleValue: 'https://risetogether.com',
    },
    {
      token: 'actionText',
      label: 'Action Button Text',
      description: 'Text on button',
      sampleValue: 'Learn More',
    },
  ],
  APPLICATIONS: [
    {
      token: 'applicantName',
      label: 'Applicant Name',
      description: 'Candidate name',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'applicantEmail',
      label: 'Applicant Email',
      description: 'Candidate email address',
      sampleValue: 'alex.morgan@example.com',
    },
    {
      token: 'jobTitle',
      label: 'Job Title',
      description: 'Job position',
      sampleValue: 'Full Stack Engineer',
    },
    {
      token: 'jobCode',
      label: 'Job Code',
      description: 'Unique job requisition code',
      sampleValue: 'RT-2024-001',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
    {
      token: 'applicationCode',
      label: 'Application Code',
      description: 'Unique application tracking code',
      sampleValue: '10000001',
    },
    {
      token: 'applicationId',
      label: 'Application ID',
      description: 'Internal application identifier',
      sampleValue: 'app_01HXYZ',
    },
    {
      token: 'applicationDate',
      label: 'Application Date',
      description: 'Date applied',
      sampleValue: 'March 10, 2026',
    },
    {
      token: 'appliedAt',
      label: 'Applied At (Timestamp)',
      description: 'Exact submission timestamp',
      sampleValue: 'Monday, September 7, 2026 at 10:13 PM',
    },
    {
      token: 'date',
      label: 'Application Date Alias',
      description: 'Alias for the application date',
      sampleValue: 'March 10, 2026',
    },
    {
      token: 'time',
      label: 'Application Time Alias',
      description: 'Alias for the application time',
      sampleValue: '10:13 PM',
    },
    {
      token: 'portalUrl',
      label: 'Portal Link',
      description: 'Candidate portal link',
      sampleValue: 'https://risetogether.com/candidate/portal',
    },
    {
      token: 'applicationStatusUrl',
      label: 'Application Status URL',
      description: 'Direct link to track application status',
      sampleValue: 'https://risetogether.com/candidate/portal',
    },
    {
      token: 'headerIcon',
      label: 'Banner Icon',
      description: 'Icon shown beside the banner title',
      sampleValue: '✓',
    },
  ],
  AUTH_OTP: [
    {
      token: 'recipientName',
      label: 'Recipient Name',
      description: 'Name of the recipient',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'name',
      label: 'User Name Alias',
      description: 'Alias for recipient name',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'otp',
      label: 'One-Time Code',
      description: 'Login verification code',
      sampleValue: '482916',
    },
    {
      token: 'otpCode',
      label: 'OTP Code Alias',
      description: 'Alias for one-time code',
      sampleValue: '482916',
    },
    {
      token: 'expiresInMinutes',
      label: 'Expiry (Minutes)',
      description: 'Minutes before the code expires',
      sampleValue: '5',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
  ],
  AUTH_VERIFY: [
    {
      token: 'recipientName',
      label: 'Recipient Name',
      description: 'Name of the recipient',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'name',
      label: 'User Name Alias',
      description: 'Alias for recipient name',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'email',
      label: 'User Email',
      description: 'Email being verified',
      sampleValue: 'alex.morgan@example.com',
    },
    {
      token: 'verificationUrl',
      label: 'Verification Link',
      description: 'Email verification URL',
      sampleValue: 'https://risetogether.com/verify-email?token=abc',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
  ],
  AUTH_PASSWORD_RESET: [
    {
      token: 'recipientName',
      label: 'Recipient Name',
      description: 'Name of the recipient',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'name',
      label: 'User Name Alias',
      description: 'Alias for recipient name',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'email',
      label: 'User Email',
      description: 'Recipient email address',
      sampleValue: 'alex.morgan@example.com',
    },
    {
      token: 'resetUrl',
      label: 'Reset Link',
      description: 'Password reset URL',
      sampleValue: 'https://risetogether.com/reset-password?token=abc',
    },
    {
      token: 'expiresInMinutes',
      label: 'Expiry (Minutes)',
      description: 'Minutes before reset link expires',
      sampleValue: '15',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
  ],
  USER_INVITATION: [
    {
      token: 'recipientName',
      label: 'Recipient Name',
      description: 'Name of the invitee',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'name',
      label: 'Invitee Name Alias',
      description: 'Alias for recipient name',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'invitedName',
      label: 'Invited Name',
      description: 'Full name of invited team member',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'inviterName',
      label: 'Inviter Name',
      description: 'Name of the admin sending invitation',
      sampleValue: 'System Administrator',
    },
    {
      token: 'invitedEmail',
      label: 'Invited Email',
      description: 'Email address of invitee',
      sampleValue: 'alex.morgan@example.com',
    },
    {
      token: 'invitationUrl',
      label: 'Invitation Link',
      description: 'Invitation acceptance URL',
      sampleValue: 'https://risetogether.com/invite?token=abc',
    },
    {
      token: 'roleName',
      label: 'Role',
      description: 'Assigned role name',
      sampleValue: 'Recruiter',
    },
    {
      token: 'expiresInHours',
      label: 'Expiry (Hours)',
      description: 'Hours before the invitation expires',
      sampleValue: '24',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
  ],
  USER_EMAIL_CHANGE: [
    {
      token: 'recipientName',
      label: 'Recipient Name',
      description: 'Name of the recipient',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'name',
      label: 'User Name Alias',
      description: 'Alias for recipient name',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'currentEmail',
      label: 'Current Email',
      description: 'Existing account email address',
      sampleValue: 'alex.old@example.com',
    },
    {
      token: 'newEmail',
      label: 'New Email',
      description: 'Requested new email address',
      sampleValue: 'alex.new@example.com',
    },
    {
      token: 'confirmUrl',
      label: 'Confirmation Link',
      description: 'New email confirmation URL',
      sampleValue: 'https://risetogether.com/confirm-email?token=abc',
    },
    {
      token: 'confirmationUrl',
      label: 'Confirmation URL Alias',
      description: 'Alias for confirmUrl',
      sampleValue: 'https://risetogether.com/confirm-email?token=abc',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
  ],
  CONTACT_ADMIN: [
    {
      token: 'senderName',
      label: 'Sender Name',
      description: 'Name from the contact form',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'senderEmail',
      label: 'Sender Email',
      description: 'Email from the contact form',
      sampleValue: 'alex.morgan@example.com',
    },
    {
      token: 'senderPhone',
      label: 'Sender Phone',
      description: 'Phone from the contact form',
      sampleValue: '+880 1XXX-XXXXXX',
    },
    {
      token: 'contactSubject',
      label: 'Subject',
      description: 'Contact form subject line',
      sampleValue: 'Partnership Inquiry',
    },
    {
      token: 'subject',
      label: 'Subject Alias',
      description: 'Alias for contactSubject',
      sampleValue: 'Partnership Inquiry',
    },
    {
      token: 'messageBody',
      label: 'Message',
      description: 'Contact form message content',
      sampleValue: 'Hello, I would like to learn more...',
    },
    {
      token: 'message',
      label: 'Message Alias',
      description: 'Alias for messageBody',
      sampleValue: 'Hello, I would like to learn more...',
    },
    {
      token: 'submittedAt',
      label: 'Submitted At',
      description: 'Form submission timestamp',
      sampleValue: 'September 15, 2026',
    },
    {
      token: 'adminPortalUrl',
      label: 'Admin Portal URL',
      description: 'Link to view message in admin dashboard',
      sampleValue: 'https://admin.risetogether.com/contact-messages',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
  ],
  CONTACT_AUTO_REPLY: [
    {
      token: 'recipientName',
      label: 'Recipient Name',
      description: 'Name of the sender',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'senderName',
      label: 'Sender Name',
      description: 'Alias for contact recipient name',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'name',
      label: 'Name Alias',
      description: 'Alias for recipient name',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'contactSubject',
      label: 'Subject',
      description: 'Original contact subject',
      sampleValue: 'Partnership Inquiry',
    },
    {
      token: 'subject',
      label: 'Subject Alias',
      description: 'Alias for contactSubject',
      sampleValue: 'Partnership Inquiry',
    },
    {
      token: 'message',
      label: 'Message',
      description: 'Message content or acknowledgement note',
      sampleValue: 'Thank you for reaching out to us.',
    },
    {
      token: 'messageBody',
      label: 'Message Body Alias',
      description: 'Alias for message content',
      sampleValue: 'Thank you for reaching out to us.',
    },
    {
      token: 'supportEmail',
      label: 'Support Email',
      description: 'Support contact address',
      sampleValue: 'hello@risetogetherbd.com',
    },
    {
      token: 'frontendUrl',
      label: 'Website URL',
      description: 'Public website link',
      sampleValue: 'https://risetogetherbd.com',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
  ],
  USER_MESSAGE: [
    {
      token: 'senderName',
      label: 'Sender Name',
      description: 'Name of the sender',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'senderEmail',
      label: 'Sender Email',
      description: 'Email of the sender',
      sampleValue: 'alex.morgan@example.com',
    },
    {
      token: 'messageSnippet',
      label: 'Message Snippet',
      description: 'Short preview of the message',
      sampleValue: 'Hello, I have a question regarding...',
    },
    {
      token: 'messageBody',
      label: 'Message',
      description: 'Message content',
      sampleValue: 'Hello, I have a question...',
    },
    {
      token: 'message',
      label: 'Message Content Alias',
      description: 'Alias for messageBody',
      sampleValue: 'Hello, I have a question...',
    },
    {
      token: 'messageUrl',
      label: 'Message URL',
      description: 'Link to view message thread in dashboard',
      sampleValue: 'https://admin.risetogether.com/messages/123',
    },
    {
      token: 'hasAttachment',
      label: 'Has Attachment',
      description: 'Whether a file was attached',
      sampleValue: 'No',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
  ],
  APPLICATION_VERIFY: [
    {
      token: 'applicantName',
      label: 'Applicant Name',
      description: 'Candidate name (known applicant) or name derived from email',
      sampleValue: 'Alex Morgan',
    },
    {
      token: 'applicantEmail',
      label: 'Applicant Email',
      description: 'Email being verified',
      sampleValue: 'alex.morgan@example.com',
    },
    {
      token: 'jobTitle',
      label: 'Job Title',
      description: 'Job position',
      sampleValue: 'Full Stack Engineer',
    },
    {
      token: 'otp',
      label: 'One-Time Code',
      description: '6-digit verification code',
      sampleValue: '482916',
    },
    {
      token: 'otpCode',
      label: 'OTP Code Alias',
      description: 'Alias for one-time code',
      sampleValue: '482916',
    },
    {
      token: 'verificationUrl',
      label: 'Verification Link',
      description: 'Email verification URL',
      sampleValue: 'https://risetogether.com/careers/verify-email?token=abc',
    },
    {
      token: 'expiresInMinutes',
      label: 'Expiry (Minutes)',
      description: 'Minutes before the link expires',
      sampleValue: '15',
    },
    {
      token: 'companyName',
      label: 'Company Name',
      description: 'Organization name',
      sampleValue: 'Rise Together',
    },
  ],
}

export interface AccentPresetDef {
  name: string
  hex: string
}

export const ACCENT_PRESETS: AccentPresetDef[] = [
  { name: 'Emerald', hex: '#059669' },
  { name: 'Teal Cyan', hex: '#0D9488' },
  { name: 'Deep Teal', hex: '#0F766E' },
  { name: 'Royal Indigo', hex: '#6366F1' },
  { name: 'Sky Blue', hex: '#0284C7' },
  { name: 'Electric Blue', hex: '#2563EB' },
  { name: 'Cobalt Navy', hex: '#1D4ED8' },
  { name: 'Violet Purple', hex: '#7C3AED' },
  { name: 'Forest Green', hex: '#16A34A' },
  { name: 'Amber Gold', hex: '#D97706' },
  { name: 'Warm Orange', hex: '#EA580C' },
  { name: 'Crimson Rose', hex: '#E11D48' },
  { name: 'Purple Orchid', hex: '#9333EA' },
  { name: 'Slate Charcoal', hex: '#334155' },
  { name: 'Ocean Teal', hex: '#0891B2' },
]

export const CATEGORY_DISPLAY_CONFIG: Record<
  EmailTemplateCategory,
  { label: string; description: string; badgeColor: string }
> = {
  INTERVIEW_INVITATION: {
    label: 'Interview Invitation',
    description: 'Sent to invite candidate to book an interview slot',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  INTERVIEW_CONFIRMATION: {
    label: 'Interview Confirmation',
    description: 'Sent once candidate books an interview slot with meeting link',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  INTERVIEW_OUTCOME: {
    label: 'Interview Outcome',
    description: 'Sent after interview completion with decision & feedback',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  ONBOARDING_OFFER: {
    label: 'Offer Letter',
    description: 'Formal job offer with compensation and portal link',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  ONBOARDING_ORIENTATION: {
    label: 'Orientation & Access',
    description: 'Orientation schedule and credentials for new hires',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  },
  ONBOARDING_RESUBMIT: {
    label: 'Document Resubmission',
    description: 'Requests missing or rejected onboarding documents',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  },
  ONBOARDING_REJECTION: {
    label: 'Onboarding Rejection',
    description: 'Formal polite notice when offer or vetting is declined',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  },
  JOB_TASKS: {
    label: 'Job Tasks',
    description: 'Sends take-home technical or practical assessment to applicant',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  },
  JOB_TASK_SUBMITTED: {
    label: 'Task Submitted',
    description: 'Confirms receipt of a submitted assessment solution',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  GENERAL: {
    label: 'General Notification',
    description: 'System announcements and custom communications',
    badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  },
  AUTH_OTP: {
    label: 'Login OTP',
    description: 'One-time login verification code',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
  AUTH_VERIFY: {
    label: 'Email Verification',
    description: 'Account email verification link',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
  AUTH_PASSWORD_RESET: {
    label: 'Password Reset',
    description: 'Password reset link',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
  USER_INVITATION: {
    label: 'User Invitation',
    description: 'Team member invitation with role',
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  },
  USER_EMAIL_CHANGE: {
    label: 'Email Change',
    description: 'Confirm new account email address',
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  },
  CONTACT_ADMIN: {
    label: 'Contact Notification',
    description: 'Contact form submission sent to admins',
    badgeColor: 'bg-lime-500/10 text-lime-400 border-lime-500/30',
  },
  CONTACT_AUTO_REPLY: {
    label: 'Contact Auto Reply',
    description: 'Acknowledgement sent to contact form sender',
    badgeColor: 'bg-lime-500/10 text-lime-400 border-lime-500/30',
  },
  USER_MESSAGE: {
    label: 'User Message',
    description: 'Direct user message sent to admins',
    badgeColor: 'bg-lime-500/10 text-lime-400 border-lime-500/30',
  },
  APPLICATION_VERIFY: {
    label: 'Application Verification',
    description: 'Verify applicant email before applying',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  },
  APPLICATIONS: {
    label: 'Applications',
    description: 'Application intake and screening updates',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  },
}
