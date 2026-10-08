import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { BookDiscoveryCallButton } from '@/components/shared/BookDiscoveryCallButton'
import { LegalDocument } from '@/data/legal'
import { env } from '@/lib/env'

interface LegalPageContentProps {
  document: LegalDocument
}

export function LegalPageContent({ document }: LegalPageContentProps) {
  const gmail = env.GMAIL_INFO

  return (
    <div className="w-full bg-canvas">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <section className="border-b-4 border-display bg-subtle swiss-grid-pattern relative">
        <SectionContainer className="relative z-10 py-16 lg:py-24">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted hover:text-accent transition-colors duration-150 mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="max-w-4xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-4">
              <span className="h-2 w-2 bg-accent shrink-0" />
              <span className="font-mono text-xs uppercase tracking-widest font-black text-muted">
                {document.eyebrow}
              </span>
            </div>

            {/* H1 Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-display">
              {document.title}
            </h1>

            {/* Meta Line */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-wider text-muted">
              <span>Effective Date: {document.lastUpdated}</span>
              <span className="text-display/20">•</span>
              <span>Devtrop Engineering Studio</span>
            </div>

            {/* Core Principle Callout */}
            <div className="mt-8 p-6 sm:p-8 border-2 border-display bg-canvas">
              <span className="inline-block px-3 py-1 bg-display text-inverse font-mono text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                {document.summaryBadge}
              </span>
              <p className="text-sm sm:text-base font-medium text-display leading-relaxed">
                {document.summaryText}
              </p>
            </div>
          </div>
        </SectionContainer>
      </section>

      {/* ── Document Sections ───────────────────────────────────── */}
      <section className="border-b-4 border-display">
        <SectionContainer className="py-16 lg:py-24">
          <div className="border-2 border-display divide-y-2 divide-display bg-canvas">
            {document.sections.map((sec) => (
              <article key={sec.number} className="p-8 sm:p-10 lg:p-12">
                <div className="flex items-start gap-4 sm:gap-6 mb-6">
                  <span className="font-mono text-xs sm:text-sm font-black text-accent tracking-widest pt-1 shrink-0">
                    {sec.number}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-display leading-tight">
                    {sec.title}
                  </h2>
                </div>

                <div className="pl-8 sm:pl-11 space-y-4 text-sm sm:text-base text-body leading-relaxed max-w-4xl">
                  {sec.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {/* Direct Legal Inquiries Banner */}
          <div className="mt-12 p-8 sm:p-12 border-2 border-display bg-display text-inverse flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight text-inverse">
                Questions about our terms or confidentiality?
              </h3>
              <p className="mt-3 text-sm text-inverse/70 leading-relaxed">
                We provide custom Master Services Agreements (MSAs) and mutual Non-Disclosure
                Agreements (NDAs) for funded startups and enterprise clients.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <BookDiscoveryCallButton />
              <a
                href={`mailto:${gmail}`}
                className="inline-flex items-center gap-2 px-6 py-4 border-2 border-inverse/30 text-xs font-bold uppercase tracking-wider text-inverse hover:bg-inverse hover:text-display transition-colors duration-150"
              >
                <Mail className="h-4 w-4" />
                <span>Email Founders</span>
              </a>
            </div>
          </div>
        </SectionContainer>
      </section>
    </div>
  )
}

export default LegalPageContent
