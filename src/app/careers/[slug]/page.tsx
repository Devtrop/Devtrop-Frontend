import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageShell } from '@/components/shared/layout/PageShell'
import { JobDetail } from '@/components/careers/JobDetail'
import { getPublicJob } from '@/lib/jobs'

interface JobPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  try {
    const job = await getPublicJob(params.slug)

    return {
      title: `${job.title} — Careers at Devtrop`,
      description: job.description?.slice(0, 160) || `Apply for ${job.title} position at Devtrop.`,
      openGraph: {
        title: `${job.title} — Careers at Devtrop`,
        description: job.description?.slice(0, 160) || `Apply for ${job.title} position at Devtrop.`,
      },
    }
  } catch {
    return {
      title: 'Job Not Found',
    }
  }
}

export default async function JobPage({ params }: JobPageProps) {
  let job
  try {
    job = await getPublicJob(params.slug)
  } catch (error) {
    notFound()
  }

  return (
    <PageShell>
      <JobDetail job={job} />
    </PageShell>
  )
}
