'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'
import { loginSchema, verifyLoginOtpSchema } from '@/lib/validations'
import { LOGIN_PAGE_CONTENT } from '@/data/auth'
import { SITE_CONFIG } from '@/data/site'
import { cn } from '@/lib/utils'
import { OtpInput } from './OtpInput'

type LoginStep = 'credentials' | 'otp'

const { form } = LOGIN_PAGE_CONTENT
const EMPTY_OTP = Array.from({ length: 6 }, () => '')
const DEFAULT_DESTINATION = '/dashboard'

function resolveDestination(redirect: string | null): string {
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) return redirect
  return DEFAULT_DESTINATION
}

function resolveErrorMessage(error: unknown, fallback: string): string {
  const code = error instanceof ApiError ? error.code : undefined

  if (code === 'ACCOUNT_INACTIVE') return form.errors.accountInactive
  if (code === 'ACCOUNT_SUSPENDED') return form.errors.accountSuspended
  if (code === 'ACCOUNT_DELETED') return form.errors.accountDeleted

  if (error instanceof Error && error.message) return error.message
  return fallback
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  if (local.length <= 2) return `${local[0] ?? ''}***@${domain}`
  return `${local[0]}***${local[local.length - 1]}@${domain}`
}

/** Field chrome shared by both credential inputs. */
function FieldFrame({ icon: Icon, children }: { icon: typeof Mail; children: React.ReactNode }) {
  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      {children}
    </div>
  )
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const destination = resolveDestination(searchParams.get('redirect'))

  const { isAuthenticated, isLoading, login, verifyLoginOtp, resendLoginOtp } = useAuth()

  const [step, setStep] = useState<LoginStep>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState<string[]>(EMPTY_OTP)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null)

  const copy = step === 'credentials' ? form.credentials : form.otp
  const otpCode = otp.join('')

  // Countdown between verification-code resends.
  useEffect(() => {
    if (step !== 'otp' || resendCooldown <= 0) return
    const timer = window.setTimeout(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1))
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [step, resendCooldown])

  // An existing session should never see the sign-in form again.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(destination)
      router.refresh()
    }
  }, [isLoading, isAuthenticated, router, destination])

  const handleCredentialsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setNoticeMessage(null)

    const parsed = loginSchema.safeParse({ email: email.trim(), password })
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? form.errors.credentials)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await login(parsed.data)
      const raw = response as Record<string, unknown>
      const payload = raw.data as Record<string, unknown> | undefined
      const message = typeof raw.message === 'string' ? raw.message : undefined

      const requiresOtp = Boolean(
        raw.requireOtp ||
          payload?.requireOtp ||
          (message ? message.toLowerCase().includes('otp') : false),
      )

      if (requiresOtp) {
        setStep('otp')
        setOtp(EMPTY_OTP)
        setResendCooldown(60)
        setNoticeMessage(message ?? form.notices.otpSent)
        return
      }

      setNoticeMessage(form.notices.signedIn)
      router.replace(destination)
      router.refresh()
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error, form.errors.credentials))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setNoticeMessage(null)

    const parsed = verifyLoginOtpSchema.safeParse({ email: email.trim(), otp: otpCode })
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? form.errors.otp)
      return
    }

    setIsSubmitting(true)
    try {
      await verifyLoginOtp(parsed.data)
      setNoticeMessage(form.notices.signedIn)
      router.replace(destination)
      router.refresh()
    } catch (error) {
      setOtp(EMPTY_OTP)
      setErrorMessage(resolveErrorMessage(error, form.errors.otp))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return

    setErrorMessage(null)
    setNoticeMessage(null)
    setIsResending(true)
    try {
      const response = await resendLoginOtp({ email: email.trim() })
      setOtp(EMPTY_OTP)
      setResendCooldown(60)
      setNoticeMessage(
        typeof response?.message === 'string' ? response.message : form.notices.resent,
      )
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error, form.errors.generic))
    } finally {
      setIsResending(false)
    }
  }

  const returnToCredentials = () => {
    setStep('credentials')
    setOtp(EMPTY_OTP)
    setErrorMessage(null)
    setNoticeMessage(null)
    setResendCooldown(0)
    setShowPassword(false)
  }

  return (
    <div className="w-full">
      {/* Step progress — two segments, accent marks the active second factor */}
      <div className="flex gap-1" aria-hidden="true">
        <span className="h-1 flex-1 bg-display" />
        <span
          className={cn('h-1 flex-1 transition-colors duration-200', step === 'otp' ? 'bg-accent' : 'bg-display/15')}
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
          {copy.step}
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-display">
          <span className="h-1.5 w-1.5 bg-accent motion-safe:animate-pulse" aria-hidden="true" />
          {copy.status}
        </span>
      </div>

      <h2 className="mt-4 text-3xl font-black uppercase leading-[1.05] tracking-tight text-display sm:text-4xl">
        {copy.title}
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        {step === 'credentials' ? (
          copy.subtitle
        ) : (
          <>
            {copy.subtitle}{' '}
            <span className="font-mono text-xs font-bold text-display">{maskEmail(email)}</span>
          </>
        )}
      </p>

      {/* Feedback */}
      <div aria-live="polite" className="mt-6 space-y-3">
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-3 border-l-4 border-accent bg-accent-soft px-4 py-3"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <p className="text-xs font-medium leading-relaxed text-display">{errorMessage}</p>
          </div>
        )}
        {noticeMessage && (
          <div
            role="status"
            className="flex items-start gap-3 border-l-4 border-display bg-subtle px-4 py-3"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-display" aria-hidden="true" />
            <p className="text-xs font-medium leading-relaxed text-display">{noticeMessage}</p>
          </div>
        )}
      </div>

      {step === 'credentials' ? (
        <form onSubmit={handleCredentialsSubmit} className="mt-6 space-y-5" noValidate>
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-display"
            >
              {form.credentials.emailLabel} <span className="text-accent">*</span>
            </label>
            <FieldFrame icon={Mail}>
              <input
                id="login-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={form.credentials.emailPlaceholder}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
                required
                aria-invalid={Boolean(errorMessage) || undefined}
                className="w-full border-2 border-display bg-canvas py-3 pl-11 pr-4 text-sm text-display placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </FieldFrame>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-display"
            >
              {form.credentials.passwordLabel} <span className="text-accent">*</span>
            </label>
            <FieldFrame icon={Lock}>
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={form.credentials.passwordPlaceholder}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
                required
                aria-invalid={Boolean(errorMessage) || undefined}
                className="w-full border-2 border-display bg-canvas py-3 pl-11 pr-12 text-sm text-display placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={
                  showPassword ? form.credentials.hidePassword : form.credentials.showPassword
                }
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-muted transition-colors duration-150 hover:text-display focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </FieldFrame>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group inline-flex w-full items-center justify-between bg-accent px-6 py-4 text-sm font-black uppercase tracking-wider text-inverse transition-colors duration-150 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-display focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
          >
            <span className="inline-flex items-center gap-3">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {isSubmitting ? form.credentials.submitting : form.credentials.submit}
            </span>
            {!isSubmitting && (
              <ArrowRight
                className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
                aria-hidden="true"
              />
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="mt-6 space-y-5" noValidate>
          <OtpInput
            value={otp}
            onChange={setOtp}
            label={form.otp.otpLabel}
            disabled={isSubmitting}
            hasError={Boolean(errorMessage)}
          />

          <p className="text-xs leading-relaxed text-muted">{form.otp.note}</p>

          <button
            type="submit"
            disabled={isSubmitting || otpCode.length !== 6}
            className="group inline-flex w-full items-center justify-between bg-accent px-6 py-4 text-sm font-black uppercase tracking-wider text-inverse transition-colors duration-150 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-display focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
          >
            <span className="inline-flex items-center gap-3">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {isSubmitting ? form.otp.submitting : form.otp.submit}
            </span>
            {!isSubmitting && (
              <ArrowRight
                className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
                aria-hidden="true"
              />
            )}
          </button>

          <div className="flex flex-col items-start gap-3 border-t border-display/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={returnToCredentials}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted transition-colors duration-150 hover:text-display focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {form.otp.back}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
              className={cn(
                'inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                resendCooldown > 0 || isResending
                  ? 'cursor-not-allowed text-muted/60'
                  : 'text-accent hover:text-accent-hover',
              )}
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  {form.otp.resending}
                </>
              ) : resendCooldown > 0 ? (
                `${form.otp.resendIn} ${resendCooldown}s`
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  {form.otp.resend}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Security + support footer */}
      <div className="mt-8 space-y-3 border-t border-display/15 pt-5">
        <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-display" aria-hidden="true" />
          {form.securityNote}
        </p>
        <p className="text-xs text-muted">
          {form.trouble.label}{' '}
          <a
            href={`mailto:${SITE_CONFIG.contactEmail}?subject=Console%20Access%20Request`}
            className="font-bold text-display underline decoration-accent decoration-2 underline-offset-4 transition-colors duration-150 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {form.trouble.cta}
          </a>
        </p>
      </div>
    </div>
  )
}
