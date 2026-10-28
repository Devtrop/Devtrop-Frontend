'use client'

import { useState } from 'react'
import { ArrowUpRight, CheckCircle2, RotateCcw, Mail, Phone, MapPin, Send } from 'lucide-react'
import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { CONTACT_PAGE_CONTENT, type SocialPlatform } from '@/data/contact'
import { openBooking } from '@/lib/booking'

/**
 * GA4 CTA tracking helper.
 * NOTE: This relies on the existing gtag setup in src/app/layout.tsx.
 * Do not add a second Google Analytics script here.
 */
function trackGA4Event(eventName: string, params?: Record<string, string>) {
  if (typeof window === 'undefined') return

  const gtag = (
    window as Window & {
      gtag?: (command: 'event', eventName: string, params?: Record<string, string>) => void
    }
  ).gtag

  // Optional chaining prevents errors if GA4 has not loaded yet.
  gtag?.('event', eventName, params)
}

function SocialPlatformIcon({
  platform,
  className,
}: {
  platform: SocialPlatform
  className?: string
}) {
  switch (platform) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    case 'x':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
  }
}

export function ContactInquirySection({ email, whatsapp }: { email?: string; whatsapp?: string }) {
  const { headline, subhead } = CONTACT_PAGE_CONTENT.inquiry
  const { cards: directCards } = CONTACT_PAGE_CONTENT.directContact
  const { items: socialItems } = CONTACT_PAGE_CONTENT.social

  // Filter direct contact channels: email, phone/whatsapp, and location/address
  const rawEmailCard = directCards.find((c) => c.label === 'EMAIL')
  const rawPhoneCard = directCards.find((c) => c.label === 'PHONE / WHATSAPP')
  const locationCard = directCards.find((c) => c.label === 'LOCATION')

  // Override with server-injected real values when provided
  const emailCard =
    rawEmailCard && email
      ? { ...rawEmailCard, title: email, href: `mailto:${email}` }
      : rawEmailCard
  const phoneCard =
    rawPhoneCard && whatsapp
      ? { ...rawPhoneCard, title: whatsapp, href: `https://wa.me/${whatsapp}` }
      : rawPhoneCard

  // Form State
  const [fullName, setFullName] = useState('')
  const [workEmail, setWorkEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    id: string
    timestamp: string
  } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // IMPORTANT: This handler currently simulates submission; it does not send
    // the inquiry to an API/email service. Do NOT fire `generate_lead` here yet.
    // Add `generate_lead` only after the real backend confirms successful delivery.

    // Simulate reliable engineering dispatch
    setTimeout(() => {
      const receiptId = `DEV-${Math.floor(100000 + Math.random() * 900000)}`
      const timestamp = new Date().toISOString()
      setSubmissionReceipt({ id: receiptId, timestamp })
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 600)
  }

  const handleReset = () => {
    setIsSubmitted(false)
    setFullName('')
    setWorkEmail('')
    setPhone('')
    setCompany('')
    setMessage('')
    setSubmissionReceipt(null)
  }

  return (
    <section className="relative border-b-4 border-display bg-canvas" id="inquiry">
      <SectionContainer className="py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-13 items-start">
          {/* LEFT COLUMN: Editorial & Direct Channels & Social Links */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <h2 className="text-4xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-display leading-[0.95]">
              {headline}
            </h2>

            <p className="mt-4 text-base text-muted leading-relaxed max-w-lg">{subhead}</p>

            {/* DIRECT CHANNELS — Email, Phone/WhatsApp, Address */}
            <div className="mt-8 border-2 border-display bg-canvas divide-y-2 divide-display shadow-[4px_4px_0_0_var(--color-display)]">
              {/* Email */}
              {/* GA4: track clicks on the contact email link. */}
              {emailCard && (
                <a
                  href={emailCard.href}
                  onClick={() =>
                    trackGA4Event('email_click', {
                      link_location: 'contact_page',
                    })
                  }
                  className="group p-4 sm:p-4.5 flex items-center justify-between hover:bg-display transition-colors duration-150"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 shrink-0 border border-display/30 bg-subtle group-hover:border-accent group-hover:bg-accent flex items-center justify-center transition-colors">
                      <Mail className="h-4 w-4 text-display group-hover:text-inverse" />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-muted group-hover:text-inverse/60">
                        Email
                      </span>
                      <span className="block text-sm sm:text-base font-bold text-display group-hover:text-inverse truncate">
                        {emailCard.title}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-5 shrink-0 text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all ml-2" />
                </a>
              )}

              {/* Phone / WhatsApp */}
              {/* GA4: distinguish WhatsApp links from ordinary phone links. */}
              {phoneCard && (
                <a
                  href={phoneCard.href}
                  onClick={() => {
                    const isWhatsApp = /whatsapp|wa\.me/i.test(phoneCard.href)
                    trackGA4Event(isWhatsApp ? 'whatsapp_click' : 'phone_click', {
                      link_location: 'contact_page',
                    })
                  }}
                  target="_blank"
                  rel="noreferrer"
                  className="group p-4 sm:p-4.5 flex items-center justify-between hover:bg-display transition-colors duration-150"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 shrink-0 border border-display/30 bg-subtle group-hover:border-accent group-hover:bg-accent flex items-center justify-center transition-colors">
                      <Phone className="h-4 w-4 text-display group-hover:text-inverse" />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-muted group-hover:text-inverse/60">
                        Phone / WhatsApp
                      </span>
                      <span className="block text-sm sm:text-base font-bold text-display group-hover:text-inverse">
                        {phoneCard.title}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-5 shrink-0 text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all ml-2" />
                </a>
              )}

              {/* Address / Location */}
              {locationCard && (
                <div className="p-4 sm:p-4.5 flex items-center justify-between">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 shrink-0 border border-display/30 bg-subtle flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-display" />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                        Studio Headquarters
                      </span>
                      <span className="block text-sm sm:text-base font-bold text-display">
                        {locationCard.title}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted border border-display/20 px-2 py-0.5 shrink-0 ml-2">
                    GMT+6
                  </span>
                </div>
              )}
            </div>

            {/* FOLLOW DEVTROP — Dynamic Social Icons */}
            <div className="mt-6 p-4 sm:p-5 border-2 border-display bg-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="block font-mono text-xs font-bold uppercase tracking-wider text-display">
                  Follow Us
                </span>
                {/* <span className="block text-xs text-muted mt-0.5">
                  Public RFCs &amp; engineering notes
                </span> */}
              </div>

              <div className="flex items-center gap-2">
                {socialItems.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Follow Devtrop on ${social.name}`}
                    title={social.name}
                    className="w-10 h-10 border border-display bg-canvas hover:border-accent hover:bg-accent text-display hover:text-inverse flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 shadow-[2px_2px_0_0_var(--color-display)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                  >
                    <SocialPlatformIcon platform={social.platform} className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Response Time SLA & Fast Track Calendar */}
            {/* <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-muted pt-4 border-t border-display/20">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-accent" /> Response within 1 business day
              </span>
              <button
                type="button"
                onClick={() => openBooking()}
                className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-accent hover:text-display transition-colors cursor-pointer text-left sm:text-right"
              >
                <span>Schedule A Call</span>
                <MoveUpRight className="h-3 w-3 shrink-0" />
              </button>
            </div> */}
          </div>

          {/* RIGHT COLUMN: Send Email Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="border-2 border-display bg-white p-6 sm:p-10 shadow-[8px_8px_0_0_var(--color-display)]">
              {isSubmitted && submissionReceipt ? (
                /* Success Receipt Terminal */
                <div className="py-6 select-text" role="status" aria-live="polite">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold uppercase tracking-wider mb-6">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Inquiry Dispatched Successfully
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-display">
                    Thank you, {fullName || 'there'}.
                  </h3>
                  <p className="mt-3 text-sm text-muted leading-relaxed">
                    Our engineering team will review your requirements and respond within 1 business
                    day at <span className="font-bold text-display">{workEmail}</span>.
                  </p>

                  {/* Technical Receipt Frame */}
                  <div className="mt-8 border border-display bg-subtle p-5 font-mono text-xs space-y-2">
                    <div className="flex justify-between border-b border-display/20 pb-2">
                      <span className="text-muted">TRANSACTION ID:</span>
                      <span className="font-bold text-display">{submissionReceipt.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-display/20 pb-2">
                      <span className="text-muted">TIMESTAMP:</span>
                      <span className="text-display">{submissionReceipt.timestamp}</span>
                    </div>
                    <div className="flex justify-between border-b border-display/20 pb-2">
                      <span className="text-muted">CHANNEL:</span>
                      <span className="font-bold text-accent">Direct Engineering Inquiry</span>
                    </div>
                    {company && (
                      <div className="flex justify-between border-b border-display/20 pb-2">
                        <span className="text-muted">ORGANIZATION:</span>
                        <span className="text-display">{company}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted">NEXT STEP:</span>
                      <span className="text-display">Architecture evaluation &amp; response</span>
                    </div>
                  </div>

                  {/* Next Actions */}
                  <div className="mt-8 flex flex-wrap gap-4">
                    {/* GA4: track the Book a Call CTA before opening the booking flow. */}
                    <button
                      type="button"
                      onClick={() => {
                        trackGA4Event('book_call_click', {
                          link_location: 'contact_success_state',
                        })
                        openBooking()
                      }}
                      className="inline-flex items-center justify-center bg-accent px-6 py-3 text-xs font-bold uppercase tracking-wider text-inverse hover:bg-accent-hover transition-colors duration-150 cursor-pointer"
                    >
                      Book Accompanying Call →
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 border border-display px-5 py-3 text-xs font-bold uppercase tracking-wider text-display hover:bg-display hover:text-inverse transition-colors duration-150 cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                /* Primary Contact Form (No PROJECT TYPE) */
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Row 1: Full Name & Work Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block font-mono text-xs font-bold uppercase tracking-wider text-display mb-2"
                      >
                        FULL NAME <span className="text-accent">*</span>
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alex Sterling"
                        className="w-full rounded-none border border-display bg-white px-4 py-3 text-sm text-display placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors duration-150"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="workEmail"
                        className="block font-mono text-xs font-bold uppercase tracking-wider text-display mb-2"
                      >
                        WORK EMAIL <span className="text-accent">*</span>
                      </label>
                      <input
                        id="workEmail"
                        type="email"
                        required
                        value={workEmail}
                        onChange={(e) => setWorkEmail(e.target.value)}
                        placeholder="alex@company.com"
                        className="w-full rounded-none border border-display bg-white px-4 py-3 text-sm text-display placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors duration-150"
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone & Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block font-mono text-xs font-bold uppercase tracking-wider text-display mb-2"
                      >
                        PHONE <span className="text-muted font-normal">(Optional)</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full rounded-none border border-display bg-white px-4 py-3 text-sm text-display placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors duration-150"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="company"
                        className="block font-mono text-xs font-bold uppercase tracking-wider text-display mb-2"
                      >
                        COMPANY <span className="text-muted font-normal">(Optional)</span>
                      </label>
                      <input
                        id="company"
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Corp / Stealth"
                        className="w-full rounded-none border border-display bg-white px-4 py-3 text-sm text-display placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors duration-150"
                      />
                    </div>
                  </div>

                  {/* MESSAGE Textarea */}
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <label
                        htmlFor="message"
                        className="block font-mono text-xs font-bold uppercase tracking-wider text-display"
                      >
                        MESSAGE <span className="text-accent">*</span>
                      </label>
                      <span className="font-mono text-[10px] text-muted">
                        Max measure: ~1000 characters
                      </span>
                    </div>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your product goals, target timeline, key technical challenges, or platform modernization needs..."
                      className="w-full rounded-none border border-display bg-white p-4 text-sm text-display placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors duration-150 resize-y"
                    />
                  </div>

                  {/* Submission CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent px-8 py-4 text-xs sm:text-sm font-black uppercase tracking-wider text-inverse hover:bg-accent-hover transition-all duration-150 cursor-pointer disabled:opacity-60 active:scale-95 active:translate-y-0.5"
                    >
                      {isSubmitting ? 'DISPATCHING...' : 'SEND INQUIRY'}
                      {!isSubmitting && <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  )
}
