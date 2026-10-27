/**
 * Hierarchical query keys for fine-grained cache control
 *
 * Pattern: [entity, scope, ...identifiers, ...filters]
 * Example: ['blogs', 'list', { page: 1, search: 'react' }]
 *
 * This structure allows:
 * - Invalidating all blogs: queryClient.invalidateQueries({ queryKey: blogKeys.all })
 * - Invalidating all lists: queryClient.invalidateQueries({ queryKey: blogKeys.lists() })
 * - Invalidating specific list: queryClient.invalidateQueries({ queryKey: blogKeys.list({ page: 1 }) })
 */

import type { QueryBlogDto } from '@/types/blog'

export const queryKeys = {
  // ============= Auth =============
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
  },

  // ============= Blog =============
  blogs: {
    all: ['blogs'] as const,
    lists: () => [...queryKeys.blogs.all, 'list'] as const,
    list: (filters?: QueryBlogDto) => [...queryKeys.blogs.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.blogs.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.blogs.details(), slug] as const,
    related: (slug: string) => [...queryKeys.blogs.all, 'related', slug] as const,
  },

  // ============= Blog Categories =============
  blogCategories: {
    all: ['blog-categories'] as const,
    lists: () => [...queryKeys.blogCategories.all, 'list'] as const,
    list: () => [...queryKeys.blogCategories.lists()] as const,
    active: () => [...queryKeys.blogCategories.all, 'active'] as const,
    details: () => [...queryKeys.blogCategories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.blogCategories.details(), id] as const,
    posts: (slug: string, filters?: QueryBlogDto) =>
      [...queryKeys.blogCategories.all, 'posts', slug, filters ?? {}] as const,
  },

  // ============= Blog Tags =============
  blogTags: {
    all: ['blog-tags'] as const,
    lists: () => [...queryKeys.blogTags.all, 'list'] as const,
    list: () => [...queryKeys.blogTags.lists()] as const,
    details: () => [...queryKeys.blogTags.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.blogTags.details(), id] as const,
    posts: (slug: string, filters?: QueryBlogDto) =>
      [...queryKeys.blogTags.all, 'posts', slug, filters ?? {}] as const,
  },

  // ============= Jobs =============
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.jobs.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.jobs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
    applications: (id: string) => [...queryKeys.jobs.all, id, 'applications'] as const,
  },

  // ============= Applications =============
  applications: {
    all: ['applications'] as const,
    lists: () => [...queryKeys.applications.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.applications.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.applications.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.applications.details(), id] as const,
  },

  // ============= Applicants =============
  applicants: {
    all: ['applicants'] as const,
    lists: () => [...queryKeys.applicants.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.applicants.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.applicants.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.applicants.details(), id] as const,
  },

  // ============= Users =============
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.users.lists(), filters ?? {}] as const,
    deletedLists: () => [...queryKeys.users.all, 'deleted-list'] as const,
    deleted: (filters?: any) => [...queryKeys.users.deletedLists(), filters ?? {}] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // ============= Invitations =============
  invitations: {
    all: ['invitations'] as const,
    detail: (token: string) => [...queryKeys.invitations.all, token] as const,
  },

  // ============= Roles =============
  roles: {
    all: ['roles'] as const,
    lists: () => [...queryKeys.roles.all, 'list'] as const,
    list: () => [...queryKeys.roles.lists()] as const,
    details: () => [...queryKeys.roles.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.roles.details(), id] as const,
  },

  // ============= Job Tasks =============
  jobTasks: {
    all: ['job-tasks'] as const,
    lists: () => [...queryKeys.jobTasks.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.jobTasks.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.jobTasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobTasks.details(), id] as const,
    byJob: (jobId: string) => [...queryKeys.jobTasks.all, 'job', jobId] as const,
  },

  // ============= Task Submissions =============
  taskSubmissions: {
    all: ['task-submissions'] as const,
    lists: () => [...queryKeys.taskSubmissions.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.taskSubmissions.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.taskSubmissions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.taskSubmissions.details(), id] as const,
  },

  // ============= Permissions =============
  permissions: {
    all: ['permissions'] as const,
    lists: () => [...queryKeys.permissions.all, 'list'] as const,
    list: () => [...queryKeys.permissions.lists()] as const,
    role: (roleId: string) => [...queryKeys.permissions.all, 'role', roleId] as const,
  },
}

export const userKeys = queryKeys.users
