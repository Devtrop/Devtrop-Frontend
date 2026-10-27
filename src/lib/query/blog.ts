import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from './keys'
import * as blogApi from '@/lib/blog'
import type {
  BlogPost,
  BlogCategory,
  BlogTag,
  QueryBlogDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
  UpdateBlogStatusDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
  CreateBlogTagDto,
  UpdateBlogTagDto,
  BlogPostListResponse,
  BlogCategoryListResponse,
  BlogTagListResponse,
} from '@/types/blog'
import { ApiError } from '@/lib/api'

// ============= Public Blog Queries =============

/**
 * Fetch published blog posts with filters and pagination
 * @param filters - Query filters (page, limit, search, categoryId, tagId)
 * @param options - React Query options
 */
export function usePublishedBlogs(
  filters?: QueryBlogDto,
  options?: Partial<UseQueryOptions<BlogPostListResponse, Error>>,
) {
  return useQuery({
    queryKey: queryKeys.blogs.list(filters),
    queryFn: () => blogApi.getPublishedBlogs(filters),
    // Keep previous data while fetching new page (for smooth pagination)
    placeholderData: (previousData) => previousData,
    ...options,
  })
}

/**
 * Fetch a single blog post by slug (public)
 * @param slug - Blog post slug
 * @param options - React Query options
 */
export function useBlogPost(slug: string, options?: Partial<UseQueryOptions<BlogPost, Error>>) {
  return useQuery({
    queryKey: queryKeys.blogs.detail(slug),
    queryFn: () => blogApi.getBlogBySlug(slug),
    enabled: !!slug,
    ...options,
  })
}

/**
 * Fetch related blog posts
 * @param slug - Blog post slug
 * @param options - React Query options
 */
export function useRelatedBlogs(
  slug: string,
  options?: Partial<UseQueryOptions<BlogPost[], Error>>,
) {
  return useQuery({
    queryKey: queryKeys.blogs.related(slug),
    queryFn: () => blogApi.getRelatedBlogs(slug),
    enabled: !!slug,
    ...options,
  })
}

/**
 * Fetch active blog categories
 */
export function useActiveCategories(options?: Partial<UseQueryOptions<BlogCategory[], Error>>) {
  return useQuery({
    queryKey: queryKeys.blogCategories.active(),
    queryFn: () => blogApi.getActiveCategories(),
    // Categories don't change often, keep them fresh for 10 minutes
    staleTime: 10 * 60 * 1000,
    ...options,
  })
}

/**
 * Fetch blog posts by category slug
 */
export function useBlogsByCategory(
  slug: string,
  filters?: QueryBlogDto,
  options?: Partial<UseQueryOptions<BlogPostListResponse, Error>>,
) {
  return useQuery({
    queryKey: queryKeys.blogCategories.posts(slug, filters),
    queryFn: () => blogApi.getBlogsByCategory(slug, filters),
    enabled: !!slug,
    placeholderData: (previousData) => previousData,
    ...options,
  })
}

/**
 * Fetch blog posts by tag slug
 */
export function useBlogsByTag(
  slug: string,
  filters?: QueryBlogDto,
  options?: Partial<UseQueryOptions<BlogPostListResponse, Error>>,
) {
  return useQuery({
    queryKey: queryKeys.blogTags.posts(slug, filters),
    queryFn: () => blogApi.getBlogsByTag(slug, filters),
    enabled: !!slug,
    placeholderData: (previousData) => previousData,
    ...options,
  })
}

// ============= Admin Blog Queries =============

/**
 * Fetch all blog posts (admin) with filters
 */
export function useBlogPosts(
  filters?: QueryBlogDto,
  options?: Partial<UseQueryOptions<BlogPostListResponse, Error>>,
) {
  return useQuery({
    queryKey: queryKeys.blogs.list(filters),
    queryFn: () => blogApi.getBlogPosts(filters),
    placeholderData: (previousData) => previousData,
    ...options,
  })
}

/**
 * Fetch a single blog post by ID (admin)
 */
export function useBlogPostById(id: string, options?: Partial<UseQueryOptions<BlogPost, Error>>) {
  return useQuery({
    queryKey: queryKeys.blogs.detail(id),
    queryFn: () => blogApi.getBlogPostById(id),
    enabled: !!id,
    ...options,
  })
}

/**
 * Fetch all blog categories (admin)
 */
