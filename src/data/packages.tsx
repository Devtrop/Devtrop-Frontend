import { ReactNode } from 'react'

export interface FeatureItem {
  text: string
  /**
   * When true the item is exclusive to Premium.
   * On the Standard card it renders struck-through to show it exists but is
   * not included in that tier.
   */
  premiumOnly?: boolean
}

export interface PackagePlan {
  id: 'standard' | 'premium' | 'maintenance'
  tier?: string
  title: string
  tagline: string
  /** Small badge shown at the top-right corner of the card. */
  supportBadge?: ReactNode
  /** Price display: amount string + optional suffix label. */
  price?: {
    amount: string
    suffix?: string
  }
  description: string
  whatYouGet: FeatureItem[]
  benefits: string[]
  ctaLabel: string
  /** Full-width card placed on its own row. */
  span?: 'full'
  /** Featured tier rendered with the inverted (dark) treatment. */
  isFeatured?: boolean
}

// ─── Feature building blocks ──────────────────────────────────────────────────
// Split into three groups so per-plan text (e.g. page count) can differ freely.

/** Items included in Standard — text specific to the Standard tier. */
const STANDARD_OWN: FeatureItem[] = [
  { text: 'Up to 10 professionally designed, responsive website pages.' },
  { text: 'Custom website design tailored to your brand and business goals.' },
  { text: 'Personalized admin dashboard to manage your website and business content.' },
  { text: 'User accounts and access management.' },
  { text: 'Contact forms and potential customer (lead) management.' },
  { text: 'Database integration and structured data management.' },
  { text: 'Subscription plans and payment gateway integration.' },
  { text: 'Essential business analytics and reporting.' },
  { text: 'Search-engine-friendly website structure.' },
  { text: 'Unlimited revisions.' },
  { text: 'Complete deployment and launch assistance.' },
]

/** Items included in Premium — text specific to the Premium tier. */
const PREMIUM_OWN: FeatureItem[] = [
  { text: 'Unlimited professionally designed, responsive website pages.' },
  { text: 'Custom website design tailored to your brand and business goals.' },
  { text: 'Personalized admin dashboard to manage your website and business content.' },
  { text: 'User accounts and access management.' },
  { text: 'Contact forms and potential customer (lead) management.' },
  { text: 'Database integration and structured data management.' },
  { text: 'Subscription plans and payment gateway integration.' },
  { text: 'Advanced business analytics and reporting.' },
  { text: 'Search-engine-friendly website structure.' },
  { text: 'Unlimited revisions.' },
  { text: 'Complete deployment and launch assistance.' },
]

/**
 * Premium-exclusive items shown on BOTH cards.
 * On Standard they render struck-through; on Premium they render normally.
 */
const PREMIUM_EXCLUSIVE: FeatureItem[] = [
  { text: 'Fully customized web application development.', premiumOnly: true },
  { text: 'SaaS platform development tailored to your business model.', premiumOnly: true },
  { text: 'Advanced admin dashboard with business insights and analytics.', premiumOnly: true },
  { text: 'Custom recruitment and applicant tracking systems.', premiumOnly: true },
  {
    text: 'Dedicated portals for customers, employees, applicants, or partners.',
    premiumOnly: true,
  },
  { text: 'Advanced user management and role-based permissions.', premiumOnly: true },
  { text: 'Automated business workflows to reduce repetitive tasks.', premiumOnly: true },
  { text: 'Real-time notifications and communication features.', premiumOnly: true },
  { text: 'Custom API development and third-party integrations.', premiumOnly: true },
  { text: 'Scalable architecture designed for future expansion.', premiumOnly: true },
  { text: 'Complete deployment, launch, and technical handover.', premiumOnly: true },
]

// ─── Composed feature lists ───────────────────────────────────────────────────

/** Standard: its own items + premium-exclusive shown struck-through */
const STANDARD_FEATURES: FeatureItem[] = [...STANDARD_OWN, ...PREMIUM_EXCLUSIVE]

/** Premium: its own items + premium-exclusive shown normally (no strikethrough) */
const PREMIUM_FEATURES: FeatureItem[] = [
  ...PREMIUM_OWN,
  ...PREMIUM_EXCLUSIVE.map((f) => ({ ...f, premiumOnly: false })),
]

// ─── Content export ───────────────────────────────────────────────────────────

export const PACKAGES_CONTENT = {
  sectionNumber: '05',
  sectionLabel: 'PACKAGES',
  headline: 'OUR PACKAGES',
  subhead:
    'From a professional business website to a custom SaaS platform — plus the ongoing care that keeps it running. Clear packages, no hidden fees.',
  plans: [
    {
      id: 'standard',
      tier: 'Standard',
      title: 'Business Web Solutions',
      tagline: '1 Month Free Support & Maintenance',
      supportBadge: (
        <>
          Free <span className="text-lg">1</span> months maintenance
        </>
      ),
      price: { amount: '$4,999' },
      description:
        'A complete digital solution for businesses that want a professional online presence and better control over their daily operations.',
      whatYouGet: STANDARD_FEATURES,
      benefits: [
        '1 month of free post-launch maintenance.',
        'Free bug fixes during the maintenance period.',
        'Free minor design adjustments after launch.',
        'Assistance with website updates and content changes.',
        'Technical guidance whenever you need it.',
        'Free deployment support.',
      ],
      ctaLabel: 'Discuss the Standard Package',
    },
    {
      id: 'premium',
      tier: 'Premium',
      title: 'Custom Applications & SaaS',
      tagline: '3 Months Free Support & Maintenance',
      supportBadge: (
        <>
          Free <span className="text-lg">3</span> months maintenance
        </>
      ),
      price: { amount: '$14,999', suffix: '+' },
      description:
        'Turn your business idea into a powerful digital product. Get a custom-built application designed around your business processes, customers, and future growth.',
      whatYouGet: PREMIUM_FEATURES,
      benefits: [
        '3 months of free post-launch maintenance.',
        'Free bug fixes and technical troubleshooting.',
        'Free security updates during the maintenance period.',
        'Free minor improvements and adjustments.',
        'Priority technical support.',
        'Performance monitoring and optimization assistance.',
        'Dedicated post-launch technical consultation.',
      ],
      ctaLabel: 'Discuss the Premium Package',
      isFeatured: true,
    },
    {
      id: 'maintenance',
      title: 'Maintenance Support',
      tagline: 'Continuous Technical Support',
      price: { amount: '$499', suffix: '/mo' },
      description:
        "Your website shouldn't stop improving after launch. Let us handle the technical side while you focus on running your business.",
      whatYouGet: [
        { text: 'Up to 5 hours of technical support per month.' },
        { text: 'Regular website and application maintenance.' },
        { text: 'Timely bug fixes and troubleshooting.' },
        { text: 'Security updates and vulnerability fixes.' },
        { text: 'Website performance monitoring and optimization.' },
        { text: 'Regular database and backup maintenance.' },
        { text: 'Server and deployment support.' },
        { text: 'Content and minor design updates.' },
        { text: 'Ongoing recommendations to improve your digital product.' },
        { text: 'Feature enhancements based on an agreed scope.' },
      ],
      benefits: [],
      ctaLabel: 'Discuss the Maintenance Plan',
      span: 'full',
    },
  ] satisfies PackagePlan[],
}
