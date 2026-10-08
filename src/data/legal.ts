export interface LegalSection {
  number: string
  title: string
  content: string[]
}

export interface LegalDocument {
  eyebrow: string
  title: string
  lastUpdated: string
  summaryBadge: string
  summaryText: string
  sections: LegalSection[]
}

export const PRIVACY_POLICY: LegalDocument = {
  eyebrow: 'LEGAL & COMPLIANCE',
  title: 'PRIVACY POLICY',
  lastUpdated: 'October 2026',
  summaryBadge: 'THE HONESTY STANDARD',
  summaryText:
    'Devtrop does not harvest, monetize, or broker personal data. We operate with minimal data collection, zero third-party marketing trackers, and strict confidentiality across all client engineering projects.',
  sections: [
    {
      number: '01',
      title: 'Introduction & Core Principle',
      content: [
        'Devtrop is a full-stack web and SaaS engineering studio. We partner with ambitious founders, technical leaders, and product organizations to design, architect, and ship production-grade software.',
        'We believe privacy is an engineering discipline, not a marketing disclaimer. This policy describes how we collect, handle, and protect information when you visit devtrop.com, initiate an architecture consultation, or enter into an active engineering agreement.',
      ],
    },
    {
      number: '02',
      title: 'Information We Collect',
      content: [
        'Direct Inquiries: When you submit an inquiry via email, schedule an architecture review via our Calendly integration, or connect via WhatsApp/Messenger, we receive the information you provide (e.g., your name, company name, work email address, project timeline, and architecture notes).',
        'Technical Logs: Our hosting infrastructure (Vercel) automatically logs standard HTTP access metrics (IP address, user agent, requested URLs, and response timestamps) strictly for uptime monitoring, abuse mitigation, and DDoS prevention.',
      ],
    },
    {
      number: '03',
      title: 'Information We Do NOT Collect',
      content: [
        'Zero Advertising Telemetry: We do not deploy Facebook Pixels, Google Tag Manager marketing containers, cross-site identity graphs, or behavioural remarketing trackers.',
        'Zero Invasive Analytics: We do not sell, rent, or trade your personal data or browsing behavior to third-party data brokers or advertising syndicates under any circumstances.',
      ],
    },
    {
      number: '04',
      title: 'Client Project Data & Source Code Confidentiality',
      content: [
        'Mutual Confidentiality: All client proprietary code, schema definitions, system architectures, credentials, and product roadmaps shared with Devtrop are treated as strictly confidential under our mutual working agreement.',
        'Client-Controlled Repositories: We commit code directly to client-owned GitHub or GitLab organizations whenever possible. We never host client production secrets or credentials on unsecured public networks.',
      ],
    },
    {
      number: '05',
      title: 'Third-Party Service Providers',
      content: [
        'We utilize a minimal set of vetted, industry-standard third-party providers to facilitate studio operations:',
        '• Calendly: To facilitate seamless booking of 30-minute discovery calls (loaded on-demand only when requested).',
        '• Vercel: For global edge content delivery, SSL termination, and reliable website hosting.',
        '• Direct Messaging (WhatsApp / Meta): For direct asynchronous messaging if you choose to initiate contact through those channels.',
      ],
    },
    {
      number: '06',
      title: 'Data Retention & Your Rights',
      content: [
        'We retain inquiry correspondence and scope estimations only for as long as necessary to facilitate discovery calls and fulfill ongoing contractual relationships.',
        'You maintain the absolute right to inspect, correct, or permanently request deletion of any personal data or correspondence records held by Devtrop by contacting us directly.',
      ],
    },
    {
      number: '07',
      title: 'Contact for Privacy Matters',
      content: [
        'If you have questions regarding this Privacy Policy, your rights, or our security practices, contact our lead engineering team directly at info.devtrop@gmail.com.',
      ],
    },
  ],
}

