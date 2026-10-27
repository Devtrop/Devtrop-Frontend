'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { UserManagementSkeleton } from '@/components/dashboard/users/UserManagementSkeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { PermissionGate } from '@/components/dashboard/PermissionGate'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Combobox, ComboboxOption } from '@/components/ui/combobox'
import { usePermission } from '@/contexts/PermissionContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Loader2,
  MoreHorizontal,
  UserCog,
  UserX,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Archive,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
  SlidersHorizontal,
  RotateCcw,
  Users,
  ChevronDown,
  Check,
  UserPlus,
  Mail,
  Ban,
  Clock,
  Send,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  api,
  ApiError,
  UserListItem,
  UserDetail,
  RoleItem,
  UpdateUserStatusPayload,
  EditableUserStatus,
  UserInvitationSummary,
  InvitationStatus,
  CreateUserPayload,
} from '@/lib/api'
import {
  useUsers,
  useDeletedUsers,
  useUser,
  useCreateUser,
  useResendInvitation,
  useRevokeInvitation,
  useUpdateUserStatus,
  useUpdateUserRole,
  useDeactivateUser,
  useDeleteUser,
  useRestoreUser,
  useRoles,
  useRole,
  type QueryUsersParams,
} from '@/lib/query'
import { useAuth } from '@/contexts/AuthContext'
import { normalizeRole, ROLES } from '@/config/roles.config'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { createUserInvitationSchema } from '@/lib/validations'

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: 'text-accent bg-accent-soft border-accent',
    INACTIVE: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    SUSPENDED: 'text-red-400 bg-red-500/10 border-red-500/30',
    DELETED: 'text-muted bg-zinc-500/10 border-hairline-light/30',
  }
  const cls = map[status?.toUpperCase()] || map.INACTIVE
  return (
    <Badge variant="outline" className={cn('text-[10px] font-semibold gap-1', cls)}>
      <span className="size-1.5 rounded-full bg-current" />
      {status || 'UNKNOWN'}
    </Badge>
  )
}

// ─── Invitation Badge ────────────────────────────────────────────────────────

function InvitationBadge({ invitation }: { invitation?: UserInvitationSummary | null }) {
  if (!invitation) {
    return <span className="text-muted text-xs">—</span>
  }

  const status = (invitation.status || '').toUpperCase()
  const map: Record<string, { label: string; cls: string; dot: string }> = {
    PENDING: {
      label: 'Invitation Pending',
      cls: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      dot: 'bg-amber-400',
    },
    ACCEPTED: {
      label: 'Accepted',
      cls: 'text-accent bg-accent-soft border-accent',
      dot: 'bg-accent',
    },
    EXPIRED: {
      label: 'Invitation Expired',
      cls: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      dot: 'bg-rose-400',
    },
    REVOKED: {
      label: 'Invitation Revoked',
      cls: 'text-muted bg-zinc-700/20 border-hairline-light/40',
      dot: 'bg-zinc-500',
    },
  }

  const cfg = map[status] || {
    label: invitation.status || '—',
    cls: 'text-muted bg-muted/40 border-hairline-light',
    dot: 'bg-zinc-500',
  }

  const expiresDate = invitation.expiresAt
    ? new Date(invitation.expiresAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <Badge
      variant="outline"
      title={expiresDate ? `Expires: ${expiresDate}` : undefined}
      className={cn('text-[10px] font-semibold gap-1 whitespace-nowrap', cfg.cls)}
    >
      <span className={cn('size-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </Badge>
  )
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({
  roleRaw,
}: {
  roleRaw: string | { name?: string; roleName?: string; role_name?: string } | undefined
}) {
  const roleName =
    typeof roleRaw === 'string'
      ? roleRaw
      : (roleRaw?.name ?? roleRaw?.roleName ?? roleRaw?.role_name ?? '')
  const displayName = roleName
    ? roleName
        .split(/[_\s-]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    : '—'
  const key = normalizeRole(roleName)
  const cfg = ROLES[key] || ROLES.USER
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] font-semibold gap-1',
        cfg.badgeColor.bg,
        cfg.badgeColor.text,
        cfg.badgeColor.border,
      )}
    >
      <span className={cn('size-1.5 rounded-full', cfg.badgeColor.dot)} />
      {displayName}
    </Badge>
  )
}

// ─── User Detail Sheet ───────────────────────────────────────────────────────

