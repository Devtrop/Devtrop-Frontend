import type { OnboardingCandidate } from '@/lib/onboarding'

let cachedCandidates: OnboardingCandidate[] | null = null

export const onboardingCache = {
  getCandidates: (): OnboardingCandidate[] | null => cachedCandidates,
  setCandidates: (data: OnboardingCandidate[]) => {
    cachedCandidates = data
  },
  invalidateCandidates: () => {
    cachedCandidates = null
  },
  hasData: (): boolean => Boolean(cachedCandidates && cachedCandidates.length > 0),

  updateCandidate: (id: string, partial: Partial<OnboardingCandidate>) => {
    if (!cachedCandidates) return
    cachedCandidates = cachedCandidates.map((c) => (c.id === id ? { ...c, ...partial } : c))
  },

  removeCandidate: (id: string) => {
    if (!cachedCandidates) return
    cachedCandidates = cachedCandidates.filter((c) => c.id !== id)
  },

  invalidateAll: () => {
    cachedCandidates = null
  },
}
