import React from 'react'
import type { Metadata } from 'next'
import { EmailLayoutEditor } from '@/components/dashboard/email-templates/EmailLayoutEditor'

export const metadata: Metadata = {
  title: 'Edit Layout | RiseTogether Dashboard',
}

export default async function EditEmailLayoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EmailLayoutEditor layoutId={id} />
}
