'use client'

import React, { useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useDashboardSidebar } from '@/contexts/DashboardSidebarContext'
import { getAuthorizedNavGroups, type NavItem } from '@/config/navigation.config'
import {
  getUserRoleDisplay,
  getRoleBadgeColors,
  normalizeRole,
  extractUserRole,
} from '@/config/roles.config'
import { useAuth } from '@/contexts/AuthContext'
import { usePermission } from '@/contexts/PermissionContext'
import { cn } from '@/lib/utils'
import { LogOut } from 'lucide-react'
import Image from 'next/image'

export function DashboardMobileSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { isMobileOpen, setMobileOpen, activeRole } = useDashboardSidebar()
  const { permissions } = usePermission()
  const isSuperAdmin = normalizeRole(extractUserRole(user) || activeRole) === 'SUPER_ADMIN'

  // Derive authorized navigation groups dynamically from user permissions
  const authorizedGroups = useMemo(
    () => getAuthorizedNavGroups(permissions, isSuperAdmin),
    [permissions, isSuperAdmin],
  )

  const allNavItems = useMemo(
    () => authorizedGroups.flatMap((g) => g.items),
    [authorizedGroups],
  )

  const isItemActive = useCallback(
    (item: NavItem) => {
      if (item.exact) {
        return pathname === item.href
      }
      if (item.id === 'closed-applications') {
        if (pathname === '/dashboard/closed' || pathname.startsWith('/dashboard/closed/')) {
          return true
        }
      }
      if (item.id === 'applications') {
        if (
          pathname === '/dashboard/closed' ||
          pathname.startsWith('/dashboard/closed/') ||
          pathname === '/dashboard/admin/applications/closed' ||
          pathname.startsWith('/dashboard/admin/applications/closed/')
        ) {
          return false
        }
      }

      const matches = pathname === item.href || pathname.startsWith(item.href + '/')
      if (!matches) return false

      const hasMoreSpecificMatch = allNavItems.some(
        (other) =>
          other.id !== item.id &&
          other.href.length > item.href.length &&
          (pathname === other.href || pathname.startsWith(other.href + '/')),
      )
      return !hasMoreSpecificMatch
    },
    [pathname, allNavItems],
  )

  const dynamicRoleName = getUserRoleDisplay(user)
  const roleBadgeColors = getRoleBadgeColors(user)

  const handleNavClick = () => {
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    setMobileOpen(false)
    await logout()
    router.push('/auth/login')
  }

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : user?.email
      ? user.email.slice(0, 2).toUpperCase()
      : 'U'

  return (
    <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent
        side="left"
        className="w-75 sm:w-87.5 p-0 bg-canvas border-r border-hairline-light text-body flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-hairline-light flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2.5 focus:outline-none shrink-0"
              aria-label="Devtrop Home"
            >
              <div className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-30 md:h-30">
                <Image
                  src="/devtrop_logo_transparent_bg_resized.png"
                  alt="Devtrop"
                  fill
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 96px, 120px"
                  className="object-contain"
                />
              </div>
            </Link>
          </div>
        </div>

        {/* Scrollable Nav List */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="flex flex-col gap-6">
            {authorizedGroups.map((group) => (
              <div key={group.id} className="flex flex-col gap-1.5">
                <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                  {group.heading}
                </div>

                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const isActive = isItemActive(item)
                    const Icon = item.icon

                    return (
                      <div key={item.id} className="flex flex-col gap-0.5">
                        <Link
                          href={item.href}
                          onClick={handleNavClick}
                          className={cn(
                            'flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors border-l-2',
                            isActive
                              ? 'border-l-accent bg-accent-soft text-accent font-semibold'
                              : 'border-l-transparent text-muted hover:bg-subtle hover:text-body',
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={cn(
                                'size-4',
                                isActive ? 'text-accent' : 'text-muted',
                              )}
                            />
                            <span>{item.title}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={cn(
                                'px-1.5 py-0.5 text-[9px] font-bold border',
                                item.badge.colorClass ||
                                  'bg-subtle text-muted border-hairline-light',
                              )}
                            >
                              {item.badge.text}
                            </span>
                          )}
                        </Link>

                        {/* Render Submenu Children */}
                        {item.children && item.children.length > 0 && (
                          <div className="flex flex-col gap-0.5 pl-7 pr-2">
                            {item.children.map((child) => {
                              const isChildActive = pathname === child.href
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={handleNavClick}
                                  className={cn(
                                    'flex items-center justify-between px-2.5 py-1.5 text-[11px] font-medium transition-colors border-l-2',
                                    isChildActive
                                      ? 'text-accent bg-accent-soft border-l-accent font-semibold'
                                      : 'text-muted hover:text-body hover:bg-subtle border-l-transparent',
                                  )}
                                >
                                  <span>{child.title}</span>
                                  {child.badge && (
                                    <span
                                      className={cn(
                                        'px-1.5 py-0.5 text-[8px] font-bold border',
                                        child.badge.colorClass || 'bg-subtle text-muted border-hairline-light',
                                      )}
                                    >
                                      {child.badge.text}
                                    </span>
                                  )}
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Bottom accent bar — Swiss structural flourish */}
        <div className="shrink-0 h-1 bg-obsidian" />
      </SheetContent>
    </Sheet>
  )
}
