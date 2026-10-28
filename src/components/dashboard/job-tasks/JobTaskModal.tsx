'use client'

import React, { useMemo, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SanitizedHtml } from '@/components/common/SanitizedHtml'
import type { Job } from '@/types/job'
import type { JobTask } from '@/lib/job-tasks'

export type JobTaskModalMode = 'edit' | 'view'

interface JobTaskModalProps {
  open: boolean
  mode: JobTaskModalMode
  task: JobTask | null
  jobs: Job[]
  jobNameMap: Record<string, string>
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (values: { title: string; description: string }) => Promise<void>
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

export function JobTaskModal({
  open,
  mode,
  task,
  jobs,
  jobNameMap,
  isSubmitting,
  onClose,
  onSubmit,
}: JobTaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')

  const jobId = task?.jobId
  const displayJobTitle = useMemo(() => {
    if (!jobId) return null
    return jobNameMap[jobId] ?? jobs.find((j) => j.id === jobId)?.title ?? null
  }, [jobId, jobNameMap, jobs])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle) {
      toast.error('Task title is required.')
      return
    }

    if (!trimmedDescription) {
      toast.error('Task description is required.')
      return
    }

    await onSubmit({
      title: trimmedTitle,
      description: trimmedDescription,
    })
  }

  const titleText = mode === 'edit' ? 'Edit Job Task' : 'Job Task Details'

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground">{titleText}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {mode === 'edit'
              ? 'Update the task title and description.'
              : 'Review the selected task details.'}
          </DialogDescription>
        </DialogHeader>

        <form id="job-task-form" onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* View mode: job + dates */}
          {mode === 'view' && (
            <div className="space-y-2 rounded-none border border-border bg-muted/30 p-3 text-xs">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Job</p>
                <p className="mt-1 font-medium text-foreground">
                  {displayJobTitle ?? task?.jobId ?? 'Unknown job'}
                </p>
              </div>
              {task?.createdAt && (
                <div className="pt-2 border-t border-border/60">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Created
                  </p>
                  <p className="mt-1 font-medium text-foreground">{formatDate(task.createdAt)}</p>
                </div>
              )}
              {task?.updatedAt && (
                <div className="pt-2 border-t border-border/60">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Updated
                  </p>
                  <p className="mt-1 font-medium text-foreground">{formatDate(task.updatedAt)}</p>
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="job-task-title" className="text-xs font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            {mode === 'view' ? (
              <div className="rounded-none border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                {title || '—'}
              </div>
            ) : (
              <Input
                id="job-task-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={isSubmitting}
                placeholder="Backend Developer Task"
                className="h-9 text-xs border-border bg-background"
              />
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="job-task-description" className="text-xs font-medium">
              Description <span className="text-destructive">*</span>
            </Label>
            {mode === 'view' ? (
              <div className="min-h-[120px] rounded-none border border-border bg-muted/30 px-3 py-2 text-sm leading-6 text-foreground">
                <SanitizedHtml content={description} />
              </div>
            ) : (
              <Textarea
                id="job-task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={isSubmitting}
                rows={7}
                placeholder="Build a REST API using NestJS and Prisma."
                className="resize-y text-xs leading-6 border-border bg-background"
              />
            )}
          </div>
        </form>

        <DialogFooter className="gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>

          {mode !== 'view' && (
            <Button
              type="submit"
              form="job-task-form"
              size="sm"
              disabled={isSubmitting}
              className="bg-accent hover:bg-accent"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
