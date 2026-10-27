'use client'

import React, { useState, useEffect } from 'react'
import { Monitor, Tablet, Smartphone, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CATEGORY_DISPLAY_CONFIG, emailTemplatesApi } from '@/lib/email-templates'
import type { EmailTemplate, PreviewEmailResponse } from '@/types/email-template'

interface EmailPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  template: EmailTemplate | null
}

export function EmailPreviewModal({ isOpen, onClose, template }: EmailPreviewModalProps) {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewEmailResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !template) {
      setPreviewData(null)
      setError(null)
      return
    }

    let mounted = true
    setLoading(true)
    setError(null)

    emailTemplatesApi
      .preview(template.id, {})
      .then((res) => {
        if (mounted) setPreviewData(res)
      })
      .catch((err) => {
        if (mounted) setError(err?.message || 'Failed to render preview')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [isOpen, template])

  if (!template) return null

  const categoryConfig = CATEGORY_DISPLAY_CONFIG[template.category]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl w-[90vw] max-w-[90vw] sm:w-[90vw] p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card">
        {/* Header */}
        <DialogHeader className="pl-5 pr-14 py-3.5 border-b border-border/70 bg-muted/30 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-sm font-bold text-foreground truncate">
                  {template.name}
                </DialogTitle>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${
                    categoryConfig?.badgeColor || 'bg-muted text-muted-foreground'
                  }`}
                >
                  {categoryConfig?.label || template.category}
                </Badge>
                {template.layout?.name && (
                  <span className="text-[11px] text-muted-foreground font-medium truncate">
                    • {template.layout.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Viewport Toggle */}
          <div className="flex items-center gap-1 bg-background/90 p-1 rounded-xl border border-border/70 shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                viewport === 'desktop'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Monitor className="size-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                viewport === 'tablet'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Tablet className="size-3.5" />
              <span>Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                viewport === 'mobile'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Smartphone className="size-3.5" />
              <span>Mobile (375px)</span>
            </button>
          </div>
        </DialogHeader>

        {/* Email Subject preview */}
        <div className="px-5 py-2.5 bg-background/50 border-b border-border/60 text-xs flex items-center gap-2">
          <span className="font-semibold text-muted-foreground text-[11px] shrink-0">Subject:</span>
          <span className="font-medium text-foreground truncate">
            {loading ? 'Generating preview...' : previewData?.subject || template.subject}
          </span>
        </div>

        {/* Viewport Frame */}
        <div className="p-4 sm:p-6 bg-muted/20 min-h-[480px] max-h-[70vh] flex items-center justify-center overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
              <Loader2 className="size-6 animate-spin text-emerald-500" />
              <span>Rendering preview with master layout...</span>
            </div>
          ) : error ? (
            <div className="text-center p-6 text-xs text-rose-500 max-w-sm">
              <p className="font-semibold mb-1">Preview Generation Failed</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : (
            <div
              className={`transition-all duration-300 rounded-xl overflow-hidden shadow-lg border border-border/70 bg-white h-[500px] ${
                viewport === 'mobile'
                  ? 'w-[375px] shrink-0'
                  : viewport === 'tablet'
                    ? 'w-[680px] shrink-0'
                    : 'w-full max-w-[620px]'
              }`}
            >
              <iframe
                title="Rendered Email Preview"
                srcDoc={
                  previewData?.html || '<p style="padding:24px;color:#64748b;">Empty email</p>'
                }
                className="w-full h-full border-0"
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
