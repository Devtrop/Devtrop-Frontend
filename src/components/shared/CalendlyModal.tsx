'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { loadCalendlyScript } from '@/lib/booking'

interface CalendlyModalProps {
  url: string
  onClose: () => void
}

export function CalendlyModal({ url, onClose }: CalendlyModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  console.log('[CalendlyModal] render', { url })

  // Await script ready, then inject inline widget
  useEffect(() => {
    console.log('[CalendlyModal] effect running')
    const el = containerRef.current
    if (!el) {
      console.warn('[CalendlyModal] no container ref')
      return
    }

    let cancelled = false

    loadCalendlyScript()
      .then(() => {
        console.log('[CalendlyModal] script loaded', {
          cancelled,
          hasEl: !!el,
          hasCalendly: !!window.Calendly,
        })
        if (cancelled || !el || !window.Calendly) return
        console.log('[CalendlyModal] calling initInlineWidget', { url })
        window.Calendly.initInlineWidget({ url, parentElement: el })
      })
      .catch((err) => {
        console.error('[CalendlyModal] failed to load script:', err)
      })

    return () => {
      console.log('[CalendlyModal] cleanup')
      cancelled = true
      el.innerHTML = ''
    }
  }, [url])

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    /* Backdrop */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-200 flex items-center justify-center p-4 sm:p-6 lg:p-0"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Book a call"
    >
      {/* Modal panel */}
      <div className="relative w-full max-w-lg lg:max-w-3xl xl:max-w-4xl bg-canvas flex flex-col h-[min(680px,90dvh)] lg:h-[min(92dvh,900px)]">
        {/* Header bar — accent-coloured to match project theme */}
        <div className="flex items-center justify-between px-5 py-3 bg-accent shrink-0">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-inverse">
            Book a Call
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center h-8 w-8 border-2 border-inverse text-inverse hover:bg-inverse hover:text-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Calendly inline widget */}
        <div
          ref={containerRef}
          className="flex-1 min-h-0 overflow-hidden [&>div]:h-full! [&>div]:w-full! [&>div]:m-0! [&>div]:p-0! [&_iframe]:w-full! [&_iframe]:h-full! [&_iframe]:min-w-0! [&_iframe]:min-h-0! [&_iframe]:m-0! [&_iframe]:p-0! [&_iframe]:border-0!"
        />
      </div>
    </div>
  )
}
