'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface BrandLoaderProps {
  /** Size variant: sm (cards/modals), md (sections/guards), lg (pages/routes), xl (hero) */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Occupies full viewport height with OLED black background */
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
      {/* 1. Ambient Core Glow */}
      <motion.div
        animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className={cn(
          'absolute rounded-full bg-emerald-400/25 blur-3xl pointer-events-none',
          config.blur,
        )}
      />

      {/* 2. Orbit 1: Clockwise Tilted Ellipse */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
        className={cn(
          'absolute rounded-full border border-emerald-500/30 border-t-emerald-300 shadow-[0_0_15px_rgba(39,255,150,0.3)] -rotate-12',
          config.orbit,
        )}
      />

      {/* 3. Orbit 2: Counter-Clockwise Opposing Tilted Ellipse */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
        className={cn(
          'absolute rounded-full border border-teal-400/30 border-b-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] rotate-45',
          config.orbit,
        )}
      />

      {/* 4. Floating Pure Logo Emblem */}
      <motion.div
        animate={{ scale: [0.94, 1.06, 0.94] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        className="relative z-10 flex items-center justify-center"
      >
        <Image
          src="/RT_Logo.png"
          alt="RiseTogether"
          width={config.logo}
          height={config.logo}
          priority
          style={{ width: 'auto', height: 'auto' }}
          className="w-auto h-auto object-contain drop-shadow-[0_0_18px_rgba(39,255,150,0.7)]"
        />
      </motion.div>
    </div>
  )

  if (fullScreen) {
    return (
      <div
        className={cn(
          'min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center p-6 bg-black text-center animate-in fade-in duration-300',
          className,
        )}
      >
        {loaderVisual}
        {message && (
          <p className="mt-4 text-xs font-mono tracking-wider text-emerald-400/90 uppercase animate-pulse">
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
        <p className="mt-3 text-xs font-mono tracking-wider text-emerald-400/80 uppercase">
          {message}
        </p>
      )}
    </div>
  )
}
