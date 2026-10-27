'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CalendarClock, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { getJobTasks, type JobTask } from '@/lib/job-tasks'
import { assignTaskToApplications } from '@/lib/task-assignments'
import { EmailTemplateSelect } from '@/components/dashboard/email-templates/EmailTemplateSelect'
import { HeroDateTimePicker } from '@/components/ui/hero-date-time-picker'

import type { Application } from './ApplicationsHub'

interface AssignTaskModalProps {
  open: boolean
  selectedApplications: Application[]
  onClose: () => void
  onComplete: () => void
}

function formatDate(date: string) {
  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)
}

export function AssignTaskModal({
  open,
  selectedApplications,
  onClose,
  onComplete,
}: AssignTaskModalProps) {
  const [tasks, setTasks] = useState<JobTask[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [deadline, setDeadline] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [templateId, setTemplateId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const commonJob = useMemo(() => {
    if (selectedApplications.length === 0) {
      return null
    }

    const firstJob = selectedApplications[0].job

    const allSameJob = selectedApplications.every(
      (application) => application.job.id === firstJob.id,
    )

    return allSameJob ? firstJob : null
  }, [selectedApplications])

  const loadTasks = useCallback(async () => {
    if (!commonJob) {
      setTasks([])
      return
    }

    try {
      setLoadingTasks(true)
      setError(null)

      const result = await getJobTasks()

      const taskList = Array.isArray(result)
        ? result
        : Array.isArray((result as { data?: JobTask[] } | undefined)?.data)
          ? ((result as { data?: JobTask[] }).data ?? [])
          : []

      const jobTasks = taskList.filter((task) => task.jobId === commonJob.id)

      setTasks(jobTasks)

      if (jobTasks.length === 0) {
        setError('No tasks found for this job. Create a job task first.')
      }
    } catch (err) {
      setTasks([])
      setError(err instanceof Error ? err.message : 'Failed to load tasks.')
    } finally {
      setLoadingTasks(false)
    }
  }, [commonJob])

  useEffect(() => {
    if (!open) {
      return
    }

    setSelectedTaskId('')
    setDeadline('')
    setError(null)

    void loadTasks()
  }, [open, loadTasks])

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null

  const mixedJobWarning = selectedApplications.length > 1 && !commonJob

  const handleSubmit = async () => {
    if (!commonJob) {
      toast.error('Selected applications must belong to the same job.')
      return
    }

    if (!selectedTaskId) {
      toast.error('Please select a task.')
      return
    }

    if (!deadline) {
      toast.error('Please select a deadline.')
      return
    }

    const expiresAt = new Date(deadline)

    if (Number.isNaN(expiresAt.getTime())) {
      toast.error('Invalid deadline.')
      return
    }

    if (expiresAt <= new Date()) {
      toast.error('Deadline must be a future date.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const result = await assignTaskToApplications(commonJob.id, {
        applicationIds: selectedApplications.map((application) => application.id),
        expiresAt: expiresAt.toISOString(),
        templateId: templateId || undefined,
      })

      if (result?.results) {
        const succeeded = result.results.filter((item) => !item.error)
        const failed = result.results.filter((item) => item.error)

        if (failed.length > 0 && succeeded.length > 0) {
          toast.warning(`Partial success: ${succeeded.length} assigned, ${failed.length} failed.`)
        } else if (failed.length > 0) {
          toast.error(
            `Failed: ${failed.map((item) => item.error || item.applicantEmail).join(', ')}`,
          )
          return
        } else {
          toast.success(
            `Task assigned and ${result.emailsSent ?? succeeded.length} email(s) sent successfully.`,
          )
        }
      } else {
        toast.success('Task assigned successfully.')
      }

      onComplete()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to assign task.'

      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && !isSubmitting && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Send Task</DialogTitle>

          <DialogDescription className="text-xs text-muted-foreground">
            Send a job task to the selected applicant(s). An email will be sent automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {mixedJobWarning && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />

              <div>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  Different jobs selected
                </p>

                <p className="mt-1 text-muted-foreground">
                  Please select applications from the same job to assign a task.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Selected Applicants ({selectedApplications.length})
            </Label>

            <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-muted/30">
              {selectedApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between gap-3 border-b border-border/50 px-3 py-2 text-xs last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {application.applicant.name}
                    </p>

                    <p className="truncate text-[10px] text-muted-foreground">
                      {application.applicant.email}
                    </p>
                  </div>

                  <div className="shrink-0 text-[10px] text-muted-foreground">
                    {application.job.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {commonJob && (
            <div className="p-3 rounded-lg border border-border bg-muted/20">
              <EmailTemplateSelect
                category="JOB_TASKS"
                value={templateId}
                onChange={(id) => setTemplateId(id)}
                label="Task Notification Email Template"
              />
            </div>
          )}

          {commonJob && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Job</Label>

              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs font-medium text-foreground">
                {commonJob.title}

                {commonJob.jobCode && (
                  <span className="ml-1.5 text-muted-foreground">#{commonJob.jobCode}</span>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Select Task <span className="text-destructive">*</span>
            </Label>

            {loadingTasks ? (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Loading tasks...
              </div>
            ) : error && tasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                {error}
              </div>
            ) : (
              <Select
                value={selectedTaskId}
                onValueChange={setSelectedTaskId}
                disabled={isSubmitting || !commonJob}
              >
                <SelectTrigger className="h-9 border-border bg-background text-xs">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>

                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <HeroDateTimePicker
            label="Deadline"
            isRequired
            value={deadline}
            onChange={setDeadline}
            disabled={isSubmitting || !commonJob}
            minValue={new Date().toISOString().slice(0, 10)}
            className="w-full"
          />

          {selectedTask && (
            <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-3 text-xs">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Title</p>

                <p className="mt-1 font-medium text-foreground">{selectedTask.title}</p>
              </div>

      
            </div>
          )}

          {deadline && (
            <div className="text-[11px] text-muted-foreground">
              Deadline: {formatDate(new Date(deadline).toISOString())}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !selectedTaskId || !commonJob || !deadline}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                Send Task
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
