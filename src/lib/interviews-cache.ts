import type { Interview, Job } from '@/components/dashboard/interviews/types'

let cachedInterviews: Interview[] | null = null
let cachedJobs: Job[] | null = null

export const interviewCache = {
  getInterviews: (): Interview[] | null => cachedInterviews,
  setInterviews: (data: Interview[]) => {
    cachedInterviews = data
  },
  invalidateInterviews: () => {
    cachedInterviews = null
  },

  getJobs: (): Job[] | null => cachedJobs,
  setJobs: (data: Job[]) => {
    cachedJobs = data
  },
  invalidateJobs: () => {
    cachedJobs = null
  },

  hasData: (): boolean => Boolean(cachedInterviews && cachedInterviews.length > 0),

  updateInterview: (id: string, updater: (item: Interview) => Interview) => {
    if (!cachedInterviews) return
    cachedInterviews = cachedInterviews.map((item) => (item.id === id ? updater(item) : item))
  },

  removeInterview: (id: string) => {
    if (!cachedInterviews) return
    cachedInterviews = cachedInterviews.filter((item) => item.id !== id)
  },

  invalidateAll: () => {
    cachedInterviews = null
    cachedJobs = null
  },
}
