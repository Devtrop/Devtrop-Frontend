'use client'

import React, { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FileText,
  Mail,
  Video,
  Eye,
  MoreHorizontal,
  ChevronDown,
  Check,
  CheckCircle2,
  ExternalLink,
  UserX,
  XCircle,
} from 'lucide-react'
import { EmailStatusBadge } from '@/components/dashboard/common/EmailStatusBadge'
import type { OnboardingCandidate } from '@/lib/onboarding'
import { cn } from '@/lib/utils'

interface OnboardingTableRowProps {
  candidate: OnboardingCandidate
  serialNumber?: number
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onOpenDrawer: (candidate: OnboardingCandidate) => void
  onOpenViewer: (candidate: OnboardingCandidate) => void
  onSendOffer: (candidate: OnboardingCandidate) => void
  onSendOrientation: (candidate: OnboardingCandidate) => void
  onSendRejection?: (candidate: OnboardingCandidate) => void
  onUpdateStatus: (applicationId: string, status: string) => Promise<void>
}

const STATUS_CONFIGS: Record<string, { label: string; color: string; dotColor: string }> = {
  OFFER_PENDING: {
    label: 'Offer Pending',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    dotColor: 'bg-amber-400',
  },
  OFFER_SENT: {
    label: 'Offer Sent',
    color: 'text-accent bg-accent-soft/10 border-blue-500/20',
    dotColor: 'bg-accent-soft',
  },
  DOCS_SUBMITTED: {
    label: 'Docs Submitted',
    color: 'text-accent bg-accent-soft/10 border-purple-500/20',
    dotColor: 'bg-accent-soft',
  },
  HIRED: {
    label: 'Hired',
    color: 'text-accent bg-accent-soft border-accent',
    dotColor: 'bg-accent',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    dotColor: 'bg-rose-400',
  },
  CLOSED: {
    label: 'Closed',
    color: 'text-muted bg-zinc-500/10 border-hairline-light/20',
    dotColor: 'bg-zinc-400',
  },
}

