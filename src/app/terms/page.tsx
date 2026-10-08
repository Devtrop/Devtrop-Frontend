import type { Metadata } from 'next'
import { PageShell } from '@/components/shared/layout/PageShell'
import { LegalPageContent } from '@/components/shared/legal/LegalPageContent'
import { TERMS_OF_SERVICE } from '@/data/legal'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Devtrop Terms of Service. 100% intellectual property ownership to you, 14-day sprint cadences, bi-weekly staging deliverables, and an included 30-day hyper-care warranty.',
  keywords: [
    'Devtrop terms of service',
    'working agreement software engineering',
    'IP ownership software development',
    '14-day sprint agreement',
    'hyper-care warranty',
  ],
  alternates: {
    canonical: 'https://devtrop.com/terms',
  },
  openGraph: {
    title: 'Terms of Service — Devtrop Engineering Studio',
    description:
      '100% IP ownership, 14-day sprint cadences, and an included 30-day hyper-care warranty.',
    url: 'https://devtrop.com/terms',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Devtrop Terms of Service' }],
  },
  twitter: {
    title: 'Terms of Service — Devtrop Engineering Studio',
    description:
      '100% IP ownership, 14-day delivery sprints, and an included 30-day hyper-care warranty.',
    images: ['/og-default.png'],
  },
}

export default function TermsPage() {
  return (
    <PageShell>
      <LegalPageContent document={TERMS_OF_SERVICE} />
    </PageShell>
  )
}
