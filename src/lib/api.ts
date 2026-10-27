import { env } from '@/config/env'
import { refreshAccessToken } from './api-config'

// Use the proper backend URL for both client and server
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use the public environment variable
    const publicApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
    // Ensure /api/v1 is appended
    return publicApiUrl.includes('/api/v1') ? publicApiUrl : `${publicApiUrl}/api/v1`
  }
  // Server-side: use the server environment variable (already includes /api/v1)
  return env.BACKEND_BASE_URL
}

const BASE_URL = getBaseUrl()

const AUTH_TOKEN_KEY = 'rt_auth_token'
const REFRESH_TOKEN_KEY = 'rt_refresh_token'
const AUTH_USER_KEY = 'rt_auth_user'

/**
 * Custom API Error class for better error handling.
 */
export class ApiError extends Error {
  public code?: string

  constructor(
    message: string,
    public status: number,
    public data?: unknown,
    code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
    const record = data && typeof data === 'object' ? (data as Record<string, any>) : {}
    this.code =
      code ||
      record.code ||
      record.errorCode ||
      record.error?.code ||
      (typeof record.error === 'string' ? record.error : undefined)
  }
}

export interface LoginPayload {
  email: string
  password: string
}

export interface VerifyLoginOtpPayload {
  email: string
  otp: string
}

export interface ResendLoginOtpPayload {
  email: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  password: string
  confirmPassword?: string
}

export interface ResendVerificationPayload {
  email: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string
  role?: string
  status?: string
  avatarKey?: string
  avatarUrl?: string
  avatar?: string
  image?: string
}

export interface AvatarUploadResponse {
  id?: string
  name?: string
  email?: string
  avatarKey?: string
  avatarUrl?: string
  statusCode?: number
  message?: string
  data?: {
    id?: string
    name?: string
    email?: string
    avatarKey?: string
    avatarUrl?: string
  }
}

export interface AuthResponse {
  success?: boolean
  statusCode?: number
  message?: string | string[]
  requireOtp?: boolean
  email?: string
  token?: string
  accessToken?: string
  refreshToken?: string
  user?: AuthUser
  data?: {
    requireOtp?: boolean
    email?: string
    message?: string
    token?: string
    accessToken?: string
    access_token?: string
    refreshToken?: string
    refresh_token?: string
    user?: AuthUser
  }
}

// ─── User Management Types ──────────────────────────────────────────────────

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED'

export type EditableUserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'

export interface UserInvitationSummary {
  id?: string
  status: InvitationStatus
  expiresAt: string
  createdAt?: string
  acceptedAt?: string
}

export interface UserListItem {
  id: string
  name: string
  email: string
  phone?: string
  roleId?: string
  role?: string | { id?: string; name?: string; roleName?: string }
  roleName?: string
  role_name?: string
  status: UserStatus | string
  invitation?: UserInvitationSummary | null
  deletedAt?: string | null
  isEmailVerified?: boolean
  isVerified?: boolean
  createdAt?: string
  updatedAt?: string
  avatar?: string
  avatarUrl?: string
  image?: string
}

export interface UserDetail extends UserListItem {
  [key: string]: unknown
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore?: boolean
}

export interface PaginatedUsersResponse {
  success?: boolean
  message?: string
  data?: {
    users?: UserListItem[]
    data?: UserListItem[]
    meta?: PaginationMeta
    pagination?: PaginationMeta
    total?: number
    page?: number
    limit?: number
  }
  users?: UserListItem[]
  meta?: PaginationMeta
}

export interface UserDetailResponse {
  success?: boolean
  message?: string
  data?: UserDetail | { user?: UserDetail }
  user?: UserDetail
}

export interface UpdateUserStatusPayload {
  status: EditableUserStatus
}

export interface UpdateUserRolePayload {
  roleId: string
}

export interface ApiActionResponse {
  success?: boolean
  message?: string | string[]
  data?: unknown
}

export interface CreateUserPayload {
  name: string
  email: string
  phone?: string
  roleId: string
}

export interface CreateUserResponse {
  success?: boolean
  message?: string
  data?: UserListItem
  user?: UserListItem
}

export interface InvitationDetails {
  valid: boolean
  id?: string
  token?: string
  name: string
  fullName?: string
  email: string
  phone?: string
  role: string
  roleName?: string
  status?: string
  expiresAt: string
  user?: {
    id: string
    name: string
    fullName?: string
    email: string
    phone?: string
    role: string
    roleName?: string
  }
}

