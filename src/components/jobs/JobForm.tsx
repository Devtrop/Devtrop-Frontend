'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { DatePickerTime } from '@/components/ui/date-picker-time'
import { type CreateJobPayload, type Job, JobStatus, JobType } from '@/types/job'

// Lazy load TiptapEditor (heavy dependency)
const TiptapEditor = dynamic(
  () => import('@/components/editor/TiptapEditor').then((mod) => ({ default: mod.TiptapEditor })),
  {
    loading: () => (
      <div className="w-full min-h-[300px] rounded-md border border-input bg-muted/50 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false,
  },
)

interface Props {
  initialData?: Job
  submitLabel?: string
  onSubmit: (data: CreateJobPayload) => Promise<void>
  isEditMode?: boolean
}

export default function JobForm({
  initialData,
  submitLabel = 'Create Job',
  onSubmit,
  isEditMode = false,
}: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [jobType, setJobType] = useState<JobType>(initialData?.jobType ?? JobType.ONSITE)
  const [location, setLocation] = useState(initialData?.location ?? '')
  const [experience, setExperience] = useState(initialData?.experience ?? '')
  const [salaryRange, setSalaryRange] = useState(initialData?.salaryRange ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [requirements, setRequirements] = useState(initialData?.requirements ?? '')
  const [status, setStatus] = useState<JobStatus>(initialData?.status ?? JobStatus.DRAFT)
  const [deadline, setDeadline] = useState<Date | undefined>(
    initialData?.deadline ? new Date(initialData.deadline) : undefined,
  )

  const [loading, setLoading] = useState(false)

  const handleJobTypeChange = (value: JobType) => {
    setJobType(value)
    // Clear location when switching to remote
    if (value === JobType.REMOTE) {
      setLocation('')
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      toast.error('Job title is required.')
      return
    }

    if (jobType === JobType.ONSITE || jobType === JobType.HYBRID) {
      if (!location.trim()) {
        toast.error('Location is required for onsite and hybrid jobs')
        return
      }
    }

    if (!description.trim()) {
      toast.error('Job description is required.')
      return
    }

    try {
      setLoading(true)

      await onSubmit({
        title: title.trim(),
        jobType,
        location: jobType === JobType.REMOTE ? undefined : location.trim(),
        experience: experience.trim() || undefined,
        salaryRange: salaryRange.trim() || undefined,
        description: description.trim(),
        requirements: requirements.trim() || undefined,
        status,
        deadline: deadline ? deadline.toISOString() : undefined,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Add the main information about this job.
          </p>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-medium">
              Job Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Frontend Developer"
              disabled={loading}
              className="h-9 text-xs border-border bg-background"
            />
          </div>

          {/* Work Mode + Location */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jobType" className="text-xs font-medium">
                Work Mode <span className="text-destructive">*</span>
              </Label>
              <Select
                value={jobType}
                onValueChange={(val) => handleJobTypeChange(val as JobType)}
                disabled={loading}
              >
                <SelectTrigger id="jobType" className="h-9 text-xs border-border bg-background">
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={JobType.ONSITE}>Onsite</SelectItem>
                  <SelectItem value={JobType.HYBRID}>Hybrid</SelectItem>
                  <SelectItem value={JobType.REMOTE}>Remote</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {jobType === JobType.REMOTE && 'Displays as "Remote · Anywhere in Bangladesh".'}
                {jobType === JobType.HYBRID &&
                  'Combines office attendance with remote flexibility.'}
                {jobType === JobType.ONSITE && 'Requires working at the specified office location.'}
              </p>
            </div>

            {jobType !== JobType.REMOTE ? (
              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-medium">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="e.g. Dhaka, Bangladesh"
                  disabled={loading}
                  className="h-9 text-xs border-border bg-background"
                />
                <p className="text-[11px] text-muted-foreground">
                  City, area, or address where the job is located.
                </p>
              </div>
            ) : (
              <div className="flex flex-col justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300/90">
                <span className="font-semibold text-emerald-400">Remote Work Mode</span>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Location is omitted and automatically formatted as{' '}
                  <span className="text-foreground font-medium">
                    Remote · Anywhere in Bangladesh
                  </span>
                  .
                </p>
              </div>
            )}
          </div>

          {/* Experience + Salary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-xs font-medium">
                Experience
              </Label>
              <Input
                id="experience"
                type="text"
                value={experience}
                onChange={(event) => setExperience(event.target.value)}
                placeholder="2-3 years"
                disabled={loading}
                className="h-9 text-xs border-border bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryRange" className="text-xs font-medium">
                Salary Range
              </Label>
              <Input
                id="salaryRange"
                type="text"
                value={salaryRange}
                onChange={(event) => setSalaryRange(event.target.value)}
                placeholder="25,000 - 40,000 BDT"
                disabled={loading}
                className="h-9 text-xs border-border bg-background"
              />
            </div>
          </div>

          {/* Status + Deadline */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-xs font-medium">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as JobStatus)}
                disabled={loading}
              >
                <SelectTrigger className="h-9 text-xs border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={JobStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={JobStatus.ACTIVE}>Active</SelectItem>
                  {isEditMode && <SelectItem value={JobStatus.CLOSED}>Closed</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Application Deadline</Label>
              <DatePickerTime value={deadline} onChange={setDeadline} disabled={loading} />
              <p className="text-xs text-muted-foreground">
                Set when applications for this position will close. Leave empty for no deadline.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="bg-border" />

      {/* Description */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Job Description</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Describe the role and what the successful candidate will be doing.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-xs font-medium">
            Description <span className="text-destructive">*</span>
          </Label>
          <TiptapEditor
            content={description}
            onChange={setDescription}
            placeholder="We are looking for a frontend developer who..."
            editable={!loading}
          />
        </div>
      </section>

      <Separator className="bg-border" />

      {/* Requirements */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Requirements</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            List the skills, qualifications, and experience required for this position.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements" className="text-xs font-medium">
            Requirements
          </Label>
          <TiptapEditor
            content={requirements}
            onChange={setRequirements}
            placeholder="• Strong proficiency in React and TypeScript&#10;• Experience with Next.js and Tailwind CSS&#10;• Excellent problem-solving skills"
            editable={!loading}
          />
        </div>
      </section>

      <Separator className="bg-border" />

      {/* Submit */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={loading}
          className="h-9 text-xs border-border hover:bg-muted"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={loading}
          className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs shadow-sm"
        >
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
