import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function BlogsSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>
      </div>

      {/* 4 Stats KPI Grid Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs flex items-center gap-2.5 sm:gap-3"
          >
            <Skeleton className="size-8 sm:size-10 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-3 w-16 sm:w-20 rounded-md" />
              <Skeleton className="h-5 sm:h-6 w-10 sm:w-12 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters Card Skeleton */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-16 rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-16 rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-16 rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-16 rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-52 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>

      {/* Blog Posts Table Skeleton */}
      <div className="hidden lg:block rounded-xl border border-border bg-card shadow-xs overflow-hidden w-full">
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-16 px-3">SL</TableHead>
                <TableHead className="min-w-80 px-3">Title</TableHead>
                <TableHead className="min-w-36 px-3">Category</TableHead>
                <TableHead className="min-w-32 px-3">Published</TableHead>
                <TableHead className="min-w-28 px-3">Status</TableHead>
                <TableHead className="min-w-32 px-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={`blog-skel-row-${i}`}>
                  <TableCell className="px-3 py-3">
                    <Skeleton className="h-4 w-6 rounded-md" />
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-52 rounded-md" />
                      <Skeleton className="h-3 w-32 rounded-md" />
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Skeleton className="size-7 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Skeleton */}
      <div className="lg:hidden space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`blog-card-skel-${i}`}
            className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-44 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="space-y-2 pt-2 border-t border-border">
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
