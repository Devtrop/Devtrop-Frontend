'use client'

import { useState } from 'react'
import { type PackagePlan } from '@/data/packages'
import { whatsappUrl, WHATSAPP_MESSAGES } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

const YEARLY_PRICE = '$419'

export function MaintenanceToggle({ plan }: { plan: PackagePlan }) {
  const [yearly, setYearly] = useState(false)

  return (
    <div className="mt-4 lg:mt-6">
      {/* ── Toggle ── */}
      <div className="flex justify-end mb-3">
        <div className="flex items-center border-2 border-display overflow-hidden">
          <button
            onClick={() => setYearly(false)}
            className={cn(
              'px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-150',
              !yearly ? 'bg-display text-inverse' : 'bg-canvas text-muted hover:text-display'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={cn(
              'px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-150',
              yearly ? 'bg-display text-inverse' : 'bg-canvas text-muted hover:text-display'
            )}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="flex flex-col border-2 border-display bg-canvas">
        {/* Body */}
        <div className="flex flex-col lg:flex-row flex-1">
          {/* Left: header */}
          <div className="px-5 pt-5 pb-4 sm:px-6 lg:w-[38%] lg:border-r-2 lg:border-display">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
              {plan.tier}
            </span>

            <h2 className="mt-1.5 text-xl font-black uppercase tracking-tight leading-tight text-display sm:text-2xl">
              {plan.title}
            </h2>

            {/* Price */}
            {plan.price && (
              <div className="mt-3 flex items-baseline gap-2.5">
                {/* Monthly price — dimmed + struck when yearly */}
                <div
                  className={cn(
                    'flex items-baseline gap-1 transition-opacity duration-150',
                    yearly && 'opacity-30'
                  )}
                >
                  <span
                    className={cn(
                      'text-3xl font-black tracking-tight text-display sm:text-4xl',
                      yearly && 'line-through decoration-display'
                    )}
                  >
                    {plan.price.amount}
                  </span>
                  {plan.price.suffix && (
                    <span className="text-base font-bold text-display/60">{plan.price.suffix}</span>
                  )}
                </div>

                {/* Yearly price — fades in */}
                {yearly && (
                  <div className="flex items-baseline gap-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black tracking-tight text-display sm:text-4xl">
                        {YEARLY_PRICE}
                      </span>
                      <span className="text-base font-bold text-display/60">/mo</span>
                    </div>
                    {/* <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white px-1 py-0.5 bg-accent">
                      Save 16%
                    </span> */}
                    <span className="animate-shine inline-block bg-accent px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-inverse">
                      SAVE 16%
                    </span>
                  </div>
                )}
              </div>
            )}

            <p className="mt-2 text-xs leading-relaxed text-muted">{plan.description}</p>

            {/* Mobile divider */}
            <div className="mt-4 h-px bg-black/10 lg:hidden" />
          </div>

          {/* Right: 2-col features */}
          <div className="px-5 pt-4 pb-4 sm:px-6 lg:w-[62%] lg:pt-5">
            <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-display/50">
              What you get
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              {plan.whatYouGet.map((item) => (
                <li key={item.text} className="flex items-start gap-2.5 text-xs leading-relaxed">
                  <span className="mt-[5px] h-1.5 w-1.5 shrink-0 bg-accent" />
                  <span className="text-display/80">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <a
          href={whatsappUrl(WHATSAPP_MESSAGES.maintenance)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto block w-full px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider bg-display text-inverse hover:bg-accent transition-colors duration-150"
        >
          {plan.ctaLabel}
        </a>
      </div>
    </div>
  )
}
