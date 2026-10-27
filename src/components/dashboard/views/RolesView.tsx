'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { RolesSkeleton } from '@/components/dashboard/roles/RolesSkeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { PermissionGate } from '@/components/dashboard/PermissionGate'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Key,
  ChevronRight,
  Check,
  ChevronLeft,
  ArrowUpDown,
  Filter,
  X,
} from 'lucide-react'
import { api, RoleItem, PermissionItem } from '@/lib/api'
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useAllPermissions,
  useRolePermissions,
  useUpdateRolePermissions,
} from '@/lib/query'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ─── Static Permissions Fallback ─────────────────────────────────────────────
// Mirrors backend src/common/constants/permissions.ts exactly.
// Used as a fallback when the /permissions API returns 403 (no permission.read).
const STATIC_PERMISSION_NAMES: string[] = [
  // USER
  'user.read',
  'user.status.update',
  'user.role.update',
  'user.deactivate',

  // User self-service
  'user.profile.update',
  'user.password.change',
  'user.email.change',
  'user.avatar.update',

  // HIRING / JOB POST
  'job_post.read',
  'job_post.create',
  'job_post.update',
  'job_post.delete',

  // APPLICATION
  'application.read',
  'application.update',

  // INTERVIEW
  'interview.read',
  'interview.create',
  'interview.update',
  'interview.cancel',
  'interview.evaluate',

  // TASK
  'task.create',
  'task.update',
  'task.delete',

  // ROLE
  'role.read',
  'role.create',
  'role.update',
  'role.delete',

  // DOCUMENT
  'document.read',
  'document.delete',

  // PERMISSION
  'permission.read',
  'permission.assign',
]

