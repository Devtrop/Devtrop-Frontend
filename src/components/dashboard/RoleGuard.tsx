'use client'

import React from 'react'
import {
  UserRole,
  ROLES,
  hasRoleAccess,
  getUserRoleDisplay,
  normalizeRole,
  extractUserRole,
} from '@/config/roles.config'
import { useDashboardSidebar } from '@/contexts/DashboardSidebarContext'
import { useAuth } from '@/contexts/AuthContext'
import { usePermission } from '@/contexts/PermissionContext'
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardCardSkeleton } from '@/components/dashboard/common/DashboardSkeleton'
import Link from 'next/link'

export interface RoleGuardProps {
  /**
   * List of dynamic permission keys (e.g. ["user.read", "user.role.update"]).
   * If provided, granted if user has ANY ONE of these permissions (OR logic).
   */
  permissions?: string[]
  /**
   * Single dynamic permission key (e.g. "user.read").
   */
  permission?: string
  /**
   * Static role list fallback — used only when no permissions are specified.
   */
  allowedRoles?: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({
  permissions,
  permission,
  allowedRoles = [],
  children,
  fallback,
}: RoleGuardProps) {
  const { activeRole, isMounted } = useDashboardSidebar()
  const { user, isLoading: isAuthLoading } = useAuth()
  const { hasAnyPermission, isPermissionLoading } = usePermission()

  // Collect all permission requirements
  const requiredPermissions: string[] = []
  if (Array.isArray(permissions)) requiredPermissions.push(...permissions)
  if (permission) requiredPermissions.push(permission)

  const hasPermissionRequirement = requiredPermissions.length > 0

  // 1. Show fallback skeleton during SSR or while auth/permissions are loading
  if (!isMounted || isAuthLoading || (hasPermissionRequirement && isPermissionLoading)) {
    if (fallback) return <>{fallback}</>
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 animate-in fade-in">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const userRole = normalizeRole(extractUserRole(user) || activeRole)
  const isSuperAdmin = userRole === 'SUPER_ADMIN'

  // 2. Super Admin bypass: unrestricted access
  if (isSuperAdmin) {
    return <>{children}</>
  }

  // 3. Permission-driven check takes priority
  if (hasPermissionRequirement) {
    if (hasAnyPermission(requiredPermissions)) {
      return <>{children}</>
    }
  } else if (allowedRoles.length > 0) {
    // 4. Static role fallback only when no permissions are specified
    if (hasRoleAccess(userRole, allowedRoles)) {
      return <>{children}</>
    }
  } else {
    // No restrictions specified
    return <>{children}</>
  }

  // Unauthorized fallback
  if (fallback) {
    return <>{fallback}</>
  }

  const dynamicRoleName = getUserRoleDisplay(user)
  const requiredText = hasPermissionRequirement
    ? requiredPermissions.length === 1
      ? `permission: ${requiredPermissions[0]}`
      : `permissions: ${requiredPermissions.join(', ')}`
    : allowedRoles.map((r) => ROLES[r]?.label || r).join(' or ')

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in-50">
      <Card className="max-w-md w-full border-red-500/20 bg-red-950/10 dark:bg-red-950/20 backdrop-blur-md p-6">
        <CardContent className="flex flex-col items-center gap-4 p-0">
          <div className="flex size-14 items-center justify-center rounded-none bg-red-500/10 border border-red-500/30 text-red-400/10">
            <ShieldAlert className="size-7" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your current session (
              <span className="font-semibold text-foreground">{dynamicRoleName}</span>) does not
              have sufficient privileges to view this module.
            </p>
          </div>

          <div className="w-full rounded-none bg-background/60 border border-border/80 p-3 text-left flex flex-col gap-1 text-xs">
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">
              Required Privilege:
            </span>
            <span className="font-medium text-accent break-words">{requiredText}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full pt-2">
            <Button variant="outline" size="sm" asChild className="w-full cursor-pointer">
              <Link href="/dashboard" className="gap-2">
                <ArrowLeft className="size-3.5" />
                Return to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
