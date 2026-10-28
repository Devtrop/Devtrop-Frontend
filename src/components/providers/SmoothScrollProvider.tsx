'use client'

import React, { useEffect, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { frame, cancelFrame } from 'framer-motion'
import Lenis from 'lenis'

let globalLenis: Lenis | null = null
const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

function getSnapshot() {
  return globalLenis
}

function getServerSnapshot() {
  return null
}

function emitChange() {
  listeners.forEach((listener) => listener())
}

export interface SmoothScrollContextValue {
  lenis: Lenis | null
  scrollTo: (
    target: string | number | HTMLElement,
    options?: {
      offset?: number
      immediate?: boolean
      duration?: number
      easing?: (t: number) => number
    },
  ) => void
}

/**
 * Hook to access the global Lenis smooth scroll instance
 */
export function useSmoothScroll(): SmoothScrollContextValue {
  const lenis = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const scrollTo = (
    target: string | number | HTMLElement,
    options?: {
      offset?: number
      immediate?: boolean
      duration?: number
      easing?: (t: number) => number
    },
  ) => {
    globalLenis?.scrollTo(target, options)
  }

  return { lenis, scrollTo }
}

/**
 * Unified SmoothScrollProvider using Lenis synchronized with Framer Motion's frame loop.
 * Automatically disables on dashboard / auth routes and respects nested scrollable areas.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboardOrAuth =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/admin')

  useEffect(() => {
    // If inside dashboard or auth pages, destroy Lenis so native scrolling works in sidebars, sheets, dialogs & tables
    if (isDashboardOrAuth) {
      if (globalLenis) {
        globalLenis.destroy()
        globalLenis = null
        emitChange()
      }
      return
    }

    // Respect OS accessibility reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const instance = new Lenis({
      duration: prefersReducedMotion ? 0 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !prefersReducedMotion,
      touchMultiplier: 1.5,
      wheelMultiplier: 1.0,
      infinite: false,
      prevent: (node) => {
        if (!node) return false
        const el = node as HTMLElement
        return Boolean(
          el.hasAttribute?.('data-lenis-prevent') ||
          el.closest?.('[data-lenis-prevent]') ||
          el.closest?.('[data-radix-scroll-area-viewport]') ||
          el.closest?.('[data-slot="scroll-area-viewport"]') ||
          el.closest?.('[data-slot="sheet-content"]') ||
          el.closest?.('[role="dialog"]') ||
          el.closest?.('aside'),
        )
      },
    })

    globalLenis = instance
    emitChange()

    // Synchronize Lenis with Framer Motion's shared animation frame loop
    function update({ timestamp }: { timestamp: number }) {
      instance.raf(timestamp)
    }

    frame.update(update, true)

    return () => {
      cancelFrame(update)
      instance.destroy()
      globalLenis = null
      emitChange()
    }
  }, [isDashboardOrAuth])

  // Auto scroll-to-top on page route change for non-dashboard routes
  useEffect(() => {
    if (globalLenis && !isDashboardOrAuth) {
      globalLenis.scrollTo(0, { immediate: true })
    }
  }, [pathname, isDashboardOrAuth])

  return <>{children}</>
}
