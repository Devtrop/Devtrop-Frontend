import { ReactNode } from 'react'

export interface FeatureItem {
  text: string
  /** When true the item is only in Premium — Standard shows it struck-through. */
  premiumOnly?: boolean
}

export interface PackagePlan {
  id: 'standard' | 'premium' | 'maintenance'
  tier?: string
  title: string
  tagline: string
  /** Small badge shown at the top-right corner of the card (e.g. free support duration). */
  supportBadge?: ReactNode
  description: string
  /** Shared feature list (shown in both Standard & Premium). */
  whatYouGet: FeatureItem[]
  benefits: string[]
  ctaLabel: string
  /** Full-width card placed on its own row (vs. half-width in the top row). */
  span?: 'full'
  /** Featured tier rendered with the inverted (dark) treatment. */
  isFeatured?: boolean
}

/** Combined feature list shown in BOTH Standard and Premium.
 *  Items marked premiumOnly render as strikethrough on the Standard card. */
const SHARED_FEATURES: FeatureItem[] = [
  { text: 'Up to 10 professionally designed, responsive website pages.' },
  { text: 'Custom website design tailored to your brand and business goals.' },
  { text: 'Personalized admin dashboard to manage your website and business content.' },
  { text: 'User accounts and access management.' },
  { text: 'Contact forms and potential customer (lead) management.' },
  { text: 'Database integration and structured data management.' },
  { text: 'Third-party service integrations.' },
  { text: 'Essential business analytics and reporting.' },
  { text: 'Search-engine-friendly website structure.' },
  { text: 'Complete deployment and launch assistance.' },
  { text: 'Unlimited Revisions' },
  // Premium-only items — shown struck-through on Standard
  { text: 'Fully customized web application development.', premiumOnly: true },
  { text: 'SaaS platform development tailored to your business model.', premiumOnly: true },
  { text: 'Advanced admin dashboard with business insights and analytics.', premiumOnly: true },
  { text: 'Custom recruitment and applicant tracking systems.', premiumOnly: true },
  {
    text: 'Dedicated portals for customers, employees, applicants, or partners.',
    premiumOnly: true,
  },
  { text: 'Advanced user management and role-based permissions.', premiumOnly: true },
  { text: 'Subscription plans and payment gateway integration.', premiumOnly: true },
  { text: 'Automated business workflows to reduce repetitive tasks.', premiumOnly: true },
  { text: 'Real-time notifications and communication features.', premiumOnly: true },
  { text: 'Custom API development and third-party integrations.', premiumOnly: true },
  { text: 'Scalable architecture designed for future expansion.', premiumOnly: true },
  { text: 'Complete deployment, launch, and technical handover.', premiumOnly: true },
]

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
      description:
        'A complete digital solution for businesses that want a professional online presence and better control over their daily operations.',
      whatYouGet: SHARED_FEATURES,
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
      description:
        'Turn your business idea into a powerful digital product. Get a custom-built application designed around your business processes, customers, and future growth.',
      whatYouGet: SHARED_FEATURES,
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
      // tier: 'Dedicated Maintenance',
      title: 'Maintenance Support',
      tagline: 'Continuous Technical Support',
      description:
        "Your website shouldn't stop improving after launch. Let us handle the technical side while you focus on running your business.",
      whatYouGet: [
        { text: 'Regular website and application maintenance.' },
        { text: 'Timely bug fixes and troubleshooting.' },
        { text: 'Security updates and vulnerability fixes.' },
        { text: 'Website performance monitoring and optimization.' },
        { text: 'Regular database and backup maintenance.' },
        { text: 'Server and deployment support.' },
        { text: 'Content and minor design updates.' },
        { text: 'Technical assistance whenever issues arise.' },
        { text: 'Ongoing recommendations to improve your digital product.' },
        { text: 'Feature enhancements based on an agreed scope.' },
      ],
      benefits: [],
      ctaLabel: 'Discuss the Maintenance Plan',
      span: 'full',
    },
  ] satisfies PackagePlan[],
}
