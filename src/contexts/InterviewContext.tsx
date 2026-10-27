'use client'

import { interviewCache } from '@/lib/interviews-cache'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { toast } from '@/lib/toast'
import {
  classifyInterviewCandidates,
  getCandidateTabCategory,
} from '@/components/dashboard/interviews/constants'
import {
  Interview,
  InterviewStatsData,
  Job,
  PaginationMeta,
} from '@/components/dashboard/interviews/types'
import {
  interviewsApi,
  SubmitFeedbackPayload,
  SendBulkOutcomeEmailsPayload,
} from '@/lib/interviews'

export type InterviewModalType =
  'CREATE_SLOTS' | 'SLOTS_VIEWER' | 'SEND_EMAIL' | 'RESCHEDULE' | 'FEEDBACK' | null

export type InterviewSortOption =
  'recent_desc' | 'recent_asc' | 'name_asc' | 'name_desc' | 'applied_desc' | 'schedule_asc' | 'schedule_desc'

export interface InterviewContextValue {
  // State
  interviews: Interview[]
  jobs: Job[]
  selectedIds: string[]
  search: string
  filterTab: string
  selectedJobFilter: string
  selectedDateFilter: string | null
  page: number
  limit: number
  sortOrder: InterviewSortOption
  displayedCount: number
  hasMore: boolean
  isLoading: boolean
  isDispatching: boolean

  // Computed
  filteredInterviews: Interview[]
  paginatedInterviews: Interview[]
  stats: InterviewStatsData
  paginationMeta: PaginationMeta
  selectedInterviewsList: Interview[]
  invitations: Interview[]
  outcomes: Interview[]

  // Modal & Drawer Control
  activeModal: InterviewModalType
  modalTarget: Interview | null
  drawerCandidate: Interview | null
  openModal: (modal: InterviewModalType, target?: Interview | null) => void
  closeModal: () => void
  openDrawer: (candidate: Interview) => void
  closeDrawer: () => void

  // Filter & Pagination Actions
  setSearch: (q: string) => void
  setFilterTab: (tab: string) => void
  setSelectedJobFilter: (jobId: string) => void
  setDateFilter: (date: string | null) => void
  setSortOrder: (sort: InterviewSortOption) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  loadMore: () => void

  // Selection Actions
  toggleSelect: (id: string) => void
  selectAll: () => void
  clearSelection: () => void

  // Mutations
  fetchData: (forceRefresh?: boolean) => Promise<void>
  rescheduleCandidate: (interviewId: string, slotId: string) => Promise<boolean>
  submitFeedback: (interviewId: string, payload: SubmitFeedbackPayload) => Promise<boolean>
  updateApplicationStatus: (applicationId: string, status: string) => Promise<boolean>
  sendInvitations: (jobId: string, applicationIds: string[], groupName?: string) => Promise<boolean>
  sendOutcomes: (payload: SendBulkOutcomeEmailsPayload) => Promise<boolean>
  directSendInvitations: () => Promise<boolean>
  directSendOutcomes: () => Promise<boolean>
  deleteInterview: (interviewId: string) => Promise<boolean>
}

const InterviewContext = createContext<InterviewContextValue | null>(null)

export function useInterviewContext(): InterviewContextValue {
  const context = useContext(InterviewContext)
  if (!context) {
    throw new Error('useInterviewContext must be used within an InterviewProvider')
  }
  return context
}

export interface InitialInterviewData {
  interviews?: Interview[]
  jobs?: Job[]
  applications?: Array<{
    id: string
    status: string
    appliedAt: string
    applicant: { id: string; name: string; email: string; phone?: string | null }
    job: { id: string; title: string; jobCode?: string }
  }>
}

