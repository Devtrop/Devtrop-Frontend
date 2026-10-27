import React from 'react'
import type { Metadata } from 'next'
import { ClientsView } from '@/components/dashboard/views/ClientsView'

export const metadata: Metadata = {
  title: 'Clients | RiseTogether Dashboard',
  description: 'Manage client logos displayed on the homepage.',
}

export default function ClientsPage() {
  return <ClientsView />
}
