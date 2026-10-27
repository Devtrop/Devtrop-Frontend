import React from 'react'
import type { Metadata } from 'next'
import { SupportView } from '@/components/dashboard/views/SupportView'

export const metadata: Metadata = {
  title: 'Help & Documentation | RiseTogether Dashboard',
  description: 'Frequently asked questions, platform usage guides, and recruitment support.',
}

export default function SupportPage() {
  return <SupportView />
}
