import type { Metadata } from 'next'
import { PageShell } from '@/components/shared/layout/PageShell'
import { CaseStudies } from '@/components/home/CaseStudies'
import { WorkingAgreement } from '@/components/home/WorkingAgreement'

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Live builds from Devtrop: Uparzo multi-tenant e-commerce SaaS, Feletrip hotel booking marketplace, and Biponiq multi-vendor storefront builder. Every claim links to a production site you can open right now.',
  keywords: [
    'multi-tenant e-commerce SaaS',
    'Uparzo case study',
    'Feletrip hotel booking platform',
    'Next.js marketplace portfolio',
    'Prisma PostgreSQL SaaS',
    'web app portfolio',
    'software engineering case study',
  ],
  alternates: {
    canonical: 'https://devtrop.com/work',
  },
  openGraph: {
    title: 'Real Builds, Running in Production — Devtrop',
    description:
      'Uparzo: multi-tenant e-commerce SaaS with custom domains and subscription billing. Feletrip: hotel booking marketplace with vendor payouts. Both live.',
    url: 'https://devtrop.com/work',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Devtrop Live Builds' }],
  },
  twitter: {
    title: 'Real Builds, Running in Production — Devtrop',
    description:
      'Uparzo: multi-tenant e-commerce SaaS. Feletrip: hotel booking marketplace with vendor payouts. Open both in a new tab.',
    images: ['/og-default.png'],
  },
}

export default function WorkPage() {
  return (
    <PageShell>
      <CaseStudies />
      <WorkingAgreement />
    </PageShell>
  )
}
