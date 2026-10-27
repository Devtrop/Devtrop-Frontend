'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Eye, ChevronLeft, ChevronRight, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react'
import { BlogStatusBadge } from './BlogStatusBadge'
import { updateBlogPostStatus, deleteBlogPost } from '@/lib/blog'
import { toast } from 'sonner'
import type { BlogPost, BlogStatus } from '@/types/blog'
import { normalizeBlogPostTags } from '@/types/blog'

interface BlogPostsTableProps {
  posts: BlogPost[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  total: number
  onPostUpdated?: () => void
  onStatusChange?: (postId: string, newStatus: BlogStatus) => void
  onDeletePost?: (postId: string) => void
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function BlogPostsTable({
  posts,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  total,
  onPostUpdated,
  onStatusChange,
  onDeletePost,
}: BlogPostsTableProps) {
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleStatusChange = async (postId: string, newStatus: BlogStatus) => {
    const previousPost = posts.find((p) => p.id === postId)
    try {
      setUpdatingStatusId(postId)
      onStatusChange?.(postId, newStatus)
      await updateBlogPostStatus(postId, { status: newStatus })
      toast.success('Blog post status updated successfully')
      if (!onStatusChange) {
        onPostUpdated?.()
      }
    } catch (error) {
      if (previousPost) {
        onStatusChange?.(postId, previousPost.status)
      }
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const handleDeleteClick = (post: BlogPost) => {
    setPostToDelete(post)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return

    const deletedId = postToDelete.id
    try {
      setDeleting(true)
      await deleteBlogPost(deletedId)
      toast.success('Blog post deleted successfully')
      setDeleteDialogOpen(false)
      setPostToDelete(null)
      if (onDeletePost) {
        onDeletePost(deletedId)
      } else {
        onPostUpdated?.()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete blog post')
    } finally {
      setDeleting(false)
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-3">
        {/* Desktop Skeleton */}
        <div className="hidden lg:block rounded-none border border-border bg-card overflow-hidden w-full">
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-16 px-3">SL</TableHead>
                  <TableHead className="min-w-80 px-3">Title</TableHead>
                  <TableHead className="min-w-36 px-3">Category</TableHead>
                  <TableHead className="min-w-32 px-3">Published</TableHead>
                  <TableHead className="min-w-28 px-3">Status</TableHead>
                  <TableHead className="min-w-32 px-3 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={`blog-skel-${i}`}>
                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-4 w-6 rounded-none" />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-52 rounded-none" />
                        <Skeleton className="h-3 w-32 rounded-none" />
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-5 w-20 rounded-none" />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-4 w-24 rounded-none" />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Skeleton className="size-7 rounded-none" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Skeleton */}
        <div className="lg:hidden space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`blog-card-skel-${i}`}
              className="rounded-none border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-4 w-44 rounded-none" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="space-y-2 pt-2 border-t border-border">
                <Skeleton className="h-3 w-28 rounded-none" />
                <Skeleton className="h-3 w-32 rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-none border border-border bg-card p-12 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-2xl">
          📝
        </div>
        <h2 className="mt-4 text-base font-semibold text-foreground">No blog posts found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by creating your first blog post.
        </p>
        <Link href="/dashboard/admin/blogs/create">
          <Button className="mt-4">Create Blog Post</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">"{postToDelete?.title}"</span>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Desktop View */}
      <div className="hidden lg:block rounded-none border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-3.5 bg-muted/40">
          <h2 className="text-sm font-semibold text-foreground">Blog Posts</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {total} post{total !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-16 px-3">SL</TableHead>
                <TableHead className="min-w-80 px-3">Title</TableHead>
                <TableHead className="min-w-36 px-3">Category</TableHead>
                <TableHead className="min-w-32 px-3">Published</TableHead>
                <TableHead className="min-w-28 px-3">Status</TableHead>
                <TableHead className="min-w-32 px-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post, index) => (
                <TableRow key={post.id} className="hover:bg-muted/30">
                  {/* Serial Number */}
                  <TableCell className="px-3 py-3">
                    <span className="text-muted-foreground font-medium">{index + 1}</span>
                  </TableCell>

                  {/* Title */}
                  <TableCell className="px-3 py-3">
                    <Link
                      href={`/dashboard/admin/blogs/${post.id}`}
                      className="font-medium text-foreground hover:text-accent dark:hover:text-accent transition-colors"
                    >
                      {post.title}
                    </Link>
                    {post.excerpt && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">
                        {post.excerpt}
                      </p>
                    )}
                  </TableCell>

                  {/* Category */}
                  <TableCell className="px-3 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-none bg-accent-soft text-accent dark:text-accent text-[10px] font-medium">
                      {post.category.name}
                    </span>
                  </TableCell>

                  {/* Published */}
                  <TableCell className="px-3 py-3">
                    <span className="text-muted-foreground">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-3 py-3">
                    <Select
                      value={post.status}
                      onValueChange={(value) => handleStatusChange(post.id, value as BlogStatus)}
                      disabled={updatingStatusId === post.id}
                    >
                      <SelectTrigger className="h-7 text-xs border-none bg-transparent p-0 hover:bg-muted/50 focus:ring-0 w-full">
                        <SelectValue>
                          <BlogStatusBadge status={post.status} />
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 data-[state=open]:bg-muted"
                          >
                            <MoreVertical className="size-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/admin/blogs/${post.id}`}
                              className="cursor-pointer"
                            >
                              <Eye className="size-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/admin/blogs/${post.id}/edit`}
                              className="cursor-pointer"
                            >
                              <Edit className="size-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDeleteClick(post)}
                          >
                            <Trash2 className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Load More & Count Footer */}
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{posts.length}</span> of{' '}
            <span className="font-medium text-foreground">{total}</span> blog posts
          </div>

          {hasMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="w-full sm:w-auto gap-1.5 text-xs border-border hover:bg-muted"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Load More
                  <ChevronRight className="size-3.5" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-none border border-border bg-card p-4 space-y-3"
          >
            {/* Title & Status */}
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/dashboard/admin/blogs/${post.id}`}
                className="flex-1 font-semibold text-sm text-foreground hover:text-accent dark:hover:text-accent"
              >
                {post.title}
              </Link>
              <BlogStatusBadge status={post.status} />
            </div>

            {/* Meta */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground">Category:</span>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-none bg-accent-soft text-accent dark:text-accent text-[10px] font-medium">
                    {post.category.name}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Published:</span>
                <div className="font-medium text-foreground">
                  {formatDate(post.publishedAt || post.createdAt)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="mt-1">
                  <Select
                    value={post.status}
                    onValueChange={(value) => handleStatusChange(post.id, value as BlogStatus)}
                    disabled={updatingStatusId === post.id}
                  >
                    <SelectTrigger className="h-8 text-xs w-full">
                      <SelectValue>
                        <BlogStatusBadge status={post.status} />
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-border space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/dashboard/admin/blogs/${post.id}`} className="w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 gap-1.5 text-xs border-border"
                  >
                    <Eye className="size-3.5" />
                    View
                  </Button>
                </Link>
                <Link href={`/dashboard/admin/blogs/${post.id}/edit`} className="w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 gap-1.5 text-xs border-border"
                  >
                    <Edit className="size-3.5" />
                    Edit
                  </Button>
                </Link>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(post)}
                className="w-full h-8 gap-1.5 text-xs border-destructive text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
                Delete Post
              </Button>
            </div>
          </div>
        ))}

        {/* Mobile Pagination & Count Footer */}
        <div className="flex flex-col gap-3 rounded-none border border-border bg-card p-4">
          <div className="text-center text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{posts.length}</span> of{' '}
            <span className="font-medium text-foreground">{total}</span> blog posts
          </div>

          {hasMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="w-full h-9 gap-1.5 text-xs border-border"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Load More
                  <ChevronRight className="size-3.5" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
