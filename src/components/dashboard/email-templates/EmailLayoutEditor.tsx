'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Monitor,
  Tablet,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { emailLayoutsApi } from '@/lib/email-templates'
import type { EmailLayout } from '@/types/email-template'

interface EmailLayoutEditorProps {
  layoutId?: string
}

export function EmailLayoutEditor({ layoutId }: EmailLayoutEditorProps) {
  const router = useRouter()
  const isEdit = Boolean(layoutId)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [htmlContent, setHtmlContent] = useState(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 32px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="content">
      {{content}}
    </div>
    <div class="footer">
      &copy; {{year}} Rise Together. All rights reserved.
    </div>
  </div>
</body>
</html>`)
  const [isDefault, setIsDefault] = useState(false)

  // Viewport for live preview
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  useEffect(() => {
    if (layoutId) {
      setLoading(true)
      emailLayoutsApi
        .getById(layoutId)
        .then((layout) => {
          if (layout) {
            setName(layout.name)
            setHtmlContent(layout.htmlContent)
            setIsDefault(layout.isDefault)
          }
        })
        .catch((err) => {
          toast.error(err?.message || 'Failed to load layout')
        })
        .finally(() => setLoading(false))
    }
  }, [layoutId])

  const hasContentSlot = htmlContent.includes('{{content}}')
  const hasButtonSlot = htmlContent.includes('{{button}}')

  // Live preview mockup
  const previewDoc = useMemo(() => {
    const sampleBody = `<p>Hi Alex,</p><p>We are delighted to invite you for an interview with the engineering team at <strong>Rise Together</strong>.</p><p>Please select a time slot that works best for your schedule:</p>`
    const sampleButton = `<table border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0;"><tr><td align="center" style="border-radius: 8px; background-color: #10B981;"><a href="#" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px;">Schedule Interview Slot</a></td></tr></table>`

    let doc = htmlContent
    if (doc.includes('{{content}}')) {
      doc = doc.replace(
        '{{content}}',
        sampleBody + (doc.includes('{{button}}') ? '' : '\n' + sampleButton),
      )
    }
    if (doc.includes('{{button}}')) {
      doc = doc.replace('{{button}}', sampleButton)
    }
    doc = doc.replace(/{{s*years*}}/gi, new Date().getFullYear().toString())
    return doc
  }, [htmlContent])

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a layout name')
      return
    }
    if (!hasContentSlot) {
      toast.error('Layout must include the {{content}} slot')
      return
    }

    try {
      setSaving(true)
      if (isEdit && layoutId) {
        await emailLayoutsApi.update(layoutId, {
          name: name.trim(),
          htmlContent,
          isDefault,
        })
        toast.success(`Layout "${name}" updated`)
      } else {
        const created = await emailLayoutsApi.create({
          name: name.trim(),
          htmlContent,
          isDefault,
        })
        toast.success(`Layout "${name}" created`)
        if (created && created.id) {
          router.replace(`/dashboard/email-templates/layouts/${created.id}`)
        }
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('email_templates_active_tab', 'LAYOUTS')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save layout')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-muted-foreground text-xs flex flex-col items-center justify-center gap-2">
        <Loader2 className="size-5 animate-spin text-emerald-500" />
        <span>Loading layout editor...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/email-templates?tab=layouts"
            onClick={() => {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('email_templates_active_tab', 'LAYOUTS')
              }
            }}
            className="p-1.5 rounded-lg border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-lg font-bold text-foreground truncate">
            {isEdit ? `Edit Layout: ${name || 'Layout'}` : 'New Master HTML Layout'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('email_templates_active_tab', 'LAYOUTS')
              }
              router.push('/dashboard/email-templates?tab=layouts')
            }}
            className="h-8 text-xs cursor-pointer rounded-lg"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving || !hasContentSlot}
            className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer rounded-lg"
          >
            {saving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3.5" />}
            <span>Save Layout</span>
          </Button>
        </div>
      </div>

      {/* Editor Grid: Left Form, Right Live Shell Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Editor (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <Label className="text-xs font-semibold text-foreground">Layout Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Modern Branded Card"
              className="mt-1 h-9 text-xs bg-card/60 rounded-lg"
            />
          </div>

          {/* Slots Validator Banner */}
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/80 bg-muted/40 text-xs">
            <div className="flex items-center gap-3">
              <span
                className={`flex items-center gap-1 font-medium ${
                  hasContentSlot ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {hasContentSlot ? (
                  <Check className="size-3.5" />
                ) : (
                  <AlertCircle className="size-3.5" />
                )}
                <span>{'{{content}} slot'}</span>
              </span>

              <span
                className={`flex items-center gap-1 font-medium ${
                  hasButtonSlot ? 'text-blue-400' : 'text-muted-foreground'
                }`}
              >
                {hasButtonSlot ? <Check className="size-3.5" /> : <span>•</span>}
                <span>{'{{button}} slot (optional)'}</span>
              </span>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-foreground font-medium">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-border text-emerald-600 focus:ring-emerald-500 size-3.5"
              />
              <span>Default Layout</span>
            </label>
          </div>

          {/* HTML Shell Textarea */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">HTML Shell</Label>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              spellCheck={false}
              rows={24}
              className="w-full p-3 font-mono text-[11px] leading-relaxed bg-neutral-950 text-neutral-100 rounded-lg border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-y min-h-[460px] scrollbar-slim"
            />
          </div>
        </div>

        {/* Right Column: Live Shell Preview (6 cols) */}
        <div className="lg:col-span-6 sticky top-4 space-y-3">
          <div className="flex items-center justify-between gap-2 p-1 bg-card rounded-xl border border-border/70 shadow-xs">
            <span className="text-xs font-semibold px-2 text-foreground">Live Shell Preview</span>

            {/* Viewport Toggles: Desktop, Tablet, Mobile */}
            <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/60">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`px-2.5 py-1 text-xs rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  viewport === 'desktop'
                    ? 'bg-card text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Monitor className="size-3" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport('tablet')}
                className={`px-2.5 py-1 text-xs rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  viewport === 'tablet'
                    ? 'bg-card text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Tablet className="size-3" />
                <span>Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`px-2.5 py-1 text-xs rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  viewport === 'mobile'
                    ? 'bg-card text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone className="size-3" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          {/* Viewport Frame */}
          <div className="p-4 bg-muted/20 min-h-[520px] max-h-[75vh] flex items-center justify-center overflow-auto rounded-xl border border-border/70">
            <div
              className={`transition-all duration-300 rounded-xl overflow-hidden shadow-sm border border-border/80 bg-white h-[560px] ${
                viewport === 'mobile'
                  ? 'w-[375px] shrink-0'
                  : viewport === 'tablet'
                    ? 'w-[500px] shrink-0'
                    : 'w-full max-w-[620px]'
              }`}
            >
              <iframe
                title="Live Layout Preview"
                srcDoc={previewDoc}
                className="w-full h-full border-0"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
