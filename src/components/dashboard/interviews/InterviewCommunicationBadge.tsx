'use client'

import React from 'react'
import { EmailStatusBadge } from '@/components/dashboard/common/EmailStatusBadge'
import type { EmailLog } from '@/types/job'
import { Interview } from './types'

export function InterviewCommunicationBadge({ item }: { item: Interview }) {
  const application = item.application as
    { emailLogs?: EmailLog[]; communicationLogs?: EmailLog[] } | undefined
  const logs: EmailLog[] =
    application?.emailLogs ||
    (item as { emailLogs?: EmailLog[] })?.emailLogs ||
    application?.communicationLogs ||
    (item.communicationLogs as EmailLog[]) ||
    []

  const applicantEmail = item.application?.applicant?.email

  return <EmailStatusBadge logs={logs} targetEmail={applicantEmail} />
}
