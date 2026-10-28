'use client'

import { onboardingCache } from '@/lib/onboarding-cache'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'
import { getOnboardingCandidates, updateCandidateStatus as apiUpdateStatus } from '@/lib/onboarding'
import type { OnboardingCandidate } from '@/lib/onboarding'
import type {
  OnboardingCounts,
  OnboardingModalType,
  OnboardingSortOption,
  OnboardingTabKey,
  UniqueJobOption,
} from '@/components/dashboard/onboarding/types'

export interface OnboardingContextValue {
  // State
  candidates: OnboardingCandidate[]
  allCandidates: OnboardingCandidate[]
  filteredCandidates: OnboardingCandidate[]
  loading: boolean
  search: string
  activeTab: OnboardingTabKey
  selectedJobId: string
  selectedCandidateIds: string[]
  sortOrder: OnboardingSortOption
  displayedCount: number
  hasMore: boolean
  page: number
  totalPages: number
  totalCount: number

  // Computed
  counts: OnboardingCounts
  uniqueJobs: UniqueJobOption[]
  selectedCandidatesList: OnboardingCandidate[]
  offerPendingCandidates: OnboardingCandidate[]
  docsSubmittedCandidates: OnboardingCandidate[]
  rejectedCandidates: OnboardingCandidate[]

  // Modals & Drawer
  activeModal: OnboardingModalType
  modalCandidate: OnboardingCandidate | null
  drawerCandidate: OnboardingCandidate | null
  viewerCandidate: OnboardingCandidate | null

  // Actions
  fetchCandidates: (forceRefresh?: boolean) => Promise<void>
  setSearch: (term: string) => void
  setActiveTab: (tab: OnboardingTabKey) => void
  setSelectedJobId: (jobId: string) => void
  setSortOrder: (sort: OnboardingSortOption) => void
  loadMore: () => void
  setPage: (pageNumber: number) => void
  toggleSelect: (candidateId: string) => void
  selectAll: () => void
  clearSelection: () => void
  openDrawer: (candidate: OnboardingCandidate) => void
  closeDrawer: () => void
  openViewer: (candidate: OnboardingCandidate) => void
  closeViewer: () => void
  openModal: (modalType: OnboardingModalType, candidate?: OnboardingCandidate) => void
  closeModal: () => void
  updateCandidateStatus: (applicationId: string, status: string) => Promise<void>
  lastViewedCandidateId: string | null
  setLastViewedCandidateId: (id: string | null) => void
  savedScrollY: number
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function useOnboardingContext(): OnboardingContextValue {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider')
  }
  return context
}

export interface InitialOnboardingData {
  candidates?: OnboardingCandidate[]
  totalCount?: number
  totalPages?: number
  page?: number
}

export interface OnboardingPersistentState {
  rawCandidates: OnboardingCandidate[]
  displayedCount: number
  search: string
  activeTab: OnboardingTabKey
  selectedJobId: string
  sortOrder: OnboardingSortOption
  selectedCandidateIds: string[]
  lastViewedCandidateId: string | null
  scrollY: number
  cachedAt: number
}

const ONBOARDING_CACHE_KEY = 'dt_onboarding_nav_cache'
let globalOnboardingCache: OnboardingPersistentState | null = null

