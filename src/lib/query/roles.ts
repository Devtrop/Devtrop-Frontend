import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from './keys'
import {
  api,
  ApiError,
  type RolesListResponse,
  type RoleDetailResponse,
  type RolePermissionsResponse,
  type PermissionsListResponse,
  type CreateRolePayload,
  type UpdateRolePayload,
  type UpdateRolePermissionsPayload,
  type QueryPermissionDto,
} from '@/lib/api'
import { notifyPermissionChange } from '@/contexts/PermissionContext'

// ============= Role Queries =============

export function useRoles(options?: Partial<UseQueryOptions<RolesListResponse, Error>>) {
  return useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: () => api.getAllRoles(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  })
}

export function useRole(
  id: string | null | undefined,
  options?: Partial<UseQueryOptions<RoleDetailResponse, Error>>,
) {
  return useQuery({
    queryKey: queryKeys.roles.detail(id || ''),
    queryFn: () => api.getRoleById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

export function useRolePermissions(
  roleId: string | null | undefined,
  options?: Partial<UseQueryOptions<RolePermissionsResponse, Error>>,
) {
  return useQuery({
    queryKey: queryKeys.permissions.role(roleId || ''),
    queryFn: () => api.getRolePermissions(roleId!),
    enabled: !!roleId,
    staleTime: 1000 * 60,
    ...options,
  })
}

// ============= Permission Queries =============

export function useAllPermissions(
  query?: QueryPermissionDto,
  options?: Partial<UseQueryOptions<PermissionsListResponse, Error>>,
) {
  return useQuery({
    queryKey: queryKeys.permissions.list(),
    queryFn: () => api.getAllPermissions(query),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

// ============= Role Mutations =============

export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => api.createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
      toast.success('Role created successfully')
    },
    onError: (error: Error) => {
      const message =
        error instanceof ApiError ? error.message : error.message || 'Failed to create role'
      toast.error(message)
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      api.updateRole(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(variables.id) })
      toast.success('Role updated successfully')
    },
    onError: (error: Error) => {
      const message =
        error instanceof ApiError ? error.message : error.message || 'Failed to update role'
      toast.error(message)
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      notifyPermissionChange()
      toast.success('Role deleted successfully')
    },
    onError: (error: Error) => {
      const message =
        error instanceof ApiError ? error.message : error.message || 'Failed to delete role'
      toast.error(message)
    },
  })
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roleId, payload }: { roleId: string; payload: UpdateRolePermissionsPayload }) =>
      api.updateRolePermissions(roleId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(variables.roleId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.role(variables.roleId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all })
      notifyPermissionChange()
      toast.success('Permissions updated successfully')
    },
    onError: (error: Error) => {
      const message =
        error instanceof ApiError ? error.message : error.message || 'Failed to update permissions'
      toast.error(message)
    },
  })
}
