import React from 'react'
import type { Metadata } from 'next'
import { DatabaseBackupsView } from '@/components/dashboard/backups/DatabaseBackupsView'

export const metadata: Metadata = {
  title: 'Database Backups | RiseTogether Dashboard',
  description:
    'Manage automated cloud backups, trigger manual database snapshots, and restore database state.',
}

export default function DatabaseBackupsPage() {
  return <DatabaseBackupsView />
}
