import type { Metadata } from 'next'
import { EditBlogPostView } from '@/components/dashboard/views/EditBlogPostView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Edit Blog Post | RiseTogether Dashboard',
  description: 'Edit an existing blog post.',
}

interface EditBlogPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params

  return <EditBlogPostView postId={id} />
}