function UserDetailSheet({
  userId,
  open,
  onClose,
  rolesMap = {},
  onSuccess,
}: {
  userId: string | null
  open: boolean
  onClose: () => void
  rolesMap?: Record<string, string>
  onSuccess?: () => void
}) {
  const { data: userRes, isLoading: loading } = useUser(open ? userId : null)
  const { mutate: restoreUser, isPending: isRestoring } = useRestoreUser()
  const { mutate: resendInv, isPending: isResendingInv } = useResendInvitation()
  const { mutate: revokeInv, isPending: isRevokingInv } = useRevokeInvitation()
  const { hasPermission } = usePermission()
  const canResend = hasPermission('user.invitation.resend') || hasPermission('user.create')
  const canRevoke = hasPermission('user.invitation.revoke') || hasPermission('user.create')

  const user: UserDetail | null = useMemo(() => {
    if (!userRes) return null
    const raw = userRes as unknown as Record<string, unknown>
    if (raw.user && typeof raw.user === 'object') return raw.user as UserDetail
    if (raw.data && typeof raw.data === 'object') {
      const d = raw.data as Record<string, unknown>
      if (d.user && typeof d.user === 'object') return d.user as UserDetail
      if ('id' in d || 'email' in d) return d as unknown as UserDetail
    }
    if ('id' in raw || 'email' in raw) {
      return raw as unknown as UserDetail
    }
    return null
  }, [userRes])

  const sanitizedUser = useMemo(() => {
    if (!user) return null
    const clone = { ...user } as Record<string, unknown>
    delete clone.password
    delete clone.passwordHash
    delete clone.token
    delete clone.tokenHash
    return clone
  }, [user])

  const rawUser = user as Record<string, unknown> | null
  const rawRoleId = String(rawUser?.roleId || '')

  const { data: roleRes } = useRole(open && rawRoleId && !rolesMap[rawRoleId] ? rawRoleId : null)

  const roleName = useMemo(() => {
    if (!rawUser) return ''
    if (rawRoleId && rolesMap[rawRoleId]) return rolesMap[rawRoleId]
    if (roleRes?.role?.name) return roleRes.role.name
    if (roleRes && typeof roleRes === 'object') {
      const rObj = roleRes as Record<string, unknown>
      if (typeof rObj.name === 'string') return rObj.name
      if (rObj.data && typeof rObj.data === 'object' && 'name' in rObj.data) {
        return String((rObj.data as Record<string, unknown>).name)
      }
    }
    if (typeof rawUser.role === 'string' && rawUser.role) return rawUser.role
    if (rawUser.role && typeof rawUser.role === 'object') {
      const r = rawUser.role as Record<string, unknown>
      const name = String(r.name || r.roleName || r.role_name || '')
      if (name) return name
    }
    if (Array.isArray(rawUser.userRoles) && rawUser.userRoles.length > 0) {
      const first = (rawUser.userRoles as Record<string, unknown>[])[0]
      const inner = first?.role as Record<string, unknown> | undefined
      const name = String(
        inner?.name ||
          inner?.roleName ||
          first?.roleName ||
          first?.name ||
          (first?.roleId && rolesMap[String(first.roleId)]) ||
          '',
      )
      if (name) return name
    }
    if (Array.isArray(rawUser.roles) && rawUser.roles.length > 0) {
      const first = (rawUser.roles as Record<string, unknown>[])[0]
      if (typeof first === 'string') return first
      if (first && typeof first === 'object') {
        const name = String(
          first.name || first.roleName || (first.id && rolesMap[String(first.id)]) || '',
        )
        if (name) return name
      }
    }
    if (rawUser.roleName) return String(rawUser.roleName)
    if (rawUser.role_name) return String(rawUser.role_name)
    return ''
  }, [rawUser, rawRoleId, rolesMap, roleRes])

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'

  const avatarSrc =
    (user?.avatar as string | undefined) ||
    (user?.avatarUrl as string | undefined) ||
    (user?.image as string | undefined)

  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    ACTIVE: { bg: 'bg-accent-soft', text: 'text-accent', dot: 'bg-accent' },
    INACTIVE: { bg: 'bg-amber-500/15', text: 'text-amber-300', dot: 'bg-amber-400' },
    SUSPENDED: { bg: 'bg-red-500/15', text: 'text-red-300', dot: 'bg-red-400' },
    DELETED: { bg: 'bg-zinc-500/15', text: 'text-muted', dot: 'bg-zinc-500' },
  }
  const sColor = statusColors[(user?.status || '').toUpperCase()] || statusColors.INACTIVE

  const roleColors: Record<string, { bg: string; text: string }> = {
    SUPER_ADMIN: { bg: 'bg-accent-soft/15', text: 'text-accent' },
    ADMIN: { bg: 'bg-accent-soft/15', text: 'text-accent' },
    USER: { bg: 'bg-zinc-500/15', text: 'text-muted' },
  }
  const rKey = roleName ? roleName.toUpperCase().replace(/\s+/g, '_') : 'USER'
  const rColor = roleColors[rKey] || roleColors.USER

  const roleLabel = roleName
    ? roleName
        .split(/[_\s-]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    : '—'

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt as string).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[360px] sm:w-[440px] bg-canvas border-l border-hairline-light/70 text-muted flex flex-col p-0 gap-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>User Details</SheetTitle>
          <SheetDescription>Full profile information for this user.</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted">
            <Loader2 className="size-6 animate-spin text-accent" />
            <span className="text-xs">Loading profile...</span>
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 text-muted">
            <Eye className="size-8 opacity-30" />
            <span className="text-xs">User not found.</span>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 px-6 pt-8 pb-6 border-b border-hairline-light/70">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-purple-500/5 pointer-events-none" />
              <div className="relative flex items-start gap-4">
                <div className="relative shrink-0">
                  <Avatar className="size-16 ring-2 ring-zinc-700/80">
                    <AvatarImage src={avatarSrc} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-accent to-teal-800 text-accent font-bold text-xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      'absolute bottom-0.5 right-0.5 size-3 rounded-full border-2 border-hairline-light',
                      sColor.dot,
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <p className="font-bold text-base text-white truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-muted truncate">{user.email}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                        sColor.bg,
                        sColor.text,
                      )}
                    >
                      <span className={cn('size-1.5 rounded-full', sColor.dot)} />
                      {user.status || 'UNKNOWN'}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                        rColor.bg,
                        rColor.text,
                      )}
                    >
                      {roleLabel}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                        (user.isEmailVerified as boolean)
                          ? 'bg-sky-500/15 text-sky-300'
                          : 'bg-zinc-700/40 text-muted',
                      )}
                    >
                      {(user.isEmailVerified as boolean) ? '✓ Verified' : '✗ Unverified'}
                    </span>
                  </div>
                </div>
              </div>

              {Boolean(rawUser?.deletedAt) && (
                <div className="mt-4 p-3 rounded-none bg-amber-500/15 border border-amber-500/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-amber-200">
                    <Archive className="size-4 shrink-0 text-amber-400" />
                    <div>
                      <span className="font-semibold block text-amber-100">
                        Account Soft-Deleted
                      </span>
                      <span className="text-[11px] text-amber-300/80">
                        Deleted on{' '}
                        {new Date(String(rawUser?.deletedAt)).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <PermissionGate permission="user.restore">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!user) return
                        restoreUser(user.id, {
                          onSuccess: () => {
                            onSuccess?.()
                          },
                        })
                      }}
                      disabled={isRestoring}
                      className="bg-accent hover:bg-accent text-white text-xs h-7 gap-1.5 cursor-pointer"
                    >
                      {isRestoring ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <RefreshCw className="size-3" />
                      )}
                      Restore
                    </Button>
                  </PermissionGate>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-5 flex flex-col gap-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">
                    Account Info
                  </p>
                  <div className="rounded-none border border-hairline-light/60 bg-subtle/40 overflow-hidden divide-y divide-zinc-800/50">
                    <div className="px-4 py-3">
                      <span className="text-[10px] uppercase font-semibold text-muted block mb-0.5">
                        User ID
                      </span>
                      <span className="text-[11px] text-muted font-mono break-all leading-relaxed">
                        {user.id}
                      </span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-[10px] uppercase font-semibold text-muted block mb-0.5">
                        Phone
                      </span>
                      <span className="text-sm text-muted">{user.phone || '—'}</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-[10px] uppercase font-semibold text-muted block mb-0.5">
                        Member Since
                      </span>
                      <span className="text-sm text-muted">{joinedDate}</span>
                    </div>
                    {user.updatedAt && (
                      <div className="px-4 py-3">
                        <span className="text-[10px] uppercase font-semibold text-muted block mb-0.5">
                          Last Updated
                        </span>
                        <span className="text-sm text-muted">
                          {new Date(user.updatedAt as string).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">
                    Security &amp; Access
                  </p>
                  <div className="rounded-none border border-hairline-light/60 bg-subtle/40 overflow-hidden divide-y divide-zinc-800/50">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-[10px] uppercase font-semibold text-muted">
                        Role
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-1 rounded-none text-[11px] font-bold',
                          rColor.bg,
                          rColor.text,
                        )}
                      >
                        {roleLabel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-[10px] uppercase font-semibold text-muted">
                        Email Verified
                      </span>
                      <span
                        className={cn(
                          'text-xs font-semibold',
                          (user.isEmailVerified as boolean) ? 'text-accent' : 'text-amber-400',
                        )}
                      >
                        {(user.isEmailVerified as boolean) ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-[10px] uppercase font-semibold text-muted">
                        Account Status
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[11px] font-semibold',
                          sColor.bg,
                          sColor.text,
                        )}
                      >
                        <span className={cn('size-1.5 rounded-full', sColor.dot)} />
                        {user.status || 'UNKNOWN'}
                      </span>
                    </div>
                  </div>
                </div>

                {Boolean(rawUser?.invitation) && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">
                      Invitation &amp; Onboarding
                    </p>
                    <div className="rounded-none border border-hairline-light/60 bg-subtle/40 overflow-hidden divide-y divide-zinc-800/50">
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-[10px] uppercase font-semibold text-muted">
                          Invitation Status
                        </span>
                        <InvitationBadge
                          invitation={rawUser?.invitation as UserInvitationSummary}
                        />
                      </div>
                      {(rawUser?.invitation as UserInvitationSummary)?.expiresAt && (
                        <div className="flex items-center justify-between px-4 py-3">
                          <span className="text-[10px] uppercase font-semibold text-muted">
                            Expires
                          </span>
                          <span className="text-xs text-muted">
                            {new Date(
                              (rawUser?.invitation as UserInvitationSummary).expiresAt,
                            ).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                      {(rawUser?.invitation as UserInvitationSummary)?.status === 'PENDING' && (
                        <div className="p-3 bg-subtle/60 flex items-center justify-end gap-2">
                          {canResend && (
                            <Button
                              type="button"
                              size="sm"
                              disabled={isResendingInv}
                              onClick={() => {
                                if (!user) return
                                resendInv(user.id, { onSuccess: () => onSuccess?.() })
                              }}
                              className="bg-sky-600 hover:bg-sky-500 text-white text-xs h-7 gap-1.5 cursor-pointer"
                            >
                              {isResendingInv ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Mail className="size-3" />
                              )}
                              Resend Invitation
                            </Button>
                          )}
                          {canRevoke && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isRevokingInv}
                              onClick={() => {
                                if (!user) return
                                revokeInv(user.id, { onSuccess: () => onSuccess?.() })
                              }}
                              className="border-red-500/40 text-red-300 hover:bg-red-500/10 text-xs h-7 gap-1.5 cursor-pointer"
                            >
                              {isRevokingInv ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Ban className="size-3" />
                              )}
                              Revoke
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <details className="group rounded-none border border-hairline-light/60 bg-subtle/30 overflow-hidden text-xs">
                  <summary className="px-4 py-3 cursor-pointer text-[10px] font-bold uppercase tracking-widest text-muted hover:text-muted transition select-none flex items-center justify-between">
                    <span>Developer Data (JSON)</span>
                    <span className="text-muted group-open:rotate-90 transition-transform">
                      ›
                    </span>
                  </summary>
                  <pre className="p-4 text-[10px] text-muted font-mono overflow-x-auto bg-canvas border-t border-hairline-light/60 leading-relaxed max-h-48">
                    {JSON.stringify(sanitizedUser, null, 2)}
                  </pre>
                </details>
              </div>
            </div>

            <div className="p-4 border-t border-hairline-light/70 bg-subtle/40 flex items-center justify-between gap-2">
              {rawUser?.deletedAt ? (
                <PermissionGate permission="user.restore">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!user) return
                      restoreUser(user.id, {
                        onSuccess: () => {
                          onSuccess?.()
                        },
                      })
                    }}
                    disabled={isRestoring}
                    className="bg-accent hover:bg-accent text-white text-xs h-8 gap-1.5 cursor-pointer"
                  >
                    {isRestoring ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="size-3.5" />
                    )}
                    Restore User Account
                  </Button>
                </PermissionGate>
              ) : (
                <div />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs cursor-pointer h-8"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ─── Status Options for Combobox ─────────────────────────────────────────────

const STATUS_OPTIONS: ComboboxOption[] = [
  {
    value: 'ACTIVE',
    label: 'ACTIVE',
    badge: (
      <Badge
        variant="outline"
        className="text-[10px] font-semibold gap-1 text-accent bg-accent-soft border-accent"
      >
        <span className="size-1.5 rounded-full bg-current" />
        ACTIVE
      </Badge>
    ),
    description: 'Active account with full access',
  },
  {
    value: 'INACTIVE',
    label: 'INACTIVE',
    badge: (
      <Badge
        variant="outline"
        className="text-[10px] font-semibold gap-1 text-amber-400 bg-amber-500/10 border-amber-500/30"
      >
        <span className="size-1.5 rounded-full bg-current" />
        INACTIVE
      </Badge>
    ),
    description: 'Account is temporarily inactive',
  },
  {
    value: 'SUSPENDED',
    label: 'SUSPENDED',
    badge: (
      <Badge
        variant="outline"
        className="text-[10px] font-semibold gap-1 text-red-400 bg-red-500/10 border-red-500/30"
      >
        <span className="size-1.5 rounded-full bg-current" />
        SUSPENDED
      </Badge>
    ),
    description: 'Account is blocked from accessing the system',
  },
]

// ─── Update Status Dialog ────────────────────────────────────────────────────

function UpdateStatusDialog({
  user,
  open,
  onClose,
  onSuccess,
}: {
  user: UserListItem | null
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const [status, setStatus] = useState<UpdateUserStatusPayload['status']>('ACTIVE')
  const { mutate: updateStatus, isPending: isSaving } = useUpdateUserStatus()

  useEffect(() => {
    if (user) {
      setStatus((user.status?.toUpperCase() as UpdateUserStatusPayload['status']) || 'ACTIVE')
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    updateStatus(
      { id: user.id, payload: { status } },
      {
        onSuccess: () => {
          toast.success(`User status updated to ${status}`)
          onSuccess?.()
          onClose()
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } }; message?: string }
          toast.error(error.response?.data?.message || error.message || 'Failed to update status')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-canvas border-hairline-light text-muted">
        <DialogHeader>
          <DialogTitle className="text-sm">Update User Status</DialogTitle>
          <DialogDescription className="text-xs text-muted">
            Change the account status for{' '}
            <span className="font-semibold text-muted">{user?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">New Status</Label>
            <Combobox
              value={status}
              options={STATUS_OPTIONS}
              onValueChange={(v) => setStatus(v as UpdateUserStatusPayload['status'])}
              triggerClassName="h-9 w-full bg-subtle border-hairline-light text-xs"
              placeholder="Select status..."
              searchPlaceholder="Search status..."
            />
          </div>

          <DialogFooter className="gap-2">
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
              className="bg-accent hover:bg-accent text-white cursor-pointer gap-2"
            >
              {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Update Role Dialog ──────────────────────────────────────────────────────

function UpdateRoleDialog({
  user,
  open,
  onClose,
  onSuccess,
}: {
  user: UserListItem | null
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const { data: rolesRes, isLoading: isLoadingRoles } = useRoles()
  const { mutate: assignRole, isPending: isSaving } = useUpdateUserRole()
  const [selectedRoleId, setSelectedRoleId] = useState('')

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

  const roleOptions: ComboboxOption[] = useMemo(() => {
    return roles.map((r) => {
      const roleName = r.name || r.roleName || ''
      const displayName = roleName
        ? roleName
            .split(/[_\s-]+/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ')
        : '—'
      const key = normalizeRole(roleName)
      const cfg = ROLES[key] || ROLES.USER
      return {
        value: r.id,
        label: displayName,
        description: r.description || undefined,
        keywords: [roleName, key],
        badge: (
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] font-semibold gap-1',
              cfg.badgeColor.bg,
              cfg.badgeColor.text,
              cfg.badgeColor.border,
            )}
          >
            <span className={cn('size-1.5 rounded-full', cfg.badgeColor.dot)} />
            {displayName}
          </Badge>
        ),
      }
    })
  }, [roles])

  useEffect(() => {
    if (open && user) {
      setSelectedRoleId(user.roleId || '')
    }
  }, [open, user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedRoleId) return
    assignRole(
      { id: user.id, payload: { roleId: selectedRoleId } },
      {
        onSuccess: () => {
          const matched = roles.find((r) => r.id === selectedRoleId)
          toast.success(`Role updated to ${matched?.name || matched?.roleName || 'new role'}`)
          onSuccess?.()
          onClose()
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } }; message?: string }
          toast.error(error.response?.data?.message || error.message || 'Failed to update role')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-canvas border-hairline-light text-muted">
        <DialogHeader>
          <DialogTitle className="text-sm">Update User Role</DialogTitle>
          <DialogDescription className="text-xs text-muted">
            Assign a new role to <span className="font-semibold text-muted">{user?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Select Role</Label>
            {isLoadingRoles ? (
              <div className="flex items-center gap-2 text-xs text-muted py-2">
                <Loader2 className="size-3.5 animate-spin" /> Loading roles...
              </div>
            ) : (
              <Combobox
                value={selectedRoleId}
                options={roleOptions}
                onValueChange={setSelectedRoleId}
                triggerClassName="h-9 w-full bg-subtle border-hairline-light text-xs"
                placeholder="Choose a role..."
                searchPlaceholder="Search roles..."
                emptyText="No roles found."
              />
            )}
          </div>

          <DialogFooter className="gap-2">
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
              disabled={isSaving || !selectedRoleId}
              className="bg-accent hover:bg-accent text-white cursor-pointer gap-2"
            >
              {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : null}
              Assign Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete User Dialog ──────────────────────────────────────────────────────

function DeleteUserDialog({
  user,
  permanent,
  open,
  onClose,
  onSuccess,
}: {
  user: UserListItem | null
  permanent: boolean
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const isPermanent = permanent || user?.status === 'DELETED'
  const [confirmDeleteInput, setConfirmDeleteInput] = useState('')
  const { mutate: deleteUser, isPending: isSaving } = useDeleteUser()

  useEffect(() => {
    setConfirmDeleteInput('')
  }, [permanent, open, user])

  const handleConfirm = () => {
    if (!user) return
    if (isPermanent && confirmDeleteInput !== 'DELETE') return
    deleteUser(
      { id: user.id, permanent: isPermanent },
      {
        onSuccess: () => {
          onSuccess?.()
          onClose()
        },
      },
    )
  }

  const isConfirmDisabled = isSaving || (isPermanent && confirmDeleteInput !== 'DELETE')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-canvas border-hairline-light text-muted">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <AlertTriangle
              className={cn('size-4.5', isPermanent ? 'text-red-500' : 'text-amber-400')}
            />
            {isPermanent ? 'Permanently Delete User?' : 'Soft Delete User?'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted">
            {isPermanent
              ? 'This action permanently removes the user and cannot be undone.'
              : 'This will deactivate the user account and move it to the Deleted Users archive.'}
          </DialogDescription>
        </DialogHeader>

        {/* User preview */}
        <div className="flex items-center gap-3 p-3 my-1 rounded-none border border-hairline-light bg-subtle/50">
          <Avatar className="size-9 ring-1 ring-border">
            <AvatarImage
              src={user?.avatar || user?.avatarUrl || user?.image}
              alt={user?.name || ''}
            />
            <AvatarFallback className="text-[10px] bg-muted">
              {user?.name?.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-muted truncate">{user?.name}</span>
            <span className="text-[11px] text-muted truncate">{user?.email}</span>
          </div>
        </div>

        {isPermanent ? (
          <div className="flex flex-col gap-2 my-1">
            <div className="p-2.5 rounded-none border border-red-500/20 bg-red-950/20 text-red-300 text-[11px] leading-relaxed">
              Irreversibly wipes user from the database, removes storage files, and flushes cache.{' '}
              <span className="font-semibold text-red-400">Cannot be undone.</span>
            </div>

            <div className="flex flex-col gap-1.5 p-3 rounded-none border border-red-500/30 bg-red-950/20">
              <Label className="text-xs text-red-300 font-medium">
                To confirm permanent deletion, type{' '}
                <span className="font-mono font-bold text-white bg-red-900/60 px-1 py-0.5 rounded">
                  DELETE
                </span>{' '}
                below:
              </Label>
              <Input
                value={confirmDeleteInput}
                onChange={(e) => setConfirmDeleteInput(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="h-8 text-xs bg-subtle border-red-500/40 text-red-100 placeholder:text-muted focus-visible:ring-red-500"
                autoFocus
              />
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-none border border-amber-500/20 bg-amber-950/20 text-amber-300 text-[11px] leading-relaxed my-1">
            The account status will be set to <strong>DELETED</strong>. User profile and data will
            be preserved in Deleted Users and can be restored at any time.
          </div>
        )}

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isConfirmDisabled}
            onClick={handleConfirm}
            className={cn(
              'text-white cursor-pointer gap-2',
              isPermanent
                ? isConfirmDisabled
                  ? 'bg-red-900/60 text-red-300/40 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-500'
                : 'bg-amber-600 hover:bg-amber-500',
            )}
          >
            {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : null}
            {isPermanent ? 'Permanently Delete' : 'Soft Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Restore User Dialog ────────────────────────────────────────────────────

function RestoreUserDialog({
  user,
  open,
  onClose,
  onSuccess,
}: {
  user: UserListItem | null
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const { mutate: restoreUser, isPending: isRestoring } = useRestoreUser()

  const handleConfirm = () => {
    if (!user) return
    restoreUser(user.id, {
      onSuccess: () => {
        onSuccess?.()
        onClose()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-canvas border-hairline-light text-muted">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2 text-accent">
            <RotateCcw className="size-4" />
            Restore User?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted">
            This will restore the user account and reactivate access to the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 p-3 my-2 rounded-none border border-hairline-light bg-subtle/50">
          <Avatar className="size-9 ring-1 ring-border">
            <AvatarImage
              src={user?.avatar || user?.avatarUrl || user?.image}
              alt={user?.name || ''}
            />
            <AvatarFallback className="text-[10px] bg-muted">
              {user?.name?.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-muted truncate">{user?.name}</span>
            <span className="text-[11px] text-muted truncate">{user?.email}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isRestoring}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isRestoring}
            onClick={handleConfirm}
            className="bg-accent hover:bg-accent text-white gap-2 cursor-pointer"
          >
            {isRestoring && <Loader2 className="size-3.5 animate-spin" />}
            Restore User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Create User Dialog ──────────────────────────────────────────────────────

function CreateUserDialog({
  open,
  onClose,
  roleOptions,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  roleOptions: ComboboxOption[]
  onSuccess?: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [roleId, setRoleId] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const { mutate: createUser, isPending: isCreating } = useCreateUser()

  useEffect(() => {
    if (open) {
      setName('')
      setEmail('')
      setPhone('')
      setRoleId(roleOptions[0]?.value || '')
      setFormError(null)
    }
  }, [open, roleOptions])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const parseResult = createUserInvitationSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      roleId,
    })

    if (!parseResult.success) {
      setFormError(parseResult.error.issues[0]?.message || 'Please complete all required fields')
      return
    }

    createUser(
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        roleId,
      },
      {
        onSuccess: () => {
          onSuccess?.()
          onClose()
        },
        onError: (err: unknown) => {
          const apiErr = err as ApiError
          setFormError(apiErr?.message || 'Failed to create user. Please try again.')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-canvas border-hairline-light text-muted">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2 text-white">
            <UserPlus className="size-4 text-accent" />
            Create User
          </DialogTitle>
          <DialogDescription className="text-xs text-muted">
            An invitation email will be sent to the user&apos;s email address. They will create
            their own password using the invitation link.
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="p-2.5 rounded-none border border-red-500/30 bg-red-950/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="size-4 text-red-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted">
              Full Name <span className="text-red-400">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahim Chowdhury"
              className="h-8 text-xs bg-subtle border-hairline-light text-muted"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted">
              Email Address <span className="text-red-400">*</span>
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahim@example.com"
              className="h-8 text-xs bg-subtle border-hairline-light text-muted"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted">
              Phone Number <span className="text-muted font-normal">(Optional)</span>
            </Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801712345678"
              className="h-8 text-xs bg-subtle border-hairline-light text-muted"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted">
              Assign Role <span className="text-red-400">*</span>
            </Label>
            <Combobox
              value={roleId}
              options={roleOptions}
              onValueChange={setRoleId}
              triggerClassName="h-8 w-full bg-subtle border-hairline-light text-xs"
              placeholder="Select a role..."
              searchPlaceholder="Search roles..."
              emptyText="No roles found."
            />
          </div>

          <div className="p-2.5 rounded-none border border-accent bg-accent-soft text-accent text-[11px] leading-relaxed flex items-start gap-2">
            <Mail className="size-3.5 text-accent shrink-0 mt-0.5" />
            <span>
              The user will be created with status <strong>INACTIVE</strong> until they accept the
              invitation and set up their password.
            </span>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isCreating}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isCreating || !name.trim() || !email.trim() || !roleId}
              className="bg-accent hover:bg-accent text-white cursor-pointer gap-2"
            >
              {isCreating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <UserPlus className="size-3.5" />
              )}
              Create &amp; Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Resend Invitation Dialog ────────────────────────────────────────────────

function ResendInvitationDialog({
  user,
  open,
  onClose,
  onSuccess,
}: {
  user: UserListItem | null
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const { mutate: resend, isPending: isResending } = useResendInvitation()

  const handleConfirm = () => {
    if (!user) return
    resend(user.id, {
      onSuccess: () => {
        onSuccess?.()
        onClose()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-canvas border-hairline-light text-muted">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2 text-sky-400">
            <Mail className="size-4" />
            Resend Invitation?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted">
            A new invitation link will be sent to this user&apos;s email address. The previous
            invitation will be invalidated.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 p-3 my-2 rounded-none border border-hairline-light bg-subtle/50">
          <Avatar className="size-9 ring-1 ring-border">
            <AvatarImage
              src={user?.avatar || user?.avatarUrl || user?.image}
              alt={user?.name || ''}
            />
            <AvatarFallback className="text-[10px] bg-muted">
              {user?.name?.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-muted truncate">{user?.name}</span>
            <span className="text-[11px] text-muted truncate">{user?.email}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isResending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isResending}
            onClick={handleConfirm}
            className="bg-sky-600 hover:bg-sky-500 text-white gap-2 cursor-pointer"
          >
            {isResending && <Loader2 className="size-3.5 animate-spin" />}
            Resend Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Revoke Invitation Dialog ────────────────────────────────────────────────

function RevokeInvitationDialog({
  user,
  open,
  onClose,
  onSuccess,
}: {
  user: UserListItem | null
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const { mutate: revoke, isPending: isRevoking } = useRevokeInvitation()

  const handleConfirm = () => {
    if (!user) return
    revoke(user.id, {
      onSuccess: () => {
        onSuccess?.()
        onClose()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-canvas border-hairline-light text-muted">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2 text-amber-400">
            <Ban className="size-4" />
            Revoke Invitation?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted">
            This will invalidate the current invitation link. The user will not be able to complete
            account setup using the existing link.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 p-3 my-2 rounded-none border border-hairline-light bg-subtle/50">
          <Avatar className="size-9 ring-1 ring-border">
            <AvatarImage
              src={user?.avatar || user?.avatarUrl || user?.image}
              alt={user?.name || ''}
            />
            <AvatarFallback className="text-[10px] bg-muted">
              {user?.name?.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-muted truncate">{user?.name}</span>
            <span className="text-[11px] text-muted truncate">{user?.email}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isRevoking}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isRevoking}
            onClick={handleConfirm}
            className="bg-amber-600 hover:bg-amber-500 text-white gap-2 cursor-pointer"
          >
            {isRevoking && <Loader2 className="size-3.5 animate-spin" />}
            Revoke Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main UserManagementView ──────────────────────────────────────────────────

export function UserManagementView() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt' | 'updatedAt' | 'status'>(
    'createdAt',
  )
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const { user: currentUser } = useAuth()
  // Dialogs / Sheet state
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePermanent, setDeletePermanent] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [userToRestore, setUserToRestore] = useState<UserListItem | null>(null)
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false)
  const [showResendDialog, setShowResendDialog] = useState(false)
  const [showRevokeDialog, setShowRevokeDialog] = useState(false)
  const [userForInvitation, setUserForInvitation] = useState<UserListItem | null>(null)

  // Active Tab: All Users vs Deleted Users
  const [activeTab, setActiveTab] = useState<'all' | 'deleted'>('all')

  // Deleted Users Filter & Pagination State
  const [deletedSearch, setDeletedSearch] = useState('')
  const [debouncedDeletedSearch, setDebouncedDeletedSearch] = useState('')
  const [deletedRoleFilter, setDeletedRoleFilter] = useState('ALL')
  const [deletedPage, setDeletedPage] = useState(1)
  const [deletedLimit, setDeletedLimit] = useState(10)

  // Debounce search text
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedDeletedSearch(deletedSearch)
      setDeletedPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [deletedSearch])

  const queryParams = useMemo(() => {
    const p: QueryUsersParams = { page, limit }
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim()
    if (statusFilter !== 'ALL') p.status = statusFilter
    if (roleFilter !== 'ALL') p.roleId = roleFilter
    return p
  }, [page, limit, debouncedSearch, statusFilter, roleFilter])

  const deletedQueryParams = useMemo(() => {
    const p: QueryUsersParams = { page: deletedPage, limit: deletedLimit }
    if (debouncedDeletedSearch.trim()) p.search = debouncedDeletedSearch.trim()
    if (deletedRoleFilter !== 'ALL') p.roleId = deletedRoleFilter
    return p
  }, [deletedPage, deletedLimit, debouncedDeletedSearch, deletedRoleFilter])

  const { data: rolesRes } = useRoles()
  const {
    data: usersRes,
    isLoading: loading,
    isFetching,
    refetch: handleRefresh,
  } = useUsers(queryParams)

  const {
    data: deletedUsersRes,
    isLoading: deletedLoading,
    isFetching: deletedIsFetching,
    refetch: handleRefreshDeleted,
  } = useDeletedUsers(deletedQueryParams)

  const rolesList: RoleItem[] = useMemo(() => {
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

  const rolesMap: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {}
    for (const r of rolesList) {
      if (r.id) {
        map[r.id] = r.name || r.roleName || ''
      }
    }
    return map
  }, [rolesList])

  const roleOptions: ComboboxOption[] = useMemo(() => {
    return rolesList.map((r) => {
      const roleName = r.name || r.roleName || ''
      const displayName = roleName
        ? roleName
            .split(/[_\s-]+/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ')
        : '—'
      const key = normalizeRole(roleName)
      const cfg = ROLES[key] || ROLES.USER
      return {
        value: r.id,
        label: displayName,
        description: r.description || undefined,
        keywords: [roleName, key],
        badge: (
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] font-semibold gap-1',
              cfg.badgeColor.bg,
              cfg.badgeColor.text,
              cfg.badgeColor.border,
            )}
          >
            <span className={cn('size-1.5 rounded-full', cfg.badgeColor.dot)} />
            {displayName}
          </Badge>
        ),
      }
    })
  }, [rolesList])

  const filterStatusOptions: ComboboxOption[] = useMemo(() => {
    return [
      {
        value: 'ALL',
        label: 'All Status',
        badge: (
          <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Filter className="size-3 text-muted-foreground" />
            All Status
          </span>
        ),
      },
      ...STATUS_OPTIONS,
    ]
  }, [])

  const filterRoleOptions: ComboboxOption[] = useMemo(() => {
    return [
      {
        value: 'ALL',
        label: 'All Roles',
        badge: (
          <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <UserCog className="size-3 text-muted-foreground" />
            All Roles
          </span>
        ),
      },
      ...roleOptions,
    ]
  }, [roleOptions])

  // Permissions & Inline updating mutations
  const { hasPermission } = usePermission()
  const canCreateUser = hasPermission('user.create')
  const canUpdateStatus = hasPermission('user.status.update')
  const canUpdateRole = hasPermission('user.role.update')
  const canDelete = hasPermission('user.delete')
  const canRestore = hasPermission('user.restore')
  const canResendInvitation =
    hasPermission('user.invitation.resend') || hasPermission('user.create')
  const canRevokeInvitation =
    hasPermission('user.invitation.revoke') || hasPermission('user.create')

  const { mutate: updateStatus } = useUpdateUserStatus()
  const { mutate: assignRole } = useUpdateUserRole()
  const [updatingStatusUserId, setUpdatingStatusUserId] = useState<string | null>(null)
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null)

  const normalizeUserRole = useCallback(
    (u: UserListItem, rMap: Record<string, string>): UserListItem => {
      const raw = u as unknown as Record<string, unknown>
      const rId = String(raw.roleId || '')

      if (rId && rMap[rId]) {
        return { ...u, roleId: rId, role: rMap[rId] }
      }
      if (typeof raw.role === 'string' && raw.role) {
        return { ...u, roleId: rId || undefined, role: raw.role }
      }
      if (raw.role && typeof raw.role === 'object') {
        const r = raw.role as Record<string, unknown>
        const name = String(r.name || r.roleName || r.role_name || '')
        if (name) return { ...u, roleId: rId || (r.id ? String(r.id) : undefined), role: name }
      }
      if (Array.isArray(raw.userRoles) && raw.userRoles.length > 0) {
        const first = (raw.userRoles as Record<string, unknown>[])[0]
        const inner = first?.role as Record<string, unknown> | undefined
        const name = String(
          inner?.name ||
            inner?.roleName ||
            first?.roleName ||
            first?.name ||
            (first?.roleId && rMap[String(first.roleId)]) ||
            '',
        )
        if (name)
          return {
            ...u,
            roleId: rId || (first?.roleId ? String(first.roleId) : undefined),
            role: name,
          }
      }
      if (Array.isArray(raw.roles) && raw.roles.length > 0) {
        const first = (raw.roles as Record<string, unknown>[])[0]
        if (typeof first === 'string') {
          return { ...u, roleId: rId || undefined, role: first }
        }
        if (first && typeof first === 'object') {
          const name = String(
            first.name || first.roleName || (first.id && rMap[String(first.id)]) || '',
          )
          if (name)
            return { ...u, roleId: rId || (first.id ? String(first.id) : undefined), role: name }
        }
      }
      if (raw.roleName) return { ...u, roleId: rId || undefined, role: String(raw.roleName) }
      if (raw.role_name) return { ...u, roleId: rId || undefined, role: String(raw.role_name) }
      if (rId && (rMap[rId] || !u.role)) return { ...u, roleId: rId, role: rMap[rId] || u.role }
      return { ...u, roleId: rId || undefined }
    },
    [],
  )

  const handleInlineStatusChange = useCallback(
    (userId: string, newStatus: string) => {
      setUpdatingStatusUserId(userId)
      updateStatus(
        { id: userId, payload: { status: newStatus as UpdateUserStatusPayload['status'] } },
        {
          onSuccess: () => {
            toast.success(`User status updated to ${newStatus}`)
            handleRefresh()
          },
          onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } }; message?: string }
            toast.error(
              error?.response?.data?.message || error?.message || 'Failed to update status',
            )
          },
          onSettled: () => {
            setUpdatingStatusUserId(null)
          },
        },
      )
    },
    [updateStatus, handleRefresh],
  )

  const handleInlineRoleChange = useCallback(
    (userId: string, newRoleId: string) => {
      setUpdatingRoleUserId(userId)
      assignRole(
        { id: userId, payload: { roleId: newRoleId } },
        {
          onSuccess: () => {
            const rName = rolesMap[newRoleId] || 'new role'
            toast.success(`Role updated to ${rName}`)
            handleRefresh()
          },
          onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } }; message?: string }
            toast.error(error?.response?.data?.message || error?.message || 'Failed to update role')
          },
          onSettled: () => {
            setUpdatingRoleUserId(null)
          },
        },
      )
    },
    [assignRole, rolesMap, handleRefresh],
  )

  const { users, totalPages, total } = useMemo(() => {
    if (!usersRes) return { users: [], totalPages: 1, total: 0 }
    let rawList: UserListItem[] = []
    let rawMeta:
      { total?: number; totalPages?: number; totalPage?: number; page?: number } | undefined

    if (Array.isArray(usersRes.users)) {
      rawList = usersRes.users
      rawMeta = usersRes.meta
    } else if (Array.isArray(usersRes.data)) {
      rawList = usersRes.data as unknown as UserListItem[]
      rawMeta = usersRes.meta
    } else if (Array.isArray(usersRes)) {
      rawList = usersRes as unknown as UserListItem[]
    } else if (usersRes.data && typeof usersRes.data === 'object') {
      const d = usersRes.data as Record<string, unknown>
      if (Array.isArray(d.data)) {
        rawList = d.data as UserListItem[]
      } else if (Array.isArray(d.users)) {
        rawList = d.users as UserListItem[]
      } else if (Array.isArray(d.items)) {
        rawList = d.items as UserListItem[]
      }
      rawMeta = (d.meta || d.pagination || usersRes.meta) as typeof rawMeta
    }

    const normalizedList = rawList.map((u) => normalizeUserRole(u, rolesMap))

    if (sortBy) {
      normalizedList.sort((a, b) => {
        let aVal = ''
        let bVal = ''
        if (sortBy === 'name') {
          aVal = a.name || ''
          bVal = b.name || ''
        } else if (sortBy === 'email') {
          aVal = a.email || ''
          bVal = b.email || ''
        } else if (sortBy === 'status') {
          aVal = a.status || ''
          bVal = b.status || ''
        } else if (sortBy === 'createdAt') {
          aVal = a.createdAt || ''
          bVal = b.createdAt || ''
        } else if (sortBy === 'updatedAt') {
          aVal = a.updatedAt || ''
          bVal = b.updatedAt || ''
        }
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    const tPages = Number(rawMeta?.totalPages || rawMeta?.totalPage || 1)
    const tCount = Number(rawMeta?.total ?? rawList.length)
    return { users: normalizedList, totalPages: tPages, total: tCount }
  }, [usersRes, rolesMap, sortBy, sortOrder, normalizeUserRole])

  const { deletedUsers, totalDeletedPages, totalDeleted } = useMemo(() => {
    if (!deletedUsersRes) return { deletedUsers: [], totalDeletedPages: 1, totalDeleted: 0 }
    let rawList: UserListItem[] = []
    let rawMeta:
      { total?: number; totalPages?: number; totalPage?: number; page?: number } | undefined

    if (Array.isArray(deletedUsersRes.users)) {
      rawList = deletedUsersRes.users
      rawMeta = deletedUsersRes.meta
    } else if (Array.isArray(deletedUsersRes.data)) {
      rawList = deletedUsersRes.data as unknown as UserListItem[]
      rawMeta = deletedUsersRes.meta
    } else if (Array.isArray(deletedUsersRes)) {
      rawList = deletedUsersRes as unknown as UserListItem[]
    } else if (deletedUsersRes.data && typeof deletedUsersRes.data === 'object') {
      const d = deletedUsersRes.data as Record<string, unknown>
      if (Array.isArray(d.data)) {
        rawList = d.data as UserListItem[]
      } else if (Array.isArray(d.users)) {
        rawList = d.users as UserListItem[]
      } else if (Array.isArray(d.items)) {
        rawList = d.items as UserListItem[]
      }
      rawMeta = (d.meta || d.pagination || deletedUsersRes.meta) as typeof rawMeta
    }

    const normalizedList = rawList.map((u) => normalizeUserRole(u, rolesMap))
    const tPages = Number(rawMeta?.totalPages || rawMeta?.totalPage || 1)
    const tCount = Number(rawMeta?.total ?? rawList.length)
    return { deletedUsers: normalizedList, totalDeletedPages: tPages, totalDeleted: tCount }
  }, [deletedUsersRes, rolesMap, normalizeUserRole])

  const handleSort = (column: 'name' | 'email' | 'createdAt' | 'updatedAt' | 'status') => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortOrder(column === 'name' || column === 'email' ? 'asc' : 'desc')
    }
    setPage(1)
  }

  const renderSortIcon = (column: 'name' | 'email' | 'createdAt' | 'updatedAt' | 'status') => {
    if (sortBy !== column) {
      return <ArrowUpDown className="size-3 text-muted-foreground/60 group-hover:text-foreground" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="size-3 text-accent font-bold" />
    ) : (
      <ArrowDown className="size-3 text-accent font-bold" />
    )
  }

  const isFilterActive =
    search.trim() !== '' ||
    statusFilter !== 'ALL' ||
    roleFilter !== 'ALL' ||
    sortBy !== 'createdAt' ||
    sortOrder !== 'desc' ||
    limit !== 10

  const handleResetFilters = () => {
    setSearch('')
    setStatusFilter('ALL')
    setRoleFilter('ALL')
    setSortBy('createdAt')
    setSortOrder('desc')
    setLimit(10)
    setPage(1)
  }

  const isDeletedFilterActive =
    deletedSearch.trim() !== '' || deletedRoleFilter !== 'ALL' || deletedLimit !== 10

  const handleResetDeletedFilters = () => {
    setDeletedSearch('')
    setDeletedRoleFilter('ALL')
    setDeletedLimit(10)
    setDeletedPage(1)
  }

  const handleRefreshAll = useCallback(() => {
    handleRefresh()
    handleRefreshDeleted()
  }, [handleRefresh, handleRefreshDeleted])

  const openAction = (
    user: UserListItem,
    action: 'status' | 'role' | 'delete' | 'detail',
    permanent: boolean = false,
  ) => {
    setSelectedUser(user)
    if (action === 'detail') setShowDetail(true)
    else if (action === 'status') setShowStatusDialog(true)
    else if (action === 'role') setShowRoleDialog(true)
    else if (action === 'delete') {
      setDeletePermanent(permanent)
      setShowDeleteDialog(true)
    }
  }

  const paginationInfo = useMemo(() => {
    if (total === 0) return { from: 0, to: 0 }
    const from = (page - 1) * limit + 1
    const to = Math.min(page * limit, total)
    return { from, to }
  }, [page, limit, total])

  if (loading && users.length === 0) {
    return <UserManagementSkeleton />
  }

  return (
    <RoleGuard
      fallback={<UserManagementSkeleton />}
      permissions={[
        'user.read',
        'user.create',
        'user.update',
        'user.delete',
        'user.status.update',
        'user.role.update',
        'user.deactivate',
        'employee.read',
        'intern.read',
        'users.read',
        'users.create',
        'users.update',
        'users.delete',
      ]}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="size-6 text-accent" />
              User Management
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage system users — view profiles, update status, assign roles, and manage user
              lifecycle.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'all' && isFilterActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer h-8"
              >
                <X className="size-3.5" />
                Reset Filters
              </Button>
            )}
            {activeTab === 'deleted' && isDeletedFilterActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetDeletedFilters}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer h-8"
              >
                <X className="size-3.5" />
                Reset Filters
              </Button>
            )}
            {canCreateUser && (
              <Button
                size="sm"
                onClick={() => setShowCreateUserDialog(true)}
                className="gap-2 bg-accent hover:bg-accent text-white cursor-pointer h-8 text-xs font-semibold"
              >
                <UserPlus className="size-3.5" />
                Create User
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={loading || isFetching || deletedLoading || deletedIsFetching}
              className="gap-2 cursor-pointer border-border h-8"
            >
              <RefreshCw
                className={cn(
                  'size-3.5',
                  (loading || isFetching || deletedLoading || deletedIsFetching) && 'animate-spin',
                )}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Navigation Tabs: All Users vs Deleted Users */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'all' | 'deleted')}>
          <TabsList className="w-fit bg-muted/40 p-1 border border-border/60">
            <TabsTrigger value="all" className="gap-2 text-xs cursor-pointer">
              <Users className="size-3.5" />
              All Users
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                {total}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="deleted" className="gap-2 text-xs cursor-pointer">
              <Archive className="size-3.5" />
              Deleted Users
              {totalDeleted > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1 text-[10px] px-1.5 py-0 h-4 bg-red-500/20 text-red-300 border border-red-500/30"
                >
                  {totalDeleted}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'all' ? (
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="flex flex-col gap-4 pb-4">
              {/* Filter Bar */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                {/* Search input */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-8 text-xs h-9"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters dropdowns */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5">
                    <Combobox
                      value={statusFilter}
                      options={filterStatusOptions}
                      onValueChange={(val) => {
                        setStatusFilter(val)
                        setPage(1)
                      }}
                      triggerClassName="h-9 text-xs w-[130px] bg-subtle/70 border-hairline-light"
                      placeholder="All Status"
                      searchPlaceholder="Filter status..."
                      renderTrigger={(selected) => (
                        <div className="flex items-center gap-1.5 truncate">
                          <Filter className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate">
                            {statusFilter === 'ALL' ? 'All Status' : statusFilter}
                          </span>
                        </div>
                      )}
                    />
                  </div>

                  {/* Role Filter */}
                  <div className="flex items-center gap-1.5">
                    <Combobox
                      value={roleFilter}
                      options={filterRoleOptions}
                      onValueChange={(val) => {
                        setRoleFilter(val)
                        setPage(1)
                      }}
                      triggerClassName="h-9 text-xs w-[145px] bg-subtle/70 border-hairline-light"
                      placeholder="All Roles"
                      searchPlaceholder="Search roles..."
                      renderTrigger={(selected) => (
                        <div className="flex items-center gap-1.5 truncate">
                          <UserCog className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate">
                            {roleFilter === 'ALL'
                              ? 'All Roles'
                              : rolesMap[roleFilter] || 'Selected Role'}
                          </span>
                        </div>
                      )}
                    />
                  </div>

                  {/* Sort Order Selector */}
                  <div className="flex items-center gap-1.5">
                    <Select
                      value={`${sortBy}_${sortOrder}`}
                      onValueChange={(val) => {
                        const [f, o] = val.split('_')
                        setSortBy(f as 'name' | 'email' | 'createdAt' | 'updatedAt' | 'status')
                        setSortOrder(o as 'asc' | 'desc')
                        setPage(1)
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs w-[150px] bg-subtle/70 border-hairline-light">
                        <div className="flex items-center gap-1.5 truncate">
                          <SlidersHorizontal className="size-3 text-muted-foreground" />
                          <span className="truncate">
                            {sortBy === 'createdAt'
                              ? sortOrder === 'desc'
                                ? 'Newest First'
                                : 'Oldest First'
                              : sortBy === 'name'
                                ? `Name (${sortOrder.toUpperCase()})`
                                : sortBy === 'email'
                                  ? `Email (${sortOrder.toUpperCase()})`
                                  : `Status (${sortOrder.toUpperCase()})`}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-canvas border-hairline-light text-muted text-xs">
                        <SelectItem value="createdAt_desc">Newest First</SelectItem>
                        <SelectItem value="createdAt_asc">Oldest First</SelectItem>
                        <SelectItem value="name_asc">Name (A–Z)</SelectItem>
                        <SelectItem value="name_desc">Name (Z–A)</SelectItem>
                        <SelectItem value="email_asc">Email (A–Z)</SelectItem>
                        <SelectItem value="email_desc">Email (Z–A)</SelectItem>
                        <SelectItem value="status_asc">Status (A–Z)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Results count & Active filters info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                <div>
                  {total > 0 ? (
                    <>
                      Showing{' '}
                      <strong>
                        {paginationInfo.from}–{paginationInfo.to}
                      </strong>{' '}
                      of <strong>{total}</strong> user{total !== 1 ? 's' : ''}
                    </>
                  ) : (
                    'No users match your criteria'
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px]">Items per page:</span>
                  <Select
                    value={String(limit)}
                    onValueChange={(val) => {
                      setLimit(Number(val))
                      setPage(1)
                    }}
                  >
                    <SelectTrigger className="h-7 text-[11px] w-16 bg-subtle/70 border-hairline-light">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-canvas border-hairline-light text-muted text-xs min-w-16">
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60 hover:bg-transparent">
                      <TableHead>
                        <button
                          type="button"
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground group cursor-pointer transition-colors"
                        >
                          User {renderSortIcon('name')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type="button"
                          onClick={() => handleSort('email')}
                          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground group cursor-pointer transition-colors"
                        >
                          Contact {renderSortIcon('email')}
                        </button>
                      </TableHead>
                      <TableHead className="text-xs">Role</TableHead>
                      <TableHead>
                        <button
                          type="button"
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground group cursor-pointer transition-colors"
                        >
                          Status {renderSortIcon('status')}
                        </button>
                      </TableHead>
                      <TableHead className="text-xs font-semibold">Onboarding</TableHead>
                      <TableHead>
                        <button
                          type="button"
                          onClick={() => handleSort('createdAt')}
                          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground group cursor-pointer transition-colors"
                        >
                          Joined {renderSortIcon('createdAt')}
                        </button>
                      </TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Skeleton className="size-8 rounded-full shrink-0" />
                              <div className="space-y-1">
                                <Skeleton className="h-3.5 w-28 rounded-none" />
                                <Skeleton className="h-2.5 w-36 rounded-none" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-20 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-3.5 w-20 rounded-none" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-3.5 w-20 rounded-none" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="size-7 rounded-none ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-36 text-center text-xs text-muted-foreground"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <AlertTriangle className="size-6 text-muted" />
                            <span>No users found with the current filters.</span>
                            {isFilterActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetFilters}
                                className="text-xs mt-1 border-hairline-light"
                              >
                                Clear filters
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => {
                        const initials = user.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()

                        return (
                          <TableRow
                            key={user.id}
                            className="border-border/60 hover:bg-muted/20 group"
                          >
                            {/* User */}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="size-8 ring-1 ring-border">
                                  <AvatarImage
                                    src={user.avatar || user.avatarUrl || user.image}
                                    alt={user.name}
                                  />
                                  <AvatarFallback className="bg-muted text-[10px] font-bold text-foreground">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-semibold text-xs text-foreground truncate">
                                    {user.name}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-mono truncate">
                                    {user.id.slice(0, 12)}…
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            {/* Contact */}
                            <TableCell>
                              <div className="flex flex-col text-xs">
                                <span className="text-foreground">{user.email}</span>
                                <span className="text-[11px] text-muted-foreground">
                                  {user.phone || '—'}
                                </span>
                              </div>
                            </TableCell>

                            {/* Role */}
                            <TableCell>
                              {canUpdateRole && rolesList.length > 0 ? (
                                <Combobox
                                  value={user.roleId}
                                  options={roleOptions}
                                  onValueChange={(newRoleId) =>
                                    handleInlineRoleChange(user.id, newRoleId)
                                  }
                                  isLoading={updatingRoleUserId === user.id}
                                  triggerClassName="h-7 w-auto min-w-[120px] max-w-[170px] px-2 py-0 text-xs border-border/70 hover:bg-muted/40 bg-subtle/60"
                                  placeholder="Select role"
                                  searchPlaceholder="Search roles..."
                                  emptyText="No role found."
                                  renderTrigger={(selected) => {
                                    if (selected?.badge) return selected.badge
                                    return (
                                      <RoleBadge
                                        roleRaw={
                                          user.role ||
                                          (user.roleId ? rolesMap[user.roleId] : undefined) ||
                                          user.roleName ||
                                          user.role_name
                                        }
                                      />
                                    )
                                  }}
                                />
                              ) : (
                                <RoleBadge
                                  roleRaw={
                                    user.role ||
                                    (user.roleId ? rolesMap[user.roleId] : undefined) ||
                                    user.roleName ||
                                    user.role_name
                                  }
                                />
                              )}
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              {canUpdateStatus ? (
                                <Combobox
                                  value={user.status?.toUpperCase()}
                                  options={STATUS_OPTIONS}
                                  onValueChange={(newStatus) =>
                                    handleInlineStatusChange(user.id, newStatus)
                                  }
                                  isLoading={updatingStatusUserId === user.id}
                                  triggerClassName="h-7 w-auto min-w-[110px] max-w-[140px] px-2 py-0 text-xs border-border/70 hover:bg-muted/40 bg-subtle/60"
                                  placeholder="Select status"
                                  searchPlaceholder="Search status..."
                                  emptyText="No status found."
                                  renderTrigger={(selected) => {
                                    if (selected?.badge) return selected.badge
                                    return <StatusBadge status={user.status} />
                                  }}
                                />
                              ) : (
                                <StatusBadge status={user.status} />
                              )}
                            </TableCell>

                            {/* Onboarding / Invitation */}
                            <TableCell>
                              <InvitationBadge invitation={user.invitation} />
                            </TableCell>

                            {/* Joined */}
                            <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </TableCell>

                            {/* Actions: View (icon only) & Remove/Delete (icon only) */}
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {/* 1. View icon only */}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openAction(user, 'detail')}
                                  className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
                                  title="View User Details"
                                >
                                  <Eye className="size-3.5" />
                                  <span className="sr-only">View User Details</span>
                                </Button>

                                {/* 2. Invitation actions for pending invitations */}
                                {user.invitation?.status === 'PENDING' && (
                                  <>
                                    {canResendInvitation && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setUserForInvitation(user)
                                          setShowResendDialog(true)
                                        }}
                                        className="size-7 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 cursor-pointer transition-colors"
                                        title="Resend Invitation"
                                      >
                                        <Mail className="size-3.5" />
                                        <span className="sr-only">Resend Invitation</span>
                                      </Button>
                                    )}
                                    {canRevokeInvitation && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setUserForInvitation(user)
                                          setShowRevokeDialog(true)
                                        }}
                                        className="size-7 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 cursor-pointer transition-colors"
                                        title="Revoke Invitation"
                                      >
                                        <Ban className="size-3.5" />
                                        <span className="sr-only">Revoke Invitation</span>
                                      </Button>
                                    )}
                                  </>
                                )}

                                {/* 2. Remove/Delete icon only with 2 options */}
                                {currentUser?.id === user.id ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled
                                    className="size-7 text-muted-foreground/30 cursor-not-allowed"
                                    title="You cannot delete your own account"
                                  >
                                    <Trash2 className="size-3.5" />
                                    <span className="sr-only">Delete User</span>
                                  </Button>
                                ) : (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
                                        title="Delete User"
                                      >
                                        <Trash2 className="size-3.5" />
                                        <span className="sr-only">Delete User</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="bg-canvas border-hairline-light text-muted text-xs w-56 p-1"
                                    >
                                      <DropdownMenuItem
                                        className="flex items-start gap-2.5 p-2 cursor-pointer text-amber-400 focus:text-amber-300 focus:bg-amber-950/30 rounded-none"
                                        onClick={() => openAction(user, 'delete', false)}
                                      >
                                        <Archive className="size-4 mt-0.5 shrink-0" />
                                        <div className="flex flex-col">
                                          <span className="font-semibold text-xs">Soft Delete</span>
                                          <span className="text-[10px] text-muted font-normal">
                                            Marks inactive &amp; archives account
                                          </span>
                                        </div>
                                      </DropdownMenuItem>

                                      <DropdownMenuSeparator className="bg-muted my-1" />

                                      <DropdownMenuItem
                                        className="flex items-start gap-2.5 p-2 cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-950/30 rounded-none"
                                        onClick={() => openAction(user, 'delete', true)}
                                      >
                                        <Trash2 className="size-4 mt-0.5 shrink-0" />
                                        <div className="flex flex-col">
                                          <span className="font-semibold text-xs">
                                            Permanent Delete from DB
                                          </span>
                                          <span className="text-[10px] text-red-400/80 font-normal">
                                            Permanently wipes from database
                                          </span>
                                        </div>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-3.5 border-t border-border/60 gap-3">
                <div className="text-xs text-muted-foreground">
                  Page <strong className="text-foreground">{page}</strong> of{' '}
                  <strong className="text-foreground">{Math.max(1, totalPages)}</strong>
                  {total > 0 && (
                    <span className="ml-1 text-muted">
                      ({total} total user{total !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="gap-1.5 text-xs cursor-pointer h-8"
                  >
                    <ChevronLeft className="size-3.5" />
                    Prev
                  </Button>

                  {/* Numbered Page Buttons */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (page <= 3) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = page - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          disabled={loading}
                          onClick={() => setPage(pageNum)}
                          className={cn(
                            'size-8 p-0 text-xs cursor-pointer',
                            page === pageNum
                              ? 'bg-accent hover:bg-accent text-white font-bold'
                              : 'border-border text-muted-foreground hover:text-foreground',
                          )}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((p) => p + 1)}
                    className="gap-1.5 text-xs cursor-pointer h-8"
                  >
                    Next
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="flex flex-col gap-4 pb-4">
              {/* Filter Bar */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                {/* Search input */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search deleted users..."
                    value={deletedSearch}
                    onChange={(e) => setDeletedSearch(e.target.value)}
                    className="pl-8 pr-8 text-xs h-9"
                  />
                  {deletedSearch && (
                    <button
                      type="button"
                      onClick={() => setDeletedSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Role filter & Rows per page */}
                <div className="flex flex-wrap items-center gap-2">
                  <Combobox
                    value={deletedRoleFilter}
                    options={filterRoleOptions}
                    onValueChange={(val) => {
                      setDeletedRoleFilter(val)
                      setDeletedPage(1)
                    }}
                    triggerClassName="h-9 w-auto min-w-[140px] text-xs"
                    placeholder="All Roles"
                    searchPlaceholder="Filter role..."
                    emptyText="No role found."
                    renderTrigger={(selected) => {
                      if (selected?.badge) return selected.badge
                      return (
                        <span className="flex items-center gap-1.5 text-xs">
                          <UserCog className="size-3 text-muted-foreground" />
                          {selected?.label || 'All Roles'}
                        </span>
                      )
                    }}
                  />

                  {/* Rows per page */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs gap-1.5 border-border cursor-pointer"
                      >
                        <span>{deletedLimit} / page</span>
                        <ChevronDown className="size-3 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-28 text-xs">
                      {[10, 20, 50, 100].map((l) => (
                        <DropdownMenuItem
                          key={l}
                          onClick={() => {
                            setDeletedLimit(l)
                            setDeletedPage(1)
                          }}
                          className={cn(
                            'cursor-pointer text-xs justify-between',
                            deletedLimit === l && 'font-bold text-accent',
                          )}
                        >
                          {l} rows
                          {deletedLimit === l && <Check className="size-3" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Active Filter Tags */}
              {isDeletedFilterActive && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/40 text-xs">
                  <span className="text-muted-foreground text-[11px] mr-1">Active filters:</span>
                  {deletedSearch && (
                    <Badge variant="secondary" className="gap-1 text-[11px] font-normal py-0.5">
                      Search: &ldquo;{deletedSearch}&rdquo;
                      <button
                        type="button"
                        onClick={() => setDeletedSearch('')}
                        className="cursor-pointer hover:text-foreground"
                      >
                        <X className="size-2.5" />
                      </button>
                    </Badge>
                  )}
                  {deletedRoleFilter !== 'ALL' && (
                    <Badge variant="secondary" className="gap-1 text-[11px] font-normal py-0.5">
                      Role: {rolesMap[deletedRoleFilter] || deletedRoleFilter}
                      <button
                        type="button"
                        onClick={() => setDeletedRoleFilter('ALL')}
                        className="cursor-pointer hover:text-foreground"
                      >
                        <X className="size-2.5" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              {/* Deleted Users Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60 hover:bg-transparent bg-muted/20">
                      <TableHead className="w-[280px] text-xs font-semibold">User</TableHead>
                      <TableHead className="text-xs font-semibold">Phone</TableHead>
                      <TableHead className="text-xs font-semibold">Role</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-xs font-semibold">Deleted At</TableHead>
                      <TableHead className="text-right text-xs font-semibold pr-6">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {deletedLoading && deletedUsers.length === 0 ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-border/40">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Skeleton className="size-8 rounded-full" />
                              <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-2.5 w-40" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-3 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-3 w-24" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-7 w-16 ml-auto rounded-none" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : deletedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-44 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                            <Archive className="size-8 text-muted-foreground/40 mb-1" />
                            <p className="text-sm font-medium text-foreground">
                              No deleted users found
                            </p>
                            <p className="text-xs text-muted-foreground max-w-sm">
                              {isDeletedFilterActive
                                ? 'No deleted users match your search or filter criteria. Try clearing filters.'
                                : 'Users who are soft-deleted will appear here. You can restore or permanently delete them.'}
                            </p>
                            {isDeletedFilterActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetDeletedFilters}
                                className="mt-2 text-xs h-7 gap-1 cursor-pointer"
                              >
                                <X className="size-3" />
                                Clear Filters
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      deletedUsers.map((user) => {
                        const avatarSrc = user.avatar || user.avatarUrl || user.image
                        const initials = user.name
                          ? user.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()
                          : 'U'

                        return (
                          <TableRow
                            key={user.id}
                            className="border-border/40 hover:bg-muted/30 transition-colors group"
                          >
                            {/* User Column */}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="size-8 ring-1 ring-border/50 shrink-0">
                                  <AvatarImage src={avatarSrc} alt={user.name || 'User'} />
                                  <AvatarFallback className="text-[11px] bg-muted font-medium text-muted-foreground">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-semibold text-xs text-foreground truncate group-hover:text-accent transition-colors">
                                    {user.name || 'Unnamed User'}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground truncate">
                                    {user.email || '—'}
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            {/* Phone */}
                            <TableCell>
                              <span className="text-[11px] text-muted-foreground">
                                {user.phone || '—'}
                              </span>
                            </TableCell>

                            {/* Role */}
                            <TableCell>
                              <RoleBadge
                                roleRaw={
                                  user.role ||
                                  (user.roleId ? rolesMap[user.roleId] : undefined) ||
                                  user.roleName ||
                                  user.role_name
                                }
                              />
                            </TableCell>

                            {/* Status - Non-editable DELETED badge */}
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-[10px] font-semibold gap-1.5 bg-red-500/10 text-red-400 border-red-500/20"
                              >
                                <span className="size-1.5 rounded-full bg-red-400" />
                                DELETED
                              </Badge>
                            </TableCell>

                            {/* Deleted At */}
                            <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                              {user.deletedAt
                                ? new Date(user.deletedAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '—'}
                            </TableCell>

                            {/* Actions: View, Restore, Permanent Delete */}
                            <TableCell className="text-right pr-6">
                              <div className="flex items-center justify-end gap-1">
                                {/* View Details */}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openAction(user, 'detail')}
                                  className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
                                  title="View User Details"
                                >
                                  <Eye className="size-3.5" />
                                  <span className="sr-only">View User Details</span>
                                </Button>

                                {/* Restore User Action */}
                                {canRestore && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setUserToRestore(user)
                                      setShowRestoreDialog(true)
                                    }}
                                    className="size-7 text-accent hover:text-accent hover:bg-accent-soft cursor-pointer transition-colors"
                                    title="Restore User"
                                  >
                                    <RotateCcw className="size-3.5" />
                                    <span className="sr-only">Restore User</span>
                                  </Button>
                                )}

                                {/* Permanent Delete Action */}
                                {currentUser?.id === user.id ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled
                                    className="size-7 text-muted-foreground/30 cursor-not-allowed"
                                    title="You cannot delete your own account"
                                  >
                                    <Trash2 className="size-3.5" />
                                    <span className="sr-only">Delete User</span>
                                  </Button>
                                ) : canDelete ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openAction(user, 'delete', true)}
                                    className="size-7 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
                                    title="Permanently Delete User"
                                  >
                                    <Trash2 className="size-3.5" />
                                    <span className="sr-only">Permanently Delete User</span>
                                  </Button>
                                ) : null}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-3.5 border-t border-border/60 gap-3">
                <div className="text-xs text-muted-foreground">
                  Page <strong className="text-foreground">{deletedPage}</strong> of{' '}
                  <strong className="text-foreground">{Math.max(1, totalDeletedPages)}</strong>
                  {totalDeleted > 0 && (
                    <span className="ml-1 text-muted">
                      ({totalDeleted} deleted user{totalDeleted !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={deletedPage <= 1 || deletedLoading}
                    onClick={() => setDeletedPage((p) => Math.max(1, p - 1))}
                    className="gap-1.5 text-xs cursor-pointer h-8"
                  >
                    <ChevronLeft className="size-3.5" />
                    Prev
                  </Button>

                  {/* Numbered Page Buttons */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalDeletedPages) }, (_, i) => {
                      let pageNum: number
                      if (totalDeletedPages <= 5) {
                        pageNum = i + 1
                      } else if (deletedPage <= 3) {
                        pageNum = i + 1
                      } else if (deletedPage >= totalDeletedPages - 2) {
                        pageNum = totalDeletedPages - 4 + i
                      } else {
                        pageNum = deletedPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={deletedPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          disabled={deletedLoading}
                          onClick={() => setDeletedPage(pageNum)}
                          className={cn(
                            'size-8 p-0 text-xs cursor-pointer',
                            deletedPage === pageNum
                              ? 'bg-accent hover:bg-accent text-white font-bold'
                              : 'border-border text-muted-foreground hover:text-foreground',
                          )}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={deletedPage >= totalDeletedPages || deletedLoading}
                    onClick={() => setDeletedPage((p) => p + 1)}
                    className="gap-1.5 text-xs cursor-pointer h-8"
                  >
                    Next
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <UserDetailSheet
        userId={selectedUser?.id || null}
        open={showDetail}
        rolesMap={rolesMap}
        onClose={() => {
          setShowDetail(false)
        }}
        onSuccess={handleRefreshAll}
      />
      <UpdateStatusDialog
        user={selectedUser}
        open={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        onSuccess={handleRefreshAll}
      />
      <UpdateRoleDialog
        user={selectedUser}
        open={showRoleDialog}
        onClose={() => setShowRoleDialog(false)}
        onSuccess={handleRefreshAll}
      />
      <DeleteUserDialog
        user={selectedUser}
        permanent={deletePermanent}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onSuccess={handleRefreshAll}
      />
      <RestoreUserDialog
        user={userToRestore}
        open={showRestoreDialog}
        onClose={() => {
          setShowRestoreDialog(false)
          setUserToRestore(null)
        }}
        onSuccess={handleRefreshAll}
      />
      <CreateUserDialog
        open={showCreateUserDialog}
        onClose={() => setShowCreateUserDialog(false)}
        roleOptions={roleOptions}
        onSuccess={handleRefreshAll}
      />
      <ResendInvitationDialog
        user={userForInvitation}
        open={showResendDialog}
        onClose={() => {
          setShowResendDialog(false)
          setUserForInvitation(null)
        }}
        onSuccess={handleRefreshAll}
      />
      <RevokeInvitationDialog
        user={userForInvitation}
        open={showRevokeDialog}
        onClose={() => {
          setShowRevokeDialog(false)
          setUserForInvitation(null)
        }}
        onSuccess={handleRefreshAll}
      />
    </RoleGuard>
  )
}
