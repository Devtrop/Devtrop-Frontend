'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Eye, Users, X, ExternalLink, Loader2 } from 'lucide-react'
import { BrandLoader } from '@/components/ui/BrandLoader'

interface Applicant {
  id: string
  name: string
  email: string
  phone?: string
}

interface Application {
  id: string
  applicationCode?: string
  status: string
  appliedAt: string
  applicant: Applicant
}

interface Props {
  jobId: string
  jobTitle: string
  isOpen: boolean
  onClose: () => void
}

export default function JobApplicationsModal({ jobId, jobTitle, isOpen, onClose }: Props) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!isOpen) return

    async function loadApplications() {
      try {
        setLoading(true)

        const response = await api.get<any>(`/applications/admin/jobs/${jobId}`, {
          page: 1,
          limit: 50,
        })

        // Backend returns { success, message, data: { data: [...], meta: {...} } }
        const responseData = response.data || response
        const applicationsData = Array.isArray(responseData.data)
          ? responseData.data
          : Array.isArray(responseData)
            ? responseData
            : []
        const metaData = responseData.meta || { total: 0, page: 1, limit: 50, totalPages: 1 }

        setApplications(applicationsData)
        setTotal(metaData.total)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load applications')
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [jobId, isOpen])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      APPLIED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      SELECTED: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      TASK_ASSIGNED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      TASK_SUBMITTED: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      INTERVIEW_SCHEDULED:
        'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      INTERVIEW_COMPLETED: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      HIRED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      REJECTED: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      CLOSED: 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20',
    }
    return (
      colors[status] || 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0 border-border bg-card">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border space-y-1">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold text-foreground">
                Job Applications
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {jobTitle}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 px-6 py-4" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <BrandLoader size="sm" message="Loading applications..." />
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted text-3xl">
                📄
              </div>
              <div className="text-center">
                <h3 className="text-base font-semibold text-foreground">No applications yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No candidates have applied for this job yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats Bar */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="size-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {total} application{total !== 1 ? 's' : ''}
                  </span>
                </div>
                <Link href={`/dashboard/admin/jobs/${jobId}/applications`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs hover:bg-background"
                  >
                    View all
                    <ExternalLink className="size-3" />
                  </Button>
                </Link>
              </div>

              <Separator className="bg-border" />

              {/* Applications List */}
              <div className="space-y-2">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card/50 transition hover:bg-muted/30 hover:border-muted-foreground/20"
                  >
                    {/* Applicant Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {application.applicant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {application.applicant.name}
                          </p>
                          {application.applicationCode && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              #{application.applicationCode}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {application.applicant.email}
                        </p>
                        {application.applicant.phone && (
                          <p className="text-xs text-muted-foreground">
                            {application.applicant.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status & Action */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium px-2 py-0.5 ${getStatusColor(application.status)}`}
                      >
                        {application.status.replace(/_/g, ' ')}
                      </Badge>
                      <Link href={`/dashboard/admin/applications/${application.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1.5 text-xs border-border hover:bg-muted"
                        >
                          <Eye className="size-3" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs border-border hover:bg-muted"
            >
              Close
            </Button>
            <Link href={`/dashboard/admin/jobs/${jobId}/applications`}>
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
              >
                View All Applications
                <ExternalLink className="size-3" />
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
