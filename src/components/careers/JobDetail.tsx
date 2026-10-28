'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Briefcase, Clock, DollarSign, Send } from 'lucide-react'
import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Job } from '@/types/job'
import { formatJobLocation } from '@/lib/jobs'
import { applyForJob } from '@/lib/applications'
import { toast } from 'sonner'

interface JobDetailProps {
  job: Job
}

export function JobDetail({ job }: JobDetailProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    github: '',
    portfolio: '',
    linkedin: '',
    address: '',
    resume: null as File | null,
  })
  const [submitting, setSubmitting] = useState(false)

  const location = formatJobLocation(job)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!formData.github || !formData.portfolio || !formData.linkedin) {
      toast.error('Please provide your GitHub, Portfolio, and LinkedIn URLs')
      return
    }

    if (!formData.resume) {
      toast.error('Please upload your CV/Resume')
      return
    }

    setSubmitting(true)
    
    try {
      const response = await applyForJob(job.id, {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        github: formData.github,
        portfolio: formData.portfolio,
        linkedin: formData.linkedin,
        address: formData.address,
        cv: formData.resume,
      })

      // Extract application code from response
      const responseData = (response as any)?.data || response
      const applicationCode = responseData?.applicationCode || 'N/A'

      // Show success message
      toast.success(`Application submitted successfully! Your application code is #${applicationCode}`)

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        github: '',
        portfolio: '',
        linkedin: '',
        address: '',
        resume: null,
      })

      // Redirect to careers page after a short delay
      setTimeout(() => {
        router.push('/careers')
      }, 2000)
    } catch (error: any) {
      console.error('Application submission error:', error)
      toast.error(error?.message || 'Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative border-b-4 border-display">
      <div className="absolute inset-0 swiss-grid-pattern opacity-30 pointer-events-none" />

      <SectionContainer className="relative z-10 py-12 lg:py-20">
        {/* Back link */}
        <Link
          href="/careers"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-display hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="size-4" />
          Back to Careers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left: Job Details */}
          <div className="lg:col-span-2">
            {/* Job Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-display leading-tight">
              {job.title}
            </h1>

            {/* Meta */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted pb-6 border-b-2 border-display">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" />
                <span>{location}</span>
              </div>
              {job.experience && (
                <div className="flex items-center gap-2">
                  <Briefcase className="size-4 shrink-0" />
                  <span>{job.experience}</span>
                </div>
              )}
              {job.deadline && (
                <div className="flex items-center gap-2">
                  <Clock className="size-4 shrink-0" />
                  <span>
                    Deadline:{' '}
                    {new Date(job.deadline).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {job.salaryRange && (
                <div className="flex items-center gap-2">
                  <DollarSign className="size-4 shrink-0" />
                  <span>{job.salaryRange}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {job.description && (
              <div className="mt-8">
                <h2 className="text-2xl font-black uppercase tracking-tight text-display mb-4">
                  Job Description
                </h2>
                <div
                  className="prose prose-sm max-w-none text-body leading-relaxed [&_h2]:text-xl [&_h2]:font-black [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-display [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-display [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-2 [&_li]:text-muted [&_p]:mb-4"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="mt-8">
                <h2 className="text-2xl font-black uppercase tracking-tight text-display mb-4">
                  Requirements
                </h2>
                <div
                  className="prose prose-sm max-w-none text-body leading-relaxed [&_h2]:text-xl [&_h2]:font-black [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-display [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-display [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-2 [&_li]:text-muted [&_p]:mb-4"
                  dangerouslySetInnerHTML={{ __html: job.requirements }}
                />
              </div>
            )}
          </div>

          {/* Right: Application Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border-2 border-display bg-canvas p-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-display mb-6">
                Apply Now
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-body mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="border-2 border-display focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-body mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-2 border-display focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-body mb-2">
                    Phone *
                  </label>
                  <Input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="border-2 border-display focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-body mb-2">
                    GitHub Profile *
                  </label>
                  <Input
                    type="url"
                    required
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="border-2 border-display focus:ring-accent"
                    placeholder="https://github.com/username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-body mb-2">
                    Portfolio URL *
                  </label>
                  <Input
                    type="url"
                    required
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    className="border-2 border-display focus:ring-accent"
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-body mb-2">
                    LinkedIn Profile *
                  </label>
                  <Input
                    type="url"
                    required
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="border-2 border-display focus:ring-accent"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-body mb-2">
                    Address
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="border-2 border-display focus:ring-accent"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-body mb-2">
                    CV/Resume *
                  </label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, resume: e.target.files?.[0] || null })
                    }
                    className="border-2 border-display"
                  />
                  <p className="mt-1 text-xs text-muted">PDF, DOC, or DOCX (Max 5MB)</p>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full gap-2 h-11 text-sm font-bold uppercase tracking-wider"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                  <Send className="size-4" />
                </Button>
              </form>

              <p className="mt-4 text-xs text-muted">
                By submitting this form, you agree to our privacy policy and consent to be
                contacted about this position.
              </p>
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  )
}
