'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteJob } from '@/lib/jobs'

interface Props {
  jobId: string
  jobTitle: string
  onSuccess: () => void
}

export default function DeleteJobButton({ jobId, jobTitle, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)

  function handleDelete() {
    toast(`Delete "${jobTitle}"?`, {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            setLoading(true)
            await deleteJob(jobId)
            toast.success('Job deleted successfully')
            onSuccess()
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete job')
          } finally {
            setLoading(false)
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="h-7 w-7 p-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
      title="Delete job"
    >
      <Trash2 className="size-3" />
    </Button>
  )
}
