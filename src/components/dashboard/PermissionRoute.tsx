'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePermission } from '@/contexts/PermissionContext'
import { UserRole, hasRoleAccess, normalizeRole, extractUserRole } from '@/config/roles.config'
import { useDashboardSidebar } from '@/contexts/DashboardSidebarContext'
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardCardSkeleton } from '@/components/dashboard/common/DashboardSkeleton'
import Link from 'next/link'

export interface PermissionRouteProps {
  /**
   * List of permissions (e.g. ["user.read", "user.role.update"]).
   * If provided, granted if user has ANY ONE of these permissions (OR logic).
   */
  permissions?: string[]
  /**
   * Single permission key from the backend (e.g. "users.read", "roles.read").
   */
  permission?: string
  /**
   * Static role fallback — used only when no permissions are configured.
   */
  allowedRoles?: UserRole[]
  children: React.ReactNode
  /**
   * Where to redirect unauthenticated users (default: /auth/login).
   */
  loginRedirect?: string
}

/**
 * PermissionRoute — wraps a page/section and enforces auth and dynamic permission checks.
 */
export function PermissionRoute({
  permissions,
  permission,
  allowedRoles = [],
  children,
  loginRedirect = '/auth/login',
}: PermissionRouteProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { hasAnyPermission, isPermissionLoading } = usePermission()
  const { activeRole } = useDashboardSidebar()

  // Collect all permission requirements
  const requiredPermissions: string[] = []
  if (Array.isArray(permissions)) requiredPermissions.push(...permissions)
  if (permission) requiredPermissions.push(permission)

  const hasPermissionRequirement = requiredPermissions.length > 0

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(loginRedirect)
    }
  }, [isAuthLoading, isAuthenticated, router, loginRedirect])

  const userRole = normalizeRole(extractUserRole(user) || activeRole)
  const isSuperAdmin = userRole === 'SUPER_ADMIN'

  // 1. Super Admin bypass
  if (isSuperAdmin) {
    return <>{children}</>
  }

  // 2. Loading state — skeleton UI
  if (isAuthLoading || (hasPermissionRequirement && isPermissionLoading) || !isAuthenticated) {
    return (
      <div className="animate-in fade-in">
        <DashboardCardSkeleton />
      </div>
    )
  }

  // 3. Authorization check
  let isAuthorized = false
  if (hasPermissionRequirement) {
    isAuthorized = hasAnyPermission(requiredPermissions)
  } else if (allowedRoles.length > 0) {
    isAuthorized = hasRoleAccess(userRole, allowedRoles)
  } else {
    isAuthorized = true
  }

  if (!isAuthorized) {
    const requiredText = hasPermissionRequirement
      ? requiredPermissions.length === 1
        ? `Required Permission: ${requiredPermissions[0]}`
        : `Required Permissions (Any): ${requiredPermissions.join(', ')}`
      : `Required Roles: ${allowedRoles.join(', ')}`

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
                You don&apos;t have the required permissions to access this page. Contact your
                administrator if you believe this is a mistake.
              </p>
            </div>

            <div className="w-full rounded-none bg-background/60 border border-border/80 p-3 text-left flex flex-col gap-1 text-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                Privilege Scopes:
              </span>
              <span className="font-mono font-medium text-accent break-words">
                {requiredText}
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full pt-1">
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

  return <>{children}</>
}
