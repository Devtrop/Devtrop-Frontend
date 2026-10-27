import React from 'react'
import type { Metadata } from 'next'
import { SettingsView } from '@/components/dashboard/views/SettingsView'

export const metadata: Metadata = {
  title: 'Account Settings | RiseTogether Dashboard',
  description: 'Manage your personal profile, notification preferences, and security credentials.',
}

export default function SettingsPage() {
  return <SettingsView />
}
