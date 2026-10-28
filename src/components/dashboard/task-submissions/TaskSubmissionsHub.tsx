'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { AdminSectionSkeleton } from '@/components/dashboard/admin/AdminSectionSkeleton'
import { api } from '@/lib/api'
import { deleteTaskAssignment, deleteTaskSubmission } from '@/lib/task-submissions'
import { updateApplicationStatus } from '@/lib/applications'
import { assignTaskToApplications } from '@/lib/task-assignments'
import type { TaskSubmissionDetail, TaskAssignmentStatus } from '@/types/job'

import { TaskSubmissionsHeader } from './TaskSubmissionsHeader'
import { TaskSubmissionsStats } from './TaskSubmissionsStats'
import { TaskSubmissionsFilters } from './TaskSubmissionsFilters'
import { TaskSubmissionsTable } from './TaskSubmissionsTable'
import { SubmissionDetailModal } from './SubmissionDetailModal'
import { AssignTaskModal } from '@/components/dashboard/applications/AssignTaskModal'
import { EmailTemplateSelect } from '@/components/dashboard/email-templates/EmailTemplateSelect'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'

interface SubmissionsStatsData {
  total: number
  sent: number
  submitted: number
  expired: number
}

interface RawAssignment {
  applicationId?: string
  applicationCode?: string
  assignmentId?: string
  applicantName?: string
  applicantEmail?: string
  jobId?: string
  jobCode?: string
  jobTitle?: string
  taskTitle?: string
  taskDescription?: string
  applicationStatus?: string
  assignmentStatus?: string
  sentAt?: string
  expiresAt?: string
  submittedAt?: string
  githubRepoUrl?: string | null
  backendRepoUrl?: string | null
  liveUrl?: string | null
  note?: string | null
  score?: number | null
  result?: string | null
  feedback?: string | null
  reviewedAt?: string | null
  reviewedBy?: string | null
  application?: {
    id?: string
    applicationCode?: string
    jobCode?: string
    status?: string
  }
}

function transformAssignment(raw: RawAssignment): TaskSubmissionDetail {
  const applicationCode = raw.applicationCode || raw.application?.applicationCode
  const jobCode = raw.jobCode || raw.application?.jobCode
  return {
    id: raw.assignmentId ?? raw.applicationId ?? '',
    jobTaskId: raw.jobId ?? '',
    applicationId: raw.applicationId ?? '',
    applicationCode,
    status: (raw.assignmentStatus as TaskSubmissionDetail['status']) ?? 'SENT',
    assignedAt: raw.sentAt ?? '',
    updatedAt: raw.sentAt ?? '',
    expiresAt: raw.expiresAt,
    submittedAt: raw.submittedAt,
    githubRepoUrl: raw.githubRepoUrl ?? undefined,
    backendRepoUrl: raw.backendRepoUrl ?? undefined,
    liveUrl: raw.liveUrl ?? undefined,
    note: raw.note ?? undefined,
    score: raw.score ?? null,
    result: raw.result ?? null,
    feedback: raw.feedback ?? null,
    reviewedAt: raw.reviewedAt ?? null,
    reviewedBy: raw.reviewedBy ?? null,
    applicant: {
      id: '',
      name: raw.applicantName ?? 'Unknown',
      email: raw.applicantEmail ?? '',
    },
    jobTask: {
      id: '',
      jobId: raw.jobId ?? '',
      jobCode,
      title: raw.taskTitle ?? '',
      description: raw.taskDescription ?? '',
    },
    jobTitle: raw.jobTitle ?? '',
    jobCode,
    application: {
      id: raw.applicationId ?? '',
      status:
        (raw.applicationStatus as TaskSubmissionDetail['application']['status']) ?? 'TASK_ASSIGNED',
      applicationCode,
      jobCode,
    },
  }
}

