import React from 'react'
import type { Metadata } from 'next'
import { InterviewsView } from '@/components/dashboard/views/InterviewsView'

export const metadata: Metadata = {
  title: 'Interview Hub | RiseTogether Dashboard',
  description:
    'Manage slot availability, candidate invitations, and technical evaluations in real-time.',
}

export default function InterviewsPage() {
  return <InterviewsView />
}
