'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, CheckCircle2, FileText, XCircle } from 'lucide-react'

interface JobsStatsData {
  total: number
  active: number
  draft: number
  closed: number
}

interface StatsProps {
  stats: JobsStatsData
}

export function JobsStats({ stats }: StatsProps) {
  const cards = [
    {
      title: 'Total Jobs',
      shortTitle: 'Total',
      value: stats.total,
      icon: Briefcase,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
    },
    {
      title: 'Active Postings',
      shortTitle: 'Active',
      value: stats.active,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      title: 'Draft Jobs',
      shortTitle: 'Draft',
      value: stats.draft,
      icon: FileText,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'Closed Jobs',
      shortTitle: 'Closed',
      value: stats.closed,
      icon: XCircle,
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/20',
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
