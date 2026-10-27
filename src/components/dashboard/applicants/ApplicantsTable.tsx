'use client'

import React, { useMemo, useState } from 'react'
import {
  ExternalLink,
  Globe,
  Mail,
  MoreHorizontal,
  Phone,
  User,
  Copy,
  Check,
  ChevronDown,
  Loader2,
} from 'lucide-react'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.49 1.49 0 1 0 0 2.97 1.49 1.49 0 0 0 0-2.97z" />
    </svg>
  )
}
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import type { Applicant } from '@/lib/applicants'
import { ApplicationStatusBadge } from '@/components/dashboard/applications/ApplicationStatusBadge'

interface ApplicantsTableProps {
  applicants: Applicant[]
  loading: boolean
  loadingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  total?: number
  page?: number
  limit?: number
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  onRetry?: () => void
}

function formatDate(dateString: string) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getInitials(name: string): string {
  if (!name) return 'A'
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function ApplicantsTable({
  applicants,
  loading,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  total = 0,
  page = 1,
  limit = 20,
  selectedIds,
  onSelectionChange,
  onRetry,
}: ApplicantsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const isAllSelected = useMemo(() => {
    if (applicants.length === 0) return false
    return applicants.every((a) => selectedIds.has(a.id))
  }, [applicants, selectedIds])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const next = new Set(selectedIds)
      applicants.forEach((a) => next.add(a.id))
      onSelectionChange(next)
    } else {
      const next = new Set(selectedIds)
      applicants.forEach((a) => next.delete(a.id))
      onSelectionChange(next)
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const next = new Set(selectedIds)
    if (checked) {
      next.add(id)
    } else {
      next.delete(id)
    }
    onSelectionChange(next)
  }

  const copyToClipboard = (text: string, label: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="rounded-none border border-border/60 bg-canvas/60 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader className="bg-subtle/80">
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead className="w-12"></TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Applied Jobs</TableHead>
              <TableHead className="text-center">Applications</TableHead>
              <TableHead>Profiles</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={index} className="border-border/40">
                <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-5 w-32 rounded-full" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24 rounded-none" /></TableCell>
                <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-none" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (applicants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-none border border-border/60 bg-canvas/60 p-12 text-center backdrop-blur-md">
        <div className="flex size-12 items-center justify-center rounded-full bg-subtle border border-hairline-light text-muted-foreground mb-3">
          <User className="size-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">No applicants found</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          Try adjusting your search query, status, or date range filters to find candidate profiles.
        </p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-4 h-8 text-xs border-border/70 hover:bg-subtle cursor-pointer"
          >
            Refresh List
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-none border border-border/60 bg-canvas/60 backdrop-blur-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-subtle/80 text-xs font-semibold text-muted">
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="w-10 text-center">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all applicants"
                  className="translate-y-0.5 border-border/80"
                />
              </TableHead>
              <TableHead className="w-10 text-center font-medium">SL</TableHead>
              <TableHead className="min-w-[200px]">Applicant</TableHead>
              <TableHead className="min-w-[170px]">Contact</TableHead>
              <TableHead className="min-w-[220px]">Applied Jobs</TableHead>
              <TableHead className="text-center min-w-[110px]">Applications</TableHead>
              <TableHead className="min-w-[150px]">Profiles</TableHead>
              <TableHead className="min-w-[110px]">Created</TableHead>
              <TableHead className="w-12 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {applicants.map((applicant, index) => {
              const sl = index + 1
              const isSelected = selectedIds.has(applicant.id)
              const apps = applicant.applications || []
              const hasApplications = apps.length > 0
              const primaryJob = hasApplications ? apps[0].job : null
              const remainingJobsCount = apps.length > 1 ? apps.length - 1 : 0

              const githubUrl = formatUrl(applicant.github)
              const portfolioUrl = formatUrl(applicant.portfolio)
              const linkedinUrl = formatUrl(applicant.linkedin)
              const hasAnyProfile = Boolean(githubUrl || portfolioUrl || linkedinUrl)

              return (
                <TableRow
                  key={applicant.id}
                  className={cn(
                    'border-border/40 transition-colors hover:bg-subtle/40',
                    isSelected && 'bg-accent-soft hover:bg-accent-soft',
                  )}
                >
                  {/* Select Checkbox */}
                  <TableCell className="text-center">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleSelectRow(applicant.id, Boolean(checked))
                      }
                      aria-label={`Select ${applicant.name}`}
                      className="translate-y-0.5 border-border/80"
                    />
                  </TableCell>

                  {/* SL */}
                  <TableCell className="text-center text-muted-foreground font-medium">
                    {sl}
                  </TableCell>

                  {/* Applicant Name & Email */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 border border-border/60 bg-subtle">
                        <AvatarFallback className="bg-accent-soft text-[11px] font-bold text-accent">
                          {getInitials(applicant.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground truncate">
                          {applicant.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                          <Mail className="size-3 text-muted shrink-0" />
                          {applicant.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact Phone & Address */}
                  <TableCell>
                    <div className="flex flex-col gap-1 text-[11px]">
                      {applicant.phone ? (
                        <span className="text-foreground flex items-center gap-1">
                          <Phone className="size-3 text-muted shrink-0" />
                          {applicant.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Phone: N/A</span>
                      )}
                      {applicant.address ? (
                        <span className="text-muted-foreground truncate max-w-[160px]" title={applicant.address}>
                          {applicant.address}
                        </span>
                      ) : (
                        <span className="text-muted">No address</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Applied Jobs */}
                  <TableCell>
                    {!hasApplications ? (
                      <span className="text-muted-foreground italic text-[11px]">
                        No applications
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap max-w-[240px]">
                        {primaryJob && (
                          <Badge
                            variant="outline"
                            className="bg-subtle/90 text-muted border-hairline-light/80 font-medium text-[11px] px-2 py-0.5 max-w-[180px] truncate"
                            title={primaryJob.title}
                          >
                            {primaryJob.title}
                          </Badge>
                        )}

                        {remainingJobsCount > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Badge
                                variant="secondary"
                                className="bg-accent-soft text-accent hover:bg-accent-soft border-accent text-[10px] font-bold cursor-pointer px-1.5 py-0.5"
                              >
                                +{remainingJobsCount} more
                              </Badge>
                            </PopoverTrigger>
                            <PopoverContent side="top" className="w-64 bg-subtle border-hairline-light p-3">
                              <p className="text-xs font-semibold text-muted mb-2 border-b border-hairline-light pb-1.5">
                                All Applied Jobs ({apps.length})
                              </p>
                              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {apps.map((app) => (
                                  <div
                                    key={app.id}
                                    className="flex flex-col gap-0.5 bg-canvas/60 p-2 rounded border border-hairline-light/80 text-[11px]"
                                  >
                                    <div className="font-medium text-foreground">
                                      {app.job?.title || 'Unknown Job'}
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                                      <span>{app.applicationCode || '—'}</span>
                                      {app.status && (
                                        <ApplicationStatusBadge status={app.status as any} />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* Applications Count */}
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-bold text-[11px] px-2.5 py-0.5',
                        apps.length > 0
                          ? 'bg-subtle text-accent border-accent'
                          : 'bg-subtle/50 text-muted-foreground border-hairline-light',
                      )}
                    >
                      {apps.length} {apps.length === 1 ? 'app' : 'apps'}
                    </Badge>
                  </TableCell>

                  {/* Profiles Links */}
                  <TableCell>
                    {!hasAnyProfile ? (
                      <span className="text-muted-foreground text-[11px]">N/A</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {githubUrl && (
                          <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex size-7 items-center justify-center rounded-none bg-subtle border border-hairline-light text-muted hover:text-white hover:bg-muted transition-colors"
                            title="GitHub Profile"
                          >
                            <GithubIcon className="size-3.5" />
                          </a>
                        )}

                        {linkedinUrl && (
                          <a
                            href={linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex size-7 items-center justify-center rounded-none bg-subtle border border-hairline-light text-sky-400 hover:text-sky-300 hover:bg-muted transition-colors"
                            title="LinkedIn Profile"
                          >
                            <LinkedinIcon className="size-3.5" />
                          </a>
                        )}

                        {portfolioUrl && (
                          <a
                            href={portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex size-7 items-center justify-center rounded-none bg-subtle border border-hairline-light text-accent hover:text-accent hover:bg-muted transition-colors"
                            title="Portfolio Website"
                          >
                            <Globe className="size-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* Created Date */}
                  <TableCell className="text-muted-foreground text-[11px]">
                    {formatDate(applicant.createdAt)}
                  </TableCell>

                  {/* Actions Dropdown */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-none text-muted hover:text-white hover:bg-muted cursor-pointer"
                        >
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-subtle border-hairline-light text-xs w-44">
                        <DropdownMenuItem
                          onClick={() => copyToClipboard(applicant.email, 'Email', applicant.id + '-email')}
                          className="cursor-pointer gap-2"
                        >
                          {copiedId === applicant.id + '-email' ? (
                            <Check className="size-3.5 text-accent" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                          <span>Copy Email</span>
                        </DropdownMenuItem>

                        {applicant.phone && (
                          <DropdownMenuItem
                            onClick={() => copyToClipboard(applicant.phone!, 'Phone', applicant.id + '-phone')}
                            className="cursor-pointer gap-2"
                          >
                            {copiedId === applicant.id + '-phone' ? (
                              <Check className="size-3.5 text-accent" />
                            ) : (
                              <Phone className="size-3.5" />
                            )}
                            <span>Copy Phone</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Footer / Load More section */}
      <div className="flex flex-col items-center justify-center gap-3 border-t border-border/40 px-4 py-4 bg-canvas/40">
        {hasMore ? (
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="rounded-full px-7 py-2 h-9 text-xs font-medium border border-border/80 bg-subtle/80 backdrop-blur-xs hover:bg-accent-soft hover:border-accent hover:text-accent transition-all gap-2 cursor-pointer"
          >
            {loadingMore ? (
              <>
                <Loader2 className="size-3.5 animate-spin text-accent" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Load More</span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </>
            )}
          </Button>
        ) : applicants.length > 0 ? (
          <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 bg-subtle/60 border border-hairline-light text-[11px] font-medium text-muted-foreground">
            <span>All {total || applicants.length} applicants loaded</span>
          </div>
        ) : null}

        <div className="text-xs text-muted-foreground text-center">
          {selectedIds.size > 0 ? (
            <>
              <span className="font-semibold text-foreground">{selectedIds.size}</span> selected · Showing{' '}
              <span className="font-semibold text-foreground">{applicants.length}</span> of{' '}
              <span className="font-semibold text-foreground">{total || applicants.length}</span> applicants
            </>
          ) : (
            <>
              Showing <span className="font-semibold text-foreground">{applicants.length}</span> of{' '}
              <span className="font-semibold text-foreground">{total || applicants.length}</span> applicants
            </>
          )}
        </div>
      </div>
    </div>
  )
}