export interface InvitationDetailsResponse {
  success?: boolean
  message?: string
  data?: InvitationDetails
  invitation?: InvitationDetails
  valid?: boolean
  id?: string
  token?: string
  name?: string
  fullName?: string
  email?: string
  phone?: string
  role?: string
  roleName?: string
  status?: string
  expiresAt?: string
}

export interface AcceptInvitationPayload {
  token: string
  password: string
}

// ─── Own Profile Types ───────────────────────────────────────────────────────

export interface UpdateOwnProfilePayload {
  name?: string
  phone?: string
}

export interface ChangeOwnPasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface ChangeOwnEmailPayload {
  newEmail: string
}

export interface OwnProfileResponse {
  success?: boolean
  message?: string
  data?: UserDetail | { user?: UserDetail }
  user?: UserDetail
}

// ─── Roles Types ─────────────────────────────────────────────────────────────

export interface RoleItem {
  id: string
  name: string
  roleName?: string
  description?: string
  permissions?: PermissionItem[]
  createdAt?: string
  updatedAt?: string
}

export interface RolesListResponse {
  success?: boolean
  message?: string
  data?: RoleItem[] | { roles?: RoleItem[] }
  roles?: RoleItem[]
}

export interface RoleDetailResponse {
  success?: boolean
  message?: string
  data?: RoleItem | { role?: RoleItem }
  role?: RoleItem
}

export interface CreateRolePayload {
  name: string
  description?: string
}

export interface UpdateRolePayload {
  name?: string
  description?: string
}

export interface UpdateRolePermissionsPayload {
  permissionIds: string[]
  permissions?: string[]
}

export interface RolePermissionsResponse {
  success?: boolean
  message?: string
  data?: PermissionItem[] | { permissions?: PermissionItem[] }
  permissions?: PermissionItem[]
}

// ─── Permissions Types ───────────────────────────────────────────────────────

export interface PermissionItem {
  id: string
  name: string
  description?: string
  module?: string
  action?: string
  resource?: string
  createdAt?: string
}

export interface QueryPermissionDto {
  page?: number
  limit?: number
  search?: string
  module?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PermissionsListResponse {
  success?: boolean
  message?: string
  data?:
    | PermissionItem[]
    | {
        permissions?: PermissionItem[]
        data?: PermissionItem[]
        meta?: PaginationMeta
        pagination?: PaginationMeta
        total?: number
        page?: number
        limit?: number
      }
  permissions?: PermissionItem[]
  meta?: PaginationMeta
}

type QueryValue = string | number | boolean | undefined | null

interface ApiErrorResponse {
  message?: string | string[]
  error?: string
}

export interface RawApiResponse<T = unknown> {
  success?: boolean
  statusCode?: number
  message?: string | string[]
  data?: T
  meta?: PaginationMeta & Record<string, unknown>
  [key: string]: unknown
}

export function getApiMessage(message: string | string[] | undefined, fallback: string): string {
  if (Array.isArray(message)) {
    return message.join(', ')
  }

  return message || fallback
}

class ApiClient {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') {
      return null
    }

