'use client'

import React, { useEffect, useState } from 'react'
import { toast } from '@/lib/toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { interviewsApi } from '@/lib/interviews'
import { InterviewIcons } from './interview-icons'
import { InterviewSlot, Job, SlotGroup } from './types'

interface SlotsViewerModalProps {
  isOpen: boolean
  onClose: () => void
  jobs?: Job[]
}

export function SlotsViewerModal({
  isOpen,
  onClose,
  jobs: initialJobs = [],
}: SlotsViewerModalProps) {
  const [fetchedJobs, setFetchedJobs] = useState<Job[]>([])
  const rawJobs = initialJobs && initialJobs.length > 0 ? initialJobs : fetchedJobs
  const jobs = rawJobs.filter((job) => job.status === 'ACTIVE')
  const [selectedJobId, setSelectedJobId] = useState('')
  const activeJobId = selectedJobId || jobs[0]?.id || ''

  const [slots, setSlots] = useState<InterviewSlot[]>([])
  const [groups, setGroups] = useState<SlotGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL')
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingGroup, setDeletingGroup] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "SLOT" | "GROUP"
    idOrName: string
    title: string
    description: string
  } | null>(null)

  // Fetch jobs if missing
  useEffect(() => {
    if (!isOpen || initialJobs.length > 0) return

    let active = true
    const fetchJobs = async () => {
      setLoadingJobs(true)
      try {
        const res = await interviewsApi.getJobsList()
        if (!active) return
        const apiJobs = (res.data || []) as Job[]
        setFetchedJobs(apiJobs)
      } catch (err) {
        console.error('Failed to load jobs list:', err)
      } finally {
        if (active) setLoadingJobs(false)
      }
    }

    void fetchJobs()
    return () => {
      active = false
    }
  }, [isOpen, initialJobs])

  // Fetch slots and groups whenever activeJobId changes
  const fetchSlotsAndGroups = async () => {
    if (!activeJobId) return
    try {
      setLoadingSlots(true)
      const [slotsRes, groupsRes] = await Promise.all([
        interviewsApi.getSlotsByJob(activeJobId),
        interviewsApi.getSlotGroups(activeJobId),
      ])

      if (slotsRes.success && Array.isArray(slotsRes.data)) {
        setSlots(slotsRes.data)
      } else {
        setSlots([])
      }

      if (groupsRes.success && Array.isArray(groupsRes.data)) {
        setGroups(groupsRes.data)
      } else {
        setGroups([])
      }
    } catch (err) {
      console.error('Failed to load slots and groups:', err)
      setSlots([])
      setGroups([])
    } finally {
      setLoadingSlots(false)
    }
  }

  useEffect(() => {
    if (!isOpen || !activeJobId) return
    void fetchSlotsAndGroups()
    setSelectedGroup('ALL')
  }, [isOpen, activeJobId])

  const handleDeleteSlot = (slot: InterviewSlot) => {
    const start = new Date(slot.startTime)
    const end = new Date(slot.endTime)
    const dateStr = start.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

    setConfirmDelete({
      type: 'SLOT',
      idOrName: slot.id,
      title: 'Delete this unbooked slot?',
      description: `Are you sure you want to remove the slot for ${dateStr} (${timeStr})?`,
    })
  }

  const handleDeleteEntireGroup = (groupNameToDelete: string) => {
    const groupStats = groups.find((g) => g.groupName === groupNameToDelete)
    const count = groupStats?.totalSlots ?? 0
    const booked = groupStats?.bookedSlots ?? 0

    setConfirmDelete({
      type: 'GROUP',
      idOrName: groupNameToDelete,
      title: `Delete all slots in "${groupNameToDelete}"?`,
      description:
        booked > 0
          ? `This will delete all ${count} slot(s) in the group, including ${booked} active booking(s). Those interviews will be cancelled. This cannot be undone.`
          : `This will remove ${count > 0 ? `${count} ` : ''}unbooked slot(s) from this group. Stale bookings (candidates already hired, rejected, or completed) are released and deleted too.`,
    })
  }

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return

    if (confirmDelete.type === 'SLOT') {
      const slotId = confirmDelete.idOrName
      setDeletingId(slotId)
      try {
        const res = await interviewsApi.deleteSlot(slotId)
        if (res.success) {
          toast.success(res.data?.message || 'Slot removed successfully.')
          setSlots((prev) => prev.filter((s) => s.id !== slotId))
          void interviewsApi.getSlotGroups(activeJobId).then((r) => {
            if (r.success && Array.isArray(r.data)) setGroups(r.data)
          })
          setConfirmDelete(null)
        } else {
          toast.error(res.message || 'Failed to delete slot.')
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Failed to delete slot.'
        console.error(err)
        toast.error(errMsg)
      } finally {
        setDeletingId(null)
      }
    } else if (confirmDelete.type === 'GROUP') {
      const groupNameToDelete = confirmDelete.idOrName
      const groupStats = groups.find((g) => g.groupName === groupNameToDelete)
      const force = (groupStats?.bookedSlots ?? 0) > 0
      setDeletingGroup(true)
      try {
        const res = await interviewsApi.deleteSlotGroup(activeJobId, groupNameToDelete, force)
        if (res.success) {
          toast.success(
            res.data?.message ||
              `Removed ${res.data?.deletedCount ?? ''} slots from group "${groupNameToDelete}".`,
          )
          await fetchSlotsAndGroups()
          setSelectedGroup('ALL')
          setConfirmDelete(null)
        } else {
          toast.error(res.message || 'Failed to delete slot group.')
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Failed to delete slot group.'
        console.error(err)
        toast.error(errMsg)
      } finally {
        setDeletingGroup(false)
      }
    }
  }

  const selectedJobTitle =
    jobs.find((j) => j.id === activeJobId)?.title || 'Select Target Job Position'

  const filteredSlots =
    selectedGroup === 'ALL'
      ? slots
      : slots.filter((s) => (s.groupName || 'Default Batch') === selectedGroup)

  const activeGroupStats = groups.find((g) => g.groupName === selectedGroup)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setConfirmDelete(null)
          onClose()
        }
      }}
    >
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85dvh] overflow-hidden flex flex-col gap-0 p-0">
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b border-border/50 pr-10 shrink-0">
          <DialogTitle className="text-base font-bold text-foreground">
            Inspect Configured Slot Pool
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Browse and manage interview slots and batches generated for this job position.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-4 pt-3 pb-4 sm:px-6 sm:pt-4 sm:pb-6 space-y-4">
          {/* 1. Job Selector Dropdown */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold text-foreground">Select Job Position</Label>
          {loadingJobs ? (
            <div className="py-2 text-xs text-muted-foreground flex items-center gap-2">
              <InterviewIcons.Loader className="size-3.5 animate-spin text-primary" /> Loading
              positions...
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 px-3 rounded-xl border border-border bg-card/80 text-xs font-medium justify-between gap-2 cursor-pointer hover:bg-muted/40"
                >
                  <span className="truncate text-foreground font-semibold">{selectedJobTitle}</span>
                  <InterviewIcons.ChevronDown className="size-3.5 text-muted-foreground shrink-0 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-80 rounded-xl text-xs max-h-60 overflow-y-auto"
              >
                {jobs.map((job) => (
                  <DropdownMenuItem
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className="cursor-pointer gap-2 rounded-lg"
                  >
                    <span className="truncate">{job.title}</span>
                    {activeJobId === job.id && (
                      <InterviewIcons.Check className="size-3 ml-auto text-primary shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* 2. Slot Group Filter Tabs & Bulk Delete Action */}
        {groups.length > 0 && (
          <div className="flex flex-col gap-2 p-2.5 rounded-xl border border-border/80 bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Slot Batches / Groups ({groups.length})
              </span>
              {selectedGroup !== 'ALL' && (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={
                    deletingGroup || !activeGroupStats || activeGroupStats.totalSlots === 0
                  }
                  onClick={() => handleDeleteEntireGroup(selectedGroup)}
                  className="h-6 px-2 text-[10px] gap-1 cursor-pointer"
                >
                  <InterviewIcons.Trash className="size-3" />
                  <span>Delete Group ({activeGroupStats?.totalSlots || 0} slot(s))</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedGroup('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  selectedGroup === 'ALL'
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-border/60 bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                All Groups ({slots.length})
              </button>
              {groups.map((grp) => (
                <button
                  key={grp.groupName}
                  type="button"
                  onClick={() => setSelectedGroup(grp.groupName)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedGroup === grp.groupName
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : 'border-border/60 bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span>{grp.groupName}</span>
                  <span className="text-[10px] opacity-70">({grp.totalSlots})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Slot List */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {selectedGroup === 'ALL' ? 'All Slots' : `Slots in "${selectedGroup}"`}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {filteredSlots.length} Total Slot{filteredSlots.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loadingSlots ? (
            <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <InterviewIcons.Loader className="size-4 animate-spin text-primary" /> Fetching slot
              calendar...
            </div>
          ) : filteredSlots.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border/80 p-6">
              No interview slots found for this selection.
            </div>
          ) : (
            <div className="divide-y divide-border/60 rounded-xl border border-border/80 overflow-hidden max-h-[45vh] overflow-y-auto">
              {filteredSlots.map((slot) => {
                const start = new Date(slot.startTime)
                const end = new Date(slot.endTime)
                const dateStr = start.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })
                const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

                return (
                  <div
                    key={slot.id}
                    className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/20 text-xs transition-colors"
                  >
                    <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{dateStr}</span>
                          {slot.groupName && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50">
                              {slot.groupName}
                            </span>
                          )}
                        </div>
                        <span className="text-muted-foreground font-mono text-[11px]">
                          {timeStr}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          slot.isBooked
                            ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                            : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        }`}
                      >
                        {slot.isBooked ? 'Claimed' : 'Open'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1.5 sm:pt-0 border-t sm:border-0 border-border/30">
                      {slot.meetingUrl && (
                        <a
                          href={slot.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline text-[11px] font-mono flex items-center gap-1"
                        >
                          <InterviewIcons.Link className="size-3" /> Meet Link
                        </a>
                      )}
                      {!slot.isBooked && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          disabled={deletingId === slot.id}
                          onClick={() => handleDeleteSlot(slot)}
                          className="text-muted-foreground hover:text-destructive cursor-pointer"
                          title="Delete unbooked slot"
                        >
                          <InterviewIcons.Trash className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Floating Dialog */}
      {confirmDelete && (
        <div
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in-50 duration-150"
          onClick={() => {
            if (!deletingGroup && !deletingId) setConfirmDelete(null)
          }}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={deletingGroup || !!deletingId}
              onClick={() => setConfirmDelete(null)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
              title="Close confirmation"
            >
              <InterviewIcons.X className="size-4" />
            </Button>

            <div className="size-11 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-3 shadow-xs shrink-0">
              <InterviewIcons.Trash className="size-5" />
            </div>

            <h3 className="text-sm sm:text-base font-bold text-foreground px-2">
              {confirmDelete.title}
            </h3>

            <p className="text-xs text-muted-foreground mt-2 leading-relaxed px-2">
              {confirmDelete.description}
            </p>

            <div className="flex items-center gap-2.5 mt-5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={deletingGroup || !!deletingId}
                onClick={() => setConfirmDelete(null)}
                className="text-xs px-4 h-9 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={deletingGroup || !!deletingId}
                onClick={handleConfirmDelete}
                className="text-xs px-4 h-9 rounded-xl gap-1.5 cursor-pointer bg-rose-600 hover:bg-rose-500 text-white shadow-xs font-semibold"
              >
                {deletingGroup || !!deletingId ? (
                  <>
                    <InterviewIcons.Loader className="size-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <InterviewIcons.Trash className="size-3.5" />
                    <span>{confirmDelete.type === "GROUP" ? "Delete Group" : "Delete Slot"}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
  )
}
