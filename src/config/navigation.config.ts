import { UserRole } from './roles.config'
import { getPermissionAliases } from '@/contexts/PermissionContext'
import {
  LayoutDashboard,
  Calendar,
  ShieldCheck,
  Shield,
  Settings,
  Bell,
  HelpCircle,
  LucideIcon,
  BriefcaseBusiness,
  FilePlus,
  ScanEye,
  UserRoundSearch,
  ClipboardList,
  ClipboardCheck,
  FileCheck2,
  FileText,
  FolderOpen,
  Tags,
  Database,
  Mail,
  Building2,
  ArchiveX,
} from 'lucide-react'

export interface NavChildItem {
  title: string
  href: string
  /**
   * List of permissions that grant visibility to this child tab.
   * If the user has ANY ONE of these permissions, the child is visible.
   * If empty or undefined, visible to all authenticated users.
   */
  permissions?: string[]
  /** Single permission backward-compatibility key */
  permission?: string
  /** Static role fallback — used only when permissions are not yet loaded */
  roles?: UserRole[]
  badge?: {
    text: string
    colorClass?: string
  }
  description?: string
}

export interface NavItem {
  id: string
  title: string
  href: string
  icon: LucideIcon
  /**
   * List of permissions that grant visibility to this tab.
   * If the user has ANY ONE of these permissions, the tab is visible.
   * If empty or undefined, visible to all authenticated users.
   */
  permissions?: string[]
  /** Single permission backward-compatibility key */
  permission?: string
  /** Static role fallback — used only when permissions are not yet loaded */
  roles?: UserRole[]
  badge?: {
    text: string
    colorClass?: string
  }
  exact?: boolean
  description?: string
  children?: NavChildItem[]
}

export interface NavGroup {
  id: string
  heading: string
  /** Static role fallback for the group container */
  roles?: UserRole[]
  items: NavItem[]
}

