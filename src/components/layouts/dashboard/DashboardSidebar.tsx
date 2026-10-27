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
          'hidden md:flex fixed top-0 left-0 bottom-0 z-40 flex-col bg-zinc-950/95 border-r border-zinc-800/80 backdrop-blur-xl text-zinc-200 transition-all duration-300 ease-in-out shadow-2xl',
          isExpanded ? 'w-67.5' : 'w-18',
        )}
      >
        {/* Top Header: Brand Logo, Title & Interactive Pin Button */}
        <div className="flex h-16 shrink-0 items-center justify-between px-3.5 border-b border-zinc-800/80">
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
                    aria-label="Rise Together Home"
                  >
                    <div className="relative w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24">
                      <Image
                        src="/RT_Logo.png"
                        alt="Logo"
                        fill
                        sizes="(max-width: 640px) 48px, (max-width: 768px) 80px, 96px"
                        className="object-contain"
                      />
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
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
                        'size-8 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 cursor-pointer transition-colors',
                        isPinned && 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20',
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
                      className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 select-none truncate"
                    >
                      {group.heading}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Group Items */}
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const isActive = isItemActive(item)
                    const Icon = item.icon
                    const hasChildren = item.children && item.children.length > 0
                    const isSubOpen = openSubMenus[item.id] || isActive

                    const navButton = (
                      <Link
                        href={item.href}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-all duration-200 cursor-pointer',
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-300 font-semibold shadow-xs ring-1 ring-emerald-500/30'
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100',
                          !isExpanded && 'justify-center px-0 size-11 mx-auto',
                        )}
                      >
                        {/* Active Accent Glow Pill */}
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}

                        <div className="flex size-6 shrink-0 items-center justify-center">
                          <Icon
                            className={cn(
                              'size-4.5 transition-transform duration-200 group-hover:scale-110',
                              isActive
                                ? 'text-emerald-400'
                                : 'text-zinc-400 group-hover:text-zinc-200',
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
                                      'px-1.5 py-0.5 rounded-full text-[9px] font-bold border',
                                      item.badge.colorClass ||
                                        'bg-zinc-800 text-zinc-300 border-zinc-700',
                                    )}
                                  >
                                    {item.badge.text}
                                  </span>
                                )}

                                {hasChildren && (
                                  <button
                                    onClick={(e) => toggleSubMenu(item.id, e)}
                                    className="p-0.5 text-zinc-500 hover:text-zinc-200 transition-colors"
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
                          <CollapsibleContent className="flex flex-col gap-1 pl-8 pr-1 pt-1">
                            {item.children?.map((child) => {
                              const isChildActive = pathname === child.href
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={cn(
                                    'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors',
                                    isChildActive
                                      ? 'text-emerald-400 bg-emerald-500/10 font-semibold'
                                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60',
                                  )}
                                >
                                  <span className="truncate">{child.title}</span>
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
                                <span className="text-[10px] text-zinc-400">
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

        {/* Bottom Profile & Settings Section with User Preview and Functional Logout */}
        {/* <div className="shrink-0 p-3 border-t border-zinc-800/80 bg-zinc-950/90 flex flex-col gap-2"> */}
        {/* User Profile Summary Card */}
        {/* <div
            className={cn(
              'flex items-center gap-3 p-1.5 rounded-xl transition-colors',
              isExpanded && 'bg-zinc-900/50 border border-zinc-800/60',
            )}
          >
            <Avatar className="size-9 ring-1 ring-zinc-700/80 shrink-0">
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

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col min-w-0 flex-1 overflow-hidden"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div> */}

        {/* Settings & Logout Buttons */}
        {/* <div className={cn('flex items-center gap-1.5', !isExpanded && 'flex-col')}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 cursor-pointer text-xs justify-start',
                    isExpanded ? 'flex-1 h-8 px-2.5 gap-2' : 'size-9 p-0 justify-center',
                  )}
                >
                  <Link href="/dashboard/settings">
                    <Settings className="size-4 shrink-0" />
                    {isExpanded && <span>Settings</span>}
                  </Link>
                </Button>
              </TooltipTrigger>
              {!isExpanded && <TooltipContent side="right">Settings</TooltipContent>}
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={cn(
                    'text-red-400/80 hover:text-red-300 hover:bg-red-950/30 cursor-pointer text-xs justify-start',
                    isExpanded ? 'h-8 px-2.5 gap-2' : 'size-9 p-0 justify-center',
                  )}
                >
                  <LogOut className="size-4 shrink-0" />
                  {isExpanded && <span>Logout</span>}
                </Button>
              </TooltipTrigger>
              {!isExpanded && <TooltipContent side="right">Log Out</TooltipContent>}
            </Tooltip>
          </div> */}
        {/* </div> */}
      </aside>
    </TooltipProvider>
  )
}
