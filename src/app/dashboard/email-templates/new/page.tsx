import React from 'react'
import type { Metadata } from 'next'
import { EmailMessageEditor } from '@/components/dashboard/email-templates/EmailMessageEditor'

export const metadata: Metadata = {
  title: 'New Email Message | RiseTogether Dashboard',
}

export default function NewEmailMessagePage() {
  return <EmailMessageEditor />
}
