'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { BlogsSkeleton } from '@/components/dashboard/blogs/BlogsSkeleton'
import { BlogPostsTable } from '@/components/dashboard/blog'
import { getBlogPosts } from '@/lib/blog'
import { useBlogCategories } from '@/lib/query'
import { Plus, Search, RotateCcw, FileText, ArrowUpDown } from 'lucide-react'
import type { BlogPost, BlogStatus } from '@/types/blog'

export function BlogPostsView() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BlogStatus | ''>('')
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest') // Default: latest first

  const limit = 20

  const { data: categoriesData, isLoading: loadingCategories } = useBlogCategories()
  const categories = categoriesData || []

  const fetchPosts = useCallback(
    async (targetPage: number, append = false) => {
      try {
        if (append) {
          setLoadingMore(true)
        } else {
          setLoading(true)
        }

        const result = await getBlogPosts({
          page: targetPage,
          limit,
          search: search.trim() || undefined,
          status: status || undefined,
          categoryId: categoryId || undefined,
          sort,
        })

        const newPosts = result?.data || []
        const meta = result?.meta || { total: 0, page: targetPage, limit, totalPages: 1 }

        if (append) {
          setPosts((current) => {
            const existingIds = new Set(current.map((p) => p.id))
            const filtered = newPosts.filter((p) => !existingIds.has(p.id))
            return [...current, ...filtered]
          })
          setPage(targetPage)
        } else {
          setPosts(newPosts)
          setPage(1)
        }

        setTotal(meta.total)
        setHasMore(targetPage < meta.totalPages)
      } catch (error) {
        if (!append) {
          setPosts([])
        }
        toast.error(error instanceof Error ? error.message : 'Failed to load blog posts.')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [search, status, categoryId, sort],
  )

  // Debounced search and filter changes
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchPosts(1, false)
    }, 350)

    return () => {
      window.clearTimeout(timer)
    }
  }, [fetchPosts])

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      void fetchPosts(page + 1, true)
    }
  }

  const handleReset = () => {
    setSearch('')
    setStatus('')
    setCategoryId('')
    setSort('latest')
  }

  const handleToggleSort = () => {
    setSort((prev) => (prev === 'latest' ? 'oldest' : 'latest'))
  }

  const handleStatusChange = useCallback((postId: string, newStatus: BlogStatus) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, status: newStatus } : post)),
    )
  }, [])

  const handleDeletePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId))
    setTotal((prev) => Math.max(0, prev - 1))
  }, [])

  const stats = {
    total,
    published: posts.filter((p) => p.status === 'PUBLISHED').length,
    draft: posts.filter((p) => p.status === 'DRAFT').length,
    archived: posts.filter((p) => p.status === 'ARCHIVED').length,
  }

  return (
    <RoleGuard
      fallback={<BlogsSkeleton />}
      permissions={['blog.read']}
      allowedRoles={['SUPER_ADMIN', 'ADMIN']}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Blog Posts
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create and manage blog posts and articles
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSort}
              className="gap-1.5 border-border hover:bg-muted text-xs h-8 px-3"
              title={`Sort by ${sort === 'latest' ? 'oldest' : 'latest'} first`}
            >
              <ArrowUpDown className="size-3.5" />
              <span className="hidden sm:inline">
                {sort === 'latest' ? 'Latest First' : 'Oldest First'}
              </span>
            </Button>
            <Link href="/dashboard/admin/blogs/create">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-8 text-xs">
                <Plus className="size-4" />
                Create Post
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <FileText className="size-4 sm:size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
                  Total Posts
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <FileText className="size-4 sm:size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
                  Published
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.published}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <FileText className="size-4 sm:size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
                  Drafts
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.draft}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-500/10">
                <FileText className="size-4 sm:size-5 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
                  Archived
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.archived}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select
                value={status || 'ALL'}
                onValueChange={(value) => setStatus(value === 'ALL' ? '' : (value as BlogStatus))}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Select
                value={categoryId || 'ALL'}
                onValueChange={(val) => setCategoryId(val === 'ALL' ? '' : val)}
                disabled={loadingCategories}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Sort By</label>
              <Select value={sort} onValueChange={(value) => setSort(value as 'latest' | 'oldest')}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              Results update automatically as you type.
            </p>
            <Button
              onClick={handleReset}
              disabled={loading}
              variant="outline"
              size="sm"
              className="gap-2 h-8 text-xs"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          </div>
        </div>

        {/* Table */}
        <BlogPostsTable
          posts={posts}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          total={total}
          onPostUpdated={() => void fetchPosts(1, false)}
          onStatusChange={handleStatusChange}
          onDeletePost={handleDeletePost}
        />
      </div>
    </RoleGuard>
  )
}
