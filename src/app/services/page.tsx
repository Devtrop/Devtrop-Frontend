import type { Metadata } from 'next'
import { PageShell } from '@/components/shared/layout/PageShell'
import { ServicesGrid } from '@/components/home/ServicesGrid'
import { ProcessSection } from '@/components/home/ProcessSection'
import { TechMatrix } from '@/components/home/TechMatrix'
import { EngagementModels } from '@/components/home/EngagementModels'
import { EngineeringFaq } from '@/components/home/EngineeringFaq'
import { ClosingCta } from '@/components/home/ClosingCta'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Full-stack web and SaaS engineering services — 0-to-1 MVP builds, SaaS platform engineering, application modernization, cloud infrastructure, and DevOps. Delivered in 14-day sprints.',
  keywords: [
    'SaaS MVP development services',
    'web application engineering',
    'platform modernization services',
    'cloud infrastructure DevOps',
    'Next.js TypeScript engineers',
    'application modernization',
    'code audit service',
    'dedicated engineering squad',
    'full-stack development retainer',
  ],
  alternates: {
    canonical: 'https://devtrop.com/services',
  },
  openGraph: {
    title: 'From Zero to Production SaaS — Services Built Around Your Roadmap',
    description:
      '0-to-1 MVP builds, SaaS platform engineering, modernization, cloud infrastructure. Delivered in strict 14-day sprints with 100% IP transfer.',
    url: 'https://devtrop.com/services',
    images: [
      { url: '/og-default.png', width: 1200, height: 630, alt: 'Devtrop Engineering Services' },
    ],
  },
  twitter: {
    title: 'From Zero to Production SaaS — Services Built Around Your Roadmap',
    description:
      '0-to-1 MVP builds, SaaS platform engineering, modernization, cloud infrastructure. 14-day sprints, 100% IP transfer.',
    images: ['/og-default.png'],
  },
}

export default function ServicesPage() {
  return (
    <PageShell>
      <ServicesGrid />
      <ProcessSection />
      <TechMatrix />
      <EngagementModels />
      <EngineeringFaq />
      <ClosingCta />
    </PageShell>
  )
}
