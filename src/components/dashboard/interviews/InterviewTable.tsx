'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useInterviewContext } from '@/contexts/InterviewContext'
import { InterviewCommunicationBadge } from './InterviewCommunicationBadge'
import { InterviewTableRow } from './InterviewTableRow'
import { InterviewIcons } from './interview-icons'
import { Interview } from './types'

interface InterviewTableProps {
  interviews?: Interview[]
  selectedIds?: string[]
  onToggleSelect?: (id: string) => void
  onSelectAll?: () => void
  onOpenFeedback?: (interview: Interview) => void
  onRescheduleInterview?: (interview: Interview) => void
  onUpdateApplicationStatus?: (applicationId: string, status: string) => Promise<boolean | void>
}

export function InterviewTable(props: InterviewTableProps) {
  const context = useInterviewContext()

  const interviews = props.interviews ?? context.paginatedInterviews
  const selectedIds = props.selectedIds ?? context.selectedIds
  const onToggleSelect = props.onToggleSelect ?? context.toggleSelect
  const onSelectAll = props.onSelectAll ?? context.selectAll
  const onOpenFeedback = props.onOpenFeedback ?? ((target) => context.openModal('FEEDBACK', target))
  const onRescheduleInterview =
    props.onRescheduleInterview ?? ((target) => context.openModal('RESCHEDULE', target))
  const onUpdateApplicationStatus =
    props.onUpdateApplicationStatus ?? context.updateApplicationStatus
  const openDrawer = context.openDrawer

  const isAllSelected = interviews.length > 0 && interviews.every((i) => selectedIds.includes(i.id))

  const getInitials = (name?: string) => {
    if (!name) return 'AP'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <div className="w-full space-y-4">
      {/* =================================================================== */}
      {/* 1. DESKTOP VIEW (lg+): 5-Column Notion-Style Minimalist Grid        */}
      {/* =================================================================== */}
      <div className="hidden lg:block rounded-2xl border border-border bg-card shadow-xs overflow-hidden w-full">
        <Table containerClassName="overflow-hidden" className="w-full text-xs">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                <TableHead className="w-8 pl-3 pr-1 text-center font-semibold text-muted-foreground">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={onSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-10 px-1 text-center font-mono text-[11px] font-semibold text-muted-foreground">
                  SL
                </TableHead>
                <TableHead className="min-w-[200px] px-3 font-semibold text-muted-foreground">
                  Candidate
                </TableHead>
                <TableHead className="min-w-[180px] px-3 font-semibold text-muted-foreground">
                  Stage
                </TableHead>
                <TableHead className="min-w-[110px] px-3 font-semibold text-muted-foreground">
                  Notice
                </TableHead>
                <TableHead className="min-w-[150px] px-3 font-semibold text-muted-foreground">
                  Schedule
                </TableHead>
                <TableHead className="w-[140px] min-w-[130px] px-2 text-center font-semibold text-muted-foreground">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews.map((item, index) => (
                <InterviewTableRow
                  key={item.id}
                  item={item}
                  serialNumber={index + 1}
                  isSelected={selectedIds.includes(item.id)}
                  onToggleSelect={onToggleSelect}
                  onOpenFeedback={onOpenFeedback}
                  onRescheduleInterview={onRescheduleInterview}
                  onUpdateApplicationStatus={onUpdateApplicationStatus}
                />
              ))}
            </TableBody>
          </Table>
      </div>

      {/* =================================================================== */}
      {/* 2. MOBILE & TABLET VIEW (<lg): Fluid Candidate Cards Layout        */}
      {/* =================================================================== */}
      <div className="block lg:hidden space-y-3 w-full">
        {/* Bulk select summary header on mobile */}
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              aria-label="Select all candidates"
            />
            <span className="font-medium">Select All Candidates</span>
          </div>
          <span>{interviews.length} visible</span>
        </div>

        {/* Candidate Cards Grid */}
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 w-full">
          {interviews.map((item) => {
            const isSelected = selectedIds.includes(item.id)
            const applicant = item.application?.applicant
            const job = item.application?.job

            return (
              <div
                key={item.id}
                data-state={isSelected ? 'selected' : undefined}
                onClick={() => openDrawer(item)}
                className={`p-3.5 rounded-2xl border transition-all space-y-2.5 cursor-pointer ${
                  isSelected
                    ? 'border-primary/50 bg-primary/5 shadow-xs'
                    : 'border-border bg-card shadow-xs hover:border-border/80 hover:bg-muted/20'
                }`}
              >
                {/* Header Row: Checkbox + Name & Position */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(item.id)}
                        className="mt-0.5"
                        aria-label={`Select ${applicant?.name}`}
                      />
                    </div>
                    <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                      {getInitials(applicant?.name)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground text-xs truncate">
                        {applicant?.name || 'Applicant'}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {job?.title || 'Open Position'}
                      </p>
                    </div>
                  </div>

                  {/* Evaluation Score if available */}
                  {item.feedback && (
                    <div className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 shrink-0">
                      <span>
                        {((item.feedback.technicalSkill + item.feedback.communication) / 2).toFixed(
                          1,
                        )}
                        /5
                      </span>
                    </div>
                  )}
                </div>

                {/* Sub Row: Stage & Schedule info */}
                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                  <div onClick={(e) => e.stopPropagation()}>
                    <InterviewCommunicationBadge item={item} />
                  </div>

                  {item.slot ? (
                    <span className="text-muted-foreground font-medium truncate">
                      {new Date(item.slot.startTime).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                      ,{' '}
                      {new Date(item.slot.startTime).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 text-muted-foreground/70 font-mono text-[11px]"
                      title="Pending Booking"
                    >
                      <InterviewIcons.Hourglass className="size-3 text-amber-500/80" />
                      <span>Pending</span>
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
