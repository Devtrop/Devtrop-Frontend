'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const OnboardingHub = dynamic(
  () => import('@/components/dashboard/onboarding/OnboardingHub').then((mod) => mod.OnboardingHub),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    ),
  },
)

export function OnboardingView() {
  return <OnboardingHub />
}
