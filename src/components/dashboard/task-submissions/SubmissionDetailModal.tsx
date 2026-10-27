'use client'

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  ExternalLink,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Award,
  Globe,
  Clock,
  Save,
  MessageSquare,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import type { TaskSubmissionDetail } from '@/types/job'
import { deleteTaskSubmission, evaluateTaskSubmission } from '@/lib/task-submissions'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

interface SubmissionDetailModalProps {
  open: boolean
  submission: TaskSubmissionDetail | null
  onClose: () => void
  onDelete?: () => void
  onEvaluated?: (updated: TaskSubmissionDetail) => void
  onRequestResubmit?: (submission: TaskSubmissionDetail) => void
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function SubmissionDetailModal({
  open,
  submission,
  onClose,
  onDelete,
  onEvaluated,
  onRequestResubmit,
}: SubmissionDetailModalProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [evaluating, setEvaluating] = useState(false)

  const [decision, setDecision] = useState<'PASS' | 'FAIL' | null>(null)
  const [score, setScore] = useState<string>('')
  const [feedback, setFeedback] = useState<string>('')

  useEffect(() => {
    if (submission) {
      setScore(
        submission.score !== null && submission.score !== undefined
          ? String(submission.score)
          : ''
      )
      setFeedback(submission.feedback || '')

      const appStatus = submission.application?.status
      const isPassedStatus =
        submission.result === 'PASS' ||
        appStatus === 'INTERVIEW_SELECTED' ||
        appStatus === 'INTERVIEW_SCHEDULED' ||
        appStatus === 'INTERVIEW_COMPLETED' ||
        appStatus === 'HIRED'
      const isRejectedStatus = submission.result === 'FAIL' || appStatus === 'REJECTED'

      if (isPassedStatus) {
        setDecision('PASS')
      } else if (isRejectedStatus) {
        setDecision('FAIL')
      } else {
        setDecision(null)
      }
    }
  }, [submission])

  if (!submission) return null

  const appId = submission.applicationId || submission.application?.id

  const handleEvaluate = async (forcedDecision?: 'PASS' | 'FAIL' | null) => {
    if (!appId) {
      toast.error('Cannot evaluate: missing application ID.')
      return
    }

    const numericScore = score.trim() !== '' ? parseFloat(score.trim()) : null
    if (numericScore !== null && (isNaN(numericScore) || numericScore < 0 || numericScore > 100)) {
      toast.error('Please enter a valid mark/score between 0 and 100.')
      return
    }

    const finalDecision = forcedDecision !== undefined ? forcedDecision : decision
    const statusToUpdate =
      finalDecision === 'PASS'
        ? 'INTERVIEW_SELECTED'
        : finalDecision === 'FAIL'
          ? 'REJECTED'
          : undefined

    try {
      setEvaluating(true)
      await evaluateTaskSubmission(appId, {
        score: numericScore,
        result: finalDecision,
        feedback: feedback.trim() || null,
        status: statusToUpdate,
      })

      const updatedSub: TaskSubmissionDetail = {
        ...submission,
        score: numericScore,
        result: finalDecision,
        feedback: feedback.trim() || null,
        application: {
          ...submission.application,
          status: (statusToUpdate || submission.application?.status) as any,
        },
      }

      onEvaluated?.(updatedSub)
      toast.success(
        finalDecision === 'PASS'
          ? 'Candidate marked as PASSED (Interview Ready)!'
          : finalDecision === 'FAIL'
            ? 'Candidate marked as FAILED (Rejected)!'
            : 'Evaluation and marks saved successfully.'
      )
      onDelete?.()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save evaluation.')
    } finally {
      setEvaluating(false)
    }
  }

  const handleDelete = async () => {
    if (!submission.applicationId) {
      toast.error('Cannot delete: missing application ID.')
      return
    }

    try {
      setDeleting(true)
      await deleteTaskSubmission(submission.applicationId)
      toast.success('Task submission deleted successfully.')
      setDeleteConfirmOpen(false)
      onDelete?.()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete submission.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-border bg-card p-0 gap-0">
          {/* Header */}
          <DialogHeader className="p-5 border-b border-border bg-muted/20">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <span>Task Submission Review</span>
                  {decision === 'PASS' && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                      <CheckCircle className="size-3" />
                      Passed (Interview Ready)
                    </span>
                  )}
                  {decision === 'FAIL' && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-red-500/10 text-red-500 border border-red-500/30">
                      <XCircle className="size-3" />
                      Failed (Rejected)
                    </span>
                  )}
                  {decision === null && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                      <Clock className="size-3" />
                      Pending Review
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{submission.applicant?.name}</span>
                  <span>•</span>
                  <span>{submission.applicant?.email}</span>
                  {submission.jobTitle && (
                    <>
                      <span>•</span>
                      <span className="text-foreground/80">{submission.jobTitle}</span>
                    </>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-5 space-y-5">
            {/* Task Context Card */}
            {submission.jobTask?.title && (
              <div className="rounded-lg border border-border/80 bg-muted/30 p-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground">Task:</span>
                  <p className="font-medium text-foreground">{submission.jobTask.title}</p>
                </div>
                {submission.submittedAt && (
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground">Submitted At:</span>
                    <p className="font-medium text-foreground">{formatDate(submission.submittedAt)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Submitted URLs / Artifacts */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span>Submission Links & Code</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Frontend / Main GitHub */}
                <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2 flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <GithubIcon className="size-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">
                      Frontend / Main GitHub
                    </span>
                  </div>
                  {submission.githubRepoUrl ? (
                    <a
                      href={submission.githubRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between w-full rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-2 text-xs font-medium transition-colors"
                    >
                      <span className="truncate max-w-[200px]">View GitHub Repo</span>
                      <ExternalLink className="size-3.5 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Not provided</span>
                  )}
                </div>

                {/* Backend GitHub */}
                {submission.backendRepoUrl && (
                  <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2 flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                      <GithubIcon className="size-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">
                        Backend GitHub
                      </span>
                    </div>
                    <a
                      href={submission.backendRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between w-full rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-2 text-xs font-medium transition-colors"
                    >
                      <span className="truncate max-w-[200px]">View Backend Repo</span>
                      <ExternalLink className="size-3.5 shrink-0" />
                    </a>
                  </div>
                )}

                {/* Live Project */}
                <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2 flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="size-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Live Project</span>
                  </div>
                  {submission.liveUrl ? (
                    <a
                      href={submission.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between w-full rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-3 py-2 text-xs font-medium transition-colors"
                    >
                      <span className="truncate max-w-[200px]">Open Live Website</span>
                      <ExternalLink className="size-3.5 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Not provided</span>
                  )}
                </div>
              </div>
            </div>

            {/* Candidate Note */}
            {submission.note && (
              <div className="space-y-1.5 rounded-xl border border-border/70 bg-muted/20 p-3.5">
                <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wide">
                  <MessageSquare className="size-3" />
                  Candidate Note
                </span>
                <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {submission.note}
                </p>
              </div>
            )}

            {/* Evaluation & Marking Section */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <Award className="size-4 text-emerald-500" />
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Marking & Evaluation
                  </h3>
                </div>
                {submission.score !== null && submission.score !== undefined && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Current Mark: {submission.score} / 100
                  </span>
                )}
              </div>

              {/* Pass / Fail Outcome Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
                    Decision (Pass or Fail)
                  </label>
                  {decision && (
                    <button
                      type="button"
                      onClick={() => setDecision(null)}
                      className="text-[10px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                    >
                      Clear Selection (Keep Pending)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Pass Option Card */}
                  <button
                    type="button"
                    onClick={() => setDecision(decision === 'PASS' ? null : 'PASS')}
                    className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      decision === 'PASS'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30'
                        : 'bg-card border-border/80 text-muted-foreground hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-500'
                    }`}
                  >
                    <CheckCircle className={`size-4 shrink-0 ${decision === 'PASS' ? 'text-white' : 'text-emerald-500'}`} />
                    <span>Pass (Interview Ready)</span>
                  </button>

                  {/* Fail Option Card */}
                  <button
                    type="button"
                    onClick={() => setDecision(decision === 'FAIL' ? null : 'FAIL')}
                    className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      decision === 'FAIL'
                        ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-500/30'
                        : 'bg-card border-border/80 text-muted-foreground hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500'
                    }`}
                  >
                    <XCircle className={`size-4 shrink-0 ${decision === 'FAIL' ? 'text-white' : 'text-red-500'}`} />
                    <span>Fail (Reject)</span>
                  </button>
                </div>
              </div>

              {/* Score & Feedback Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start pt-1">
                {/* Score Input */}
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-[11px] font-medium text-foreground">
                    Mark / Score (Optional, 0 - 100)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      placeholder="e.g. 85"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      className="h-9 text-xs pl-3 pr-10 font-semibold"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">
                      / 100
                    </span>
                  </div>
                  {/* Quick score pills */}
                  <div className="flex items-center gap-1 pt-1">
                    {[50, 70, 85, 95].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setScore(String(preset))}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback / Note */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-medium text-foreground">
                    Evaluation Remarks / Feedback (Optional)
                  </label>
                  <Textarea
                    placeholder="Enter review remarks on code quality, functionality, UI, etc..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={2}
                    className="text-xs resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleEvaluate(null)}
                  disabled={evaluating}
                  className="gap-1.5 text-xs h-8"
                  title="Save marks and remarks without setting Pass or Fail"
                >
                  {evaluating ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Save className="size-3.5" />
                  )}
                  Save Mark Only
                </Button>

                <div className="flex items-center gap-2">
                  {/* Primary Save Button based on choice */}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleEvaluate()}
                    disabled={evaluating}
                    className={`gap-1.5 text-xs h-8 font-medium shadow-xs ${
                      decision === 'PASS'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : decision === 'FAIL'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {evaluating ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : decision === 'PASS' ? (
                      <CheckCircle className="size-3.5" />
                    ) : decision === 'FAIL' ? (
                      <XCircle className="size-3.5" />
                    ) : (
                      <Save className="size-3.5" />
                    )}
                    {decision === 'PASS'
                      ? 'Save as Pass'
                      : decision === 'FAIL'
                        ? 'Save as Fail'
                        : 'Save Evaluation'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-border bg-muted/20 flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {onRequestResubmit && submission && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose()
                    onRequestResubmit(submission)
                  }}
                  disabled={evaluating || deleting}
                  className="gap-1.5 text-xs border-border hover:bg-muted h-8"
                  title="Resend task to candidate"
                >
                  <RefreshCw className="size-3.5" />
                  Resend Task
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={evaluating || deleting}
                className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 border-destructive/30 h-8"
              >
                <Trash2 className="size-3.5" />
                Delete Submission
              </Button>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={evaluating || deleting}
              className="text-xs h-8"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={(nextOpen) => !nextOpen && setDeleteConfirmOpen(false)}
      >
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="size-4 text-destructive" />
              Delete Task Submission
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete this task submission? The candidate will be permitted
              to submit their task again.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-1.5"
            >
              {deleting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5" />
                  Confirm Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
