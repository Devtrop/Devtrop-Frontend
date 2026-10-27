'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, Search, Bell, User, Settings, LogOut, ExternalLink } from 'lucide-react'
import { useDashboardSidebar } from '@/contexts/DashboardSidebarContext'
import { useAuth } from '@/contexts/AuthContext'
import { getUserRoleDisplay, getRoleBadgeColors } from '@/config/roles.config'
import { DashboardBreadcrumbs } from './DashboardBreadcrumbs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export function DashboardHeader() {
  const router = useRouter()
  const { toggleMobile } = useDashboardSidebar()
  const { user, logout } = useAuth()
  const [searchValue, setSearchValue] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      router.push('/auth/login')
    } catch (err) {
      console.error('Logout error:', err)
      router.push('/auth/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const dynamicRoleName = getUserRoleDisplay(user)
  const roleBadgeColors = getRoleBadgeColors(user)

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

  // Notifications for dashboard interactivity
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Interview Slot Booked',
      desc: 'Rahim Ahmed booked Senior React Engineer on Friday 3:00 PM',
      time: '10m ago',
      read: false,
    },
    {
      id: 2,
      title: 'Role Permissions Synchronized',
      desc: 'Your active permissions have been dynamically verified from backend',
      time: '1h ago',
      read: false,
    },
    {
      id: 3,
      title: 'Candidate Feedback Submitted',
      desc: 'Technical evaluation submitted for Candidate #1042',
      time: '3h ago',
      read: true,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-hairline-light bg-canvas/95 px-4 sm:px-6 backdrop-blur-xl transition-all">
      {/* Left: Mobile hamburger menu & Breadcrumbs */}
      <div className="flex items-center gap-3 md:gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleMobile}
          className="md:hidden text-muted hover:text-body cursor-pointer"
          aria-label="Open mobile menu"
        >
          <Menu className="size-5" />
        </Button>

        <DashboardBreadcrumbs />
      </div>

      {/* Right: Search, Notifications, & User Profile Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Global Quick Search Bar */}
        <div className="relative hidden lg:flex items-center w-56 xl:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted pointer-events-none" />
          <Input
            placeholder="Quick search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-8 pl-8 pr-12 text-xs bg-subtle border-hairline-light rounded-none focus-visible:bg-canvas focus-visible:ring-accent"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-4.5 select-none items-center gap-0.5 rounded-none border border-hairline-light bg-subtle px-1.5 font-mono text-[9px] font-medium text-muted">
            ⌘K
          </kbd>
        </div>

        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative rounded-none text-muted hover:text-body hover:bg-subtle cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full size-2 bg-accent" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 shadow-[4px_4px_0_0_#000] border-hairline rounded-none">
            <div className="flex items-center justify-between p-3 border-b border-hairline-light">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-body">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-accent-soft text-accent border border-accent">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-accent hover:text-accent-hover font-medium cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-hairline-light">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'p-3 flex flex-col gap-1 text-xs transition-colors hover:bg-subtle',
                    !n.read && 'bg-accent-soft',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-body">{n.title}</span>
                    <span className="text-[10px] text-muted">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">{n.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-hairline-light text-center">
              <Link
                href="/dashboard/notifications"
                className="text-[11px] font-medium text-accent hover:text-accent-hover"
              >
                View all notifications →
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Profile Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative flex items-center gap-2.5 rounded-none border border-transparent hover:border-hairline-light p-1 text-xs hover:bg-subtle cursor-pointer"
            >
              <Avatar className="size-8 ring-1 ring-hairline">
                <AvatarImage src={user?.avatar || user?.image || ''} />
                <AvatarFallback
                  suppressHydrationWarning
                  className="bg-obsidian font-bold text-inverse text-xs rounded-none"
                >
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start leading-none pr-1">
                <span
                  suppressHydrationWarning
                  className="font-semibold text-xs text-body truncate max-w-30"
                >
                  {user?.name}
                </span>
                <span
                  suppressHydrationWarning
                  className="text-[10px] text-muted capitalize mt-0.5"
                >
                  {dynamicRoleName}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-[4px_4px_0_0_#000] border-hairline rounded-none">
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p
                  suppressHydrationWarning
                  className="text-xs font-semibold text-body leading-none"
                >
                  {user?.name}
                </p>
                <p
                  suppressHydrationWarning
                  className="text-[11px] text-muted leading-none truncate"
                >
                  {user?.email}
                </p>
                <div className="pt-1.5">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold border',
                      roleBadgeColors.bg,
                      roleBadgeColors.text,
                      roleBadgeColors.border,
                    )}
                  >
                    <span className={cn('size-1.5 rounded-full', roleBadgeColors.dot)} />
                    {dynamicRoleName}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-hairline-light" />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer rounded-none">
                  <Settings className="size-3.5 text-muted" />
                  <span>Preferences</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center gap-2 cursor-pointer rounded-none">
                  <ExternalLink className="size-3.5 text-muted" />
                  <span>Public Website</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-hairline-light" />

            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-accent focus:text-accent-hover focus:bg-accent-soft cursor-pointer font-medium rounded-none"
            >
              <LogOut className="size-3.5" />
              <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
