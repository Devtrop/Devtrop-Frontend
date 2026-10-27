import React from 'react'
import type { Metadata } from 'next'
import { CreateJobTaskView } from '@/components/dashboard/views/CreateJobTaskView'

export const metadata: Metadata = {
  title: 'Create Job Task | RiseTogether Dashboard',
  description: 'Create a new task for a job posting.',
}

export default function CreateJobTaskPage() {
  return <CreateJobTaskView />
}
