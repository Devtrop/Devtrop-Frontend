'use client'

import React from 'react'
import { FileSpreadsheet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ApplicantsHeaderProps {
  onExport: () => void
  isExporting: boolean
  totalCount?: number
}

export function ApplicantsHeader({
  onExport,
  isExporting,
  totalCount,
}: ApplicantsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-5">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Applicants
          </h1>
          {totalCount !== undefined && (
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent border border-accent">
              {totalCount} Total
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage and export candidate profiles and their application information.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Button
          onClick={onExport}
          disabled={isExporting}
          className="bg-accent hover:bg-accent text-white font-medium transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isExporting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="size-4" />
              <span>Export Applicants</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