export const navigationConfig: NavGroup[] = [
  {
    id: 'overview',
    heading: 'Overview',
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        exact: true,
        description: 'Main operational overview and quick KPIs',
        permissions: [], // No permission required — visible to all authenticated users
      },
    ],
  },
  {
    id: 'jobs-and-applications',
    heading: 'Jobs & Applications',
    items: [
      {
        id: 'jobs',
        title: 'All Jobs',
        href: '/dashboard/admin/jobs',
        icon: BriefcaseBusiness,
        exact: true,
        permissions: ['job_post.read', 'job_post.update', 'job_post.delete'],
        description: 'All job postings, statuses, and applicant pipelines',
      },
      {
        id: 'create-job',
        title: 'Create Job',
        href: '/dashboard/admin/jobs/create',
        icon: FilePlus,
        permissions: ['job_post.create'],
        description: 'Create and manage new job postings',
      },
      {
        id: 'applications',
        title: 'Applications',
        href: '/dashboard/admin/applications',
        icon: ScanEye,
        permissions: ['application.read', 'application.update'],
        description: 'Manage and track job applications',
      },
      {
        id: 'applicants',
        title: 'Applicants',
        href: '/dashboard/admin/applicants',
        icon: UserRoundSearch,
        permissions: ['application.read', 'application.update'],
        description: 'Manage and export candidate profiles',
      },
      {
        id: 'job-tasks',
        title: 'Job Tasks',
        href: '/dashboard/admin/job-tasks',
        icon: ClipboardList,
        permissions: ['task.create', 'task.update', 'task.delete'],
        description: 'Create and manage job tasks',
      },
      {
        id: 'task-submissions',
        title: 'Task Submissions',
        href: '/dashboard/admin/task-submissions',
        icon: ClipboardCheck,
        permissions: [
          'task.read',
          'task.assign',
          'task.status.update',
          'task_report.read',
          'task_report.approve',
          'job_task.read',
          'job-tasks.manage',
        ],
        roles: ['SUPER_ADMIN', 'ADMIN'],
        description: 'Review candidate task submissions',
      },
      {
        id: 'closed-applications',
        title: 'Closed Applications',
        href: '/dashboard/admin/applications/closed',
        icon: ArchiveX,
        permissions: ['application.read', 'application.update'],
        description: 'Archive of all closed candidate applications',
      },
    ],
  },
  {
    id: 'recruitment',
    heading: 'Recruitment & Interviews',
    items: [
      {
        id: 'interviews-manage',
        title: 'Interview Hub',
        href: '/dashboard/interviews',
        icon: Calendar,
        permissions: [
          'interview.read',
          'interview.slot.manage',
          'interview.invite',
          'interview.reschedule',
          'interview.evaluate',
          'interview.outcome',
          'interview.cancel',
        ],
        description: 'Manage slot pools, invitations, and evaluations',
      },
      {
        id: 'onboarding-manage',
        title: 'Onboarding & Documents',
        href: '/dashboard/onboarding',
        icon: FileCheck2,
        permissions: ['application.read', 'application.update'],
        description: 'Manage offers, signed agreements, verification, and orientation',
      },
    ],
  },
  {
    id: 'content',
    heading: 'Content Management',
    items: [
      {
        id: 'blog-posts',
        title: 'Blog Posts',
        href: '/dashboard/admin/blogs',
        icon: FileText,
        permissions: ['blog.read'],
        description: 'Manage blog posts and articles',
        children: [
          {
            title: 'All Posts',
            href: '/dashboard/admin/blogs',
            permissions: ['blog.read'],
            description: 'View and manage all blog posts',
          },
          {
            title: 'Create Post',
            href: '/dashboard/admin/blogs/create',
            permissions: ['blog.create'],
            description: 'Create a new blog post',
          },
        ],
      },
      {
        id: 'blog-categories',
        title: 'Categories',
        href: '/dashboard/admin/blog-categories',
        icon: FolderOpen,
        permissions: ['blog_category.read'],
        description: 'Manage blog categories',
      },
      {
        id: 'blog-tags',
        title: 'Tags',
        href: '/dashboard/admin/blog-tags',
        icon: Tags,
        permissions: ['blog_tag.read'],
        description: 'Manage blog tags',
      },
      {
        id: 'clients',
        title: 'Clients',
        href: '/dashboard/admin/clients',
        icon: Building2,
        permissions: ['client.read'],
        description: 'Manage client logos displayed on the homepage',
      },
      {
        id: 'email-templates',
        title: 'Email Templates',
        href: '/dashboard/email-templates',
        icon: Mail,
        permissions: ['email_template.read', 'email_template:read'],
        description: 'Manage email templates and notification messages',
      },
    ],
  },
  {
    id: 'governance',
    heading: 'Administration & Security',
    items: [
      {
        id: 'user-management',
        title: 'User Management',
        href: '/dashboard/user-management',
        icon: ShieldCheck,
        permissions: ['user.read', 'user.status.update', 'user.role.update', 'user.deactivate'],
        description: 'Control user accounts, status, and role assignments',
      },
      {
        id: 'roles',
        title: 'Roles & Permissions',
        href: '/dashboard/roles',
        icon: Shield,
        permissions: [
          'role.read',
          'role.create',
          'role.update',
          'role.delete',
          'permission.read',
          'permission.assign',
        ],
        description: 'Create and manage dynamic roles with fine-grained permissions',
      },
      {
        id: 'backups',
        title: 'Database Backups',
        href: '/dashboard/backups',
        icon: Database,
        permissions: ['role.read', 'user.read'],
        roles: ['SUPER_ADMIN', 'ADMIN'],
        description: 'Manage automated cloud backups and database snapshots',
      },
    ],
  },
  {
    id: 'preferences',
    heading: 'Account & Support',
    items: [
      {
        id: 'settings',
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        permissions: [], // No permission required — available to all active authenticated users
        description: 'Personal profile, notifications, and security settings',
      },
      {
        id: 'notifications',
        title: 'Notifications',
        href: '/dashboard/notifications',
        icon: Bell,
        permissions: [],
        badge: {
          text: '3',
          colorClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        },
        description: 'System alerts and candidate notifications',
      },
      {
        id: 'support',
        title: 'Help & Documentation',
        href: '/dashboard/support',
        icon: HelpCircle,
        permissions: [],
        description: 'Guides, FAQs, and support ticket system',
      },
    ],
  },
]

