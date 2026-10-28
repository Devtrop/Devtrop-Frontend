'use client'

import React from 'react'
import Link from 'next/link'
import {
  Users,
  Calendar,
  Clock,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Plus,
  MailPlus,
  CalendarCheck,
  Server,
  FileCheck,
} from 'lucide-react'
import { useDashboardSidebar } from '@/contexts/DashboardSidebarContext'
import { getUserRoleDisplay, getRoleBadgeColors } from '@/config/roles.config'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export function DashboardOverview() {
  const { activeRole } = useDashboardSidebar()
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* 1. Welcome Banner — Swiss editorial style */}
      <div className="relative overflow-hidden border-2 border-display bg-canvas p-6 sm:p-8">
        {/* Swiss grid pattern background */}
        <div className="absolute inset-0 swiss-grid-pattern opacity-40 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {/* <div className="relative w-16 h-16">
                <Image
                  src="/devtrop_logo_transparent_bg_resized.png"
                  alt="Devtrop"
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div> */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-display">
                  {user?.name || 'Dashboard'}
                </h1>
                <p className="text-xs font-mono uppercase tracking-[0.15em] text-muted mt-1">
                  {getUserRoleDisplay(user)}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted max-w-2xl leading-relaxed">
              {activeRole === 'SUPER_ADMIN' &&
                'System-wide administration: manage users, permissions, security logs, and global configuration.'}
              {activeRole === 'ADMIN' &&
                'Manage recruitment operations: job postings, applications, interview scheduling, and candidate evaluation.'}
              {activeRole === 'USER' &&
                'Track your applications, upcoming interviews, and submitted documentation.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {activeRole === 'SUPER_ADMIN' && (
              <>
                <Button size="sm" variant="outline" asChild className="gap-2 cursor-pointer">
                  <Link href="/dashboard/user-management">
                    <Users className="size-4" />
                    Users
                  </Link>
                </Button>
                <Button size="sm" asChild className="gap-2 cursor-pointer">
                  <Link href="/dashboard/roles">
                    <ShieldCheck className="size-4" />
                    Roles
                  </Link>
                </Button>
              </>
            )}

            {activeRole === 'ADMIN' && (
              <>
                <Button size="sm" variant="outline" asChild className="gap-2 cursor-pointer">
                  <Link href="/dashboard/interviews">
                    <Calendar className="size-4" />
                    Interviews
                  </Link>
                </Button>
                <Button size="sm" asChild className="gap-2 cursor-pointer">
                  <Link href="/dashboard/admin/jobs/create">
                    <Plus className="size-4" />
                    New Job
                  </Link>
                </Button>
              </>
            )}

            {activeRole === 'USER' && (
              <Button size="sm" asChild className="gap-2 cursor-pointer">
                <Link href="/dashboard/candidate/tasks">
                  <FileCheck className="size-4" />
                  My Tasks
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Stats Grid — Swiss 2×2 bordered layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 border-2 border-display">
        <StatCard
          title="Active Jobs"
          value="12"
          subtitle="5 draft, 7 published"
          icon={<Server className="size-5" />}
          borderRight
          borderBottom
        />
        <StatCard
          title="Applications"
          value="48"
          subtitle="24 new this week"
          icon={<Users className="size-5" />}
          borderBottom
        />
        <StatCard
          title="Interviews"
          value="16"
          subtitle="8 scheduled"
          icon={<Calendar className="size-5" />}
          borderRight
        />
        <StatCard
          title="Onboarding"
          value="6"
          subtitle="3 pending docs"
          icon={<FileCheck className="size-5" />}
        />
      </div>

      {/* 3. Quick Access Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickAccessCard
          title="Job Management"
          description="Create, edit, and manage job postings"
          actions={[
            {
              label: 'All Jobs',
              href: '/dashboard/admin/jobs',
              icon: <Server className="size-4" />,
            },
            {
              label: 'Create New',
              href: '/dashboard/admin/jobs/create',
              icon: <Plus className="size-4" />,
            },
          ]}
        />
        <QuickAccessCard
          title="Interview Pipeline"
          description="Schedule and manage candidate interviews"
          actions={[
            {
              label: 'All Interviews',
              href: '/dashboard/interviews',
              icon: <Calendar className="size-4" />,
            },
            {
              label: 'Send Invites',
              href: '/dashboard/interviews',
              icon: <MailPlus className="size-4" />,
            },
          ]}
        />
      </div>
    </div>
  )
}

// Helper components
function StatCard({
  title,
  value,
  subtitle,
  icon,
  borderRight,
  borderBottom,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  borderRight?: boolean
  borderBottom?: boolean
}) {
  return (
    <div
      className={cn(
        'p-6 flex flex-col gap-3 hover:bg-accent-soft transition-colors',
        borderRight && 'sm:border-r-2 border-display',
        borderBottom && 'border-b-2 sm:border-b-0 border-display'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-muted">{title}</span>
        <div className="text-muted">{icon}</div>
      </div>
      <div>
        <div className="text-4xl font-black tracking-tighter text-display">{value}</div>
        <p className="text-xs text-muted mt-1">{subtitle}</p>
      </div>
    </div>
  )
}

function QuickAccessCard({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions: Array<{ label: string; href: string; icon: React.ReactNode }>
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center gap-2 p-3 border-2 border-hairline-light text-sm font-medium text-body hover:bg-accent-soft hover:border-accent transition-all"
          >
            {action.icon}
            {action.label}
            <ArrowUpRight className="size-4 ml-auto text-muted group-hover:text-accent transition-colors" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