const STATIC_PERMISSIONS: PermissionItem[] = STATIC_PERMISSION_NAMES.map((name) => ({
  id: name,
  name,
  module: name.split('.')[0],
  description: name,
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalizes any backend permission format into standard PermissionItem objects.
 */
export function normalizePermissionList(raw: unknown): PermissionItem[] {
  let items: unknown[] = []

  if (Array.isArray(raw)) {
    items = raw
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>

    // Try all known wrapper shapes in priority order
    if (Array.isArray(obj.data)) {
      items = obj.data
    } else if (Array.isArray(obj.items)) {
      items = obj.items
    } else if (Array.isArray(obj.permissions)) {
      items = obj.permissions
    } else if (Array.isArray(obj.result)) {
      items = obj.result
    } else if (Array.isArray(obj.content)) {
      items = obj.content
    } else if (Array.isArray(obj.list)) {
      items = obj.list
    } else if (obj.data && typeof obj.data === 'object') {
      const inner = obj.data as Record<string, unknown>
      if (Array.isArray(inner.permissions)) {
        items = inner.permissions
      } else if (Array.isArray(inner.data)) {
        items = inner.data
      } else if (Array.isArray(inner.items)) {
        items = inner.items
      } else if (Array.isArray(inner.list)) {
        items = inner.list
      } else if (Array.isArray(inner.result)) {
        items = inner.result
      }
    }
  }

  return items
    .map((item, idx): PermissionItem | null => {
      if (typeof item === 'string') {
        const name = item.trim()
        if (!name) return null
        const moduleName = name.includes('.')
          ? name.split('.')[0]
          : name.includes(':')
            ? name.split(':')[0]
            : 'general'
        return {
          id: name || String(idx),
          name,
          module: moduleName,
          description: name,
        }
      }
      if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>
        let nestedObj: Record<string, unknown> | null = null
        if (o.permission && typeof o.permission === 'object') {
          nestedObj = o.permission as Record<string, unknown>
        }

        const name = String(
          (nestedObj
            ? nestedObj.name ||
              nestedObj.permission ||
              nestedObj.key ||
              nestedObj.slug ||
              nestedObj.title
            : null) ||
            o.name ||
            o.permissionName ||
            (typeof o.permission === 'string' ? o.permission : null) ||
            o.key ||
            o.slug ||
            o.title ||
            '',
        ).trim()

        if (!name || name === '[object Object]') return null

        const rawModule =
          (nestedObj ? nestedObj.module || nestedObj.resource : null) ||
          o.module ||
          o.resource ||
          (name.includes('.')
            ? name.split('.')[0]
            : name.includes(':')
              ? name.split(':')[0]
              : 'general')

        const moduleName = String(rawModule)
        const rawId =
          (nestedObj ? nestedObj.id || nestedObj._id : null) ||
          o.id ||
          o._id ||
          o.permissionId ||
          name
        const id = String(rawId)

        const desc =
          (nestedObj ? nestedObj.description : null) ||
          (typeof o.description === 'string' ? o.description : undefined)

        return {
          id,
          name,
          description: typeof desc === 'string' ? desc : undefined,
          module: moduleName,
          action: typeof o.action === 'string' ? o.action : undefined,
          resource: typeof o.resource === 'string' ? o.resource : undefined,
        }
      }
      return null
    })
    .filter(
      (p): p is PermissionItem => p !== null && p.name.length > 0 && p.name !== '[object Object]',
    )
}

/**
 * Extracts pagination metadata from backend permission response.
 */
export function extractPermissionPaginationMeta(raw: unknown): {
  page: number
  limit: number
  total: number
  totalPages: number
} | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const metaObj = (obj.meta ||
    obj.pagination ||
    (obj.data && typeof obj.data === 'object'
      ? (obj.data as Record<string, unknown>).meta ||
        (obj.data as Record<string, unknown>).pagination
      : null)) as Record<string, unknown> | null

  if (metaObj && typeof metaObj === 'object') {
    const total = Number(metaObj.total ?? metaObj.totalCount ?? 0)
    const page = Number(metaObj.page ?? metaObj.currentPage ?? 1)
    const limit = Number(metaObj.limit ?? metaObj.pageSize ?? 20)
    const totalPages = Number(
      metaObj.totalPages ?? metaObj.pageCount ?? Math.max(1, Math.ceil(total / (limit || 1))),
    )
    return { page, limit, total, totalPages }
  }

  if (typeof obj.total === 'number' || typeof obj.totalPages === 'number') {
    const total = Number(obj.total ?? 0)
    const page = Number(obj.page ?? 1)
    const limit = Number(obj.limit ?? 20)
    const totalPages = Number(obj.totalPages ?? Math.max(1, Math.ceil(total / (limit || 1))))
    return { page, limit, total, totalPages }
  }

  return null
}

export interface SectionModuleGroup {
  key: string
  title: string
  permissions: PermissionItem[]
}

export interface PermissionSectionGroup {
  number: number
  id: string
  title: string
  modules: SectionModuleGroup[]
  totalPermissions: number
  assignedCount: number
}

/**
 * Groups permissions into distinct Dashboard Navigation Sections (1, 2, 3, 4)
 * matching the sidebar sections and structure.
 */
export function groupPermissionsBySections(
  permissions: PermissionItem[],
  isPermissionChecked: (p: PermissionItem) => boolean,
): PermissionSectionGroup[] {
  const sectionDefs = [
    {
      number: 1,
      id: 'section-jobs',
      title: 'Jobs & Applications',
      modules: [
        {
          key: 'all_jobs',
          title: 'All Jobs',
          match: (name: string) =>
            (name.startsWith('job_post.') || name.startsWith('job.') || name.startsWith('jobs.')) &&
            !name.endsWith('.create'),
        },
        {
          key: 'create_job',
          title: 'Create Job',
          match: (name: string) =>
            (name.startsWith('job_post.') || name.startsWith('job.') || name.startsWith('jobs.')) &&
            name.endsWith('.create'),
        },
        {
          key: 'applications',
          title: 'Applications',
          match: (name: string) =>
            name.startsWith('application.') || name.startsWith('applications.'),
        },
        {
          key: 'job_tasks',
          title: 'Job Tasks',
          match: (name: string) => name.startsWith('task.') || name.startsWith('tasks.'),
        },
      ],
    },
    {
      number: 2,
      id: 'section-recruitment',
      title: 'Recruitment & Interviews',
      modules: [
        {
          key: 'interview_hub',
          title: 'Interview Hub',
          match: (name: string) => name.startsWith('interview.') || name.startsWith('interviews.'),
        },
      ],
    },
    {
      number: 3,
      id: 'section-governance',
      title: 'Administration & Security',
      modules: [
        {
          key: 'user_management',
          title: 'User Management',
          match: (name: string) =>
            name.startsWith('user.') &&
            !name.startsWith('user.profile.') &&
            !name.startsWith('user.password.') &&
            !name.startsWith('user.email.') &&
            !name.startsWith('user.avatar.'),
        },
        {
          key: 'roles_permissions',
          title: 'Roles & Permissions',
          match: (name: string) =>
            name.startsWith('role.') ||
            name.startsWith('roles.') ||
            name.startsWith('permission.') ||
            name.startsWith('permissions.'),
        },
        {
          key: 'documents',
          title: 'Documents & Files',
          match: (name: string) => name.startsWith('document.'),
        },
        {
          key: 'user_self_service',
          title: 'User Self-Service',
          match: (name: string) =>
            name.startsWith('user.profile.') ||
            name.startsWith('user.password.') ||
            name.startsWith('user.email.') ||
            name.startsWith('user.avatar.'),
        },
      ],
    },
  ]

  const matchedPermIds = new Set<string>()
  const result: PermissionSectionGroup[] = []

  for (const sDef of sectionDefs) {
    const modulesList: SectionModuleGroup[] = []
    let totalInSec = 0
    let assignedInSec = 0

    for (const mDef of sDef.modules) {
      const modulePerms = permissions.filter((p) => {
        if (!p || !p.name) return false
        const lowerName = p.name.toLowerCase()
        return mDef.match(lowerName)
      })

      if (modulePerms.length > 0) {
        modulePerms.forEach((p) => matchedPermIds.add(p.id || p.name))
        const assignedCount = modulePerms.filter((p) => isPermissionChecked(p)).length
        totalInSec += modulePerms.length
        assignedInSec += assignedCount

        modulesList.push({
          key: mDef.key,
          title: mDef.title,
          permissions: modulePerms,
        })
      }
    }

    if (modulesList.length > 0) {
      result.push({
        number: sDef.number,
        id: sDef.id,
        title: sDef.title,
        modules: modulesList,
        totalPermissions: totalInSec,
        assignedCount: assignedInSec,
      })
    }
  }

  // Any remaining permissions not covered by Sections 1-4
  const extraPerms = permissions.filter((p) => !matchedPermIds.has(p.id || p.name))
  if (extraPerms.length > 0) {
    result.push({
      number: 5,
      id: 'section-other',
      title: 'Additional Privileges',
      modules: [
        {
          key: 'other',
          title: 'General & Custom Permissions',
          permissions: extraPerms,
        },
      ],
      totalPermissions: extraPerms.length,
      assignedCount: extraPerms.filter((p) => isPermissionChecked(p)).length,
    })
  }

  return result
}

function formatModuleName(mod: string): string {
  return mod
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ─── Create/Edit Role Dialog ─────────────────────────────────────────────────

function normalizeRoleNameInput(value: string): string {
  return value
    .toUpperCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^A-Z0-9_]/g, '')
    .replace(/_{2,}/g, '_')
}

