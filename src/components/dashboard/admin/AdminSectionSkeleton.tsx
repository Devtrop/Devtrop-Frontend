import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface AdminSectionSkeletonProps {
  titleWidth?: string
  actionButtonWidth?: string
  statCardsCount?: number
}

export function AdminSectionSkeleton({
  titleWidth = 'w-48',
  actionButtonWidth = 'w-32',
  statCardsCount,
}: AdminSectionSkeletonProps) {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className={`h-7 ${titleWidth} rounded-xl`} />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className={`h-9 ${actionButtonWidth} rounded-xl`} />
        </div>
      </div>

      {/* KPI Stats Skeletons (if present on view) */}
      {Boolean(statCardsCount && statCardsCount > 0) && (
        <div
          className={`grid grid-cols-2 ${
            statCardsCount === 5 ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-2 lg:grid-cols-4'
          } gap-3 sm:gap-4`}
        >
          {Array.from({ length: statCardsCount! }).map((_, i) => (
            <div
              key={i}
              className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="size-8 rounded-xl" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-7 w-14 rounded-md" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card/60">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead className="w-16">SL</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, index) => (
              <TableRow key={`admin-skel-${index}`}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-6" />
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-28 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
