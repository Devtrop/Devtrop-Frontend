import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowUpRight } from 'lucide-react'
import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { FOOTER_COLUMNS, SOCIAL_LINKS } from './footerData'
import { env } from '@/lib/env'

export function Footer() {
  const gmail = env.GMAIL_INFO

  return (
    <footer className="w-full bg-canvas border-t-2 border-display">
      <SectionContainer className="pt-16 lg:pt-20 pb-6 lg:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col items-start">
            {/* Image Logo */}
            <Link
              href="/"
              className="group flex items-center select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Devtrop Studio Home"
            >
              <Image
                src="/devtrop_logo_transparent_bg_resized.png"
                alt="Devtrop Logo"
                width={220}
                height={48}
                className="w-auto h-7 md:h-8 hover:opacity-90 transition-opacity duration-150"
              />
            </Link>

            {/* Mission */}
            <p className="mt-4 text-sm text-muted leading-relaxed max-w-sm">
              Full-stack web &amp; SaaS engineering studio. Production-grade platforms with
              uncompromising craftsmanship for ambitious teams.
            </p>

            {/* Contact */}
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={`mailto:${gmail}`}
                className="inline-flex items-center gap-2 text-sm text-display font-medium hover:text-accent transition-colors duration-150"
              >
                <Mail className="h-4 w-4" />
                <span>{gmail}</span>
              </Link>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.platform}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                >
                  <Image
                    src={`/icons/${social.platform}.svg`}
                    alt={social.label}
                    width={20}
                    height={20}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-display mb-4 pb-2 border-b-2 border-display">
                  {col.title}
                </h3>
                <ul className="flex flex-col space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent transition-colors duration-150"
                        >
                          {link.label}
                          <ArrowUpRight className="h-3 w-3 opacity-60" />
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-muted hover:text-accent transition-colors duration-150"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Legal bar */}
        <div className="mt-14 pt-6 border-t-2 border-display flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted font-medium tracking-wider">
            &copy; {new Date().getFullYear()} devtrop
          </p>

          <div className="flex items-center gap-6 text-xs font-medium text-muted">
            <Link href="/privacy" className="hover:text-accent transition-colors duration-150">
              Privacy Policy
            </Link>
            <span className="text-display/20 select-none">•</span>
            <Link href="/terms" className="hover:text-accent transition-colors duration-150">
              Terms of Service
            </Link>
          </div>
        </div>
      </SectionContainer>
    </footer>
  )
}

export default Footer
