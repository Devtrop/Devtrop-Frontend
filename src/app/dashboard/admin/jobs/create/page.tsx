import React from 'react'
import type { Metadata } from 'next'
import { CreateJobView } from '@/components/dashboard/views/CreateJobView'

export const metadata: Metadata = {
  title: 'Create Job | RiseTogether Dashboard',
  description: 'Create a new job posting and publish it for candidates.',
}

export default function CreateJobPage() {
  return <CreateJobView />
}
