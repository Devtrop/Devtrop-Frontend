import React from 'react'
import type { Metadata } from 'next'
import { TaskSubmissionsView } from '@/components/dashboard/views/TaskSubmissionsView'

export const metadata: Metadata = {
  title: 'Task Submissions | RiseTogether Dashboard',
  description: 'Review and manage candidate job task submissions.',
}

export default function AdminTaskSubmissionsPage() {
  return <TaskSubmissionsView />
}
