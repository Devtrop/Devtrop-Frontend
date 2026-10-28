'use client'

import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
    this.setState({ errorInfo })

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    this.props.onReset?.()
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-lg w-full border-destructive/20">
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-destructive/10 p-4">
                  <AlertTriangle className="size-8 text-destructive" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
                <p className="text-sm text-muted-foreground">
                  {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <p className="text-xs font-mono text-destructive mb-2">
                      {this.state.error?.stack}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {this.state.errorInfo.componentStack}
                    </p>
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button onClick={this.handleReset} className="flex-1 gap-2" variant="default">
                  <RefreshCcw className="size-4" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} className="flex-1 gap-2" variant="outline">
                  <RefreshCcw className="size-4" />
                  Reload Page
                </Button>
                <Button onClick={this.handleGoHome} className="flex-1 gap-2" variant="outline">
                  <Home className="size-4" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Dashboard-specific error fallback
 */
export function DashboardErrorFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full border-destructive/20">
        <CardContent className="p-6 text-center space-y-4">
          <AlertTriangle className="size-10 text-destructive mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Dashboard Error</h3>
            <p className="text-sm text-muted-foreground">
              This section encountered an error. Please refresh the page or contact support if the
              problem persists.
            </p>
          </div>
          <Button onClick={() => window.location.reload()} className="w-full">
            Refresh Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Compact error fallback for smaller sections
 */
export function CompactErrorFallback({ error }: { error?: Error }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-2">
        <AlertTriangle className="size-6 text-destructive mx-auto" />
        <p className="text-sm text-muted-foreground">
          {error?.message || 'Failed to load this section'}
        </p>
        <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    </div>
  )
}
