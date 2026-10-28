import React from 'react'
import type { Metadata } from 'next'
import { OnboardingHub } from '@/components/dashboard/onboarding/OnboardingHub'

export const metadata: Metadata = {
  title: 'Onboarding & Documents | RiseTogether Dashboard',
  description:
    'Manage candidate offers, signed agreements, document verification, and orientation onboarding.',
}

export default function OnboardingPage() {
  return <OnboardingHub />
}
