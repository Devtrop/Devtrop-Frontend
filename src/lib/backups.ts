import { api } from '@/lib/api'

export interface BackupItem {
  key: string
  fileName: string
  sizeBytes: number
  sizeMB: string
  lastModified?: string
}

export interface BackupResult {
  success: boolean
  fileName: string
  key: string
  sizeBytes: number
  sizeMB: string
  durationMs: number
  uploadedAt: string
}

export interface DownloadUrlResponse {
  url: string
  fileName: string
  expiresInSeconds: number
}

export interface RestoreResponse {
  success: boolean
  message: string
}

export const backupsApi = {
  /**
   * List all database backups stored on Cloudflare R2
   */
  async list(): Promise<BackupItem[]> {
    const res = await api.get<BackupItem[] | { data: BackupItem[] }>('/backups')
    if (Array.isArray(res)) return res
    if (res && 'data' in res && Array.isArray(res.data)) return res.data
    return []
  },

  /**
   * Trigger an on-demand PostgreSQL database backup to Cloudflare R2
   */
  async trigger(): Promise<BackupResult> {
    const res = await api.post<BackupResult | { data: BackupResult }>('/backups/trigger', {})
    if (res && 'data' in res && (res as { data: BackupResult }).data) {
      return (res as { data: BackupResult }).data
    }
    return res as BackupResult
  },

  /**
   * Get a temporary presigned URL to download a backup directly from Cloudflare R2
   */
  async getDownloadUrl(key: string): Promise<DownloadUrlResponse> {
    const res = await api.get<DownloadUrlResponse | { data: DownloadUrlResponse }>(
      '/backups/download',
      {
        key,
      },
    )
    if (res && 'data' in res && (res as { data: DownloadUrlResponse }).data) {
      return (res as { data: DownloadUrlResponse }).data
    }
    return res as DownloadUrlResponse
  },

  /**
   * Restore the database using a backup key stored on Cloudflare R2
   */
  async restore(key: string): Promise<RestoreResponse> {
    const res = await api.post<RestoreResponse | { data: RestoreResponse }>('/backups/restore', {
      key,
    })
    if (res && 'data' in res && (res as { data: RestoreResponse }).data) {
      return (res as { data: RestoreResponse }).data
    }
    return res as RestoreResponse
  },

  /**
   * Upload a local .dump file and restore the database
   */
  async importAndRestore(file: File): Promise<RestoreResponse> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.upload<RestoreResponse | { data: RestoreResponse }>(
      '/backups/import',
      formData,
    )
    if (res && 'data' in res && (res as { data: RestoreResponse }).data) {
      return (res as { data: RestoreResponse }).data
    }
    return res as RestoreResponse
  },

  /**
   * Delete a backup from Cloudflare R2
   */
  async delete(key: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete<{ success: boolean; message: string }>(
      `/backups?key=${encodeURIComponent(key)}`,
    )
    return res
  },
}
