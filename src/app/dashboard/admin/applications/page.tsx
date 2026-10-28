import React from 'react'
import type { Metadata } from 'next'
import { ApplicationsView } from '@/components/dashboard/views/ApplicationsView'

export const metadata: Metadata = {
  title: 'Applications | Rise Together Dashboard',
  description: 'Review and manage job applications from candidates.',
}

export default function AdminApplicationsPage() {
  return <ApplicationsView />
}
