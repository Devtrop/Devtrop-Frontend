'use client'

import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  useBlogCategories,
  useCreateBlogCategory,
  useUpdateBlogCategory,
  useDeleteBlogCategory,
} from '@/lib/query'
import { Plus, Edit, Trash2, Loader2, FolderOpen, ArrowUpDown } from 'lucide-react'
import { DashboardTableSkeleton } from '@/components/dashboard/common/DashboardSkeleton'
import type { BlogCategory, CreateBlogCategoryDto } from '@/types/blog'

export function BlogCategoriesView() {
  const { data: categoriesRes, isLoading: loading, isError } = useBlogCategories()
  const createMutation = useCreateBlogCategory()
  const updateMutation = useUpdateBlogCategory()
  const deleteMutation = useDeleteBlogCategory()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<BlogCategory | null>(null)

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc') // Default: latest first

  const [formData, setFormData] = useState<CreateBlogCategoryDto>({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  })

  const rawCategories: BlogCategory[] = categoriesRes ?? []

  // Sort categories based on sortOrder
  const categories = useMemo(() => {
    return [...rawCategories].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })
  }, [rawCategories, sortOrder])

  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
  }

  const handleOpenDialog = (category?: BlogCategory) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        isActive: category.isActive,
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        slug: '',
        description: '',
        isActive: true,
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    if (editingCategory) {
      updateMutation.mutate(
        { id: editingCategory.id, data: formData },
        {
          onSuccess: () => {
            toast.success('Category updated successfully')
            setDialogOpen(false)
          },
        },
      )
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          setDialogOpen(false)
        },
      })
    }
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return

    deleteMutation.mutate(categoryToDelete.id, {
      onSuccess: () => {
        toast.success('Category deleted successfully')
        setDeleteDialogOpen(false)
        setCategoryToDelete(null)
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
    return <BlogTaxonomySkeleton />
  }

  if (isError) {
    return (
      <div className="p-4">
        <div className="rounded-none border border-destructive/50 bg-destructive/5 p-6">
          <p className="font-semibold text-destructive">Error</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Failed to load categories. Please try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard
      fallback={<BlogTaxonomySkeleton />}
      permissions={['blog_category.read']}
      allowedRoles={['SUPER_ADMIN', 'ADMIN']}
    >
      {/* Category Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Update the category details below.'
                : 'Fill in the details to create a new category.'}
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
                placeholder="e.g., Technology"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., technology"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active
              </Label>
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
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">"{categoryToDelete?.name}"</span>? This action cannot
              be undone.
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
              Blog Categories
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage blog categories for organizing posts
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
              Create Category
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
          <div className="rounded-none border border-border bg-card p-3 sm:p-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-none bg-accent-soft">
                <FolderOpen className="size-4 sm:size-5 text-accent dark:text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
                  Total Categories
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{categories.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-none border border-border bg-card p-3 sm:p-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-none bg-accent-soft">
                <FolderOpen className="size-4 sm:size-5 text-accent dark:text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
                  Active
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">
                  {categories.filter((c) => c.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-none border border-border bg-card p-3 sm:p-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-none bg-zinc-500/10">
                <FolderOpen className="size-4 sm:size-5 text-muted dark:text-muted" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
                  Inactive
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">
                  {categories.filter((c) => !c.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table & Mobile Cards */}
        {categories.length === 0 ? (
          <div className="rounded-none border border-border bg-card p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-2xl">
              📁
            </div>
            <h2 className="mt-4 text-base font-semibold text-foreground">No categories found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating your first category.
            </p>
            <Button onClick={() => handleOpenDialog()} className="mt-4">
              Create Category
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block rounded-none border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="text-xs min-w-[750px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-14 px-4">SL</TableHead>
                      <TableHead className="min-w-36 px-4">Name</TableHead>
                      <TableHead className="min-w-32 px-4">Slug</TableHead>
                      <TableHead className="min-w-64 px-4">Description</TableHead>
                      <TableHead className="min-w-24 px-4">Status</TableHead>
                      <TableHead className="min-w-36 px-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category, index) => (
                      <TableRow key={category.id} className="hover:bg-muted/30">
                        <TableCell className="px-4 py-3">
                          <span className="text-muted-foreground font-medium">{index + 1}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3 font-medium text-foreground">
                          {category.name}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <code className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono">
                            {category.slug}
                          </code>
                        </TableCell>
                        <TableCell className="px-4 py-3 max-w-md truncate text-muted-foreground">
                          {category.description || '—'}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {category.isActive ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent-soft text-accent dark:text-accent text-[10px] font-medium">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-500/10 text-muted dark:text-muted text-[10px] font-medium">
                              Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(category)}
                              className="h-7 gap-1.5 text-xs"
                            >
                              <Edit className="size-3" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCategoryToDelete(category)
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
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className="rounded-none border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {category.name}
                        </h3>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <code className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono text-muted-foreground">
                          {category.slug}
                        </code>
                      </div>
                    </div>
                    {category.isActive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent-soft text-accent dark:text-accent text-[10px] font-medium shrink-0">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-500/10 text-muted dark:text-muted text-[10px] font-medium shrink-0">
                        Inactive
                      </span>
                    )}
                  </div>

                  {category.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
                      {category.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(category)}
                      className="flex-1 h-8 gap-1.5 text-xs"
                    >
                      <Edit className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCategoryToDelete(category)
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
