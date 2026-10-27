'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Users, UserCheck, UserPlus, UserX } from 'lucide-react'

interface ApplicationsStatsData {
  total: number
  applied: number
  selected: number
  hired: number
  rejected: number
}

interface StatsProps {
  stats: ApplicationsStatsData
}

export function ApplicationsStats({ stats }: StatsProps) {
  const cards = [
    {
      title: 'Total Applications',
      shortTitle: 'Total',
      value: stats.total,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
    },
    {
      title: 'Selected',
      shortTitle: 'Selected',
      value: stats.selected,
      icon: UserCheck,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
    },
    {
      title: 'Hired',
      shortTitle: 'Hired',
      value: stats.hired,
      icon: UserPlus,
      color: 'text-accent',
      bg: 'bg-accent-soft',
      border: 'border-accent',
    },
    {
      title: 'Rejected',
      shortTitle: 'Rejected',
      value: stats.rejected,
      icon: UserX,
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
            className={`border ${card.border} bg-card/60 backdrop-blur-xs rounded-none overflow-hidden`}
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
              <div className={`p-2 sm:p-2.5 rounded-none ${card.bg} ${card.color} shrink-0`}>
                <IconComponent className="size-4 sm:size-5" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
