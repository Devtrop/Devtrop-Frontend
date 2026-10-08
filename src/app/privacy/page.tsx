import type { Metadata } from 'next'
import { PageShell } from '@/components/shared/layout/PageShell'
import { LegalPageContent } from '@/components/shared/legal/LegalPageContent'
import { PRIVACY_POLICY } from '@/data/legal'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Devtrop Privacy Policy. Minimal data collection, zero third-party advertising telemetry, and strict source code confidentiality for all client projects.',
  keywords: [
    'Devtrop privacy policy',
    'software engineering confidentiality',
    'data privacy Devtrop',
    'client IP protection',
  ],
  alternates: {
    canonical: 'https://devtrop.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy — Devtrop Engineering Studio',
    description:
      'Minimal data collection, zero advertising telemetry, and strict source code confidentiality.',
    url: 'https://devtrop.com/privacy',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Devtrop Privacy Policy' }],
  },
  twitter: {
    title: 'Privacy Policy — Devtrop Engineering Studio',
    description:
      'Minimal data collection, zero advertising telemetry, and strict client confidentiality.',
    images: ['/og-default.png'],
  },
}

export default function PrivacyPage() {
  return (
    <PageShell>
      <LegalPageContent document={PRIVACY_POLICY} />
    </PageShell>
  )
}
