import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { PageShell } from '@/components/shared/layout/PageShell'
import { ServicesGrid } from '@/components/home/ServicesGrid'
import { ProcessSection } from '@/components/home/ProcessSection'
import { TechMatrix } from '@/components/home/TechMatrix'
import { ClosingCta } from '@/components/home/ClosingCta'
import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { SITE_CONFIG } from '@/data/site'

export const metadata: Metadata = {
  title: 'Services — Full-Stack Web & SaaS Engineering',
  description:
    'Full-stack web and SaaS engineering services: 0-to-1 MVP builds, SaaS platform engineering, application modernization, cloud infrastructure, and DevOps. Delivered in 14-day sprints with 100% IP transfer.',
  keywords: [
    'SaaS MVP development services',
    'web application engineering services',
    'platform modernization services',
    'cloud infrastructure DevOps services',
    'application modernization company',
    'code audit service',
    'dedicated engineering squad',
    'full-stack development retainer',
    'Next.js TypeScript development services',
    'React web app development',
    'Node.js backend engineering',
    'PostgreSQL database development',
    'Devtrop services',
    'what does Devtrop build',
    'Devtrop web development services',
    'hire web development team',
    'outsource full-stack development',
    '14-day sprint development',
    '0 to 1 product build',
    'MVP web app development',
    'white-label SaaS engineering',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/services`,
  },
  openGraph: {
    title: 'From Zero to Production SaaS — Services Built Around Your Roadmap',
    description:
      '0-to-1 MVP builds, SaaS platform engineering, modernization, cloud infrastructure. Delivered in strict 14-day sprints with 100% IP transfer.',
    url: `${SITE_CONFIG.url}/services`,
    images: [
      { url: '/og-default.png', width: 1200, height: 630, alt: 'Devtrop Engineering Services' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'From Zero to Production SaaS — Services Built Around Your Roadmap',
    description:
      '0-to-1 MVP builds, SaaS platform engineering, modernization, cloud infrastructure. 14-day sprints, 100% IP transfer.',
    images: ['/og-default.png'],
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_CONFIG.url },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_CONFIG.url}/services` },
  ],
}

export default function ServicesPage() {
  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ServicesGrid />
      <ProcessSection />
      <TechMatrix />

      {/* View Our Packages banner */}
      <section className="border-b-4 border-display bg-subtle swiss-dots relative">
        <SectionContainer className="relative z-10 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-accent mb-2">
                Ready to get started?
              </p>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-[0.9] text-display">
                See what&apos;s included
                <br className="hidden sm:block" /> in each package
              </h2>
              <p className="mt-3 text-sm text-muted leading-relaxed max-w-md">
                Clear packages, no hidden fees. From a professional business website to a full
                custom SaaS platform and ongoing maintenance.
              </p>
            </div>
            <Link
              href="/packages"
              className="group inline-flex items-center gap-3 border-2 border-display bg-accent px-7 py-4 text-sm font-bold uppercase tracking-wider text-accent-soft hover:bg-accent-hover hover:text-inverse transition-all duration-150 shrink-0"
            >
              View Our Packages
              <ArrowUpRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </SectionContainer>
      </section>

      <ClosingCta />
    </PageShell>
  )
}
