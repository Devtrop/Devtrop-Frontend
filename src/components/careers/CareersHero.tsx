'use client'

import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { ArrowDown } from 'lucide-react'

export function CareersHero() {
  return (
    <section className="relative border-b-4 border-display overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 swiss-grid-pattern pointer-events-none" />

      <SectionContainer className="relative z-10 py-16 lg:py-24">
        <div className="max-w-4xl">
          {/* Section label */}
          <div className="flex items-center gap-2 mb-6">
            <span className="h-2.5 w-2.5 bg-accent" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              Open Positions
            </span>
          </div>

          {/* Massive Typography */}
          <h1 className="flex flex-col">
            <span className="block font-black uppercase leading-[0.85] tracking-tighter text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-display">
              Build
            </span>
            <span className="block font-black uppercase leading-[0.85] tracking-tighter text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-accent">
              Software
            </span>
            <span className="block font-black uppercase leading-[0.85] tracking-tighter text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-display">
              That Matters
            </span>
          </h1>

          {/* Subhead */}
          <p className="mt-8 text-base sm:text-lg text-muted leading-relaxed max-w-2xl">
            Join Devtrop and ship production-grade web applications with a team that values
            engineering excellence, ownership, and continuous learning. We work with funded
            startups and ambitious product teams.
          </p>

          {/* Values Grid */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 border-2 border-display">
            <div className="p-6 border-b-2 sm:border-b-0 sm:border-r-2 border-display">
              <div className="text-2xl font-black text-display">01</div>
              <div className="mt-2 text-sm font-bold uppercase tracking-wide text-body">
                Craftsmanship
              </div>
              <p className="mt-1 text-xs text-muted">Production-grade code, strict TypeScript</p>
            </div>
            <div className="p-6 border-b-2 sm:border-b-0 sm:border-r-2 border-display">
              <div className="text-2xl font-black text-display">02</div>
              <div className="mt-2 text-sm font-bold uppercase tracking-wide text-body">
                Ownership
              </div>
              <p className="mt-1 text-xs text-muted">Own features end-to-end, ship to production</p>
            </div>
            <div className="p-6">
              <div className="text-2xl font-black text-display">03</div>
              <div className="mt-2 text-sm font-bold uppercase tracking-wide text-body">Growth</div>
              <p className="mt-1 text-xs text-muted">Learn modern stack, solve real problems</p>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-12 flex items-center gap-3">
            <ArrowDown className="h-5 w-5 text-accent animate-bounce" />
            <span className="text-xs font-mono uppercase tracking-[0.15em] text-muted">
              View Open Positions
            </span>
          </div>
        </div>
      </SectionContainer>
    </section>
  )
}
