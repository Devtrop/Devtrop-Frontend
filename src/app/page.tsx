import type { Metadata } from 'next'
import { PageShell } from '@/components/shared/layout/PageShell'
import { Hero } from '@/components/home/Hero'
import { ProofBar } from '@/components/home/ProofBar'
import { ServicesGrid } from '@/components/home/ServicesGrid'
import { CaseStudies } from '@/components/home/CaseStudies'
import { EngineeringFaq } from '@/components/home/EngineeringFaq'
import { ClosingCta } from '@/components/home/ClosingCta'

export const metadata: Metadata = {
  title: 'Devtrop — Web Development & Digital Solutions',
  description:
    'Devtrop engineers production-grade web applications and SaaS platforms for funded startups and ambitious product teams. Strict TypeScript, 14-day sprints, 100% IP transfer.',
  keywords: [
    'full-stack web development',
    'SaaS MVP development',
    'Next.js engineers for hire',
    'React TypeScript development',
    'web engineering studio',
    'production-grade web app',
    'SaaS platform development',
    'startup software engineering',
  ],
  alternates: {
    canonical: 'https://devtrop.com',
  },
  openGraph: {
    title: 'Devtrop — Full-Stack Web & SaaS Engineering Studio',
    description:
      'We build production-grade web applications and SaaS platforms. Strict TypeScript, 14-day delivery sprints, 100% IP ownership.',
    url: 'https://devtrop.com',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Devtrop — Full-Stack Web & SaaS Engineering Studio',
      },
    ],
  },
  twitter: {
    title: 'Devtrop — Full-Stack Web & SaaS Engineering Studio',
    description:
      'We build production-grade web applications and SaaS platforms. Strict TypeScript, 14-day sprints, 100% IP ownership.',
    images: ['/og-default.png'],
  },
}

export default function HomePage() {
  return (
    <PageShell>
      <Hero />
      <ProofBar />
      <ServicesGrid />
      <CaseStudies featuredOnly />
      <EngineeringFaq />
      <ClosingCta />
    </PageShell>
  )
}
