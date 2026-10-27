import { env } from '@/config/env'
import { api } from './api'

// For public client fetching, use the public API base URL
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use the public environment variable
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
  }
  // Server-side: use the server environment variable (includes /api/v1)
  return env.BACKEND_BASE_URL
}

export interface Client {
  id: string
  name: string
  imageUrl: string
  imageKey: string
  isHidden: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateClientDto {
  name: string
  order?: number
}

export interface UpdateClientDto {
  name?: string
  order?: number
}

export interface UpdateClientVisibilityDto {
  isHidden: boolean
}

/**
 * Fetch all visible clients for public display
 */
export async function fetchClients(): Promise<Client[]> {
  const baseUrl = getBaseUrl()
  // Ensure we append /api/v1 for client-side requests that only have the base URL
  const apiUrl = baseUrl.includes('/api/v1') ? baseUrl : `${baseUrl}/api/v1`

  const response = await fetch(`${apiUrl}/clients`, {
    cache: 'no-store',
  })
  // console.log(apiUrl)

  if (!response.ok) {
    throw new Error('Failed to fetch clients')
  }

  const result = await response.json()

  // Backend returns { success: true, message: '...', data: [...] }
  // Extract the data array
  if (result && typeof result === 'object' && 'data' in result) {
    return Array.isArray(result.data) ? result.data : []
  }

  // Fallback: if response is already an array
  return Array.isArray(result) ? result : []
}

// ============= Admin Client API =============

/**
 * Get all clients (including hidden) - Admin only
 */
export async function getAllClients(): Promise<Client[]> {
  return api.get<Client[]>('/admin/clients')
}

/**
 * Create a new client with image
 */
export async function createClient(data: CreateClientDto, image: File): Promise<Client> {
  const formData = new FormData()
  formData.append('name', data.name)
  if (data.order !== undefined) {
    formData.append('order', String(data.order))
  }
  formData.append('image', image)

  return api.post<Client>('/admin/clients', formData)
}

/**
 * Update a client
 */
export async function updateClient(
  id: string,
  data: UpdateClientDto,
  image?: File,
): Promise<Client> {
  const formData = new FormData()
  if (data.name) formData.append('name', data.name)
  if (data.order !== undefined) formData.append('order', String(data.order))
  if (image) formData.append('image', image)

  return api.patch<Client>(`/admin/clients/${id}`, formData)
}

/**
 * Update client visibility (hide/show)
 */
export async function updateClientVisibility(id: string, isHidden: boolean): Promise<Client> {
  return api.patch<Client>(`/admin/clients/${id}/visibility`, { isHidden })
}

/**
 * Delete a client
 */
export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/admin/clients/${id}`)
}
