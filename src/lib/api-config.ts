import { env } from '@/config/env'

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const publicApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (publicApiUrl) {
      return publicApiUrl.includes('/api/v1')
        ? publicApiUrl.replace(/\/+$/, '')
        : `${publicApiUrl.replace(/\/+$/, '')}/api/v1`
    }
    return '/api/v1'
  }
  return env.BACKEND_BASE_URL.replace(/\/+$/, '')
}

export const API_BASE_URL = getApiBaseUrl()

export const SITE_URL = env.NEXT_PUBLIC_SITE_URL

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return (
    localStorage.getItem('rt_auth_token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken')
  )
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rt_auth_token', token)
    localStorage.setItem('access_token', token)
    localStorage.setItem('token', token)
    document.cookie = `rt_auth_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`
    document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`
    window.dispatchEvent(new Event('auth-change'))
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rt_auth_token')
    localStorage.removeItem('access_token')
    localStorage.removeItem('token')
    localStorage.removeItem('accessToken')
    // Clear SSR cookies
    document.cookie = 'rt_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
    window.dispatchEvent(new Event('auth-change'))
  }
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

let refreshPromise: Promise<string | null> | null = null

export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const storedRefreshToken =
        localStorage.getItem('rt_refresh_token') ||
        localStorage.getItem('rt_auth_refresh_token') ||
        localStorage.getItem('refresh_token')

      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: storedRefreshToken ? JSON.stringify({ refreshToken: storedRefreshToken }) : undefined,
      })
      if (!res.ok) {
        // Refresh failed - clear everything to prevent auto-login loop
        removeAuthToken()
        localStorage.removeItem('rt_auth_user')
        localStorage.removeItem('rt_refresh_token')
        localStorage.removeItem('rt_auth_refresh_token')
        localStorage.removeItem('refresh_token')
        return null
      }
      const data = await res.json().catch(() => null)
      const token =
        data?.data?.access_token ||
        data?.access_token ||
        data?.data?.accessToken ||
        data?.accessToken

      const newRefreshToken =
        data?.data?.refresh_token ||
        data?.refresh_token ||
        data?.data?.refreshToken ||
        data?.refreshToken

      if (token && typeof token === 'string') {
        setAuthToken(token)
        if (newRefreshToken && typeof newRefreshToken === 'string') {
          localStorage.setItem('rt_refresh_token', newRefreshToken)
          localStorage.setItem('rt_auth_refresh_token', newRefreshToken)
          localStorage.setItem('refresh_token', newRefreshToken)
        }
        return token
      }
      // No token in response - clear everything
      removeAuthToken()
      localStorage.removeItem('rt_auth_user')
      localStorage.removeItem('rt_refresh_token')
      localStorage.removeItem('rt_auth_refresh_token')
      localStorage.removeItem('refresh_token')
      return null
    } catch {
      // Network error or other failure - clear everything
      removeAuthToken()
      localStorage.removeItem('rt_auth_user')
      localStorage.removeItem('rt_refresh_token')
      localStorage.removeItem('rt_auth_refresh_token')
      localStorage.removeItem('refresh_token')
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}
