import Link from 'next/link'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { LOGIN_PAGE_CONTENT } from '@/data/auth'
import { SITE_CONFIG } from '@/data/site'

interface LoginShellProps {
  children: React.ReactNode
}

/**
 * Split editorial frame for the console sign-in route.
 *
 * Server-rendered: the black identity panel is static markup, so the only
 * JavaScript on this page is the form island. No indexable marketing content
 * is duplicated here.
 */
export function LoginShell({ children }: LoginShellProps) {
  const { eyebrow, brandSuffix, footerNote, titleLines, description, meta, support } =
    LOGIN_PAGE_CONTENT

  return (
    <section className="relative flex-1 border-b-4 border-display bg-canvas">
      {/* Background texture */}
      <div className="pointer-events-none absolute inset-0 swiss-grid-pattern" aria-hidden="true" />

      <SectionContainer className="relative z-10 py-10 sm:py-14 lg:py-20">
        <div className="grid grid-cols-1 border-2 border-display bg-canvas shadow-[10px_10px_0_0_var(--color-display)] lg:grid-cols-2">
          {/* ── Identity panel ─────────────────────────────────────── */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-display p-7 text-inverse sm:p-10 lg:p-12">
            <div
              className="pointer-events-none absolute inset-0 swiss-grid-pattern-light"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full border-[14px] border-accent/25"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -bottom-10 right-2 select-none font-black leading-none tracking-tighter text-inverse/[0.05] text-[10rem] sm:text-[13rem]"
              aria-hidden="true"
            >
              01
            </span>

            <div className="relative z-10">
              {/* Wordmark */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/"
                  aria-label="Devtrop Studio Home"
                  className="group inline-flex items-baseline gap-0.5 text-xl font-black tracking-tight text-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  devtrop
                  <span className="text-accent transition-transform duration-150 group-hover:translate-y-0.5">
                    .
                  </span>
                </Link>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-inverse/50">
                  {brandSuffix}
                </span>
              </div>

              {/* Editorial headline */}
              <div className="mt-10 sm:mt-16">
                <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-inverse/60">
                  <span className="h-2.5 w-2.5 bg-accent" aria-hidden="true" />
                  {eyebrow}
                </p>

                <h1 className="mt-4 text-5xl font-black uppercase leading-[0.88] tracking-tighter sm:text-6xl">
                  {titleLines.map((line, index) => (
                    <span
                      key={line}
                      className={index === titleLines.length - 1 ? 'block text-accent' : 'block'}
                    >
                      {line}
                    </span>
                  ))}
                </h1>

                <p className="mt-6 max-w-sm text-sm leading-relaxed text-inverse/60">
                  {description}
                </p>
              </div>

              {/* System metadata — facts only. Held back on small screens so the
                  form stays within the first viewport. */}
              <dl className="mt-10 hidden border-y border-inverse/15 lg:block">
                {meta.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-baseline justify-between gap-6 border-b border-inverse/15 py-3 last:border-b-0"
                  >
                    <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-inverse/55">
                      {item.label}
                    </dt>
                    <dd className="text-right font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-inverse">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Access request — desktop companion to the form's support link */}
            <div className="relative z-10 mt-10 hidden border border-inverse/20 p-4 sm:p-5 lg:block">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                {support.label}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-inverse/60">{support.description}</p>
              <a
                href={`mailto:${SITE_CONFIG.contactEmail}?subject=Console%20Access%20Request`}
                className="group mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-inverse underline decoration-accent decoration-2 underline-offset-4 transition-colors duration-150 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {support.cta}
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>

          {/* ── Form panel ─────────────────────────────────────────── */}
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">{children}</div>
        </div>

        <p className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-display" aria-hidden="true" />
          {footerNote}
        </p>
      </SectionContainer>
    </section>
  )
}
