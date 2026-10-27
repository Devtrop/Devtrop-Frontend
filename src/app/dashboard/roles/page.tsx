import React from 'react'
import type { Metadata } from 'next'
import { RolesView } from '@/components/dashboard/views/RolesView'

export const metadata: Metadata = {
  title: 'Roles & Permissions | RiseTogether Dashboard',
  description: 'Create and manage dynamic roles with fine-grained permission assignments.',
}

export default function RolesPage() {
  return <RolesView />
}
