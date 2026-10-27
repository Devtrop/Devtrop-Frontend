'use client'

import React, { useState } from 'react'
import { toast } from '@/lib/toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { interviewsApi } from '@/lib/interviews'
import { InterviewIcons } from './interview-icons'
import { Interview } from './types'

interface FeedbackModalProps {
  isOpen: boolean
  interview: Interview | null
  onClose: () => void
  onSuccess: () => void
}

interface FeedbackFormContentProps {
  interview: Interview
  onClose: () => void
  onSuccess: () => void
}

function FeedbackFormContent({ interview, onClose, onSuccess }: FeedbackFormContentProps) {
  const initialTech = interview.feedback?.technicalSkill
    ? Math.min(Math.max(Number(interview.feedback.technicalSkill), 1), 5)
    : 4
  const initialComm = interview.feedback?.communication
    ? Math.min(Math.max(Number(interview.feedback.communication), 1), 5)
    : 4

  const [technicalSkill, setTechnicalSkill] = useState(initialTech)
  const [communication, setCommunication] = useState(initialComm)
  const [comments, setComments] = useState(interview.feedback?.comments || '')
  const [decision, setDecision] = useState<'NONE' | 'OFFER_PENDING' | 'REJECTED'>('NONE')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSubmitting(true)
    try {
      const res = await interviewsApi.submitFeedback(interview.id, {
        technicalSkill: Number(technicalSkill),
        communication: Number(communication),
        comments: comments.trim() || undefined,
      })

      if (res.success) {
        const appId = interview.application?.id || interview.applicationId
        const candidateName = interview.application?.applicant?.name || 'Candidate'

        if (decision === 'OFFER_PENDING' && appId) {
          await interviewsApi.updateApplicationStatus(appId, 'OFFER_PENDING')
          toast.success(`Evaluation saved & moved ${candidateName} to Offer Pending!`)
        } else if (decision === 'REJECTED' && appId) {
          await interviewsApi.updateApplicationStatus(appId, 'REJECTED')
          toast.success(`Evaluation saved & ${candidateName} marked as Rejected.`)
        } else {
          toast.success(`Evaluation saved for ${candidateName}`)
        }

        onSuccess()
        onClose()
      } else {
        toast.error(res.message || 'Failed to save evaluation feedback')
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : 'An error occurred while saving evaluation'
      console.error(err)
      toast.error(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const applicantName = interview.application?.applicant?.name || 'Applicant'
  const jobTitle = interview.application?.job?.title || 'Position'
  const isBooked =
    Boolean(interview.slot) || interview.status === 'SCHEDULED' || interview.status === 'COMPLETED'

  return (
    <>
      <DialogHeader className="pr-8">
        <div className="flex items-center justify-between gap-2">
          <DialogTitle className="text-base font-bold text-foreground">
            Candidate Evaluation
          </DialogTitle>
          <Badge variant="outline" className="text-[10px] shrink-0">
            {jobTitle}
          </Badge>
        </div>
        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
          Evaluation scoring and notes for <strong>{applicantName}</strong>.
        </DialogDescription>
      </DialogHeader>

      {!isBooked ? (
        <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 text-center rounded-none bg-amber-500/10 border border-amber-500/20 text-xs">
          <div className="size-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <InterviewIcons.CalendarClock className="size-5" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">Booking Pending</h4>
            <p className="text-muted-foreground text-xs mt-1">
              <strong>{applicantName}</strong> has not booked an interview time slot yet. Candidate
              evaluation and scoring can only be conducted after an interview session is booked.
            </p>
          </div>
          <DialogFooter className="w-full pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full text-xs h-9 cursor-pointer"
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* Score Ratings Grid (1 to 5 Scale) */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-none border border-border/80 bg-muted/20 text-xs">
            {/* Technical Score (1-5) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="technicalSkill" className="text-xs font-semibold">
                  Technical Skill
                </Label>
                <span className="font-bold text-primary text-xs">{technicalSkill}/5</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setTechnicalSkill(score)}
                    className={`flex-1 py-1.5 rounded-none font-semibold text-xs border transition-all cursor-pointer ${
                      technicalSkill >= score
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-border/60 bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            {/* Communication Score (1-5) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="communication" className="text-xs font-semibold">
                  Communication
                </Label>
                <span className="font-bold text-sky-400 text-xs">{communication}/5</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setCommunication(score)}
                    className={`flex-1 py-1.5 rounded-none font-semibold text-xs border transition-all cursor-pointer ${
                      communication >= score
                        ? 'border-sky-500 bg-sky-500/20 text-sky-400'
                        : 'border-border/60 bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Large Interviewer Notes Textarea */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="comments" className="text-xs font-semibold">
              Interviewer Evaluation Notes
            </Label>
            <Textarea
              id="comments"
              placeholder="Candidate demonstrated strong knowledge of TypeScript, clean architecture, and problem-solving..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={5}
              className="text-xs leading-relaxed resize-y min-h-28"
            />
          </div>

          {/* Post-Interview Recommendation */}
          <div className="flex flex-col gap-1.5 pt-1">
            <Label className="text-xs font-semibold">Post-Interview Decision (Optional)</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecision('NONE')}
                className={`py-2 px-2.5 rounded-none border text-xs font-medium cursor-pointer transition-colors ${
                  decision === 'NONE'
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border/80 bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                Undecided
              </button>
              <button
                type="button"
                onClick={() => setDecision('OFFER_PENDING')}
                className={`py-2 px-2.5 rounded-none border text-xs font-medium cursor-pointer transition-colors ${
                  decision === 'OFFER_PENDING'
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-border/80 bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                Offer Pending
              </button>
              <button
                type="button"
                onClick={() => setDecision('REJECTED')}
                className={`py-2 px-2.5 rounded-none border text-xs font-medium cursor-pointer transition-colors ${
                  decision === 'REJECTED'
                    ? 'border-rose-500 bg-rose-500/15 text-rose-400'
                    : 'border-border/80 bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                Reject
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Selecting &apos;Offer Pending&apos; automatically moves candidate into the Onboarding
              pipeline.
            </p>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              size="sm"
              className="gap-1.5 text-xs h-9 px-4 cursor-pointer"
            >
              {submitting ? (
                <>
                  <InterviewIcons.Loader className="size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Evaluation'
              )}
            </Button>
          </DialogFooter>
        </form>
      )}
    </>
  )
}

export function FeedbackModal({ isOpen, interview, onClose, onSuccess }: FeedbackModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        {interview && (
          <FeedbackFormContent
            key={interview.id}
            interview={interview}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
