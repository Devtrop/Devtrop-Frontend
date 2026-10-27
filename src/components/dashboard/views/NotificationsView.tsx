'use client'

import React from 'react'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { NotificationsSkeleton } from '@/components/dashboard/notifications/NotificationsSkeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, Calendar, ShieldCheck, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotificationsView() {
  const notifications = [
    {
      id: 1,
      title: 'Interview Slot Booked',
      desc: 'Candidate Rahim Ahmed booked a slot on Friday, 3:00 PM for Senior React Engineer.',
      time: '10 minutes ago',
      icon: Calendar,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      id: 2,
      title: 'RBAC Policy Synchronized',
      desc: 'Super Admin updated security role permissions for candidate evaluation access.',
      time: '1 hour ago',
      icon: ShieldCheck,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
    {
      id: 3,
      title: 'Bulk Invitations Sent',
      desc: '12 candidate invitations were dispatched for Software Engineer opening.',
      time: '4 hours ago',
      icon: Mail,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
  ]

  return (
    <RoleGuard fallback={<NotificationsSkeleton />} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'USER']}>
      <div className="flex flex-col gap-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Bell className="size-6 text-emerald-400" />
              Notifications & Activity Feed
            </h1>
            <p className="text-xs text-muted-foreground">
              Real-time alerts, slot bookings, and system security events.
            </p>
          </div>

          <Button variant="outline" size="sm" className="cursor-pointer">
            Mark All as Read
          </Button>
        </div>

        <Card className="border-border/80 bg-card/60">
          <CardContent className="p-0 divide-y divide-border/60">
            {notifications.map((n) => {
              const Icon = n.icon
              return (
                <div
                  key={n.id}
                  className="p-4 flex items-start gap-3.5 hover:bg-muted/20 transition-colors"
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${n.color}`}
                  >
                    <Icon className="size-4.5" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">{n.title}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{n.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.desc}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
