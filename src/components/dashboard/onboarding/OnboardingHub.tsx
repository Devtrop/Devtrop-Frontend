'use client'

import React, { useEffect, useMemo } from 'react'
import { Users, FileText, CircleArrowDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { OnboardingHeader } from './OnboardingHeader'
import { OnboardingFilters } from './OnboardingFilters'
import { OnboardingTableRow } from './OnboardingTableRow'
import { BulkActionBar } from './BulkActionBar'
import { CandidateDrawer } from './CandidateDrawer'
import { SendOfferModal } from './SendOfferModal'
import { SendOrientationModal } from './SendOrientationModal'
import { SendRejectionModal } from './SendRejectionModal'
import { OnboardingSkeleton } from './OnboardingSkeleton'
import { RequestResubmissionModal } from './RequestResubmissionModal'
import { DefaultTemplatesModal } from './DefaultTemplatesModal'
import { EmailStatusBadge } from '@/components/dashboard/common/EmailStatusBadge'
import { ONBOARDING_STAGE_CONFIGS, getInitials } from './constants'
import {
  OnboardingProvider,
  useOnboardingContext,
  type InitialOnboardingData,
} from '@/contexts/OnboardingContext'

function OnboardingHubContent() {
  const {
    candidates,
    allCandidates,
    loading,
    search,
    activeTab,
    selectedJobId,
    selectedCandidateIds,
    selectedCandidatesList,
    sortOrder,
    displayedCount,
    hasMore,
    totalCount,
    counts,
    uniqueJobs,
    offerPendingCandidates,
    docsSubmittedCandidates,
    rejectedCandidates,
    activeModal,
    modalCandidate,
    drawerCandidate,
    viewerCandidate,
    fetchCandidates,
    setSearch,
    setActiveTab,
    setSelectedJobId,
    setSortOrder,
    loadMore,
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
    lastViewedCandidateId,
    savedScrollY,
  } = useOnboardingContext()

  // Scroll to the candidate row/card viewed in fullscreen doc page
  useEffect(() => {
    if (!lastViewedCandidateId || loading || candidates.length === 0) return

    const timer = setTimeout(() => {
      const desktopRow = document.getElementById(`candidate-row-${lastViewedCandidateId}`)
      const mobileCard = document.getElementById(`candidate-card-${lastViewedCandidateId}`)
      const targetEl = desktopRow || mobileCard

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else if (savedScrollY > 0) {
        window.scrollTo({ top: savedScrollY, behavior: 'smooth' })
      }
    }, 120)

    return () => clearTimeout(timer)
  }, [lastViewedCandidateId, loading, candidates.length, savedScrollY])

  const isAllSelected = candidates.length > 0 && selectedCandidateIds.length === candidates.length

  // Candidates passed to modals (single vs bulk)
  const offerModalCandidates = useMemo(() => {
    if (activeModal === 'SINGLE_OFFER' && modalCandidate) return [modalCandidate]
    if (offerPendingCandidates.length > 0) return offerPendingCandidates
    if (selectedCandidatesList.length > 0) return selectedCandidatesList
    const pendingOrSent = allCandidates.filter(
      (c) => c.status === 'OFFER_PENDING' || c.status === 'OFFER_SENT',
    )
    return pendingOrSent.length > 0 ? pendingOrSent : allCandidates
  }, [activeModal, modalCandidate, offerPendingCandidates, selectedCandidatesList, allCandidates])

  const orientationModalCandidates = useMemo(() => {
    if (activeModal === 'SINGLE_ORIENTATION' && modalCandidate) return [modalCandidate]
    if (docsSubmittedCandidates.length > 0) return docsSubmittedCandidates
    if (selectedCandidatesList.length > 0) return selectedCandidatesList
    const submittedOrHired = allCandidates.filter(
      (c) => c.status === 'DOCS_SUBMITTED' || c.status === 'HIRED',
    )
    return submittedOrHired.length > 0 ? submittedOrHired : allCandidates
  }, [activeModal, modalCandidate, docsSubmittedCandidates, selectedCandidatesList, allCandidates])

  const rejectionModalCandidates = useMemo(() => {
    if (activeModal === 'SINGLE_REJECTION' && modalCandidate) return [modalCandidate]
    if (rejectedCandidates.length > 0) return rejectedCandidates
    if (selectedCandidatesList.length > 0) return selectedCandidatesList
    return allCandidates
  }, [activeModal, modalCandidate, rejectedCandidates, selectedCandidatesList, allCandidates])

  if (loading && candidates.length === 0) {
    return <OnboardingSkeleton />
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full pb-24">
      {/* 1. Header with Actions */}
      <OnboardingHeader
        onOpenTemplates={() => openModal('TEMPLATES')}
        onOpenBulkOffer={() => openModal('BULK_OFFER')}
        onOpenBulkOrientation={() => openModal('BULK_ORIENTATION')}
      />

      {/* 2. Filters & Tabs Bar */}
      <OnboardingFilters
        search={search}
        onSearchChange={setSearch}
        selectedJobId={selectedJobId}
        onJobChange={setSelectedJobId}
        jobs={uniqueJobs}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        loading={loading}
        onRefresh={() => fetchCandidates(true)}
      />

      {/* 3. Main Content: Mobile Card View (< md) + Desktop Table (>= md) */}
      <div className="rounded-none border border-border/80 bg-card/40 backdrop-blur-sm overflow-hidden">
        {loading && candidates.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <div className="flex flex-col items-center justify-center gap-2.5">
              <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-xs">Loading candidates...</span>
            </div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto p-4">
              <Users className="size-10 text-muted-foreground/40" />
              <p className="font-semibold text-foreground text-sm">No candidates found</p>
              <p className="text-xs text-muted-foreground">
                {search || selectedJobId !== 'ALL'
                  ? 'Try adjusting your search or filters.'
                  : 'Candidates transitioning through the onboarding pipeline will appear here.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Candidate Card View (< md) */}
            <div className="md:hidden divide-y divide-border/60">
              {candidates.map((candidate) => {
                const statusConfig = ONBOARDING_STAGE_CONFIGS[candidate.status] || {
                  label: candidate.status,
                  color: 'text-muted-foreground bg-muted/20 border-border',
                  dotColor: 'bg-muted-foreground',
                }
                const isSelected = selectedCandidateIds.includes(candidate.id)
                const documentsCount = candidate.documents?.length || 0

                return (
                  <div
                    key={candidate.id}
                    id={`candidate-card-${candidate.id}`}
                    onClick={() => openDrawer(candidate)}
                    className={cn(
                      'p-3.5 space-y-2.5 transition-all cursor-pointer',
                      isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/40',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(candidate.id)}
                          onClick={(event) => event.stopPropagation()}
                          aria-label={`Select ${candidate.applicant?.name}`}
                          className="shrink-0"
                        />
                        <div className="size-8 rounded-none bg-primary/10 border border-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                          {getInitials(candidate.applicant?.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-foreground text-xs truncate block">
                            {candidate.applicant?.name || 'Applicant'}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate block font-medium">
                            {candidate.job?.title || 'Open Position'}
                          </span>
                        </div>
                      </div>

                      {/* Equal-width Status Pill with Left-Anchored Dot */}
                      <div
                        className={`inline-flex items-center justify-between w-[130px] px-2.5 py-1 rounded-full text-[11px] font-medium border select-none shrink-0 ${statusConfig.color}`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`size-1.5 rounded-full ${statusConfig.dotColor} shrink-0`}
                          />
                          <span className="truncate">{statusConfig.label}</span>
                        </div>
                        <span className="size-2.5 shrink-0 opacity-0 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40 text-muted-foreground">
                      <div
                        className="flex items-center gap-1.5"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {documentsCount === 0 ? (
                          <span className="text-[11px] text-muted-foreground/60 italic">
                            No files
                          </span>
                        ) : (
                          <button
                            onClick={() => openViewer(candidate)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[11px] font-medium bg-accent-soft text-accent border border-accent cursor-pointer"
                          >
                            <FileText className="size-3" />
                            <span>
                              {documentsCount} File{documentsCount > 1 ? 's' : ''}
                            </span>
                          </button>
                        )}
                        {candidate.docsVerifiedAt && (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-accent border-accent bg-accent-soft px-1.5 py-0"
                          >
                            Verified
                          </Badge>
                        )}
                      </div>

                      <EmailStatusBadge log={candidate.emailLogs?.[0]} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop & Tablet Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="w-8 py-3.5 pl-3 pr-1 text-center">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={selectAll}
                        aria-label="Select all candidates"
                        className="cursor-pointer"
                      />
                    </th>
                    <th className="w-10 py-3.5 px-1 text-center font-mono text-[11px] font-semibold text-muted-foreground">
                      SL
                    </th>
                    <th className="p-3.5 min-w-[200px]">Candidate</th>
                    <th className="p-3.5 min-w-[155px]">Stage</th>
                    <th className="p-3.5 min-w-[150px]">Documents</th>
                    <th className="p-3.5 min-w-[130px]">Email Status</th>
                    <th className="p-3.5 text-right w-14">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {candidates.map((candidate, index) => (
                    <OnboardingTableRow
                      key={candidate.id}
                      candidate={candidate}
                      serialNumber={index + 1}
                      isSelected={selectedCandidateIds.includes(candidate.id)}
                      onToggleSelect={toggleSelect}
                      onOpenDrawer={openDrawer}
                      onOpenViewer={openViewer}
                      onSendOffer={(cand) => openModal('SINGLE_OFFER', cand)}
                      onSendOrientation={(cand) => openModal('SINGLE_ORIENTATION', cand)}
                      onSendRejection={(cand) => openModal('SINGLE_REJECTION', cand)}
                      onUpdateStatus={updateCandidateStatus}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Table Footer / Cursor Load More */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-border/60 text-xs text-muted-foreground bg-muted/20">
            <div>
              <span>
                Showing{' '}
                <span className="font-semibold text-foreground">
                  {Math.min(displayedCount, totalCount)}
                </span>{' '}
                of <span className="font-semibold text-foreground">{totalCount}</span> candidates
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hasMore ? (
                <button
                  type="button"
                  onClick={loadMore}
                  className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <span>Load more</span>
                  <CircleArrowDown className="size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              ) : (
                <span className="text-xs text-muted-foreground/70 font-medium">
                  All candidates loaded
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedCandidateIds.length}
        offerPendingCount={offerPendingCandidates.length}
        docsSubmittedCount={docsSubmittedCandidates.length}
        rejectedCount={rejectedCandidates.length}
        onSendOffer={() => openModal('BULK_OFFER')}
        onSendOrientation={() => openModal('BULK_ORIENTATION')}
        onSendRejection={() => openModal('BULK_REJECTION')}
        onClear={clearSelection}
      />

      {/* 5. Candidate Slide-Over Drawer */}
      <CandidateDrawer
        candidate={drawerCandidate}
        open={Boolean(drawerCandidate)}
        onOpenChange={(openState) => !openState && closeDrawer()}
        onOpenViewer={openViewer}
        onSendOffer={(cand) => openModal('SINGLE_OFFER', cand)}
        onSendOrientation={(cand) => openModal('SINGLE_ORIENTATION', cand)}
        onSendRejection={(cand) => openModal('SINGLE_REJECTION', cand)}
        onRequestResubmission={(cand) => openModal('RESUBMISSION', cand)}
        onUpdateStatus={updateCandidateStatus}
      />

      {/* 7. Send Offer Modal */}
      <SendOfferModal
        candidates={offerModalCandidates}
        allCandidates={allCandidates}
        open={activeModal === 'BULK_OFFER' || activeModal === 'SINGLE_OFFER'}
        onOpenChange={(openState) => !openState && closeModal()}
        onSuccess={() => {
          clearSelection()
          closeModal()
          fetchCandidates(true)
        }}
      />

      {/* 8. Send Orientation Modal */}
      <SendOrientationModal
        candidates={orientationModalCandidates}
        allCandidates={allCandidates}
        open={activeModal === 'BULK_ORIENTATION' || activeModal === 'SINGLE_ORIENTATION'}
        onOpenChange={(openState) => !openState && closeModal()}
        onSuccess={() => {
          clearSelection()
          closeModal()
          fetchCandidates(true)
        }}
      />

      {/* 9. Send Rejection Modal (Option B) */}
      <SendRejectionModal
        candidates={rejectionModalCandidates}
        allCandidates={allCandidates}
        open={activeModal === 'BULK_REJECTION' || activeModal === 'SINGLE_REJECTION'}
        onOpenChange={(openState) => !openState && closeModal()}
        onSuccess={() => {
          clearSelection()
          closeModal()
          fetchCandidates(true)
        }}
      />

      {/* 10. Request Document Resubmission Modal */}
      <RequestResubmissionModal
        candidate={modalCandidate || drawerCandidate || viewerCandidate}
        open={activeModal === 'RESUBMISSION'}
        onOpenChange={(openState) => !openState && closeModal()}
        onSuccess={() => {
          closeModal()
          fetchCandidates(true)
        }}
      />

      {/* 11. Default Templates Modal */}
      <DefaultTemplatesModal
        open={activeModal === 'TEMPLATES'}
        onOpenChange={(openState) => !openState && closeModal()}
      />
    </div>
  )
}

export function OnboardingHub({ initialData }: { initialData?: InitialOnboardingData }) {
  return (
    <OnboardingProvider initialData={initialData}>
      <OnboardingHubContent />
    </OnboardingProvider>
  )
}
