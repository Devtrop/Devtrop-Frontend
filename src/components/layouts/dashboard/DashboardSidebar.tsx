'use client'

import React, { useState, useMemo, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Pin, PinOff, ChevronDown, LogOut, Settings } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import Image from 'next/image'

export function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { isPinned, isExpanded, togglePin, setIsHovered, activeRole } = useDashboardSidebar()

  // Track open states for collapsible sub-items
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({})
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Debounce the hover-out so scrolling inside the sidebar doesn't collapse it
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
    setIsHovered(true)
  }, [setIsHovered])

  const handleMouseLeave = useCallback(() => {
    leaveTimerRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 300)
  }, [setIsHovered])

  const toggleSubMenu = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenSubMenus((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      router.push('/auth/login')
    } catch (err) {
      console.error('Logout failed:', err)
      router.push('/auth/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const dynamicRoleName = getUserRoleDisplay(user)
  const roleBadgeColors = getRoleBadgeColors(user)
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

  // Compute initials safely
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
    <TooltipProvider delayDuration={150}>
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'hidden md:flex fixed top-0 left-0 bottom-0 z-40 flex-col bg-canvas border-r border-hairline-light backdrop-blur-xl text-body transition-all duration-300 ease-in-out shadow-[2px_0_0_0_#000]',
          isExpanded ? 'w-67.5' : 'w-18',
        )}
      >
        {/* Top Header: Brand Logo, Title & Interactive Pin Button */}
        <div className="flex h-16 shrink-0 items-center justify-between px-3.5 border-b border-hairline-light">
          <div className="flex items-center gap-3 overflow-hidden">
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col min-w-0"
                >
                  <Link
                    href="/"
                    className="group flex items-center gap-2.5 focus:outline-none shrink-0"
                    aria-label="Devtrop Home"
                  >
                    <div className="relative w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24">
                      <Image
                        src="/devtrop_logo_transparent_bg_resized.png"
                        alt="Devtrop"
                        fill
                        sizes="(max-width: 640px) 48px, (max-width: 768px) 80px, 96px"
                        className="object-contain"
                      />
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapsed state icon */}
            {!isExpanded && (
              <Link href="/" aria-label="Devtrop Home" className="flex items-center justify-center mx-auto">
                <div className="relative w-8 h-8">
                  <Image
                    src="/devtrop_logo_transparent_bg_resized.png"
                    alt="Devtrop"
                    fill
                    sizes="32px"
                    className="object-contain"
                  />
                </div>
              </Link>
            )}
          </div>

          {/* Pin Button */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePin}
                      className={cn(
                        'size-8 rounded-none border text-muted hover:text-body hover:bg-subtle cursor-pointer transition-colors',
                        isPinned && 'text-accent bg-accent-soft border-accent hover:bg-accent-soft',
                      )}
                    >
                      {isPinned ? (
                        <Pin className="size-4 rotate-45" />
                      ) : (
                        <PinOff className="size-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {isPinned ? 'Unpin Sidebar (Hover Mode)' : 'Pin Sidebar (Lock Open)'}
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Middle Navigation Items Scroll Area */}
        <div className="sidebar-scroll flex-1 min-h-0 overflow-y-auto px-3 py-4 pointer-events-auto">
          <div className="flex flex-col gap-6 select-none">
            {authorizedGroups.map((group) => (
              <div key={group.id} className="flex flex-col gap-1">
                {/* Group Heading (only displayed when expanded) */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted select-none truncate"
                    >
                      {group.heading}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Group Items */}
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const isActive = isItemActive(item)
                    const Icon = item.icon
                    const hasChildren = item.children && item.children.length > 0
                    const isSubOpen = openSubMenus[item.id] || isActive

                    const navButton = (
                      <Link
                        href={item.href}
                        className={cn(
                          'group relative flex items-center gap-3 px-2.5 py-2 text-xs font-medium transition-all duration-200 cursor-pointer border-l-2',
                          isActive
                            ? 'border-l-accent bg-accent-soft text-accent font-semibold'
                            : 'border-l-transparent text-muted hover:bg-subtle hover:text-body hover:border-l-hairline-light',
                          !isExpanded && 'justify-center px-0 size-11 mx-auto border-l-0 border-b-2',
                        )}
                      >
                        <div className="flex size-6 shrink-0 items-center justify-center">
                          <Icon
                            className={cn(
                              'size-4.5 transition-transform duration-200 group-hover:scale-110',
                              isActive
                                ? 'text-accent'
                                : 'text-muted group-hover:text-body',
                            )}
                          />
                        </div>

                        {/* Title and Badge when expanded */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -6 }}
                              transition={{ duration: 0.15 }}
                              className="flex flex-1 items-center justify-between min-w-0 overflow-hidden"
                            >
                              <span className="truncate">{item.title}</span>

                              <div className="flex items-center gap-1.5 ml-auto">
                                {item.badge && (
                                  <span
                                    className={cn(
                                      'px-1.5 py-0.5 rounded-none text-[9px] font-bold border',
                                      item.badge.colorClass ||
                                        'bg-subtle text-muted border-hairline-light',
                                    )}
                                  >
                                    {item.badge.text}
                                  </span>
                                )}

                                {hasChildren && (
                                  <button
                                    onClick={(e) => toggleSubMenu(item.id, e)}
                                    className="p-0.5 text-muted hover:text-body transition-colors"
                                    aria-label="Toggle sub-menu"
                                  >
                                    <ChevronDown
                                      className={cn(
                                        'size-3.5 transition-transform duration-200',
                                        isSubOpen && 'rotate-180',
                                      )}
                                    />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Link>
                    )

                    // Render with Collapsible if item has children and is expanded
                    if (hasChildren && isExpanded) {
                      return (
                        <Collapsible
                          key={item.id}
                          open={isSubOpen}
                          onOpenChange={() =>
                            setOpenSubMenus((prev) => ({
                              ...prev,
                              [item.id]: !prev[item.id],
                            }))
                          }
                          className="flex flex-col"
                        >
                          {navButton}
                          <CollapsibleContent className="flex flex-col gap-0.5 pl-8 pr-1 pt-1">
                            {item.children?.map((child) => {
                              const isChildActive = pathname === child.href
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={cn(
                                    'flex items-center justify-between px-2.5 py-1.5 text-[11px] font-medium transition-colors border-l-2',
                                    isChildActive
                                      ? 'text-accent bg-accent-soft border-l-accent font-semibold'
                                      : 'text-muted hover:text-body hover:bg-subtle border-l-transparent',
                                  )}
                                >
                                  <span className="truncate">{child.title}</span>
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
                          </CollapsibleContent>
                        </Collapsible>
                      )
                    }

                    // Render with Tooltip when collapsed
                    if (!isExpanded) {
                      return (
                        <Tooltip key={item.id}>
                          <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                          <TooltipContent side="right" sideOffset={12}>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold">{item.title}</span>
                              {item.description && (
                                <span className="text-[10px] text-muted-foreground">
                                  {item.description}
                                </span>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    }

                    return <React.Fragment key={item.id}>{navButton}</React.Fragment>
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom border accent line — Swiss structural flourish */}
        <div className="shrink-0 h-1 bg-obsidian" />
      </aside>
    </TooltipProvider>
  )
}
