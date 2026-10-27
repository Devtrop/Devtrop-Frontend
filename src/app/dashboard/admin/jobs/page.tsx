import React from 'react'
import type { Metadata } from 'next'
import { JobsView } from '@/components/dashboard/views/JobsView'

export const metadata: Metadata = {
  title: 'Jobs Management | RiseTogether Dashboard',
  description: 'Create, manage, and track job postings and their applications.',
}

export default function AdminJobsPage() {
  return <JobsView />
}
