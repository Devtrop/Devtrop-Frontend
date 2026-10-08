export interface HeroContent {
  sectionNumber: string
  sectionLabel: string
  headlineWords: string[]
  subhead: string
  primaryCta: { label: string; href: string; helperText: string }
  secondaryCta: { label: string; href: string }
}

export const HERO_CONTENT: HeroContent = {
  sectionNumber: '01',
  sectionLabel: 'SYSTEM',
  headlineWords: ['WE', 'ENGINEER', 'SCALABLE', 'WEBSITES'],
  subhead:
    'From zero-to-one product architectures to high-concurrency cloud systems. We partner with funded startups to ship production-grade website with uncompromising craftsmanship.',
  primaryCta: {
    label: 'Book a Discovery Call',
    href: '#contact',
    helperText: '30-min architecture review · Direct with lead engineer · No sales pressure',
  },
  secondaryCta: { label: 'Explore Selected Work', href: '#work' },
}

export interface EstimatorOption {
  projectType: string
  speed: string
  timeline: string
  squad: string
  architecture: string
}

export const ESTIMATOR_PROJECT_TYPES = [
  '0-to-1 SaaS MVP',
  'Platform Modernization',
  'Scale & Performance',
] as const

export const ESTIMATOR_SPEEDS = ['Standard', 'Rapid'] as const

export const ESTIMATOR_MATRIX: Record<string, Record<string, EstimatorOption>> = {
  '0-to-1 SaaS MVP': {
    Standard: {
      projectType: '0-to-1 SaaS MVP',
      speed: 'Standard',
      timeline: '6–8 weeks',
      squad: 'Lead + 2 FE/BE',
      architecture: 'Next.js 16 + Postgres + Stripe',
    },
    Rapid: {
      projectType: '0-to-1 SaaS MVP',
      speed: 'Rapid',
      timeline: '3–4 weeks',
      squad: 'Lead + 1',
      architecture: 'Next.js 16 + Supabase, scope-cut to core loop',
    },
  },
  'Platform Modernization': {
    Standard: {
      projectType: 'Platform Modernization',
      speed: 'Standard',
      timeline: '6–10 weeks',
      squad: 'Lead + 2',
      architecture: 'Incremental migration, zero-downtime cutovers',
    },
    Rapid: {
      projectType: 'Platform Modernization',
      speed: 'Rapid',
      timeline: '2–3 weeks',
      squad: 'Lead',
      architecture: 'Audit + migration RFC + CI hardening',
    },
  },
  'Scale & Performance': {
    Standard: {
      projectType: 'Scale & Performance',
      speed: 'Standard',
      timeline: '4–6 weeks',
      squad: 'Lead + 1 perf eng',
      architecture: 'Caching layer, query tuning, load testing',
    },
    Rapid: {
      projectType: 'Scale & Performance',
      speed: 'Rapid',
      timeline: '2 weeks',
      squad: 'Lead',
      architecture: 'Profiling engagement + prioritized fix PRs',
    },
  },
}
