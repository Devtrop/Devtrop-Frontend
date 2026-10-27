'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Database,
  RefreshCw,
  Upload,
  Cloud,
  Calendar,
  CheckCircle2,
  Download,
  RotateCcw,
  Search,
  Loader2,
  AlertTriangle,
  FileCheck,
  HardDrive,
  Trash2,
  FileUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { backupsApi, BackupItem } from '@/lib/backups'
import { RoleGuard } from '@/components/dashboard/RoleGuard'

function formatDate(dateStr?: string | Date | null) {
  if (!dateStr) return { bst: '—', utc: '—' }
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return { bst: '—', utc: '—' }

  const bst = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date)

  const utc = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)

  return {
    bst: `${bst} BST`,
    utc: `${utc} UTC`,
  }
}

function formatShortDate(dateStr?: string | Date | null) {
  if (!dateStr) return { bst: 'None yet', utc: '' }
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return { bst: 'None yet', utc: '' }

  const bst = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)

  const utc = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)

  return {
    bst: `${bst} BST`,
    utc: `${utc} UTC`,
  }
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function DatabaseBackupsView() {
  const [backups, setBackups] = useState<BackupItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Restore dialog state
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<BackupItem | null>(null)
  const [restoring, setRestoring] = useState(false)

  // Import file dialog state
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  // Delete dialog state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [backupToDelete, setBackupToDelete] = useState<BackupItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Load backups list
  const loadBackups = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const data = await backupsApi.list()
      setBackups(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch database backups.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void loadBackups()
  }, [loadBackups])

  // Trigger manual on-demand backup
  const handleCreateBackup = async () => {
    try {
      setCreating(true)
      const res = await backupsApi.trigger()
      toast.success(`Backup created successfully: ${res.fileName} (${res.sizeMB} MB)`)
      await loadBackups(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create database backup.')
    } finally {
      setCreating(false)
    }
  }

  // Download backup via presigned Cloudflare R2 URL
  const handleDownload = async (backup: BackupItem) => {
    try {
      toast.loading(`Generating download link for ${backup.fileName}...`, { id: 'dl' })
      const res = await backupsApi.getDownloadUrl(backup.key)
      toast.dismiss('dl')

      // Trigger browser download via invisible anchor
      const link = document.createElement('a')
      link.href = res.url
      link.setAttribute('download', res.fileName)
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Download started.')
    } catch (err) {
      toast.dismiss('dl')
      toast.error(err instanceof Error ? err.message : 'Failed to get download URL.')
    }
  }

  // Restore database
  const handleConfirmRestore = async () => {
    if (!selectedBackup) return
    try {
      setRestoring(true)
      const res = await backupsApi.restore(selectedBackup.key)
      toast.success(res.message || 'Database restored successfully!')
      setRestoreModalOpen(false)
      setSelectedBackup(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Database restore failed.')
    } finally {
      setRestoring(false)
    }
  }

  // Import and restore from local file
  const handleImportAndRestore = async () => {
    if (!selectedFile) {
      toast.error('Please select a .dump backup file.')
      return
    }
    try {
      setImporting(true)
      const res = await backupsApi.importAndRestore(selectedFile)
      toast.success(res.message || 'Imported backup restored successfully!')
      setImportModalOpen(false)
      setSelectedFile(null)
      await loadBackups(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed.')
    } finally {
      setImporting(false)
    }
  }

  // Delete backup
  const handleConfirmDelete = async () => {
    if (!backupToDelete) return
    try {
      setDeleting(true)
      await backupsApi.delete(backupToDelete.key)
      toast.success(`Deleted ${backupToDelete.fileName}`)
      setDeleteModalOpen(false)
      setBackupToDelete(null)
      await loadBackups(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete backup.')
    } finally {
      setDeleting(false)
    }
  }

  // Filtered backups by search query
  const filteredBackups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return backups
    return backups.filter(
      (b) =>
        b.fileName.toLowerCase().includes(q) ||
        b.key.toLowerCase().includes(q) ||
        'success'.includes(q),
    )
  }, [backups, searchQuery])

  // Top metric stats
  const totalCount = backups.length
  const lastBackupDate = backups.length > 0 ? backups[0].lastModified : null

  return (
    <RoleGuard permissions={['role.read', 'user.read']} allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-xs">
              <Database className="size-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Database Backup & Restore
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Manage automated cloud backups, trigger manual database snapshots, and restore
                system state.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadBackups(true)}
              disabled={loading || refreshing}
              className="h-9 px-3 text-xs gap-1.5 border-border/70 bg-card/60 hover:bg-card text-foreground"
            >
              <RefreshCw
                className={`size-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`}
              />
              <span>Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportModalOpen(true)}
              className="h-9 px-3 text-xs gap-1.5 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 text-amber-400 font-medium"
            >
              <Upload className="size-3.5" />
              <span>Import from File</span>
            </Button>

            <Button
              size="sm"
              onClick={handleCreateBackup}
              disabled={creating}
              className="h-9 px-4 text-xs gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-sm shadow-emerald-500/25 transition-all"
            >
              {creating ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Dumping DB...</span>
                </>
              ) : (
                <>
                  <Database className="size-3.5" />
                  <span>Create Backup Now</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 3 KPI Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Total Backups */}
          <Card className="border border-border/40 bg-card/60 backdrop-blur-xs shadow-xs rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] tracking-wider font-semibold uppercase text-muted-foreground">
                  TOTAL BACKUPS
                </p>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {loading ? '—' : totalCount}
                </div>
                <p className="text-xs text-muted-foreground">Logged historical snapshots</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <HardDrive className="size-5" />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Last Backup Date */}
          <Card className="border border-border/40 bg-card/60 backdrop-blur-xs shadow-xs rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] tracking-wider font-semibold uppercase text-muted-foreground">
                  LAST BACKUP DATE
                </p>
                <div className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate max-w-[200px]">
                  {loading ? '—' : formatShortDate(lastBackupDate).bst}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {!loading && formatShortDate(lastBackupDate).utc ? (
                    <>
                      <span className="font-mono text-[11px]">
                        {formatShortDate(lastBackupDate).utc}
                      </span>
                      <span>•</span>
                    </>
                  ) : null}
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Cloud className="size-3" />
                    Cloud Protected (R2)
                  </span>
                </div>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Cloud className="size-5" />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Auto-Backup Schedule */}
          <Card className="border border-border/40 bg-card/60 backdrop-blur-xs shadow-xs rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] tracking-wider font-semibold uppercase text-muted-foreground">
                  AUTO-BACKUP SCHEDULE
                </p>
                <div className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  Daily at 02:00 AM BST
                </div>
                <div className="flex items-center gap-1.5 text-xs text-purple-400">
                  <CheckCircle2 className="size-3.5" />
                  <span>20:00 UTC (Bangladesh Time UTC+6)</span>
                </div>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Calendar className="size-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Section: Backup History Logs */}
        <Card className="border border-border/40 bg-card/50 backdrop-blur-xs shadow-xs rounded-2xl overflow-hidden">
          {/* Section Header */}
          <div className="p-5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold tracking-tight text-foreground">
                Backup History Logs
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                List of generated database backups stored on Cloudflare R2 storage.
              </p>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-72">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search filename or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 text-xs bg-background/50 border-border/50 rounded-xl"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-[11px] font-semibold uppercase text-muted-foreground bg-muted/20">
                  <th className="py-3 px-5">Filename / Key</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      <Loader2 className="size-6 animate-spin text-emerald-400 mx-auto mb-2" />
                      <span>Loading backup logs from Cloudflare R2...</span>
                    </td>
                  </tr>
                ) : filteredBackups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      <div className="size-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3 text-muted-foreground/60">
                        <Database className="size-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {searchQuery ? 'No matching backups found' : 'No backups created yet'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        {searchQuery
                          ? 'Try adjusting your search query'
                          : 'Click "Create Backup Now" above to trigger your first snapshot to Cloudflare R2.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredBackups.map((item) => (
                    <tr
                      key={item.key}
                      className="hover:bg-muted/15 transition-colors group text-muted-foreground"
                    >
                      {/* Filename / Key */}
                      <td className="py-3.5 px-5 font-mono text-[11px] text-foreground font-medium flex items-center gap-2.5">
                        <div className="size-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Database className="size-3" />
                        </div>
                        <span className="truncate max-w-xs sm:max-w-md">{item.fileName}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                          <CheckCircle2 className="size-3" />
                          Success
                        </span>
                      </td>

                      {/* File Size */}
                      <td className="py-3.5 px-4 font-mono text-foreground/90">
                        {item.sizeBytes ? formatBytes(item.sizeBytes) : `${item.sizeMB} MB`}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-foreground">
                          {formatDate(item.lastModified).bst}
                        </div>
                        <div className="text-[10px] text-muted-foreground/80 font-mono mt-0.5">
                          {formatDate(item.lastModified).utc}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(item)}
                            title="Download backup file"
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 gap-1 rounded-lg"
                          >
                            <Download className="size-3.5" />
                            <span className="hidden sm:inline">Download</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBackup(item)
                              setRestoreModalOpen(true)
                            }}
                            title="Restore database from this snapshot"
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 gap-1 rounded-lg"
                          >
                            <RotateCcw className="size-3.5" />
                            <span className="hidden sm:inline">Restore</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setBackupToDelete(item)
                              setDeleteModalOpen(true)
                            }}
                            title="Delete backup"
                            className="h-8 px-2 text-xs text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal 1: Restore Confirmation */}
        <Dialog open={restoreModalOpen} onOpenChange={setRestoreModalOpen}>
          <DialogContent className="max-w-md border-border bg-card">
            <DialogHeader>
              <div className="size-11 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-2">
                <AlertTriangle className="size-6" />
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                Restore Database State?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                You are about to restore the database from snapshot{' '}
                <span className="font-mono text-amber-400 font-semibold">
                  {selectedBackup?.fileName}
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-amber-300 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="size-3.5 shrink-0" />
                Warning: Overwrite Operation
              </p>
              <p className="text-muted-foreground text-[11px] leading-normal">
                This will execute <code className="font-mono">pg_restore</code> on the active
                database, replacing current tables and records with the state from this snapshot.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRestoreModalOpen(false)}
                disabled={restoring}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmRestore}
                disabled={restoring}
                className="text-xs gap-1.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              >
                {restoring ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Restoring Database...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="size-3.5" />
                    <span>Yes, Restore Snapshot</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal 2: Import from File */}
        <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
          <DialogContent className="max-w-md border-border bg-card">
            <DialogHeader>
              <div className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-2">
                <FileUp className="size-6" />
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                Import & Restore Database
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                Upload a PostgreSQL custom binary dump file (
                <code className="font-mono text-emerald-400">.dump</code>). It will be restored to
                the database and archived to Cloudflare R2.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="border-2 border-dashed border-border/70 hover:border-emerald-500/50 transition-colors rounded-xl p-6 text-center">
                <input
                  type="file"
                  id="backup-file-upload"
                  accept=".dump,.sql,.gz"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setSelectedFile(file)
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="backup-file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Upload className="size-5" />
                  </div>
                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-emerald-400 font-mono">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatBytes(selectedFile.size)}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-foreground">
                        Click to select a <span className="text-emerald-400 font-mono">.dump</span>{' '}
                        file
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        PostgreSQL custom archive format (-Fc)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setImportModalOpen(false)
                  setSelectedFile(null)
                }}
                disabled={importing}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleImportAndRestore}
                disabled={!selectedFile || importing}
                className="text-xs gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
              >
                {importing ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Uploading & Restoring...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="size-3.5" />
                    <span>Upload & Restore</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal 3: Delete Confirmation */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="max-w-sm border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                Delete Backup Archive?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-1">
                Permanently delete{' '}
                <span className="font-mono text-foreground font-semibold">
                  {backupToDelete?.fileName}
                </span>{' '}
                from Cloudflare R2? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="text-xs gap-1.5 font-semibold"
              >
                {deleting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    <span>Delete Backup</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  )
}
