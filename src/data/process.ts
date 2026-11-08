export interface ProcessPhase {
  number: string
  title: string
  timeline: string
  narrative: string
  deliverables: string[]
}

export const PROCESS_CONTENT = {
  sectionNumber: '06',
  sectionLabel: 'HOW WE WORK',
  headline: 'FROM IDEA TO LAUNCH',
  subhead: 'A clear process, regular updates, and no surprises along the way.',
  phases: [
    {
      number: '01',
      title: 'Discovery & Planning',
      timeline: 'Week 1',
      narrative:
        'We learn about your business, your goals, and the package that fits your needs. Together we define exactly what to build, agree on priorities, and set clear expectations before a single line of code is written.',
      deliverables: [
        'Clear project scope and feature list',
        'Agreed timeline and milestones',
        'Design direction aligned to your brand',
      ],
    },
    {
      number: '02',
      title: 'Design & Development',
      timeline: 'Throughout the Build',
      narrative:
        'We build your website, application, or SaaS platform with regular working previews so you can see progress and give feedback. Every feature is built to the agreed scope — no surprises, no scope creep.',
      deliverables: [
        'Working previews at every milestone',
        'Regular progress updates',
        'Admin dashboard and core features delivered first',
      ],
    },
    {
      number: '03',
      title: 'Testing & Refinement',
      timeline: 'Before Launch',
      narrative:
        'Before anything goes live, we test thoroughly, fix issues, and refine the experience. You review and approve the final product — we only launch when you are satisfied.',
      deliverables: [
        'Full functionality and compatibility testing',
        'Bug fixes and final adjustments',
        'Your sign-off before launch',
      ],
    },
    {
      number: '04',
      title: 'Launch & Post-Launch Support',
      timeline: 'Launch Day & Beyond',
      narrative:
        'We handle deployment and get your product live. Depending on your package — Standard, Premium, or Dedicated Maintenance — you receive free post-launch support, bug fixes, and technical guidance to keep everything running smoothly.',
      deliverables: [
        'Full deployment and go-live assistance',
        'Handover of project files and access',
        'Free post-launch support included with your package',
      ],
    },
  ] satisfies ProcessPhase[],
}
