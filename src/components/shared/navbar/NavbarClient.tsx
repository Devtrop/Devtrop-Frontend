'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { NAV_LINKS, NAVBAR_CTA } from './constants'
import { Logo } from './components/Logo'
import { MobileDrawer } from './components/MobileDrawer'
import { openBooking } from '@/lib/booking'

export function NavbarClient() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    if (!barRef.current) return
    const setHeight = (el: Element) => {
      document.documentElement.style.setProperty(
        '--navbar-height',
        `${el.getBoundingClientRect().height}px`
      )
    }
    setHeight(barRef.current)
    const ro = new ResizeObserver(([entry]) => setHeight(entry.target))
    ro.observe(barRef.current)
    return () => ro.disconnect()
  }, [])

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      <div ref={barRef} className="w-full bg-canvas border-b-2 md:border-b-3 border-display py-4">
        <SectionContainer className="flex items-center justify-between">
          {/* Brand */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main Navigation">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative pb-1 text-xs font-bold uppercase tracking-[0.15em] text-display ${link.badge ? 'pr-3' : ''}`}
                >
                  {/* Inner clip zone for the flip animation only */}
                  <span className="relative block overflow-hidden">
                    <span
                      className={`block transition-transform duration-150 ease-linear ${active ? '' : 'group-hover:-translate-y-full'}`}
                    >
                      {link.label}
                    </span>
                    {!active && (
                      <span className="absolute inset-0 flex items-center text-accent translate-y-full transition-transform duration-150 ease-linear group-hover:translate-y-0">
                        {link.label}
                      </span>
                    )}
                  </span>
                  {/* Active indicator */}
                  {active && (
                    <span
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-accent"
                      aria-hidden="true"
                    />
                  )}
                  {/* Orange box badge — top-right corner */}
                  {link.badge === 'new' && (
                    <span className="absolute -top-1 right-0 h-2 w-2 bg-accent" aria-label="New" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => openBooking()}
              className="hidden sm:inline-flex items-center justify-center bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-inverse hover:bg-accent-hover transition-colors duration-150 cursor-pointer"
            >
              {NAVBAR_CTA.label}
            </button>

            {/* Hamburger → X morphing button */}
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="flex lg:hidden h-10 w-10 items-center justify-center border-2 border-display text-display hover:bg-display hover:text-inverse transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <span className="relative flex h-4 w-5 flex-col justify-between">
                <span
                  className="block h-0.5 w-full bg-current origin-center transition-transform duration-300 ease-in-out"
                  style={{
                    transform: isMobileMenuOpen
                      ? 'translateY(7px) rotate(45deg)'
                      : 'translateY(0) rotate(0deg)',
                  }}
                />
                <span
                  className="block h-0.5 w-full bg-current transition-[opacity,transform] duration-300 ease-in-out"
                  style={{
                    opacity: isMobileMenuOpen ? 0 : 1,
                    transform: isMobileMenuOpen ? 'scaleX(0)' : 'scaleX(1)',
                  }}
                />
                <span
                  className="block h-0.5 w-full bg-current origin-center transition-transform duration-300 ease-in-out"
                  style={{
                    transform: isMobileMenuOpen
                      ? 'translateY(-7px) rotate(-45deg)'
                      : 'translateY(0) rotate(0deg)',
                  }}
                />
              </span>
            </button>
          </div>
        </SectionContainer>
      </div>

      <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  )
}
