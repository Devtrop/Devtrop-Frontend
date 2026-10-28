'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { PageShell } from '@/components/shared/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { verifyApplication, resendVerificationOtp } from '@/lib/applications'
import { toast } from 'sonner'

export default function VerifyApplicationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [applicationId, setApplicationId] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [verified, setVerified] = useState(false)
  const [applicationCode, setApplicationCode] = useState('')

  useEffect(() => {
    const appId = searchParams.get('applicationId') || ''
    const emailParam = searchParams.get('email') || ''
    
    setApplicationId(appId)
    setEmail(emailParam)

    if (!appId || !emailParam) {
      toast.error('Invalid verification link')
    }
  }, [searchParams])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setVerifying(true)

    try {
      const response = await verifyApplication({
        applicationId,
        email,
        otp,
      })

      setVerified(true)
      setApplicationCode(response.applicationCode || '')
      toast.success('Application verified successfully!')
      
      // Redirect to careers page after 3 seconds
      setTimeout(() => {
        router.push('/careers')
      }, 3000)
    } catch (error: any) {
      console.error('Verification error:', error)
      toast.error(error?.message || 'Invalid OTP. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    setResending(true)

    try {
      await resendVerificationOtp({
        applicationId,
        email,
      })

      toast.success('Verification code resent to your email')
    } catch (error: any) {
      console.error('Resend error:', error)
      toast.error(error?.message || 'Failed to resend code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  if (verified) {
    return (
      <PageShell>
        <section className="relative border-b-4 border-display min-h-[60vh]">
          <div className="absolute inset-0 swiss-grid-pattern opacity-30 pointer-events-none" />

          <SectionContainer className="relative z-10 py-20 lg:py-28">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-accent rounded-full mb-6">
                <CheckCircle2 className="size-10 text-inverse" />
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-display leading-tight mb-4">
                Application Verified!
              </h1>

              <p className="text-lg text-body mb-2">
                Your job application has been successfully verified and submitted.
              </p>

              {applicationCode && (
                <p className="text-sm text-muted mb-8">
                  Application Code: <span className="font-bold text-display">{applicationCode}</span>
                </p>
              )}

              <div className="bg-accent-soft border-2 border-display p-6 mb-8">
                <p className="text-sm text-body leading-relaxed">
                  <Mail className="inline-block size-4 mr-2" />
                  A confirmation email has been sent to <strong>{email}</strong> with your application details.
                </p>
              </div>

              <p className="text-sm text-muted mb-6">
                Redirecting to careers page in a moment...
              </p>

              <Link
                href="/careers"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-display bg-accent text-inverse font-bold uppercase tracking-wider hover:bg-accent-dark transition-colors"
              >
                <ArrowLeft className="size-4" />
                Back to Careers
              </Link>
            </div>
          </SectionContainer>
        </section>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <section className="relative border-b-4 border-display min-h-[60vh]">
        <div className="absolute inset-0 swiss-grid-pattern opacity-30 pointer-events-none" />

        <SectionContainer className="relative z-10 py-12 lg:py-20">
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-display hover:text-accent transition-colors mb-8"
          >
            <ArrowLeft className="size-4" />
            Back to Careers
          </Link>

          <div className="max-w-xl mx-auto">
            <div className="border-2 border-display bg-canvas p-8">
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-display mb-4">
                Verify Your Application
              </h1>

              <p className="text-sm text-muted mb-6">
                We've sent a 6-digit verification code to <strong className="text-body">{email}</strong>.
                Please enter the code below to complete your application.
              </p>

              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-body mb-2">
                    Verification Code *
                  </label>
                  <Input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="border-2 border-display focus:ring-accent text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    disabled={verifying}
                  />
                  <p className="mt-2 text-xs text-muted">
                    Enter the 6-digit code from your email
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={verifying || otp.length !== 6}
                  className="w-full gap-2 h-11 text-sm font-bold uppercase tracking-wider"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Application
                      <CheckCircle2 className="size-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t-2 border-display">
                <p className="text-xs text-muted text-center mb-3">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full text-sm font-bold uppercase tracking-wider text-display hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? 'Resending...' : 'Resend Verification Code'}
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-accent-soft border-2 border-display">
              <p className="text-xs text-muted leading-relaxed">
                <strong className="text-body">Note:</strong> The verification code will expire in 15 minutes.
                Please check your spam folder if you don't see the email in your inbox.
              </p>
            </div>
          </div>
        </SectionContainer>
      </section>
    </PageShell>
  )
}
