'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import { api, PermissionItem, RoleItem } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { User } from '@/contexts/AuthContext'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PermissionContextType {
  /** All system permissions from GET /permissions */
  allPermissions: PermissionItem[]
  /** Active permissions for the current user (derived from their role) */
  permissions: string[]
  /** Whether the permission fetch is in progress */
  isPermissionLoading: boolean
  /** Error state from last fetch attempt */
  permissionError: string | null
  /** Check if the current user has a specific permission by name */
  hasPermission: (permission: string) => boolean
  /** Check if the current user has any of the given permissions */
  hasAnyPermission: (permissions: string[]) => boolean
  /** Check if the current user has all of the given permissions */
  hasAllPermissions: (permissions: string[]) => boolean
  /** Manually re-fetch permissions (e.g. after role change) */
  refreshPermissions: () => Promise<void>
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

import { normalizeRole, extractUserRole } from '@/config/roles.config'
import { PERMISSIONS } from '@/config/permissions.config'

/**
 * Extracts the role ID or role name from the user object.
 * Handles all the various shapes the backend might return.
 */
function extractRoleId(user: User | null): string | null {
  if (!user) return null

  if (typeof user.roleId === 'string' && user.roleId.trim()) {
    return user.roleId.trim()
  }

  if (typeof (user as Record<string, unknown>).role_id === 'string') {
    const rId = (user as Record<string, unknown>).role_id as string
    if (rId.trim()) return rId.trim()
  }

  // role as an object with an id
  if (typeof user.role === 'object' && user.role !== null) {
    if (typeof user.role.id === 'string' && user.role.id.trim()) {
      return user.role.id.trim()
    }
  }

  // roles array — use first entry
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    const first = user.roles[0]
    if (typeof first === 'object' && first !== null && typeof first.id === 'string') {
      return first.id.trim()
    }
  }

  return null
}

/**
 * Normalizes a list of permissions from the backend.
 * Permissions may come as objects with a `name` field, nested `permission` objects, or plain strings.
 */
export function normalizePermissions(raw: unknown[]): string[] {
  if (!Array.isArray(raw)) return []

  const result: string[] = []

  for (const p of raw) {
    if (!p) continue

    if (typeof p === 'string') {
      const clean = p.trim()
      if (clean) result.push(clean)
      continue
    }

    if (typeof p === 'object' && p !== null) {
      const obj = p as Record<string, unknown>

      // 1. Direct name
      if (typeof obj.name === 'string' && obj.name.trim()) {
        result.push(obj.name.trim())
        continue
      }

      // 2. Direct permissionName
      if (typeof obj.permissionName === 'string' && obj.permissionName.trim()) {
        result.push(obj.permissionName.trim())
        continue
      }

      // 3. Nested permission object (e.g. Prisma RolePermission relation)
      if (typeof obj.permission === 'object' && obj.permission !== null) {
        const nested = obj.permission as Record<string, unknown>
        if (typeof nested.name === 'string' && nested.name.trim()) {
          result.push(nested.name.trim())
          continue
        }
        if (typeof nested.permissionName === 'string' && nested.permissionName.trim()) {
          result.push(nested.permissionName.trim())
          continue
        }
      }

      // 4. String permission field
      if (typeof obj.permission === 'string' && obj.permission.trim()) {
        result.push(obj.permission.trim())
        continue
      }
    }
  }

  return Array.from(new Set(result))
}

/**
 * Returns alternative variants/aliases for a given permission key.
 * Ensures singular/plural module equivalence (e.g. "user.read" <-> "users.read", "roles.create" <-> "role.create").
 */
export function getPermissionAliases(perm: string): string[] {
  if (!perm) return []
  const aliases = new Set<string>([perm])

  // Normalize separator (colon <-> dot)
  if (perm.includes(':')) {
    aliases.add(perm.replace(/:/g, '.'))
  }
  if (perm.includes('.')) {
    aliases.add(perm.replace(/\./g, ':'))
  }

  // Module alias cross-mappings (e.g. backend job_post <-> frontend job, applicant <-> candidate)
  const crossModulePairs: [string, string][] = [
    ['job_post.', 'job.'],
    ['job_post.', 'jobs.'],
    ['job.', 'job_post.'],
    ['jobs.', 'job_post.'],
    ['applicant.', 'candidate.'],
    ['applicant.', 'candidates.'],
    ['candidate.', 'applicant.'],
    ['candidates.', 'applicant.'],
    ['task.', 'job_task.'],
    ['task.', 'job-task.'],
    ['task_report.', 'task-report.'],
    ['project_report.', 'project-report.'],
    ['report.', 'analytics.'],
    ['reports.', 'analytics.'],
    ['report.', 'analytics_report.'],
  ]

  for (const [a, b] of crossModulePairs) {
    if (perm.startsWith(a)) {
      aliases.add(b + perm.slice(a.length))
    } else if (perm.startsWith(b)) {
      aliases.add(a + perm.slice(b.length))
    }
  }

  // Singular <-> Plural module prefixes
  const modulePairs: [string, string][] = [
    ['user.', 'users.'],
    ['role.', 'roles.'],
    ['candidate.', 'candidates.'],
    ['applicant.', 'applicants.'],
    ['application.', 'applications.'],
    ['job.', 'jobs.'],
    ['job_post.', 'job_posts.'],
    ['interview.', 'interviews.'],
    ['job_task.', 'job_tasks.'],
    ['task.', 'tasks.'],
    ['employee.', 'employees.'],
    ['intern.', 'interns.'],
    ['project.', 'projects.'],
    ['permission.', 'permissions.'],
    ['document.', 'documents.'],
    ['attendance.', 'attendances.'],
    ['leave.', 'leaves.'],
    ['report.', 'reports.'],
    ['audit.', 'audit_logs.'],
    ['audit_log.', 'audit_logs.'],
    ['integration.', 'integrations.'],
  ]

  for (const [sing, plur] of modulePairs) {
    if (perm.startsWith(sing)) {
      aliases.add(plur + perm.slice(sing.length))
    } else if (perm.startsWith(plur)) {
      aliases.add(sing + perm.slice(plur.length))
    }
  }

  return Array.from(aliases)
}

