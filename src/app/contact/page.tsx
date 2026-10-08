import type { Metadata } from 'next'
import { PageShell } from '@/components/shared/layout/PageShell'
import { EngagementModels } from '@/components/home/EngagementModels'
import { EngineeringFaq } from '@/components/home/EngineeringFaq'
import { ClosingCta } from '@/components/home/ClosingCta'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Book a free 30-minute architecture review with Devtrop's lead engineer. Direct access, no sales pressure. We give architecture advice even if we don't work together.",
  keywords: [
    'book a discovery call',
    'hire full-stack engineers',
    'software engineering consultation',
    'web development inquiry',
    'SaaS development contact',
    'architecture review',
    'Devtrop contact',
  ],
  alternates: {
    canonical: 'https://devtrop.com/contact',
  },
  openGraph: {
    title: 'Talk to the Engineer Who Will Actually Build Your Product — Devtrop',
    description:
      "30-minute architecture review. Direct with the lead engineer. No sales pressure. We give advice even if we don't work together.",
    url: 'https://devtrop.com/contact',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Contact Devtrop' }],
  },
  twitter: {
    title: 'Talk to the Engineer Who Will Actually Build Your Product — Devtrop',
    description: '30-minute architecture review. Direct with the lead engineer. No sales pressure.',
    images: ['/og-default.png'],
  },
}

export default function ContactPage() {
  return (
    <PageShell>
      <EngagementModels />
      <EngineeringFaq />
      <ClosingCta />
    </PageShell>
  )
}