export const TERMS_OF_SERVICE: LegalDocument = {
  eyebrow: 'CONTRACTUAL TERMS',
  title: 'TERMS OF SERVICE',
  lastUpdated: 'October 2026',
  summaryBadge: 'THE WORKING AGREEMENT',
  summaryText:
    'Our terms reflect transparent engineering partnership: 100% intellectual property ownership to you, 14-day sprint cadences, bi-weekly staging deliverables, and an included 30-day hyper-care warranty.',
  sections: [
    {
      number: '01',
      title: 'Scope of Engineering Services',
      content: [
        'Devtrop provides technical advisory, architectural design, 0-to-1 MVP builds, SaaS platform modernization, and dedicated full-stack engineering services.',
        'Each commercial engagement is governed by an agreed-upon Statement of Work (SOW) or sprint backlog outlining deliverables, sprint cycles, acceptance benchmarks, and investment terms.',
      ],
    },
    {
      number: '02',
      title: '100% Intellectual Property Ownership',
      content: [
        'Complete Client Ownership: 100% of the custom software, database schemas, API contracts, design tokens, and documentation created by Devtrop for your project belongs to you.',
        'Day-One Custody: Work is committed directly into your private GitHub/GitLab repositories. Upon settlement of invoices for the corresponding sprint or milestone, all intellectual property rights are unconditionally assigned to you.',
        'No Lock-In: We never insert proprietary runtime locks, obfuscated binaries, or closed licenses that prevent your team or future contractors from maintaining the code.',
      ],
    },
    {
      number: '03',
      title: '14-Day Delivery Sprints & Acceptance',
      content: [
        'Bi-Weekly Staging Cadence: Projects proceed in 14-day delivery sprints. At the end of every sprint, we deploy working software to a verifiable staging URL alongside recorded Loom walkthroughs.',
        'Acceptance Testing: Clients receive a designated review window (typically 5 business days following sprint delivery) to review features against the sprint backlog and confirm acceptance.',
      ],
    },
    {
      number: '04',
      title: 'Change Management & Backlog Swapping',
      content: [
        'Flexible Sprint Backlog: We understand that early-stage product roadmaps evolve rapidly. Before each sprint begins, backlog priorities can be adjusted freely.',
        'Zero Change Penalty: If priorities pivot during an active sprint, we do not impose bureaucratic change fees; instead, we collaboratively swap unstarted tasks of equal engineering complexity or schedule them for the subsequent sprint.',
      ],
    },
    {
      number: '05',
      title: '30-Day Hyper-Care Warranty',
      content: [
        'Post-Launch Coverage: Every fixed-scope milestone build and MVP launch includes 30 calendar days of hyper-care warranty starting from production deployment.',
        'Scope of Hyper-Care: Our lead engineers actively triage and remediate critical regressions, broken flows, or latent defects within Devtrop-authored code at zero additional charge.',
      ],
    },
    {
      number: '06',
      title: 'Mutual Confidentiality & Non-Disclosure',
      content: [
        'Both parties agree to hold all proprietary trade secrets, unreleased product concepts, business logic, customer metrics, and technical designs in strict confidence.',
        'Devtrop executes mutual Non-Disclosure Agreements (NDAs) prior to receiving confidential architectural specifications or proprietary access.',
      ],
    },
    {
      number: '07',
      title: 'Payment Milestones & Invoicing',
      content: [
        'Fixed-scope builds operate on predetermined milestone payments tied to verified staging demos. Retainer-based squads operate on transparent monthly billing with a 30-day cancellation notice.',
        'Invoices are payable upon receipt via approved commercial payment channels (wire transfer, Stripe, or local banking rails).',
      ],
    },
    {
      number: '08',
      title: 'Limitation of Liability & Dependencies',
      content: [
        'Devtrop builds on industry-standard open-source ecosystems and reliable cloud infrastructure (Next.js, Node, PostgreSQL, AWS, Vercel, Stripe).',
        'Devtrop is not liable for upstream outages, service deprecations, or policy changes initiated by third-party cloud vendors, payment processors, or API providers outside our direct control.',
      ],
    },
    {
      number: '09',
      title: 'Governing Law & Inquiries',
      content: [
        'These terms and individual Statements of Work are governed by commercial contract laws agreed upon in your engagement agreement.',
        'For contractual inquiries or to request a tailored Master Services Agreement (MSA), email info.devtrop@gmail.com.',
      ],
    },
  ],
}
