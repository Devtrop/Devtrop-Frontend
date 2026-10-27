'use client'

import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { BlogTaxonomySkeleton } from '@/components/dashboard/blogs/BlogTaxonomySkeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { useBlogTags, useCreateBlogTag, useUpdateBlogTag, useDeleteBlogTag } from '@/lib/query'
import { Plus, Edit, Trash2, Loader2, Tags, ArrowUpDown } from 'lucide-react'
import type { BlogTag, CreateBlogTagDto } from '@/types/blog'

export function BlogTagsView() {
  const { data: tagsRes, isLoading: loading, isError } = useBlogTags()
  const createMutation = useCreateBlogTag()
  const updateMutation = useUpdateBlogTag()
  const deleteMutation = useDeleteBlogTag()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<BlogTag | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<BlogTag | null>(null)

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc') // Default: latest first

  const [formData, setFormData] = useState<CreateBlogTagDto>({
    name: '',
    slug: '',
  })

  const rawTags = tagsRes ?? []

  // Sort tags based on sortOrder
  const tags = useMemo(() => {
    return [...rawTags].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })
  }, [rawTags, sortOrder])

  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
  }

  const handleOpenDialog = (tag?: BlogTag) => {
    if (tag) {
      setEditingTag(tag)
      setFormData({
        name: tag.name,
        slug: tag.slug,
      })
    } else {
      setEditingTag(null)
      setFormData({
        name: '',
        slug: '',
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Tag name is required')
      return
    }

    if (editingTag) {
      updateMutation.mutate(
        { id: editingTag.id, data: formData },
        {
          onSuccess: () => {
            toast.success('Tag updated successfully')
            setDialogOpen(false)
          },
        },
      )
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success('Tag created successfully')
          setDialogOpen(false)
        },
      })
    }
  }

  const handleDelete = async () => {
    if (!tagToDelete) return

    deleteMutation.mutate(tagToDelete.id, {
      onSuccess: () => {
        toast.success('Tag deleted successfully')
        setDeleteDialogOpen(false)
        setTagToDelete(null)
      },
    })
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  if (loading) {
    return <BlogTaxonomySkeleton statCardsCount={1} />
  }

  if (isError) {
    return (
      <div className="p-4">
        <div className="rounded-none border border-destructive/50 bg-destructive/5 p-6">
          <p className="font-semibold text-destructive">Error</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Failed to load tags. Please try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard
      fallback={<BlogTaxonomySkeleton statCardsCount={1} />}
      permissions={['blog_tag.read']}
      allowedRoles={['SUPER_ADMIN', 'ADMIN']}
    >
      {/* Tag Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTag ? 'Edit Tag' : 'Create Tag'}</DialogTitle>
            <DialogDescription>
              {editingTag
                ? 'Update the tag details below.'
                : 'Fill in the details to create a new tag.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value
                  setFormData({
                    ...formData,
                    name,
                    slug: formData.slug || generateSlug(name),
                  })
                }}
                placeholder="e.g., JavaScript"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., javascript"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">"{tagToDelete?.name}"</span>? This action cannot be
              undone.
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
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Blog Tags
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage blog tags for organizing and categorizing posts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSort}
              className="gap-1.5 border-border hover:bg-muted text-xs h-8 px-3"
              title={`Sort by ${sortOrder === 'desc' ? 'oldest' : 'latest'} first`}
            >
              <ArrowUpDown className="size-3.5" />
              <span className="hidden sm:inline">
                {sortOrder === 'desc' ? 'Latest First' : 'Oldest First'}
              </span>
            </Button>
            <Button
              onClick={() => handleOpenDialog()}
              className="gap-2 bg-accent hover:bg-accent h-8 text-xs"
            >
              <Plus className="size-4" />
              Create Tag
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          <div className="rounded-none border border-border bg-card p-3 sm:p-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-none bg-accent-soft">
                <Tags className="size-4 sm:size-5 text-accent dark:text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
                  Total Tags
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{tags.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table & Mobile Cards */}
        {tags.length === 0 ? (
          <div className="rounded-none border border-border bg-card p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-2xl">
              🏷️
            </div>
            <h2 className="mt-4 text-base font-semibold text-foreground">No tags found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating your first tag.
            </p>
            <Button onClick={() => handleOpenDialog()} className="mt-4">
              Create Tag
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block rounded-none border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="text-xs min-w-[550px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-14 px-4">SL</TableHead>
                      <TableHead className="min-w-44 px-4">Name</TableHead>
                      <TableHead className="min-w-40 px-4">Slug</TableHead>
                      <TableHead className="min-w-36 px-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tags.map((tag, index) => (
                      <TableRow key={tag.id} className="hover:bg-muted/30">
                        <TableCell className="px-4 py-3">
                          <span className="text-muted-foreground font-medium">{index + 1}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3 font-medium text-foreground">
                          {tag.name}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <code className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono">
                            {tag.slug}
                          </code>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(tag)}
                              className="h-7 gap-1.5 text-xs"
                            >
                              <Edit className="size-3" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setTagToDelete(tag)
                                setDeleteDialogOpen(true)
                              }}
                              className="h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                            >
                              <Trash2 className="size-3" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {tags.map((tag, index) => (
                <div
                  key={tag.id}
                  className="rounded-none border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {tag.name}
                        </h3>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <code className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono text-muted-foreground">
                          {tag.slug}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(tag)}
                      className="flex-1 h-8 gap-1.5 text-xs"
                    >
                      <Edit className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTagToDelete(tag)
                        setDeleteDialogOpen(true)
                      }}
                      className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  )
}
