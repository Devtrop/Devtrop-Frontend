'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { getApplicationById, updateApplicationStatus, downloadDocument } from '@/lib/applications'
import { AdminSectionSkeleton } from '@/components/dashboard/admin/AdminSectionSkeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Download,
  Loader2,
  Briefcase,
  Calendar,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react'
import type { ApplicationStatus, ApplicationStatusHistory } from '@/types/job'
import { ApplicationStatusTimeline } from './ApplicationStatusTimeline'

interface Application {
  id: string
  applicationCode: string
  status: string
  appliedAt: string
  applicant: {
    id: string
    name: string
    email: string
    phone: string
    address?: string
    github: string
    portfolio: string
    linkedin: string
  }
  job: {
    id: string
    title: string
    jobCode: string
  }
  applicationStatusHistories?: ApplicationStatusHistory[]
  documents: Array<{
    id: string
    type: string
    storageKey: string
    mimeType: string
    size: number
  }>
}

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const applicationId = params.id

  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | ''>('')
  const [copiedCode, setCopiedCode] = useState(false)

  const handleCopyApplicationCode = async () => {
    if (!application?.applicationCode) return
    try {
      await navigator.clipboard.writeText(application.applicationCode)
      setCopiedCode(true)
      toast.success(`Application code #${application.applicationCode} copied!`)
      setTimeout(() => setCopiedCode(false), 2500)
    } catch {
      toast.error('Failed to copy application code')
    }
  }

  useEffect(() => {
    async function loadApplication() {
      try {
        setLoading(true)
        setError('')

        const data = await getApplicationById(applicationId)
        setApplication(data as Application)
        setSelectedStatus((data as Application).status as ApplicationStatus)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load application')
      } finally {
        setLoading(false)
      }
    }

    if (applicationId) {
      loadApplication()
    }
  }, [applicationId])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      APPLIED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      SELECTED: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      TASK_ASSIGNED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      TASK_SUBMITTED: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      INTERVIEW_SELECTED:
        'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      INTERVIEW_SCHEDULED:
        'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      INTERVIEW_COMPLETED: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      HIRED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      REJECTED: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      CLOSED: 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20',
    }
    return colors[status] || 'bg-muted text-muted-foreground border-border'
  }

  const handleUpdateStatus = async () => {
    if (!selectedStatus || !application) return
    if (selectedStatus === application.status) {
      toast.info('Please select a different status')
      return
    }

    try {
      setUpdating(true)
      const updated = await updateApplicationStatus(applicationId, selectedStatus)

      // Update local state
      setApplication({
        ...application,
        status: selectedStatus,
        applicationStatusHistories: updated?.applicationStatusHistories || [
          {
            id: String(Date.now()),
            status: selectedStatus,
            changedAt: new Date().toISOString(),
            changedBy: 'ADMIN',
          },
          ...(application.applicationStatusHistories || []),
        ],
      })

      toast.success(selectedStatus === 'CLOSED' ? 'Application marked as closed!' : 'Application status updated successfully!')
      if (selectedStatus === 'CLOSED') {
        router.push('/dashboard/admin/applications/closed')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleDownloadDocument = async (doc: Application['documents'][0]) => {
    if (!application) return

    try {
      // Extract filename from storageKey (format: applications/uuid/filename.pdf)
      const pathParts = doc.storageKey.split('/')
      const filename = pathParts[pathParts.length - 1]

      if (!filename) {
        toast.error('Invalid document filename')
        return
      }

      // Create custom display name: ApplicantName_DocumentType.extension
      const fileExtension = filename.substring(filename.lastIndexOf('.'))
      const displayName = `${application.applicant.name.replace(/\s+/g, '_')}_${doc.type}${fileExtension}`

      console.log('Download request:', {
        applicationId,
        documentType: doc.type,
        storageKey: doc.storageKey,
        extractedFilename: filename,
        displayName,
      })

      await downloadDocument(applicationId, filename, displayName)
      toast.success('Document downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to download document'

      // Show user-friendly error
      if (errorMessage.includes('File not found')) {
        toast.error('Document not found. It may have been deleted or moved.')
      } else if (errorMessage.includes('404')) {
        toast.error('Document not found on server.')
      } else {
        toast.error(errorMessage)
      }
    }
  }

  if (loading) {
    return <AdminSectionSkeleton titleWidth="w-56" />
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-lg border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <p className="font-semibold text-destructive">Error</p>
            <p className="mt-2 text-sm text-muted-foreground">{error || 'Application not found'}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/admin/applications')}
              className="mt-4 gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              Back to Applications
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/admin/applications')}
            className="gap-1.5 w-fit h-8 px-2 text-xs hover:bg-muted"
          >
            <ArrowLeft className="size-3.5" />
            Back to Applications
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {application.applicant.name}
                </h1>
                {application.applicationCode && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold">
                    <span>App Code: #{application.applicationCode}</span>
                    <button
                      type="button"
                      onClick={handleCopyApplicationCode}
                      className="text-emerald-600 dark:text-emerald-400 hover:opacity-75 p-0.5 cursor-pointer"
                      title="Copy application code"
                    >
                      {copiedCode ? <Check className="size-3" /> : <Copy className="size-3" />}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                <span>
                  Applied{' '}
                  {new Date(application.appliedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-medium px-3 py-1.5 ${getStatusColor(application.status)}`}
            >
              {application.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="space-y-6 lg:col-span-2">
            {/* Job Info */}
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="size-4 text-muted-foreground" />
                  Job Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/dashboard/admin/jobs/${application.job.id}/applications`}
                  className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  {application.job.title}
                </Link>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Job Code: <span className="font-mono">#{application.job.jobCode}</span>
                </p>
              </CardContent>
            </Card>

            {/* Applicant Info */}
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Applicant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Full Name</p>
                    <p className="text-sm font-medium text-foreground">
                      {application.applicant.name}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Email Address</p>
                      <a
                        href={`mailto:${application.applicant.email}`}
                        className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline break-all"
                      >
                        {application.applicant.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-muted-foreground">Phone Number</p>
                      <a
                        href={`tel:${application.applicant.phone}`}
                        className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {application.applicant.phone}
                      </a>
                    </div>
                  </div>

                  {application.applicant.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-muted-foreground">Address</p>
                        <p className="text-sm text-foreground">{application.applicant.address}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Online Profiles */}
                {(application.applicant.github ||
                  application.applicant.portfolio ||
                  application.applicant.linkedin) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-muted-foreground">Online Profiles</p>
                      <div className="flex flex-wrap gap-2.5">
                        {application.applicant.github && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 h-8 text-xs border-border hover:bg-muted"
                            asChild
                          >
                            <a
                              href={application.applicant.github}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <svg
                                className="size-3.5 fill-current text-foreground"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                />
                              </svg>
                              <span>View Profile</span>
                              <ExternalLink className="size-3 text-muted-foreground" />
                            </a>
                          </Button>
                        )}
                        {application.applicant.portfolio && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 h-8 text-xs border-border hover:bg-muted"
                            asChild
                          >
                            <a
                              href={application.applicant.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Globe className="size-3.5 text-emerald-500" />
                              <span>View Portfolio</span>
                              <ExternalLink className="size-3 text-muted-foreground" />
                            </a>
                          </Button>
                        )}
                        {application.applicant.linkedin && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 h-8 text-xs border-border hover:bg-muted"
                            asChild
                          >
                            <a
                              href={application.applicant.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <svg
                                className="size-3.5 fill-[#0A66C2]"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                              </svg>
                              <span>View LinkedIn</span>
                              <ExternalLink className="size-3 text-muted-foreground" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Status History Timeline Card */}
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  Application Status History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ApplicationStatusTimeline
                  history={application.applicationStatusHistories || []}
                  maxHeight="max-h-80"
                  className="p-0 border-0 bg-transparent"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Documents */}
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {application.documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No documents uploaded
                  </p>
                ) : (
                  <div className="space-y-2">
                    {application.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                            <FileText className="size-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-foreground">
                              {doc.type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {(doc.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0 shrink-0"
                          title={`Download ${doc.type}`}
                          onClick={() => handleDownloadDocument(doc)}
                        >
                          <Download className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="status" className="text-xs font-medium text-muted-foreground">
                    Select New Status
                  </label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => setSelectedStatus(value as ApplicationStatus)}
                    disabled={updating || loading}
                  >
                    <SelectTrigger className="h-9 text-xs border-border bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APPLIED">Applied</SelectItem>
                      <SelectItem value="SELECTED">Selected</SelectItem>
                      <SelectItem value="TASK_ASSIGNED">Task Assigned</SelectItem>
                      <SelectItem value="TASK_SUBMITTED">Task Submitted</SelectItem>
                      <SelectItem value="INTERVIEW_SELECTED">Interview Ready</SelectItem>
                      <SelectItem value="INTERVIEW_SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="INTERVIEW_COMPLETED">Completed</SelectItem>
                      <SelectItem value="HIRED">Hired</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleUpdateStatus}
                  disabled={updating || !selectedStatus || selectedStatus === application.status}
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                >
                  {updating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Status'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
