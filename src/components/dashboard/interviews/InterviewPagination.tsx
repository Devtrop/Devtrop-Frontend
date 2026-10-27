'use client'

import React from 'react'
import { useInterviewContext } from '@/contexts/InterviewContext'
import { InterviewIcons } from './interview-icons'

export function InterviewPagination() {
  const { displayedCount, hasMore, loadMore, filteredInterviews } = useInterviewContext()
  const total = filteredInterviews.length

  if (total === 0) return null

  const currentCount = Math.min(displayedCount, total)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3 py-3 px-3 text-xs text-muted-foreground border-t border-border/60">
      {/* 1. Item count summary */}
      <div className="text-center sm:text-left">
        <span>
          Showing <span className="font-semibold text-foreground">{currentCount}</span> of{' '}
          <span className="font-semibold text-foreground">{total}</span> candidates
        </span>
      </div>

      {/* 2. Centered Load more pill button */}
      <div className="flex items-center justify-center">
        {hasMore ? (
          <button
            type="button"
            onClick={loadMore}
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-border transition-colors cursor-pointer shadow-2xs"
          >
            <span>Load more</span>
            <InterviewIcons.CircleArrowDown className="size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        ) : (
          <span className="text-xs text-muted-foreground/70 font-medium">
            All candidates loaded
          </span>
        )}
      </div>

      {/* 3. Spacer for symmetry */}
      <div className="hidden sm:block" />
    </div>
  )
}
