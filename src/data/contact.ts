/**
 * src/data/contact.ts
 *
 * Decoupled content layer for the Devtrop Contact Us page.
 * Strictly adheres to Devtrop's Swiss-international typographic style,
 * editorial engineering voice, and honesty standard.
 */
export interface ContactMetadataPill {
  label: string
  value: string
  detail?: string
}

export interface DirectContactCard {
  label: string
  title: string
  href: string
  isExternal?: boolean
  detail?: string
}

export type SocialPlatform = 'facebook' | 'instagram' | 'linkedin' | 'x'

export interface SocialIndexItem {
  number: string
  name: string
  platform: SocialPlatform
  href: string
  handle: string
}

export interface ProjectTypeOption {
  id: string
  label: string
  description: string
}

export const CONTACT_PAGE_CONTENT = {
  hero: {
    headline: 'CONTACT DEVTROP',
    headlineWords: ["LET'S", 'BUILD', 'SOMETHING', 'THAT WORKS.'],
    accentWordIndex: 1, // "BUILD"
    subhead:
      'Have a product idea, an existing platform that needs modernization, or a scaling challenge? Talk directly with our engineering team.',
    metadata: [
      {
        label: 'AVAILABLE FOR',
        value: 'SAAS • WEB PLATFORMS • MODERNIZATION',
      },
      {
        label: 'RESPONSE TIME',
        value: 'WITHIN 1 BUSINESS DAY',
        detail: 'Guaranteed 24-hour turnaround',
      },
      {
        label: 'BASED IN',
        value: 'BANGLADESH • GMT+6',
        detail: 'Dhaka Engineering Hub',
      },
    ] satisfies ContactMetadataPill[],
  },

  inquiry: {
    sectionNumber: '01',
    headline: "Tell us what you're building",
    subhead:
      "Give us a little context about your project and we'll get back to you with the right next step.",
    projectTypes: [
      {
        id: 'saas-mvp',
        label: '0→1 SaaS',
        description: 'Validated MVP architecture to live users in 6–8 weeks',
      },
      {
        id: 'web-platform',
        label: 'Web Platform',
        description: 'Multi-tenant, high-conversion web application',
      },
      {
        id: 'modernization',
        label: 'Modernization',
        description: 'Zero-downtime refactoring, React 19 / TS migrations',
      },
      {
        id: 'scale-perf',
        label: 'Scale & Performance',
        description: 'Database query tuning, caching layer, and edge routing',
      },
    ] satisfies ProjectTypeOption[],
    commitments: [
      'Direct review with a lead engineer (no account managers)',
      'Actionable architecture RFC and realistic sprint breakdown',
      'Mutual NDA executed prior to confidential disclosures',
      'No sales pressure — frank advice even if we do not partner',
    ],
  },

  directContact: {
    sectionNumber: '02',
    label: 'REACH OUT',
    headline: 'CONTACT DIRECTLY',
    subhead:
      'Prefer a direct channel over forms? Reach our studio desk through any of the channels below.',
    cards: [
      {
        label: 'EMAIL',
        title: 'hello@devtrop.com',
        href: 'mailto:hello@devtrop.com',
        detail: 'Direct engineering inbox',
      },
      {
        label: 'PHONE / WHATSAPP',
        title: '8801897208737',
        href: 'https://wa.me/8801897208737',
        isExternal: true,
        detail: 'Voice & instant messaging',
      },
      {
        label: 'LOCATION',
        title: 'Dhaka, Bangladesh',
        href: '#inquiry',
        detail: 'GMT+6 Studio Headquarters',
      },
      {
        label: 'RESPONSE',
        title: 'Within 1 business day',
        href: '#inquiry',
        detail: 'Active engineering queue',
      },
    ] satisfies DirectContactCard[],
  },

  social: {
    sectionNumber: '03',
    label: 'NETWORK & OPEN SOURCE',
    headline: 'FOLLOW DEVTROP',
    subhead:
      'We publish architectural RFCs, open-source proof builds, and real production engineering notes across our public channels.',
    items: [
      {
        number: '01',
        name: 'FACEBOOK',
        platform: 'facebook',
        href: 'https://facebook.com/devtrop',
        handle: '@devtrop',
      },
      {
        number: '02',
        name: 'INSTAGRAM',
        platform: 'instagram',
        href: 'https://instagram.com/devtrop_official',
        handle: '@devtrop_official',
      },
      {
        number: '03',
        name: 'LINKEDIN',
        platform: 'linkedin',
        href: 'https://linkedin.com/company/devtrop',
        handle: 'company/devtrop',
      },
      {
        number: '04',
        name: 'X',
        platform: 'x',
        href: 'https://x.com/devtropofficial',
        handle: '@devtropofficial',
      },
    ] satisfies SocialIndexItem[],
  },

  map: {
    sectionNumber: '04',
    badge: "WE'RE HERE",
    headline: 'TECHNICAL CARTOGRAPHY & BASE OF OPERATIONS',
    city: 'DHAKA, BANGLADESH',
    timezone: 'GMT +6',
    coordinates: {
      lat: '23.8103° N',
      lng: '90.4125° E',
      elevation: '4m ASL',
      gridZone: '45R',
    },
    specs: [
      { key: 'HUB', value: 'Dhaka Capital Region' },
      { key: 'TIMEZONE', value: 'Asia/Dhaka (UTC+06:00)' },
      { key: 'COORDINATES', value: '23.8103° N, 90.4125° E' },
      { key: 'OPERATING HOURS', value: '09:00 – 19:00 BST' },
    ],
  },

  closing: {
    headline: 'HAVE A PROJECT IN MIND?',
    accentWord: 'PROJECT',
    subhead:
      "Tell us what you're building. We'll help you figure out the right architecture, scope, and next step.",
    primaryCta: 'BOOK A DISCOVERY CALL →',
    secondaryCta: 'SEND AN INQUIRY →',
  },
} as const
