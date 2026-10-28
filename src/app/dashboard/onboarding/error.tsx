'use client'

import React, { useEffect } from 'react'
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Onboarding route error:', error)
  }, [error])

  return (
    <div className="min-h-[55vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 text-center space-y-4 shadow-sm">
        <div className="size-12 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="size-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-foreground">Onboarding Hub Error</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error.message || 'An unexpected error occurred while loading the onboarding hub.'}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Button onClick={() => reset()} size="sm" className="gap-2 cursor-pointer">
            <RefreshCw className="size-3.5" /> Try Again
          </Button>

          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
              <LayoutDashboard className="size-3.5" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
