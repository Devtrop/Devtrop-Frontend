'use client'

import React, { useState } from 'react'
import { toast } from '@/lib/toast'
import { RotateCcw, Loader2 } from 'lucide-react'
import { EmailTemplateSelect } from '@/components/dashboard/email-templates/EmailTemplateSelect'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestDocumentResubmission } from '@/lib/onboarding'
import type { OnboardingCandidate } from '@/lib/onboarding'

interface RequestResubmissionModalProps {
  candidate: OnboardingCandidate | null
  open: boolean
  onOpenChange: (openState: boolean) => void
  onSuccess: () => void
}

export function RequestResubmissionModal({
  candidate,
  open,
  onOpenChange,
  onSuccess,
}: RequestResubmissionModalProps) {
  const [notes, setNotes] = useState('')
  const [expiresInDays, setExpiresInDays] = useState(7)
  const [submitting, setSubmitting] = useState(false)
  const [templateId, setTemplateId] = useState<string>('')

  if (!candidate) return null

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!notes.trim()) {
      toast.error('Please specify what documents or corrections are required.')
      return
    }

    try {
      setSubmitting(true)
      const res = await requestDocumentResubmission(candidate.id, {
        notes: notes.trim(),
        expiresInDays,
        templateId: templateId || undefined,
      })

      toast.success(
        res.message || `Resubmission request sent to ${candidate.applicant?.name || 'candidate'}`,
      )
      onOpenChange(false)
      setNotes('')
      onSuccess()
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to request document resubmission'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border text-foreground p-0 overflow-hidden rounded-none">
        <form onSubmit={handleSubmit}>
          {/* Header matching SendOfferModal and SendOrientationModal */}
          <DialogHeader className="p-5 border-b border-border/80 bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-none bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground">
                  Request Document Resubmission
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Re-opens upload portal and notifies candidate to replace invalid files.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-5 space-y-4">
            {/* Email Template Selector */}
            <div className="p-3 rounded-none border border-border/80 bg-muted/20">
              <EmailTemplateSelect
                category="ONBOARDING_RESUBMIT"
                value={templateId}
                onChange={(id) => setTemplateId(id)}
                label="Resubmission Email Template"
              />
            </div>
            {/* Selected Candidates Pills */}
            <div className="p-3 rounded-none border border-border/80 bg-muted/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Recipients</span>
                <span className="text-[11px] font-semibold text-foreground">1 candidate</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-none text-[11px] font-medium bg-background border border-border/70 text-foreground">
                  {candidate.applicant?.name}
                </span>
              </div>
            </div>

            {/* Corrections Needed / Instructions */}
            <div className="space-y-1.5">
              <Label htmlFor="resubmit-notes" className="text-xs font-semibold text-foreground">
                Corrections Needed / Instructions <span className="text-rose-400">*</span>
              </Label>
              <Textarea
                id="resubmit-notes"
                required
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="e.g. Please re-upload a clear copy of the back of your National ID and a recent electricity bill from the last 3 months."
                className="text-xs resize-none"
              />
            </div>

            {/* Expiry inline */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground">Upload Link Expiry:</span>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={expiresInDays}
                  onChange={(event) =>
                    setExpiresInDays(Math.max(1, Number(event.target.value) || 7))
                  }
                  className="w-14 h-7 text-xs text-center font-mono"
                />
                <span className="text-muted-foreground">days</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 pb-6 border-t border-border/80 bg-muted/20 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="text-xs h-8 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !notes.trim()}
              className="text-xs h-8 gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="size-3.5" />
                  <span>Request Resubmission</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
