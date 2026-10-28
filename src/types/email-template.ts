export interface CTAButtonDef {
  label: string
  url: string
  variant?: 'primary' | 'secondary'
}

export type EmailTemplateCategory =
  | 'APPLICATIONS'
  | 'JOB_TASKS'
  | 'JOB_TASK_SUBMITTED'
  | 'INTERVIEW_INVITATION'
  | 'INTERVIEW_CONFIRMATION'
  | 'INTERVIEW_OUTCOME'
  | 'ONBOARDING_OFFER'
  | 'ONBOARDING_ORIENTATION'
  | 'ONBOARDING_RESUBMIT'
  | 'ONBOARDING_REJECTION'
  | 'GENERAL'
  | 'AUTH_OTP'
  | 'AUTH_VERIFY'
  | 'AUTH_PASSWORD_RESET'
  | 'USER_INVITATION'
  | 'USER_EMAIL_CHANGE'
  | 'CONTACT_ADMIN'
  | 'CONTACT_AUTO_REPLY'
  | 'USER_MESSAGE'
  | 'APPLICATION_VERIFY'

export type EmailTemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

// Master HTML presentation shell
export interface EmailLayout {
  id: string
  name: string
  slug: string
  htmlContent: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEmailLayoutDto {
  name: string
  htmlContent: string
  isDefault?: boolean
}

export interface UpdateEmailLayoutDto {
  name?: string
  htmlContent?: string
  isDefault?: boolean
}

// Operational notification copy
export interface EmailMessage {
  id: string
  name: string
  slug: string
  category: EmailTemplateCategory
  subject: string
  headerTitle?: string | null
  headerSubtitle?: string | null
  accentColor?: string | null
  bodyText: string
  buttonText?: string | null
  buttonUrl?: string | null
  status: EmailTemplateStatus
  isDefault: boolean
  layoutId?: string | null
  layout?: {
    id: string
    name: string
    slug: string
    isDefault: boolean
  } | null
  createdAt: string
  updatedAt: string
}

// Backward-compatible alias for modal dropdowns and consumers
export type EmailTemplate = EmailMessage

export interface CreateEmailMessageDto {
  buttons?: CTAButtonDef[]
  name: string
  slug?: string
  category: EmailTemplateCategory
  subject: string
  headerTitle?: string
  headerSubtitle?: string
  accentColor?: string
  bodyText: string
  buttonText?: string
  buttonUrl?: string
  layoutId?: string
  status?: EmailTemplateStatus
  isDefault?: boolean
}

export type CreateEmailTemplateDto = CreateEmailMessageDto

export type UpdateEmailMessageDto = Partial<CreateEmailMessageDto>
export type UpdateEmailTemplateDto = UpdateEmailMessageDto

export interface QueryEmailTemplateDto {
  category?: EmailTemplateCategory
  status?: EmailTemplateStatus
  search?: string
  page?: number
  limit?: number
}

export interface PreviewEmailMessageDto {
  subject?: string
  headerTitle?: string
  headerSubtitle?: string
  accentColor?: string
  bodyText?: string
  bodyHtml?: string
  buttonText?: string
  buttonUrl?: string
  layoutId?: string
  mockVariables?: Record<string, string | number | boolean>
}

export type PreviewEmailTemplateDto = PreviewEmailMessageDto

export interface PreviewEmailResponse {
  subject: string
  html: string
  text: string
  missingVariables: string[]
}

export type PreviewEmailTemplateResponse = PreviewEmailResponse

export interface CategoryVariableDef {
  token: string
  label: string
  description: string
  sampleValue: string
}
