'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface BrandLoaderProps {
  /** Size variant: sm (cards/modals), md (sections/guards), lg (pages/routes), xl (hero) */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Occupies full viewport height with white canvas background */
  fullScreen?: boolean
  /** Optional status message underneath */
  message?: string
  /** Custom wrapper classes */
  className?: string
}

const SIZE_MAP = {
  sm: {
    container: 'size-32',
    blur: 'size-20',
    orbit: 'w-28 h-16',
    logo: 32,
  },
  md: {
    container: 'size-44',
    blur: 'size-28',
    orbit: 'w-36 h-20',
    logo: 44,
  },
  lg: {
    container: 'size-52',
    blur: 'size-32',
    orbit: 'w-44 h-24',
    logo: 56,
  },
  xl: {
    container: 'size-64',
    blur: 'size-40',
    orbit: 'w-52 h-28',
    logo: 72,
  },
} as const

export function BrandLoader({
  size = 'md',
  fullScreen = false,
  message,
  className,
}: BrandLoaderProps) {
  const config = SIZE_MAP[size]

  const loaderVisual = (
    <div
      className={cn(
        'relative flex items-center justify-center select-none pointer-events-none',
        config.container,
      )}
      aria-label="Loading..."
      role="status"
    >
      {/* 1. Ambient Core Glow — Swiss Red */}
      <motion.div
        animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.15, 0.35, 0.15] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className={cn(
          'absolute rounded-full bg-accent/20 blur-3xl pointer-events-none',
          config.blur,
        )}
      />

      {/* 2. Orbit 1: Clockwise — Swiss Red border */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
        className={cn(
          'absolute rounded-full border border-accent/20 border-t-accent -rotate-12',
          config.orbit,
        )}
      />

      {/* 3. Orbit 2: Counter-Clockwise — Obsidian black border */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
        className={cn(
          'absolute rounded-full border border-obsidian/15 border-b-obsidian rotate-45',
          config.orbit,
        )}
      />

      {/* 4. Floating Devtrop Logo */}
      <motion.div
        animate={{ scale: [0.94, 1.06, 0.94] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        className="relative z-10 flex items-center justify-center"
      >
        <Image
          src="/devtrop_logo_transparent_bg_resized.png"
          alt="Devtrop"
          width={config.logo}
          height={config.logo}
          priority
          style={{ width: 'auto', height: 'auto' }}
          className="w-auto h-auto object-contain"
        />
      </motion.div>
    </div>
  )

  if (fullScreen) {
    return (
      <div
        className={cn(
          'min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center p-6 bg-canvas text-center animate-in fade-in duration-300',
          className,
        )}
      >
        {loaderVisual}
        {message && (
          <p className="mt-4 text-xs font-mono tracking-[0.15em] text-muted uppercase animate-pulse">
            {message}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-4 text-center', className)}>
      {loaderVisual}
      {message && (
        <p className="mt-3 text-xs font-mono tracking-[0.15em] text-muted uppercase">
          {message}
        </p>
      )}
    </div>
  )
}
