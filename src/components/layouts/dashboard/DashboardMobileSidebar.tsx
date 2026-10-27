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
        className="w-75 sm:w-87.5 p-0 bg-zinc-950 border-r border-zinc-800 text-zinc-100 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2.5 focus:outline-none shrink-0"
              aria-label="Rise Together Home"
            >
              <div className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-30 md:h-30">
                <Image
                  src="/RT_Logo.png"
                  alt="Logo"
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
                <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {group.heading}
                </div>

                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const isActive = isItemActive(item)
                    const Icon = item.icon

                    return (
                      <div key={item.id} className="flex flex-col gap-1">
                        <Link
                          href={item.href}
                          onClick={handleNavClick}
                          className={cn(
                            'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-300 font-semibold ring-1 ring-emerald-500/30'
                              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100',
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={cn(
                                'size-4',
                                isActive ? 'text-emerald-400' : 'text-zinc-400',
                              )}
                            />
                            <span>{item.title}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={cn(
                                'px-1.5 py-0.5 rounded-full text-[9px] font-bold border',
                                item.badge.colorClass ||
                                  'bg-zinc-800 text-zinc-300 border-zinc-700',
                              )}
                            >
                              {item.badge.text}
                            </span>
                          )}
                        </Link>

                        {/* Render Submenu Children */}
                        {item.children && item.children.length > 0 && (
                          <div className="flex flex-col gap-1 pl-7 pr-2">
                            {item.children.map((child) => {
                              const isChildActive = pathname === child.href
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={handleNavClick}
                                  className={cn(
                                    'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors',
                                    isChildActive
                                      ? 'text-emerald-400 bg-emerald-500/10 font-semibold'
                                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60',
                                  )}
                                >
                                  <span>{child.title}</span>
                                  {child.badge && (
                                    <span
                                      className={cn(
                                        'px-1.5 py-0.2 rounded text-[8px] font-bold border',
                                        child.badge.colorClass || 'bg-zinc-800 text-zinc-300',
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

        {/* Footer Profile & Logout */}
        {/* <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 ring-1 ring-zinc-700">
              <AvatarImage
                src={user?.avatar || user?.avatarUrl || user?.image}
                alt={user?.name || 'User'}
              />
              <AvatarFallback
                suppressHydrationWarning
                className="bg-emerald-950 text-emerald-300 font-bold text-xs"
              >
                {userInitials}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col min-w-0 flex-1">
              <span
                suppressHydrationWarning
                className="text-xs font-semibold text-zinc-200 truncate"
              >
                {user?.name || 'User Account'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    'size-1.5 rounded-full shrink-0 animate-pulse',
                    roleBadgeColors.dot,
                  )}
                />
                <span
                  suppressHydrationWarning
                  className={cn('text-[10px] font-medium truncate', roleBadgeColors.text)}
                >
                  {dynamicRoleName}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full text-red-400 border-red-500/30 hover:bg-red-950/20 hover:text-red-300 gap-2 cursor-pointer"
          >
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </div> */}
      </SheetContent>
    </Sheet>
  )
}
