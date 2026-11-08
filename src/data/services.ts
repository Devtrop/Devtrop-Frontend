export interface ServicePillar {
  number: string
  title: string
  pitch: string
  deliverables: string[]
}

export const SERVICES_CONTENT = {
  sectionNumber: '04',
  sectionLabel: 'WHAT WE DO',
  headline: 'SOLUTIONS BUILT AROUND YOUR BUSINESS',
  subhead:
    'From your first idea to a growing business, we help you build, improve, and maintain digital products.',
  pillars: [
    {
      number: '01',
      title: 'Business Websites & Web Applications',
      pitch:
        'We design and build professional, responsive websites and web applications tailored to your brand — complete with an admin dashboard so you stay in control of your content and operations.',
      deliverables: [
        'Up to 10 responsive, professionally designed pages',
        'Custom design aligned to your brand and business goals',
        'Personalised admin dashboard for content management',
        'Contact forms and lead management',
        'Search-engine-friendly structure and deployment',
      ],
    },
    {
      number: '02',
      title: 'Custom Applications & SaaS Platforms',
      pitch:
        'Turn your business idea into a fully functional digital product. We build custom web applications and SaaS platforms designed around your business model, your customers, and your growth plans.',
      deliverables: [
        'Fully customised web application development',
        'SaaS platform and subscription model setup',
        'Advanced user management and role-based permissions',
        'Payment gateway integration and automated workflows',
        'Scalable architecture with full deployment and handover',
      ],
    },
    {
      number: '03',
      title: 'Portals, Dashboards & Integrations',
      pitch:
        'Give your team, customers, or partners a dedicated space to work. We build data-driven dashboards, dedicated portals, and connect your systems through third-party integrations and custom APIs.',
      deliverables: [
        'Customer, employee, applicant, or partner portals',
        'Advanced admin dashboards with analytics and insights',
        'Recruitment and applicant tracking systems',
        'Real-time notifications and communication features',
        'Custom API development and third-party integrations',
      ],
    },
    {
      number: '04',
      title: 'Ongoing Maintenance & Technical Support',
      pitch:
        'Your website should keep improving after launch. We handle the technical side — bug fixes, security updates, performance monitoring, and feature enhancements — so you can focus on your business.',
      deliverables: [
        'Regular bug fixes and technical troubleshooting',
        'Security updates and vulnerability fixes',
        'Performance monitoring and optimisation',
        'Content updates and minor design adjustments',
        'Ongoing technical recommendations and support',
      ],
    },
  ] satisfies ServicePillar[],
}
