'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react'
import { UserRole, normalizeRole, extractUserRole } from '@/config/roles.config'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardSidebarContextType {
  isPinned: boolean
  isHovered: boolean
  isExpanded: boolean
  isMobileOpen: boolean
  isMounted: boolean
  activeRole: UserRole
  togglePin: () => void
  setPinned: (pinned: boolean) => void
  setIsHovered: (hovered: boolean) => void
  setMobileOpen: (open: boolean) => void
  toggleMobile: () => void
  /**
   * Dispatches a global permission-change event to force PermissionContext
   * to re-fetch permissions. Call this after any role-mutation operation
   * (e.g. updateUserRole, updateRolePermissions).
   */
  triggerPermissionRefresh: () => void
}

const DashboardSidebarContext = createContext<DashboardSidebarContextType | undefined>(undefined)

const PINNED_STORAGE_KEY = 'rt_dashboard_sidebar_pinned'

function subscribeToPinned(callback: () => void): () => void {
  window.addEventListener('dashboard-sidebar-pinned-change', callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener('dashboard-sidebar-pinned-change', callback)
    window.removeEventListener('storage', callback)
  }
}

function getPinnedSnapshot(): boolean {
  try {
    return localStorage.getItem(PINNED_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function getPinnedServerSnapshot(): boolean {
  return false
}

export function DashboardSidebarProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  const isPinned = useSyncExternalStore(
    subscribeToPinned,
    getPinnedSnapshot,
    getPinnedServerSnapshot,
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [isMobileOpen, setMobileOpen] = useState<boolean>(false)

  const setPinned = useCallback((pinned: boolean) => {
    try {
      localStorage.setItem(PINNED_STORAGE_KEY, String(pinned))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('dashboard-sidebar-pinned-change'))
      }
    } catch {
      // ignore
    }
  }, [])

  const togglePin = useCallback(() => {
    try {
      const current = getPinnedSnapshot()
      localStorage.setItem(PINNED_STORAGE_KEY, String(!current))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('dashboard-sidebar-pinned-change'))
      }
    } catch {
      // ignore
    }
  }, [])

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev)
  }, [])

  /**
   * Triggers a full permission re-fetch by dispatching the permission-change event.
   * PermissionContext listens for this and will re-fetch /permissions and role permissions.
   */
  const triggerPermissionRefresh = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('permission-change'))
    }
  }, [])

  // Dynamic user role evaluated directly from backend credentials/session
  const activeRole: UserRole = useMemo(() => {
    const backendRole = extractUserRole(user)
    return normalizeRole(backendRole)
  }, [user])

  // Expanded state: pinned OR hovered (only after mount for correct SSR)
  const isExpanded = mounted ? isPinned || isHovered : false

  return (
    <DashboardSidebarContext.Provider
      value={{
        isPinned,
        isHovered,
        isExpanded,
        isMobileOpen,
        isMounted: mounted,
        activeRole,
        togglePin,
        setPinned,
        setIsHovered,
        setMobileOpen,
        toggleMobile,
        triggerPermissionRefresh,
      }}
    >
      {children}
    </DashboardSidebarContext.Provider>
  )
}

export function useDashboardSidebar() {
  const context = useContext(DashboardSidebarContext)
  if (!context) {
    throw new Error('useDashboardSidebar must be used within a DashboardSidebarProvider')
  }
  return context
}
