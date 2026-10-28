'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { navigationConfig } from '@/config/navigation.config'

export function DashboardBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  // Map segments to readable titles
  const getBreadcrumbTitle = (path: string, segment: string) => {
    // Check navigation config
    for (const group of navigationConfig) {
      for (const item of group.items) {
        if (item.href === path) return item.title
        if (item.children) {
          for (const child of item.children) {
            if (child.href === path) return child.title
          }
        }
      }
    }
    // Format slug into title case
    return segment
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  const crumbs = segments.map((seg, idx) => {
    const href = `/${segments.slice(0, idx + 1).join('/')}`
    return {
      title: getBreadcrumbTitle(href, seg),
      href,
      isLast: idx === segments.length - 1,
    }
  })

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground"
    >
      <Link
        href="/"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50"
      >
        <Home className="size-3.5" />
      </Link>

      {crumbs.map((crumb) => (
        <React.Fragment key={crumb.href}>
          <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />
          {crumb.isLast ? (
            <span className="font-semibold text-foreground truncate max-w-45">{crumb.title}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-35"
            >
              {crumb.title}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
