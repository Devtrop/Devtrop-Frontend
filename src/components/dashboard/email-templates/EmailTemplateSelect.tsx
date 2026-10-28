'use client'

import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Mail } from 'lucide-react'
import { emailTemplatesApi, CATEGORY_DISPLAY_CONFIG } from '@/lib/email-templates'
import type { EmailTemplate, EmailTemplateCategory } from '@/types/email-template'

interface EmailTemplateSelectProps {
  category: EmailTemplateCategory
  value?: string
  onChange: (templateId: string, template?: EmailTemplate) => void
  disabled?: boolean
  label?: string
  className?: string
  allowCustomNotice?: boolean
}

export function EmailTemplateSelect({
  category,
  value,
  onChange,
  disabled = false,
  label = 'Email Template',
  className = '',
  allowCustomNotice = true,
}: EmailTemplateSelectProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const didAutoSelectRef = React.useRef(false)

  useEffect(() => {
    let mounted = true
    didAutoSelectRef.current = false
    setLoadError(null)

    async function loadData() {
      try {
        setLoading(true)
        const templatesList = await emailTemplatesApi.getByCategory(category)
        if (!mounted) return

        setTemplates(templatesList || [])

        if (value !== undefined || didAutoSelectRef.current) return
        const defaultTmpl =
          (templatesList || []).find((t) => t.isDefault) || (templatesList || [])[0]
        if (defaultTmpl) {
          didAutoSelectRef.current = true
          setSelectedTemplate(defaultTmpl)
          onChange(defaultTmpl.id, defaultTmpl)
        }
      } catch (err: any) {
        if (mounted) setLoadError(err?.message || 'Failed to load templates')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      mounted = false
    }
  }, [category])

  useEffect(() => {
    if (value && templates.length > 0) {
      const match = templates.find((t) => t.id === value)
      if (match) setSelectedTemplate(match)
    }
  }, [value, templates])

  const handleSelect = (templateId: string) => {
    const match = templates.find((t) => t.id === templateId)
    setSelectedTemplate(match || null)
    onChange(templateId, match)
  }

  const categoryMeta = CATEGORY_DISPLAY_CONFIG[category]

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <label className="font-semibold text-foreground flex items-center gap-1.5">
          <Mail className="size-3.5 text-accent" />
          <span>{label}</span>
        </label>
      </div>

      <Select
        value={selectedTemplate?.id || ''}
        onValueChange={handleSelect}
        disabled={disabled || loading}
      >
        <SelectTrigger className="h-9 text-xs bg-background/60 w-full rounded-none">
          <SelectValue placeholder={loading ? 'Loading templates...' : 'Select an email template'}>
            {selectedTemplate ? (
              <span className="font-medium truncate">{selectedTemplate.name}</span>
            ) : (
              <span className="text-muted-foreground">Select a template</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="text-xs">
          {loadError ? (
            <div className="p-3 text-center text-xs text-rose-400">
              Failed to load templates: {loadError}
            </div>
          ) : templates.length === 0 ? (
            <div className="p-3 text-center text-muted-foreground text-xs">
              No published templates for {categoryMeta?.label || category}
            </div>
          ) : (
            templates.map((tmpl) => (
              <SelectItem key={tmpl.id} value={tmpl.id} className="text-xs cursor-pointer">
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="truncate">{tmpl.name}</span>
                  {tmpl.isDefault && (
                    <span className="text-[10px] text-accent font-medium shrink-0">
                      (Default)
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {allowCustomNotice && selectedTemplate && (
        <p className="text-[11px] text-muted-foreground truncate">
          Subject: <span className="font-medium text-foreground">{selectedTemplate.subject}</span>
        </p>
      )}
    </div>
  )
}
