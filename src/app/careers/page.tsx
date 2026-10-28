import type { Metadata } from 'next'
import { PageShell } from '@/components/shared/layout/PageShell'
import { JobsListings } from '@/components/careers/JobsListings'

export const metadata: Metadata = {
  title: 'Careers — Join Devtrop',
  description:
    'Join Devtrop and work on production-grade web applications and SaaS platforms. We hire exceptional engineers who value craftsmanship, ownership, and continuous learning.',
  keywords: [
    'software engineer jobs',
    'full-stack developer careers',
    'React developer jobs Bangladesh',
    'TypeScript engineer jobs',
    'remote developer jobs',
    'Devtrop careers',
    'tech jobs Dhaka',
  ],
  alternates: {
    canonical: 'https://devtrop.com/careers',
  },
  openGraph: {
    title: 'Careers — Join Devtrop',
    description:
      'Build production-grade web applications with us. Join a team that values engineering excellence.',
    url: 'https://devtrop.com/careers',
  },
}

export default function CareersPage() {
  return (
    <PageShell>
      <JobsListings />
    </PageShell>
  )
}
