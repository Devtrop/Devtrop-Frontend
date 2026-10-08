export interface FaqItem {
  id: string
  number: string
  question: string
  answer: string
  category?: string
}

export interface FaqContent {
  sectionNumber: string
  sectionLabel: string
  headline: string
  subhead: string
  items: FaqItem[]
}

export const FAQ_CONTENT: FaqContent = {
  sectionNumber: '05',
  sectionLabel: 'ENGINEERING FAQ',
  headline: 'HARD QUESTIONS FOUNDERS ASK',
  subhead:
    'No sales deflection. Clear answers about our code quality, sprint mechanics, IP ownership, and post-launch support.',
  items: [
    {
      id: 'production-vs-prototype',
      number: '01',
      question: 'Do you write quick prototypes or real production-ready code?',
      answer:
        'We engineer production-grade software exclusively. Every build ships with strict TypeScript, runtime schema validation (Zod), modular database migrations, clean separation of concerns, and automated test coverage (Vitest / Playwright). We do not produce disposable throwaway mockups dressed up as software.',
    },
    {
      id: 'sprint-cadence-scope-shifts',
      number: '02',
      question: 'How does the 14-day sprint cadence work if requirements shift?',
      answer:
        "We operate on a strict 14-day delivery cycle. Prior to Day 1 of each sprint, we agree on a signed-off architecture RFC and sprint backlog. If requirements shift mid-sprint, we don't penalize you with bureaucratic change-order fees—we collaboratively swap unstarted backlog items of equal scope or prioritize the new direction in the very next sprint.",
    },
    {
      id: 'ip-ownership-and-transfer',
      number: '03',
      question: 'Who owns the IP and when is it transferred?',
      answer:
        '100% of the intellectual property is yours from commit #1. We write code directly into your GitHub or GitLab organization. We retain zero claim over your proprietary code, domain models, or user data. Formal IP assignment at project closeout is just a formality, because the codebase was always in your custody.',
    },
    {
      id: 'timezone-overlap',
      number: '04',
      question: 'What time zones do you overlap with?',
      answer:
        'We maintain guaranteed daily communication windows across North American (EST/PST), European (GMT/CET), and Asia-Pacific time zones. We conduct daily asynchronous standups in your Slack Connect or Discord, record narrated Loom walkthroughs for all staged features, and schedule synchronous architecture sessions during your business hours.',
    },
    {
      id: 'in-house-handoff',
      number: '05',
      question: 'Can our in-house team take over the codebase after launch?',
      answer:
        'Yes—we actively architect for autonomy rather than agency lock-in. Every build includes comprehensive architecture RFCs, database schema diagrams, clear environment setup documentation (Docker/pnpm), and end-to-end typed contracts. During the final sprint, we conduct deep-dive architecture walkthroughs with your technical hires to ensure seamless handoff.',
    },
    {
      id: 'hyper-care-warranty',
      number: '06',
      question: 'What is included in the 30-day hyper-care warranty?',
      answer:
        'Following production launch, the exact same lead engineers who built your platform remain on a dedicated priority queue for 30 calendar days. We actively monitor error telemetry (Sentry), patch edge-case defects in Devtrop-authored code, and ensure deployment stability at zero additional billing. It is an included commitment, not an upsell.',
    },
  ],
}
