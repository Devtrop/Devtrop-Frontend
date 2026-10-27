'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Mail, Settings2, RotateCcw } from 'lucide-react'
import { useOnboardingContext } from '@/contexts/OnboardingContext'

interface OnboardingHeaderProps {
  onOpenTemplates: () => void
  onOpenBulkOffer: () => void
  onOpenBulkOrientation: () => void
}

export function OnboardingHeader({
  onOpenTemplates,
  onOpenBulkOffer,
  onOpenBulkOrientation,
}: OnboardingHeaderProps) {
  const { fetchCandidates, loading } = useOnboardingContext()
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 w-full">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Onboarding Hub
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl">
          Manage candidate offers, review submitted agreements and identity documents, and dispatch
          orientation credentials.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchCandidates(true)}
          disabled={loading}
          className="gap-1.5 cursor-pointer border-border hover:bg-muted text-xs h-8 px-3 rounded-xl flex-1 sm:flex-initial"
          title="Refresh Candidates"
        >
          <RotateCcw
            className={`size-3.5 ${loading ? 'animate-spin text-emerald-500' : 'text-emerald-500'}`}
          />
          <span>Refresh</span>
        </Button>
        {/* Default Templates Configuration Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenTemplates}
          className="gap-1.5 cursor-pointer border-border hover:bg-muted text-xs h-8 px-3 rounded-xl flex-1 sm:flex-initial"
        >
          <Settings2 className="size-3.5 text-emerald-500" />
          <span>Default Templates</span>
        </Button>

        {/* Send / Resend Offer Email Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenBulkOffer}
          className="gap-1.5 cursor-pointer border-border hover:bg-muted text-xs h-8 px-3 rounded-xl flex-1 sm:flex-initial"
        >
          <Mail className="size-3.5 text-emerald-500" />
          <span>Send / Resend Offer</span>
        </Button>

        {/* Send / Resend Orientation Button */}
        <Button
          size="sm"
          onClick={onOpenBulkOrientation}
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-sm text-xs h-8 px-3.5 rounded-xl w-full sm:w-auto"
        >
          <FileText className="size-3.5" />
          <span>Send / Resend Orientation</span>
        </Button>
      </div>
    </div>
  )
}
