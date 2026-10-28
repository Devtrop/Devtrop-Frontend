import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function JobsSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-52 rounded-none" />
          <Skeleton className="h-4 w-80 rounded-none" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-none" />
          <Skeleton className="h-8 w-32 rounded-none" />
        </div>
      </div>

      {/* KPI Stats Skeletons (4 Grid Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-none border border-border/80 bg-card/60 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded-none" />
              <Skeleton className="size-8 rounded-none" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-7 w-14 rounded-none" />
              <Skeleton className="h-3 w-28 rounded-none" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-none border border-border bg-card">
        <div className="flex items-center gap-2 flex-1">
          <Skeleton className="h-9 w-full rounded-none" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-36 rounded-none" />
          <Skeleton className="h-9 w-32 rounded-none" />
          <Skeleton className="h-9 w-20 rounded-none" />
        </div>
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden lg:block rounded-none border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-16 px-3">SL</TableHead>
                <TableHead className="min-w-60 px-3">Job</TableHead>
                <TableHead className="min-w-32 px-3">Experience</TableHead>
                <TableHead className="min-w-32 px-3">Salary</TableHead>
                <TableHead className="min-w-32 px-3">Status</TableHead>
                <TableHead className="min-w-24 px-3 text-center">Applications</TableHead>
                <TableHead className="min-w-32 px-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={`job-skel-row-${i}`}>
                  <TableCell className="px-3 py-3">
                    <Skeleton className="h-4 w-6 rounded-none" />
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-44 rounded-none" />
                      <Skeleton className="h-3 w-28 rounded-none" />
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <Skeleton className="h-4 w-16 rounded-none" />
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <Skeleton className="h-4 w-20 rounded-none" />
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <Skeleton className="h-7 w-28 rounded-none" />
                  </TableCell>
                  <TableCell className="px-3 py-3 text-center">
                    <Skeleton className="h-7 w-12 mx-auto rounded-none" />
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Skeleton className="h-7 w-7 rounded-none" />
                      <Skeleton className="h-7 w-7 rounded-none" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards Skeleton */}
      <div className="lg:hidden space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`job-card-skel-${i}`}
            className="p-4 rounded-none border border-border bg-card space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-40 rounded-none" />
                <Skeleton className="h-3 w-24 rounded-none" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <Skeleton className="h-4 w-24 rounded-none" />
              <Skeleton className="h-4 w-20 rounded-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
