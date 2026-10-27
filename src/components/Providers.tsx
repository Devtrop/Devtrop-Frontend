'use client'

import React from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { PermissionProvider } from '@/contexts/PermissionContext'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {/*
         * PermissionProvider must be nested inside AuthProvider so it can
         * access useAuth() to get the current user's token and role.
         */}
        <PermissionProvider>
          <SmoothScrollProvider>
            {children}
            <Toaster richColors position="top-right" theme="dark" closeButton />
          </SmoothScrollProvider>
        </PermissionProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
