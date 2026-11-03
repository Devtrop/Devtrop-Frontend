'use client'

import Link from 'next/link'
import { useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { ArrowUpRight, ExternalLink, Monitor, Smartphone } from 'lucide-react'

type View = 'desktop' | 'mobile'

const DESKTOP_MIN_WIDTH = 768

interface ProjectPreviewProps {
  liveUrl: string
  caseStudyUrl: string
  image: string
  imageAlt: string
  title?: string
}

function getWindowView(): View {
  return typeof window !== 'undefined' && window.innerWidth >= DESKTOP_MIN_WIDTH
    ? 'desktop'
    : 'mobile'
}

export function ProjectPreview({
  liveUrl,
  caseStudyUrl,
  image,
  imageAlt,
  title,
}: ProjectPreviewProps) {
  const deviceView = useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined') return () => {}
      window.addEventListener('resize', onChange)
      return () => window.removeEventListener('resize', onChange)
    },
    getWindowView,
    () => 'desktop'
  )

  const [manualView, setManualView] = useState<View | null>(null)
  const [error, setError] = useState(false)
  const view = manualView ?? deviceView
  const isDesktop = view === 'desktop'

  const handleOpenLive = () => {
    window.open(liveUrl, '_blank', 'noopener,noreferrer')
  }

  const isMobileDevice = deviceView === 'mobile'

  // When a mobile device user toggles Desktop view, scale the desktop site down
  // to fit the phone screen width instead of overflowing horizontally.
  const desktopScale = isMobileDevice && isDesktop
    ? Math.min(1, (typeof window !== 'undefined' ? window.innerWidth : 375) / 1024)
    : 1

  // Container height matches the scaled desktop content so there is no gap below it.
  const containerHeight = isMobileDevice && isDesktop ? 768 * desktopScale : isDesktop ? 500 : 600

  const buttonBase = `flex items-center gap-1.5 rounded-md transition-colors text-xs font-bold uppercase tracking-wider ${
    isMobileDevice ? 'px-2 py-0.5' : 'px-2.5 py-1'
  }`
  const activeBase = `${buttonBase} bg-display text-inverse`
  const inactiveBase = `${buttonBase} text-display border border-display hover:bg-display hover:text-inverse`

  return (
    <div className="flex flex-col gap-2 pt-2">
      {/* Top: view toggles (desktop also shows Read Case Study + Open live here) */}
      <div className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-display flex items-center gap-1 justify-between`}>
        <div className="flex gap-1">
          <button
            onClick={() => setManualView('desktop')}
            className={`${isDesktop ? activeBase : inactiveBase}`}
            aria-pressed={isDesktop}
          >
            <Monitor className="h-3 w-3" />
            {!isMobileDevice && <span>Desktop</span>}
          </button>
          <button
            onClick={() => setManualView('mobile')}
            className={`${!isDesktop ? activeBase : inactiveBase}`}
            aria-pressed={!isDesktop}
          >
            <Smartphone className="h-3 w-3" />
            {!isMobileDevice && <span>Mobile</span>}
          </button>
        </div>
        {!isMobileDevice && (
          <div className="flex gap-1 ml-auto">
            <Link
              href={caseStudyUrl}
              className={inactiveBase}
            >
              <ArrowUpRight className="h-3 w-3" />
              <span>Read Case Study</span>
            </Link>
            <button
              onClick={handleOpenLive}
              className={inactiveBase}
              aria-label={`Open live site for ${title ?? ''}`}
            >
              <ExternalLink className="h-3 w-3" />
              <span>Open live</span>
            </button>
          </div>
        )}
      </div>

      {/* Preview */}
      <div
        className={`relative overflow-scroll touch-auto -webkit-overflow-scrolling-touch rounded-2xl border border-display bg-white shadow-[8px_8px_0_0_var(--color-display)] ${
          isDesktop
            ? 'w-full max-w-[1440px] mx-auto'
            : 'w-full max-w-xs mx-auto'
        }`}
        suppressHydrationWarning
        style={{
          touchAction: 'pan-y pan-x',
          WebkitOverflowScrolling: 'touch',
          height: `${containerHeight}px`,
        }}
      >
        {error ? (
          <div className="flex h-full w-full flex-col items-center justify-center text-muted p-6">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width: 1023px) 90vw, 45vw"
              className="object-contain object-top max-h-[60%] max-w-full"
            />
            <p className="mt-4 text-xs leading-relaxed text-center">
              Live preview embedding is restricted by the source site. Open the live site instead.
            </p>
          </div>
        ) : (
          <div className="w-full h-full relative overflow-hidden">
            {isMobileDevice && isDesktop ? (
              <div
                className="absolute top-0 left-0"
                style={{
                  transform: `scale(${desktopScale})`,
                  transformOrigin: 'top left',
                  width: '1024px',
                  height: '768px',
                }}
              >
                <iframe
                  className="w-full h-full"
                  src={liveUrl}
                  title={`Live preview of ${title ?? ''}`}
                  referrerPolicy="no-referrer"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-pointer-lock allow-modals"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  loading="eager"
                  scrolling="yes"
                  onError={() => setError(true)}
                />
              </div>
            ) : (
              <iframe
                className="w-full h-full"
                src={liveUrl}
                title={`Live preview of ${title ?? ''}`}
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-pointer-lock allow-modals"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                loading="eager"
                scrolling="yes"
                onError={() => setError(true)}
              />
            )}
          </div>
        )}
      </div>

      {/* Bottom: Case Study + Open Live buttons (mobile only, precise text) */}
      {isMobileDevice && (
        <div className="px-3 py-1.5 flex items-center gap-2 justify-between">
          <Link
            href={caseStudyUrl}
            className={`${inactiveBase} flex-1 justify-center py-1`}
          >
            <ArrowUpRight className="h-3 w-3" />
            <span className="text-xs">Case Study</span>
          </Link>
          <button
            onClick={handleOpenLive}
            className={`${inactiveBase} flex-1 justify-center py-1`}
            aria-label={`Open live site for ${title ?? ''}`}
          >
            <ExternalLink className="h-3 w-3" />
            <span className="text-xs">Open Live</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ProjectPreview