/**
 * Extracts the normalized role name to detect SUPER_ADMIN.
 */
function isUserSuperAdmin(user: User | null): boolean {
  if (!user) return false
  return normalizeRole(extractUserRole(user)) === 'SUPER_ADMIN'
}

/**
 * Extracts permissions from a RoleItem — handles both flat arrays and nested objects.
 */
/**
 * Extracts permissions from a User object — handles role.rolePermissions, role.permissions, and permissions array.
 */
function extractPermissionsFromUser(user: User | null): string[] {
  if (!user) return []

  const perms: unknown[] = []

  if (user.role && typeof user.role === 'object') {
    const roleObj = user.role as Record<string, unknown>
    if (Array.isArray(roleObj.rolePermissions)) {
      perms.push(...roleObj.rolePermissions)
    }
    if (Array.isArray(roleObj.permissions)) {
      perms.push(...roleObj.permissions)
    }
  }

  if (Array.isArray((user as Record<string, unknown>).rolePermissions)) {
    perms.push(...((user as Record<string, unknown>).rolePermissions as unknown[]))
  }

  if (Array.isArray(user.permissions)) {
    perms.push(...user.permissions)
  }

  return normalizePermissions(perms)
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, token } = useAuth()

  const [allPermissions, setAllPermissions] = useState<PermissionItem[]>([])
  const [permissions, setPermissions] = useState<string[]>([])
  const [isPermissionLoading, setIsPermissionLoading] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)

  // Guard against duplicate fetches when token/user hasn't actually changed
  const lastFetchedTokenRef = useRef<string | null>(null)
  const isFetchingRef = useRef(false)

  const fetchPermissions = useCallback(
    async (force = false) => {
      if (!isAuthenticated || !token) {
        setPermissions([])
        setAllPermissions([])
        setIsPermissionLoading(false)
        return
      }

      // Prevent duplicate fetches for the same token unless forced
      if (!force && lastFetchedTokenRef.current === token) return
      if (isFetchingRef.current) return

      isFetchingRef.current = true
      lastFetchedTokenRef.current = token
      setIsPermissionLoading(true)
      setPermissionError(null)

      try {
        // 1. Fetch fresh user profile to get latest role and embedded rolePermissions
        let currentUser: User | null = user
        try {
          const profileRes = await api.getProfile()
          if (profileRes) {
            const raw = profileRes as Record<string, unknown>
            const freshUser =
              (raw.user as User) ||
              (raw.data &&
                typeof raw.data === 'object' &&
                ((raw.data as Record<string, unknown>).user as User)) ||
              (raw.data as User)
            if (freshUser && typeof freshUser === 'object') {
              currentUser = freshUser
            }
          }
        } catch {
          // getProfile fallback to context user
        }

        // 2. If user is SUPER_ADMIN → grant all system permissions
        if (isUserSuperAdmin(currentUser)) {
          try {
            const allPermsRes = await api.getAllPermissions()
            const rawAll = Array.isArray(allPermsRes)
              ? allPermsRes
              : Array.isArray(allPermsRes.data)
                ? allPermsRes.data
                : Array.isArray((allPermsRes as Record<string, unknown>)?.permissions)
                  ? (allPermsRes as Record<string, unknown>).permissions
                  : []
            const normalizedNames = normalizePermissions(rawAll as unknown[])
            setPermissions(normalizedNames)
            return
          } catch {
            const allNames: string[] = Object.values(PERMISSIONS)
            setPermissions(allNames)
            return
          }
        }

        // 3. Extract permissions directly from embedded role permissions on user object
        const embeddedUserPerms = extractPermissionsFromUser(currentUser)
        if (embeddedUserPerms.length > 0) {
          setPermissions(embeddedUserPerms)
          return
        }

        // 4. Try to fetch role permissions by role ID if accessible
        const roleId = extractRoleId(currentUser)
        if (roleId) {
          try {
            const rolePermsRes = await api.getRolePermissions(roleId)
            const rawRolePerms: unknown[] = (() => {
              if (Array.isArray(rolePermsRes)) return rolePermsRes as unknown[]
              if (Array.isArray(rolePermsRes.data)) return rolePermsRes.data as unknown[]
              if (
                rolePermsRes.data &&
                typeof rolePermsRes.data === 'object' &&
                'permissions' in rolePermsRes.data &&
                Array.isArray(rolePermsRes.data.permissions)
              ) {
                return rolePermsRes.data.permissions as unknown[]
              }
              if (Array.isArray(rolePermsRes.permissions)) return rolePermsRes.permissions
              return []
            })()
            const userPermNames = normalizePermissions(rawRolePerms)
            if (userPermNames.length > 0) {
              setPermissions(userPermNames)
              return
            }
          } catch {
            // Role permissions fetch failed
          }
        }

        // 5. Try to get all system permissions if user has permission.read
        try {
          const allPermsRes = await api.getAllPermissions()
          const rawAll = Array.isArray(allPermsRes)
            ? allPermsRes
            : Array.isArray(allPermsRes.data)
              ? allPermsRes.data
              : Array.isArray((allPermsRes as Record<string, unknown>)?.permissions)
                ? (allPermsRes as Record<string, unknown>).permissions
                : []
          const rawItems = Array.isArray(rawAll) ? (rawAll as PermissionItem[]) : []
          setAllPermissions(rawItems)
        } catch {
          // ignore 403 on system permissions for non-admin users
        }

        setPermissions([])
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load permissions'
        console.warn('[PermissionContext] fetch error:', msg)
        setPermissionError(msg)
        setPermissions([])
      } finally {
        setIsPermissionLoading(false)
        isFetchingRef.current = false
      }
    },
    [isAuthenticated, token, user],
  )

  // Fetch permissions whenever the token changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPermissions()
  }, [fetchPermissions])

  // Listen for auth-change and permission-change events (e.g. after role update by admin)
  useEffect(() => {
    const handleAuthChange = () => {
      lastFetchedTokenRef.current = null // Force re-fetch
      fetchPermissions(true)
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dt_permission_sync' || e.key === 'dt_auth_token') {
        lastFetchedTokenRef.current = null
        fetchPermissions(true)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-change', handleAuthChange)
      window.addEventListener('permission-change', handleAuthChange)
      window.addEventListener('storage', handleStorageChange)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-change', handleAuthChange)
        window.removeEventListener('permission-change', handleAuthChange)
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [fetchPermissions])

  // Clear permissions on logout
  useEffect(() => {
    if (!isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermissions([])
      setAllPermissions([])
      lastFetchedTokenRef.current = null
    }
  }, [isAuthenticated])

  const isSuperAdmin = useMemo(() => isUserSuperAdmin(user), [user])

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!permission) return true
      if (isSuperAdmin) return true
      if (permissions.includes(permission)) return true
      const aliases = getPermissionAliases(permission)
      return aliases.some((a) => permissions.includes(a))
    },
    [permissions, isSuperAdmin],
  )

  const hasAnyPermission = useCallback(
    (perms: string[]): boolean => {
      if (!perms || perms.length === 0) return true
      if (isSuperAdmin) return true
      return perms.some((p) => hasPermission(p))
    },
    [hasPermission, isSuperAdmin],
  )

  const hasAllPermissions = useCallback(
    (perms: string[]): boolean => {
      if (!perms || perms.length === 0) return true
      if (isSuperAdmin) return true
      return perms.every((p) => hasPermission(p))
    },
    [hasPermission, isSuperAdmin],
  )

  const refreshPermissions = useCallback(async () => {
    lastFetchedTokenRef.current = null
    isFetchingRef.current = false
    await fetchPermissions(true)
  }, [fetchPermissions])

  const value = useMemo<PermissionContextType>(
    () => ({
      allPermissions,
      permissions,
      isPermissionLoading,
      permissionError,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      refreshPermissions,
    }),
    [
      allPermissions,
      permissions,
      isPermissionLoading,
      permissionError,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      refreshPermissions,
    ],
  )

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePermission(): PermissionContextType {
  const ctx = useContext(PermissionContext)
  if (ctx === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider')
  }
  return ctx
}

/**
 * Dispatches a global permission-change event to force permission re-fetch.
 * Call this after any role or permission mutation (e.g. after updateUserRole).
 */
export function notifyPermissionChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('permission-change'))
    try {
      localStorage.setItem('dt_permission_sync', String(Date.now()))
    } catch {
      // ignore
    }
  }
}
