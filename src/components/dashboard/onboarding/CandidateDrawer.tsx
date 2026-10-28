'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Video, UserX, RotateCcw } from 'lucide-react'
import type { OnboardingCandidate } from '@/lib/onboarding'
import { CandidateDrawer as CommonCandidateDrawer } from '@/components/dashboard/common/CandidateDrawer'
import { APPLICATION_STATUS_OPTIONS } from '@/components/dashboard/interviews/constants'

interface CandidateDrawerProps {
  candidate: OnboardingCandidate | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenViewer: (candidate: OnboardingCandidate) => void
  onSendOffer: (candidate: OnboardingCandidate) => void
  onSendOrientation: (candidate: OnboardingCandidate) => void
  onSendRejection?: (candidate: OnboardingCandidate) => void
  onRequestResubmission?: (candidate: OnboardingCandidate) => void
  onUpdateStatus: (applicationId: string, status: string) => Promise<void>
}

const ONBOARDING_TRANSITIONS: Record<string, string[]> = {
  OFFER_PENDING: ['OFFER_SENT', 'REJECTED', 'CLOSED'],
  OFFER_SENT: ['DOCS_SUBMITTED', 'REJECTED', 'CLOSED'],
  DOCS_SUBMITTED: ['HIRED', 'REJECTED', 'CLOSED'],
  HIRED: ['REJECTED', 'CLOSED'],
  REJECTED: ['OFFER_PENDING', 'CLOSED'],
}

function getOnboardingTransitions(currentStatus: string) {
  const allowed = ONBOARDING_TRANSITIONS[currentStatus] || ['OFFER_PENDING', 'REJECTED', 'CLOSED']
  return APPLICATION_STATUS_OPTIONS.filter((opt) => allowed.includes(opt.value))
}

export function CandidateDrawer({
  candidate,
  open,
  onOpenChange,
  onOpenViewer,
  onSendOffer,
  onSendOrientation,
  onSendRejection,
  onRequestResubmission,
  onUpdateStatus,
}: CandidateDrawerProps) {
  const [updating, setUpdating] = useState(false)

  if (!candidate) return null

  const handleRejectCandidate = async () => {
    if (
      !confirm(
        `Are you sure you want to mark ${candidate.applicant?.name || 'this candidate'} as REJECTED?`,
      )
    ) {
      return
    }
    try {
      setUpdating(true)
      await onUpdateStatus(candidate.id, 'REJECTED')
      onOpenChange(false)
    } finally {
      setUpdating(false)
    }
  }

  const headerActions = (
    <div className="flex items-center gap-2 flex-wrap">
      {candidate.status === 'OFFER_PENDING' && (
        <>
          <Button
            size="sm"
            onClick={() => onSendOffer(candidate)}
            className="h-8 gap-1.5 text-xs font-medium rounded-none border-accent text-accent bg-accent-soft hover:bg-accent-soft cursor-pointer"
          >
            <Mail className="size-3.5" />
            <span>Send Offer Letter</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={updating}
            onClick={handleRejectCandidate}
            className="h-8 gap-1.5 text-xs font-medium rounded-none border-hairline-light bg-subtle/90 hover:bg-muted text-rose-400 hover:text-rose-300 cursor-pointer"
          >
            <UserX className="size-3.5" />
            <span>Reject</span>
          </Button>
        </>
      )}

      {candidate.status === 'OFFER_SENT' && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSendOffer(candidate)}
            className="h-8 gap-1.5 text-xs font-medium rounded-none border-hairline-light bg-subtle/90 hover:bg-muted text-muted cursor-pointer"
          >
            <Mail className="size-3.5" />
            <span>Resend Offer Letter</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={updating}
            onClick={handleRejectCandidate}
            className="h-8 gap-1.5 text-xs font-medium rounded-none border-hairline-light bg-subtle/90 hover:bg-muted text-rose-400 hover:text-rose-300 cursor-pointer"
          >
            <UserX className="size-3.5" />
            <span>Reject</span>
          </Button>
        </>
      )}

      {candidate.status === 'DOCS_SUBMITTED' && (
        <>
          <Button
            size="sm"
            onClick={() => onSendOrientation(candidate)}
            className="h-8 gap-1.5 text-xs font-medium rounded-none border-indigo-500/30 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 cursor-pointer"
          >
            <Video className="size-3.5" />
            <span>Send Orientation & Hire</span>
          </Button>
          {onRequestResubmission && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRequestResubmission(candidate)}
              className="h-8 gap-1.5 text-xs font-medium rounded-none border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Request Resubmission</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={updating}
            onClick={handleRejectCandidate}
            className="h-8 gap-1.5 text-xs font-medium rounded-none border-hairline-light bg-subtle/90 hover:bg-muted text-rose-400 hover:text-rose-300 cursor-pointer"
          >
            <UserX className="size-3.5" />
            <span>Reject</span>
          </Button>
        </>
      )}

      {candidate.status === 'HIRED' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSendOrientation(candidate)}
          className="h-8 gap-1.5 text-xs font-medium rounded-none border-indigo-500/30 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 cursor-pointer"
        >
          <Video className="size-3.5" />
          <span>Resend Orientation</span>
        </Button>
      )}

      {candidate.status === 'REJECTED' && onSendRejection && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSendRejection(candidate)}
          className="h-8 gap-1.5 text-xs font-medium rounded-none border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 cursor-pointer"
        >
          <Mail className="size-3.5" />
          <span>Resend Rejection Notice</span>
        </Button>
      )}
    </div>
  )

  const availableTransitions = getOnboardingTransitions(candidate.status)

  return (
    <CommonCandidateDrawer
      open={open}
      onOpenChange={onOpenChange}
      candidate={candidate}
      hideJobCode={true}
      headerActions={headerActions}
      availableTransitions={availableTransitions}
      onStatusChange={async (newStatus) => {
        await onUpdateStatus(candidate.id, newStatus)
      }}
      onOpenViewer={() => onOpenViewer(candidate)}
    />
  )
}
