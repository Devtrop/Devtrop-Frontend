'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BlogStatusBadge } from './BlogStatusBadge'
import { Eye, Calendar, Edit, Trash2 } from 'lucide-react'
import type { BlogPost } from '@/types/blog'
import { normalizeBlogPostTags } from '@/types/blog'
import { cn } from '@/lib/utils'

interface BlogPostCardProps {
  post: BlogPost
  onEdit?: (post: BlogPost) => void
  onDelete?: (post: BlogPost) => void
}

export function BlogPostCard({ post, onEdit, onDelete }: BlogPostCardProps) {
  const normalizedTags = normalizeBlogPostTags(post.tags)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Card className="border-border bg-card hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link href={`/dashboard/admin/blogs/${post.id}`} className="group">
              <h3 className="text-base font-semibold text-foreground truncate group-hover:text-accent dark:group-hover:text-accent transition-colors">
                {post.title}
              </h3>
            </Link>
            {post.excerpt && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
            )}
          </div>
          <BlogStatusBadge status={post.status} />
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="size-3.5" />
            <span>{post.viewCount} views</span>
          </div>
        </div>

        {/* Category & Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-none bg-accent-soft text-accent dark:text-accent text-[10px] font-medium">
            {post.category.name}
          </span>
          {normalizedTags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2 py-0.5 rounded-none bg-muted text-muted-foreground text-[10px] font-medium"
            >
              {tag.name}
            </span>
          ))}
          {normalizedTags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{normalizedTags.length - 3} more
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(post)}
              className="h-7 gap-1.5 text-xs flex-1"
            >
              <Edit className="size-3" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(post)}
              className="h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <Trash2 className="size-3" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
