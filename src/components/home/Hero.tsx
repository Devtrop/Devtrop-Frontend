'use client'

import { ArrowDown } from 'lucide-react'
import Link from 'next/link'
import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { HERO_CONTENT } from '@/data/hero'
import { ScopeEstimator } from './ScopeEstimator'
import { openBooking } from '@/lib/booking'

export function Hero() {
  const { headlineWords, subhead, primaryCta, secondaryCta } = HERO_CONTENT

  return (
    <section className="relative border-b-4 border-display overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 swiss-grid-pattern pointer-events-none" />

      <SectionContainer className="relative z-10 py-16 lg:py-24">
        {/* Section number */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left — Massive Typography */}
          <div className="lg:col-span-7">
            <h1 className="flex flex-col">
              {headlineWords.map((word, i) => (
                <span
                  key={word}
                  className={`block font-black uppercase leading-[0.85] tracking-tighter ${
                    i === 1
                      ? 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-accent'
                      : 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-display'
                  }`}
                >
                  {word}
                </span>
              ))}
            </h1>

            {/* Subhead — left-aligned, flush */}
            <p className="mt-8 text-base sm:text-lg text-muted leading-relaxed max-w-lg">
              {subhead}
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {/* Primary — Calendly booking */}
              <button
                onClick={() => openBooking()}
                className="inline-flex items-center bg-display px-8 py-4 text-sm font-bold uppercase tracking-wider text-inverse hover:bg-accent cursor-pointer transition-all duration-150 touch-manipulation active:scale-95 active:translate-y-0.5 md:active:scale-100 md:active:translate-y-0"
              >
                {primaryCta.label}
              </button>

              {/* Secondary */}
              <Link
                href={secondaryCta.href}
                className="group inline-flex items-center gap-2 px-6 py-4 border-2 border-display text-sm font-bold uppercase tracking-wider text-display hover:bg-display hover:text-inverse transition-all duration-150 cursor-pointer touch-manipulation active:scale-95 active:translate-y-0.5 md:active:scale-100 md:active:translate-y-0"
              >
                {secondaryCta.label}
                <ArrowDown className="h-4 w-4 transition-transform duration-150 group-hover:translate-y-0.5" />
              </Link>
            </div>

            <p className="mt-4 text-xs text-muted tracking-wide">{primaryCta.helperText}</p>
          </div>

          {/* Right — Geometric Composition */}
          <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-md">
              {/* Large circle — grid pattern */}
              <div className="absolute top-[8%] right-[2%] w-[55%] aspect-square rounded-full border-4 border-display swiss-grid-pattern" />

              {/* Black filled rectangle */}
              <div className="absolute bottom-[18%] left-[8%] w-[50%] h-[30%] bg-display" />

              {/* Red horizontal accent bar */}
              <div className="absolute top-[45%] left-0 w-[75%] h-[4px] bg-accent" />

              {/* Small dot-matrix square */}
              <div className="absolute top-[5%] left-[12%] w-[28%] aspect-square border-4 border-display swiss-dots" />

              {/* Red accent circle */}
              <div className="absolute bottom-[8%] right-[12%] w-[18%] aspect-square rounded-full bg-accent" />

              {/* Thin vertical line */}
              <div className="absolute top-[15%] right-[35%] w-[2px] h-[60%] bg-display/20" />

              {/* Diagonal pattern block */}
              <div className="absolute bottom-[45%] right-[8%] w-[22%] h-[25%] border-2 border-display/30 swiss-diagonal" />
            </div>
          </div>
        </div>

        {/* Scope Estimator */}
        <div className="mt-16 lg:mt-20 pt-12 border-t-2 border-display">
          <ScopeEstimator />
        </div>
      </SectionContainer>
    </section>
  )
}

export default Hero