    return (
      localStorage.getItem(AUTH_TOKEN_KEY) ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken')
    )
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') {
      return null
    }

    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  private setTokens(accessToken?: string, refreshToken?: string): void {
    if (typeof window === 'undefined') {
      return
    }

    if (accessToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('token', accessToken)
      localStorage.setItem('accessToken', accessToken)

      document.cookie = `rt_auth_token=${encodeURIComponent(accessToken)}; path=/; max-age=86400; SameSite=Lax`
      document.cookie = `access_token=${encodeURIComponent(accessToken)}; path=/; max-age=86400; SameSite=Lax`
    }

    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      localStorage.setItem('rt_auth_refresh_token', refreshToken)
      localStorage.setItem('refresh_token', refreshToken)
    }
  }

  private saveUser(user?: AuthUser): void {
    if (typeof window === 'undefined' || !user) {
      return
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  }

  private buildUrl(endpoint: string, query?: Record<string, QueryValue>): string {
    const base =
      typeof window !== 'undefined'
        ? window.location.origin
        : env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const url = new URL(`${this.baseUrl}${endpoint}`, base)

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value))
        }
      }
    }

    return url.toString()
  }

  private getErrorMessage(data: ApiErrorResponse | null, status: number): string {
    const message = data?.message

    if (Array.isArray(message)) {
      return message.join(', ')
    }

    if (typeof message === 'string') {
      return message
    }

    if (data?.error) {
      return data.error
    }

    if (status >= 500) {
      return `Server temporarily unavailable (status ${status})`
    }

    return `Request failed with status ${status}`
  }

  private handleAccountStatusError(status: number, data: unknown): string | undefined {
    const errRecord = data && typeof data === 'object' ? (data as Record<string, any>) : {}
    const errorCode =
      errRecord.code ||
      errRecord.errorCode ||
      errRecord.error?.code ||
      (typeof errRecord.error === 'string' ? errRecord.error : undefined)

    if (
      (status === 401 || status === 403) &&
      (errorCode === 'ACCOUNT_INACTIVE' ||
        errorCode === 'ACCOUNT_SUSPENDED' ||
        errorCode === 'ACCOUNT_DELETED')
    ) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem('access_token')
        localStorage.removeItem(AUTH_USER_KEY)
        localStorage.removeItem('rt_auth_refresh_token')
        localStorage.removeItem('refresh_token')
        window.dispatchEvent(new Event('auth-change'))
      }
    }

    return errorCode
  }

  /**
   * Parse normal API response.
   *
   * Existing behavior is preserved:
   * { success: true, data: {...} }
   *
   * becomes:
   * {...}
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage = this.getErrorMessage(data as ApiErrorResponse | null, response.status)
      const errorCode = this.handleAccountStatusError(response.status, data)

      throw new ApiError(errorMessage, response.status, data, errorCode)
    }

    if (data && typeof data === 'object' && 'data' in data && data.data !== undefined) {
      return data.data as T
    }

    return data as T
  }

  /**
   * Parse the complete API response without unwrapping `data`.
   *
   * Use this for paginated endpoints where you need:
   * {
   *   data: [...],
   *   meta: {...}
   * }
   */
  private async parseRawResponse<T>(response: Response): Promise<RawApiResponse<T>> {
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage = this.getErrorMessage(data as ApiErrorResponse | null, response.status)
      const errorCode = this.handleAccountStatusError(response.status, data)

      throw new ApiError(errorMessage, response.status, data, errorCode)
    }

    return data as RawApiResponse<T>
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    query?: Record<string, QueryValue>,
    retryCount = 0,
  ): Promise<T> {
    const token = this.getToken()

    const headers = new Headers(options.headers)

    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    }

    if (typeof window === 'undefined' && !fetchOptions.cache) {
      fetchOptions.cache = 'no-store'
    }

    const response = await fetch(this.buildUrl(endpoint, query), fetchOptions)

    if (
      response.status === 401 &&
      retryCount === 0 &&
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/refresh')
    ) {
      const newToken = await refreshAccessToken()

      if (newToken) {
        return this.request<T>(endpoint, options, query, retryCount + 1)
      }
    }

    return this.parseResponse<T>(response)
  }

  private async requestRaw<T>(
    endpoint: string,
    options: RequestInit = {},
    query?: Record<string, QueryValue>,
    retryCount = 0,
  ): Promise<RawApiResponse<T>> {
    const token = this.getToken()

    const headers = new Headers(options.headers)

    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    }

    if (typeof window === 'undefined' && !fetchOptions.cache) {
      fetchOptions.cache = 'no-store'
    }

    const response = await fetch(this.buildUrl(endpoint, query), fetchOptions)

    if (
      response.status === 401 &&
      retryCount === 0 &&
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/refresh')
    ) {
      const newToken = await refreshAccessToken()

      if (newToken) {
        return this.requestRaw<T>(endpoint, options, query, retryCount + 1)
      }
    }

    return this.parseRawResponse<T>(response)
  }

  private async uploadRequest<T>(endpoint: string, formData: FormData, retryCount = 0): Promise<T> {
    const token = this.getToken()

    const headers = new Headers()

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const url = this.buildUrl(endpoint)

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    })

    if (
      response.status === 401 &&
      retryCount === 0 &&
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/refresh')
    ) {
      const newToken = await refreshAccessToken()

      if (newToken) {
        return this.uploadRequest<T>(endpoint, formData, retryCount + 1)
      }
    }

    return this.parseResponse<T>(response)
  }

  async get<T>(endpoint: string, query?: Record<string, QueryValue>): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'GET',
      },
      query,
    )
  }

  /**
   * GET without automatic response unwrapping.
   *
   * Example backend:
   * {
   *   data: [],
   *   meta: {...}
   * }
   */
  async getRaw<T>(
    endpoint: string,
    query?: Record<string, QueryValue>,
  ): Promise<RawApiResponse<T>> {
    return this.requestRaw<T>(
      endpoint,
      {
        method: 'GET',
      },
      query,
    )
  }

  async getBlob(endpoint: string, query?: Record<string, QueryValue>): Promise<Blob> {
    return this.requestBlob(endpoint, query)
  }

  private async requestBlob(
    endpoint: string,
    query?: Record<string, QueryValue>,
    retryCount = 0,
  ): Promise<Blob> {
    const token = this.getToken()

    const headers = new Headers()

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(this.buildUrl(endpoint, query), {
      method: 'GET',
      headers,
      credentials: 'include',
    })

    if (
      response.status === 401 &&
      retryCount === 0 &&
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/refresh')
    ) {
      const newToken = await refreshAccessToken()

      if (newToken) {
        return this.requestBlob(endpoint, query, retryCount + 1)
      }
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null)

      const errorMessage = this.getErrorMessage(data as ApiErrorResponse | null, response.status)

      throw new ApiError(errorMessage, response.status, data)
    }

    return response.blob()
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    })
  }

  async postRaw<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<RawApiResponse<T>> {
    return this.requestRaw<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    })
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    })
  }

  async patchRaw<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<RawApiResponse<T>> {
    return this.requestRaw<T>(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.uploadRequest<T>(endpoint, formData)
  }

  // ─── Authentication ────────────────────────────────────────────────────────

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/login', payload)

    const raw = response as Record<string, any>

    // Check if OTP is required (standard 2-step login)
    const requireOtp = Boolean(raw?.requireOtp || raw?.data?.requireOtp)
    if (requireOtp) {
      return response
    }

    // Direct token issuance fallback (if backend did not require OTP)
    const accessToken =
      raw?.token ||
      raw?.accessToken ||
      raw?.access_token ||
      raw?.data?.token ||
      raw?.data?.accessToken ||
      raw?.data?.access_token

    const refreshToken =
      raw?.refreshToken || raw?.refresh_token || raw?.data?.refreshToken || raw?.data?.refresh_token

    if (accessToken) {
      this.setTokens(accessToken, refreshToken)
    }

    const user =
      raw?.user ||
      raw?.data?.user ||
      (raw?.data && typeof raw.data === 'object' && ('email' in raw.data || 'id' in raw.data)
        ? raw.data
        : undefined) ||
      ('email' in raw || 'id' in raw ? (raw as unknown as AuthUser) : undefined)

    if (user) {
      this.saveUser(user)
    }

    return response
  }

  async verifyLoginOtp(payload: VerifyLoginOtpPayload): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/verify-login-otp', payload)
    const raw = response as Record<string, any>

    const accessToken =
      raw?.token ||
      raw?.accessToken ||
      raw?.access_token ||
      raw?.data?.token ||
      raw?.data?.accessToken ||
      raw?.data?.access_token

    const refreshToken =
      raw?.refreshToken || raw?.refresh_token || raw?.data?.refreshToken || raw?.data?.refresh_token

    if (accessToken) {
      this.setTokens(accessToken, refreshToken)
    }

    const user =
      raw?.user ||
      raw?.data?.user ||
      (raw?.data && typeof raw.data === 'object' && ('email' in raw.data || 'id' in raw.data)
        ? raw.data
        : undefined) ||
      ('email' in raw || 'id' in raw ? (raw as unknown as AuthUser) : undefined)

    if (user) {
      this.saveUser(user)
    }

    return response
  }

  async resendLoginOtp(payload: ResendLoginOtpPayload): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/resend-login-otp', payload)
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/register', payload)
  }

  async forgotPassword(payload: ForgotPasswordPayload): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/forgot-password', payload)
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/reset-password', payload)
  }

  async resendVerification(payload: ResendVerificationPayload): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/resend-verification', payload)
  }

  async verifyEmail(token: string): Promise<AuthResponse> {
    return this.get<AuthResponse>('/auth/verify-email', {
      token,
    })
  }

  async getProfile(): Promise<AuthResponse> {
    return this.get<AuthResponse>('/users/me')
  }

  async refreshToken(refreshTokenParam?: string): Promise<AuthResponse> {
    const refreshToken = refreshTokenParam || this.getRefreshToken()

    if (!refreshToken) {
      throw new Error('Refresh token is required')
    }

    const response = await this.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    })

    const accessToken =
      response.token ||
      response.accessToken ||
      response.data?.token ||
      response.data?.accessToken ||
      response.data?.access_token

    const newRefreshToken = response.refreshToken || response.data?.refreshToken

    this.setTokens(accessToken, newRefreshToken)

    const user = response.user || response.data?.user

    this.saveUser(user)

    return response
  }

  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout', {})
    } catch {
      // Ignore logout errors.
    }

    if (typeof window === 'undefined') {
      return
    }

    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)

    localStorage.removeItem('access_token')
    localStorage.removeItem('token')
    localStorage.removeItem('accessToken')

    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
    })

    window.dispatchEvent(new Event('auth-change'))
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null
  }

  getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') {
      return null
    }

    const value = localStorage.getItem(AUTH_USER_KEY)

    if (!value) {
      return null
    }

    try {
      return JSON.parse(value) as AuthUser
    } catch {
      return null
    }
  }

  // ─── Own Profile (/users/me) ───────────────────────────────────────────────

  async getOwnProfile(): Promise<OwnProfileResponse> {
    return this.get<OwnProfileResponse>('/users/me')
  }

  async updateOwnProfile(payload: UpdateOwnProfilePayload): Promise<OwnProfileResponse> {
    return this.patch<OwnProfileResponse>('/users/me', payload)
  }

  async changeOwnPassword(payload: ChangeOwnPasswordPayload): Promise<ApiActionResponse> {
    return this.patch<ApiActionResponse>('/users/me/password', payload)
  }

  async updateOwnAvatar(formData: FormData): Promise<AvatarUploadResponse> {
    const token = this.getToken()

    const headers = new Headers()

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(this.buildUrl('/users/me/avatar'), {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    })

    const data = await this.parseResponse<AvatarUploadResponse>(response)

    // Synchronize local storage user snapshot with new avatarUrl & avatarKey
    const currentUser = this.getStoredUser()
    if (currentUser && data) {
      const resObj = (data as Record<string, unknown>)?.data || data
      const newAvatarUrl =
        ((resObj as Record<string, unknown>)?.avatarUrl as string) ||
        ((resObj as Record<string, unknown>)?.avatar as string) ||
        ((data as Record<string, unknown>)?.avatarUrl as string) ||
        ((data as Record<string, unknown>)?.avatar as string)

      const newAvatarKey =
        ((resObj as Record<string, unknown>)?.avatarKey as string) ||
        ((data as Record<string, unknown>)?.avatarKey as string)

      if (newAvatarUrl) {
        currentUser.avatarUrl = newAvatarUrl
        currentUser.avatar = newAvatarUrl
        if (newAvatarKey) {
          currentUser.avatarKey = newAvatarKey
        }
        this.saveUser(currentUser)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-change'))
        }
      }
    }

    return data
  }

  async changeOwnEmail(payload: ChangeOwnEmailPayload): Promise<ApiActionResponse> {
    return this.patch<ApiActionResponse>('/users/me/email', payload)
  }

  async confirmEmailChange(token: string): Promise<ApiActionResponse> {
    return this.get<ApiActionResponse>('/users/me/email/confirm', {
      token,
    })
  }

  // ─── User Management (/users) ─────────────────────────────────────────────

  async getUsers(query?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    roleId?: string
  }): Promise<PaginatedUsersResponse> {
    return this.get<PaginatedUsersResponse>('/users', query as Record<string, QueryValue>)
  }

  async getDeletedUsers(query?: {
    page?: number
    limit?: number
    search?: string
    roleId?: string
  }): Promise<PaginatedUsersResponse> {
    return this.get<PaginatedUsersResponse>('/users/deleted', query as Record<string, QueryValue>)
  }

  async getUserById(id: string): Promise<UserDetailResponse> {
    return this.get<UserDetailResponse>(`/users/${id}`)
  }

  async updateUserStatus(id: string, payload: UpdateUserStatusPayload): Promise<ApiActionResponse> {
    return this.patch<ApiActionResponse>(`/users/${id}/status`, payload)
  }

  async updateUserRole(id: string, payload: UpdateUserRolePayload): Promise<ApiActionResponse> {
    return this.patch<ApiActionResponse>(`/users/${id}/role`, payload)
  }

  async deactivateUser(id: string): Promise<ApiActionResponse> {
    return this.patch<ApiActionResponse>(`/users/${id}/deactivate`, {})
  }

  async deleteUser(id: string, permanent: boolean = false): Promise<ApiActionResponse> {
    return this.delete<ApiActionResponse>(`/users/${id}${permanent ? '?permanent=true' : ''}`)
  }

  async createUser(payload: CreateUserPayload): Promise<CreateUserResponse> {
    return this.post<CreateUserResponse>('/users', payload)
  }

  async resendInvitation(userId: string): Promise<ApiActionResponse> {
    return this.post<ApiActionResponse>(`/users/${userId}/invitation/resend`, {})
  }

  async revokeInvitation(userId: string): Promise<ApiActionResponse> {
    return this.post<ApiActionResponse>(`/users/${userId}/invitation/revoke`, {})
  }

  async getInvitationDetails(token: string): Promise<InvitationDetailsResponse> {
    return this.get<InvitationDetailsResponse>(`/auth/invitations/${encodeURIComponent(token)}`)
  }

  async acceptInvitation(payload: AcceptInvitationPayload): Promise<ApiActionResponse> {
    return this.post<ApiActionResponse>('/auth/invitations/accept', payload)
  }

  async restoreUser(id: string): Promise<ApiActionResponse> {
    return this.patch<ApiActionResponse>(`/users/${id}/restore`, {})
  }

  // ─── Roles (/roles) ────────────────────────────────────────────────────────

  async createRole(payload: CreateRolePayload): Promise<RoleDetailResponse> {
    try {
      return await this.post<RoleDetailResponse>('/roles/create-role', payload)
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        return this.post<RoleDetailResponse>('/roles', payload)
      }

      throw err
    }
  }

  async getAllRoles(): Promise<RolesListResponse> {
    try {
      return await this.get<RolesListResponse>('/roles/getAll-roles')
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        return this.get<RolesListResponse>('/roles')
      }

      throw err
    }
  }

  async getRoleById(id: string): Promise<RoleDetailResponse> {
    try {
      return await this.get<RoleDetailResponse>(`/roles/getSingle-role/${id}`)
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        return this.get<RoleDetailResponse>(`/roles/${id}`)
      }

      throw err
    }
  }

  async updateRole(id: string, payload: UpdateRolePayload): Promise<RoleDetailResponse> {
    try {
      return await this.patch<RoleDetailResponse>(`/roles/update-role/${id}`, payload)
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        return this.patch<RoleDetailResponse>(`/roles/${id}`, payload)
      }

      throw err
    }
  }

  async deleteRole(id: string): Promise<ApiActionResponse> {
    try {
      return await this.delete<ApiActionResponse>(`/roles/delete-role/${id}`)
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        return this.delete<ApiActionResponse>(`/roles/${id}`)
      }

      throw err
    }
  }

  async getRolePermissions(roleId: string): Promise<RolePermissionsResponse> {
    try {
      return await this.get<RolePermissionsResponse>(`/roles/${roleId}/permissions`)
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        return this.get<RolePermissionsResponse>(`/roles/getSingle-role/${roleId}/permissions`)
      }

      throw err
    }
  }

  async updateRolePermissions(
    roleId: string,
    payload: UpdateRolePermissionsPayload,
  ): Promise<ApiActionResponse> {
    const token = this.getToken()

    const headers = new Headers({
      'Content-Type': 'application/json',
    })

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(this.buildUrl(`/roles/${roleId}/permissions`), {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    return this.parseResponse<ApiActionResponse>(response)
  }

  // ─── Permissions (/permissions) ────────────────────────────────────────────

  async getAllPermissions(query?: QueryPermissionDto): Promise<PermissionsListResponse> {
    try {
      return await this.get<PermissionsListResponse>(
        '/permissions',
        query as Record<string, QueryValue>,
      )
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        return this.get<PermissionsListResponse>(
          '/roles/permissions',
          query as Record<string, QueryValue>,
        )
      }

      throw err
    }
  }
}

export const api = new ApiClient(BASE_URL)
