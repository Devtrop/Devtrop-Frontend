import { Mail } from 'lucide-react'
import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { BookDiscoveryCallButton } from '@/components/shared/BookDiscoveryCallButton'
import { env } from '@/lib/env'

export function ClosingCta() {
  return (
    <section className="bg-display swiss-grid-pattern-light relative" id="contact">
      <SectionContainer className="relative z-10 py-20 lg:py-28">
        <div className="max-w-3xl">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-inverse">
            READY TO TURN YOUR ROADMAP INTO <span className="text-accent">PRODUCTION-GRADE</span>{' '}
            WEBSITE?
          </h2>

          <p className="mt-6 text-base sm:text-lg text-inverse/60 leading-relaxed max-w-xl">
            30-minute architecture review. Direct with the lead engineer. No sales pressure. We give
            architecture advice even if we don&apos;t work together.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-4">
            <BookDiscoveryCallButton />
            <a
              href={`mailto:${env.GMAIL_INFO}`}
              className="inline-flex items-center gap-2 px-6 py-4 border-2 border-inverse/30 text-sm font-bold uppercase tracking-wider text-inverse hover:bg-inverse hover:text-display duration-150 transition-all cursor-pointer active:scale-95 active:translate-y-1 md:active:scale-100 md:active:translate-y-0"
            >
              <Mail className="h-4 w-4" />
              Email Founders Directly
            </a>
          </div>

          {/* Trust pills */}
          <div className="mt-10 flex flex-wrap gap-4">
            {[
              'Direct call with the lead engineer',
              'Mutual NDA before details',
              "Architecture advice even if we don't work together",
            ].map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center gap-2 text-xs text-inverse/50 uppercase tracking-wider font-medium"
              >
                <span className="h-1.5 w-1.5 bg-accent shrink-0" />
                {pill}
              </span>
            ))}
          </div>
        </div>
      </SectionContainer>
    </section>
  )
}

export default ClosingCta
