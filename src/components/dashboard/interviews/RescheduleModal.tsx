'use client'

import React, { useEffect, useState } from 'react'
import { toast } from '@/lib/toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { interviewsApi } from '@/lib/interviews'
import { InterviewIcons } from './interview-icons'
import { Interview, InterviewSlot } from './types'

interface RescheduleModalProps {
  isOpen: boolean
  interview: Interview | null
  onClose: () => void
  onSuccess: () => void
}

export function RescheduleModal({ isOpen, interview, onClose, onSuccess }: RescheduleModalProps) {
  const [availableSlots, setAvailableSlots] = useState<InterviewSlot[]>([])
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const jobId = interview?.application?.job?.id

  useEffect(() => {
    if (!isOpen || !jobId) return

    const fetchJobSlots = async () => {
      setLoadingSlots(true)
      try {
        const res = await interviewsApi.getSlotsByJob(jobId)
        if (res.success && Array.isArray(res.data)) {
          const unbooked = res.data.filter(
            (s: InterviewSlot) => !s.isBooked && new Date(s.startTime) >= new Date(),
          )
          setAvailableSlots(unbooked)
          if (unbooked.length > 0) {
            setSelectedSlotId(unbooked[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to load job slots:', err)
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchJobSlots()
  }, [isOpen, jobId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!interview || !selectedSlotId) {
      toast.error('Please select an available slot.')
      return
    }

    setSubmitting(true)
    try {
      const res = await interviewsApi.rescheduleInterview(interview.id, selectedSlotId)

      if (res.success) {
        toast.success(
          `Rescheduled interview for ${interview.application?.applicant?.name || 'candidate'}`,
        )
        onSuccess()
        onClose()
      } else {
        const errorMsg = res.message || 'Failed to reschedule interview'
        toast.error(errorMsg)
      }
    } catch (err) {
      console.error(err)
      toast.error('An error occurred while rescheduling')
    } finally {
      setSubmitting(false)
    }
  }

  const applicantName = interview?.application?.applicant?.name || 'Applicant'
  const jobTitle = interview?.application?.job?.title || 'Position'
  const currentSlotTime = interview?.slot
    ? `${new Date(interview.slot.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at ${new Date(interview.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Pending Booking'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pr-8">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-base font-bold text-foreground">
              Reschedule Interview
            </DialogTitle>
            <Badge variant="outline" className="text-[10px] shrink-0">
              {jobTitle}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Select a new open slot for <strong>{applicantName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* Current schedule info */}
          <div className="flex items-center justify-between p-3 rounded-none border border-border/80 bg-muted/20 text-xs">
            <span className="text-muted-foreground font-medium">Current Assigned Slot</span>
            <span className="font-semibold text-foreground font-mono">{currentSlotTime}</span>
          </div>

          {/* Slot picker grid */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Available Time Slots</span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {availableSlots.length} Open Slot{availableSlots.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loadingSlots ? (
              <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <InterviewIcons.Loader className="size-4 animate-spin text-primary" /> Loading open
                slots...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="p-6 rounded-none border border-dashed border-border/80 text-xs text-muted-foreground text-center">
                No open slots found for this role. Generate new slots first.
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto grid grid-cols-2 gap-2.5 p-1">
                {availableSlots.map((s) => {
                  const isSelected = selectedSlotId === s.id
                  const d = new Date(s.startTime)
                  const dateStr = d.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })
                  const timeStr = `${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSlotId(s.id)}
                      className={`p-3 rounded-none border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/40'
                          : 'border-border/80 bg-card hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <div className="text-xs font-semibold">{dateStr}</div>
                      <div className="text-xs font-mono text-muted-foreground mt-1">{timeStr}</div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || availableSlots.length === 0}
              size="sm"
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs h-9 px-4 cursor-pointer"
            >
              {submitting ? (
                <>
                  <InterviewIcons.Loader className="size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Confirm Reschedule'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
