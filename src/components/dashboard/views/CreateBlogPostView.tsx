'use client'

import React, { useState } from 'react'
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
import { useBlogCategories, useBlogTags, useCreateBlogPost } from '@/lib/query'
import { ArrowLeft, Loader2, Save, Upload, X } from 'lucide-react'
import type { BlogStatus, CreateBlogPostDto } from '@/types/blog'
import Image from 'next/image'

// ✅ Lazy load TiptapEditor (heavy dependency with prosemirror)
const TiptapEditor = dynamic(
  () => import('@/components/editor/TiptapEditor').then((mod) => ({ default: mod.TiptapEditor })),
  {
    loading: () => (
      <div className="w-full min-h-[400px] rounded-none border border-input bg-muted/50 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false, // Editor doesn't need SSR
  },
)

export function CreateBlogPostView() {
  const router = useRouter()

  // Use React Query hooks
  const { data: categoriesRes, isLoading: loadingCategories } = useBlogCategories()
  const { data: tagsRes, isLoading: loadingTags } = useBlogTags()
  const createMutation = useCreateBlogPost()

  const [formData, setFormData] = useState<CreateBlogPostDto>({
    title: '',
    excerpt: '',
    content: '',
    status: 'DRAFT',
    categoryId: '',
    tagIds: [],
  })

  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const categories = categoriesRes ?? []
  const tags = tagsRes ?? []
  const loadingData = loadingCategories || loadingTags

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      setFeaturedImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFeaturedImage(null)
    setImagePreview('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!formData.categoryId) {
      toast.error('Category is required')
      return
    }
    if (!formData.content.trim()) {
      toast.error('Content is required')
      return
    }
    if (formData.excerpt && formData.excerpt.length > 500) {
      toast.error('Excerpt must be 500 characters or less')
      return
    }

    // If there's an image, use FormData
    if (featuredImage) {
      const submitFormData = new FormData()
      submitFormData.append('title', formData.title.trim())
      submitFormData.append('content', formData.content.trim())
      submitFormData.append('status', formData.status)
      submitFormData.append('categoryId', formData.categoryId)

      if (formData.excerpt?.trim()) {
        submitFormData.append('excerpt', formData.excerpt.trim())
      }

      // Send tagIds as JSON array string (NestJS will parse it)
      if (formData.tagIds && formData.tagIds.length > 0) {
        submitFormData.append('tagIds', JSON.stringify(formData.tagIds))
      }

      submitFormData.append('featuredImage', featuredImage)

      createMutation.mutate(submitFormData as any, {
        onSuccess: () => {
          toast.success('Blog post created successfully')
          router.push('/dashboard/admin/blogs')
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Failed to create blog post')
        },
      })
    } else {
      // No image, send as JSON
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success('Blog post created successfully')
          router.push('/dashboard/admin/blogs')
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Failed to create blog post')
        },
      })
    }
  }

  const toggleTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds?.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...(prev.tagIds || []), tagId],
    }))
  }

  if (loadingData) {
    return <BlogFormSkeleton />
  }

  return (
    <RoleGuard
      fallback={<BlogFormSkeleton />}
      permissions={['blog.create']}
      allowedRoles={['SUPER_ADMIN', 'ADMIN']}
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/admin/blogs')}
            className="gap-1.5 w-fit h-8 px-2 text-xs hover:bg-muted"
          >
            <ArrowLeft className="size-3.5" />
            Back to Blog Posts
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Create Blog Post
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Create and publish a new blog post or article
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/admin/blogs')}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="gap-2 bg-accent hover:bg-accent"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Save Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Title */}
            <Card>
              <CardHeader>
                <CardTitle>Post Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter post title..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief summary of the post..."
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.excerpt?.length || 0}/500 characters - Optional short description for
                    preview cards
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
                  content={formData.content}
                  onChange={(html) => setFormData({ ...formData, content: html })}
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
                {imagePreview ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-none border border-border bg-muted">
                    <Image
                      src={imagePreview}
                      alt="Featured image preview"
                      fill
                      className="object-cover"
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
                      className="flex flex-col items-center justify-center aspect-video w-full rounded-none border-2 border-dashed border-border bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
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
                      setFormData({ ...formData, status: value as BlogStatus })
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
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  required
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
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-none text-xs font-medium transition-colors ${
                        formData.tagIds?.includes(tag.id)
                          ? 'bg-accent-soft text-accent dark:text-accent border-accent border'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
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
