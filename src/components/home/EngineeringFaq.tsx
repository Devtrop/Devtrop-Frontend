'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { SectionHeading } from '@/components/shared/layout/SectionHeading'
import { FAQ_CONTENT } from '@/data/faq'
import { openBooking } from '@/lib/booking'
import { cn } from '@/lib/utils'

interface EngineeringFaqProps {
  id?: string
}

export function EngineeringFaq({ id = 'faq' }: EngineeringFaqProps) {
  const { sectionNumber, sectionLabel, headline, subhead, items } = FAQ_CONTENT
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)

  const toggleItem = (itemId: string) => {
    setOpenId((prev) => (prev === itemId ? null : itemId))
  }

  return (
    <section className="border-b-4 border-display bg-canvas relative" id={id}>
      <SectionContainer className="py-20 lg:py-28">
        <SectionHeading
          sectionNumber={sectionNumber}
          sectionLabel={sectionLabel}
          headline={headline}
          subhead={subhead}
        />

        {/* Swiss Accordion Stack */}
        <div className="border-2 border-display divide-y-2 divide-display bg-canvas">
          {items.map((item) => {
            const isOpen = openId === item.id

            return (
              <div
                key={item.id}
                className={cn(
                  'group transition-colors duration-150',
                  isOpen ? 'bg-subtle' : 'hover:bg-subtle'
                )}
              >
                <button
                  type="button"
                  id={`faq-button-${item.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${item.id}`}
                  onClick={() => toggleItem(item.id)}
                  className="w-full text-left p-6 sm:p-8 flex items-start justify-between gap-4 sm:gap-6 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <div className="flex items-start gap-4 sm:gap-6">
                    <span className="font-mono text-xs sm:text-sm font-black text-accent tracking-widest pt-0.5 shrink-0">
                      {item.number}
                    </span>
                    <h3 className="text-base sm:text-lg lg:text-xl font-black uppercase tracking-tight text-display group-hover:text-accent transition-colors duration-150 leading-snug">
                      {item.question}
                    </h3>
                  </div>

                  <span
                    aria-hidden="true"
                    className={cn(
                      'shrink-0 w-8 h-8 flex items-center justify-center border-2 border-display font-mono text-lg font-black transition-all duration-200 select-none',
                      isOpen
                        ? 'bg-display text-inverse rotate-45 border-display'
                        : 'bg-canvas text-display group-hover:border-accent group-hover:text-accent'
                    )}
                  >
                    +
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={`faq-panel-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-button-${item.id}`}
                    className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 animate-in fade-in duration-150"
                  >
                    <div className="pt-4 border-t border-display/10 pl-8 sm:pl-11">
                      <p className="text-sm sm:text-base text-body leading-relaxed max-w-3xl">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom helper bar */}
        <div className="mt-8 p-6 sm:p-8 border-2 border-display bg-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-display">
              Have a specific technical or architecture question?
            </p>
            <p className="mt-1 text-xs text-muted">
              We give candid architecture advice even if we don&apos;t work together.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openBooking()}
              className="inline-flex items-center gap-2 bg-display px-5 py-3 text-xs font-bold uppercase tracking-wider text-inverse hover:bg-accent cursor-pointer transition-colors duration-150"
            >
              <span>Ask Lead Engineer</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </SectionContainer>
    </section>
  )
}

export default EngineeringFaq
