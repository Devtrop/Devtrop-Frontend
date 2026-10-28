'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { toast } from '@/lib/toast'
import {
  UserX,
  Loader2,
  Users,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { EmailTemplateSelect } from '@/components/dashboard/email-templates/EmailTemplateSelect'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { sendOnboardingRejection } from '@/lib/onboarding'
import type { OnboardingCandidate } from '@/lib/onboarding'
import { ONBOARDING_STAGE_CONFIGS, getInitials } from './constants'
import { cn } from '@/lib/utils'

interface SendRejectionModalProps {
  open: boolean
  onOpenChange: (openState: boolean) => void
  candidates: OnboardingCandidate[]
  allCandidates?: OnboardingCandidate[]
  onSuccess: () => void
}

export function SendRejectionModal({
  open,
  onOpenChange,
  candidates,
  allCandidates = [],
  onSuccess,
}: SendRejectionModalProps) {
  const [customMessage, setCustomMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [templateId, setTemplateId] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isPickerExpanded, setIsPickerExpanded] = useState(false)

  // Merge passed candidates and allCandidates to provide the full candidate pool
  const candidatePool = useMemo(() => {
    const map = new Map<string, OnboardingCandidate>()
    allCandidates.forEach((c) => map.set(c.id, c))
    candidates.forEach((c) => map.set(c.id, c))
    return Array.from(map.values())
  }, [candidates, allCandidates])

  // Reset & initialize selection whenever the modal is opened
  useEffect(() => {
    if (!open) return

    setSearchQuery('')
    if (candidates.length > 0) {
      setSelectedIds(candidates.map((c) => c.id))
      setIsPickerExpanded(false)
    } else {
      const rejectedEligible = candidatePool.filter((c) => c.status === 'REJECTED')
      if (rejectedEligible.length > 0) {
        setSelectedIds(rejectedEligible.map((c) => c.id))
        setIsPickerExpanded(false)
      } else if (candidatePool.length > 0) {
        setSelectedIds(candidatePool.map((c) => c.id))
        setIsPickerExpanded(true)
      } else {
        setSelectedIds([])
        setIsPickerExpanded(true)
      }
    }
  }, [open, candidates, candidatePool])

  const selectedCandidates = useMemo(() => {
    return candidatePool.filter((c) => selectedIds.includes(c.id))
  }, [candidatePool, selectedIds])

  const filteredPool = useMemo(() => {
    if (!searchQuery.trim()) return candidatePool
    const q = searchQuery.toLowerCase()
    return candidatePool.filter(
      (c) =>
        c.applicant?.name?.toLowerCase().includes(q) ||
        c.applicant?.email?.toLowerCase().includes(q) ||
        c.job?.title?.toLowerCase().includes(q),
    )
  }, [candidatePool, searchQuery])

  const toggleCandidate = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const selectAllFiltered = () => {
    const allFilteredIds = filteredPool.map((c) => c.id)
    setSelectedIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])))
  }

  const clearAllSelected = () => {
    setSelectedIds([])
  }

  const removeCandidate = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (selectedCandidates.length === 0) {
      toast.error('Please select at least one recipient')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await sendOnboardingRejection({
        applicationIds: selectedCandidates.map((candidate) => candidate.id),
        customMessage: customMessage.trim() || undefined,
        templateId: templateId || undefined,
      })

      toast.success(
        response.message ||
          `Dispatched rejection notice to ${selectedCandidates.length} candidate(s)`,
      )
      onSuccess()
      onOpenChange(false)
      setCustomMessage('')
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send rejection emails'
      console.error(error)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border text-foreground p-0 overflow-hidden rounded-none">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogHeader className="p-5 border-b border-border/80 bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-none bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <UserX className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground">
                  Send Rejection Notices
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Dispatches formal status update and notification to candidates.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Email Template Selector */}
            <div className="p-3 rounded-none border border-border/80 bg-muted/20">
              <EmailTemplateSelect
                category="ONBOARDING_REJECTION"
                value={templateId}
                onChange={(id) => setTemplateId(id)}
                label="Rejection Email Template"
              />
            </div>

            {/* Recipients Section with Interactive Picker */}
            <div className="p-3.5 rounded-none border border-border/80 bg-muted/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Users className="size-3.5 text-rose-400" />
                    <span>Recipients</span>
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5"
                  >
                    {selectedCandidates.length} candidate{selectedCandidates.length === 1 ? '' : 's'}
                  </Badge>
                </div>

                {candidatePool.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPickerExpanded((prev) => !prev)}
                    className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <span>{isPickerExpanded ? 'Done' : 'Select / Change'}</span>
                    {isPickerExpanded ? (
                      <ChevronUp className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </Button>
                )}
              </div>

              {/* Selected Candidate Chips */}
              {selectedCandidates.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {selectedCandidates.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-none text-[11px] font-medium bg-background border border-border/70 text-foreground group"
                    >
                      <span className="truncate max-w-[130px]">
                        {c.applicant?.name || 'Candidate'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeCandidate(c.id)
                        }}
                        className="size-3.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center justify-center cursor-pointer"
                        title="Remove candidate"
                      >
                        <X className="size-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-2.5 rounded-none border border-dashed border-amber-500/40 bg-amber-500/5 text-amber-300 text-xs flex items-center justify-between">
                  <span>No candidates selected. Please choose recipients below.</span>
                  {candidatePool.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIds(candidatePool.map((c) => c.id))}
                      className="h-6 text-[10px] px-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 cursor-pointer"
                    >
                      Select All ({candidatePool.length})
                    </Button>
                  )}
                </div>
              )}

              {/* Interactive Candidate Selector Dropdown / Panel */}
              {(isPickerExpanded || selectedCandidates.length === 0) && candidatePool.length > 0 && (
                <div className="pt-2 border-t border-border/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search candidate name, email, or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-7 text-xs pl-8 pr-2 bg-background border-border"
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={selectAllFiltered}
                        className="h-7 text-[10px] px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearAllSelected}
                        className="h-7 text-[10px] px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  {/* Scrollable candidates list */}
                  <div className="max-h-40 overflow-y-auto rounded-none border border-border/70 bg-background divide-y divide-border/50">
                    {filteredPool.length === 0 ? (
                      <div className="py-4 text-center text-xs text-muted-foreground">
                        No candidates match your search
                      </div>
                    ) : (
                      filteredPool.map((c) => {
                        const isChecked = selectedIds.includes(c.id)
                        const stage = ONBOARDING_STAGE_CONFIGS[c.status] || {
                          label: c.status,
                          color: 'text-muted-foreground bg-muted/20 border-border',
                          dotColor: 'bg-muted-foreground',
                        }
                        return (
                          <div
                            key={c.id}
                            onClick={() => toggleCandidate(c.id)}
                            className={cn(
                              'flex items-center justify-between p-2 hover:bg-muted/40 transition-colors cursor-pointer text-xs',
                              isChecked && 'bg-rose-500/5',
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => toggleCandidate(c.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="cursor-pointer"
                              />
                              <div className="size-6 rounded-none bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                                {getInitials(c.applicant?.name)}
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium text-foreground text-xs truncate block">
                                  {c.applicant?.name || 'Applicant'}
                                </span>
                                <span className="text-[10px] text-muted-foreground truncate block">
                                  {c.applicant?.email || c.job?.title}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0 ml-2">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border',
                                  stage.color,
                                )}
                              >
                                <span className={cn('size-1.5 rounded-full', stage.dotColor)} />
                                <span>{stage.label}</span>
                              </span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Personalized Note Field */}
            <div className="space-y-1.5">
              <Label
                htmlFor="custom-rejection-message"
                className="text-xs font-semibold text-foreground"
              >
                Personalized Message (Optional)
              </Label>
              <Textarea
                id="custom-rejection-message"
                placeholder="Add specific feedback or a personalized closing message..."
                value={customMessage}
                onChange={(event) => setCustomMessage(event.target.value)}
                rows={3}
                className="text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 pb-6 border-t border-border/80 bg-muted/20 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs h-8 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || selectedCandidates.length === 0}
              className="text-xs h-8 gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <UserX className="size-3.5" />
                  <span>Send Rejection ({selectedCandidates.length})</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
