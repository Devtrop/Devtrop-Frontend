'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { toast } from '@/lib/toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmailTemplateSelect } from '@/components/dashboard/email-templates/EmailTemplateSelect'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { interviewsApi } from '@/lib/interviews'
import { Textarea } from '@/components/ui/textarea'
import { classifyInterviewCandidates } from './constants'
import { InterviewIcons } from './interview-icons'
import { Interview, SlotGroup } from './types'

type EmailDispatchType = 'INVITATION' | 'OUTCOME'

interface SendEmailModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  selectedInterviews: Interview[]
}

export function SendEmailModal({
  isOpen,
  onClose,
  onSuccess,
  selectedInterviews,
}: SendEmailModalProps) {
  const [emailTypeOverride, setEmailTypeOverride] = useState<EmailDispatchType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sentSummary, setSentSummary] = useState<{ count: number; message: string } | null>(null)
  const [customRejectedMessage, setCustomRejectedMessage] = useState('')
  const [inviteTemplateId, setInviteTemplateId] = useState<string>('')
  const [outcomeTemplateId, setOutcomeTemplateId] = useState<string>('')
  const [availableGroups, setAvailableGroups] = useState<SlotGroup[]>([])
  const [selectedGroupName, setSelectedGroupName] = useState<string>('')
  const [loadingGroups, setLoadingGroups] = useState(false)

  // Segment candidates into invitations vs outcomes
  const { invitations, outcomes } = useMemo(() => {
    return classifyInterviewCandidates(selectedInterviews)
  }, [selectedInterviews])

  const defaultEmailType: EmailDispatchType = useMemo(() => {
    if (outcomes.length > 0 && invitations.length === 0) {
      return 'OUTCOME'
    }
    return 'INVITATION'
  }, [outcomes.length, invitations.length])

  const emailType = emailTypeOverride ?? defaultEmailType

  // Fetch slot groups for the target job(s)
  useEffect(() => {
    if (!isOpen || invitations.length === 0) {
      setAvailableGroups([])
      setSelectedGroupName('')
      return
    }

    const primaryJobId = invitations[0]?.application?.job?.id
    if (!primaryJobId) return

    let active = true
    setLoadingGroups(true)
    interviewsApi
      .getSlotGroups(primaryJobId)
      .then((res) => {
        if (!active) return
        if (res.success && Array.isArray(res.data)) {
          setAvailableGroups(res.data)
        } else {
          setAvailableGroups([])
        }
      })
      .catch((err) => {
        console.error('Failed to load slot groups for invitation:', err)
      })
      .finally(() => {
        if (active) setLoadingGroups(false)
      })

    return () => {
      active = false
    }
  }, [isOpen, invitations])

  // Current active candidates list based on selected tab
  const activeCandidates = useMemo(() => {
    if (emailType === 'INVITATION') return invitations
    return outcomes
  }, [emailType, invitations, outcomes])

  // Backend requires a groupName: fall back to the latest group, and gate on its capacity
  const effectiveGroupName = useMemo(() => {
    if (selectedGroupName.trim()) return selectedGroupName.trim()
    return availableGroups[0]?.groupName || ''
  }, [selectedGroupName, availableGroups])

  const selectedGroupStats = availableGroups.find((g) => g.groupName === effectiveGroupName)

  const newInviteeCount = useMemo(() => invitations.filter((i) => !i.token).length, [invitations])

  const overCapacity =
    emailType === 'INVITATION' &&
    !!selectedGroupStats &&
    newInviteeCount > selectedGroupStats.availableSlots

  // Helper to group items by Job ID
  const groupItemsByJob = (items: Interview[]) => {
    const map: Record<string, { jobTitle: string; items: Interview[] }> = {}
    items.forEach((item) => {
      const jobId = item.application?.job?.id || 'default-job'
      const jobTitle = item.application?.job?.title || 'Open Position'
      if (!map[jobId]) {
        map[jobId] = { jobTitle, items: [] }
      }
      map[jobId].items.push(item)
    })
    return map
  }

  // 1. Dispatch Initial Invitations (Self-Booking Tokens)
  const handleSendInvitations = async () => {
    if (invitations.length === 0) return

    if (!effectiveGroupName) {
      toast.error(
        'No slot batch exists for this job yet. Generate interview slots before inviting candidates.',
      )
      return
    }

    if (overCapacity) {
      toast.error(
        `Batch "${effectiveGroupName}" has ${selectedGroupStats?.availableSlots ?? 0} free slot(s) but ${newInviteeCount} new candidate(s) selected. Extend the batch or generate a new one first.`,
      )
      return
    }

    setIsSubmitting(true)
    try {
      const jobGroups = groupItemsByJob(invitations)
      let total = 0
      let skipped = 0

      for (const [jobId, group] of Object.entries(jobGroups)) {
        const applicationIds = group.items.map((i) => i.application?.id || i.applicationId)

        const res = await interviewsApi.inviteCandidates({
          jobId,
          applicationIds,
          groupName: effectiveGroupName,
          templateId: inviteTemplateId || undefined,
        })

        if (res.success && res.data) {
          total += res.data.invitationsSent || applicationIds.length
          skipped += res.data.results?.filter((r) => r.status === 'failed').length || 0
        } else {
          throw new Error(res.message || 'Failed to dispatch invitation tokens')
        }
      }

      toast.success(
        `Successfully sent ${total} self-booking invitation(s)!` +
          (skipped > 0 ? ` ${skipped} candidate(s) were skipped by the backend.` : ''),
      )
      setSentSummary({
        count: total,
        message:
          `Dispatched ${total} self-booking invitation(s) to candidates from batch "${effectiveGroupName}".` +
          (skipped > 0
            ? ` ${skipped} selected candidate(s) were not eligible and were skipped (see interview list statuses).`
            : ''),
      })
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to dispatch emails.'
      console.error(err)
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 2. Dispatch Post-Interview Outcomes (Offers & Rejections)
  const handleSendOutcomes = async () => {
    if (outcomes.length === 0) return

    setIsSubmitting(true)
    try {
      const jobGroups = groupItemsByJob(outcomes)
      let totalRejected = 0

      for (const [jobId, group] of Object.entries(jobGroups)) {
        const applicationIds = group.items.map((i) => i.application?.id || i.applicationId)

        const res = await interviewsApi.sendOutcomeEmails({
          jobId,
          applicationIds,
          customRejectedMessage: customRejectedMessage.trim() || undefined,
          forceResend: true,
          rejectedTemplateId: outcomeTemplateId || undefined,
        })

        if (res.success && res.data) {
          totalRejected += res.data.sentRejectedCount || 0
        } else {
          throw new Error(res.message || 'Failed to dispatch outcome emails')
        }
      }

      toast.success(`Dispatched ${totalRejected} rejection notice(s)!`)
      setSentSummary({
        count: totalRejected,
        message: `Dispatched ${totalRejected} Rejection notice(s).`,
      })
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to dispatch outcome emails.'
      console.error(err)
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModalClose = () => {
    if (sentSummary) {
      onSuccess()
    }
    setSentSummary(null)
    setEmailTypeOverride(null)
    setCustomRejectedMessage('')
    setSelectedGroupName('')
    onClose()
  }

  const hasRejectedCandidates = outcomes.some((i) => i.application?.status === 'REJECTED')

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
      <DialogContent className="w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[90dvh] overflow-y-auto p-0">
        {sentSummary ? (
          <div className="flex flex-col items-center justify-center gap-4 p-6 text-center animate-in fade-in">
            <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <InterviewIcons.CheckCircle2 className="size-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">Email Dispatch Successful</h3>
              <p className="text-xs text-muted-foreground">{sentSummary.message}</p>
            </div>
            <Button size="sm" onClick={handleModalClose} className="mt-2 text-xs">
              Close Window
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/60">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base font-semibold text-foreground">
                  Dispatch Candidate Communications
                </DialogTitle>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {selectedInterviews.length} Selected
                </Badge>
              </div>
              <DialogDescription className="text-sm text-muted-foreground">
                Send self-booking invitation links or dispatch post-interview decision emails.
              </DialogDescription>
            </DialogHeader>

            {/* Body */}
            <div className="flex flex-col gap-4 p-4 sm:p-6">
              {/* Email Template Selector & Slot Group Selection */}
              <div className="p-3 bg-muted/30 rounded-xl border border-border/60 flex flex-col gap-3">
                {emailType === 'INVITATION' ? (
                  <>
                    <EmailTemplateSelect
                      category="INTERVIEW_INVITATION"
                      value={inviteTemplateId}
                      onChange={(id) => setInviteTemplateId(id)}
                      label="Invitation Email Template"
                    />

                    {/* Slot Group Selection Dropdown */}
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-border/40">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Offered Slot Group (Batch)
                        </span>
                        {selectedGroupStats ? (
                          <span
                            className={`text-[10px] font-medium ${
                              overCapacity ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {newInviteeCount} new invitee(s) vs {selectedGroupStats.availableSlots}{' '}
                            free slot(s) in &ldquo;{effectiveGroupName}&rdquo;
                            {overCapacity ? ' — over capacity' : ''}
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-400 font-medium">
                            No slot batch exists for this job yet
                          </span>
                        )}
                      </div>

                      {loadingGroups ? (
                        <div className="py-1 text-xs text-muted-foreground flex items-center gap-2">
                          <InterviewIcons.Loader className="size-3 animate-spin text-primary" />{' '}
                          Loading groups...
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-8 px-3 rounded-xl border border-border bg-card/80 text-xs font-medium justify-between gap-2 cursor-pointer hover:bg-muted/40"
                            >
                              <span className="truncate text-foreground font-semibold">
                                {effectiveGroupName || 'No slot batch available'}
                              </span>
                              <InterviewIcons.ChevronDown className="size-3 text-muted-foreground shrink-0 opacity-70" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-80 rounded-xl text-xs max-h-60 overflow-y-auto"
                          >
                            {availableGroups.map((grp) => (
                              <DropdownMenuItem
                                key={grp.groupName}
                                onClick={() => setSelectedGroupName(grp.groupName)}
                                className="cursor-pointer gap-2 rounded-lg justify-between"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="truncate">{grp.groupName}</span>
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    ({grp.availableSlots} open)
                                  </span>
                                </div>
                                {effectiveGroupName === grp.groupName && (
                                  <InterviewIcons.Check className="size-3 ml-auto text-primary shrink-0" />
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {invitations.length > 0 && availableGroups.length > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          Candidates already invited from this batch can always be re-sent the
                          invitation &mdash; that does not consume a new slot.
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <EmailTemplateSelect
                    category="INTERVIEW_OUTCOME"
                    value={outcomeTemplateId}
                    onChange={(id) => setOutcomeTemplateId(id)}
                    label="Outcome / Rejection Email Template"
                  />
                )}
              </div>

              {/* Tab Switcher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-muted/30 rounded-lg border border-border/60 text-sm">
                <button
                  type="button"
                  onClick={() => setEmailTypeOverride('INVITATION')}
                  className={`py-2.5 px-3 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    emailType === 'INVITATION'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <InterviewIcons.MailPlus className="size-3.5 shrink-0" />
                  <span className="truncate">Invitations / Resend ({invitations.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEmailTypeOverride('OUTCOME')}
                  className={`py-2.5 px-3 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    emailType === 'OUTCOME'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <InterviewIcons.Send className="size-3.5 shrink-0" />
                  <span className="truncate">Outcomes / Resend ({outcomes.length})</span>
                </button>
              </div>

              {/* Candidate List */}
              <div className="max-h-60 overflow-y-auto rounded-lg border border-border/60 divide-y divide-border/60 text-sm bg-muted/20">
                {activeCandidates.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    No candidates match the criteria for {emailType.toLowerCase()} emails.
                  </div>
                ) : (
                  activeCandidates.map((item) => {
                    const applicant = item.application?.applicant
                    const job = item.application?.job
                    const appStatus = item.application?.status || 'APPLIED'

                    return (
                      <div
                        key={item.id}
                        className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-foreground truncate">
                            {applicant?.name || 'Applicant'}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {applicant?.email}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-[11px] text-muted-foreground">
                            {job?.title || 'Role'}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[11px] font-medium ${
                              appStatus === 'REJECTED'
                                ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                                : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                            }`}
                          >
                            {emailType === 'OUTCOME'
                              ? 'Rejection Notice'
                              : item.token
                                ? 'Resend Invite'
                                : 'Ready to Invite'}
                          </Badge>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Custom message for outcomes */}
              {emailType === 'OUTCOME' && hasRejectedCandidates && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-medium text-foreground">
                    Custom Decision Feedback Note (Optional)
                  </label>
                  <Textarea
                    placeholder="Provide constructive feedback or customized reasoning for rejected applicants..."
                    value={customRejectedMessage}
                    onChange={(e) => setCustomRejectedMessage(e.target.value)}
                    rows={3}
                    className="text-xs resize-none"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 p-4 border-t border-border/60 bg-muted/10">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial text-xs"
              >
                Cancel
              </Button>

              {emailType === 'INVITATION' ? (
                <Button
                  size="sm"
                  onClick={handleSendInvitations}
                  disabled={
                    isSubmitting || invitations.length === 0 || overCapacity || !effectiveGroupName
                  }
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <InterviewIcons.Loader className="size-3.5 animate-spin" />
                  ) : (
                    <InterviewIcons.MailPlus className="size-3.5" />
                  )}
                  <span>Dispatch {invitations.length} Invitation(s)</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSendOutcomes}
                  disabled={isSubmitting || outcomes.length === 0}
                  className="gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <InterviewIcons.Loader className="size-3.5 animate-spin" />
                  ) : (
                    <InterviewIcons.Send className="size-3.5" />
                  )}
                  <span>Dispatch {outcomes.length} Outcome(s)</span>
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