function getInitialOnboardingCache(): OnboardingPersistentState | null {
  if (onboardingCache.hasData()) {
    const mem = onboardingCache.getCandidates()!
    if (globalOnboardingCache) {
      globalOnboardingCache.rawCandidates = mem
      return globalOnboardingCache
    }
    return {
      rawCandidates: mem,
      displayedCount: mem.length,
      search: '',
      activeTab: 'ALL',
      selectedJobId: 'ALL',
      sortOrder: 'recent_desc',
      selectedCandidateIds: [],
      lastViewedCandidateId: null,
      scrollY: 0,
      cachedAt: Date.now(),
    }
  }
  if (globalOnboardingCache) {
    return globalOnboardingCache
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(ONBOARDING_CACHE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as OnboardingPersistentState
        parsed.selectedCandidateIds = []
        // Valid for 60 minutes
        if (Date.now() - parsed.cachedAt < 60 * 60 * 1000) {
          globalOnboardingCache = parsed
          return parsed
        }
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
  }
  return null
}

function saveOnboardingCache(state: OnboardingPersistentState) {
  globalOnboardingCache = state
  if (state.rawCandidates && state.rawCandidates.length > 0) {
    onboardingCache.setCandidates(state.rawCandidates)
  }
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(ONBOARDING_CACHE_KEY, JSON.stringify(state))
    } catch {
      // Storage quota or disabled
    }
  }
}

function getCandidateActivityTimestamp(c: OnboardingCandidate): number {
  const dateStr =
    c.docsSubmittedAt ||
    c.docsVerifiedAt ||
    c.offerSentAt ||
    c.orientationSentAt ||
    c.appliedAt ||
    null
  return dateStr ? new Date(dateStr).getTime() : 0
}

