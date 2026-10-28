import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Navbar } from '@/components/shared/navbar/Navbar'
import { Footer } from '@/components/shared/footer/Footer'
import ChatHub from '@/components/shared/ChatHub'
import { SITE_CONFIG } from '@/data/site'
import { whatsappUrl, WHATSAPP_MESSAGES } from '@/lib/whatsapp'
import { Providers } from '@/components/Providers'
import { LayoutContent } from '@/components/layouts/LayoutContent'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),

  title: {
    default: 'Devtrop — Full-Stack Web & SaaS Engineering Studio',
    template: '%s | Devtrop',
  },
  description:
    'Devtrop is a full-stack web and SaaS engineering studio based in Bangladesh. We build production-grade web applications, SaaS platforms, multi-tenant systems, and cloud infrastructure for funded startups and ambitious teams.',
  keywords: [
    // Brand
    'Devtrop',
    'devtrop.com',
    'Devtrop studio',
    'Devtrop agency',
    'Devtrop engineering',
    // Services — intent-based
    'full-stack web development',
    'SaaS MVP development',
    'web application development',
    'SaaS platform engineering',
    'multi-tenant SaaS development',
    'custom software development',
    'software engineering studio',
    'web development agency Bangladesh',
    'hire full-stack engineers',
    // Tech stack
    'Next.js development agency',
    'React development studio',
    'TypeScript engineers for hire',
    'Node.js backend development',
    'PostgreSQL Prisma developers',
    // Deliverables
    'cloud infrastructure DevOps',
    'platform modernization',
    'application modernization',
    'production-grade web apps',
    '14-day sprint web development',
    '0 to 1 SaaS build',
    'code audit service',
    'dedicated engineering squad',
    'software engineering retainer',
  ],

  authors: [{ name: 'Devtrop', url: SITE_CONFIG.url }],
  creator: 'Devtrop',
  publisher: 'Devtrop',

  // Canonical & alternate
  alternates: {
    canonical: SITE_CONFIG.url,
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_CONFIG.url,
    siteName: 'Devtrop',
    title: 'Devtrop — Full-Stack Web & SaaS Engineering Studio',
    description:
      'Production-grade web applications and SaaS platforms engineered with uncompromising craftsmanship. Partner with Devtrop to ship your product.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Devtrop — Full-Stack Web & SaaS Engineering Studio',
      },
    ],
  },

  // Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'Devtrop — Full-Stack Web & SaaS Engineering Studio',
    description:
      'Production-grade web applications and SaaS platforms engineered with uncompromising craftsmanship.',
    images: ['/og-default.png'],
  },

  // Social profile links (sameAs equivalent for Google Knowledge Graph)
  other: {
    'profile:facebook': 'https://facebook.com/devtrop',
    'profile:instagram': 'https://instagram.com/devtrop_official',
    'profile:linkedin': 'https://linkedin.com/company/devtrop',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },

  // Google Search Console verification
  verification: {
    google: 'd65b4bea928b6194',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService'],
    '@id': `${SITE_CONFIG.url}/#organization`,
    name: 'Devtrop',
    url: SITE_CONFIG.url,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.url}/favicon.png`,
      width: 512,
      height: 512,
    },
    description: SITE_CONFIG.description,
    email: SITE_CONFIG.contactEmail,
    sameAs: [
      'https://facebook.com/devtrop',
      'https://instagram.com/devtrop_official',
      'https://linkedin.com/company/devtrop',
    ],
    areaServed: [
      { '@type': 'Country', name: 'Bangladesh' },
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'United Kingdom' },
      { '@type': 'AdministrativeArea', name: 'Worldwide' },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: SITE_CONFIG.contactEmail,
      availableLanguage: ['English'],
    },
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Full-Stack Web & SaaS Development',
          description:
            'End-to-end engineering for web applications and SaaS platforms including MVP builds, multi-tenant systems, cloud infrastructure, and DevOps.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Platform Modernization & Code Audit',
          description:
            'Architecture review, performance audits, and systematic modernization of legacy web stacks.',
        },
      },
    ],
    knowsAbout: [
      'Full-Stack Web Development',
      'SaaS Engineering',
      'Multi-Tenant Architecture',
      'Next.js',
      'React',
      'TypeScript',
      'Node.js',
      'PostgreSQL',
      'Cloud Infrastructure',
      'DevOps',
    ],
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.url}/#website`,
    url: SITE_CONFIG.url,
    name: 'Devtrop',
    description: SITE_CONFIG.description,
    publisher: { '@id': `${SITE_CONFIG.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/work?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="en" className={`${inter.variable} h-full`} data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-canvas text-body swiss-noise">
        <Providers>
          <LayoutContent>{children}</LayoutContent>
        </Providers>

        {/* Google Analytics — loaded after page is interactive, zero LCP impact */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K3MJP3307F"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-K3MJP3307F');
          `}
        </Script>
      </body>
    </html>
  )
}
