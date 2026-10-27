import { api } from '@/lib/api'
import type {
  BlogPost,
  BlogCategory,
  BlogTag,
  CreateBlogPostDto,
  UpdateBlogPostDto,
  UpdateBlogStatusDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
  CreateBlogTagDto,
  UpdateBlogTagDto,
  QueryBlogDto,
  BlogPostListResponse,
} from '@/types/blog'

// Helper function to build query parameters
function buildQueryParams(query: Record<string, any>): Record<string, string> {
  const params: Record<string, string> = {}
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value)
    }
  })
  return params
}

// ============= Blog Posts =============

export async function getBlogPosts(query?: QueryBlogDto): Promise<BlogPostListResponse> {
  const params = query ? buildQueryParams(query as Record<string, any>) : undefined
  return api.get<BlogPostListResponse>('/admin/blogs', params)
}

export async function getBlogPostById(id: string): Promise<BlogPost> {
  return api.get<BlogPost>(`/admin/blogs/${id}`)
}

export async function createBlogPost(data: CreateBlogPostDto | FormData): Promise<BlogPost> {
  return api.post<BlogPost>('/admin/blogs', data)
}

export async function updateBlogPost(
  id: string,
  data: UpdateBlogPostDto | FormData,
): Promise<BlogPost> {
  return api.patch<BlogPost>(`/admin/blogs/${id}`, data)
}

export async function updateBlogPostStatus(
  id: string,
  data: UpdateBlogStatusDto,
): Promise<BlogPost> {
  return api.patch<BlogPost>(`/admin/blogs/${id}/status`, data)
}

export async function deleteBlogPost(id: string): Promise<void> {
  await api.delete(`/admin/blogs/${id}`)
}

// ============= Blog Categories =============

export async function getBlogCategories(): Promise<BlogCategory[]> {
  return api.get<BlogCategory[]>('/admin/blog-categories')
}

export async function getBlogCategoryById(id: string): Promise<BlogCategory> {
  return api.get<BlogCategory>(`/admin/blog-categories/${id}`)
}

export async function createBlogCategory(data: CreateBlogCategoryDto): Promise<BlogCategory> {
  return api.post<BlogCategory>('/admin/blog-categories', data)
}

export async function updateBlogCategory(
  id: string,
  data: UpdateBlogCategoryDto,
): Promise<BlogCategory> {
  return api.patch<BlogCategory>(`/admin/blog-categories/${id}`, data)
}

export async function deleteBlogCategory(id: string): Promise<void> {
  await api.delete(`/admin/blog-categories/${id}`)
}

// ============= Blog Tags =============

export async function getBlogTags(): Promise<BlogTag[]> {
  return api.get<BlogTag[]>('/admin/blog-tags')
}

export async function createBlogTag(data: CreateBlogTagDto): Promise<BlogTag> {
  return api.post<BlogTag>('/admin/blog-tags', data)
}

export async function updateBlogTag(id: string, data: UpdateBlogTagDto): Promise<BlogTag> {
  return api.patch<BlogTag>(`/admin/blog-tags/${id}`, data)
}

export async function deleteBlogTag(id: string): Promise<void> {
  await api.delete(`/admin/blog-tags/${id}`)
}

// ============= Public Blog API (for frontend display) =============

/**
 * Get all published blog posts (public endpoint)
 */
export async function getPublishedBlogs(query?: QueryBlogDto): Promise<BlogPostListResponse> {
  const params = query ? buildQueryParams(query as Record<string, any>) : undefined
  return api.get<BlogPostListResponse>('/blogs', params)
}

/**
 * Get a single blog post by slug (public endpoint)
 */
export async function getBlogBySlug(slug: string): Promise<BlogPost> {
  return api.get<BlogPost>(`/blogs/${slug}`)
}

/**
 * Get related blog posts (public endpoint)
 */
export async function getRelatedBlogs(slug: string): Promise<BlogPost[]> {
  return api.get<BlogPost[]>(`/blogs/${slug}/related`)
}

/**
 * Get all active blog categories (public endpoint)
 */
export async function getActiveCategories(): Promise<BlogCategory[]> {
  return api.get<BlogCategory[]>('/blogs/categories')
}

/**
 * Get blog posts by category slug (public endpoint)
 */
export async function getBlogsByCategory(
  slug: string,
  query?: QueryBlogDto,
): Promise<BlogPostListResponse> {
  const params = query ? buildQueryParams(query as Record<string, any>) : undefined
  return api.get<BlogPostListResponse>(`/blogs/categories/${slug}`, params)
}

/**
 * Get blog posts by tag slug (public endpoint)
 */
export async function getBlogsByTag(
  slug: string,
  query?: QueryBlogDto,
): Promise<BlogPostListResponse> {
  const params = query ? buildQueryParams(query as Record<string, any>) : undefined
  return api.get<BlogPostListResponse>(`/blogs/tags/${slug}`, params)
}

/**
 * Increment blog post view count (public endpoint)
 */
export async function incrementBlogView(slug: string): Promise<{ id: string; viewCount: number }> {
  return api.post<{ id: string; viewCount: number }>(`/blogs/${slug}/view`, {})
}
