'use client'

import React from 'react'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import {
  InterviewProvider,
  useInterviewContext,
  type InitialInterviewData,
} from '@/contexts/InterviewContext'
import { BulkActionBar } from './BulkActionBar'
import { CreateSlotsModal } from './CreateSlotsModal'
import { FeedbackModal } from './FeedbackModal'
import { InterviewFilters } from './InterviewFilters'
import { InterviewHeader } from './InterviewHeader'
import { InterviewPagination } from './InterviewPagination'
import { InterviewSkeleton } from './InterviewSkeleton'
import { InterviewStats } from './InterviewStats'
import { InterviewTable } from './InterviewTable'
import { RescheduleModal } from './RescheduleModal'
import { SendEmailModal } from './SendEmailModal'
import { SlotsViewerModal } from './SlotsViewerModal'
import { CandidateDrawer } from './CandidateDrawer'

// Consumes InterviewContext and renders the modular view tree.
function InterviewHubContent() {
  const {
    jobs,
    isLoading,
    interviews,
    activeModal,
    modalTarget,
    closeModal,
    fetchData,
    clearSelection,
    selectedInterviewsList,
  } = useInterviewContext()

  // Render comprehensive layout skeleton during initial data fetch
  if (isLoading && interviews.length === 0) {
    return <InterviewSkeleton />
  }

  return (
    <div className="space-y-4">
      {/* 1. Header & Quick Actions */}
      <InterviewHeader />

      {/* 2. KPI Metric Summary Cards */}
      <InterviewStats />

      {/* 3. Search Bar, Job Dropdown & Stage Filter Tabs */}
      <InterviewFilters />

      {/* 4. Candidate Data Table Grid */}
      <InterviewTable />

      {/* 5. Server-Side & Client Pagination Controls */}
      <InterviewPagination />

      {/* 6. Floating Action Bar for Selected Candidates */}
      <BulkActionBar />

      {/* 7. Modal Dialogs */}
      <CreateSlotsModal
        isOpen={activeModal === 'CREATE_SLOTS'}
        onClose={closeModal}
        jobs={jobs}
        onSuccess={() => {
          closeModal()
          fetchData(true)
        }}
      />

      <SlotsViewerModal isOpen={activeModal === 'SLOTS_VIEWER'} onClose={closeModal} jobs={jobs} />

      <SendEmailModal
        isOpen={activeModal === 'SEND_EMAIL'}
        onClose={closeModal}
        selectedInterviews={selectedInterviewsList}
        onSuccess={() => {
          closeModal()
          clearSelection()
          fetchData(true)
        }}
      />

      {modalTarget && (
        <>
          <RescheduleModal
            isOpen={activeModal === 'RESCHEDULE'}
            onClose={closeModal}
            interview={modalTarget}
            onSuccess={() => {
              closeModal()
              fetchData(true)
            }}
          />

          <FeedbackModal
            isOpen={activeModal === 'FEEDBACK'}
            onClose={closeModal}
            interview={modalTarget}
            onSuccess={() => {
              closeModal()
              fetchData(true)
            }}
          />
        </>
      )}

      {/* 8. Candidate Slide-Over Drawer */}
      <CandidateDrawer />
    </div>
  )
}

// Orchestrator: wraps InterviewHubContent with RoleGuard and InterviewProvider.
export function InterviewHub({ initialData }: { initialData?: InitialInterviewData }) {
  return (
    <RoleGuard permissions={['interview.read']} fallback={<InterviewSkeleton />}>
      <InterviewProvider initialData={initialData}>
        <InterviewHubContent />
      </InterviewProvider>
    </RoleGuard>
  )
}
