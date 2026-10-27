'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import type { Editor } from '@tiptap/react'

const TiptapEditor = dynamic(
  () => import('@/components/editor/TiptapEditor').then((mod) => mod.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[280px] rounded-lg border border-border/60 bg-muted/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading editor...
      </div>
    ),
  },
)
import {
  ArrowLeft,
  Eye,
  Code2,
  Save,
  Loader2,
  Plus,
  Trash2,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { emailCache } from '@/lib/email-templates-cache'
import {
  ACCENT_PRESETS,
  CATEGORY_DISPLAY_CONFIG,
  CATEGORY_VARIABLES_MAP,
  GLOBAL_TOKENS,
  emailLayoutsApi,
  emailTemplatesApi,
} from '@/lib/email-templates'
import type {
  EmailTemplate,
  EmailLayout,
  EmailTemplateCategory,
  EmailTemplateStatus,
  PreviewEmailResponse,
  CTAButtonDef,
} from '@/types/email-template'

interface EmailMessageEditorProps {
  initialTemplate?: EmailTemplate | null
  templateId?: string
}

const CATEGORIES: EmailTemplateCategory[] = [
  'INTERVIEW_INVITATION',
  'INTERVIEW_CONFIRMATION',
  'INTERVIEW_OUTCOME',
  'ONBOARDING_OFFER',
  'ONBOARDING_ORIENTATION',
  'ONBOARDING_RESUBMIT',
  'ONBOARDING_REJECTION',
  'JOB_TASKS',
  'JOB_TASK_SUBMITTED',
  'GENERAL',
  'APPLICATIONS',
  'AUTH_OTP',
  'AUTH_VERIFY',
  'AUTH_PASSWORD_RESET',
  'USER_INVITATION',
  'USER_EMAIL_CHANGE',
  'CONTACT_ADMIN',
  'CONTACT_AUTO_REPLY',
  'USER_MESSAGE',
  'APPLICATION_VERIFY',
]

// Single shared style for every token chip (global, category, CTA button)
const TOKEN_CHIP_CLASS =
  'px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition-colors cursor-pointer'

function normalizeImageUrls(html: string): string {
  if (!html) return html
  return html.replace(
    /src=["'](?:\/?api\/v1\/)?(?:email-templates\/images\/|\/email-templates\/images\/)([^"']+)["']/g,
    'src="/api/v1/email-templates/images/$1"',
  )
}

export function EmailMessageEditor({ initialTemplate, templateId }: EmailMessageEditorProps) {
  const router = useRouter()
  const isEdit = Boolean(templateId || initialTemplate?.id)

  const [loading, setLoading] = useState(!initialTemplate && Boolean(templateId))
  const [saving, setSaving] = useState(false)
  const [layouts, setLayouts] = useState<EmailLayout[]>([])

  // Form State
  const [name, setName] = useState(initialTemplate?.name || '')
  const [category, setCategory] = useState<EmailTemplateCategory>(
    initialTemplate?.category || 'INTERVIEW_INVITATION',
  )
  const [layoutId, setLayoutId] = useState<string>(initialTemplate?.layoutId || 'DEFAULT')
  const [subject, setSubject] = useState(initialTemplate?.subject || '')
  const [headerTitle, setHeaderTitle] = useState(initialTemplate?.headerTitle || '')
  const [headerSubtitle, setHeaderSubtitle] = useState(initialTemplate?.headerSubtitle || '')
  const [accentColor, setAccentColor] = useState(initialTemplate?.accentColor || '')
  const [bodyText, setBodyText] = useState(normalizeImageUrls(initialTemplate?.bodyText || ''))
  const [status, setStatus] = useState<EmailTemplateStatus>(initialTemplate?.status || 'PUBLISHED')
  const [isDefault, setIsDefault] = useState(Boolean(initialTemplate?.isDefault))

  // Multiple CTA Buttons
  const [buttons, setButtons] = useState<CTAButtonDef[]>(() => {
    if (!initialTemplate?.buttonText) return []
    if (initialTemplate.buttonText.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(initialTemplate.buttonText)
        if (Array.isArray(parsed)) return parsed
      } catch {}
    }
    return [
      {
        label: initialTemplate.buttonText,
        url: initialTemplate.buttonUrl || '',
        variant: 'primary',
      },
    ]
  })

  // Live preview state
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [previewData, setPreviewData] = useState<PreviewEmailResponse | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const bodyInputRef = useRef<HTMLTextAreaElement>(null)
  // Editor mode & tiptap ref
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual')
  const editorRef = useRef<Editor | null>(null)

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const res = await emailTemplatesApi.uploadImage(file)
      toast.success('Image uploaded successfully')
      let url = res.url
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        const cleaned = url.replace(/^\/?(api\/v1\/)?/, '')
        url = `/api/v1/${cleaned}`
      }
      return url
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload image')
      throw err
    }
  }

  // Load layouts
  useEffect(() => {
    emailLayoutsApi
      .list()
      .then((res) => setLayouts(res || []))
      .catch(() => {})
  }, [])

  // Load template if editing by ID without initial data
  useEffect(() => {
    if (templateId && !initialTemplate) {
      setLoading(true)
      emailTemplatesApi
        .getById(templateId)
        .then((tmpl) => {
          if (tmpl) {
            setName(tmpl.name || '')
            setCategory(tmpl.category || 'INTERVIEW_INVITATION')
            setLayoutId(tmpl.layoutId || 'DEFAULT')
            setSubject(tmpl.subject || '')
            setHeaderTitle(tmpl.headerTitle || '')
            setHeaderSubtitle(tmpl.headerSubtitle || '')
            setAccentColor(tmpl.accentColor || '')
            setBodyText(normalizeImageUrls(tmpl.bodyText || ''))
            setStatus(tmpl.status || 'PUBLISHED')
            setIsDefault(Boolean(tmpl.isDefault))

            if (tmpl.buttonText?.trim().startsWith('[')) {
              try {
                const parsed = JSON.parse(tmpl.buttonText)
                if (Array.isArray(parsed)) setButtons(parsed)
                else setButtons([])
              } catch {
                setButtons([])
              }
            } else if (tmpl.buttonText) {
              setButtons([
                {
                  label: tmpl.buttonText,
                  url: tmpl.buttonUrl || '',
                  variant: 'primary',
                },
              ])
            } else {
              setButtons([])
            }
          }
        })
        .catch((err) => {
          toast.error(err?.message || 'Failed to load template')
        })
        .finally(() => setLoading(false))
    }
  }, [templateId, initialTemplate])

  // Real-time server preview renderer (debounced)
  const updatePreview = useCallback(async () => {
    setPreviewLoading(true)
    try {
      const activeLayoutId = layoutId === 'DEFAULT' ? undefined : layoutId
      const buttonPayload = buttons.length === 0 ? undefined : JSON.stringify(buttons)
      const buttonUrlPayload = buttons.length > 0 ? buttons[0].url : undefined

      const res = await emailTemplatesApi.preview('live', {
        subject: subject || 'Preview',
        headerTitle: headerTitle.trim() || undefined,
        headerSubtitle: headerSubtitle.trim() || undefined,
        accentColor: accentColor.trim() || undefined,
        bodyText: normalizeImageUrls(bodyText),
        buttonText: buttonPayload,
        buttonUrl: buttonUrlPayload,
        layoutId: activeLayoutId,
      })
      setPreviewData(res)
    } catch {
      // preview error handled silently
    } finally {
      setPreviewLoading(false)
    }
  }, [subject, headerTitle, headerSubtitle, accentColor, bodyText, buttons, layoutId])

  useEffect(() => {
    const timer = setTimeout(() => {
      updatePreview()
    }, 400)
    return () => clearTimeout(timer)
  }, [updatePreview])

  const availableTokens = CATEGORY_VARIABLES_MAP[category] || CATEGORY_VARIABLES_MAP.GENERAL
  const globalTokenNames = new Set(GLOBAL_TOKENS.map((t) => t.token))
  const categoryTokens = availableTokens.filter((item) => !globalTokenNames.has(item.token))

  const insertToken = (tokenStr: string) => {
    if (editorMode === 'visual' && editorRef.current) {
      editorRef.current.chain().focus().insertContent(tokenStr).run()
      return
    }
    const textarea = bodyInputRef.current
    if (!textarea) {
      setBodyText((prev) => prev + tokenStr)
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const current = bodyText
    const updated = current.substring(0, start) + tokenStr + current.substring(end)
    setBodyText(updated)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + tokenStr.length, start + tokenStr.length)
    }, 10)
  }

  // Button management
  const addButton = () => {
    const nextIdx = buttons.length + 1
    const tokenName = nextIdx === 1 ? '{{button}}' : `{{button:${nextIdx}}}`
    const newBtn: CTAButtonDef = {
      label: `Action Button ${nextIdx}`,
      url: 'https://',
      variant: 'primary',
    }
    setButtons((prev) => [...prev, newBtn])
    insertToken(`\n${tokenName}\n`)
    toast.info(`Added ${newBtn.label} and inserted ${tokenName} at cursor`)
  }

  const updateButton = (index: number, field: keyof CTAButtonDef, val: string) => {
    setButtons((prev) => prev.map((btn, i) => (i === index ? { ...btn, [field]: val } : btn)))
  }

  const removeButton = (index: number) => {
    setButtons((prev) => prev.filter((_, i) => i !== index))
  }

  const getReturnUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedGroup = sessionStorage.getItem('email_templates_group_filter')
      if (savedGroup && savedGroup !== 'ALL') {
        return `/dashboard/email-templates?tab=messages&group=${savedGroup.toLowerCase()}`
      }
    }
    if (category.startsWith('INTERVIEW_')) {
      return '/dashboard/email-templates?tab=messages&group=interview'
    }
    if (category.startsWith('ONBOARDING_')) {
      return '/dashboard/email-templates?tab=messages&group=onboarding'
    }
    if (category === 'JOB_TASKS') {
      return '/dashboard/email-templates?tab=messages&group=task'
    }
    if (category === 'APPLICATIONS') {
      return '/dashboard/email-templates?tab=messages&group=applications'
    }
    if (category === 'GENERAL') {
      return '/dashboard/email-templates?tab=messages&group=general'
    }
    return '/dashboard/email-templates?tab=messages'
  }, [category])

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a template name')
      return
    }
    if (!subject.trim()) {
      toast.error('Please enter an email subject')
      return
    }
    if (!bodyText.trim()) {
      toast.error('Please enter message body copy')
      return
    }

    try {
      setSaving(true)
      const activeLayoutId = layoutId === 'DEFAULT' ? undefined : layoutId
      const validButtons = buttons.filter((b) => b.label.trim())

      const payload = {
        name: name.trim(),
        category,
        subject: subject.trim(),
        headerTitle: headerTitle.trim(),
        headerSubtitle: headerSubtitle.trim(),
        accentColor: accentColor.trim(),
        bodyText: normalizeImageUrls(bodyText.trim()),
        layoutId: activeLayoutId,
        status,
        isDefault,
        buttons: validButtons,
      }

      if (isEdit) {
        const id = templateId || initialTemplate?.id

        if (!id) {
          toast.error('Template ID is missing')
          return
        }

        const updated = await emailTemplatesApi.update(id, payload)
        toast.success(`Template "${name}" updated`)

        if (updated) {
          emailCache.updateTemplate(updated)
        }
      } else {
        const created = await emailTemplatesApi.create(payload)
        toast.success(`Template "${name}" created`)
        if (created && created.id) {
          emailCache.addTemplate(created)
          router.replace(`/dashboard/email-templates/${created.id}`)
        }
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('email_templates_active_tab', 'MESSAGES')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-muted-foreground text-xs flex flex-col items-center justify-center gap-2">
        <Loader2 className="size-5 animate-spin text-emerald-500" />
        <span>Loading template editor...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Link
            href={getReturnUrl()}
            onClick={() => {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('email_templates_active_tab', 'MESSAGES')
              }
            }}
            className="p-1.5 rounded-lg border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-lg font-bold text-foreground truncate">
            {isEdit ? `Edit: ${name || 'Message'}` : 'New Email Message'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('email_templates_active_tab', 'MESSAGES')
              }
              router.push(getReturnUrl())
            }}
            className="h-8 text-xs cursor-pointer rounded-lg"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer rounded-lg"
          >
            {saving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3.5" />}
            <span>Save Message</span>
          </Button>
        </div>
      </div>

      {/* Editor Grid: Left Form, Right Sticky Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form (7 cols on desktop) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Row 1: Name & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-foreground">Template Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard Technical Interview"
                className="mt-1 h-9 text-xs bg-card/60 rounded-lg"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-foreground">Stage</Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as EmailTemplateCategory)}
              >
                <SelectTrigger className="mt-1 h-9 text-xs bg-card/60 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">
                      {CATEGORY_DISPLAY_CONFIG[cat]?.label || cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Layout */}
          <div>
            <Label className="text-xs font-semibold text-foreground">Layout</Label>
            <Select value={layoutId} onValueChange={setLayoutId}>
              <SelectTrigger className="mt-1 h-9 text-xs bg-card/60 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="DEFAULT" className="text-xs font-medium">
                  (System Default Layout)
                </SelectItem>
                {layouts.map((l) => (
                  <SelectItem key={l.id} value={l.id} className="text-xs">
                    {l.name} {l.isDefault ? '(Default)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div>
            <Label className="text-xs font-semibold text-foreground">Email Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject with tokens like {{jobTitle}}"
              className="mt-1 h-9 text-xs bg-card/60 rounded-lg font-medium"
            />
          </div>

          {/* Banner Title */}
          <div>
            <Label className="text-xs font-semibold text-foreground">
              Banner Title{' '}
              <span className="font-normal text-muted-foreground">
                (optional — defaults to subject)
              </span>
            </Label>
            <Input
              value={headerTitle}
              onChange={(e) => setHeaderTitle(e.target.value)}
              placeholder="Custom banner title, tokens allowed"
              className="mt-1 h-9 text-xs bg-card/60 rounded-lg font-medium"
            />
          </div>

          {/* Banner Subtitle */}
          <div>
            <Label className="text-xs font-semibold text-foreground">
              Banner Subtitle <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              value={headerSubtitle}
              onChange={(e) => setHeaderSubtitle(e.target.value)}
              placeholder="Custom banner subtitle"
              className="mt-1 h-9 text-xs bg-card/60 rounded-lg font-medium"
            />
          </div>

          {/* Accent Color */}
          <div>
            <Label className="text-xs font-semibold text-foreground">
              Accent Color{' '}
              <span className="font-normal text-muted-foreground">(banner + buttons)</span>
            </Label>
            <Select
              value={accentColor || 'DEFAULT'}
              onValueChange={(v) => setAccentColor(v === 'DEFAULT' ? '' : v)}
            >
              <SelectTrigger className="mt-1 h-9 text-xs bg-card/60 rounded-lg font-medium">
                <SelectValue placeholder="Default Emerald" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEFAULT" className="text-xs">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block size-3 rounded-full border border-border/60"
                      style={{ backgroundColor: '#047857' }}
                    />
                    Default Emerald
                  </span>
                </SelectItem>
                {ACCENT_PRESETS.filter((p) => p.hex !== '#047857').map((p) => (
                  <SelectItem key={p.hex} value={p.hex} className="text-xs">
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block size-3 rounded-full border border-border/60"
                        style={{ backgroundColor: p.hex }}
                      />
                      {p.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tokens Toolbar */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Available Tokens (Click to insert)
            </Label>
            <div className="flex flex-wrap gap-1 p-2 rounded-lg bg-muted/40 border border-border/70 max-h-24 overflow-y-auto">
              {GLOBAL_TOKENS.map((item) => (
                <button
                  key={`global-${item.token}`}
                  type="button"
                  onClick={() => insertToken(`{{${item.token}}}`)}
                  className={TOKEN_CHIP_CLASS}
                  title={`${item.description} — works in every template`}
                >
                  {item.token}
                </button>
              ))}
              {categoryTokens.map((item) => (
                <button
                  key={item.token}
                  type="button"
                  onClick={() => insertToken(`{{${item.token}}}`)}
                  className={TOKEN_CHIP_CLASS}
                  title={item.description}
                >
                  {item.token}
                </button>
              ))}

              {/* Dynamic chips for defined CTA buttons */}
              {buttons.map((_, idx) => {
                const token = idx === 0 ? '{{button}}' : `{{button:${idx + 1}}}`
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => insertToken(token)}
                    className={TOKEN_CHIP_CLASS}
                    title={`Insert CTA button ${idx + 1}`}
                  >
                    {idx === 0 ? 'button' : `button:${idx + 1}`}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Message Body Copy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground">Message Body Copy</Label>
              <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border/60">
                <button
                  type="button"
                  onClick={() => setEditorMode('visual')}
                  className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                    editorMode === 'visual'
                      ? 'bg-card text-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Eye className="size-3" />
                  <span>Visual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('code')}
                  className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                    editorMode === 'code'
                      ? 'bg-card text-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Code2 className="size-3" />
                  <span>HTML / Raw</span>
                </button>
              </div>
            </div>

            {editorMode === 'visual' ? (
              <TiptapEditor
                content={bodyText}
                onChange={setBodyText}
                placeholder="Write your email body copy here... (Use toolbar for formatting or insert tokens from chips)"
                editorRef={editorRef}
                onUploadImage={handleImageUpload}
                className="min-h-[280px] text-xs leading-relaxed"
              />
            ) : (
              <Textarea
                ref={bodyInputRef}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={12}
                placeholder="Write raw HTML or plain text copy here..."
                className="text-xs font-mono leading-relaxed bg-card/60 rounded-lg resize-y scrollbar-slim"
              />
            )}
          </div>

          {/* Multiple CTA Buttons Section */}
          <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">CTA Buttons</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addButton}
                className="h-7 text-xs gap-1 cursor-pointer rounded-md shrink-0"
              >
                <Plus className="size-3" />
                <span>Add Button</span>
              </Button>
            </div>

            {buttons.length > 0 && (
              <div className="space-y-2.5">
                {buttons.map((btn, idx) => {
                  const tokenName = idx === 0 ? '{{button}}' : `{{button:${idx + 1}}}`
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {tokenName}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              insertToken(tokenName)
                              toast.info(`Inserted ${tokenName} at cursor`)
                            }}
                            className="text-[10px] text-muted-foreground hover:text-emerald-500 flex items-center gap-0.5 cursor-pointer hover:underline"
                            title="Insert token at cursor in message"
                          >
                            <Plus className="size-2.5" />
                            <span>Insert at cursor</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeButton(idx)}
                          className="text-muted-foreground hover:text-rose-500 p-0.5 rounded cursor-pointer"
                          title="Delete button"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-5">
                          <Label className="text-[10px] text-muted-foreground">Button Label</Label>
                          <Input
                            value={btn.label}
                            onChange={(e) => updateButton(idx, 'label', e.target.value)}
                            placeholder="e.g. Schedule Slot"
                            className="h-8 text-xs bg-background rounded-md"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <Label className="text-[10px] text-muted-foreground">Target URL</Label>
                          <Input
                            value={btn.url}
                            onChange={(e) => updateButton(idx, 'url', e.target.value)}
                            placeholder="e.g. {{bookingUrl}}"
                            className="h-8 text-xs bg-background rounded-md font-mono text-[11px]"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <Label className="text-[10px] text-muted-foreground">Style</Label>
                          <Select
                            value={btn.variant || (idx === 0 ? 'primary' : 'secondary')}
                            onValueChange={(val) => updateButton(idx, 'variant', val as any)}
                          >
                            <SelectTrigger className="h-8 text-xs bg-background rounded-md">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="text-xs">
                              <SelectItem value="primary">Primary (Filled)</SelectItem>
                              <SelectItem value="secondary">Secondary (Outline)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Status & Default Settings */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-semibold">Status:</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as EmailTemplateStatus)}>
                <SelectTrigger className="h-8 w-32 text-xs bg-card/60 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-border text-emerald-600 focus:ring-emerald-500 size-4"
              />
              <span>Set as category default</span>
            </label>
          </div>
        </div>

        {/* Right Column: Sticky Live Preview (6 cols on desktop) */}
        <div className="lg:col-span-6 sticky top-4 space-y-3">
          <div className="flex items-center justify-between gap-2 p-1 bg-card rounded-xl border border-border/70 shadow-xs">
            <span className="text-xs font-semibold px-2 text-foreground">Live Preview</span>

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

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={updatePreview}
              disabled={previewLoading}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw
                className={`size-3 ${previewLoading ? 'animate-spin text-emerald-500' : ''}`}
              />
            </Button>
          </div>

          {/* Subject banner in preview */}
          <div className="px-3.5 py-2 rounded-lg bg-muted/40 border border-border/60 text-xs flex items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
              Subject:
            </span>
            <span className="font-medium text-foreground truncate">
              {previewData?.subject || subject || '(Empty Subject)'}
            </span>
          </div>

          {/* Viewport Frame */}
          <div className="p-4 bg-muted/20 min-h-[520px] max-h-[75vh] flex items-center justify-center overflow-auto rounded-xl border border-border/70">
            {previewLoading && !previewData ? (
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
                <Loader2 className="size-6 animate-spin text-emerald-500" />
                <span>Rendering preview...</span>
              </div>
            ) : (
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
                  title="Live Email Preview"
                  srcDoc={
                    previewData?.html
                      ? normalizeImageUrls(previewData.html)
                      : '<p style="padding:24px;color:#94a3b8;">Generating preview...</p>'
                  }
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
