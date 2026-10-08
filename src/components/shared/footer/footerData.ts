export interface FooterLink {
  label: string
  href: string
  isExternal?: boolean
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Services',
    links: [
      { label: 'Web App Architecture', href: '/#services' },
      { label: '0-to-1 SaaS MVP', href: '/#services' },
      { label: 'Platform Modernization', href: '/#services' },
      { label: 'Performance & Scale', href: '/#services' },
    ],
  },
  {
    title: 'Selected Work',
    links: [
      { label: 'Uparzo: E-Commerce SaaS', href: 'https://uparzo.com', isExternal: true },
      {
        label: 'Feletrip: Booking Marketplace',
        href: 'https://www.feletrip.com',
        isExternal: true,
      },
      { label: 'Architecture RFCs', href: '/#architecture' },
    ],
  },
  {
    title: 'Delivery Process',
    links: [
      { label: 'Architecture Discovery', href: '/services#process' },
      { label: '14-Day Sprint Cadence', href: '/services#process' },
      { label: 'CI/CD & Reliability', href: '/services#process' },
      { label: '100% IP Transfer', href: '/services#process' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { label: 'Working Agreement', href: '/#engagement' },
      { label: 'Honesty Standard', href: '/#architecture' },
      { label: 'Founder Discovery Call', href: '/#contact' },
      { label: 'Direct Email', href: 'mailto:info.devtrop@gmail.com' },
    ],
  },
]

export const FOOTER_AVAILABILITY = {
  label: 'Booking Q4 2026 starts',
}

export interface SocialLink {
  label: string
  href: string
  platform: 'facebook' | 'instagram' | 'linkedin'
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/devtrop',
    platform: 'facebook',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/devtrop_official',
    platform: 'instagram',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/devtrop',
    platform: 'linkedin',
  },
]
