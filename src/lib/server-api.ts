import { cookies } from 'next/headers'
import { env } from '@/config/env'

/**
 * Reads the auth token from HTTP cookies on the server.
 */
export async function getServerAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get('rt_auth_token')?.value || cookieStore.get('access_token')?.value || null
  } catch {
    return null
  }
}

export interface ServerFetchResponse<T> {
  success: boolean
  data?: T
  message?: string
}

/**
 * Server-side authenticated fetch wrapper for Server Components.
 */
export async function serverFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ServerFetchResponse<T>> {
  const token = await getServerAuthToken()

  const baseUrl = env.BACKEND_BASE_URL.replace(/\/+$/, '')
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${baseUrl}${cleanEndpoint}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      cache: options.cache ?? 'no-store',
    })

    const json = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        message:
          json?.message && Array.isArray(json.message)
            ? json.message.join(', ')
            : json?.message || json?.error || `Request failed with status ${res.status}`,
      }
    }

    const responseData = json && typeof json === 'object' && 'data' in json ? json.data : json

    return {
      success: true,
      data: responseData as T,
      message: json?.message || 'Success',
    }
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Server network error occurred',
    }
  }
}

/**
 * Server-side fetch for public endpoints that do not require cookies.
 * Keeping cookies() out of this path allows Next.js to cache/revalidate the route.
 */
export async function publicServerFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ServerFetchResponse<T>> {
  const baseUrl = env.BACKEND_BASE_URL.replace(/\/+$/, '')
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${baseUrl}${cleanEndpoint}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    const json = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        message:
          json?.message && Array.isArray(json.message)
            ? json.message.join(', ')
            : json?.message || json?.error || `Request failed with status ${res.status}`,
      }
    }

    const responseData = json && typeof json === 'object' && 'data' in json ? json.data : json

    return {
      success: true,
      data: responseData as T,
      message: json?.message || 'Success',
    }
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Server network error occurred',
    }
  }
}
