import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { SectionHeading } from '@/components/shared/layout/SectionHeading'

const VALUES = [
  {
    number: '01',
    title: 'Honesty over hype',
    description:
      "We don't pad portfolios with fake metrics or borrowed logos. Every claim we make is verifiable — shipped code, open repos, measurable outcomes.",
  },
  {
    number: '02',
    title: 'Craft, not output',
    description:
      'We write production-grade code from day one. No prototypes dressed up as products. No tech debt disguised as speed.',
  },
  {
    number: '03',
    title: 'Direct partnership',
    description:
      'You talk to the lead engineer, not a project manager. Decisions are made fast, context is never lost in translation.',
  },
  {
    number: '04',
    title: 'Architecture first',
    description:
      'We spend the first week understanding your domain before writing a single line. The right architecture pays dividends for years.',
  },
  {
    number: '05',
    title: 'Long-term thinking',
    description:
      "We optimise for the system you'll have in three years, not just the demo you need next month.",
  },
  {
    number: '06',
    title: 'Transparent tradeoffs',
    description:
      'Every engineering decision has a cost. We explain the tradeoffs plainly and let you choose with full information.',
  },
]

const STACK_PILLARS = [
  { label: 'Frontend', items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'] },
  { label: 'Backend', items: ['Express.js', 'Nest.js', 'PostgreSQL', 'Redis'] },
  { label: 'Infrastructure', items: ['Vercel', 'AWS', 'Docker', 'GitHub Actions'] },
  { label: 'Tooling', items: ['Vitest', 'Playwright', 'Sentry', 'Stripe'] },
]

export function AboutContent() {
  return (
    <>
      {/* ── Studio intro ─────────────────────────────────────────── */}
      <section className="border-b-4 border-display">
        <SectionContainer className="py-20 lg:py-28">
          <SectionHeading
            sectionNumber="01"
            sectionLabel="About"
            headline="A studio built on shipped work"
            subhead="Devtrop is a full-stack web and SaaS engineering studio. We partner with ambitious product teams to turn roadmaps into production-grade software — on time, without cutting corners."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-2 border-display">
            {/* Mission block */}
            <div className="p-8 sm:p-12 border-b-2 lg:border-b-0 lg:border-r-2 border-display">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-display mb-4">
                What we do
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                We engineer scalable web applications and SaaS platforms. Our work spans product
                design systems, multi-tenant data architectures, real-time pipelines, and
                public-facing marketing sites built to convert.
              </p>
              <p className="mt-4 text-sm text-muted leading-relaxed">
                We don&apos;t take on more clients than we can serve well. Every engagement gets our
                full attention and a direct line to the engineer writing the code.
              </p>
            </div>

            {/* Who we work with block */}
            <div className="p-8 sm:p-12">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-display mb-4">
                Who we work with
              </h3>
              <ul className="space-y-3">
                {[
                  'Early-stage startups shipping their first production SaaS',
                  'Scale-up teams outgrowing their existing architecture',
                  'Founders who need a technical co-pilot without a full-time hire',
                  'Agencies that need a reliable engineering subcontractor',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 bg-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionContainer>
      </section>

      {/* ── Values ───────────────────────────────────────────────── */}
      <section className="border-b-4 border-display bg-subtle swiss-dots relative">
        <SectionContainer className="relative z-10 py-20 lg:py-28">
          <SectionHeading
            sectionNumber="02"
            sectionLabel="Our values"
            headline="The principles we won't compromise"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-2 border-display">
            {VALUES.map((v, i) => (
              <div
                key={v.number}
                className={[
                  'group p-8 sm:p-10 bg-canvas hover:bg-display transition-colors duration-150 border-display',
                  i < VALUES.length - 1 ? 'border-b-2' : '',
                  'md:border-b-0',
                  i % 2 !== 1 ? 'md:border-r-2' : 'md:border-r-0',
                  i % 3 !== 2 ? 'lg:border-r-2' : 'lg:border-r-0',
                  i >= 3 ? 'lg:border-t-2' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="block text-3xl font-black text-accent tracking-tighter mb-4 group-hover:text-inverse transition-colors duration-150">
                  {v.number}
                </span>
                <h3 className="text-base font-black uppercase tracking-wider text-display group-hover:text-inverse transition-colors duration-150">
                  {v.title}
                </h3>
                <p className="mt-3 text-xs text-muted leading-relaxed group-hover:text-inverse/70 transition-colors duration-150">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </SectionContainer>
      </section>

      {/* ── Tech pillars ─────────────────────────────────────────── */}
      <section className="border-b-4 border-display">
        <SectionContainer className="py-20 lg:py-28">
          <SectionHeading
            sectionNumber="03"
            sectionLabel="Technology"
            headline="Our default stack"
            subhead="We choose tools for their production track record, not their hype cycle. Every pick is replaceable if your context demands it."
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 border-2 border-display">
            {STACK_PILLARS.map((pillar, i) => (
              <div
                key={pillar.label}
                className={[
                  'p-4 md:p-8 border-display',
                  // Mobile (2-col): bottom border only on row 1 (indices 0 & 1)
                  i < 2 ? 'border-b-2' : '',
                  // Mobile (2-col): right border on left column (even indices)
                  i % 2 === 0 ? 'border-r-2' : '',
                  // Desktop (4-col): no bottom borders, right border on all but last
                  i < STACK_PILLARS.length - 1 ? 'lg:border-r-2 lg:border-b-0' : 'lg:border-r-0',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-display mb-5 pb-3 border-b-2 border-display">
                  {pillar.label}
                </h3>
                <ul className="space-y-2.5">
                  {pillar.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted">
                      <span className="h-1.5 w-1.5 bg-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionContainer>
      </section>

      {/* ── CTA strip ────────────────────────────────────────────── */}
      <section className="bg-display swiss-grid-pattern-light relative">
        <SectionContainer className="relative z-10 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-inverse/40 mb-2">
                Ready to build?
              </p>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-inverse">
                Let&apos;s talk about your project
              </h2>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent px-8 py-4 text-sm font-bold uppercase tracking-wider text-inverse hover:bg-accent-hover transition-colors duration-150 shrink-0"
            >
              Get in touch
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </SectionContainer>
      </section>
    </>
  )
}
