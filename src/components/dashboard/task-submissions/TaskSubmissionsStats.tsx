'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ClipboardCheck, Send, CheckCircle2, XCircle } from 'lucide-react'

interface TaskSubmissionsStatsData {
  total: number
  sent: number
  submitted: number
  expired: number
}

interface StatsProps {
  stats: TaskSubmissionsStatsData
}

export function TaskSubmissionsStats({ stats }: StatsProps) {
  const cards = [
    {
      title: 'Total Assignments',
      shortTitle: 'Total',
      value: stats.total,
      icon: ClipboardCheck,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
    },
    {
      title: 'Sent',
      shortTitle: 'Sent',
      value: stats.sent,
      icon: Send,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      title: 'Submitted',
      shortTitle: 'Submitted',
      value: stats.submitted,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      title: 'Expired',
      shortTitle: 'Expired',
      value: stats.expired,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4 w-full">
      {cards.map((card) => {
        const IconComponent = card.icon
        return (
          <Card
            key={card.title}
            className={`border ${card.border} bg-card/60 backdrop-blur-xs shadow-xs rounded-xl overflow-hidden`}
          >
            <CardContent className="p-3 sm:p-4 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
                  <span className="hidden sm:inline">{card.title}</span>
                  <span className="sm:hidden">{card.shortTitle}</span>
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5 sm:mt-1">
                  {card.value}
                </h3>
              </div>
              <div className={`p-2 sm:p-2.5 rounded-xl ${card.bg} ${card.color} shrink-0`}>
                <IconComponent className="size-4 sm:size-5" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
