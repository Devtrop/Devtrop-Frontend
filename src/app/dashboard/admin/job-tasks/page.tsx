import React from 'react'
import type { Metadata } from 'next'
import { JobTasksView } from '@/components/dashboard/views/JobTasksView'

export const metadata: Metadata = {
  title: 'Job Tasks Management | RiseTogether Dashboard',
  description: 'Create, manage, and track technical tasks for job postings.',
}

export default function AdminJobTasksPage() {
  return <JobTasksView />
}
