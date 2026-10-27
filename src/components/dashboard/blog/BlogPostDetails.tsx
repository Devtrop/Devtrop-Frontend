'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { useBlogPost, useDeleteBlogPost } from '@/lib/query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, Calendar, Eye, Edit, Trash2, Loader2, FolderOpen, Tags } from 'lucide-react'
import { BlogStatusBadge } from '@/components/dashboard/blog'
import { normalizeBlogPostTags } from '@/types/blog'
import { BlogFormSkeleton } from '@/components/dashboard/blogs/BlogFormSkeleton'

export default function BlogPostDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const postId = params.id

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Use React Query hook for data fetching
  const { data: post, isLoading: loading, error, isError } = useBlogPost(postId)

  // Use mutation hook for delete
  const deleteMutation = useDeleteBlogPost()

  const normalizedTags = post ? normalizeBlogPostTags(post.tags) : []

  const handleDelete = async () => {
    if (!post) return

    deleteMutation.mutate(post.id, {
      onSuccess: () => {
        toast.success('Blog post deleted successfully')
        router.push('/dashboard/admin/blogs')
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to delete blog post')
        setDeleteDialogOpen(false)
      },
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <BlogFormSkeleton />
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-lg border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <p className="font-semibold text-destructive">Error</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Blog post not found'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/admin/blogs')}
              className="mt-4 gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              Back to Blog Posts
            </Button>
          </CardContent>
        </Card>
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
              Are you sure you want to delete <span className="font-semibold">"{post.title}"</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="gap-2"
            >
              {deleteMutation.isPending ? (
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

      <div className="space-y-6 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/admin/blogs')}
              className="gap-1.5 w-fit h-8 px-2 text-xs hover:bg-muted"
            >
              <ArrowLeft className="size-3.5" />
              Back to Blog Posts
            </Button>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {post.title}
                </h1>
                <div className="flex items-center gap-2">
                  <BlogStatusBadge status={post.status} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/admin/blogs/${post.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="size-4" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="gap-2 text-destructive hover:bg-destructive/10 border-destructive/30"
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Excerpt */}
              {post.excerpt && (
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Excerpt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                  </CardContent>
                </Card>
              )}

              {/* Content */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Meta Information */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Post Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-muted-foreground">Published</p>
                      <p className="text-sm text-foreground">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Eye className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-muted-foreground">Views</p>
                      <p className="text-sm text-foreground">{post.viewCount} views</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FolderOpen className="size-4 text-muted-foreground" />
                    Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-none bg-accent-soft text-accent dark:text-accent text-sm font-medium">
                    {post.category.name}
                  </span>
                </CardContent>
              </Card>

              {/* Tags */}
              {normalizedTags.length > 0 && (
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Tags className="size-4 text-muted-foreground" />
                      Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {normalizedTags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2.5 py-1 rounded-none bg-muted text-muted-foreground text-xs font-medium"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
