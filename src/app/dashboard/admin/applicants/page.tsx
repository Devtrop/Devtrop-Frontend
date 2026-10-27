import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { ApplicantsView } from '@/components/dashboard/applicants'
import { AdminSectionSkeleton } from '@/components/dashboard/admin/AdminSectionSkeleton'
import type { ApplicantFilters } from '@/lib/applicants'
import { getServerApplicants, getServerJobs } from '@/lib/applicants.server'

export const metadata: Metadata = {
  title: 'Applicants | Rise Together Dashboard',
  description: 'Manage, filter, and export candidate profiles and application overview.',
}

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    jobId?: string
    jobCode?: string
    dateFrom?: string
    dateTo?: string
    page?: string
  }>
}

export default async function AdminApplicantsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const filters: ApplicantFilters = {
    search: params.search || '',
    status: params.status || '',
    jobId: params.jobId || '',
    jobCode: params.jobCode || '',
    dateFrom: params.dateFrom || '',
    dateTo: params.dateTo || '',
    page: params.page ? Math.max(1, parseInt(params.page, 10) || 1) : 1,
    limit: 20,
  }

  // Fetch initial data on the server side (Server-Side Rendering)
  const [{ list: initialApplicants, meta: initialMeta }, initialJobs] = await Promise.all([
    getServerApplicants(filters),
    getServerJobs(),
  ])

  return (
    <RoleGuard permission="application.read">
      <Suspense fallback={<AdminSectionSkeleton />}>
        <ApplicantsView
          initialApplicants={initialApplicants}
          initialMeta={initialMeta}
          initialJobs={initialJobs}
          initialFilters={filters}
        />
      </Suspense>
    </RoleGuard>
  )
}
