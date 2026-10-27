"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useInterviewContext } from "@/contexts/InterviewContext"
import { interviewsApi } from "@/lib/interviews"
import { InterviewIcons } from "./interview-icons"
import { SlotGroup } from "./types"

interface BulkBarProps {
  selectedCount?: number
  invitationCount?: number
  outcomeCount?: number
  onSendInvitations?: () => void
  onSendOutcomes?: () => void
  isDispatching?: boolean
  onClear?: () => void
}

export function BulkActionBar(props: BulkBarProps) {
  const context = useInterviewContext()

  const selectedCount = props.selectedCount ?? context.selectedIds.length
  const invitationCount = props.invitationCount ?? context.invitations.length
  const outcomeCount = props.outcomeCount ?? context.outcomes.length
  const isDispatching = props.isDispatching ?? context.isDispatching
  const onSendInvitations = props.onSendInvitations ?? context.directSendInvitations
  const onSendOutcomes = props.onSendOutcomes ?? context.directSendOutcomes
  const onClear = props.onClear ?? context.clearSelection

  // Identify selected candidates jobs to inspect default slot batch
  const targetJobIds = Array.from(
    new Set(
      (context.invitations || [])
        .map((i) => i.application?.job?.id)
        .filter(Boolean) as string[],
    ),
  )
  const isSingleJob = targetJobIds.length === 1
  const primaryJobId = targetJobIds[0]
  const primaryJobTitle = context.invitations.find(
    (i) => i.application?.job?.id === primaryJobId,
  )?.application?.job?.title

  const [latestGroup, setLatestGroup] = useState<SlotGroup | null>(null)
  const [loadingGroup, setLoadingGroup] = useState(false)

  useEffect(() => {
    if (!primaryJobId || !isSingleJob) {
      setLatestGroup(null)
      return
    }

    let isMounted = true
    setLoadingGroup(true)
    interviewsApi
      .getSlotGroups(primaryJobId)
      .then((res) => {
        if (!isMounted) return
        if (res.success && res.data && res.data.length > 0) {
          setLatestGroup(res.data[0])
        } else {
          setLatestGroup(null)
        }
      })
      .catch(() => {
        if (isMounted) setLatestGroup(null)
      })
      .finally(() => {
        if (isMounted) setLoadingGroup(false)
      })

    return () => {
      isMounted = false
    }
  }, [primaryJobId, isSingleJob])

  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 bg-zinc-950/95 text-zinc-100 border border-zinc-800 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-2xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 max-w-[95vw] overflow-x-auto scrollbar-hide">
      {/* Selected Indicator */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-semibold whitespace-nowrap">{selectedCount} Selected</span>
      </div>

      <div className="h-4 w-px bg-zinc-800 shrink-0" />

      {/* 2 Direct-Action Buttons (Directly dispatches emails without opening modal) */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* 1. Direct Send Invitations with Hover Preview */}
        {invitationCount > 0 && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={onSendInvitations}
                  disabled={isDispatching}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-7 sm:h-8 px-2.5 sm:px-3 cursor-pointer shadow-xs rounded-xl"
                >
                  {isDispatching ? (
                    <InterviewIcons.Loader className="size-3 animate-spin" />
                  ) : (
                    <InterviewIcons.MailPlus className="size-3" />
                  )}
                  <span>Invite ({invitationCount})</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={10}
                className="z-50 p-2.5 max-w-xs bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl rounded-xl text-xs space-y-1.5"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] uppercase tracking-wider">
                  <InterviewIcons.MailPlus className="size-3.5" />
                  <span>Target Slot Batch</span>
                </div>

                {isSingleJob ? (
                  latestGroup ? (
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-zinc-400 text-[11px]">Position:</span>
                        <span className="text-zinc-200 font-medium truncate max-w-[170px]">
                          {primaryJobTitle}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-zinc-400 text-[11px]">Batch:</span>
                        <span className="text-emerald-400 font-semibold truncate max-w-[170px]">
                          {latestGroup.groupName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 pt-1 border-t border-zinc-800/80">
                        <span className="text-zinc-400 text-[11px]">Open Slots:</span>
                        <span className="font-mono text-emerald-400 font-medium text-[11px]">
                          {latestGroup.availableSlots} available
                        </span>
                      </div>
                      {latestGroup.startDate && latestGroup.endDate && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-zinc-400 text-[11px]">Dates:</span>
                          <span className="font-mono text-zinc-300 text-[11px]">
                            {new Date(latestGroup.startDate).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}{" "}–{" "}
                            {new Date(latestGroup.endDate).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {loadingGroup
                        ? "Checking latest batch..."
                        : "No slot batches found. System will dispatch general booking availability."}
                    </p>
                  )
                ) : (
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Multiple roles selected. The latest slot batch for each candidate&apos;s role
                    will be dispatched.
                  </p>
                )}

                <div className="text-[10px] text-zinc-400 pt-0.5 border-t border-zinc-800/60">
                  Sends invitation email with self-booking links for this batch.
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* 2. Direct Send Outcomes */}
        {outcomeCount > 0 && (
          <Button
            size="sm"
            onClick={onSendOutcomes}
            disabled={isDispatching}
            className="gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs h-7 sm:h-8 px-2.5 sm:px-3 cursor-pointer shadow-xs rounded-xl"
          >
            {isDispatching ? (
              <InterviewIcons.Loader className="size-3 animate-spin" />
            ) : (
              <InterviewIcons.Send className="size-3" />
            )}
            <span>Outcomes ({outcomeCount})</span>
          </Button>
        )}
      </div>

      {/* Clear Selection */}
      <button
        type="button"
        onClick={onClear}
        disabled={isDispatching}
        className="text-zinc-400 hover:text-zinc-100 p-1 rounded-lg hover:bg-zinc-800/60 cursor-pointer transition-colors shrink-0"
        aria-label="Clear selection"
        title="Clear selection"
      >
        <InterviewIcons.X className="size-3.5" />
      </button>
    </div>
  )
}
