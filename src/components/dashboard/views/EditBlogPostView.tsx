'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { BlogFormSkeleton } from '@/components/dashboard/blogs/BlogFormSkeleton'

import { useBlogPostById, useBlogCategories, useBlogTags, useUpdateBlogPost } from '@/lib/query'

import { ArrowLeft, Loader2, Save, Upload, X } from 'lucide-react'

import type { BlogStatus, UpdateBlogPostDto } from '@/types/blog'

import { normalizeBlogPostTags } from '@/types/blog'
import Image from 'next/image'

/**
 * Tiptap is browser-only and contains heavy ProseMirror dependencies.
 * Keep it inside the Client Component and disable SSR.
 */
const TiptapEditor = dynamic(
  () =>
    import('@/components/editor/TiptapEditor').then((mod) => ({
      default: mod.TiptapEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[400px] rounded-md border border-input bg-muted/50 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    ),
  },
)

interface EditBlogPostViewProps {
  postId: string
}

export function EditBlogPostView({ postId }: EditBlogPostViewProps) {
  const router = useRouter()

  /**
   * React Query runs on the client because the current authentication
   * implementation uses the browser auth token.
   */
  const { data: post, isLoading: loadingPost, isError: errorPost } = useBlogPostById(postId)

  const {
    data: categoriesRes,
    isLoading: loadingCategories,
    isError: errorCategories,
  } = useBlogCategories()

  const { data: tagsRes, isLoading: loadingTags, isError: errorTags } = useBlogTags()

  const updateMutation = useUpdateBlogPost()

  const [formData, setFormData] = useState<UpdateBlogPostDto>({
    title: '',
    excerpt: '',
    content: '',
    status: 'DRAFT',
    categoryId: '',
    tagIds: [],
  })

  const [featuredImage, setFeaturedImage] = useState<File | null>(null)

  const [imagePreview, setImagePreview] = useState<string>('')

  const [existingImage, setExistingImage] = useState<string>('')

  const categories = categoriesRes ?? []
  const tags = tagsRes ?? []

  const loading = loadingPost || loadingCategories || loadingTags

  const hasError = errorPost || errorCategories || errorTags

  /**
   * Initialize form after blog post is loaded.
   */
  useEffect(() => {
    if (!post) {
      return
    }

    const normalizedTags = normalizeBlogPostTags(post.tags)

    setFormData({
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      status: post.status,
      categoryId: post.category.id,
      tagIds: normalizedTags.map((tag) => tag.id),
    })

    if (post.featuredImage) {
      setExistingImage(post.featuredImage)
    }
  }, [post])

  /**
   * Handle featured image selection.
   */
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setFeaturedImage(file)

    const reader = new FileReader()

    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }

    reader.readAsDataURL(file)
  }

  /**
   * Remove current image.
   */
  const removeImage = () => {
    setFeaturedImage(null)
    setImagePreview('')
    setExistingImage('')
  }

  /**
   * Toggle a blog tag.
   */
  const toggleTag = (tagId: string) => {
    setFormData((previous) => ({
      ...previous,

      tagIds: previous.tagIds?.includes(tagId)
        ? previous.tagIds.filter((id) => id !== tagId)
        : [...(previous.tagIds || []), tagId],
    }))
  }

  /**
   * Submit blog post update.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!post) {
      return
    }

    const title = formData.title?.trim() || ''

    const content = formData.content?.trim() || ''

    const excerpt = formData.excerpt?.trim() || ''

    if (!title) {
      toast.error('Title is required')
      return
    }

    if (!formData.categoryId) {
      toast.error('Category is required')
      return
    }

    if (!content) {
      toast.error('Content is required')
      return
    }

    if (excerpt.length > 500) {
      toast.error('Excerpt must be 500 characters or less')
      return
    }

    /**
     * When a new image exists, send multipart FormData.
     */
    if (featuredImage) {
      const submitFormData = new FormData()

      submitFormData.append('title', title)

      submitFormData.append('content', content)

      submitFormData.append('status', formData.status || 'DRAFT')

      submitFormData.append('categoryId', formData.categoryId)

      if (excerpt) {
        submitFormData.append('excerpt', excerpt)
      }

      if (formData.tagIds && formData.tagIds.length > 0) {
        submitFormData.append('tagIds', JSON.stringify(formData.tagIds))
      }

      submitFormData.append('featuredImage', featuredImage)

      updateMutation.mutate(
        {
          id: post.id,
          data: submitFormData as any,
        },
        {
          onSuccess: () => {
            toast.success('Blog post updated successfully')

            router.push(`/dashboard/admin/blogs/${post.id}`)
          },

          onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to update blog post')
          },
        },
      )

      return
    }

    /**
     * No new image.
     * Send regular JSON DTO.
     */
    updateMutation.mutate(
      {
        id: post.id,
        data: {
          ...formData,
          title,
          content,
          excerpt,
        },
      },
      {
        onSuccess: () => {
          toast.success('Blog post updated successfully')

          router.push(`/dashboard/admin/blogs/${post.id}`)
        },

        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Failed to update blog post')
        },
      },
    )
  }

  /**
   * Loading state.
   */
  if (loading) {
    return <BlogFormSkeleton />
  }

  /**
   * Error state.
   */
  if (hasError || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-lg border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <p className="font-semibold text-destructive">Error</p>

            <p className="mt-2 text-sm text-muted-foreground">
              {errorPost ? 'Failed to load blog post' : 'Failed to load categories or tags'}
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
    <RoleGuard
      fallback={<BlogFormSkeleton />}
      permissions={['blog.update']}
      allowedRoles={['SUPER_ADMIN', 'ADMIN']}
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5 w-fit h-8 px-2 text-xs hover:bg-muted"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Edit Blog Post
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Update the blog post details and content
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Post Details */}
            <Card>
              <CardHeader>
                <CardTitle>Post Details</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>

                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        title: event.target.value,
                      })
                    }
                    placeholder="Enter post title..."
                    required
                  />
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>

                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        excerpt: event.target.value,
                      })
                    }
                    placeholder="Brief summary of the post..."
                    rows={3}
                    maxLength={500}
                  />

                  <p className="text-xs text-muted-foreground">
                    {formData.excerpt?.length || 0}
                    /500 characters - Optional short description for preview cards
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Content *</CardTitle>
              </CardHeader>

              <CardContent>
                <TiptapEditor
                  content={formData.content || ''}
                  onChange={(html) =>
                    setFormData({
                      ...formData,
                      content: html,
                    })
                  }
                  placeholder="Start writing your blog post content..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {imagePreview || existingImage ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                    <Image
                      src={imagePreview || existingImage}
                      alt="Featured image"
                      fill
                      className="object-cover"
                      unoptimized
                    />

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 size-8"
                      onClick={removeImage}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      id="featured-image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    <label
                      htmlFor="featured-image"
                      className="flex flex-col items-center justify-center aspect-video w-full rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    >
                      <Upload className="size-8 text-muted-foreground mb-2" />

                      <span className="text-sm font-medium text-foreground">Upload Image</span>

                      <span className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, WEBP (max 5MB)
                      </span>
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Publish Settings</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>

                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as BlogStatus,
                      })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>

                      <SelectItem value="PUBLISHED">Published</SelectItem>

                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Category *</CardTitle>
              </CardHeader>

              <CardContent>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      categoryId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const selected = formData.tagIds?.includes(tag.id)

                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          selected
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 border'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent'
                        }`}
                      >
                        {tag.name}
                      </button>
                    )
                  })}
                </div>

                {tags.length === 0 && (
                  <p className="text-sm text-muted-foreground">No tags available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </RoleGuard>
  )
}
