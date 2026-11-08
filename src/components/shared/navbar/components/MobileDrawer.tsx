'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_LINKS, NAVBAR_CTA } from '../constants'
import { openBooking } from '@/lib/booking'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const PANEL_DURATION = 400 // ms
const LINK_STAGGER = 60 // ms
const LINK_DURATION = 320 // ms

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const [linksVisible, setLinksVisible] = useState(false)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen)
    if (!isOpen) {
      setLinksVisible(false)
    }
  }

  // Links stagger in once panel is ~40% open
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setLinksVisible(true), PANEL_DURATION * 0.4)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Keyboard trap only — no body scroll lock since the drawer is fixed
  // and locking body overflow causes the sticky navbar to jump to top.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab' && drawerRef.current) {
        const els = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (els.length === 0) return
        const first = els[0],
          last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      const t = setTimeout(
        () =>
          drawerRef.current
            ?.querySelector<HTMLElement>('button, [href]')
            ?.focus({ preventScroll: true }),
        50
      )
      return () => {
        clearTimeout(t)
        window.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      // Drawer is closing — move focus out of the panel immediately so
      // aria-hidden is never applied while a descendant still has focus.
      if (drawerRef.current && drawerRef.current.contains(document.activeElement)) {
        ;(document.activeElement as HTMLElement).blur()
      }
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-x-0 bottom-0 lg:hidden"
        style={{
          top: 'var(--navbar-height, 64px)',
          background: 'rgba(0,0,0,0.30)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transitionProperty: 'opacity',
          transitionDuration: `${PANEL_DURATION}ms`,
          transitionTimingFunction: 'ease-in-out',
          zIndex: 48,
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel wrapper — fixed, sits just below the sticky navbar */}
      <div
        className="fixed inset-x-0 lg:hidden overflow-hidden pointer-events-none"
        style={{
          top: 'var(--navbar-height, 64px)',
          zIndex: 49,
          visibility: isOpen ? 'visible' : 'hidden',
          transitionProperty: 'visibility',
          transitionDuration: '0s',
          transitionDelay: isOpen ? '0s' : `${PANEL_DURATION}ms`,
        }}
        inert={!isOpen ? true : undefined}
      >
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="bg-canvas border-b-2 border-display shadow-xl pointer-events-auto"
          style={{
            transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
            transitionProperty: 'transform',
            transitionDuration: `${PANEL_DURATION}ms`,
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div ref={contentRef} className="px-6 pt-5 pb-8">
            {/* Links */}
            <nav className="flex flex-col space-y-1">
              {NAV_LINKS.map((link, i) => {
                const active = isActive(link.href)
                return (
                  <div key={link.href} className="overflow-hidden">
                    <Link
                      href={link.href}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      style={{
                        transitionDelay: linksVisible
                          ? `${i * LINK_STAGGER}ms`
                          : `${(NAV_LINKS.length - 1 - i) * 35}ms`,
                        transitionDuration: `${LINK_DURATION}ms`,
                        transitionProperty: 'transform, opacity',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: linksVisible ? 'translateY(0)' : 'translateY(-100%)',
                        opacity: linksVisible ? 1 : 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      className={`px-4 py-3 text-base font-bold uppercase tracking-wider transition-colors duration-150 ${
                        active
                          ? 'bg-display text-inverse'
                          : 'text-display hover:bg-display hover:text-inverse'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {link.label}
                        {link.badge === 'new' && (
                          <span className="h-2 w-2 shrink-0 bg-accent" aria-label="New" />
                        )}
                      </span>
                      {/* Active accent dot */}
                      {active && <span className="h-2 w-2 bg-accent shrink-0" aria-hidden="true" />}
                    </Link>
                  </div>
                )
              })}
            </nav>

            {/* Status + CTA */}
            <div className="pt-6 border-t-2 border-display mt-4 flex flex-col gap-4">
              {/* <div className="flex items-center gap-2 px-4 py-2 border-2 border-display text-xs font-bold uppercase tracking-wider w-fit"> */}
              {/* <span className="h-2 w-2 bg-accent" /> */}
              {/* {AVAILABILITY_STATUS.label} */}
              {/* </div> */}
              <button
                onClick={() => {
                  onClose()
                  openBooking()
                }}
                className="w-full text-center bg-accent px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-inverse hover:bg-accent-hover transition-all duration-150 cursor-pointer active:scale-95 active:translate-y-1 md:active:scale-100 md:active:translate-y-0 touch-manipulation z-50"
              >
                {NAVBAR_CTA.label}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
