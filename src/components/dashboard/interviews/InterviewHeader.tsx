'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { useInterviewContext } from '@/contexts/InterviewContext'
import { InterviewIcons } from './interview-icons'

interface InterviewHeaderProps {
  selectedCount?: number
  onOpenSlotsViewer?: () => void
  onOpenCreateSlots?: () => void
  onOpenSendEmail?: () => void
}

export function InterviewHeader(props: InterviewHeaderProps) {
  const context = useInterviewContext()

  const selectedCount = props.selectedCount ?? context.selectedIds.length
  const handleOpenSlotsViewer = props.onOpenSlotsViewer ?? (() => context.openModal('SLOTS_VIEWER'))
  const handleOpenCreateSlots = props.onOpenCreateSlots ?? (() => context.openModal('CREATE_SLOTS'))
  const handleOpenSendEmail = props.onOpenSendEmail ?? (() => context.openModal('SEND_EMAIL'))

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 w-full">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Interview Hub
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl">
          Manage slot availability, candidate invitations, and post-interview outcome dispatch.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => context.fetchData(true)}
          disabled={context.isLoading}
          className="gap-1.5 cursor-pointer border-border hover:bg-muted text-xs h-8 px-3 rounded-xl flex-1 sm:flex-initial"
          title="Refresh Interview Records"
        >
          <RotateCcw
            className={`size-3.5 ${context.isLoading ? 'animate-spin text-emerald-500' : 'text-emerald-400'}`}
          />
          <span>Refresh</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenSlotsViewer}
          className="gap-1.5 cursor-pointer border-border hover:bg-muted text-xs h-8 px-3 rounded-xl flex-1 sm:flex-initial"
        >
          <InterviewIcons.Calendar className="size-3.5 text-emerald-400" />
          <span>Slot Pool</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenCreateSlots}
          className="gap-1.5 cursor-pointer border-border hover:bg-muted text-xs h-8 px-3 rounded-xl flex-1 sm:flex-initial"
        >
          <InterviewIcons.Plus className="size-3.5 text-emerald-400" />
          <span>Generate Slots</span>
        </Button>

        <Button
          size="sm"
          onClick={handleOpenSendEmail}
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md text-xs h-8 px-3.5 rounded-xl w-full sm:w-auto"
        >
          <InterviewIcons.Send className="size-3.5" />
          <span>Send / Resend Email {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
        </Button>
      </div>
    </div>
  )
}
