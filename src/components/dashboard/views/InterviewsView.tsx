import React from 'react'
import { InterviewHub } from '@/components/dashboard/interviews'

import type { InitialInterviewData } from '@/contexts/InterviewContext'

export function InterviewsView({ initialData }: { initialData?: InitialInterviewData }) {
  return <InterviewHub initialData={initialData} />
}
