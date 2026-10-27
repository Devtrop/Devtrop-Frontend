import React from 'react'
import type { Metadata } from 'next'
import { CreateBlogPostView } from '@/components/dashboard/views/CreateBlogPostView'

export const metadata: Metadata = {
  title: 'Create Blog Post | RiseTogether Dashboard',
  description: 'Create a new blog post.',
}

export default function CreateBlogPostPage() {
  return <CreateBlogPostView />
}
