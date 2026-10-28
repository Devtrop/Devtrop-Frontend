import { User } from '@/contexts/AuthContext'

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER'

export interface RoleMetadata {
  id: UserRole
  label: string
  description: string
  badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive'
  badgeColor: {
    bg: string
    text: string
    border: string
    dot: string
    glow: string
  }
  rank: number
}

export const ROLES: Record<UserRole, RoleMetadata> = {
  SUPER_ADMIN: {
    id: 'SUPER_ADMIN',
    label: 'Super Admin',
    description: 'Full unrestricted system access, security governance, and user provisioning.',
    badgeVariant: 'default',
    badgeColor: {
      bg: 'bg-purple-500/10 dark:bg-purple-950/40',
      text: 'text-purple-600 dark:text-purple-300',
      border: 'border-purple-500/30 dark:border-purple-500/30',
      dot: 'bg-purple-500',
      glow: 'shadow-purple-500/20',
    },
    rank: 3,
  },
  ADMIN: {
    id: 'ADMIN',
    label: 'Admin',
    description:
      'Operational control over interviews, candidate workflows, and department analytics.',
    badgeVariant: 'secondary',
    badgeColor: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-300',
      border: 'border-emerald-500/30 dark:border-emerald-500/30',
      dot: 'bg-emerald-500',
      glow: 'shadow-emerald-500/20',
    },
    rank: 2,
  },
  USER: {
    id: 'USER',
    label: 'User',
    description:
      'Personal candidate portal for booking interviews, tracking applications, and profile settings.',
    badgeVariant: 'outline',
    badgeColor: {
      bg: 'bg-sky-500/10 dark:bg-sky-950/40',
      text: 'text-sky-600 dark:text-sky-300',
      border: 'border-sky-500/30 dark:border-sky-500/30',
      dot: 'bg-sky-500',
      glow: 'shadow-sky-500/20',
    },
    rank: 1,
  },
}

/**
 * Extracts raw role string or identifier directly from the backend user credentials.
 */
export function extractUserRole(user?: User | null): string | null {
  if (!user) return null
  if (typeof user.roleName === 'string' && user.roleName.trim()) return user.roleName.trim()
  if (typeof user.role_name === 'string' && user.role_name.trim()) return user.role_name.trim()
  if (typeof user.role === 'string' && user.role.trim()) return user.role.trim()
  if (typeof user.role === 'object' && user.role !== null) {
    if (typeof user.role.name === 'string') return user.role.name
    if (typeof user.role.roleName === 'string') return user.role.roleName
  }
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    const first = user.roles[0]
    if (typeof first === 'string') return first
    if (typeof first === 'object' && first !== null && typeof first.name === 'string') {
      return first.name
    }
  }
  return null
}

/**
 * Normalizes string inputs into valid UserRole types safely.
 */
export function normalizeRole(rawRole?: string | null): UserRole {
  if (!rawRole) return 'USER'
  const clean = rawRole
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')
  if (clean === 'SUPER_ADMIN' || clean === 'SUPERADMIN' || clean === 'ROOT') return 'SUPER_ADMIN'
  if (clean === 'ADMIN' || clean === 'ADMINISTRATOR' || clean === 'MANAGER') return 'ADMIN'
  return 'USER'
}

/**
 * Dynamically formats and returns the user's role name directly from backend credentials.
 * Absolutely no static or hardcoded fallback names.
 */
export function getUserRoleDisplay(user?: User | null): string {
  const extracted = extractUserRole(user)
  if (extracted) {
    // If backend returns formatted name like "Super Admin" or "HR Manager", keep it
    if (extracted.includes(' ') || extracted.length > 15) {
      return extracted
    }
    // Clean SNAKE_CASE into Title Case if needed (e.g. SUPER_ADMIN -> Super Admin)
    return extracted
      .split(/[_\s-]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }
  return 'Member'
}

/**
 * Returns dynamic badge styling for any role.
 */
export function getRoleBadgeColors(user?: User | null) {
  const normalized = normalizeRole(extractUserRole(user))
  return ROLES[normalized]?.badgeColor || ROLES.USER.badgeColor
}

/**
 * Checks if a user's role is in the list of allowed roles.
 */
export function hasRoleAccess(
  userRole: UserRole | string | undefined | null,
  allowedRoles: UserRole[],
): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true
  const normalized = normalizeRole(userRole)
  return allowedRoles.includes(normalized)
}
