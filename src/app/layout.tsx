import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/shared/navbar/Navbar'
import { Footer } from '@/components/shared/footer/Footer'
import ChatHub from '@/components/shared/ChatHub'
import { SITE_CONFIG } from '@/data/site'
import { whatsappUrl, WHATSAPP_MESSAGES } from '@/lib/whatsapp'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),

  title: {
    default: 'Devtrop — Web Development & Digital Solutions',
    template: '%s | Devtrop',
  },
  description:
    'Devtrop is a full-stack web and SaaS engineering studio. We build production-grade web applications, SaaS platforms, and cloud infrastructure for funded startups and ambitious teams.',
  keywords: [
    'full-stack web development',
    'SaaS engineering',
    'web application development',
    'Next.js development',
    'React development',
    'TypeScript development',
    'SaaS MVP',
    'cloud infrastructure',
    'software engineering studio',
    'platform modernization',
    'DevOps',
    'Devtrop',
    'Devtro',
    'Devtr',
    'evtrop',
    'vtrop',
    'trop',
    'dvtrop',
    'dvtrp',
    'dev',
    'devtrop company',
    'devtrop agency',
    'devtrop studio',
    '',
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
  // Next.js surfaces these as <link rel="me"> tags
  // They also feed into JSON-LD structured data below
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
    apple: '/favicon_512.png',
    shortcut: '/favicon.png',
  },

  // Verification placeholders — fill in when you have the codes
  // verification: {
  //   google: 'YOUR_GOOGLE_SITE_VERIFICATION',
  // },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Devtrop',
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/favicon_512.png`,
    description: SITE_CONFIG.description,
    email: SITE_CONFIG.contactEmail,
    sameAs: [
      'https://facebook.com/devtrop',
      'https://instagram.com/devtrop_official',
      'https://linkedin.com/company/devtrop',
    ],
    knowsAbout: [
      'Full-Stack Web Development',
      'SaaS Engineering',
      'Next.js',
      'React',
      'TypeScript',
      'Cloud Infrastructure',
      'DevOps',
    ],
  }

  return (
    <html lang="en" className={`${inter.variable} h-full`} data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-canvas text-body swiss-noise">
        <Navbar />
        <main className="flex-1 flex flex-col w-full">{children}</main>
        <Footer />
        <ChatHub
          whatsappHref={whatsappUrl(WHATSAPP_MESSAGES.default)}
          contactEmail={SITE_CONFIG.contactEmail}
          defaultMessage={WHATSAPP_MESSAGES.default}
        />
      </body>
    </html>
  )
}
