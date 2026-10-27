import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from './keys'
import {
  api,
  ApiError,
  type PaginatedUsersResponse,
  type UserDetailResponse,
  type UpdateUserStatusPayload,
  type UpdateUserRolePayload,
  type ApiActionResponse,
  type CreateUserPayload,
  type CreateUserResponse,
  type InvitationDetailsResponse,
  type AcceptInvitationPayload,
} from '@/lib/api'
import { notifyPermissionChange } from '@/contexts/PermissionContext'

export interface QueryUsersParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  roleId?: string
}

// ============= User Queries =============

export function useUsers(
  params?: QueryUsersParams,
  options?: Partial<UseQueryOptions<PaginatedUsersResponse, Error>>,
) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => api.getUsers(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30, // 30 seconds
    ...options,
  })
}

export { userKeys } from './keys'

export function useDeletedUsers(
  params?: QueryUsersParams,
  options?: Partial<UseQueryOptions<PaginatedUsersResponse, Error>>,
) {
  return useQuery({
    queryKey: queryKeys.users.deleted(params),
    queryFn: () => api.getDeletedUsers(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30, // 30 seconds
    ...options,
  })
}

export function useUser(
  id: string | null | undefined,
  options?: Partial<UseQueryOptions<UserDetailResponse, Error>>,
) {
  return useQuery({
    queryKey: queryKeys.users.detail(id || ''),
    queryFn: () => api.getUserById(id!),
    enabled: !!id,
    staleTime: 1000 * 60,
    ...options,
  })
}

// ============= User Mutations =============

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => api.createUser(payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      const message =
        res?.message ||
        `User created successfully. An invitation email has been sent to ${variables.email}.`
      toast.success(Array.isArray(message) ? message[0] : message)
    },
    onError: (error: Error) => {
      const message =
        error instanceof ApiError ? error.message : error.message || 'Failed to create user'
      toast.error(message)
    },
  })
}

export function useResendInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => api.resendInvitation(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) })
      toast.success('Invitation resent successfully.')
    },
    onError: (error: Error) => {
      const message =
        error instanceof ApiError ? error.message : error.message || 'Failed to resend invitation'
      toast.error(message)
    },
  })
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => api.revokeInvitation(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) })
      toast.success('Invitation revoked successfully.')
    },
    onError: (error: Error) => {
      const message =
        error instanceof ApiError ? error.message : error.message || 'Failed to revoke invitation'
      toast.error(message)
    },
  })
}

// ============= Invitation Queries & Mutations =============

export function useInvitationDetails(
  token: string | null | undefined,
  options?: Partial<UseQueryOptions<InvitationDetailsResponse, Error>>,
) {
  return useQuery({
    queryKey: queryKeys.invitations.detail(token || ''),
    queryFn: () => api.getInvitationDetails(token!),
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: (payload: AcceptInvitationPayload) => api.acceptInvitation(payload),
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserStatusPayload }) =>
      api.updateUserStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.deleted() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) })
      toast.success(`User status updated to ${variables.payload.status}`)
    },
    onError: (error: Error) => {
      const message =
        error instanceof ApiError ? error.message : error.message || 'Failed to update user status'
      toast.error(message)
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserRolePayload }) =>
      api.updateUserRole(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.deleted() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) })
      notifyPermissionChange()
      toast.success('Role assigned successfully')
    },
    onError: (error: Error) => {
      const message =
        error instanceof ApiError ? error.message : error.message || 'Failed to assign role'
      toast.error(message)
    },
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deactivateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.deleted() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) })
      toast.success('User deactivated successfully')
    },
    onError: (error: Error) => {
      const message =
        error instanceof ApiError ? error.message : error.message || 'Failed to deactivate user'
      toast.error(message)
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, permanent = false }: { id: string; permanent?: boolean }) =>
      api.deleteUser(id, permanent),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.deleted() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) })
      toast.success(
        variables.permanent
          ? 'User permanently deleted from database'
          : 'User soft deleted successfully',
      )
    },
    onError: (error: Error) => {
      const apiErr = error as ApiError
      const errCode = (apiErr?.code || (apiErr?.data as any)?.code || '').toString().toUpperCase()
      const errMsg = apiErr?.message || ''

      if (
        errCode === 'LAST_SUPER_ADMIN' ||
        errCode === 'CANNOT_DELETE_LAST_SUPER_ADMIN' ||
        errMsg.toLowerCase().includes('last super admin') ||
        errMsg.toLowerCase().includes('at least one active super admin')
      ) {
        toast.error(
          'This action cannot be completed because at least one active Super Admin must remain.',
        )
        return
      }

      toast.error(errMsg || 'Failed to delete user')
    },
  })
}

export function useRestoreUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.restoreUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.deleted() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) })
      toast.success('User restored successfully.')
    },
    onError: (error: Error) => {
      const message =
        error instanceof ApiError ? error.message : error.message || 'Failed to restore user'
      toast.error(message)
    },
  })
}
