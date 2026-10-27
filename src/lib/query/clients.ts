import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAllClients,
  createClient,
  updateClient,
  updateClientVisibility,
  deleteClient,
  type Client,
  type CreateClientDto,
  type UpdateClientDto,
} from '@/lib/clients'

// Query Keys
export const clientKeys = {
  all: ['clients'] as const,
  admin: ['clients', 'admin'] as const,
}

// ============= Queries =============

/**
 * Fetch all clients (admin view - includes hidden)
 */
export function useClients() {
  return useQuery({
    queryKey: clientKeys.admin,
    queryFn: getAllClients,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============= Mutations =============

/**
 * Create a new client
 */
export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, image }: { data: CreateClientDto; image: File }) =>
      createClient(data, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.admin })
      toast.success('Client created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create client')
    },
  })
}

/**
 * Update a client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
      image,
    }: {
      id: string
      data: UpdateClientDto
      image?: File
    }) => updateClient(id, data, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.admin })
      toast.success('Client updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update client')
    },
  })
}

/**
 * Update client visibility
 */
export function useUpdateClientVisibility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isHidden }: { id: string; isHidden: boolean }) =>
      updateClientVisibility(id, isHidden),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.admin })
      toast.success(
        variables.isHidden ? 'Client hidden successfully' : 'Client shown successfully'
      )
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update visibility')
    },
  })
}

/**
 * Delete a client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.admin })
      toast.success('Client deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete client')
    },
  })
}
