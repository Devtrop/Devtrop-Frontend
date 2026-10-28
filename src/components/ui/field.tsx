import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

export function FieldGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="field-group" className={cn('flex flex-col gap-4', className)} {...props} />
}

export function Field({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="field" className={cn('flex flex-col gap-2', className)} {...props} />
}

export function FieldLabel({ className, htmlFor, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      htmlFor={htmlFor}
      className={cn('text-xs font-medium', className)}
      {...props}
    />
  )
}