export function OnboardingProvider({
  children,
  initialData,
}: {
  children: React.ReactNode
  initialData?: InitialOnboardingData
}) {
  const router = useRouter()

  // Read any existing persistent navigation cache
  const initialCache = useMemo(() => getInitialOnboardingCache(), [])

  // 1. Core State
  const hasUsableInitialData = Boolean(
    initialData && initialData.candidates && initialData.candidates.length > 0,
  )

  const [rawCandidates, setRawCandidates] = useState<OnboardingCandidate[]>(() => {
    const mem = onboardingCache.getCandidates()
    if (mem && mem.length > 0) return mem
    if (initialCache?.rawCandidates && initialCache.rawCandidates.length > 0) {
      onboardingCache.setCandidates(initialCache.rawCandidates)
      return initialCache.rawCandidates
    }
    return initialData?.candidates || []
  })

  const [loading, setLoading] = useState(() => {
    if (onboardingCache.hasData()) return false
    if (initialCache?.rawCandidates && initialCache.rawCandidates.length > 0) {
      return false
    }
    return !hasUsableInitialData
  })

  const [search, setSearchState] = useState(() => initialCache?.search ?? '')
  const [activeTab, setActiveTabState] = useState<OnboardingTabKey>(
    () => initialCache?.activeTab ?? 'ALL',
  )
  const [selectedJobId, setSelectedJobIdState] = useState(
    () => initialCache?.selectedJobId ?? 'ALL',
  )
  const [sortOrder, setSortOrderState] = useState<OnboardingSortOption>(
    () => initialCache?.sortOrder ?? 'recent_desc',
  )
  const [displayedCount, setDisplayedCount] = useState(() => initialCache?.displayedCount ?? 20)
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const returnId = sessionStorage.getItem('dt_onboarding_return_from_viewer')
      if (returnId) {
        sessionStorage.removeItem('dt_onboarding_return_from_viewer')
        return [returnId]
      }
    }
    return []
  })
  const [lastViewedCandidateId, setLastViewedCandidateId] = useState<string | null>(
    () => initialCache?.lastViewedCandidateId ?? null,
  )
  const [savedScrollY, setSavedScrollY] = useState(() => initialCache?.scrollY ?? 0)
  const [page, setPageState] = useState(initialData?.page || 1)

  // 2. Modals & Drawer State
  const [activeModal, setActiveModal] = useState<OnboardingModalType>(null)
  const [modalCandidate, setModalCandidate] = useState<OnboardingCandidate | null>(null)
  const [drawerCandidate, setDrawerCandidate] = useState<OnboardingCandidate | null>(null)
  const [viewerCandidate, setViewerCandidate] = useState<OnboardingCandidate | null>(null)

  // AbortController ref to prevent duplicate and stale API requests
  const abortControllerRef = useRef<AbortController | null>(null)
  const isFetchingRef = useRef(false)
  const hasRestoredCacheRef = useRef(false)

  // Client-side cache restoration on mount (preserves 100+ candidates and navigation state)
  useEffect(() => {
    if (hasRestoredCacheRef.current) return
    hasRestoredCacheRef.current = true

    const cache = getInitialOnboardingCache()
    if (!cache) return

    if (cache.rawCandidates && cache.rawCandidates.length > 0) {
      setRawCandidates(cache.rawCandidates)
    }
    if (cache.search) setSearchState(cache.search)
    if (cache.activeTab) setActiveTabState(cache.activeTab)
    if (cache.selectedJobId) setSelectedJobIdState(cache.selectedJobId)
    if (cache.sortOrder) setSortOrderState(cache.sortOrder)
    if (cache.displayedCount) setDisplayedCount(cache.displayedCount)
    if (cache.scrollY) {
      setSavedScrollY(cache.scrollY)
    }

    // Only restore selection if one-time returnFromViewer flag is present
    const returnFromViewer =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('dt_onboarding_return_from_viewer')
        : null

    if (returnFromViewer) {
      setLastViewedCandidateId(returnFromViewer)
      setSelectedCandidateIds([returnFromViewer])
      sessionStorage.removeItem('dt_onboarding_return_from_viewer')
    }
  }, [])

  // 3. Central Data Fetcher (fetches full batch for instantaneous in-memory client filtering)
  const fetchCandidates = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && onboardingCache.hasData()) {
      return
    }
    if (isFetchingRef.current && !forceRefresh) {
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    isFetchingRef.current = true
    setRawCandidates((current) => {
      if (current.length === 0) {
        setLoading(true)
      }
      return current
    })

    try {
      const [activeResponse, rejectedResponse] = await Promise.all([
        getOnboardingCandidates({
          page: 1,
          limit: 250,
        }),
        getOnboardingCandidates({
          page: 1,
          limit: 250,
          status: 'REJECTED',
        }).catch(() => ({
          data: [],
          meta: { total: 0, page: 1, limit: 250, totalPages: 1 },
        })),
      ])

      const mergedMap = new Map<string, OnboardingCandidate>()
      activeResponse.data.forEach((cand) => mergedMap.set(cand.id, cand))
      rejectedResponse.data.forEach((cand) => mergedMap.set(cand.id, cand))

      const mergedList = Array.from(mergedMap.values())
      setRawCandidates(mergedList)
      onboardingCache.setCandidates(mergedList)
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to load candidates'
      console.error('Error fetching onboarding candidates:', error)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  // Auto-fetch when initial data is absent and no cached data exists
  const hasInitializedRef = useRef(
    Boolean(
      hasUsableInitialData ||
      (initialCache?.rawCandidates && initialCache.rawCandidates.length > 0),
    ),
  )

  useEffect(() => {
    if (onboardingCache.hasData() || rawCandidates.length > 0 || hasUsableInitialData) {
      return
    }

    let isSubscribed = true

    const load = async () => {
      if (isSubscribed) {
        await fetchCandidates()
      }
    }

    void load()

    return () => {
      isSubscribed = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchCandidates, rawCandidates.length, hasUsableInitialData])

  // 4. Instant In-Memory Filter Pipeline (Matches Interview module speed)
  const filteredCandidates = useMemo(() => {
    return rawCandidates.filter((candidate) => {
      // 1. Tab Status Filter
      if (activeTab !== 'ALL' && candidate.status !== activeTab) {
        return false
      }

      // 2. Job Position Filter
      if (selectedJobId !== 'ALL' && candidate.job?.id !== selectedJobId) {
        return false
      }

      // 3. Instant Search Query Filter
      if (search.trim()) {
        const q = search.toLowerCase()
        const name = (candidate.applicant?.name || '').toLowerCase()
        const email = (candidate.applicant?.email || '').toLowerCase()
        const phone = (candidate.applicant?.phone || '').toLowerCase()
        const jobTitle = (candidate.job?.title || '').toLowerCase()
        const jobCode = (candidate.job?.jobCode || '').toLowerCase()

        if (
          !name.includes(q) &&
          !email.includes(q) &&
          !phone.includes(q) &&
          !jobTitle.includes(q) &&
          !jobCode.includes(q)
        ) {
          return false
        }
      }

      return true
    })
  }, [rawCandidates, activeTab, selectedJobId, search])

  // 5. Dynamic Sorting Pipeline
  const sortedCandidates = useMemo(() => {
    const list = [...filteredCandidates]
    switch (sortOrder) {
      case 'recent_desc':
        return list.sort(
          (a, b) => getCandidateActivityTimestamp(b) - getCandidateActivityTimestamp(a),
        )
      case 'recent_asc':
        return list.sort(
          (a, b) => getCandidateActivityTimestamp(a) - getCandidateActivityTimestamp(b),
        )
      case 'name_asc':
        return list.sort((a, b) => (a.applicant?.name || '').localeCompare(b.applicant?.name || ''))
      case 'name_desc':
        return list.sort((a, b) => (b.applicant?.name || '').localeCompare(a.applicant?.name || ''))
      case 'applied_desc':
        return list.sort(
          (a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime(),
        )
      default:
        return list
    }
  }, [filteredCandidates, sortOrder])

  // 6. Cursor Batching (Load more)
  const visibleCandidates = useMemo(() => {
    return sortedCandidates.slice(0, displayedCount)
  }, [sortedCandidates, displayedCount])

  const hasMore = displayedCount < sortedCandidates.length

  const loadMore = useCallback(() => {
    setDisplayedCount((prev) => prev + 20)
  }, [])

  // 7. Computed Subsets & Badges
  const counts = useMemo<OnboardingCounts>(() => {
    const computedCounts: OnboardingCounts = {
      all: rawCandidates.length,
      pending: 0,
      sent: 0,
      submitted: 0,
      hired: 0,
      rejected: 0,
    }

    rawCandidates.forEach((candidate) => {
      if (candidate.status === 'OFFER_PENDING') computedCounts.pending++
      else if (candidate.status === 'OFFER_SENT') computedCounts.sent++
      else if (candidate.status === 'DOCS_SUBMITTED') computedCounts.submitted++
      else if (candidate.status === 'HIRED') computedCounts.hired++
      else if (candidate.status === 'REJECTED') computedCounts.rejected++
    })

    return computedCounts
  }, [rawCandidates])

  const uniqueJobs = useMemo<UniqueJobOption[]>(() => {
    const jobMap = new Map<string, string>()
    rawCandidates.forEach((candidate) => {
      if (candidate.job?.id && candidate.job?.title) {
        jobMap.set(candidate.job.id, candidate.job.title)
      }
    })
    return Array.from(jobMap.entries()).map(([jobId, jobTitle]) => ({
      id: jobId,
      title: jobTitle,
    }))
  }, [rawCandidates])

  const selectedCandidatesList = useMemo(() => {
    return rawCandidates.filter((candidate) => selectedCandidateIds.includes(candidate.id))
  }, [rawCandidates, selectedCandidateIds])

  const offerPendingCandidates = useMemo(() => {
    return selectedCandidatesList.filter(
      (candidate) => candidate.status === 'OFFER_PENDING' || candidate.status === 'OFFER_SENT',
    )
  }, [selectedCandidatesList])

  const docsSubmittedCandidates = useMemo(() => {
    return selectedCandidatesList.filter(
      (candidate) => candidate.status === 'DOCS_SUBMITTED' || candidate.status === 'HIRED',
    )
  }, [selectedCandidatesList])

  const rejectedCandidates = useMemo(() => {
    return selectedCandidatesList.filter((candidate) => candidate.status === 'REJECTED')
  }, [selectedCandidatesList])

  // 8. Actions & Filter Setters
  const setSearch = useCallback((term: string) => {
    setSearchState(term)
    setDisplayedCount(20)
  }, [])

  const setActiveTab = useCallback((tab: OnboardingTabKey) => {
    setActiveTabState(tab)
    setDisplayedCount(20)
    setSelectedCandidateIds([])
  }, [])

  const setSelectedJobId = useCallback((jobId: string) => {
    setSelectedJobIdState(jobId)
    setDisplayedCount(20)
  }, [])

  const setSortOrder = useCallback((sort: OnboardingSortOption) => {
    setSortOrderState(sort)
    setDisplayedCount(20)
  }, [])

  const setPage = useCallback((pageNumber: number) => {
    setPageState(pageNumber)
  }, [])

  const toggleSelect = useCallback((candidateId: string) => {
    setSelectedCandidateIds((currentIds) =>
      currentIds.includes(candidateId)
        ? currentIds.filter((id) => id !== candidateId)
        : [...currentIds, candidateId],
    )
  }, [])

  const selectAll = useCallback(() => {
    if (selectedCandidateIds.length === visibleCandidates.length) {
      setSelectedCandidateIds([])
    } else {
      setSelectedCandidateIds(visibleCandidates.map((candidate) => candidate.id))
    }
  }, [visibleCandidates, selectedCandidateIds.length])

  const clearSelection = useCallback(() => {
    setSelectedCandidateIds([])
    setLastViewedCandidateId(null)
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('dt_onboarding_return_from_viewer')
        const stored = sessionStorage.getItem(ONBOARDING_CACHE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          parsed.selectedCandidateIds = []
          parsed.lastViewedCandidateId = null
          sessionStorage.setItem(ONBOARDING_CACHE_KEY, JSON.stringify(parsed))
        }
      } catch {
        // ignore
      }
    }
  }, [])

  const openDrawer = useCallback((candidate: OnboardingCandidate) => {
    setDrawerCandidate(candidate)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerCandidate(null)
  }, [])

  const openViewer = useCallback(
    (candidate: OnboardingCandidate) => {
      setViewerCandidate(candidate)
      setDrawerCandidate(null)
      setLastViewedCandidateId(candidate.id)

      // Only select the active candidate being opened
      const updatedSelectedIds = [candidate.id]
      setSelectedCandidateIds(updatedSelectedIds)

      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('dt_onboarding_return_from_viewer', candidate.id)
        } catch {
          // ignore
        }
      }

      // Ensure displayedCount covers this candidate so they stay visible when coming back
      const candidateIndex = sortedCandidates.findIndex((c) => c.id === candidate.id)
      const targetDisplayed =
        candidateIndex >= 0 ? Math.max(displayedCount, candidateIndex + 1) : displayedCount
      setDisplayedCount(targetDisplayed)

      const scrollY = typeof window !== 'undefined' ? window.scrollY : 0
      setSavedScrollY(scrollY)

      saveOnboardingCache({
        rawCandidates,
        displayedCount: targetDisplayed,
        search,
        activeTab,
        selectedJobId,
        sortOrder,
        selectedCandidateIds: [], // Never persist selection across reloads
        lastViewedCandidateId: candidate.id,
        scrollY,
        cachedAt: Date.now(),
      })

      router.push(`/dashboard/onboarding/${candidate.id}/documents`)
    },
    [
      router,
      sortedCandidates,
      displayedCount,
      rawCandidates,
      search,
      activeTab,
      selectedJobId,
      sortOrder,
    ],
  )

  // Auto-sync navigation cache when filters/state changes
  useEffect(() => {
    if (!hasRestoredCacheRef.current) return
    if (rawCandidates.length > 0) {
      saveOnboardingCache({
        rawCandidates,
        displayedCount,
        search,
        activeTab,
        selectedJobId,
        sortOrder,
        selectedCandidateIds: [], // Never persist selection across reloads
        lastViewedCandidateId,
        scrollY: savedScrollY,
        cachedAt: Date.now(),
      })
    }
  }, [
    rawCandidates,
    displayedCount,
    search,
    activeTab,
    selectedJobId,
    sortOrder,
    selectedCandidateIds,
    lastViewedCandidateId,
    savedScrollY,
  ])

  const closeViewer = useCallback(() => {
    setViewerCandidate(null)
    if (activeModal === 'VIEWER') {
      setActiveModal(null)
    }
  }, [activeModal])

  const openModal = useCallback(
    (modalType: OnboardingModalType, candidate?: OnboardingCandidate) => {
      setActiveModal(modalType)
      setModalCandidate(candidate || null)
    },
    [],
  )

  const closeModal = useCallback(() => {
    setActiveModal(null)
    setModalCandidate(null)
  }, [])

  const updateCandidateStatus = useCallback(
    async (applicationId: string, status: string) => {
      try {
        await apiUpdateStatus(applicationId, status)
        // Optimistically update in-memory candidate status immediately
        setRawCandidates((prev) => {
          let updated
          if (status === 'CLOSED') {
            updated = prev.filter((c) => c.id !== applicationId)
          } else {
            updated = prev.map((c) =>
              c.id === applicationId ? { ...c, status: status as OnboardingCandidate['status'] } : c,
            )
          }
          onboardingCache.setCandidates(updated)
          return updated
        })
        if (status === 'CLOSED') {
          closeDrawer()
        }
        toast.success(status === 'CLOSED' ? 'Application closed successfully' : `Candidate status updated to ${status}`)
        await fetchCandidates(true)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update status'
        toast.error(errorMessage)
        throw error
      }
    },
    [fetchCandidates, closeDrawer],
  )

  const totalCount = filteredCandidates.length
  const totalPages = Math.max(1, Math.ceil(totalCount / 20))

  const contextValue = useMemo<OnboardingContextValue>(
    () => ({
      candidates: visibleCandidates,
      allCandidates: rawCandidates,
      filteredCandidates,
      loading,
      search,
      activeTab,
      selectedJobId,
      selectedCandidateIds,
      sortOrder,
      displayedCount,
      hasMore,
      page,
      totalPages,
      totalCount,
      counts,
      uniqueJobs,
      selectedCandidatesList,
      offerPendingCandidates,
      docsSubmittedCandidates,
      rejectedCandidates,
      activeModal,
      modalCandidate,
      drawerCandidate,
      viewerCandidate,
      lastViewedCandidateId,
      setLastViewedCandidateId,
      savedScrollY,
      fetchCandidates,
      setSearch,
      setActiveTab,
      setSelectedJobId,
      setSortOrder,
      loadMore,
      setPage,
      toggleSelect,
      selectAll,
      clearSelection,
      openDrawer,
      closeDrawer,
      openViewer,
      closeViewer,
      openModal,
      closeModal,
      updateCandidateStatus,
    }),
    [
      visibleCandidates,
      rawCandidates,
      filteredCandidates,
      loading,
      search,
      activeTab,
      selectedJobId,
      selectedCandidateIds,
      sortOrder,
      displayedCount,
      hasMore,
      page,
      totalPages,
      totalCount,
      counts,
      uniqueJobs,
      selectedCandidatesList,
      offerPendingCandidates,
      docsSubmittedCandidates,
      rejectedCandidates,
      activeModal,
      modalCandidate,
      drawerCandidate,
      viewerCandidate,
      lastViewedCandidateId,
      savedScrollY,
      fetchCandidates,
      setSearch,
      setActiveTab,
      setSelectedJobId,
      setSortOrder,
      loadMore,
      setPage,
      toggleSelect,
      selectAll,
      clearSelection,
      openDrawer,
      closeDrawer,
      openViewer,
      closeViewer,
      openModal,
      closeModal,
      updateCandidateStatus,
    ],
  )

  return <OnboardingContext.Provider value={contextValue}>{children}</OnboardingContext.Provider>
}
