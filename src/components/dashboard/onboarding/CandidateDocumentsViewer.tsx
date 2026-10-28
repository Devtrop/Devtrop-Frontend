'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  ArrowLeft,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  downloadDocumentFile,
  verifyCandidateDocuments,
  getOnboardingCandidates,
  type OnboardingCandidate,
} from '@/lib/onboarding'
import { getApplicationById } from '@/lib/applications'
import { onboardingCache } from '@/lib/onboarding-cache'
import { BrandLoader } from '@/components/ui/BrandLoader'
import { getAuthToken } from '@/lib/api-config'
import { toast } from '@/lib/toast'
import { RequestResubmissionModal } from './RequestResubmissionModal'
import { SendOrientationModal } from './SendOrientationModal'
import { OnboardingSkeleton } from './OnboardingSkeleton'

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function getDocLabel(docType: string, docIndex = 0, allDocs: Array<{ type: string }> = []): string {
  if (docType === 'NID' && allDocs.length > 0) {
    const nidIndices = allDocs.map((d, i) => (d.type === 'NID' ? i : -1)).filter((i) => i !== -1)
    if (nidIndices.length > 1) {
      const pos = nidIndices.indexOf(docIndex)
      if (pos === 0) return 'National ID (Front)'
      if (pos === 1) return 'National ID (Back)'
      return `National ID (Part ${pos + 1})`
    }
  }

  switch (docType) {
    case 'SIGNED_OFFER_LETTER':
      return 'Signed Offer Letter'
    case 'SIGNED_AGREEMENT':
      return 'Signed Agreement'
    case 'NID':
      return 'National ID / Passport'
    case 'CERTIFICATE':
      return 'Academic / Professional Certificate'
    case 'ELECTRICITY_BILL':
      return 'Proof of Address (Utility Bill)'
    case 'CV':
      return 'CV / Resume'
    default:
      return docType.replace(/_/g, ' ')
  }
}