export function TaskSubmissionsHub() {
  const [submissions, setSubmissions] = useState<TaskSubmissionDetail[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [jobId, setJobId] = useState('')
  const [jobTaskId, setJobTaskId] = useState('')
  const [status, setStatus] = useState<TaskAssignmentStatus | ''>('')
  const [evaluationStatus, setEvaluationStatus] = useState<string>('')

  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmissionDetail | null>(null)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingSubmission, setDeletingSubmission] = useState<TaskSubmissionDetail | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [assignTaskModalOpen, setAssignTaskModalOpen] = useState(false)
  const [selectedForTask, setSelectedForTask] = useState<any[]>([])

  const [resubmitConfirmOpen, setResubmitConfirmOpen] = useState(false)
  const [resubmitSubmission, setResubmitSubmission] = useState<TaskSubmissionDetail | null>(null)
  const [resubmitting, setResubmitting] = useState(false)
  const [resubmitTemplateId, setResubmitTemplateId] = useState<string>('')

  const limit = 20

  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true)

      if (!api.isAuthenticated()) {
        setSubmissions([])
        toast.error('You are not authenticated.')
        return
      }

      const response = await api.get<{
        data: RawAssignment[]
        stats: SubmissionsStatsData
        meta: { total: number; page: number; limit: number; totalPages: number }
      }>('/job-tasks/assignments/all', {
        page,
        limit: Math.min(limit, 100),
        search: search.trim() || undefined,
        jobId: jobId.trim() || undefined,
        jobTaskId: jobTaskId.trim() || undefined,
        status: status || undefined,
        applicationStatus: evaluationStatus && evaluationStatus !== 'ALL' ? evaluationStatus : undefined,
      })

      const rawList: RawAssignment[] = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response as unknown as RawAssignment[])
          ? (response as unknown as RawAssignment[])
          : []
      const metaData = response?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 }

      setSubmissions(rawList.map(transformAssignment))
      setTotal(metaData.total)
      setTotalPages(metaData.totalPages)
      
      if (response?.stats) {
        setServerStats(response.stats)
      } else {
        setServerStats({
          total: metaData.total,
          sent: 0,
          submitted: 0,
          expired: 0
        })
      }
    } catch (error) {
      setSubmissions([])
      toast.error(error instanceof Error ? error.message : 'Failed to load task submissions.')
    } finally {
      setLoading(false)
    }
  }, [page, search, jobId, jobTaskId, status, evaluationStatus])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadSubmissions()
    }, 300)
    return () => clearTimeout(timer)
  }, [loadSubmissions])

  const [serverStats, setServerStats] = useState<SubmissionsStatsData>({
    total: 0,
    sent: 0,
    submitted: 0,
    expired: 0,
  })

  const stats = serverStats

  const handleReset = () => {
    setSearch('')
    setJobId('')
    setJobTaskId('')
    setStatus('')
    setEvaluationStatus('')
    setPage(1)
  }

  const handleViewSubmission = (submission: TaskSubmissionDetail) => {
    setSelectedSubmission(submission)
    setDetailModalOpen(true)
  }

  const handleDeleteClick = (submission: TaskSubmissionDetail) => {
    setDeletingSubmission(submission)
    setDeleteConfirmOpen(true)
  }

  const handleRequestResubmitClick = (submission: TaskSubmissionDetail) => {
    setResubmitSubmission(submission)
    setResubmitTemplateId('')
    setResubmitConfirmOpen(true)
  }

  const handleAssignTaskClick = (submission: TaskSubmissionDetail) => {
    setSelectedForTask([{
      id: submission.applicationId,
      applicationCode: submission.applicationCode || '',
      status: submission.application?.status || '',
      job: {
        id: submission.jobTaskId,
        title: submission.jobTitle,
        jobCode: submission.jobCode || ''
      },
      applicant: submission.applicant,
    }])
    setAssignTaskModalOpen(true)
  }

  const handleUpdateStatus = async (applicationId: string, status: string) => {
    try {
      const result = await updateApplicationStatus(applicationId, status)
      const newStatus = (result?.status as TaskSubmissionDetail['application']['status']) ?? status
      if (status === 'CLOSED') {
        setSubmissions((prev) =>
          prev.filter((s) => s.applicationId !== applicationId && s.application?.id !== applicationId)
        )
      } else {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.applicationId === applicationId || s.application?.id === applicationId
              ? { ...s, application: { ...s.application, status: newStatus } }
              : s,
          ),
        )
      }
      toast.success(`Status updated to ${status.replace(/_/g, ' ')}.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status.')
      throw err
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingSubmission?.id) {
      toast.error('Cannot delete: missing assignment ID.')
      return
    }

    try {
      setDeleting(true)
      await deleteTaskAssignment(deletingSubmission.id)
      toast.success('Task assignment deleted successfully.')
      setDeleteConfirmOpen(false)
      setDeletingSubmission(null)
      void loadSubmissions()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete assignment.')
    } finally {
      setDeleting(false)
    }
  }

  const handleResubmitConfirm = async () => {
    if (!resubmitSubmission?.applicationId) {
      toast.error('Cannot resend: missing required data.')
      return
    }

    try {
      setResubmitting(true)
      // Only delete this specific candidate's submission (never delete the shared batch assignment!)
      await deleteTaskSubmission(resubmitSubmission.applicationId)
      
      toast.success('Task submission cleared. Candidate can now resubmit their task.')
      setResubmitConfirmOpen(false)
      setResubmitSubmission(null)
      void loadSubmissions()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset task submission.')
    } finally {
      setResubmitting(false)
    }
  }

  if (loading && submissions.length === 0) {
    return <AdminSectionSkeleton />
  }

  return (
    <RoleGuard
      fallback={<AdminSectionSkeleton titleWidth="w-56" statCardsCount={4} />}
      permissions={[
        'task.read',
        'task.assign',
        'task.status.update',
        'task_report.read',
        'task_report.approve',
        'job_task.read',
        'job-tasks.manage',
      ]}
      allowedRoles={['SUPER_ADMIN', 'ADMIN']}
    >
      <div className="space-y-6">
        <TaskSubmissionsHeader onRefresh={() => void loadSubmissions()} loading={loading} />

        <TaskSubmissionsStats stats={stats} />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Left: Professional Segmented Tabs */}
            <Tabs
              value={status || 'ALL'}
              onValueChange={(v) => setStatus(v === 'ALL' ? '' : (v as TaskAssignmentStatus))}
              className="w-full lg:w-auto"
            >
              <TabsList className="bg-card border border-border p-1 h-10 w-full sm:w-auto inline-flex justify-start sm:justify-center overflow-x-auto rounded-none">
                <TabsTrigger
                  value="ALL"
                  className="group rounded-none px-4 py-1.5 text-xs font-medium data-[state=active]:bg-accent-soft data-[state=active]:text-accent data-[state=active]:shadow-none hover:text-accent transition-all flex items-center gap-2"
                >
                  All Statuses
                  <span className="bg-muted text-muted-foreground group-data-[state=active]:bg-accent-soft group-data-[state=active]:text-accent px-1.5 py-0.5 rounded-full text-[10px] leading-none">
                    {stats.total}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="SENT"
                  className="group rounded-none px-4 py-1.5 text-xs font-medium data-[state=active]:bg-accent-soft data-[state=active]:text-accent data-[state=active]:shadow-none hover:text-accent transition-all flex items-center gap-2"
                >
                  Sent
                  <span className="bg-muted text-muted-foreground group-data-[state=active]:bg-accent-soft group-data-[state=active]:text-accent px-1.5 py-0.5 rounded-full text-[10px] leading-none">
                    {stats.sent}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="SUBMITTED"
                  className="group rounded-none px-4 py-1.5 text-xs font-medium data-[state=active]:bg-accent-soft data-[state=active]:text-accent data-[state=active]:shadow-none hover:text-accent transition-all flex items-center gap-2"
                >
                  Submitted
                  <span className="bg-muted text-muted-foreground group-data-[state=active]:bg-accent-soft group-data-[state=active]:text-accent px-1.5 py-0.5 rounded-full text-[10px] leading-none">
                    {stats.submitted}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="EXPIRED"
                  className="group rounded-none px-4 py-1.5 text-xs font-medium data-[state=active]:bg-accent-soft data-[state=active]:text-accent data-[state=active]:shadow-none hover:text-accent transition-all flex items-center gap-2"
                >
                  Expired
                  <span className="bg-muted text-muted-foreground group-data-[state=active]:bg-accent-soft group-data-[state=active]:text-accent px-1.5 py-0.5 rounded-full text-[10px] leading-none">
                    {stats.expired}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Right: Inline Search & Filters */}
            <div className="w-full lg:w-auto">
              <TaskSubmissionsFilters
                search={search}
                onSearchChange={(val) => {
                  setSearch(val)
                  setPage(1)
                }}
                jobId={jobId}
                onJobChange={(val) => {
                  setJobId(val)
                  setPage(1)
                }}
                jobTaskId={jobTaskId}
                onJobTaskIdChange={(val) => {
                  setJobTaskId(val)
                  setPage(1)
                }}
                evaluationStatus={evaluationStatus}
                onEvaluationStatusChange={(val) => {
                  setEvaluationStatus(val === 'ALL' ? '' : val)
                  setPage(1)
                }}
                loading={loading}
                onReset={handleReset}
              />
            </div>
          </div>
        </div>

        <TaskSubmissionsTable
          submissions={submissions}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={total}
          onViewSubmission={handleViewSubmission}
          onDeleteSubmission={handleDeleteClick}
          onUpdateStatus={handleUpdateStatus}
          onAssignTask={handleAssignTaskClick}
          onRequestResubmit={handleRequestResubmitClick}
        />

        <SubmissionDetailModal
          open={detailModalOpen}
          submission={selectedSubmission}
          onClose={() => {
            setDetailModalOpen(false)
            setSelectedSubmission(null)
          }}
          onDelete={() => void loadSubmissions()}
          onRequestResubmit={(sub) => {
            setDetailModalOpen(false)
            handleRequestResubmitClick(sub)
          }}
          onEvaluated={(updated) => {
            setSubmissions((prev) =>
              prev.map((s) =>
                s.applicationId === updated.applicationId || s.id === updated.id
                  ? {
                      ...s,
                      score: updated.score,
                      feedback: updated.feedback,
                      application: {
                        ...s.application,
                        status: updated.application.status,
                      },
                    }
                  : s,
              ),
            )
            void loadSubmissions()
          }}
        />

        <AssignTaskModal
          open={assignTaskModalOpen}
          selectedApplications={selectedForTask}
          onClose={() => {
            setAssignTaskModalOpen(false)
            setSelectedForTask([])
          }}
          onComplete={() => void loadSubmissions()}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onOpenChange={(nextOpen) => !nextOpen && setDeleteConfirmOpen(false)}
        >
          <DialogContent className="sm:max-w-md border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-foreground">
                Delete Task Assignment
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Are you sure you want to delete this task assignment for{' '}
                <span className="font-medium text-foreground">
                  {deletingSubmission?.applicant?.name || 'this candidate'}
                </span>
                ? This will also delete any associated submission and roll back the application
                status. This action cannot be undone.
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
                onClick={handleDeleteConfirm}
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

        {/* Resubmit Confirmation Dialog */}
        <Dialog
          open={resubmitConfirmOpen}
          onOpenChange={(nextOpen) => !nextOpen && setResubmitConfirmOpen(false)}
        >
          <DialogContent className="sm:max-w-md border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-foreground">
                Request Resubmission
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                This will delete the current submission for{' '}
                <span className="font-medium text-foreground">
                  {resubmitSubmission?.applicant?.name || 'this candidate'}
                </span>{' '}
                and resend the task assignment email using the previous deadline. The candidate will be able to submit a new link.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              <EmailTemplateSelect
                category="JOB_TASKS"
                value={resubmitTemplateId}
                onChange={(id) => setResubmitTemplateId(id)}
                label="Resubmission Notification Email Template"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResubmitConfirmOpen(false)}
                disabled={resubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleResubmitConfirm}
                disabled={resubmitting}
                className="gap-1.5 bg-accent hover:bg-accent"
              >
                {resubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    Resend Task
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  )
}
