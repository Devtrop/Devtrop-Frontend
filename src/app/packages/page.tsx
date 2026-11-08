import type { Metadata } from 'next'
import { PageShell } from '@/components/shared/layout/PageShell'
import { PackagesSection } from '@/components/packages/PackagesSection'
import { ClosingCta } from '@/components/home/ClosingCta'
import { SITE_CONFIG } from '@/data/site'

export const metadata: Metadata = {
  title: 'Our Packages — Web, SaaS & Maintenance Plans',
  description:
    'Devtrop packages: Standard business web solutions with 1 month free support, Premium custom applications & SaaS with 3 months free support, and Dedicated Maintenance for ongoing website and application care. Clear packages, no hidden fees.',
  keywords: [
    'Devtrop packages',
    'web development packages',
    'website development pricing',
    'SaaS development package',
    'business website package',
    'custom web application package',
    'website maintenance plan',
    'ongoing website support',
    'post-launch maintenance',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/packages`,
  },
  openGraph: {
    title: 'Our Packages — Web, SaaS & Maintenance Plans',
    description:
      'Standard business web solutions, Premium custom applications & SaaS, and Dedicated Maintenance. Clear packages, no hidden fees.',
    url: `${SITE_CONFIG.url}/packages`,
    images: [
      { url: '/og-default.png', width: 1200, height: 630, alt: 'Devtrop Packages' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Packages — Web, SaaS & Maintenance Plans',
    description:
      'Standard business web solutions, Premium custom applications & SaaS, and Dedicated Maintenance. Clear packages, no hidden fees.',
    images: ['/og-default.png'],
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_CONFIG.url },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Packages',
      item: `${SITE_CONFIG.url}/packages`,
    },
  ],
}

export default function PackagesPage() {
  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PackagesSection />
      <ClosingCta />
    </PageShell>
  )
}
