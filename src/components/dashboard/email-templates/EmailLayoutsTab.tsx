'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  RotateCcw,
  Check,
  Monitor,
  Tablet,
  Smartphone,
  FileCode,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { emailLayoutsApi } from '@/lib/email-templates'
import { emailCache } from '@/lib/email-templates-cache'
import type { EmailLayout } from '@/types/email-template'

export function EmailLayoutsTab() {
  const router = useRouter()
  const [layouts, setLayouts] = useState<EmailLayout[]>(() => {
    const cached = emailCache.getLayouts()
    return cached && cached.length > 1 ? cached : []
  })
  const [loading, setLoading] = useState(() => {
    const cached = emailCache.getLayouts()
    return !cached || cached.length <= 1
  })

  // Preview Modal
  const [previewLayout, setPreviewLayout] = useState<EmailLayout | null>(null)
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<EmailLayout | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchLayouts = useCallback(async (isSilent = false, forceRefresh = false) => {
    try {
      if (!isSilent) setLoading(true)
      const data = await emailLayoutsApi.list(forceRefresh)
      setLayouts(data || [])
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load email layouts')
    } finally {
      if (!isSilent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const cached = emailCache.getLayouts()
    if (!cached || cached.length <= 1) {
      fetchLayouts()
    } else {
      fetchLayouts(true)
    }
  }, [fetchLayouts])

  useEffect(() => {
    const unsubscribe = emailCache.subscribeLayouts(() => {
      const cached = emailCache.getLayouts()
      if (cached && cached.length > 1) {
        setLayouts(cached)
      } else {
        fetchLayouts(true, true)
      }
    })
    return unsubscribe
  }, [fetchLayouts])

  const handleSetDefault = async (layout: EmailLayout) => {
    try {
      await emailLayoutsApi.setDefault(layout.id)
      toast.success(`"${layout.name}" set as default layout`)
      setLayouts((prev) => {
        const updated = prev.map((l) => ({ ...l, isDefault: l.id === layout.id }))
        emailCache.setLayouts(updated)
        return updated
      })
    } catch (err: any) {
      toast.error(err?.message || 'Failed to set default layout')
      fetchLayouts(true, true)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await emailLayoutsApi.delete(deleteTarget.id)
      toast.success(`Layout "${deleteTarget.name}" deleted`)
      setLayouts((prev) => {
        const updated = prev.filter((l) => l.id !== deleteTarget.id)
        emailCache.setLayouts(updated)
        return updated
      })
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete layout')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {layouts.length} {layouts.length === 1 ? 'layout' : 'layouts'}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                emailCache.invalidateLayouts()
                fetchLayouts(false, true)
              }}
              disabled={loading}
              className="text-xs h-8 gap-1.5 cursor-pointer rounded-none"
            >
              <RotateCcw className={`size-3.5 ${loading ? 'animate-spin text-accent' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('email_templates_active_tab', 'LAYOUTS')
                }
                router.push('/dashboard/email-templates/layouts/new')
              }}
              className="text-xs h-8 gap-1.5 bg-accent hover:bg-accent text-white font-medium cursor-pointer rounded-none"
            >
              <Plus className="size-3.5" />
              <span>New Layout</span>
            </Button>
          </div>
        </div>

        {/* Layouts Grid */}
        {loading ? (
          <div className="py-16 text-center text-muted-foreground text-xs flex flex-col items-center justify-center gap-2">
            <RotateCcw className="size-5 animate-spin text-accent" />
            <span>Loading layouts...</span>
          </div>
        ) : layouts.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-xs flex flex-col items-center justify-center gap-2.5 rounded-none border border-dashed border-border/80 p-8">
            <div className="font-semibold text-foreground">No custom layouts yet</div>
            <Button
              size="sm"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('email_templates_active_tab', 'LAYOUTS')
                }
                router.push('/dashboard/email-templates/layouts/new')
              }}
              className="text-xs h-8 gap-1.5 bg-accent hover:bg-accent text-white cursor-pointer mt-1 rounded-none"
            >
              <Plus className="size-3.5" />
              <span>Create Layout</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {layouts.map((layout) => {
              return (
                <div
                  key={layout.id}
                  className="group relative rounded-none border border-border/80 bg-card p-4 hover:border-accent hover:shadow-xs transition-all flex flex-col justify-between gap-3"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              sessionStorage.setItem('email_templates_active_tab', 'LAYOUTS')
                            }
                            router.push(`/dashboard/email-templates/layouts/${layout.id}`)
                          }}
                          className="font-semibold text-sm text-foreground hover:text-accent transition-colors truncate text-left cursor-pointer"
                        >
                          {layout.name}
                        </button>
                      </div>

                      {layout.isDefault ? (
                        <span className="text-[11px] text-accent font-medium shrink-0">
                          Default
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(layout)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground hover:text-accent hover:underline cursor-pointer shrink-0"
                          title="Set as default layout"
                        >
                          Make Default
                        </button>
                      )}
                    </div>

                    {/* Preview Mini Frame */}
                    <div
                      onClick={() => setPreviewLayout(layout)}
                      className="mt-3 rounded-none border border-border/60 bg-muted/20 overflow-hidden h-28 relative cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <iframe
                        title={layout.name}
                        srcDoc={layout.htmlContent.replace(
                          '{{content}}',
                          '<p style="font-size:11px;color:#64748b;margin:0;">Sample content...</p>',
                        )}
                        className="w-full h-full border-0 pointer-events-none scale-75 origin-top-left"
                        style={{ width: '133.33%', height: '133.33%' }}
                        tabIndex={-1}
                      />
                    </div>

                    {/* Slots info */}
                    <div className="mt-2.5 flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                      <span className="text-accent">{'{{content}}'}</span>
                      {layout.htmlContent.includes('{{button}}') && (
                        <span className="text-muted-foreground">{'{{button}}'}</span>
                      )}
                    </div>
                  </div>

                  {/* Hover-to-reveal Action Bar */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewLayout(layout)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-none"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Preview
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              sessionStorage.setItem('email_templates_active_tab', 'LAYOUTS')
                            }
                            router.push(`/dashboard/email-templates/layouts/${layout.id}`)
                          }}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-accent cursor-pointer rounded-none"
                        >
                          <Edit className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Edit
                      </TooltipContent>
                    </Tooltip>

                    {!layout.isDefault && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(layout)}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-rose-500 cursor-pointer rounded-none"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          Delete
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Wide & Responsive Standalone Preview Modal */}
        {previewLayout && (
          <Dialog
            open={Boolean(previewLayout)}
            onOpenChange={(open) => !open && setPreviewLayout(null)}
          >
            <DialogContent className="sm:max-w-5xl w-[95vw] max-w-[95vw] sm:w-[95vw] p-0 gap-0 overflow-hidden rounded-none border border-border/80 bg-card">
              <DialogHeader className="pl-5 pr-14 py-3.5 border-b border-border/70 bg-muted/20 flex flex-row items-center justify-between shrink-0">
                <DialogTitle className="text-sm font-bold text-foreground">
                  {previewLayout.name}
                </DialogTitle>

                {/* Viewport Toggles: Desktop, Tablet, Mobile */}
                <div className="flex items-center gap-1 bg-background p-0.5 rounded-none border border-border/60">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('desktop')}
                    className={`px-2.5 py-1 text-xs rounded-none transition-all flex items-center gap-1 cursor-pointer ${
                      previewViewport === 'desktop'
                        ? 'bg-card text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Monitor className="size-3" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('tablet')}
                    className={`px-2.5 py-1 text-xs rounded-none transition-all flex items-center gap-1 cursor-pointer ${
                      previewViewport === 'tablet'
                        ? 'bg-card text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Tablet className="size-3" />
                    <span>Tablet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('mobile')}
                    className={`px-2.5 py-1 text-xs rounded-none transition-all flex items-center gap-1 cursor-pointer ${
                      previewViewport === 'mobile'
                        ? 'bg-card text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Smartphone className="size-3" />
                    <span>Mobile (375px)</span>
                  </button>
                </div>
              </DialogHeader>

              <div className="p-4 sm:p-6 bg-muted/20 min-h-[500px] max-h-[75vh] flex items-center justify-center overflow-auto">
                <div
                  className={`transition-all duration-300 rounded-none overflow-hidden border border-border/70 bg-white h-[500px] ${
                    previewViewport === 'mobile'
                      ? 'w-[375px] shrink-0'
                      : previewViewport === 'tablet'
                        ? 'w-[520px] shrink-0'
                        : 'w-full max-w-[680px]'
                  }`}
                >
                  <iframe
                    title="Layout Preview"
                    srcDoc={previewLayout.htmlContent
                      .replace(
                        '{{content}}',
                        `<p style="font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">Hi Alex,</p><p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">This is a sample operational notification rendered inside <strong>${previewLayout.name}</strong>.</p><div style="text-align: center; margin: 24px 0;"><a href="#" style="display: inline-block; padding: 14px 28px; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 10px; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.25);">Sample Action Button &rarr;</a></div><p style="font-size: 13px; color: #64748B; margin: 20px 0 0 0; line-height: 1.5;">Best regards,<br><strong style="color: #0F172A;">The Recruitment Team</strong><br>Rise Together</p>`,
                      )
                      .replace(/\{\{\s*button(?::\d+)?\s*\}\}/g, '')
                      .replace(/\{\{\s*button\d+\s*\}\}/g, '')
                      .replace(/\{\{\s*headerTitle\s*\}\}/g, previewLayout.name)
                      .replace(/\{\{\s*headerSubtitle\s*\}\}/g, 'Rise Together')
                      .replace(/\{\{\s*subject\s*\}\}/g, previewLayout.name)
                      .replace(/\{\{\s*year\s*\}\}/g, new Date().getFullYear().toString())}
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Modal */}
        {deleteTarget && (
          <Dialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
          >
            <DialogContent className="max-w-md text-xs rounded-none border border-border/80">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-foreground">
                  Delete Layout?
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Are you sure you want to delete &ldquo;<strong>{deleteTarget.name}</strong>
                  &rdquo;? Messages assigned to this layout will fall back to the default layout.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="text-xs cursor-pointer rounded-none"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs gap-1.5 cursor-pointer rounded-none"
                >
                  <Trash2 className="size-3.5" />
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  )
}