export function CandidateDocumentsViewer() {
  const params = useParams()
  const router = useRouter()
  const candidateId = params?.id as string

  const [candidate, setCandidate] = useState<OnboardingCandidate | null>(null)
  const [loadingCandidate, setLoadingCandidate] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [docBlobs, setDocBlobs] = useState<Record<string, string>>({})
  const [failedDocIds, setFailedDocIds] = useState<Set<string>>(new Set())
  const objectUrlsRef = useRef<string[]>([])
  const [zoomLevel, setZoomLevel] = useState(100)
  const [verifying, setVerifying] = useState(false)

  // Modals on page
  const [isResubmissionOpen, setIsResubmissionOpen] = useState(false)
  const [isOrientationOpen, setIsOrientationOpen] = useState(false)

  // 1. Fetch Candidate Data with fallback
  const loadCandidate = useCallback(async () => {
    if (!candidateId) return
    try {
      setLoadingCandidate(true)
      let app: OnboardingCandidate | null = null

      try {
        const data = await getApplicationById(candidateId)
        if (data && (data.applicant || data.id)) {
          app = (data?.data || data) as unknown as OnboardingCandidate
        }
      } catch (appErr) {
        console.warn(
          'Direct application fetch failed, trying onboarding candidates fallback:',
          appErr,
        )
      }

      if (!app || !app.id) {
        const list = await getOnboardingCandidates({ limit: 100 })
        const found = list.data.find((c) => c.id === candidateId)
        if (found) app = found
      }

      setCandidate(app)
    } catch (err) {
      toast.error('Failed to load candidate details')
    } finally {
      setLoadingCandidate(false)
    }
  }, [candidateId])

  useEffect(() => {
    loadCandidate()
  }, [loadCandidate])

  // Set one-time return flag so Onboarding Hub highlights this candidate upon return
  useEffect(() => {
    if (!candidateId || typeof window === 'undefined') return
    try {
      sessionStorage.setItem('dt_onboarding_return_from_viewer', candidateId)
    } catch {
      // ignore
    }
  }, [candidateId])

  const documents = candidate?.documents || []
  const activeDoc = documents[selectedIndex] || null
  const blobUrl = activeDoc ? docBlobs[activeDoc.id] || null : null
  const isDocFailed = Boolean(activeDoc && failedDocIds.has(activeDoc.id))
  const loadingFile = Boolean(activeDoc && !blobUrl && !isDocFailed)

  // Reset zoom whenever user switches documents
  useEffect(() => {
    setZoomLevel(100)
  }, [selectedIndex])

  const navRef = useRef<HTMLElement>(null)

  // Auto-scroll active document pill into center view when selectedIndex changes
  useEffect(() => {
    if (!navRef.current) return
    const activeBtn = navRef.current.querySelector<HTMLElement>(`[data-doc-idx="${selectedIndex}"]`)
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [selectedIndex])

  // Instant 1-click back navigation to Onboarding Hub (bypasses iframe history traps)
  const handleBack = useCallback(() => {
    if (candidateId && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('dt_onboarding_return_from_viewer', candidateId)
      } catch {
        // ignore
      }
    }
    router.push('/dashboard/onboarding')
  }, [candidateId, router])

  // Keyboard shortcuts: Esc to back, Left/Right to switch documents
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isResubmissionOpen || isOrientationOpen) return

      if (e.key === 'Escape') {
        handleBack()
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((idx) => Math.max(0, idx - 1))
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((idx) => Math.min(documents.length - 1, idx + 1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleBack, isResubmissionOpen, isOrientationOpen, documents.length])

  // 2. Preload ALL candidate documents at once in parallel (1 fetch round, instant tab switching)
  const docIdsKey = documents.map((d) => d.id).join(',')
  useEffect(() => {
    if (!candidate || documents.length === 0) {
      setDocBlobs({})
      setFailedDocIds(new Set())
      return
    }

    const abortController = new AbortController()
    const token = getAuthToken()

    // Clean up previous candidate's object URLs
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    objectUrlsRef.current = []

    // Fetch all documents for this candidate with cancellation
    documents.forEach(async (doc) => {
      const url = `/api/v1/onboarding/document/${doc.id}`
      try {
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
          signal: abortController.signal,
        })
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const blob = await res.blob()
        if (abortController.signal.aborted) return
        const mime = doc.mimeType || blob.type || 'application/pdf'
        const typedBlob = new Blob([blob], { type: mime })
        const currentObjectUrl = URL.createObjectURL(typedBlob)

        if (!abortController.signal.aborted) {
          objectUrlsRef.current.push(currentObjectUrl)
          setDocBlobs((prev) => ({ ...prev, [doc.id]: currentObjectUrl }))
        } else {
          URL.revokeObjectURL(currentObjectUrl)
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (!abortController.signal.aborted) {
          setFailedDocIds((prev) => new Set(prev).add(doc.id))
        }
      }
    })

    return () => {
      abortController.abort()
    }
  }, [candidate?.id, docIdsKey])

  // Clean up all created object URLs on component unmount
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrlsRef.current = []
    }
  }, [])

  const handleDownloadActive = async () => {
    if (!activeDoc || !candidate) return
    try {
      const ext = activeDoc.storageKey.split('.').pop() || 'pdf'
      const label = `${candidate.applicant.name}_${activeDoc.type}.${ext}`

      // Instant download from preloaded memory blob if available
      if (blobUrl) {
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = label
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        toast.success(`Downloaded ${getDocLabel(activeDoc.type)}`)
        return
      }

      await downloadDocumentFile(activeDoc.id, label)
      toast.success(`Downloaded ${getDocLabel(activeDoc.type)}`)
    } catch {
      toast.error('Failed to download document')
    }
  }

  const handleVerify = async () => {
    if (!candidate) return
    try {
      setVerifying(true)
      await verifyCandidateDocuments(candidate.id)
      const now = new Date().toISOString()
      setCandidate((prev) => (prev ? { ...prev, docsVerifiedAt: now } : null))
      onboardingCache.updateCandidate(candidate.id, { docsVerifiedAt: now })
      toast.success('All candidate documents marked as verified!')

      if (typeof window !== 'undefined') {
        try {
          const stored = sessionStorage.getItem('dt_onboarding_nav_cache')
          if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed.rawCandidates)) {
              parsed.rawCandidates = parsed.rawCandidates.map((c: OnboardingCandidate) =>
                c.id === candidate.id ? { ...c, docsVerifiedAt: now } : c,
              )
              sessionStorage.setItem('dt_onboarding_nav_cache', JSON.stringify(parsed))
            }
          }
        } catch {
          // ignore
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to verify documents')
    } finally {
      setVerifying(false)
    }
  }

  if (loadingCandidate) {
    return (
      <div className="w-screen h-screen bg-canvas flex flex-col items-center justify-center">
        <BrandLoader size="lg" message="Loading candidate documents..." />
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="w-screen h-screen bg-canvas flex flex-col items-center justify-center space-y-4 text-center p-4">
        <FileText className="size-12 text-muted-foreground/50" />
        <h2 className="text-base font-semibold text-foreground">Candidate Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested onboarding candidate could not be found or has been removed.
        </p>
        <Button variant="outline" size="sm" onClick={handleBack} className="gap-2 cursor-pointer">
          <ArrowLeft className="size-3.5" />
          Back to Onboarding Hub
        </Button>
      </div>
    )
  }

  const isImage = activeDoc?.mimeType?.startsWith('image/')
  const isPdf = activeDoc?.mimeType === 'application/pdf' || activeDoc?.storageKey?.endsWith('.pdf')

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-canvas text-muted">
      {/* Top Header Bar - Single Ultra-Slim Row (Design 1) */}
      <header className="h-10 sm:h-11 px-2.5 sm:px-3 border-b border-hairline-light bg-subtle/95 flex items-center justify-between gap-2 shrink-0 z-10 select-none">
        {/* Left: Back Navigation & Candidate Info */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-7 px-2 text-muted hover:text-muted hover:bg-muted/80 cursor-pointer text-xs gap-1.5 shrink-0"
            title="Back to Onboarding Hub (Esc)"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline font-medium">Back</span>
          </Button>

          <div className="h-4 w-px bg-muted shrink-0" />

          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="text-xs font-semibold text-muted truncate max-w-[100px] sm:max-w-[160px] md:max-w-[200px]"
              title={candidate.applicant?.name}
            >
              {candidate.applicant?.name}
            </span>
            {candidate.docsVerifiedAt ? (
              <Badge
                variant="outline"
                className="text-[10px] py-0 px-1.5 text-accent border-accent bg-accent-soft shrink-0 gap-1 font-normal"
              >
                <CheckCircle2 className="size-2.5" />
                <span className="hidden md:inline">Verified</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] py-0 px-1.5 text-amber-400 border-amber-500/30 bg-amber-500/10 shrink-0 font-normal"
              >
                Pending
              </Badge>
            )}
          </div>
        </div>

        {/* Center: Document Switcher Navigation */}
        <div className="flex items-center gap-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIndex((idx) => Math.max(0, idx - 1))}
            disabled={selectedIndex <= 0}
            className="size-6 sm:size-7 p-0 text-muted hover:text-muted hover:bg-muted disabled:opacity-20 cursor-pointer shrink-0"
            title="Previous Document (Left Arrow)"
          >
            <ChevronLeft className="size-3.5 sm:size-4" />
          </Button>

          <nav
            ref={navRef}
            className="flex items-center gap-1 overflow-x-auto max-w-[32vw] sm:max-w-[40vw] lg:max-w-[46vw] py-0.5 px-0.5 scrollbar-hide scroll-smooth"
            aria-label="Candidate Documents"
          >
            {documents.map((doc, idx) => {
              const isSelected = idx === selectedIndex
              const isDocImage = doc.mimeType?.startsWith('image/')
              return (
                <button
                  key={doc.id}
                  data-doc-idx={idx}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={cn(
                    'inline-flex items-center gap-1.5 h-6 sm:h-7 px-2 sm:px-2.5 rounded-none text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer',
                    isSelected
                      ? 'bg-accent text-white ring-1 ring-accent'
                      : 'text-muted hover:text-muted hover:bg-muted bg-subtle/60 border border-hairline-light/80',
                  )}
                  title={`${getDocLabel(doc.type, idx, documents)} (${formatBytes(doc.size)})`}
                >
                  {isDocImage ? (
                    <ImageIcon className="size-3 shrink-0" />
                  ) : (
                    <FileText className="size-3 shrink-0" />
                  )}
                  <span className="truncate max-w-[90px] sm:max-w-[130px]">
                    {getDocLabel(doc.type, idx, documents)}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-mono hidden xl:inline',
                      isSelected ? 'text-accent' : 'text-muted',
                    )}
                  >
                    {formatBytes(doc.size)}
                  </span>
                </button>
              )
            })}
          </nav>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIndex((idx) => Math.min(documents.length - 1, idx + 1))}
            disabled={selectedIndex >= documents.length - 1}
            className="size-6 sm:size-7 p-0 text-muted hover:text-muted hover:bg-muted disabled:opacity-20 cursor-pointer shrink-0"
            title="Next Document (Right Arrow)"
          >
            <ChevronRight className="size-3.5 sm:size-4" />
          </Button>

          {documents.length > 0 && (
            <span className="text-[10px] font-mono text-muted px-1 hidden sm:inline shrink-0 select-none">
              {selectedIndex + 1}/{documents.length}
            </span>
          )}
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Zoom Controls (Images only) */}
          {isImage && (
            <div className="hidden md:flex items-center gap-0.5 bg-muted/60 rounded-none p-0.5 border border-hairline-light/60">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                disabled={zoomLevel <= 50}
                className="size-6 p-0 text-muted hover:text-muted cursor-pointer disabled:opacity-40"
                title="Zoom Out"
              >
                <ZoomOut className="size-3" />
              </Button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="text-[10px] font-mono px-1 text-muted hover:text-white min-w-[34px] text-center cursor-pointer transition-colors"
                title="Click to reset zoom"
              >
                {zoomLevel}%
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoomLevel((z) => Math.min(300, z + 25))}
                disabled={zoomLevel >= 300}
                className="size-6 p-0 text-muted hover:text-muted cursor-pointer disabled:opacity-40"
                title="Zoom In"
              >
                <ZoomIn className="size-3" />
              </Button>
            </div>
          )}

          {/* Quick Resubmit Button (visible on wide screens) */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsResubmissionOpen(true)}
            className="hidden lg:inline-flex text-xs h-7 px-2 gap-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 cursor-pointer shrink-0"
            title="Request Resubmission"
          >
            <RotateCcw className="size-3" />
            <span>Resubmit</span>
          </Button>

          {/* Approve & Verify Button (if pending) */}
          {!candidate.docsVerifiedAt && (
            <Button
              size="sm"
              onClick={handleVerify}
              disabled={verifying || documents.length === 0}
              className="h-7 px-2.5 text-xs gap-1.5 bg-accent hover:bg-accent text-white font-medium cursor-pointer disabled:opacity-50 shrink-0"
              title="Approve & Verify Documents"
            >
              {verifying ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3" />
              )}
              <span className="hidden sm:inline">Approve Docs</span>
              <span className="sm:hidden">Approve</span>
            </Button>
          )}

          {/* Orientation Button */}
          <Button
            size="sm"
            onClick={() => setIsOrientationOpen(true)}
            className="h-7 px-2.5 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium cursor-pointer shrink-0"
            title="Proceed to Orientation"
          >
            <span className="hidden sm:inline">Orientation</span>
            <ExternalLink className="size-3 sm:hidden" />
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="size-7 p-0 border-hairline-light bg-muted text-muted hover:bg-subtle hover:text-white cursor-pointer shrink-0"
                title="More actions"
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 bg-subtle border-hairline-light text-muted"
            >
              <DropdownMenuItem
                onClick={() => setIsResubmissionOpen(true)}
                className="gap-2 text-xs text-amber-300 focus:text-amber-200 focus:bg-amber-500/10 cursor-pointer lg:hidden"
              >
                <RotateCcw className="size-3.5" />
                <span>Request Resubmission</span>
              </DropdownMenuItem>
              {blobUrl && (
                <DropdownMenuItem
                  onClick={() => window.open(blobUrl, '_blank')}
                  className="gap-2 text-xs text-muted focus:text-white focus:bg-muted cursor-pointer"
                >
                  <ExternalLink className="size-3.5" />
                  <span>Open in New Tab</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDownloadActive}
                disabled={!activeDoc}
                className="gap-2 text-xs text-muted focus:text-white focus:bg-muted cursor-pointer"
              >
                <Download className="size-3.5" />
                <span>Download Document</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-muted" />
              <DropdownMenuItem
                onClick={handleBack}
                className="gap-2 text-xs text-muted focus:text-muted focus:bg-muted cursor-pointer"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to Onboarding (Esc)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Document Viewer Canvas - 100% Remaining Screen Height */}
      <div className="flex-1 w-full bg-canvas relative flex items-center justify-center overflow-hidden">
        {documents.length === 0 ? (
          <div className="text-center text-muted space-y-2">
            <FileText className="size-12 mx-auto opacity-40" />
            <p className="text-sm font-medium">No documents uploaded by this candidate yet</p>
          </div>
        ) : loadingFile ? (
          <div className="flex flex-col items-center justify-center py-12">
            <BrandLoader size="sm" message="Loading candidate documents..." />
          </div>
        ) : isPdf && blobUrl ? (
          <iframe
            key={activeDoc?.id || 'doc-iframe'}
            src={blobUrl}
            className="w-full h-full rounded-none border-0 bg-subtle"
            title="PDF Viewer"
          />
        ) : isImage && blobUrl ? (
          <div className="w-full h-full overflow-auto flex p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blobUrl}
              alt={activeDoc ? getDocLabel(activeDoc.type, selectedIndex, documents) : 'Document'}
              onDoubleClick={() => setZoomLevel((z) => (z === 100 ? 175 : 100))}
              style={{
                maxHeight: `${Math.round(90 * (zoomLevel / 100))}vh`,
                maxWidth: `${Math.round(92 * (zoomLevel / 100))}vw`,
                width: 'auto',
                height: 'auto',
              }}
              className="rounded-none object-contain transition-all duration-150 select-none shrink-0 m-auto cursor-zoom-in"
              title="Double-click to toggle zoom"
            />
          </div>
        ) : (
          <div className="text-center space-y-3 p-6 max-w-md bg-subtle border border-hairline-light rounded-none">
            <FileText className="size-10 mx-auto text-accent" />
            <p className="text-xs font-semibold text-muted">
              Preview not supported for this file format ({activeDoc?.mimeType})
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadActive}
              className="gap-1.5 text-xs bg-muted border-hairline-light text-muted cursor-pointer"
            >
              <Download className="size-3.5" />
              Download Document to View
            </Button>
          </div>
        )}
      </div>

      {/* Modals triggered from document viewer page */}
      <RequestResubmissionModal
        candidate={candidate}
        open={isResubmissionOpen}
        onOpenChange={setIsResubmissionOpen}
        onSuccess={() => {
          setIsResubmissionOpen(false)
          loadCandidate()
        }}
      />

      <SendOrientationModal
        candidates={[candidate]}
        open={isOrientationOpen}
        onOpenChange={setIsOrientationOpen}
        onSuccess={() => {
          setIsOrientationOpen(false)
          loadCandidate()
        }}
      />
    </div>
  )
}
