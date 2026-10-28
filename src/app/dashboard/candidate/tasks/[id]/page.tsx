'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ArrowLeft, ExternalLink, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { CandidateTaskSkeleton } from '@/components/dashboard/candidate/CandidateTaskSkeleton'
import { getAssignmentDetail, submitTask, type SubmitTaskPayload } from '@/lib/task-submissions'
import { SanitizedHtml } from '@/components/common/SanitizedHtml'

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

interface AssignmentData {
  id: string
  applicationId: string
  applicantName: string
  applicantEmail: string
  jobId: string
  jobCode: string
  jobTitle: string
  taskTitle: string
  taskDescription: string
  taskJobId: string
  applicationStatus: string
  assignmentStatus: string
  sentAt: string
  expiresAt: string | null
  submittedAt: string | null
  githubRepoUrl: string | null
  backendRepoUrl: string | null
  liveUrl: string | null
  note: string | null
}

export default function CandidateTaskPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params?.id as string

  const [assignment, setAssignment] = useState<AssignmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [githubUrl, setGithubUrl] = useState('')
  const [backendUrl, setBackendUrl] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const loadAssignment = useCallback(async () => {
    if (!assignmentId) return
    try {
      setLoading(true)
      setError(null)
      const data = await getAssignmentDetail(assignmentId)
      setAssignment(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task assignment.')
    } finally {
      setLoading(false)
    }
  }, [assignmentId])

  useEffect(() => {
    void loadAssignment()
  }, [loadAssignment])

  const isExpired = assignment?.assignmentStatus === 'EXPIRED'
  const isSubmitted = assignment?.assignmentStatus === 'SUBMITTED' || submitSuccess
  const deadlinePassed = assignment?.expiresAt ? new Date(assignment.expiresAt) < new Date() : false
  const canSubmit = !isExpired && !isSubmitted && !deadlinePassed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!githubUrl.trim()) {
      toast.error('Frontend/Main GitHub Repository URL is required.')
      return
    }

    if (!isValidUrl(githubUrl)) {
      toast.error('Please enter a valid GitHub Repository URL.')
      return
    }

    if (backendUrl.trim() && !isValidUrl(backendUrl)) {
      toast.error('Please enter a valid Backend GitHub Repository URL.')
      return
    }

    if (!isValidUrl(githubUrl)) {
      toast.error('Please enter a valid GitHub Repository URL.')
      return
    }

    if (!liveUrl.trim()) {
      toast.error('Live Project URL is required.')
      return
    }

    if (!isValidUrl(liveUrl)) {
      toast.error('Please enter a valid Live Project URL.')
      return
    }

    try {
      setIsSubmitting(true)

      const payload: SubmitTaskPayload = {
        githubRepoUrl: githubUrl.trim(),
        liveUrl: liveUrl.trim(),
      }

      if (backendUrl.trim()) {
        payload.backendRepoUrl = backendUrl.trim()
      }

      if (note.trim()) {
        payload.note = note.trim()
      }

      await submitTask(assignmentId, payload)
      setSubmitSuccess(true)
      toast.success('Task submitted successfully!')

      void loadAssignment()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit task.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <CandidateTaskSkeleton />
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-red-500/20 bg-card shadow-xl">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
              <XCircle className="size-7" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-foreground">Unable to Load Task</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {error || 'Task assignment not found.'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="size-3.5" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Task Assignment
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            View and submit your assigned task.
          </p>
        </div>

        {/* Status Banner */}
        {isSubmitted && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-3">
            <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Task Submitted
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your submission has been received successfully.
              </p>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex items-center gap-3">
            <XCircle className="size-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                Submission Expired
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                The deadline for this task has passed.
              </p>
            </div>
          </div>
        )}

        {deadlinePassed && !isSubmitted && !isExpired && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-center gap-3">
            <Clock className="size-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                Submission deadline has expired.
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You can no longer submit this task.
              </p>
            </div>
          </div>
        )}

        {/* Task Information Card */}
        <Card className="mb-6 border-border bg-card shadow-xs">
          <CardContent className="p-5 space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Task Title
              </h2>
              <p className="mt-1 text-sm font-medium text-foreground">
                {assignment.taskTitle || '—'}
              </p>
            </div>
            <div className="pt-2 border-t border-border">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Task Description
              </h2>
              <div className="mt-1 text-sm text-muted-foreground leading-6">
                <SanitizedHtml content={assignment.taskDescription} />
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Deadline
              </h2>
              <p className="mt-1 text-sm font-medium text-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground" />
                {assignment.expiresAt ? formatDate(assignment.expiresAt) : '—'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submission Form */}
        {canSubmit && (
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">Submit Task</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Frontend / Main GitHub Repository URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://github.com/username/frontend-repository"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    disabled={isSubmitting}
                    className="h-9 text-xs rounded-lg border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Backend GitHub Repository URL</Label>
                  <Input
                    type="url"
                    placeholder="https://github.com/username/backend-repository"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    disabled={isSubmitting}
                    className="h-9 text-xs rounded-lg border-border"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Leave empty if your project only has one repository.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Live Project URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://your-project.vercel.app"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    disabled={isSubmitting}
                    className="h-9 text-xs rounded-lg border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Note (Optional)</Label>
                  <Textarea
                    placeholder="Add any notes about your submission..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                    className="text-xs rounded-lg border-border resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !githubUrl.trim() || !liveUrl.trim()}
                  className="w-full h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Task'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Already Submitted - Show Submission Details */}
        {isSubmitted && assignment.githubRepoUrl && (
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Your Submission</h2>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[11px] text-muted-foreground">Submitted At</p>
                  <p className="mt-0.5 font-medium text-foreground">
                    {assignment.submittedAt ? formatDate(assignment.submittedAt) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Frontend / Main GitHub Repository</p>
                  <a
                    href={assignment.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-blue-500 hover:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="size-3" />
                    {assignment.githubRepoUrl}
                  </a>
                </div>
                {assignment.backendRepoUrl && (
                  <div>
                    <p className="text-[11px] text-muted-foreground">Backend GitHub Repository</p>
                    <a
                      href={assignment.backendRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-blue-500 hover:text-blue-400 hover:underline"
                    >
                      <ExternalLink className="size-3" />
                      {assignment.backendRepoUrl}
                    </a>
                  </div>
                )}
                {assignment.liveUrl && (
                  <div>
                    <p className="text-[11px] text-muted-foreground">Live Project</p>
                    <a
                      href={assignment.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-blue-500 hover:text-blue-400 hover:underline"
                    >
                      <ExternalLink className="size-3" />
                      {assignment.liveUrl}
                    </a>
                  </div>
                )}
                {assignment.note && (
                  <div>
                    <p className="text-[11px] text-muted-foreground">Note</p>
                    <p className="mt-0.5 text-muted-foreground leading-5 whitespace-pre-wrap">
                      {assignment.note}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
