import React from 'react'
import type { Metadata } from 'next'
import { ClosedApplicationsView } from '@/components/dashboard/views/ClosedApplicationsView'

export const metadata: Metadata = {
  title: 'Closed Applications | Rise Together Dashboard',
  description: 'Archive and review closed job applications.',
}

export default function AdminClosedApplicationsPage() {
  return <ClosedApplicationsView />
}
