'use client'

import React from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInterviewContext } from '@/contexts/InterviewContext'
import { SITE_URL } from '@/lib/api-config'
import { getAvailableStatusTransitions } from './constants'
import { InterviewIcons } from './interview-icons'
import { CandidateDrawer as CommonCandidateDrawer } from '@/components/dashboard/common/CandidateDrawer'

export function CandidateDrawer() {
  const {
    drawerCandidate: item,
    closeDrawer,
    openModal,
    updateApplicationStatus,
    sendInvitations,
    sendOutcomes,
    isDispatching,
  } = useInterviewContext()

  if (!item) return null

  const applicant = item.application?.applicant
  const job = item.application?.job
  const targetAppId = item.application?.id || item.applicationId
  const rawAppStatus = item.application?.status || 'APPLIED'
  const appStatus = (item.status === 'SCHEDULED' || Boolean(item.slot)) && (rawAppStatus === 'INTERVIEW_SELECTED' || rawAppStatus === 'SELECTED') ? 'INTERVIEW_SCHEDULED' : rawAppStatus
  const bookingLink = item.token ? `${SITE_URL}/interview/book?token=${item.token}` : ''
  const application = item.application as any
  const logs =
    application?.emailLogs ||
    application?.communicationLogs ||
    (item.communicationLogs as any[]) ||
    []
  const availableTransitions = getAvailableStatusTransitions(appStatus)

  const handleStatusChange = async (newStatus: string) => {
    if (!targetAppId || !updateApplicationStatus) return
    await updateApplicationStatus(targetAppId, newStatus)
  }

  const handleDirectInvite = async () => {
    if (!job?.id || !targetAppId) return
    await sendInvitations(job.id, [targetAppId])
  }

  const handleDirectOutcome = async () => {
    if (!job?.id || !targetAppId) return
    await sendOutcomes({
      jobId: job.id,
      applicationIds: [targetAppId],
      forceResend: true,
    })
  }

  // Header quick actions
  const headerActions = (
    <div className="flex items-center gap-2 flex-wrap">
      {appStatus !== 'REJECTED' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openModal('FEEDBACK', item)}
          className="h-8 gap-1.5 text-xs font-medium rounded-none border-hairline-light bg-subtle/90 hover:bg-muted hover:border-hairline-light text-muted cursor-pointer"
        >
          <InterviewIcons.Star
            className={`size-3.5 ${item.feedback ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
          />
          <span>{item.feedback ? 'Edit Evaluation' : 'Score Candidate'}</span>
        </Button>
      )}

      {appStatus === 'OFFER_PENDING' && (
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-8 gap-1.5 text-xs font-medium rounded-none border-accent text-accent bg-accent-soft hover:bg-accent-soft cursor-pointer"
        >
          <Link href="/dashboard/onboarding">
            <InterviewIcons.Send className="size-3.5" />
            <span>Open in Onboarding</span>
          </Link>
        </Button>
      )}

      {appStatus === 'REJECTED' && (
        <Button
          size="sm"
          variant="outline"
          disabled={isDispatching}
          onClick={handleDirectOutcome}
          className="h-8 gap-1.5 text-xs font-medium rounded-none border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 cursor-pointer"
        >
          <Mail className="size-3.5" />
          <span>Resend Rejection Notice</span>
        </Button>
      )}

      {(appStatus === 'INTERVIEW_SELECTED' ||
        appStatus === 'SELECTED' ||
        item.status === 'PENDING_BOOKING') &&
        !item.slot && (
          <Button
            variant="outline"
            size="sm"
            disabled={isDispatching}
            onClick={handleDirectInvite}
            className="h-8 gap-1.5 text-xs font-medium rounded-none border-accent text-accent bg-accent-soft hover:bg-accent-soft cursor-pointer"
          >
            <InterviewIcons.MailPlus className="size-3.5" />
            <span>{item.token ? 'Resend Invitation Email' : 'Send Booking Token'}</span>
          </Button>
        )}
    </div>
  )

  const candidateData = {
    id: item.id,
    applicationId: targetAppId,
    status: appStatus,
    applicant,
    job,
    token: item.token,
    slot: item.slot,
    feedback: item.feedback,
    emailLogs: logs,
    applicationStatusHistories: application?.applicationStatusHistories || [],
    documents: application?.documents || [],
  }

  return (
    <CommonCandidateDrawer
      open={Boolean(item)}
      onOpenChange={(open) => !open && closeDrawer()}
      candidate={candidateData}
      headerActions={headerActions}
      availableTransitions={availableTransitions}
      onStatusChange={handleStatusChange}
      bookingLink={bookingLink}
      onScoreInterview={() => openModal('FEEDBACK', item)}
    />
  )
}
