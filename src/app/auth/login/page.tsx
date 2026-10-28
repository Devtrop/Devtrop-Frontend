import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { LoginShell } from '@/components/auth/LoginShell'
import { SITE_CONFIG } from '@/data/site'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Secure sign-in to the Devtrop client console.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/auth/login`,
  },
}

/**
 * Loading shape for the client form island. Fixed height avoids any layout
 * shift when the Suspense boundary resolves after prerendering.
 */
function LoginFormFallback() {
  return (
    <div className="w-full min-h-[30rem] animate-pulse" aria-hidden="true">
      <div className="h-1 w-full bg-display/15" />
      <div className="mt-5 flex items-center justify-between">
        <div className="h-2 w-24 bg-display/15" />
        <div className="h-2 w-32 bg-display/15" />
      </div>
      <div className="mt-5 h-9 w-52 bg-display/15" />
      <div className="mt-4 h-3 w-full max-w-sm bg-display/10" />
      <div className="mt-8 space-y-5">
        <div className="h-12 w-full border-2 border-display/15" />
        <div className="h-12 w-full border-2 border-display/15" />
        <div className="h-14 w-full bg-display/15" />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <LoginShell>
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </LoginShell>
  )
}