/**
 * Checks if a user possessing `userPermissions` has access to a required permission list.
 * Evaluates with OR logic (user needs ANY ONE of the required permissions).
 */
function checkItemPermission(
  itemPerms: string[] | undefined,
  singlePerm: string | undefined,
  userPermissions: string[],
): boolean {
  // Collect all required permissions for this item
  const required: string[] = []
  if (Array.isArray(itemPerms)) required.push(...itemPerms)
  if (singlePerm) required.push(singlePerm)

  // If no permission is required at all, item is visible to all authenticated users
  if (required.length === 0) return true

  // If user has no permissions loaded yet or has empty permissions
  if (!userPermissions || userPermissions.length === 0) return false

  // User must have AT LEAST ONE matching permission
  return required.some((req) => {
    if (userPermissions.includes(req)) return true
    const aliases = getPermissionAliases(req)
    return aliases.some((alias) => userPermissions.includes(alias))
  })
}

/**
 * Filters the master navigation tree based on the user's active permissions.
 *
 * Rules:
 * 1. SUPER_ADMIN gets full access to all sections and items.
 * 2. An item is visible if the user has ANY ONE of the permissions listed for that item.
 * 3. An item with no permissions is considered public/common to all authenticated users.
 * 4. A section (group) is automatically visible if AT LEAST ONE child item is visible.
 * 5. If all items in a section are hidden, the entire section is hidden.
 */
export function getAuthorizedNavGroups(
  permissionsOrRole: string[] | UserRole = [],
  permissionsOrIsSuperAdmin?: string[] | boolean,
  isSuperAdminFlag?: boolean,
): NavGroup[] {
  // Normalize overloaded parameters for backward compatibility:
  // Signature A: getAuthorizedNavGroups(permissions: string[], isSuperAdmin?: boolean)
  // Signature B: getAuthorizedNavGroups(role: UserRole, permissions?: string[])
  let userPermissions: string[] = []
  let isSuperAdmin = false

  if (Array.isArray(permissionsOrRole)) {
    userPermissions = permissionsOrRole
    isSuperAdmin =
      typeof permissionsOrIsSuperAdmin === 'boolean' ? permissionsOrIsSuperAdmin : false
  } else {
    // Role passed as first arg
    const role = permissionsOrRole
    if (role === 'SUPER_ADMIN') isSuperAdmin = true
    if (Array.isArray(permissionsOrIsSuperAdmin)) {
      userPermissions = permissionsOrIsSuperAdmin
    }
    if (typeof isSuperAdminFlag === 'boolean') {
      isSuperAdmin = isSuperAdminFlag
    }
  }

  // 1. Super Admin bypass: full visibility
  if (isSuperAdmin) {
    return navigationConfig
  }

  // 2. Filter navigation groups and items
  const result: NavGroup[] = []

  for (const group of navigationConfig) {
    const authorizedItems: NavItem[] = []

    for (const item of group.items) {
      // Filter children if present
      const filteredChildren = item.children
        ? item.children.filter((child) =>
            checkItemPermission(child.permissions, child.permission, userPermissions),
          )
        : undefined

      // Check parent item visibility
      const isItemAuthorized = checkItemPermission(
        item.permissions,
        item.permission,
        userPermissions,
      )

      const hasVisibleChildren = filteredChildren !== undefined && filteredChildren.length > 0

      // Item is visible if authorized directly or has visible children
      if (isItemAuthorized || hasVisibleChildren) {
        authorizedItems.push({
          ...item,
          children: hasVisibleChildren ? filteredChildren : undefined,
        })
      }
    }

    if (authorizedItems.length > 0) {
      result.push({
        ...group,
        items: authorizedItems,
      })
    }
  }

  return result
}
