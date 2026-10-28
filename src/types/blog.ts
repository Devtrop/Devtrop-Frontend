// Blog Types and Interfaces

export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BlogTag {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featuredImage?: string
  status: BlogStatus
  publishedAt?: string
  author?: {
    id: string
    name: string
    email: string
  }
  category: BlogCategory
  tags: BlogTag[] | { postId: string; tagId: string; tag: BlogTag }[]
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateBlogPostDto {
  title: string
  excerpt?: string
  content: string
  featuredImage?: string
  status: BlogStatus
  publishedAt?: string
  categoryId: string
  tagIds?: string[]
}

export interface UpdateBlogPostDto {
  title?: string
  excerpt?: string
  content?: string
  featuredImage?: string
  status?: BlogStatus
  publishedAt?: string
  categoryId?: string
  tagIds?: string[]
}

export interface UpdateBlogStatusDto {
  status: BlogStatus
}

export interface CreateBlogCategoryDto {
  name: string
  slug?: string
  description?: string
  isActive?: boolean
}

export interface UpdateBlogCategoryDto {
  name?: string
  slug?: string
  description?: string
  isActive?: boolean
}

export interface CreateBlogTagDto {
  name: string
  slug?: string
}

export interface UpdateBlogTagDto {
  name?: string
  slug?: string
}

export interface QueryBlogDto {
  page?: number
  limit?: number
  search?: string
  status?: BlogStatus
  categoryId?: string
  tagId?: string
  sort?: 'latest' | 'oldest'
  sortOrder?: 'asc' | 'desc'
}

export interface BlogPostListResponse {
  data: BlogPost[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface BlogCategoryListResponse {
  data: BlogCategory[]
  meta?: {
    total: number
  }
}

export interface BlogTagListResponse {
  data: BlogTag[]
  meta?: {
    total: number
  }
}

// Helper function to normalize tags from API response
export function normalizeBlogPostTags(
  tags: BlogTag[] | { postId: string; tagId: string; tag: BlogTag }[],
): BlogTag[] {
  if (!tags || tags.length === 0) return []

  // Check if tags are already normalized
  if ('name' in tags[0]) {
    return tags as BlogTag[]
  }

  // Extract tag objects from the relation structure
  return (tags as { postId: string; tagId: string; tag: BlogTag }[]).map((t) => t.tag)
}
