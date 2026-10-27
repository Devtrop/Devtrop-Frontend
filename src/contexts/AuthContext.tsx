'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useSyncExternalStore,
} from 'react'
import {
  api,
  LoginPayload,
  VerifyLoginOtpPayload,
  ResendLoginOtpPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ResendVerificationPayload,
  AuthResponse,
} from '@/lib/api'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role?: string | { id?: string; name?: string; roleName?: string }
  roleName?: string
  role_name?: string
  roles?: (string | { id?: string; name?: string })[]
  avatar?: string
  image?: string
  avatarUrl?: string
  [key: string]: unknown
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<AuthResponse>
  verifyLoginOtp: (payload: VerifyLoginOtpPayload) => Promise<AuthResponse>
  resendLoginOtp: (payload: ResendLoginOtpPayload) => Promise<AuthResponse>
  register: (payload: RegisterPayload) => Promise<AuthResponse>
  logout: () => Promise<void>
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<AuthResponse>
  resetPassword: (payload: ResetPasswordPayload) => Promise<AuthResponse>
  resendVerification: (payload: ResendVerificationPayload) => Promise<AuthResponse>
  refreshToken: (refreshTokenParam?: string) => Promise<AuthResponse>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_TOKEN_KEY = 'rt_auth_token'
const AUTH_USER_KEY = 'rt_auth_user'

function subscribeToAuth(callback: () => void): () => void {
  window.addEventListener('auth-change', callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener('auth-change', callback)
    window.removeEventListener('storage', callback)
  }
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

function getServerSnapshot(): string | null {
  return null
}

function getUserSnapshot(): string | null {
  try {
    return localStorage.getItem(AUTH_USER_KEY)
  } catch {
    return null
  }
}

function getServerUserSnapshot(): string | null {
  return null
}

function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-change'))
  }
}