export function OnboardingTableRow({
  candidate,
  serialNumber,
  isSelected,
  onToggleSelect,
  onOpenDrawer,
  onOpenViewer,
  onSendOffer,
  onSendOrientation,
  onSendRejection,
  onUpdateStatus,
}: OnboardingTableRowProps) {
  const [updating, setUpdating] = useState(false)

  const applicant = candidate.applicant
  const job = candidate.job
  const documents = candidate.documents || []
  const latestEmailLog = candidate.emailLogs?.[0]

  const statusConfig = STATUS_CONFIGS[candidate.status] || {
    label: candidate.status,
    color: 'text-muted-foreground bg-muted/20 border-border',
    dotColor: 'bg-muted-foreground',
  }

  const handleStatusSelect = async (newStatus: string) => {
    if (newStatus === candidate.status) return
    try {
      setUpdating(true)
      await onUpdateStatus(candidate.id, newStatus)
    } finally {
      setUpdating(false)
    }
  }

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
    <tr
      id={`candidate-row-${candidate.id}`}
      onClick={() => onOpenDrawer(candidate)}
      className={cn(
        'group transition-all cursor-pointer border-b border-border/60',
        isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/40',
      )}
    >
      {/* 0. Select Checkbox */}
      <td className="w-8 py-3.5 pl-3 pr-1 text-center" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(candidate.id)}
          aria-label={`Select ${applicant?.name}`}
          className="shrink-0 cursor-pointer"
        />
      </td>

      {/* 0.1 SL */}
      <td className="w-10 py-3.5 px-1 text-center font-mono text-[11px] font-semibold text-muted-foreground">
        {serialNumber ?? '-'}
      </td>

      {/* 1. Candidate Column */}
      <td className="py-3 px-3.5 min-w-[200px]">
        <div className="flex items-center gap-2.5">
          <div
            onClick={() => onOpenDrawer(candidate)}
            className="size-8 rounded-none bg-primary/10 border border-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
          >
            {getInitials(applicant?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <span
              onClick={() => onOpenDrawer(candidate)}
              className="font-semibold text-foreground truncate text-xs hover:text-primary transition-colors cursor-pointer block"
              title={applicant?.email}
            >
              {applicant?.name || 'Applicant'}
            </span>
            <span className="text-[11px] text-muted-foreground truncate block font-medium">
              {job?.title || 'Open Position'}
              {candidate.applicationCode && (
                <span className="ml-1 text-[10px] font-mono text-muted-foreground/80">
                  #{candidate.applicationCode}
                </span>
              )}
            </span>
          </div>
        </div>
      </td>

      {/* 2. Stage / Status Column (Fixed width w-[155px] equal pills) */}
      <td className="py-3.5 px-3.5 min-w-[155px]" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={updating}
              className={`inline-flex items-center justify-between w-[155px] min-w-[145px] px-3 py-1 rounded-full text-xs font-medium border cursor-pointer hover:opacity-85 transition-opacity whitespace-nowrap ${statusConfig.color}`}
              title="Click to change status or close application"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`size-1.5 rounded-full ${statusConfig.dotColor} shrink-0`} />
                <span className="truncate">{statusConfig.label}</span>
              </div>
              <ChevronDown className="size-3 opacity-60 ml-1 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-48 bg-popover border-border text-popover-foreground rounded-none p-1"
          >
            <div className="px-2 py-1 text-xs text-foreground font-medium flex items-center gap-1.5 bg-muted/40 rounded-none">
              <span className={`size-1.5 rounded-full ${statusConfig.dotColor}`} />
              <span>{statusConfig.label} (Current)</span>
              <Check className="size-3.5 ml-auto text-accent" />
            </div>
            <DropdownMenuSeparator className="my-1" />
            {candidate.status !== 'REJECTED' && (
              <DropdownMenuItem
                onClick={() => handleStatusSelect('REJECTED')}
                className="text-xs gap-2 cursor-pointer text-rose-400 focus:text-rose-300 focus:bg-rose-500/10"
              >
                <UserX className="size-3.5" />
                <span>Mark as Rejected</span>
              </DropdownMenuItem>
            )}
            {candidate.status === 'REJECTED' && (
              <DropdownMenuItem
                onClick={() => handleStatusSelect('OFFER_PENDING')}
                className="text-xs gap-2 cursor-pointer text-accent focus:text-accent focus:bg-accent-soft"
              >
                <CheckCircle2 className="size-3.5" />
                <span>Move to Offer Pending</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => handleStatusSelect('CLOSED')}
              className="text-xs gap-2 cursor-pointer text-muted focus:text-muted focus:bg-zinc-500/10"
            >
              <XCircle className="size-3.5" />
              <span>Close Application</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>

      {/* 3. Documents Column */}
      <td className="py-3 px-3.5 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
        {documents.length === 0 ? (
          <span className="text-xs text-muted-foreground/60 italic">No files yet</span>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onOpenViewer(candidate)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[11px] font-medium bg-accent-soft text-accent border border-accent hover:bg-accent-soft cursor-pointer transition-colors"
            >
              <FileText className="size-3" />
              <span>
                {documents.length} File{documents.length > 1 ? 's' : ''}
              </span>
            </button>
            {candidate.docsVerifiedAt && (
              <Badge
                variant="outline"
                className="text-[10px] text-accent border-accent bg-accent-soft px-1.5 py-0"
              >
                <CheckCircle2 className="size-2.5 mr-1" /> Verified
              </Badge>
            )}
          </div>
        )}
      </td>

      {/* 4. Email Status Column */}
      <td className="py-3 px-3.5 min-w-[130px]">
        <EmailStatusBadge log={latestEmailLog} />
      </td>

      {/* 5. Actions Column (Clean Dropdown Menu) */}
      <td className="py-3 px-3.5 text-right shrink-0" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-none"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-popover border-border text-popover-foreground rounded-none p-1"
          >
            <DropdownMenuItem
              onClick={() => onOpenViewer(candidate)}
              className="text-xs gap-2 cursor-pointer"
            >
              <Eye className="size-3.5 text-muted-foreground" />
              <span>View Documents</span>
            </DropdownMenuItem>

            {(candidate.status === 'OFFER_PENDING' || candidate.status === 'OFFER_SENT') && (
              <DropdownMenuItem
                onClick={() => onSendOffer(candidate)}
                className="text-xs gap-2 cursor-pointer"
              >
                <Mail className="size-3.5 text-accent" />
                <span>
                  {candidate.status === 'OFFER_SENT' ? 'Resend Offer Letter' : 'Send Offer Letter'}
                </span>
              </DropdownMenuItem>
            )}

            {(candidate.status === 'DOCS_SUBMITTED' || candidate.status === 'HIRED') && (
              <DropdownMenuItem
                onClick={() => onSendOrientation(candidate)}
                className="text-xs gap-2 cursor-pointer"
              >
                <Video className="size-3.5 text-indigo-500" />
                <span>
                  {candidate.status === 'HIRED' ? 'Resend Orientation' : 'Send Orientation'}
                </span>
              </DropdownMenuItem>
            )}

            {candidate.status === 'REJECTED' && onSendRejection && (
              <DropdownMenuItem
                onClick={() => onSendRejection(candidate)}
                className="text-xs gap-2 cursor-pointer text-rose-400 focus:text-rose-300 focus:bg-rose-500/10"
              >
                <Mail className="size-3.5 text-rose-400" />
                <span>Resend Rejection Notice</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => onOpenDrawer(candidate)}
              className="text-xs gap-2 cursor-pointer"
            >
              <ExternalLink className="size-3.5 text-muted-foreground" />
              <span>Candidate Details</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            {candidate.status !== 'REJECTED' && (
              <DropdownMenuItem
                onClick={() => handleStatusSelect('REJECTED')}
                className="text-xs gap-2 cursor-pointer text-rose-400 focus:text-rose-300 focus:bg-rose-500/10"
              >
                <UserX className="size-3.5" />
                <span>Mark as Rejected</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => handleStatusSelect('CLOSED')}
              className="text-xs gap-2 cursor-pointer text-muted focus:text-muted focus:bg-zinc-500/10"
            >
              <XCircle className="size-3.5" />
              <span>Close Application</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}
