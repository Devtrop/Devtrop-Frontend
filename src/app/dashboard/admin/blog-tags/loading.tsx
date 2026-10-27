import React from 'react'
import { BlogTaxonomySkeleton } from '@/components/dashboard/blogs/BlogTaxonomySkeleton'

export default function BlogTagsLoading() {
  return <BlogTaxonomySkeleton statCardsCount={1} />
}