function RoleFormDialog({
  open,
  onClose,
  onSuccess,
  editRole,
}: {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  editRole?: RoleItem | null
}) {
  const isEditing = !!editRole
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { mutate: createRole, isPending: isCreating } = useCreateRole()
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole()
  const isSaving = isCreating || isUpdating

  useEffect(() => {
    if (open) {
      setName(editRole?.name || editRole?.roleName || '')
      setDescription(editRole?.description || '')
      setError(null)
    }
  }, [open, editRole])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const formattedName = normalizeRoleNameInput(name).replace(/^_+|_+$/g, '')
    if (!formattedName) {
      setError('Role name is required.')
      return
    }

    if (isEditing && editRole) {
      updateRole(
        { id: editRole.id, payload: { name: formattedName, description: description.trim() } },
        {
          onSuccess: () => {
            onSuccess?.()
            onClose()
          },
          onError: (err) => {
            setError(err.message)
          },
        },
      )
    } else {
      createRole(
        { name: formattedName, description: description.trim() },
        {
          onSuccess: () => {
            onSuccess?.()
            onClose()
          },
          onError: (err) => {
            setError(err.message)
          },
        },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <Shield className="size-4 text-purple-400" />
            {isEditing ? 'Edit Role' : 'Create New Role'}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            {isEditing
              ? 'Update the role name and description.'
              : 'Create a new role. You can assign permissions after creation.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2 text-xs text-red-400">
              <AlertTriangle className="size-3.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Role Name *</Label>
              <span className="text-[10px] text-zinc-500 font-mono">UPPER_SNAKE_CASE</span>
            </div>
            <Input
              value={name}
              onChange={(e) => setName(normalizeRoleNameInput(e.target.value))}
              placeholder="e.g. HR_MANAGEMENT, RECRUITER"
              className="text-xs h-9 bg-zinc-900 border-zinc-700 font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this role"
              className="text-xs h-9 bg-zinc-900 border-zinc-700"
            />
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-500 text-white cursor-pointer gap-2"
            >
              {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : null}
              {isEditing ? 'Save Changes' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete Role Dialog ──────────────────────────────────────────────────────

function DeleteRoleDialog({
  role,
  open,
  onClose,
  onSuccess,
}: {
  role: RoleItem | null
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const { mutate: deleteRole, isPending: isSaving } = useDeleteRole()

  const handleConfirm = () => {
    if (!role) return
    deleteRole(role.id, {
      onSuccess: () => {
        onSuccess?.()
        onClose()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-400" />
            Delete Role
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            This will permanently delete the role{' '}
            <span className="font-semibold text-zinc-200">
              &quot;{role?.name || role?.roleName}&quot;
            </span>
            . Users assigned to this role will lose its permissions. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-500 text-white cursor-pointer gap-2"
          >
            {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Delete Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Permissions Panel (Sheet) ───────────────────────────────────────────────

const PAGE_SIZE = 100 // Backend enforces max limit of 100

function PermissionsPanel({
  role,
  open,
  onClose,
  onSuccess,
}: {
  role: RoleItem | null
  allPermissions?: PermissionItem[]
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const [assigned, setAssigned] = useState<Set<string>>(new Set())
  const [knownIdMap, setKnownIdMap] = useState<Record<string, string>>({})
  const [panelPerms, setPanelPerms] = useState<PermissionItem[]>(STATIC_PERMISSIONS)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sectionFilter, setSectionFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(STATIC_PERMISSIONS.length)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPerms, setIsLoadingPerms] = useState(false)

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Helper to extract all key variants from permission items/raw response
  const addPermissionKeys = useCallback((keys: Set<string>, rawItems: unknown[]) => {
    const normalized = normalizePermissionList(rawItems)
    for (const p of normalized) {
      keys.add(p.name)
      keys.add(p.name.toLowerCase())
      if (p.id) {
        keys.add(String(p.id))
        setKnownIdMap((prev) => ({
          ...prev,
          [p.name]: p.id,
          [p.name.toLowerCase()]: p.id,
          [p.id]: p.id,
        }))
      }
    }
    for (const item of rawItems) {
      if (typeof item === 'string') {
        keys.add(item.trim())
        keys.add(item.trim().toLowerCase())
      } else if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>
        if (o.permissionId) keys.add(String(o.permissionId))
        if (o.id) keys.add(String(o.id))
        if (typeof o.name === 'string') {
          keys.add(o.name.trim())
          keys.add(o.name.trim().toLowerCase())
          if (o.id) {
            setKnownIdMap((prev) => ({ ...prev, [o.name as string]: String(o.id) }))
          }
        }
        if (o.permission && typeof o.permission === 'object') {
          const p = o.permission as Record<string, unknown>
          if (typeof p.name === 'string') {
            keys.add(p.name.trim())
            keys.add(p.name.trim().toLowerCase())
            if (p.id) {
              setKnownIdMap((prev) => ({ ...prev, [p.name as string]: String(p.id) }))
            }
          }
          if (p.id) keys.add(String(p.id))
        }
      }
    }
  }, [])

  // Fetch assigned permissions for selected role
  useEffect(() => {
    if (!role || !open) return
    let cancelled = false
    setIsLoading(true)

    const initialKeys = new Set<string>()

    if (role.permissions && Array.isArray(role.permissions)) {
      addPermissionKeys(initialKeys, role.permissions)
      setAssigned(new Set(initialKeys))
    }

    api
      .getRolePermissions(role.id)
      .then((res) => {
        if (cancelled) return
        const keys = new Set(initialKeys)
        const rawList = Array.isArray(res)
          ? res
          : Array.isArray((res as Record<string, unknown>)?.data)
            ? ((res as Record<string, unknown>).data as unknown[])
            : (res as Record<string, unknown>)?.data &&
                typeof (res as Record<string, unknown>).data === 'object' &&
                Array.isArray(
                  ((res as Record<string, unknown>).data as Record<string, unknown>).permissions,
                )
              ? (((res as Record<string, unknown>).data as Record<string, unknown>)
                  .permissions as unknown[])
              : Array.isArray((res as Record<string, unknown>)?.permissions)
                ? ((res as Record<string, unknown>).permissions as unknown[])
                : []

        addPermissionKeys(keys, rawList)
        setAssigned(keys)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [role, open, addPermissionKeys])

  // Fetch permissions with backend parameters
  const fetchSystemPermissions = useCallback(async () => {
    if (!open) return
    setIsLoadingPerms(true)
    try {
      const query: import('@/lib/api').QueryPermissionDto = {
        page,
        limit: PAGE_SIZE,
        sortBy: 'name',
        sortOrder: sortOrder,
      }
      if (debouncedSearch.trim()) {
        query.search = debouncedSearch.trim()
      }

      const res = await api.getAllPermissions(query)
      console.log('[PermissionsPanel] raw API response:', JSON.stringify(res).slice(0, 500))
      const normalized = normalizePermissionList(res)
      console.log('[PermissionsPanel] normalized count:', normalized.length, normalized.slice(0, 3))

      // Only replace the panel list if the API actually returned permissions.
      // If it returns 0 (e.g. empty DB or parse failure), keep the static fallback.
      if (normalized.length > 0) {
        setPanelPerms(normalized)

        // Store known IDs for correct save
        setKnownIdMap((prev) => {
          const next = { ...prev }
          normalized.forEach((p) => {
            if (p.id) {
              next[p.name] = p.id
              next[p.name.toLowerCase()] = p.id
              next[p.id] = p.id
            }
          })
          return next
        })

        const meta = extractPermissionPaginationMeta(res)
        if (meta) {
          setTotalCount(meta.total)
          setTotalPages(Math.max(1, meta.totalPages))
        } else {
          setTotalCount(normalized.length)
          setTotalPages(1)
        }
      } else {
        // API returned nothing — keep static fallback, just update count
        console.warn('[PermissionsPanel] API returned 0 permissions, keeping static fallback')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[PermissionsPanel] fetch error:', msg)

      // If we got a 403 / auth error, fall back to the static list so the panel still works
      if (
        msg.toLowerCase().includes('forbidden') ||
        msg.toLowerCase().includes('unauthorized') ||
        msg.toLowerCase().includes('403') ||
        msg.toLowerCase().includes('401')
      ) {
        console.warn(
          '[PermissionsPanel] Using static fallback permissions (API returned auth error)',
        )
        setPanelPerms(STATIC_PERMISSIONS)
        setTotalCount(STATIC_PERMISSIONS.length)
        setTotalPages(1)
      } else {
        toast.error(`Failed to load permissions: ${msg}`)
      }
    } finally {
      setIsLoadingPerms(false)
    }
  }, [open, page, debouncedSearch, sortOrder])

  // Re-fetch when open, page, debouncedSearch, or sortOrder change
  useEffect(() => {
    if (open) {
      fetchSystemPermissions()
    }
  }, [open, fetchSystemPermissions])

  // Reset filter/search on open
  useEffect(() => {
    if (open) {
      setSearch('')
      setDebouncedSearch('')
      setSectionFilter('all')
      setSortOrder('asc')
      setPage(1)
    }
  }, [open])

  const isPermissionChecked = useCallback(
    (perm: PermissionItem): boolean => {
      return (
        assigned.has(perm.name) ||
        assigned.has(perm.name.toLowerCase()) ||
        assigned.has(perm.id) ||
        (Boolean(perm.id) && assigned.has(String(perm.id)))
      )
    },
    [assigned],
  )

  const togglePermission = (perm: PermissionItem) => {
    setAssigned((prev) => {
      const next = new Set(prev)
      const isChecked = isPermissionChecked(perm)
      if (isChecked) {
        next.delete(perm.name)
        next.delete(perm.name.toLowerCase())
        next.delete(perm.id)
        if (perm.id) next.delete(String(perm.id))
      } else {
        next.add(perm.name)
        next.add(perm.name.toLowerCase())
        if (perm.id) next.add(String(perm.id))
      }
      return next
    })
  }

  const selectSection = (section: PermissionSectionGroup) => {
    setAssigned((prev) => {
      const next = new Set(prev)
      for (const mod of section.modules) {
        for (const p of mod.permissions) {
          next.add(p.name)
          next.add(p.name.toLowerCase())
          if (p.id) next.add(String(p.id))
        }
      }
      return next
    })
  }

  const deselectSection = (section: PermissionSectionGroup) => {
    setAssigned((prev) => {
      const next = new Set(prev)
      for (const mod of section.modules) {
        for (const p of mod.permissions) {
          next.delete(p.name)
          next.delete(p.name.toLowerCase())
          next.delete(p.id)
          if (p.id) next.delete(String(p.id))
        }
      }
      return next
    })
  }

  const selectModule = (mod: SectionModuleGroup) => {
    setAssigned((prev) => {
      const next = new Set(prev)
      for (const p of mod.permissions) {
        next.add(p.name)
        next.add(p.name.toLowerCase())
        if (p.id) next.add(String(p.id))
      }
      return next
    })
  }

  const deselectModule = (mod: SectionModuleGroup) => {
    setAssigned((prev) => {
      const next = new Set(prev)
      for (const p of mod.permissions) {
        next.delete(p.name)
        next.delete(p.name.toLowerCase())
        next.delete(p.id)
        if (p.id) next.delete(String(p.id))
      }
      return next
    })
  }

  const selectAllCurrentPage = () => {
    setAssigned((prev) => {
      const next = new Set(prev)
      for (const p of panelPerms) {
        next.add(p.name)
        next.add(p.name.toLowerCase())
        if (p.id) next.add(String(p.id))
      }
      return next
    })
  }

  const deselectAllCurrentPage = () => {
    setAssigned((prev) => {
      const next = new Set(prev)
      for (const p of panelPerms) {
        next.delete(p.name)
        next.delete(p.name.toLowerCase())
        next.delete(p.id)
        if (p.id) next.delete(String(p.id))
      }
      return next
    })
  }

  const { mutate: updatePermissionsMutation, isPending: isSaving } = useUpdateRolePermissions()

  const handleSave = () => {
    if (!role) return
    // Find IDs for all selected permissions
    const permissionIdsSet = new Set<string>()
    for (const key of assigned) {
      const id = knownIdMap[key] || knownIdMap[key.toLowerCase()]
      if (id) {
        permissionIdsSet.add(id)
      } else {
        permissionIdsSet.add(key)
      }
    }

    updatePermissionsMutation(
      {
        roleId: role.id,
        payload: {
          permissionIds: Array.from(permissionIdsSet),
          permissions: Array.from(assigned),
        },
      },
      {
        onSuccess: () => {
          onSuccess?.()
          onClose()
        },
      },
    )
  }

  // Group permissions into 4 distinct Dashboard Sections
  const allGroupedSections = groupPermissionsBySections(panelPerms, isPermissionChecked)

  // Filter sections if dropdown is active
  const displayedSections =
    sectionFilter === 'all'
      ? allGroupedSections
      : allGroupedSections.filter(
          (sec) =>
            sec.id === sectionFilter ||
            String(sec.number) === sectionFilter ||
            sec.modules.some((m) => m.key === sectionFilter),
        )

  const totalSelectedCount = Array.from(assigned).filter(
    (k) => !k.includes('-') || k.length < 32,
  ).length

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full max-w-full sm:max-w-[92vw] md:max-w-[760px] lg:max-w-[820px] bg-zinc-950 border-l border-zinc-800 text-zinc-100 flex flex-col p-0 gap-0 h-full max-h-screen overflow-hidden"
      >
        <SheetHeader className="border-b border-zinc-800 p-3.5 sm:p-5 pb-3 shrink-0">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="size-7 shrink-0 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 cursor-pointer -ml-1 sm:-ml-1.5 transition-colors"
                title="Close"
              >
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
              <SheetTitle className="text-sm sm:text-base text-white flex items-center gap-1.5 sm:gap-2 truncate">
                <Key className="size-4 text-purple-400 shrink-0" />
                <span className="truncate">Manage Permissions</span>
              </SheetTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchSystemPermissions}
              disabled={isLoadingPerms}
              className="h-7 px-2 text-[11px] text-zinc-400 hover:text-white shrink-0"
            >
              <RefreshCw className={cn('size-3 mr-1', isLoadingPerms && 'animate-spin')} />
              Refresh
            </Button>
          </div>
          <SheetDescription className="text-xs text-zinc-400">
            Assign permissions to{' '}
            <span className="font-semibold text-zinc-200">{role?.name || role?.roleName}</span>
          </SheetDescription>

          <div className="pt-2">
            <Input
              placeholder="Search permissions (e.g. user, job_post, interview, task)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs bg-zinc-900/60 border-zinc-800 placeholder:text-zinc-500 w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <Select
              value={sectionFilter}
              onValueChange={(val) => {
                setSectionFilter(val)
              }}
            >
              <SelectTrigger className="h-7 text-[11px] bg-zinc-900/60 border-zinc-800 text-zinc-300 flex-1 min-w-0">
                <Filter className="size-3 mr-1 text-zinc-500 shrink-0" />
                <SelectValue placeholder="All Sections" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-h-64">
                <SelectItem value="all" className="text-xs font-medium">
                  All Sections (1 - 4)
                </SelectItem>
                <SelectItem value="section-overview" className="text-xs font-mono">
                  [1] Overview & Reports
                </SelectItem>
                <SelectItem value="section-jobs" className="text-xs font-mono">
                  [2] Jobs & Applications
                </SelectItem>
                <SelectItem value="section-recruitment" className="text-xs font-mono">
                  [3] Recruitment & Interviews
                </SelectItem>
                <SelectItem value="section-governance" className="text-xs font-mono">
                  [4] Administration & Security
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(v) => {
                setSortOrder(v as 'asc' | 'desc')
                setPage(1)
              }}
            >
              <SelectTrigger className="h-7 text-[11px] bg-zinc-900/60 border-zinc-800 text-zinc-300 w-full sm:w-36 shrink-0">
                <ArrowUpDown className="size-3 mr-1 text-zinc-500 shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <SelectItem value="asc" className="text-xs">
                  Name (A → Z)
                </SelectItem>
                <SelectItem value="desc" className="text-xs">
                  Name (Z → A)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-y-1.5 gap-x-2 text-[11px] text-zinc-400 pt-1">
            <span className="font-mono text-purple-400 font-medium truncate">
              Total: {totalCount} permissions{' '}
              {totalSelectedCount > 0 && `(${totalSelectedCount} assigned)`}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={selectAllCurrentPage}
                className="text-purple-400 hover:text-purple-300 font-medium cursor-pointer text-[11px]"
              >
                Select All
              </button>
              <span className="text-zinc-600">•</span>
              <button
                type="button"
                onClick={deselectAllCurrentPage}
                className="text-zinc-400 hover:text-zinc-200 cursor-pointer text-[11px]"
              >
                Deselect All
              </button>
            </div>
          </div>
        </SheetHeader>

        {isLoading || isLoadingPerms ? (
          <div className="flex items-center justify-center flex-1 min-h-0 gap-2 text-zinc-400 text-xs">
            <Loader2 className="size-4 animate-spin text-purple-400" />
            Loading permissions from server...
          </div>
        ) : (
          <ScrollArea data-lenis-prevent="true" className="flex-1 min-h-0 h-full w-full">
            <div className="flex flex-col gap-4 sm:gap-5 px-3 sm:px-5 py-3 sm:py-4 pr-3 sm:pr-5">
              {displayedSections.map((section) => {
                const sectionColorMap: Record<
                  number,
                  { bg: string; border: string; text: string; dot: string }
                > = {
                  1: {
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/30',
                    text: 'text-emerald-300',
                    dot: 'bg-emerald-400',
                  },
                  2: {
                    bg: 'bg-sky-500/10',
                    border: 'border-sky-500/30',
                    text: 'text-sky-300',
                    dot: 'bg-sky-400',
                  },
                  3: {
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/30',
                    text: 'text-amber-300',
                    dot: 'bg-amber-400',
                  },
                  4: {
                    bg: 'bg-purple-500/10',
                    border: 'border-purple-500/30',
                    text: 'text-purple-300',
                    dot: 'bg-purple-400',
                  },
                  5: {
                    bg: 'bg-zinc-500/10',
                    border: 'border-zinc-500/30',
                    text: 'text-zinc-300',
                    dot: 'bg-zinc-400',
                  },
                }
                const color = sectionColorMap[section.number] || sectionColorMap[4]

                return (
                  <div
                    key={section.id}
                    className="rounded-xl border border-zinc-800/90 bg-zinc-950/80 overflow-hidden shadow-xs"
                  >
                    <div
                      className={cn(
                        'flex items-center justify-between px-3 sm:px-4 py-2.5 border-b',
                        color.bg,
                        color.border,
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn('size-2 rounded-full shrink-0', color.dot)} />
                        <span
                          className={cn(
                            'text-[11px] sm:text-xs font-bold uppercase tracking-wider truncate',
                            color.text,
                          )}
                        >
                          [{section.number}] {section.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] h-4 px-1.5 py-0 shrink-0 font-mono',
                            color.border,
                            color.text,
                          )}
                        >
                          {section.assignedCount}/{section.totalPermissions}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                        <button
                          type="button"
                          onClick={() => selectSection(section)}
                          className={cn('hover:underline font-medium cursor-pointer', color.text)}
                        >
                          Select All
                        </button>
                        <span className="text-zinc-600">•</span>
                        <button
                          type="button"
                          onClick={() => deselectSection(section)}
                          className="text-zinc-400 hover:underline cursor-pointer"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    <div className="p-2 sm:p-3 flex flex-col gap-3">
                      {section.modules.map((mod) => {
                        return (
                          <div
                            key={mod.key}
                            className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2 sm:p-3 flex flex-col gap-2"
                          >
                            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-xs font-semibold text-zinc-200 capitalize truncate">
                                  {mod.title}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[9px] h-4 px-1 py-0 text-zinc-400 border-zinc-700 shrink-0 font-mono"
                                >
                                  {mod.permissions.filter((p) => isPermissionChecked(p)).length}/
                                  {mod.permissions.length}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] shrink-0">
                                <button
                                  type="button"
                                  onClick={() => selectModule(mod)}
                                  className="text-purple-400 hover:underline cursor-pointer"
                                >
                                  Select All
                                </button>
                                <span className="text-zinc-600">•</span>
                                <button
                                  type="button"
                                  onClick={() => deselectModule(mod)}
                                  className="text-zinc-400 hover:underline cursor-pointer"
                                >
                                  Deselect All
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-1.5">
                              {mod.permissions.map((perm) => {
                                const isChecked = isPermissionChecked(perm)
                                return (
                                  <div
                                    key={perm.id || perm.name}
                                    className={cn(
                                      'flex items-start gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-lg border transition-colors cursor-pointer',
                                      isChecked
                                        ? 'border-purple-500/40 bg-purple-500/10'
                                        : 'border-zinc-800/60 bg-zinc-900/30 hover:bg-zinc-800/40',
                                    )}
                                    onClick={() => togglePermission(perm)}
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={() => togglePermission(perm)}
                                      className="mt-0.5 shrink-0 border-zinc-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                    />
                                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <span
                                          className={cn(
                                            'text-[11px] sm:text-xs font-mono break-all',
                                            isChecked
                                              ? 'font-semibold text-purple-300'
                                              : 'text-zinc-300',
                                          )}
                                        >
                                          {perm.name}
                                        </span>
                                        {isChecked && (
                                          <Badge
                                            variant="outline"
                                            className="text-[9px] h-4 px-1.5 py-0 shrink-0 bg-purple-500/20 text-purple-300 border-purple-500/30"
                                          >
                                            Assigned
                                          </Badge>
                                        )}
                                      </div>
                                      {perm.description && perm.description !== perm.name && (
                                        <span className="text-[10px] text-zinc-500 leading-relaxed break-words">
                                          {perm.description}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {panelPerms.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <span className="text-xs text-zinc-500">
                    No permissions found matching your criteria.
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchSystemPermissions}
                    disabled={isLoadingPerms}
                    className="text-xs"
                  >
                    <RefreshCw className={cn('size-3 mr-1.5', isLoadingPerms && 'animate-spin')} />
                    Retry Fetching Permissions
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {!isLoading && !isLoadingPerms && totalPages > 1 && (
          <div className="border-t border-zinc-800 px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2 bg-zinc-950 shrink-0">
            <span className="text-[11px] text-zinc-500">
              Page {page} of {totalPages}
              <span className="ml-1 text-zinc-600">({totalCount} total)</span>
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 w-7 p-0 text-zinc-400 hover:text-white cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="text-[11px] text-zinc-600 px-1">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={cn(
                        'h-7 w-7 text-[11px] rounded font-medium transition-colors cursor-pointer',
                        page === p
                          ? 'bg-purple-600 text-white'
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white',
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 w-7 p-0 text-zinc-400 hover:text-white cursor-pointer"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}

        <div className="border-t border-zinc-800 p-3.5 sm:p-4 bg-zinc-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-zinc-400 text-center sm:text-left">
            <span className="font-semibold text-white font-mono">{totalSelectedCount}</span>{' '}
            permissions assigned
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
              className="text-xs cursor-pointer border-zinc-800 flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="text-xs bg-purple-600 hover:bg-purple-500 text-white cursor-pointer gap-1.5 flex-1 sm:flex-none"
            >
              {isSaving && <Loader2 className="size-3.5 animate-spin" />}
              Save Permissions
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Main RolesView ───────────────────────────────────────────────────────────

export function RolesView() {
  const {
    data: rolesRes,
    isLoading: isLoadingRoles,
    isFetching,
    refetch: handleRefresh,
  } = useRoles()
  const { data: permsResult } = useAllPermissions()

  // Dialog/sheet state
  const [showCreate, setShowCreate] = useState(false)
  const [editRole, setEditRole] = useState<RoleItem | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [deleteRole, setDeleteRole] = useState<RoleItem | null>(null)
  const [showDelete, setShowDelete] = useState(false)
  const [permRole, setPermRole] = useState<RoleItem | null>(null)
  const [showPerms, setShowPerms] = useState(false)

  const roles: RoleItem[] = useMemo(() => {
    if (!rolesRes) return []
    if (Array.isArray(rolesRes)) return rolesRes as RoleItem[]
    if (Array.isArray(rolesRes.data)) return rolesRes.data as RoleItem[]
    if (
      rolesRes.data &&
      typeof rolesRes.data === 'object' &&
      'roles' in rolesRes.data &&
      Array.isArray((rolesRes.data as Record<string, unknown>).roles)
    ) {
      return (rolesRes.data as Record<string, unknown>).roles as RoleItem[]
    }
    if (Array.isArray(rolesRes.roles)) return rolesRes.roles
    return []
  }, [rolesRes])

  const allPermissions: PermissionItem[] = useMemo(() => {
    let permsList: PermissionItem[] = []
    if (permsResult) {
      permsList = normalizePermissionList(permsResult)
    }

    // If /permissions returned empty, also aggregate any embedded permissions across loaded roles
    if (permsList.length === 0 && roles.length > 0) {
      const embeddedMap = new Map<string, PermissionItem>()
      for (const r of roles) {
        if (r.permissions && Array.isArray(r.permissions)) {
          const list = normalizePermissionList(r.permissions)
          for (const item of list) {
            if (!embeddedMap.has(item.name)) {
              embeddedMap.set(item.name, item)
            }
          }
        }
      }
      permsList = Array.from(embeddedMap.values())
    }

    return permsList.length > 0 ? permsList : STATIC_PERMISSIONS
  }, [permsResult, roles])

  const isLoading = isLoadingRoles

  if (isLoading && roles.length === 0) {
    return <RolesSkeleton />
  }

  return (
    <RoleGuard
      fallback={<RolesSkeleton />}
      permissions={[
        'role.read',
        'role.create',
        'role.update',
        'role.delete',
        'permission.read',
        'permission.assign',
        'roles.read',
        'roles.create',
        'roles.update',
        'roles.delete',
      ]}
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Shield className="size-6 text-purple-400" />
              Roles & Permissions
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create and manage dynamic roles. Assign fine-grained permissions to control what each
              role can access.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRefresh()}
              disabled={isLoading || isFetching}
              className="gap-2 cursor-pointer border-border"
            >
              <RefreshCw className={cn('size-3.5', (isLoading || isFetching) && 'animate-spin')} />
              Refresh
            </Button>

            <PermissionGate permission="roles.create">
              <Button
                size="sm"
                onClick={() => setShowCreate(true)}
                className="gap-2 bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
              >
                <Plus className="size-3.5" />
                New Role
              </Button>
            </PermissionGate>
          </div>
        </div>

        {/* Roles List */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32 rounded-md" />
                    <Skeleton className="h-3 w-48 rounded-md" />
                    <Skeleton className="h-3 w-36 rounded-md" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <Skeleton className="h-8 w-32 rounded-lg" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="size-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : roles.length === 0 ? (
          <Card className="border-border/80 bg-card/60">
            <CardContent className="flex flex-col items-center justify-center h-48 gap-3">
              <Shield className="size-8 text-zinc-600" />
              <p className="text-xs text-muted-foreground">
                No roles found. Create your first role to get started.
              </p>
              <PermissionGate permission="roles.create">
                <Button
                  size="sm"
                  onClick={() => setShowCreate(true)}
                  className="gap-2 bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  Create First Role
                </Button>
              </PermissionGate>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => {
              const permCount = Array.isArray(role.permissions) ? role.permissions.length : null

              return (
                <Card
                  key={role.id}
                  className="border-border/80 bg-card/60 flex flex-col gap-0 overflow-hidden hover:border-purple-500/40 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1 min-w-0">
                        <CardTitle className="text-sm font-bold text-foreground truncate">
                          {role.name || role.roleName}
                        </CardTitle>
                        {role.description && (
                          <CardDescription className="text-[11px] leading-relaxed line-clamp-2">
                            {role.description}
                          </CardDescription>
                        )}
                      </div>

                      {permCount !== null && (
                        <Badge
                          variant="outline"
                          className="text-[9px] shrink-0 bg-purple-500/10 text-purple-400 border-purple-500/30"
                        >
                          {permCount} perm{permCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <Separator className="bg-border/60" />

                  <CardContent className="pt-3 pb-3 flex items-center justify-between gap-2">
                    {/* Permission management button */}
                    <PermissionGate permission="roles.update">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-[11px] text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 cursor-pointer h-7 px-2"
                        onClick={() => {
                          setPermRole(role)
                          setShowPerms(true)
                        }}
                      >
                        <Key className="size-3" />
                        Permissions
                        <ChevronRight className="size-3" />
                      </Button>
                    </PermissionGate>

                    {/* Edit / Delete actions */}
                    <div className="flex items-center gap-1">
                      <PermissionGate permission="roles.update">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 cursor-pointer"
                          onClick={() => {
                            setEditRole(role)
                            setShowEdit(true)
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </PermissionGate>

                      <PermissionGate permission="roles.delete">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-red-400/70 hover:text-red-300 hover:bg-red-950/30 cursor-pointer"
                          onClick={() => {
                            setDeleteRole(role)
                            setShowDelete(true)
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </PermissionGate>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Dialogs & Panels */}
      <RoleFormDialog open={showCreate} onClose={() => setShowCreate(false)} />

      <RoleFormDialog
        open={showEdit}
        onClose={() => {
          setShowEdit(false)
          setEditRole(null)
        }}
        editRole={editRole}
      />

      <DeleteRoleDialog
        role={deleteRole}
        open={showDelete}
        onClose={() => {
          setShowDelete(false)
          setDeleteRole(null)
        }}
      />

      <PermissionsPanel
        role={permRole}
        allPermissions={allPermissions}
        open={showPerms}
        onClose={() => {
          setShowPerms(false)
          setPermRole(null)
        }}
      />
    </RoleGuard>
  )
}
