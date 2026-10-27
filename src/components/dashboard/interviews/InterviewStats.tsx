'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useInterviewContext } from '@/contexts/InterviewContext'
import { InterviewIcons } from './interview-icons'
import { InterviewStatsData } from './types'

interface StatsProps {
  stats?: InterviewStatsData
}

export function InterviewStats(props: StatsProps) {
  const context = useInterviewContext()
  const stats = props.stats ?? context.stats

  const cards = [
    {
      title: 'Total Applications',
      shortTitle: 'Total',
      value: stats.total,
      icon: InterviewIcons.Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
    },
    {
      title: 'Scheduled Sessions',
      shortTitle: 'Scheduled',
      value: stats.scheduled,
      icon: InterviewIcons.CalendarCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      title: 'Pending Self-Booking',
      shortTitle: 'Pending',
      value: stats.pendingBooking,
      icon: InterviewIcons.CalendarClock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'Completed Rounds',
      shortTitle: 'Completed',
      value: stats.completed,
      icon: InterviewIcons.CheckCircle2,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
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
