'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardSidebarProvider, useDashboardSidebar } from '@/contexts/DashboardSidebarContext'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardMobileSidebar } from './DashboardMobileSidebar'
import { DashboardHeader } from './DashboardHeader'
import { BrandLoader } from '@/components/ui/BrandLoader'
import { cn } from '@/lib/utils'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isPinned } = useDashboardSidebar()
  const pathname = usePathname()

  // Fullscreen document viewer without sidebar or top header waste space
  const isDocumentViewer = pathname?.includes('/onboarding/') && pathname?.includes('/documents')

  if (isDocumentViewer) {
    return (
      <div className="fixed inset-0 z-50 h-screen w-screen bg-canvas overflow-hidden flex flex-col">
        {children}
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col">
      {/* Desktop Interactive Sidebar */}
      <DashboardSidebar />

      {/* Mobile Drawer Sidebar */}
      <DashboardMobileSidebar />

      {/* Main Content Area: dynamically adjusts left padding based on pinned state */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-[padding-left] duration-300 ease-in-out',
          isPinned ? 'md:pl-[270px]' : 'md:pl-[72px]',
        )}
      >
        {/* Top Header */}
        <DashboardHeader />

        {/* Dynamic Page Viewport */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200">
          {children}
        </main>
      </div>
    </div>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuth()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (hasMounted && !isLoading && !isAuthenticated) {
      const redirectUrl =
        pathname && pathname !== '/dashboard'
          ? `/auth/login?redirect=${encodeURIComponent(pathname)}`
          : '/auth/login'
      router.replace(redirectUrl)
    }
  }, [hasMounted, isLoading, isAuthenticated, router, pathname])

  // Prevent flashing protected dashboard layout or data before authentication is verified
  if (!hasMounted || isLoading || !isAuthenticated) {
    return <BrandLoader fullScreen size="lg" message="Verifying authentication..." />
  }

  return (
    <DashboardSidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardSidebarProvider>
  )
}
