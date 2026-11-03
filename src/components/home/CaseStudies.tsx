import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { SectionHeading } from '@/components/shared/layout/SectionHeading'
import { WORK_CONTENT } from '@/data/work'
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function CaseStudies({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const { headline, subhead, builds: allBuilds } = WORK_CONTENT
  const builds = featuredOnly ? allBuilds.filter((build) => build.featured) : allBuilds

  return (
    <section className="border-b-4 border-display" id="work">
      <SectionContainer className="py-20 lg:py-28">
        <SectionHeading headline={headline} subhead={subhead} />

        <div className="border-2 border-display">
          {builds.map((build, i) => (
            <div
              key={build.title}
              className={`grid grid-cols-1 lg:grid-cols-2 ${i > 0 ? 'border-t-2 border-display' : ''}`}
            >
              {/* Visual / Architecture diagram side */}
              <div
                className={`relative p-8 sm:p-12 bg-subtle swiss-grid-pattern flex items-center justify-center min-h-70 border-b-2 lg:border-b-0 border-display ${
                  i % 2 === 1 ? 'lg:order-2' : 'lg:border-r-2'
                }`}
              >
                {/* Screenshot of the live build */}
                <div className="relative w-full aspect-16/10 border-2 border-display bg-white shadow-[8px_8px_0_0_var(--color-display)]">
                  <Image
                    src={build.image}
                    alt={build.imageAlt}
                    fill
                    sizes="(max-width: 1023px) 90vw, 45vw"
                    className="object-cover object-top"
                  />
                </div>
              </div>

              {/* Content side */}
              <div
                className={`flex flex-col justify-center p-8 sm:p-12 ${i % 2 === 1 ? 'lg:order-1 lg:border-r-2 lg:border-display' : ''}`}
              >
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-display leading-tight">
                  {build.title}
                </h3>

                <p className="mt-2 text-sm text-muted leading-relaxed">{build.outcome}</p>

                {/* Links */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={`/work/${build.slug}`}
                    className="inline-flex items-center gap-1.5 bg-display px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-inverse hover:bg-accent transition-all duration-150 touch-manipulation active:scale-95 active:translate-y-0.5 md:active:scale-100 md:active:translate-y-0"
                  >
                    Read Case Study <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={build.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 border-2 border-display px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-display hover:bg-display hover:text-inverse transition-all duration-150 touch-manipulation active:scale-95 active:translate-y-0.5 md:active:scale-100 md:active:translate-y-0"
                  >
                    Visit Live Site <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {featuredOnly && (
          <Link href="/work" className="mt-10 flex justify-center">
            <div className="inline-flex items-center gap-1.5 border-2 border-display px-6 py-3 text-xs font-bold uppercase tracking-wider text-display hover:bg-display hover:text-inverse transition-all duration-150 touch-manipulation active:scale-95 active:translate-y-0.5 md:active:scale-100 md:active:translate-y-0">
              See More Projects <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        )}
      </SectionContainer>
    </section>
  )
}

export default CaseStudies
