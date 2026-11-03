import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { SectionHeading } from '@/components/shared/layout/SectionHeading'
import { ProjectPreview } from '@/components/home/ProjectPreview'
import { WORK_CONTENT } from '@/data/work'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export function CaseStudies({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const { headline, subhead, builds: allBuilds } = WORK_CONTENT
  let builds = featuredOnly ? allBuilds.filter((build) => build.featured) : allBuilds

  // Desired order: feletrip, biponiq, uparzo
  const order = ['feletrip', 'biponiq', 'uparzo']
  builds = [...builds].sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug))

  return (
    <section className="border-b-4 border-display" id="work">
      <SectionContainer className="py-20 lg:py-28">
        <SectionHeading headline={headline} subhead={subhead} />

        {builds.map((build, i) => (
          <div key={build.title} className={i > 0 ? 'mt-16 lg:mt-24' : ''}>
            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-display leading-tight mb-4">
              {build.title}
            </h3>
            {/* Interactive live preview of the build - full width */}
            <div className="bg-subtle swiss-grid-pattern p-8 sm:p-12">
              <ProjectPreview
                liveUrl={build.liveUrl}
                caseStudyUrl={`/work/${build.slug}`}
                image={build.image}
                imageAlt={build.imageAlt}
                title={build.title}
              />
            </div>
          </div>
        ))}

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
