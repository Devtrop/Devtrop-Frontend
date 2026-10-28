'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  FileText,
  FileCheck,
  Image as ImageIcon,
  Loader2,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
} from 'lucide-react'
import { downloadDocumentFile } from '@/lib/onboarding'
import { BrandLoader } from '@/components/ui/BrandLoader'
import { getAuthToken } from '@/lib/api-config'
import type { OnboardingCandidate } from '@/lib/onboarding'
import { toast } from '@/lib/toast'

interface DocumentViewerModalProps {
  candidate: OnboardingCandidate | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerifyDocs?: (candidateId: string) => Promise<void>
  onSendOrientation?: (candidate: OnboardingCandidate) => void
  onRequestResubmission?: (candidate: OnboardingCandidate) => void
}

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

export function DocumentViewerModal({
  candidate,
  open,
  onOpenChange,
  onVerifyDocs,
  onSendOrientation,
  onRequestResubmission,
}: DocumentViewerModalProps) {
  const documents = candidate?.documents || []
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loadedDocId, setLoadedDocId] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [verifying, setVerifying] = useState(false)

  const activeDoc = documents[selectedIndex] || null
  const loadingFile = Boolean(open && activeDoc && loadedDocId !== activeDoc.id)

  const [prevCandidateId, setPrevCandidateId] = useState(candidate?.id)
  if (candidate?.id !== prevCandidateId) {
    setPrevCandidateId(candidate?.id)
    setSelectedIndex(0)
  }

  // Load document blob for preview
  useEffect(() => {
    if (!open || !activeDoc || !candidate) {
      return
    }

    let isMounted = true
    let currentObjectUrl: string | null = null
    const url = `/api/v1/onboarding/document/${activeDoc.id}`
    const token = getAuthToken()

    fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.blob()
      })
      .then((blob) => {
        if (isMounted) {
          const mime = activeDoc?.mimeType || blob.type || 'application/pdf'
          const typedBlob = new Blob([blob], { type: mime })
          currentObjectUrl = URL.createObjectURL(typedBlob)
          setBlobUrl(currentObjectUrl)
          setLoadedDocId(activeDoc.id)
          setZoomLevel(100)
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadedDocId(activeDoc.id)
          toast.error('Failed to preview document. You can still download it.')
        }
      })

    return () => {
      isMounted = false
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl)
      }
    }
  }, [open, activeDoc, candidate])

  const handleDownloadActive = async () => {
    if (!activeDoc || !candidate) return
    try {
      const ext = activeDoc.storageKey.split('.').pop() || 'pdf'
      const label = `${candidate.applicant.name}_${activeDoc.type}.${ext}`
      await downloadDocumentFile(activeDoc.id, label)
      toast.success(`Downloaded ${getDocLabel(activeDoc.type)}`)
    } catch {
      toast.error('Failed to download document')
    }
  }

  const handleVerify = async () => {
    if (!candidate || !onVerifyDocs) return
    try {
      setVerifying(true)
      await onVerifyDocs(candidate.id)
      toast.success('All candidate documents marked as verified!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to verify documents')
    } finally {
      setVerifying(false)
    }
  }

  const isImage = activeDoc?.mimeType?.startsWith('image/')
  const isPdf = activeDoc?.mimeType === 'application/pdf' || activeDoc?.storageKey?.endsWith('.pdf')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[96vw] sm:w-[92vw] sm:max-w-5xl lg:w-[85vw] lg:max-w-6xl h-[92vh] sm:h-[88vh] max-h-[92vh] sm:max-h-[88vh] p-0 flex flex-col overflow-hidden bg-canvas border-hairline-light text-muted rounded-none">
        {/* Top Header Bar (pr-10 for close button clearance) */}
        <DialogHeader className="p-3 sm:p-4 pr-10 sm:pr-12 border-b border-hairline-light flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-subtle/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 sm:size-10 items-center justify-center rounded-none bg-accent-soft border border-accent text-accent shrink-0">
              <FileCheck className="size-4 sm:size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xs sm:text-sm font-semibold flex items-center gap-2 text-muted truncate">
                <span className="truncate">
                  {activeDoc
                    ? getDocLabel(activeDoc.type, selectedIndex, documents)
                    : 'Document Viewer'}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] text-muted border-hairline-light bg-muted/50 shrink-0"
                >
                  {selectedIndex + 1} of {documents.length}
                </Badge>
                {candidate?.docsVerifiedAt && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-accent border-accent bg-accent-soft shrink-0"
                  >
                    <CheckCircle2 className="size-3 mr-1" /> Verified
                  </Badge>
                )}
              </DialogTitle>
              <p className="text-[11px] sm:text-xs text-muted mt-0.5 truncate">
                Candidate:{' '}
                <span className="text-muted font-medium">{candidate?.applicant?.name}</span> •{' '}
                {candidate?.job?.title} {activeDoc ? `• ${formatBytes(activeDoc.size)}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end shrink-0">
            {/* Zoom Controls for Images */}
            {isImage && (
              <div className="flex items-center gap-1 bg-muted/60 rounded-none p-0.5 border border-hairline-light/60">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                  disabled={zoomLevel <= 50}
                  className="size-7 p-0 text-muted hover:text-muted cursor-pointer disabled:opacity-40"
                  title="Zoom Out"
                >
                  <ZoomOut className="size-3.5" />
                </Button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(100)}
                  className="text-[11px] font-mono px-1.5 text-muted hover:text-white min-w-[42px] text-center cursor-pointer transition-colors"
                  title="Click to reset zoom"
                >
                  {zoomLevel}%
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoomLevel((z) => Math.min(300, z + 25))}
                  disabled={zoomLevel >= 300}
                  className="size-7 p-0 text-muted hover:text-muted cursor-pointer disabled:opacity-40"
                  title="Zoom In"
                >
                  <ZoomIn className="size-3.5" />
                </Button>
              </div>
            )}

            {/* Open in Tab Button */}
            {blobUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(blobUrl, '_blank')}
                className="gap-1.5 text-xs h-8 bg-muted hover:bg-subtle text-muted border-hairline-light"
                title="Open in new window"
              >
                <ExternalLink className="size-3.5" />
                <span className="hidden sm:inline">Open in Tab</span>
              </Button>
            )}

            {/* Download Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadActive}
              disabled={!activeDoc}
              className="gap-1.5 text-xs h-8 bg-muted hover:bg-subtle text-muted border-hairline-light"
            >
              <Download className="size-3.5" />
              Download
            </Button>
          </div>
        </DialogHeader>

        {/* Main Document Viewer Canvas */}
        <div className="flex-1 w-full bg-canvas/90 relative flex items-center justify-center overflow-hidden">
          {documents.length === 0 ? (
            <div className="text-center text-muted space-y-2">
              <FileText className="size-12 mx-auto opacity-40" />
              <p className="text-sm font-medium">No documents uploaded by this candidate yet</p>
            </div>
          ) : loadingFile ? (
            <div className="flex flex-col items-center justify-center py-12">
              <BrandLoader size="sm" message="Loading document..." />
            </div>
          ) : isPdf && blobUrl ? (
            <iframe
              src={blobUrl}
              className="w-full h-full rounded-none border border-hairline-light bg-subtle"
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
                  maxHeight: `${Math.round(70 * (zoomLevel / 100))}vh`,
                  maxWidth: `${Math.round(75 * (zoomLevel / 100))}vw`,
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
                className="gap-1.5 text-xs bg-muted border-hairline-light text-muted"
              >
                <Download className="size-3.5" />
                Download Document to View
              </Button>
            </div>
          )}
        </div>

        {/* Bottom Thumbnail Strip + Action Footer */}
        <div className="border-t border-hairline-light bg-subtle/90 p-3 pb-5 shrink-0 flex flex-col gap-3">
          {/* Thumbnails Carousel */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {documents.map((doc, idx) => {
              const isSelected = idx === selectedIndex
              const isDocImage = doc.mimeType?.startsWith('image/')

              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-none border text-left transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'border-accent bg-accent-soft ring-2 ring-accent text-muted'
                      : 'border-hairline-light bg-subtle/80 hover:bg-muted text-muted hover:text-muted'
                  }`}
                >
                  <div
                    className={`size-8 rounded-none flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-accent-soft text-accent'
                        : 'bg-muted text-muted'
                    }`}
                  >
                    {isDocImage ? (
                      <ImageIcon className="size-4" />
                    ) : (
                      <FileText className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 pr-1">
                    <p className="text-xs font-medium truncate max-w-[140px]">
                      {getDocLabel(doc.type, idx, documents)}
                    </p>
                    <p className="text-[10px] text-muted font-mono">{formatBytes(doc.size)}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-hairline-light/80">
            <p className="text-[11px] sm:text-xs text-muted">
              {documents.length} document(s) uploaded •{' '}
              {candidate?.docsSubmittedAt
                ? `Submitted ${new Date(candidate.docsSubmittedAt).toLocaleDateString()}`
                : 'Awaiting upload'}
            </p>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs h-8 border-hairline-light bg-muted text-muted hover:bg-subtle"
              >
                Close
              </Button>

              {onRequestResubmission && candidate && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false)
                    onRequestResubmission(candidate)
                  }}
                  className="text-xs h-8 gap-1.5 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  Request Resubmission
                </Button>
              )}

              {onVerifyDocs && !candidate?.docsVerifiedAt && (
                <Button
                  size="sm"
                  onClick={handleVerify}
                  disabled={verifying || documents.length === 0}
                  className="text-xs h-8 gap-1.5 bg-accent hover:bg-accent text-white font-medium"
                >
                  {verifying ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-3.5" />
                  )}
                  Approve & Verify Docs
                </Button>
              )}

              {onSendOrientation && candidate && (
                <Button
                  size="sm"
                  onClick={() => {
                    onOpenChange(false)
                    onSendOrientation(candidate)
                  }}
                  className="text-xs h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  <ExternalLink className="size-3.5" />
                  Proceed to Orientation
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
