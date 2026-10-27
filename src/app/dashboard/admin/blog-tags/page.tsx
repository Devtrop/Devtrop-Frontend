import React from 'react'
import type { Metadata } from 'next'
import { BlogTagsView } from '@/components/dashboard/views/BlogTagsView'

export const metadata: Metadata = {
  title: 'Blog Tags | RiseTogether Dashboard',
  description: 'Manage blog tags.',
}

export default function BlogTagsPage() {
  return <BlogTagsView />
}
