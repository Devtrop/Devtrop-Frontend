import React from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard/DashboardLayout'
import { ErrorBoundary, DashboardErrorFallback } from '@/components/ErrorBoundary'

export const metadata = {
  title: 'Dashboard | RiseTogether',
  description: 'Role-based operational dashboard for RiseTogether Workspace',
}

export default function AppDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={<DashboardErrorFallback />}>
      <DashboardLayout>{children}</DashboardLayout>
    </ErrorBoundary>
  )
}