export function useBlogCategories(options?: Partial<UseQueryOptions<BlogCategory[], Error>>) {
  return useQuery({
    queryKey: queryKeys.blogCategories.list(),
    queryFn: () => blogApi.getBlogCategories(),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * Fetch a single blog category by ID (admin)
 */
export function useBlogCategoryById(
  id: string,
  options?: Partial<UseQueryOptions<BlogCategory, Error>>,
) {
  return useQuery({
    queryKey: queryKeys.blogCategories.detail(id),
    queryFn: () => blogApi.getBlogCategoryById(id),
    enabled: !!id,
    ...options,
  })
}

/**
 * Fetch all blog tags (admin)
 */
export function useBlogTags(options?: Partial<UseQueryOptions<BlogTag[], Error>>) {
  return useQuery({
    queryKey: queryKeys.blogTags.list(),
    queryFn: () => blogApi.getBlogTags(),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

// ============= Blog Mutations =============

/**
 * Create a new blog post (admin)
 */
export function useCreateBlogPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBlogPostDto) => blogApi.createBlogPost(data),
    onSuccess: () => {
      // Invalidate all blog lists (admin and public)
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.lists() })
      toast.success('Blog post created successfully')
    },
    onError: (error: Error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to create blog post'
      toast.error(message)
    },
  })
}

/**
 * Update a blog post (admin)
 */
export function useUpdateBlogPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogPostDto }) =>
      blogApi.updateBlogPost(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries for this blog post
      await queryClient.cancelQueries({ queryKey: queryKeys.blogs.detail(id) })

      // Snapshot current value for rollback
      const previous = queryClient.getQueryData<BlogPost>(queryKeys.blogs.detail(id))

      // Optimistically update the cache
      if (previous) {
        queryClient.setQueryData<BlogPost>(queryKeys.blogs.detail(id), {
          ...previous,
          ...data,
        })
      }

      return { previous, id }
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.blogs.detail(context.id), context.previous)
      }
      const message = error instanceof ApiError ? error.message : 'Failed to update blog post'
      toast.error(message)
    },
    onSettled: (data, error, { id }) => {
      // Refetch to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.lists() })
    },
    onSuccess: () => {
      toast.success('Blog post updated successfully')
    },
  })
}

/**
 * Update blog post status (admin)
 */
export function useUpdateBlogPostStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogStatusDto }) =>
      blogApi.updateBlogPostStatus(id, data),
    onSuccess: (data, { id }) => {
      // Update cache for this specific post
      queryClient.setQueryData<BlogPost>(queryKeys.blogs.detail(id), data)
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.lists() })
      toast.success(`Blog post ${data.status.toLowerCase()}`)
    },
    onError: (error: Error) => {
      const message =
        error instanceof ApiError ? error.message : 'Failed to update blog post status'
      toast.error(message)
    },
  })
}

/**
 * Delete a blog post (admin)
 */
export function useDeleteBlogPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => blogApi.deleteBlogPost(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.blogs.detail(id) })
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all })
      toast.success('Blog post deleted successfully')
    },
    onError: (error: Error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to delete blog post'
      toast.error(message)
    },
  })
}

// ============= Category Mutations =============

/**
 * Create a new blog category (admin)
 */
export function useCreateBlogCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBlogCategoryDto) => blogApi.createBlogCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogCategories.all })
      toast.success('Category created successfully')
    },
    onError: (error: Error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to create category'
      toast.error(message)
    },
  })
}

/**
 * Update a blog category (admin)
 */
export function useUpdateBlogCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogCategoryDto }) =>
      blogApi.updateBlogCategory(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogCategories.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogCategories.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogCategories.active() })
      toast.success('Category updated successfully')
    },
    onError: (error: Error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to update category'
      toast.error(message)
    },
  })
}

/**
 * Delete a blog category (admin)
 */
export function useDeleteBlogCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => blogApi.deleteBlogCategory(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.blogCategories.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogCategories.all })
      toast.success('Category deleted successfully')
    },
    onError: (error: Error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to delete category'
      toast.error(message)
    },
  })
}

// ============= Tag Mutations =============

/**
 * Create a new blog tag (admin)
 */
export function useCreateBlogTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBlogTagDto) => blogApi.createBlogTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogTags.all })
      toast.success('Tag created successfully')
    },
    onError: (error: Error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to create tag'
      toast.error(message)
    },
  })
}

/**
 * Update a blog tag (admin)
 */
export function useUpdateBlogTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogTagDto }) =>
      blogApi.updateBlogTag(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogTags.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogTags.lists() })
      toast.success('Tag updated successfully')
    },
    onError: (error: Error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to update tag'
      toast.error(message)
    },
  })
}

/**
 * Delete a blog tag (admin)
 */
export function useDeleteBlogTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => blogApi.deleteBlogTag(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.blogTags.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogTags.all })
      toast.success('Tag deleted successfully')
    },
    onError: (error: Error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to delete tag'
      toast.error(message)
    },
  })
}
