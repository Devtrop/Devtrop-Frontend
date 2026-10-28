import React from 'react'
import type { Metadata } from 'next'
import { NotificationsView } from '@/components/dashboard/views/NotificationsView'

export const metadata: Metadata = {
  title: 'Notifications & Feed | RiseTogether Dashboard',
  description: 'Real-time alerts, slot bookings, and system security events.',
}

export default function NotificationsPage() {
  return <NotificationsView />
}
