import React from 'react'
import type { Metadata } from 'next'
import { BlogPostsView } from '@/components/dashboard/views/BlogPostsView'

export const metadata: Metadata = {
  title: 'Blog Posts | RiseTogether Dashboard',
  description: 'Manage blog posts and articles.',
}

export default function BlogPostsPage() {
  return <BlogPostsView />
}
