'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Video, X, UserX } from 'lucide-react'

interface BulkActionBarProps {
  selectedCount: number
  offerPendingCount: number
  docsSubmittedCount: number
  rejectedCount?: number
  onSendOffer: () => void
  onSendOrientation: () => void
  onSendRejection?: () => void
  onClear: () => void
}

export function BulkActionBar({
  selectedCount,
  offerPendingCount,
  docsSubmittedCount,
  rejectedCount = 0,
  onSendOffer,
  onSendOrientation,
  onSendRejection,
  onClear,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  const hasAction =
    offerPendingCount > 0 ||
    docsSubmittedCount > 0 ||
    (rejectedCount > 0 && Boolean(onSendRejection))

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 sm:gap-3 bg-canvas/95 text-muted border border-hairline-light px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-none z-50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 max-w-[95vw] overflow-x-auto">
      {/* Selected Indicator */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="size-2 rounded-full bg-accent animate-pulse" />
        <span className="text-xs font-semibold whitespace-nowrap">{selectedCount} Selected</span>
      </div>

      {hasAction && <div className="h-4 w-px bg-muted shrink-0" />}

      {/* Filtered Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {offerPendingCount > 0 && (
          <Button
            size="sm"
            onClick={onSendOffer}
            className="gap-1.5 bg-accent hover:bg-accent text-white font-medium text-xs h-8 px-3 rounded-none cursor-pointer"
          >
            <Mail className="size-3.5" />
            <span>Send / Resend Offer ({offerPendingCount})</span>
          </Button>
        )}

        {docsSubmittedCount > 0 && (
          <Button
            size="sm"
            onClick={onSendOrientation}
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs h-8 px-3 rounded-none cursor-pointer"
          >
            <Video className="size-3.5" />
            <span>Send / Resend Orientation ({docsSubmittedCount})</span>
          </Button>
        )}

        {rejectedCount > 0 && onSendRejection && (
          <Button
            size="sm"
            onClick={onSendRejection}
            className="gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs h-8 px-3 rounded-none cursor-pointer"
          >
            <UserX className="size-3.5" />
            <span>Send Rejection ({rejectedCount})</span>
          </Button>
        )}
      </div>

      <div className="h-4 w-px bg-muted shrink-0" />

      {/* Clear Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="size-7 p-0 text-muted hover:text-muted hover:bg-muted rounded-none shrink-0 cursor-pointer"
        title="Clear Selection"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  )
}
