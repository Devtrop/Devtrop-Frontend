'use client'

import React from 'react'
import { usePermission } from '@/contexts/PermissionContext'
import { Loader2 } from 'lucide-react'

interface PermissionGateProps {
  /** The permission key to check, e.g. "users.read", "roles.create" */
  permission: string
  /** Content to render when permission is granted */
  children: React.ReactNode
  /** Optional fallback when permission is denied (defaults to null — nothing rendered) */
  fallback?: React.ReactNode
  /** Show a loading spinner while permissions are being fetched (default: false) */
  showLoader?: boolean
}

/**
 * Renders children only when the authenticated user has the specified permission.
 * Shows the fallback (or nothing) when the permission is missing.
 *
 * Usage:
 * ```tsx
 * <PermissionGate permission="users.create">
 *   <CreateUserButton />
 * </PermissionGate>
 *
 * <PermissionGate permission="roles.delete" fallback={<span>No access</span>}>
 *   <DeleteRoleButton />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permission,
  children,
  fallback = null,
  showLoader = false,
}: PermissionGateProps) {
  const { hasPermission, isPermissionLoading } = usePermission()

  if (isPermissionLoading && showLoader) {
    return (
      <div className="inline-flex items-center justify-center p-1">
        <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // While permissions are still loading, optimistically hide to avoid flash
  if (isPermissionLoading) {
    return null
  }

  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Same as PermissionGate but checks multiple permissions with OR logic.
 * Renders children if the user has ANY of the listed permissions.
 */
export function AnyPermissionGate({
  permissions,
  children,
  fallback = null,
}: {
  permissions: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasAnyPermission, isPermissionLoading } = usePermission()

  if (isPermissionLoading) return null
  if (!hasAnyPermission(permissions)) return <>{fallback}</>

  return <>{children}</>
}

/**
 * Same as PermissionGate but checks multiple permissions with AND logic.
 * Renders children only if the user has ALL of the listed permissions.
 */
export function AllPermissionsGate({
  permissions,
  children,
  fallback = null,
}: {
  permissions: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasAllPermissions, isPermissionLoading } = usePermission()

  if (isPermissionLoading) return null
  if (!hasAllPermissions(permissions)) return <>{fallback}</>

  return <>{children}</>
}
