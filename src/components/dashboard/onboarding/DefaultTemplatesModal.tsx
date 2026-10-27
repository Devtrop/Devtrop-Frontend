'use client'

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import {
  getDefaultTemplates,
  uploadDefaultTemplates,
  type OnboardingTemplateStatus,
} from '@/lib/onboarding'
import { toast } from '@/lib/toast'

interface DefaultTemplatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DefaultTemplatesModal({ open, onOpenChange }: DefaultTemplatesModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [templates, setTemplates] = useState<OnboardingTemplateStatus>({
    offerLetter: {
      configured: false,
      exists: false,
      storageKey: null,
      name: 'Default Offer Letter.pdf',
    },
    agreement: {
      configured: false,
      exists: false,
      storageKey: null,
      name: 'Default Employment Agreement.pdf',
    },
  })

  const [offerLetterFile, setOfferLetterFile] = useState<File | null>(null)
  const [agreementFile, setAgreementFile] = useState<File | null>(null)

  useEffect(() => {
    if (!open) return
    let isMounted = true

    const loadTemplates = async () => {
      try {
        const data = await getDefaultTemplates()
        if (isMounted) {
          setTemplates(data)
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadTemplates()

    return () => {
      isMounted = false
    }
  }, [open])

  const handleSave = async () => {
    if (!offerLetterFile && !agreementFile) {
      toast.error('Please select at least one PDF template to upload')
      return
    }

    try {
      setSaving(true)
      await uploadDefaultTemplates({
        offerLetter: offerLetterFile,
        agreement: agreementFile,
      })
      toast.success('Default templates saved! They will be used for all future candidate offers.')
      const updated = await getDefaultTemplates()
      setTemplates(updated)
      setOfferLetterFile(null)
      setAgreementFile(null)
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save templates')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-5 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-zinc-100">
                Default Offer & Agreement Templates
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                Upload your company templates once. They are automatically attached when sending
                offers.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-zinc-400 text-xs">
              <Loader2 className="size-6 animate-spin text-emerald-500 mr-2" />
              Loading template configuration...
            </div>
          ) : (
            <>
              {/* Offer Letter Box */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-zinc-200">
                      Default Offer Letter
                    </span>
                  </div>
                  {templates.offerLetter.configured ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                    >
                      <CheckCircle2 className="size-3 mr-1" /> Configured
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-amber-400 border-amber-500/30 bg-amber-500/10"
                    >
                      <AlertCircle className="size-3 mr-1" /> Not Configured
                    </Badge>
                  )}
                </div>

                {templates.offerLetter.configured && (
                  <p className="text-[11px] text-zinc-400">
                    Active in DB:{' '}
                    <span className="font-mono text-emerald-400 font-medium">
                      {templates.offerLetter.filename || templates.offerLetter.name}
                    </span>
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-between p-2.5 rounded-lg border border-dashed border-zinc-700 bg-zinc-950/60 hover:border-zinc-500 cursor-pointer text-xs text-zinc-400">
                    <span className="truncate max-w-[240px]">
                      {offerLetterFile
                        ? offerLetterFile.name
                        : 'Upload replacement Offer Letter PDF...'}
                    </span>
                    <Upload className="size-3.5 text-zinc-400 shrink-0" />
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => setOfferLetterFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {offerLetterFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOfferLetterFile(null)}
                      className="text-xs text-zinc-400 hover:text-zinc-200 h-8"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Agreement Box */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-zinc-200">
                      Default Employment Agreement
                    </span>
                  </div>
                  {templates.agreement.configured ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                    >
                      <CheckCircle2 className="size-3 mr-1" /> Configured
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-amber-400 border-amber-500/30 bg-amber-500/10"
                    >
                      <AlertCircle className="size-3 mr-1" /> Not Configured
                    </Badge>
                  )}
                </div>

                {templates.agreement.configured && (
                  <p className="text-[11px] text-zinc-400">
                    Active in DB:{' '}
                    <span className="font-mono text-indigo-400 font-medium">
                      {templates.agreement.filename || templates.agreement.name}
                    </span>
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-between p-2.5 rounded-lg border border-dashed border-zinc-700 bg-zinc-950/60 hover:border-zinc-500 cursor-pointer text-xs text-zinc-400">
                    <span className="truncate max-w-[240px]">
                      {agreementFile ? agreementFile.name : 'Upload replacement Agreement PDF...'}
                    </span>
                    <Upload className="size-3.5 text-zinc-400 shrink-0" />
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => setAgreementFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {agreementFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAgreementFile(null)}
                      className="text-xs text-zinc-400 hover:text-zinc-200 h-8"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 pb-6 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || (!offerLetterFile && !agreementFile)}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
            Upload & Save Templates
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
