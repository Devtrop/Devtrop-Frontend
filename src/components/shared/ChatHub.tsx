'use client'

/**
 * ChatHub
 * Floating chat launcher fixed at bottom-right.
 * Clicking the main button reveals four contact channels vertically:
 * WhatsApp, Messenger, Instagram, Email.
 *
 * "use client" — needed for open/close toggle state.
 * whatsappHref and contactEmail are passed as props from the server layout
 * so this component never imports server-only env modules.
 */

import { useState, useRef, useEffect, useMemo } from 'react'
import Image from 'next/image'

interface ChatHubProps {
  whatsappHref: string
  contactEmail: string
  /** Pre-filled default message for Gmail (mailto body) and Messenger ref param */
  defaultMessage: string
}

export default function ChatHub({ whatsappHref, contactEmail, defaultMessage }: ChatHubProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const channels = useMemo(
    () => [
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        href: whatsappHref,
        icon: '/icons/whatsapp.svg',
        isExternal: true,
      },
      {
        id: 'messenger',
        label: 'Messenger',
        // m.me supports a `ref` param (base64url-encoded) that Messenger surfaces
        // to the page as the conversation opener. We pass the default message as ref.
        href: `https://m.me/devtrop?ref=${encodeURIComponent(defaultMessage)}`,
        icon: '/icons/messenger.svg',
        isExternal: true,
      },
      {
        id: 'instagram',
        label: 'Instagram',
        href: 'https://instagram.com/devtrop_official',
        icon: '/icons/instagram.svg',
        isExternal: true,
      },
      {
        id: 'email',
        label: 'Email',
        // mailto: body pre-fills the compose window with the default message
        href: `mailto:${contactEmail}?body=${encodeURIComponent(defaultMessage)}`,
        icon: '/icons/email.svg',
        isExternal: false,
      },
    ],
    [whatsappHref, contactEmail, defaultMessage]
  )

  // Close on outside click / tap
  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {/* Channel buttons — stacked above main button */}
      <div className={`flex flex-col items-end gap-3 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={open ? 'false' : 'true'}>
        {channels.map((channel, i) => (
          <div
            key={channel.id}
            className="flex items-center gap-3 group"
            style={{
              transitionDelay: open ? `${i * 45}ms` : `${(channels.length - 1 - i) * 30}ms`,
              opacity: open ? 1 : 0,
              transform: open ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.92)',
              transition:
                'opacity 220ms cubic-bezier(0.22,1,0.36,1), transform 220ms cubic-bezier(0.22,1,0.36,1)',
              pointerEvents: open ? 'auto' : 'none',
            }}
          >
            {/* Tooltip label */}
            <span
              className="
                whitespace-nowrap
                bg-obsidian border border-hairline
                text-inverse text-xs font-medium tracking-wide uppercase
                px-3 py-1.5
                opacity-0 pointer-events-none
                translate-x-1
                transition-all duration-200
                group-hover:opacity-100 group-hover:translate-x-0
              "
              aria-hidden="true"
            >
              {channel.label}
            </span>

            {/* Channel icon button */}
            <a
              href={channel.href}
              target={channel.isExternal ? '_blank' : undefined}
              rel={channel.isExternal ? 'noopener noreferrer' : undefined}
              aria-label={`Contact us on ${channel.label}`}
              tabIndex={open ? 0 : -1}
              className="
                flex items-center justify-center
                w-14 h-14
                bg-canvas border border-hairline
                hover:border-accent hover:bg-accent-soft
                transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
              "
            >
              <Image
                src={channel.icon}
                alt={channel.label}
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </a>
          </div>
        ))}
      </div>

      {/* Main toggle button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Close contact options' : 'Open contact options'}
        aria-expanded={open}
        className="
          pointer-events-auto
          relative flex items-center justify-center
          w-14 h-14
          bg-obsidian border border-hairline
          hover:bg-accent hover:border-accent
          transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 cursor-pointer
        "
      >
        {/* Chat bubble icon — shown when closed */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={`
            w-8 h-8 text-inverse absolute inset-0 m-auto
            transition-all duration-200
            ${open ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}
          `}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
          />
        </svg>

        {/* Close × icon — shown when open */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={`
            w-7 h-7 text-inverse absolute inset-0 m-auto
            transition-all duration-200
            ${open ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}
          `}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
          />
        </svg>
      </button>
    </div>
  )
}
