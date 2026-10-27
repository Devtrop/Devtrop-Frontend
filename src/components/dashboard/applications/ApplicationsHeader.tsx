'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Briefcase } from 'lucide-react'

export function ApplicationsHeader() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 w-full">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Applications Management
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl">
          Review and manage job applications from candidates.
        </p>
      </div>

      <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
        <Link href="/dashboard/admin/jobs" className="w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-border hover:bg-muted text-xs h-8 px-3 rounded-none w-full sm:w-auto"
          >
            <Briefcase className="size-3.5" />
            <span>Manage Jobs</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
