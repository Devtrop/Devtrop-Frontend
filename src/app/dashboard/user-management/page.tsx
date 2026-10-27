import React from 'react'
import type { Metadata } from 'next'
import { UserManagementView } from '@/components/dashboard/views/UserManagementView'

export const metadata: Metadata = {
  title: 'User Management | RiseTogether Dashboard',
  description:
    'Manage system users — view profiles, update status, assign roles, and deactivate accounts.',
}

export default function UserManagementPage() {
  return <UserManagementView />
}
