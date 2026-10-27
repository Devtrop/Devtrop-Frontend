'use client'

import React from 'react'
import { sanitizeHtml, isHtmlContent } from '@/lib/sanitize'
import { cn } from '@/lib/utils'

interface SanitizedHtmlProps {
  content: string
  className?: string
  fallback?: string
}

export function SanitizedHtml({ content, className, fallback = '—' }: SanitizedHtmlProps) {
  if (!content || !content.trim()) {
    return <span>{fallback}</span>
  }

  if (!isHtmlContent(content)) {
    return <span>{content}</span>
  }

  const sanitized = sanitizeHtml(content)

  return (
    <div
      className={cn('prose prose-sm dark:prose-invert max-w-none', className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
