import React from 'react'
import type { Metadata } from 'next'
import { EmailMessageEditor } from '@/components/dashboard/email-templates/EmailMessageEditor'

export const metadata: Metadata = {
  title: 'Edit Email Message | RiseTogether Dashboard',
}

export default async function EditEmailMessagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EmailMessageEditor templateId={id} />
}
