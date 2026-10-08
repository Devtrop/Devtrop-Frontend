import type { Metadata } from 'next'
import { PageShell } from '@/components/shared/layout/PageShell'
import { AboutContent } from '@/components/about/AboutContent'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Devtrop is a full-stack web and SaaS engineering studio built on the Honesty Standard — no fake metrics, no fabricated testimonials. We ship proof builds you can fork, load-test, and examine.',
  keywords: [
    'about Devtrop',
    'software engineering studio',
    'honest software engineering',
    'full-stack engineers',
    'SaaS engineering team',
    'web development agency',
  ],
  alternates: {
    canonical: 'https://devtrop.com/about',
  },
  openGraph: {
    title: 'Meet the Engineers Behind Your Next Production Build — Devtrop',
    description:
      'No fake metrics. No fabricated testimonials. Devtrop is an engineering studio built on proof builds you can fork, load-test, and examine.',
    url: 'https://devtrop.com/about',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'About Devtrop' }],
  },
  twitter: {
    title: 'Meet the Engineers Behind Your Next Production Build — Devtrop',
    description:
      'No fake metrics. No fabricated testimonials. Devtrop ships proof builds you can fork and examine.',
    images: ['/og-default.png'],
  },
}

export default function AboutPage() {
  return (
    <PageShell>
      <AboutContent />
    </PageShell>
  )
}
