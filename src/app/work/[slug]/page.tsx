import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, ArrowLeft } from 'lucide-react'
import { PageShell } from '@/components/shared/layout/PageShell'
import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { WORK_CONTENT, type ProofBuild } from '@/data/work'
import { SITE_CONFIG } from '@/data/site'

function LinkedText({ text, build }: { text: string; build: ProofBuild }) {
  const domain = new URL(build.liveUrl).hostname.replace(/^www\./, '')
  const pattern = new RegExp(`(${domain.replace(/\./g, '\\.')})`, 'g')
  const linkClass = 'text-accent underline underline-offset-2 hover:text-display transition-colors duration-150'

  return (
    <>
      {text.split(pattern).map((part, i) => {
        if (part === domain) {
          return (
            <a key={i} href={build.liveUrl} target="_blank" rel="noreferrer" className={linkClass}>
              {part}
            </a>
          )
        }
        return part
      })}
    </>
  )
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return WORK_CONTENT.builds.map((build) => ({ slug: build.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const build = WORK_CONTENT.builds.find((b) => b.slug === slug)
  if (!build) return {}

  return {
    title: `${build.title} | Case Study`,
    description: build.summary,
    alternates: {
      canonical: `${SITE_CONFIG.url}/work/${build.slug}`,
    },
    openGraph: {
      title: `${build.title} | Case Study`,
      description: build.outcome,
      url: `${SITE_CONFIG.url}/work/${build.slug}`,
      images: [{ url: build.image, width: 1200, height: 750, alt: build.imageAlt }],
    },
  }
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const build = WORK_CONTENT.builds.find((b) => b.slug === slug)
  if (!build) notFound()

  return (
    <PageShell>
      <section className="border-b-4 border-display">
        <SectionContainer className="py-16 lg:py-24">
          {/* Back link */}
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted hover:text-display transition-colors duration-150"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Work
          </Link>

          {/* Header */}
          <header className="mt-8">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
              {build.category}
            </span>
            <h1 className="mt-3 text-3xl sm:text-5xl font-black uppercase tracking-tighter text-display leading-[0.95]">
              {build.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted leading-relaxed">
              {build.outcome}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={build.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-display px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-inverse hover:bg-accent transition-all duration-150 touch-manipulation active:scale-95 active:translate-y-0.5 md:active:scale-100 md:active:translate-y-0"
              >
                Visit Live Site <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </header>

          {/* Screenshot */}
          <div className="relative mt-12 w-full aspect-16/10 border-2 border-display bg-white shadow-[8px_8px_0_0_var(--color-display)]">
            <Image
              src={build.image}
              alt={build.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 92vw, 1024px"
              className="object-cover object-top"
            />
          </div>

          {/* Summary */}
          <p className="mt-12 max-w-3xl text-sm sm:text-base text-muted leading-relaxed">
            <LinkedText text={build.summary} build={build} />
          </p>

          {/* Case study sections */}
          <div className="mt-12 space-y-10">
            {build.sections.map((section, i) => (
              <article key={section.heading}>
                <div className="flex items-baseline gap-3">
                  <span className="text-xs font-black uppercase tracking-widest text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-display">
                    {section.heading}
                  </h2>
                </div>
                <p className="mt-3 max-w-3xl text-sm sm:text-base text-muted leading-relaxed">
                  <LinkedText text={section.body} build={build} />
                </p>
              </article>
            ))}
          </div>

          {/* Deliverables + Stack */}
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-10 border-2 border-display p-8 sm:p-10">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-display">
                What Shipped
              </h2>
              <ul className="mt-4 space-y-2">
                {build.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden />
                    <LinkedText text={item} build={build} />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-display">
                Stack
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {build.stackTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 border-2 border-display/20 text-xs font-bold uppercase tracking-wider text-display"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer nav */}
          <div className="mt-14 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/work"
              className="inline-flex items-center gap-1.5 border-2 border-display px-6 py-3 text-xs font-bold uppercase tracking-wider text-display hover:bg-display hover:text-inverse transition-all duration-150 touch-manipulation active:scale-95 active:translate-y-0.5 md:active:scale-100 md:active:translate-y-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> See All Projects
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Built by Devtrop
            </span>
          </div>
        </SectionContainer>
      </section>
    </PageShell>
  )
}
