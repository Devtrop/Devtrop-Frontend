'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { SanitizedHtml } from '@/components/common/SanitizedHtml'
import type { JobTask } from '@/lib/job-tasks'

interface JobTasksTableProps {
  tasks: JobTask[]
  jobNameMap: Record<string, string>
  loading: boolean
  onViewTask: (task: JobTask) => void
  onEditTask: (task: JobTask) => void
  onDeleteTask: (task: JobTask) => void
  onCreateTask: () => void
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function JobTasksTable({
  tasks,
  jobNameMap,
  loading,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onCreateTask,
}: JobTasksTableProps) {
  if (loading) {
    return (
      <div className="rounded-none border border-border bg-card overflow-hidden w-full">
        <div className="w-full p-3.5 border-b border-border/80 bg-muted/40 flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-32 rounded-none min-w-[200px] flex-1" />
          <Skeleton className="h-4 w-28 rounded-none min-w-[140px]" />
          <Skeleton className="h-4 w-20 rounded-none min-w-[100px]" />
          <Skeleton className="h-4 w-24 rounded-none min-w-[120px]" />
          <Skeleton className="h-4 w-16 rounded-none min-w-[80px]" />
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-full p-4 flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-[200px] flex-1">
                <Skeleton className="h-4 w-40 rounded-none" />
                <Skeleton className="h-3 w-48 rounded-none" />
              </div>
              <div className="min-w-[140px]">
                <Skeleton className="h-4 w-28 rounded-none" />
              </div>
              <div className="min-w-[100px]">
                <Skeleton className="h-4 w-16 rounded-none" />
              </div>
              <div className="min-w-[120px]">
                <Skeleton className="h-4 w-20 rounded-none" />
              </div>
              <div className="min-w-[80px] flex justify-end gap-1.5">
                <Skeleton className="size-7 rounded-none" />
                <Skeleton className="size-7 rounded-none" />
                <Skeleton className="size-7 rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-none border border-border bg-card p-12 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-2xl">
          📝
        </div>
        <h2 className="mt-4 text-base font-semibold text-foreground">No job tasks found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a task for a job posting to start managing assignments.
        </p>
        <Button
          size="sm"
          onClick={onCreateTask}
          className="mt-4 gap-1.5 bg-accent hover:bg-accent"
        >
          Create Task
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block rounded-none border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-3.5 bg-muted/40">
          <h2 className="text-sm font-semibold text-foreground">Job Tasks</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} available
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="min-w-48 px-3">Title</TableHead>
                <TableHead className="min-w-56 px-3">Job</TableHead>
                <TableHead className="min-w-72 px-3">Description</TableHead>
                <TableHead className="min-w-28 px-3">Created</TableHead>
                <TableHead className="min-w-32 px-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-muted/30">
                  <TableCell className="px-3 py-3">
                    <div className="font-semibold text-foreground">{task.title}</div>
                  </TableCell>

                  <TableCell className="px-3 py-3">
                    <div className="font-medium text-foreground truncate">
                      {jobNameMap[task.jobId] || (
                        <span className="text-muted-foreground italic">Unknown job</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-3 py-3">
                    <div className="max-w-md text-muted-foreground leading-5 line-clamp-2">
                      <SanitizedHtml content={task.description} />
                    </div>
                  </TableCell>

                  <TableCell className="px-3 py-3">
                    <span className="text-muted-foreground">{formatDate(task.createdAt)}</span>
                  </TableCell>

                  <TableCell className="px-3 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onViewTask(task)}
                        className="h-7 gap-1.5 text-[11px] border-border hover:bg-muted"
                      >
                        <Eye className="size-3" />
                        View
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEditTask(task)}
                        className="h-7 w-7 p-0 border-border hover:bg-muted"
                        title="Edit task"
                      >
                        <Pencil className="size-3" />
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteTask(task)}
                        className="h-7 w-7 p-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        title="Delete task"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-none border border-border bg-card p-4 space-y-3"
          >
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Task</div>
              <div className="font-semibold text-foreground">{task.title}</div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Job</div>
              <div className="font-medium text-foreground">
                {jobNameMap[task.jobId] || (
                  <span className="text-muted-foreground italic">Unknown job</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Description
              </div>
              <div className="text-xs text-muted-foreground leading-5">
                <SanitizedHtml content={task.description} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Created
              </div>
              <div className="text-xs text-foreground">{formatDate(task.createdAt)}</div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onViewTask(task)}
                className="flex-1 h-8 gap-1.5 text-xs border-border"
              >
                <Eye className="size-3.5" />
                View
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEditTask(task)}
                className="flex-1 h-8 gap-1.5 text-xs border-border"
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onDeleteTask(task)}
                className="flex-1 h-8 gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
