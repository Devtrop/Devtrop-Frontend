import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { EmailTemplatesView } from '@/components/dashboard/views/EmailTemplatesView'

export const metadata: Metadata = {
  title: 'Email Templates | RiseTogether Dashboard',
  description: 'Manage recruitment email templates, automated notifications, and message content.',
}

export default function EmailTemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs text-muted-foreground">
          Loading email templates...
        </div>
      }
    >
      <EmailTemplatesView />
    </Suspense>
  )
}
