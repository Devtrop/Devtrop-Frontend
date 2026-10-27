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
      {/* 1. Welcome & Role Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-linear-to-r from-zinc-900/90 via-zinc-950/90 to-zinc-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        {/* Glow accents */}
        <div className="absolute -right-16 -top-16 size-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 size-56 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <div
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
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back, {user?.name || 'Authorized Member'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {activeRole === 'SUPER_ADMIN' &&
                'High-privilege overview of security logs, user provisioning, system integrations, and global statistics.'}
              {activeRole === 'ADMIN' &&
                'Manage interview slot pools, dispatch candidate invitations, monitor bookings, and grade evaluations.'}
              {activeRole === 'USER' &&
                'Track your pending interview appointments, explore available time slots, and submit documentation.'}
            </p>
          </div>

          {/* Quick Actions according to role */}
          <div className="flex flex-wrap items-center gap-2.5">
            {activeRole === 'SUPER_ADMIN' && (
              <>
                <Button size="sm" variant="outline" asChild className="gap-2 cursor-pointer">
                  <Link href="/dashboard/audit-logs">
                    <ShieldCheck className="size-4 text-purple-400" />
                    Security Logs
                  </Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                >
                  <Link href="/dashboard/user-management">
                    <ShieldCheck className="size-4" />
                    Manage Users
                  </Link>
                </Button>
              </>
            )}

            {activeRole === 'ADMIN' && (
              <>
                <Button size="sm" variant="outline" asChild className="gap-2 cursor-pointer">
                  <Link href="/dashboard/interviews">
                    <MailPlus className="size-4 text-amber-400" />
                    Invite Candidates
                  </Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                >
                  <Link href="/dashboard/interviews">
                    <Plus className="size-4" />
                    Generate Slots
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {activeRole === 'SUPER_ADMIN' && (
          <>
            <StatCard
              title="Active System Users"
              value="1,420"
              subValue="+14% this month"
              icon={Users}
              trend="up"
              color="purple"
            />
            <StatCard
              title="Total Interviews Tracked"
              value="3,892"
              subValue="98.4% uptime"
              icon={Calendar}
              trend="up"
              color="emerald"
            />
            <StatCard
              title="Security Events Logged"
              value="24"
              subValue="0 unresolved alerts"
              icon={ShieldCheck}
              trend="neutral"
              color="blue"
            />
            <StatCard
              title="System Latency"
              value="42 ms"
              subValue="Optimal operational status"
              icon={Server}
              trend="up"
              color="emerald"
            />
          </>
        )}

        {activeRole === 'ADMIN' && (
          <>
            <StatCard
              title="Total Slots Created"
              value="148"
              subValue="Across 6 open positions"
              icon={Calendar}
              trend="up"
              color="emerald"
            />
            <StatCard
              title="Awaiting Booking"
              value="32"
              subValue="Invites sent to candidates"
              icon={Clock}
              trend="neutral"
              color="amber"
            />
            <StatCard
              title="Upcoming Scheduled"
              value="45"
              subValue="Next 7 days timeline"
              icon={CalendarCheck}
              trend="up"
              color="blue"
            />
            <StatCard
              title="Evaluations Completed"
              value="71"
              subValue="Average score 84/100"
              icon={FileCheck}
              trend="up"
              color="emerald"
            />
          </>
        )}

        {activeRole === 'USER' && (
          <>
            <StatCard
              title="Active Bookings"
              value="1"
              subValue="Upcoming interview slot"
              icon={CalendarCheck}
              trend="up"
              color="emerald"
            />
            <StatCard
              title="Open Slots Available"
              value="18"
              subValue="Ready for selection"
              icon={Calendar}
              trend="neutral"
              color="blue"
            />
            <StatCard
              title="Application Status"
              value="In Review"
              subValue="Phase 2 - Technical Interview"
              icon={FileCheck}
              trend="up"
              color="emerald"
            />
            <StatCard
              title="Profile Completion"
              value="100%"
              subValue="All documents verified"
              icon={ShieldCheck}
              trend="up"
              color="purple"
            />
          </>
        )}
      </div>

      {/* 3. Role-Specific Interactive Dashboards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Main Activity or Pipeline */}
        <Card className="lg:col-span-2 border-border/80 bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                {activeRole === 'SUPER_ADMIN' && 'System Audit Activity & Provisioning'}
                {activeRole === 'ADMIN' && 'Interview Pipeline & Booking Stream'}
                {activeRole === 'USER' && 'My Interview Schedule & Status'}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Real-time synchronized events for your organization
              </CardDescription>
            </div>

            <Button
              variant="ghost"
              size="xs"
              asChild
              className="gap-1 text-emerald-400 hover:text-emerald-300"
            >
              <Link href="/dashboard/interviews">
                <span>View all</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="flex flex-col divide-y divide-border/60">
              {activeRole === 'SUPER_ADMIN' && (
                <>
                  <ActivityRow
                    title="User Role Elevation"
                    subtitle="admin@risetogetherbd.com was granted Super Admin access"
                    time="12 mins ago"
                    badge="Security"
                    badgeColor="bg-purple-500/10 text-purple-400 border-purple-500/30"
                  />
                  <ActivityRow
                    title="Webhook Synchronized"
                    subtitle="Railway Backend API endpoint verified"
                    time="1 hour ago"
                    badge="Integrations"
                    badgeColor="bg-blue-500/10 text-blue-400 border-blue-500/30"
                  />
                  <ActivityRow
                    title="SSL Certificate Auto-Renewed"
                    subtitle="All edge endpoints secured for 90 days"
                    time="3 hours ago"
                    badge="Infrastructure"
                    badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  />
                </>
              )}

              {activeRole === 'ADMIN' && (
                <>
                  <ActivityRow
                    title="Candidate Self-Booked Slot"
                    subtitle="Farhan Kabir booked Software Engineer slot for 2:30 PM"
                    time="5 mins ago"
                    badge="Booking"
                    badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  />
                  <ActivityRow
                    title="Bulk Invite Pool Dispatched"
                    subtitle="12 candidate invitations sent for Full Stack Developer"
                    time="45 mins ago"
                    badge="Invitation"
                    badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/30"
                  />
                  <ActivityRow
                    title="Evaluation Completed"
                    subtitle="Senior React Developer interview scored 92/100"
                    time="2 hours ago"
                    badge="Graded"
                    badgeColor="bg-sky-500/10 text-sky-400 border-sky-500/30"
                  />
                </>
              )}

              {activeRole === 'USER' && (
                <>
                  <ActivityRow
                    title="Interview Confirmed"
                    subtitle="Senior Frontend Engineer • Google Meet link generated"
                    time="Scheduled: Friday, 3:00 PM"
                    badge="Confirmed"
                    badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  />
                  <ActivityRow
                    title="Resume & Portfolio Verified"
                    subtitle="Technical screening passed successfully"
                    time="2 days ago"
                    badge="Verified"
                    badgeColor="bg-sky-500/10 text-sky-400 border-sky-500/30"
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Column: Quick Summary & Role Shortcuts */}
        <Card className="border-border/80 bg-card/60 backdrop-blur-md flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">
              Quick Shortcuts & Tools
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Context-aware actions for your current role
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {activeRole === 'SUPER_ADMIN' && (
              <>
                <ShortcutCard
                  title="User Management"
                  description="Manage accounts, status, and role assignments"
                  href="/dashboard/user-management"
                />
                <ShortcutCard
                  title="Roles & Permissions"
                  description="Configure dynamic roles and assign privileges"
                  href="/dashboard/roles"
                />
                <ShortcutCard
                  title="Job Postings"
                  description="Manage job listings, applicants, and statuses"
                  href="/dashboard/admin/jobs"
                />
              </>
            )}

            {activeRole === 'ADMIN' && (
              <>
                <ShortcutCard
                  title="Interview Hub"
                  description="Generate slot pools and evaluate candidates"
                  href="/dashboard/interviews"
                />
                <ShortcutCard
                  title="Onboarding & Documents"
                  description="Track offers, verification, and orientation"
                  href="/dashboard/onboarding"
                />
                <ShortcutCard
                  title="All Jobs"
                  description="View and track active job listings"
                  href="/dashboard/admin/jobs"
                />
              </>
            )}

            {activeRole === 'USER' && (
              <>
                <ShortcutCard
                  title="Candidate Profile"
                  description="Update your phone, resume link, and details"
                  href="/dashboard/settings"
                />
                <ShortcutCard
                  title="Help & Support"
                  description="Reach out to the recruitment coordinator"
                  href="/dashboard/support"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  color,
}: {
  title: string
  value: string
  subValue: string
  icon: React.ComponentType<{ className?: string }>
  trend: 'up' | 'down' | 'neutral'
  color: 'emerald' | 'purple' | 'blue' | 'amber'
}) {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  }

  return (
    <Card className="border-border/80 bg-card/60 backdrop-blur-md transition-all hover:bg-card/90">
      <CardContent className="p-5 flex flex-col justify-between h-full gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground truncate">{title}</span>
          <div
            className={cn(
              'flex size-8 items-center justify-center rounded-lg border',
              colorMap[color],
            )}
          >
            <Icon className="size-4" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-2xl font-extrabold text-foreground tracking-tight">{value}</div>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="size-3 text-emerald-400 inline" />}
            {subValue}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityRow({
  title,
  subtitle,
  time,
  badge,
  badgeColor,
}: {
  title: string
  subtitle: string
  time: string
  badge: string
  badgeColor: string
}) {
  return (
    <div className="flex items-center justify-between py-3 gap-3">
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-foreground truncate">{title}</span>
          <span className={cn('px-1.5 py-0.2 rounded text-[9px] font-bold border', badgeColor)}>
            {badge}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground truncate mt-0.5">{subtitle}</span>
      </div>

      <span className="text-[10px] text-muted-foreground shrink-0 font-mono">{time}</span>
    </div>
  )
}

function ShortcutCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/50 transition-all group cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground group-hover:text-emerald-400 transition-colors">
          {title}
        </span>
        <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
      </div>
      <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
    </Link>
  )
}