export function InterviewProvider({
  children,
  initialData,
}: {
  children: React.ReactNode
  initialData?: InitialInterviewData
}) {
  // ---------------------------------------------------------------------------
  // 1. Raw State
  // ---------------------------------------------------------------------------
  const initialCombinedInterviews = useMemo(() => {
    if (!initialData) return []
    const fetched = initialData.interviews || []
    const existingAppIds = new Set(fetched.map((i) => i.application?.id || i.applicationId))
    const synthetic = (initialData.applications || [])
      .filter((app) => !existingAppIds.has(app.id))
      .map((app) => ({
        id: `synthetic-${app.id}`,
        applicationId: app.id,
        slotId: null,
        token: null,
        tokenExpiresAt: null,
        status: 'PENDING_BOOKING' as const,
        createdAt: app.appliedAt || new Date().toISOString(),
        application: {
          id: app.id,
          status: app.status || 'INTERVIEW_SELECTED',
          applicant: {
            id: app.applicant.id,
            name: app.applicant.name,
            email: app.applicant.email,
            phone: app.applicant.phone ?? undefined,
          },
          job: app.job,
        },
        slot: null,
        feedback: null,
      }))
    return [...fetched, ...synthetic]
  }, [initialData])

  const hasUsableInitialData =
    Boolean(initialData) &&
    ((initialData?.interviews && initialData.interviews.length > 0) ||
      (initialData?.jobs && initialData.jobs.length > 0) ||
      (initialData?.applications && initialData.applications.length > 0))

  const [interviews, setInterviews] = useState<Interview[]>(() => {
    const cached = interviewCache.getInterviews()
    if (cached && cached.length > 0) return cached
    return initialCombinedInterviews
  })
  const [jobs, setJobs] = useState<Job[]>(() => {
    const cached = interviewCache.getJobs()
    if (cached && cached.length > 0) return cached
    return initialData?.jobs || []
  })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearchState] = useState('')
  const [filterTab, setFilterTabState] = useState('ALL')
  const [selectedJobFilter, setSelectedJobFilterState] = useState('ALL')
  const [selectedDateFilter, setSelectedDateFilterState] = useState<string | null>(null)
  const [sortOrder, setSortOrderState] = useState<InterviewSortOption>('schedule_asc')
  const [displayedCount, setDisplayedCount] = useState(20)
  const [page, setPageState] = useState(1)
  const [limit, setLimitState] = useState(20)
  const [isLoading, setIsLoading] = useState(() => {
    if (interviewCache.hasData()) return false
    return !hasUsableInitialData
  })
  const [isDispatching, setIsDispatching] = useState(false)

  // Modal & Drawer State
  const [activeModal, setActiveModal] = useState<InterviewModalType>(null)
  const [modalTarget, setModalTarget] = useState<Interview | null>(null)
  const [drawerCandidate, setDrawerCandidate] = useState<Interview | null>(null)

  // ---------------------------------------------------------------------------
  // 2. Data Fetch Pipeline
  // ---------------------------------------------------------------------------
  const fetchData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true)
    try {
      const [interviewsRes, applicationsRes, jobsRes] = await Promise.all([
        interviewsApi.getInterviews({ forceRefresh }),
        interviewsApi.getShortlistedApplications({ forceRefresh }),
        interviewsApi.getJobsList(forceRefresh),
      ])

      if (jobsRes.success && Array.isArray(jobsRes.data)) {
        setJobs(jobsRes.data)
        interviewCache.setJobs(jobsRes.data)
      }

      const fetchedInterviews: Interview[] =
        interviewsRes.success && Array.isArray(interviewsRes.data) ? interviewsRes.data : []

      const existingAppIds = new Set(
        fetchedInterviews.map((i) => i.application?.id || i.applicationId),
      )

      const shortlistedApps =
        applicationsRes.success && Array.isArray(applicationsRes.data) ? applicationsRes.data : []

      const syntheticCandidates: Interview[] = shortlistedApps
        .filter((app) => !existingAppIds.has(app.id))
        .map((app) => ({
          id: `app-${app.id}`,
          applicationId: app.id,
          slotId: null,
          token: null,
          tokenExpiresAt: null,
          status: 'PENDING_BOOKING' as const,
          createdAt: app.appliedAt || new Date().toISOString(),
          application: {
            id: app.id,
            status: app.status || 'INTERVIEW_SELECTED',
            applicant: app.applicant,
            job: app.job,
          },
          slot: null,
          feedback: null,
        }))

      const combined = [...fetchedInterviews, ...syntheticCandidates]
      setInterviews(combined)
      interviewCache.setInterviews(combined)
    } catch (err) {
      console.error('Failed to fetch interview data:', err)
      toast.error('Failed to load interview records')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (interviewCache.hasData() || hasUsableInitialData) {
      return
    }

    let ignore = false
    const init = async () => {
      if (!ignore) {
        await fetchData(false)
      }
    }
    void init()
    return () => {
      ignore = true
    }
  }, [fetchData, hasUsableInitialData])

  // ---------------------------------------------------------------------------
  // 3. Computed Filters & Metrics
  // ---------------------------------------------------------------------------
  const jobFilteredInterviews = useMemo(() => {
    if (selectedJobFilter === 'ALL') return interviews
    return interviews.filter((item) => item.application?.job?.id === selectedJobFilter)
  }, [interviews, selectedJobFilter])

  const stats: InterviewStatsData = useMemo(() => {
    let total = 0
    let selected = 0
    let pendingBooking = 0
    let scheduled = 0
    let completed = 0
    let cancelled = 0

    jobFilteredInterviews.forEach((item) => {
      total += 1
      const category = getCandidateTabCategory(item)
      if (category === 'INTERVIEW_SELECTED' || category === 'SELECTED') selected += 1
      else if (category === 'PENDING') pendingBooking += 1
      else if (category === 'SCHEDULED') scheduled += 1
      else if (category === 'COMPLETED') completed += 1
      else if (category === 'CANCELLED') cancelled += 1
    })

    return { total, selected, scheduled, completed, pendingBooking, cancelled }
  }, [jobFilteredInterviews])

  const filteredInterviews = useMemo(() => {
    return jobFilteredInterviews.filter((item) => {
      const applicantName = item.application?.applicant?.name || ''
      const jobTitle = item.application?.job?.title || ''
      const applicantEmail = item.application?.applicant?.email || ''

      const matchesSearch =
        applicantName.toLowerCase().includes(search.toLowerCase()) ||
        jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        applicantEmail.toLowerCase().includes(search.toLowerCase())

      if (!matchesSearch) return false

      if (selectedDateFilter && item.slot?.startTime) {
        const slotDate = new Date(item.slot.startTime).toISOString().split('T')[0]
        if (slotDate !== selectedDateFilter) return false
      }

      if (filterTab === 'ALL') return true
      const category = getCandidateTabCategory(item)
      if (filterTab === 'INTERVIEW_SELECTED' || filterTab === 'SELECTED') {
        return category === 'INTERVIEW_SELECTED' || category === 'SELECTED'
      }
      return category === filterTab
    })
  }, [jobFilteredInterviews, search, filterTab, selectedDateFilter])

  const sortedInterviews = useMemo(() => {
    return [...filteredInterviews].sort((a, b) => {
      const aUpdated = new Date(a.createdAt || 0).getTime()
      const bUpdated = new Date(b.createdAt || 0).getTime()
      const aName = a.application?.applicant?.name || ''
      const bName = b.application?.applicant?.name || ''
      const aApplied = new Date(a.application?.appliedAt || a.createdAt || 0).getTime()
      const bApplied = new Date(b.application?.appliedAt || b.createdAt || 0).getTime()
      const aSlot = a.slot?.startTime ? new Date(a.slot.startTime).getTime() : Infinity
      const bSlot = b.slot?.startTime ? new Date(b.slot.startTime).getTime() : Infinity

      if (sortOrder === 'schedule_asc') return aSlot - bSlot
      if (sortOrder === 'schedule_desc') return bSlot - aSlot
      if (sortOrder === 'recent_desc') return bUpdated - aUpdated
      if (sortOrder === 'recent_asc') return aUpdated - bUpdated
      if (sortOrder === 'name_asc') return aName.localeCompare(bName)
      if (sortOrder === 'name_desc') return bName.localeCompare(aName)
      if (sortOrder === 'applied_desc') return bApplied - aApplied
      return 0
    })
  }, [filteredInterviews, sortOrder])

  const totalCount = sortedInterviews.length
  const totalPages = Math.max(1, Math.ceil(totalCount / limit))

  const paginatedInterviews = useMemo(() => {
    return sortedInterviews.slice(0, displayedCount)
  }, [sortedInterviews, displayedCount])

  const hasMore = displayedCount < sortedInterviews.length

  const paginationMeta: PaginationMeta = useMemo(() => {
    return {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNextPage: hasMore,
      hasPreviousPage: page > 1,
    }
  }, [page, limit, totalCount, totalPages, hasMore])

  const selectedInterviewsList = useMemo(() => {
    return interviews.filter((i) => selectedIds.includes(i.id))
  }, [interviews, selectedIds])

  const { invitations, outcomes } = useMemo(() => {
    return classifyInterviewCandidates(selectedInterviewsList)
  }, [selectedInterviewsList])

  // ---------------------------------------------------------------------------
  // 4. Modal Handlers
  // ---------------------------------------------------------------------------
  const openModal = useCallback((modal: InterviewModalType, target?: Interview | null) => {
    setActiveModal(modal)
    setModalTarget(target || null)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
    setModalTarget(null)
  }, [])

  const openDrawer = useCallback((candidate: Interview) => {
    setDrawerCandidate(candidate)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerCandidate(null)
  }, [])

  // ---------------------------------------------------------------------------
  // 5. Actions & Filter Setters
  // ---------------------------------------------------------------------------
  const setSearch = useCallback((q: string) => {
    setSearchState(q)
    setDisplayedCount(20)
    setPageState(1)
  }, [])

  const setFilterTab = useCallback((tab: string) => {
    setFilterTabState(tab)
    setDisplayedCount(20)
    setPageState(1)
  }, [])

  const setSelectedJobFilter = useCallback((jobId: string) => {
    setSelectedJobFilterState(jobId)
    setDisplayedCount(20)
    setPageState(1)
  }, [])

  const setDateFilter = useCallback((date: string | null) => {
    setSelectedDateFilterState(date)
    setDisplayedCount(20)
    setPageState(1)
  }, [])

  const setSortOrder = useCallback((sort: InterviewSortOption) => {
    setSortOrderState(sort)
    setDisplayedCount(20)
    setPageState(1)
  }, [])

  const loadMore = useCallback(() => {
    setDisplayedCount((prev) => prev + 20)
  }, [])

  const setPage = useCallback((p: number) => {
    setPageState(p)
  }, [])

  const setLimit = useCallback((l: number) => {
    setLimitState(l)
    setDisplayedCount(l)
    setPageState(1)
  }, [])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === filteredInterviews.length ? [] : filteredInterviews.map((i) => i.id),
    )
  }, [filteredInterviews])

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  // ---------------------------------------------------------------------------
  // 6. Centralized Mutations
  // ---------------------------------------------------------------------------
  const rescheduleCandidate = useCallback(
    async (interviewId: string, slotId: string): Promise<boolean> => {
      if (interviewId.startsWith('app-')) {
        toast.error('Candidate has not booked an interview slot yet')
        return false
      }
      try {
        const res = await interviewsApi.rescheduleInterview(interviewId, slotId)
        if (res.success) {
          toast.success(res.message || 'Interview rescheduled successfully')
          await fetchData(true)
          closeModal()
          return true
        } else {
          toast.error(res.message || 'Failed to reschedule interview')
          return false
        }
      } catch (err) {
        console.error('Failed to reschedule interview:', err)
        toast.error('An error occurred while rescheduling')
        return false
      }
    },
    [fetchData, closeModal],
  )

  const submitFeedback = useCallback(
    async (interviewId: string, payload: SubmitFeedbackPayload): Promise<boolean> => {
      if (interviewId.startsWith('app-')) {
        toast.error('Candidate has not completed an interview yet')
        return false
      }
      try {
        const res = await interviewsApi.submitFeedback(interviewId, payload)
        if (res.success) {
          toast.success(res.message || 'Feedback submitted successfully')
          await fetchData(true)
          closeModal()
          return true
        } else {
          toast.error(res.message || 'Failed to submit feedback')
          return false
        }
      } catch (err) {
        console.error('Failed to submit feedback:', err)
        toast.error('An error occurred while submitting feedback')
        return false
      }
    },
    [fetchData, closeModal],
  )

  const updateApplicationStatus = useCallback(
    async (applicationId: string, status: string): Promise<boolean> => {
      // 1. Optimistic UI update for immediate reflection
      setInterviews((prev) => {
        if (status === 'CLOSED') {
          return prev.filter((item) => (item.application?.id || item.applicationId) !== applicationId)
        }
        return prev.map((item) => {
          const appId = item.application?.id || item.applicationId
          if (appId === applicationId) {
            return {
              ...item,
              application: item.application
                ? {
                    ...item.application,
                    status:
                      status as import('@/components/dashboard/applications/ApplicationsHub').ApplicationStatus,
                  }
                : item.application,
            }
          }
          return item
        })
      })

      if (status === 'CLOSED') {
        setDrawerCandidate((curr) => {
          if (curr && (curr.application?.id === applicationId || curr.applicationId === applicationId)) {
            return null
          }
          return curr
        })
      }

      try {
        const res = await interviewsApi.updateApplicationStatus(applicationId, status)
        if (res.success) {
          toast.success('Candidate status updated successfully')
          await fetchData(true)
          return true
        } else {
          toast.error(res.message || 'Failed to update candidate status')
          await fetchData(true)
          return false
        }
      } catch (err) {
        console.error('Failed to update status:', err)
        toast.error('An error occurred while updating status')
        await fetchData(true)
        return false
      }
    },
    [fetchData],
  )

  // Backend invites require a target batch; fall back to the job's latest group
  const resolveLatestGroupName = useCallback(async (jobId: string): Promise<string> => {
    const groupsRes = await interviewsApi.getSlotGroups(jobId)
    const latest = groupsRes.data?.[0]?.groupName
    if (!latest) {
      throw new Error(
        'No slot batch exists for this job yet. Generate interview slots before inviting candidates.',
      )
    }
    return latest
  }, [])

  const sendInvitations = useCallback(
    async (jobId: string, applicationIds: string[], groupName?: string): Promise<boolean> => {
      setIsDispatching(true)
      try {
        const resolvedGroup = groupName || (await resolveLatestGroupName(jobId))
        const res = await interviewsApi.inviteCandidates({ jobId, applicationIds, groupName: resolvedGroup })
        if (res.success) {
          toast.success(`Successfully dispatched ${res.data?.invitationsSent || 0} invitation(s)`)
          clearSelection()
          await fetchData(true)
          closeModal()
          return true
        } else {
          toast.error(res.message || 'Failed to send invitations')
          return false
        }
      } catch (err) {
        console.error('Failed to send invitations:', err)
        toast.error(err instanceof Error ? err.message : 'An error occurred while sending invitations')
        return false
      } finally {
        setIsDispatching(false)
      }
    },
    [fetchData, clearSelection, closeModal, resolveLatestGroupName],
  )

  const sendOutcomes = useCallback(
    async (payload: SendBulkOutcomeEmailsPayload): Promise<boolean> => {
      setIsDispatching(true)
      try {
        const res = await interviewsApi.sendOutcomeEmails(payload)
        if (res.success) {
          const hired = res.data?.sentHiredCount || 0
          const rejected = res.data?.sentRejectedCount || 0
          toast.success(`Dispatched ${hired} acceptance and ${rejected} rejection email(s)`)
          clearSelection()
          await fetchData(true)
          closeModal()
          return true
        } else {
          toast.error(res.message || 'Failed to send outcome emails')
          return false
        }
      } catch (err) {
        console.error('Failed to send outcomes:', err)
        toast.error('An error occurred while sending outcome emails')
        return false
      } finally {
        setIsDispatching(false)
      }
    },
    [fetchData, clearSelection, closeModal],
  )

  // Direct Send from Floating Bulk Action Bar (Bypasses Modal)
  const directSendInvitations = useCallback(async (): Promise<boolean> => {
    if (invitations.length === 0) return false
    setIsDispatching(true)
    try {
      const jobsMap = new Map<string, string[]>()
      invitations.forEach((item) => {
        const jobId = item.application?.job?.id
        const appId = item.application?.id || item.applicationId
        if (jobId && appId) {
          if (!jobsMap.has(jobId)) jobsMap.set(jobId, [])
          jobsMap.get(jobId)!.push(appId)
        }
      })

      let totalSent = 0
      for (const [jobId, appIds] of jobsMap.entries()) {
        const resolvedGroup = await resolveLatestGroupName(jobId)
        const res = await interviewsApi.inviteCandidates({
          jobId,
          applicationIds: appIds,
          groupName: resolvedGroup,
        })
        if (res.success) {
          totalSent += res.data?.invitationsSent || appIds.length
        } else {
          throw new Error(res.message || 'Failed to send invitations')
        }
      }

      toast.success(`Successfully dispatched ${totalSent} invitation(s)`)
      clearSelection()
      await fetchData(true)
      return true
    } catch (err) {
      console.error('Failed to send direct invitations:', err)
      toast.error(err instanceof Error ? err.message : 'An error occurred while sending invitations')
      return false
    } finally {
      setIsDispatching(false)
    }
  }, [invitations, clearSelection, fetchData, resolveLatestGroupName])

  const directSendOutcomes = useCallback(async (): Promise<boolean> => {
    if (outcomes.length === 0) return false
    setIsDispatching(true)
    try {
      const jobsMap = new Map<string, string[]>()
      outcomes.forEach((item) => {
        const jobId = item.application?.job?.id
        const appId = item.application?.id || item.applicationId
        if (jobId && appId) {
          if (!jobsMap.has(jobId)) jobsMap.set(jobId, [])
          jobsMap.get(jobId)!.push(appId)
        }
      })

      let totalHired = 0
      let totalRejected = 0
      for (const [jobId, appIds] of jobsMap.entries()) {
        const res = await interviewsApi.sendOutcomeEmails({ jobId, applicationIds: appIds })
        if (res.success) {
          totalHired += res.data?.sentHiredCount || 0
          totalRejected += res.data?.sentRejectedCount || 0
        }
      }

      toast.success(`Dispatched ${totalHired} acceptance and ${totalRejected} rejection email(s)`)
      clearSelection()
      await fetchData(true)
      return true
    } catch (err) {
      console.error('Failed to send direct outcomes:', err)
      toast.error('An error occurred while sending outcome emails')
      return false
    } finally {
      setIsDispatching(false)
    }
  }, [outcomes, clearSelection, fetchData])

  // Delete Interview
  const deleteInterview = useCallback(
    async (interviewId: string): Promise<boolean> => {
      if (interviewId.startsWith('app-')) {
        toast.error('Candidate has no scheduled interview to delete')
        return false
      }
      // Optimistic delete
      setInterviews((prev) => prev.filter((item) => item.id !== interviewId))
      setSelectedIds((prev) => prev.filter((id) => id !== interviewId))
      if (drawerCandidate?.id === interviewId) {
        setDrawerCandidate(null)
      }

      try {
        const res = await interviewsApi.deleteInterview(interviewId)
        if (res.success) {
          toast.success('Interview deleted successfully')
          await fetchData(true)
          return true
        } else {
          toast.error(res.message || 'Failed to delete interview')
          await fetchData(true)
          return false
        }
      } catch (err) {
        console.error('Failed to delete interview:', err)
        toast.error('An error occurred while deleting interview')
        await fetchData(true)
        return false
      }
    },
    [drawerCandidate, fetchData],
  )

  const value = useMemo<InterviewContextValue>(
    () => ({
      interviews,
      jobs,
      selectedIds,
      search,
      filterTab,
      selectedJobFilter,
      selectedDateFilter,
      page,
      limit,
      sortOrder,
      displayedCount,
      hasMore,
      isLoading,
      isDispatching,
      filteredInterviews,
      paginatedInterviews,
      stats,
      paginationMeta,
      selectedInterviewsList,
      invitations,
      outcomes,
      activeModal,
      modalTarget,
      drawerCandidate,
      openModal,
      closeModal,
      openDrawer,
      closeDrawer,
      setSearch,
      setFilterTab,
      setSelectedJobFilter,
      setDateFilter,
      setSortOrder,
      setPage,
      setLimit,
      loadMore,
      toggleSelect,
      selectAll,
      clearSelection,
      fetchData,
      rescheduleCandidate,
      submitFeedback,
      updateApplicationStatus,
      sendInvitations,
      sendOutcomes,
      directSendInvitations,
      directSendOutcomes,
      deleteInterview,
    }),
    [
      interviews,
      jobs,
      selectedIds,
      search,
      filterTab,
      selectedJobFilter,
      selectedDateFilter,
      sortOrder,
      displayedCount,
      hasMore,
      page,
      limit,
      isLoading,
      isDispatching,
      filteredInterviews,
      paginatedInterviews,
      stats,
      paginationMeta,
      selectedInterviewsList,
      invitations,
      outcomes,
      activeModal,
      modalTarget,
      drawerCandidate,
      openModal,
      closeModal,
      openDrawer,
      closeDrawer,
      setSearch,
      setFilterTab,
      setSelectedJobFilter,
      setSortOrder,
      setPage,
      setLimit,
      loadMore,
      toggleSelect,
      selectAll,
      clearSelection,
      fetchData,
      rescheduleCandidate,
      submitFeedback,
      updateApplicationStatus,
      sendInvitations,
      sendOutcomes,
      directSendInvitations,
      directSendOutcomes,
      deleteInterview,
    ],
  )

  return <InterviewContext.Provider value={value}>{children}</InterviewContext.Provider>
}
