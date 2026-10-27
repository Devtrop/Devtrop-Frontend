import React from 'react'
import type { Metadata } from 'next'
import { BlogCategoriesView } from '@/components/dashboard/views/BlogCategoriesView'

export const metadata: Metadata = {
  title: 'Blog Categories | RiseTogether Dashboard',
  description: 'Manage blog categories.',
}

export default function BlogCategoriesPage() {
  return <BlogCategoriesView />
}
