export interface EngagementModel {
  title: string
  audience: string
  description: string
  highlights: string[]
  ctaLabel: string
  isPopular?: boolean
}

// export const ENGAGEMENT_CONTENT = {
//   sectionNumber: '08',
//   sectionLabel: 'ENGAGE',
//   headline: 'COLLABORATION MODELS',
//   subhead: 'Transparent terms. No hidden fees. Pick the structure that fits.',
//   models: [
//     {
//       title: 'Dedicated Engineering Squad',
//       audience: 'Funded startups & scale-ups',
//       description: 'Pod integrated into your Slack/Linear/GitHub with standups & demos.',
//       highlights: [
//         'Monthly retainer, 30-day notice',
//         'SLA response times',
//         'Standups & sprint demos',
//         'Full GitHub org access',
//       ],
//       ctaLabel: 'Deploy a Squad',
//     },
//     {
//       title: 'Fixed-Scope Milestone Build',
//       audience: '0-to-1 MVPs',
//       description: 'RFC + PRD sign-off with milestone payments tied to verified staging demos.',
//       highlights: [
//         '6–8 week delivery window',
//         'Milestone-based payments',
//         '30-day warranty included',
//         '100% IP transfer at close',
//       ],
//       ctaLabel: 'Scope a Project',
//       isPopular: true,
//     },
//     {
//       title: '2-Week Architecture & Code Audit',
//       audience: 'Pre-scale / pre-raise',
//       description:
//         'Query & bottleneck profiling, security/SOC2-readiness review, and a prioritized fix-PR roadmap.',
//       highlights: [
//         'Full codebase audit',
//         'Prioritized fix-PR roadmap',
//         'Executive summary',
//         'Security/SOC2 review',
//       ],
//       ctaLabel: 'Request an Audit',
//     },
//   ] satisfies EngagementModel[],
// }

export const ENGAGEMENT_CONTENT = {
  sectionNumber: '08',
  sectionLabel: 'WORK WITH US',
  headline: 'FIND THE RIGHT PACKAGE FOR YOUR BUSINESS',
  subhead:
    'We offer three clear packages designed to match where your business is right now — and where it is heading.',
  models: [
    {
      title: 'Standard — Business Web Solutions',
      audience: 'Businesses that need a professional online presence',
      description:
        'A complete digital solution for businesses that want a professional website, an admin dashboard, and better control over their daily operations. Includes 1 month of free post-launch support.',
      highlights: [
        'Up to 10 responsive, professionally designed pages',
        'Custom design tailored to your brand',
        'Admin dashboard for content and business management',
        'Contact forms, lead management, and deployment',
        '1 month free post-launch maintenance',
      ],
      ctaLabel: 'View Standard Package',
    },
    {
      title: 'Premium — Custom Applications & SaaS',
      audience: 'Businesses building a custom product or platform',
      description:
        'Turn your business idea into a powerful digital product — a custom web application or SaaS platform built around your processes, your customers, and your future growth. Includes 3 months of free post-launch support.',
      highlights: [
        'Fully customised web application or SaaS platform',
        'Advanced dashboard, portals, and user management',
        'Payment gateway, subscriptions, and workflow automation',
        'Custom API development and third-party integrations',
        '3 months free post-launch maintenance',
      ],
      ctaLabel: 'View Premium Package',
      isPopular: true,
    },
    {
      title: 'Dedicated Maintenance',
      audience: 'Businesses that need continuous technical care',
      description:
        'Your website should not stop improving after launch. We handle the technical side on an ongoing basis — bug fixes, security updates, performance monitoring, and feature improvements — while you focus on your business.',
      highlights: [
        'Regular bug fixes and troubleshooting',
        'Security updates and vulnerability fixes',
        'Performance monitoring and optimisation',
        'Content updates and minor design improvements',
        'Ongoing technical recommendations and support',
      ],
      ctaLabel: 'View Maintenance Plan',
    },
  ] satisfies EngagementModel[],
}

export interface WorkingCommitment {
  number: string
  title: string
  description: string
}

export const WORKING_AGREEMENT = {
  sectionNumber: '07',
  sectionLabel: 'AGREEMENT',
  headline: 'THE WORKING AGREEMENT',
  subhead: 'No black boxes. This is what you can hold us to from week one.',
  commitments: [
    {
      number: '01',
      title: 'Direct engineer access',
      description:
        'You talk to the people writing the code. No account managers, no relayed questions, no junior swap after signature.',
    },
    {
      number: '02',
      title: 'Weekly transparency',
      description:
        'Every week: a working staging build, a recorded walkthrough, and an updated sprint board you can open any hour of any day.',
    },
    {
      number: '03',
      title: 'Shipping on a 14-day metronome',
      description:
        'Sprints end with website on a live URL — not status decks. If a milestone slips, you hear it before the demo, not during it.',
    },
    {
      number: '04',
      title: 'Day-one ownership',
      description:
        'Code lands in your GitHub organization from the first commit. IP transfer at launch is a formality, because it was always yours.',
    },
    {
      number: '05',
      title: '30-day hyper-care',
      description:
        'After launch we stay on: same engineers, priority queue, fixes for anything our code broke — included, not upsold.',
    },
  ] satisfies WorkingCommitment[],
}
