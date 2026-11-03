import type { Metadata } from 'next'
import { PageShell } from '@/components/shared/layout/PageShell'
import { CaseStudies } from '@/components/home/CaseStudies'
import { WorkingAgreement } from '@/components/home/WorkingAgreement'
import { SITE_CONFIG } from '@/data/site'
import { WORK_CONTENT } from '@/data/work'

export const metadata: Metadata = {
  title: 'Work — Live Builds & Case Studies',
  description:
    'Live builds from Devtrop: Uparzo multi-tenant e-commerce SaaS, Feletrip hotel booking marketplace, and Biponiq multi-vendor storefront builder. Every claim links to a production site you can open right now.',
  keywords: [
    // Portfolio intent
    'Devtrop portfolio',
    'Devtrop case studies',
    'Devtrop projects',
    'web development case study',
    'software engineering portfolio',
    // Case study names
    'Uparzo multi-tenant ecommerce SaaS',
    'Feletrip hotel booking marketplace',
    'Biponiq multi-vendor storefront builder',
    // Technical keywords from the builds
    'Next.js marketplace portfolio',
    'Prisma PostgreSQL SaaS case study',
    'multi-tenant architecture example',
    'SSLCommerz payment integration',
    'SaaS storefront builder portfolio',
    'hotel booking platform Next.js',
    'vendor payout marketplace system',
    // Social proof signals
    'live production web apps portfolio',
    'open source case studies web development',
    'real web development projects',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/work`,
  },
  openGraph: {
    title: 'Real Builds, Running in Production — Devtrop',
    description:
      'Uparzo: multi-tenant e-commerce SaaS with custom domains and subscription billing. Feletrip: hotel booking marketplace with vendor payouts. Biponiq: multi-vendor storefront builder with AI assistant. All three live in production.',
    url: `${SITE_CONFIG.url}/work`,
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Devtrop Live Builds' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Real Builds, Running in Production — Devtrop',
    description:
      'Uparzo: multi-tenant e-commerce SaaS. Feletrip: hotel booking marketplace. Biponiq: multi-vendor storefront builder. All live in production.',
    images: ['/og-default.png'],
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_CONFIG.url },
    { '@type': 'ListItem', position: 2, name: 'Work', item: `${SITE_CONFIG.url}/work` },
  ],
}

// CollectionPage + ItemList: tells search engines this is a curated portfolio
// of production builds, each linking to a live, indexable case study page.
const collectionPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_CONFIG.url}/work`,
  url: `${SITE_CONFIG.url}/work`,
  name: 'Work — Live Builds & Case Studies',
  description:
    'Live builds from Devtrop: multi-tenant SaaS, hotel booking marketplace, and multi-vendor storefront builder. Every claim links to a production site you can open right now.',
  isPartOf: { '@id': `${SITE_CONFIG.url}/#website` },
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: WORK_CONTENT.builds.length,
    itemListElement: WORK_CONTENT.builds.map((build, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_CONFIG.url}/work/${build.slug}`,
      name: build.title,
      description: build.outcome,
    })),
  },
}

export default function WorkPage() {
  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      <CaseStudies />
      <WorkingAgreement />
    </PageShell>
  )
}