function extractUserFromResponse(res: unknown): User | null {
  if (!res || typeof res !== 'object') return null
  const obj = res as Record<string, unknown>
  if (obj.user && typeof obj.user === 'object') return obj.user as User
  const data = obj.data as Record<string, unknown> | undefined
  if (data?.user && typeof data.user === 'object') return data.user as User
  if (data && typeof data === 'object' && ('email' in data || 'id' in data)) {
    return data as unknown as User
  }
  if ('email' in obj || 'id' in obj) {
    return obj as unknown as User
  }
  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const lastFetchedTokenRef = useRef<string | null>(null)

  const token = useSyncExternalStore(subscribeToAuth, getSnapshot, getServerSnapshot)
  const userJson = useSyncExternalStore(subscribeToAuth, getUserSnapshot, getServerUserSnapshot)

  const user: User | null = useMemo(() => {
    if (!userJson) return null
    try {
      return JSON.parse(userJson) as User
    } catch {
      return null
    }
  }, [userJson])

  // Derive authentication state directly from token
  const isAuthenticated = !!token
  const isLoading = isProfileLoading

  // Ensure SSR cookie stays in lockstep with token state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (token) {
        document.cookie = `rt_auth_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`
        document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`
      } else {
        document.cookie =
          'rt_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
        document.cookie =
          'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
      }
    }
  }, [token])

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Call backend logout to clear HTTP-only cookies
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
      }).catch(() => {
        // ignore errors
      })
    } catch {
      // ignore
    }
    lastFetchedTokenRef.current = null
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem('rt_auth_refresh_token')
    localStorage.removeItem('rt_refresh_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('access_token')
    localStorage.removeItem('token')
    localStorage.removeItem('accessToken')
    localStorage.removeItem(AUTH_USER_KEY)

    // Clear all cookies by setting them to expire
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
    })

    notifyAuthChange()
  }, [])

  useEffect(() => {
    if (!token || token === lastFetchedTokenRef.current) return

    lastFetchedTokenRef.current = token
    let cancelled = false
    setIsProfileLoading(true)

    api
      .getProfile()
      .then((res) => {
        if (!cancelled) {
          const profileUser = extractUserFromResponse(res)
          if (profileUser) {
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profileUser))
            notifyAuthChange()
          }
        }
      })
      .catch((err: unknown) => {
        const status = (err as { status?: number })?.status
        if (status === 401) {
          // Token is invalid/expired and refresh failed; clear session cleanly
          void logout()
        } else {
          // Keep login session intact for transient server (5xx) or network errors
          const message = err instanceof Error ? err.message : String(err)
          console.warn(`Profile sync background notice: ${message}`)
        }
      })
      .finally(() => {
        if (!cancelled) setIsProfileLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, logout])

  const login = useCallback(async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.login(payload)
    const raw = res as Record<string, any>
    const extractedToken =
      raw?.token ||
      raw?.accessToken ||
      raw?.access_token ||
      raw?.data?.token ||
      raw?.data?.accessToken ||
      raw?.data?.access_token

    if (extractedToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, extractedToken)
      localStorage.setItem('access_token', extractedToken)
      localStorage.setItem('token', extractedToken)
      localStorage.setItem('accessToken', extractedToken)
      if (typeof window !== 'undefined') {
        document.cookie = `rt_auth_token=${encodeURIComponent(extractedToken)}; path=/; max-age=86400; SameSite=Lax`
        document.cookie = `access_token=${encodeURIComponent(extractedToken)}; path=/; max-age=86400; SameSite=Lax`
      }
    }
    const loggedUser = extractUserFromResponse(res)
    if (loggedUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedUser))
    }
    if (extractedToken || loggedUser) {
      notifyAuthChange()
    }
    return res
  }, [])

  const verifyLoginOtp = useCallback(
    async (payload: VerifyLoginOtpPayload): Promise<AuthResponse> => {
      const res = await api.verifyLoginOtp(payload)
      const raw = res as Record<string, any>
      const extractedToken =
        raw?.token ||
        raw?.accessToken ||
        raw?.access_token ||
        raw?.data?.token ||
        raw?.data?.accessToken ||
        raw?.data?.access_token

      if (extractedToken) {
        localStorage.setItem(AUTH_TOKEN_KEY, extractedToken)
        localStorage.setItem('access_token', extractedToken)
        localStorage.setItem('token', extractedToken)
        localStorage.setItem('accessToken', extractedToken)
        if (typeof window !== 'undefined') {
          document.cookie = `rt_auth_token=${encodeURIComponent(extractedToken)}; path=/; max-age=86400; SameSite=Lax`
          document.cookie = `access_token=${encodeURIComponent(extractedToken)}; path=/; max-age=86400; SameSite=Lax`
        }
      }
      const loggedUser = extractUserFromResponse(res)
      if (loggedUser) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedUser))
      }
      notifyAuthChange()
      return res
    },
    [],
  )

  const resendLoginOtp = useCallback(
    async (payload: ResendLoginOtpPayload): Promise<AuthResponse> => {
      return api.resendLoginOtp(payload)
    },
    [],
  )

  const register = useCallback(async (payload: RegisterPayload): Promise<AuthResponse> => {
    return api.register(payload)
  }, [])

  const forgotPassword = useCallback(
    async (payload: ForgotPasswordPayload): Promise<AuthResponse> => {
      return api.forgotPassword(payload)
    },
    [],
  )

  const resetPassword = useCallback(
    async (payload: ResetPasswordPayload): Promise<AuthResponse> => {
      return api.resetPassword(payload)
    },
    [],
  )

  const resendVerification = useCallback(
    async (payload: ResendVerificationPayload): Promise<AuthResponse> => {
      return api.resendVerification(payload)
    },
    [],
  )

  const refreshToken = useCallback(async (refreshTokenParam?: string): Promise<AuthResponse> => {
    return api.refreshToken(refreshTokenParam)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        verifyLoginOtp,
        resendLoginOtp,
        register,
        logout,
        forgotPassword,
        resetPassword,
        resendVerification,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
