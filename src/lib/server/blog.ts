import { publicServerFetch, type ServerFetchResponse } from '@/lib/server-api'
import type { BlogCategory, BlogPost, BlogPostListResponse, QueryBlogDto } from '@/types/blog'

function buildQuery(query?: QueryBlogDto): string {
  if (!query) return ''

  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  }

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

async function unwrap<T>(request: Promise<ServerFetchResponse<T>>): Promise<T> {
  const response = await request

  if (!response.success || response.data === undefined) {
    throw new Error(response.message || 'Failed to fetch blog data')
  }

  return response.data
}

/** Server-only public blog reads. */
export async function getPublishedBlogsServer(query?: QueryBlogDto): Promise<BlogPostListResponse> {
  return unwrap(
    publicServerFetch<BlogPostListResponse>(`/blogs${buildQuery(query)}`, {
      next: { revalidate: 60 },
    }),
  )
}

export async function getBlogBySlugServer(slug: string): Promise<BlogPost> {
  return unwrap(
    publicServerFetch<BlogPost>(`/blogs/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } }),
  )
}

export async function getRelatedBlogsServer(slug: string): Promise<BlogPost[]> {
  try {
    return await unwrap(
      publicServerFetch<BlogPost[]>(`/blogs/${encodeURIComponent(slug)}/related`, {
        next: { revalidate: 60 },
      }),
    )
  } catch {
    return []
  }
}

export async function getActiveCategoriesServer(): Promise<BlogCategory[]> {
  return unwrap(
    publicServerFetch<BlogCategory[]>('/blogs/categories', { next: { revalidate: 600 } }),
  )
}

export async function getBlogsByCategoryServer(
  slug: string,
  query?: QueryBlogDto,
): Promise<BlogPostListResponse> {
  return unwrap(
    publicServerFetch<BlogPostListResponse>(
      `/blogs/categories/${encodeURIComponent(slug)}${buildQuery(query)}`,
      { next: { revalidate: 60 } },
    ),
  )
}

export async function getBlogsByTagServer(
  slug: string,
  query?: QueryBlogDto,
): Promise<BlogPostListResponse> {
  return unwrap(
    publicServerFetch<BlogPostListResponse>(
      `/blogs/tags/${encodeURIComponent(slug)}${buildQuery(query)}`,
      { next: { revalidate: 60 } },
    ),
  )
}
