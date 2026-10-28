import React from 'react'
import type { Metadata } from 'next'
import { EmailLayoutEditor } from '@/components/dashboard/email-templates/EmailLayoutEditor'

export const metadata: Metadata = {
  title: 'New Layout | RiseTogether Dashboard',
}

export default function NewEmailLayoutPage() {
  return <EmailLayoutEditor />
}
