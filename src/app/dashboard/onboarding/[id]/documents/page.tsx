import React from 'react'
import type { Metadata } from 'next'
import { CandidateDocumentsViewer } from '@/components/dashboard/onboarding/CandidateDocumentsViewer'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { OnboardingSkeleton } from '@/components/dashboard/onboarding/OnboardingSkeleton'

export const metadata: Metadata = {
  title: 'Candidate Documents | RiseTogether Dashboard',
  description: 'Inspect and verify candidate onboarding documents and agreements.',
}

export default function CandidateDocumentsPage() {
  return (
    <RoleGuard
      permissions={['onboarding.read', 'application.read']}
      fallback={<OnboardingSkeleton />}
    >
      <CandidateDocumentsViewer />
    </RoleGuard>
  )
}
