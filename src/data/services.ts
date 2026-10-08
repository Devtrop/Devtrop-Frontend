export interface ServicePillar {
  number: string;
  title: string;
  pitch: string;
  deliverables: string[];
}

export const SERVICES_CONTENT = {
  sectionNumber: "04",
  sectionLabel: "METHOD",
  headline: "ENGINEERING PILLARS",
  subhead: "Four practices, one rigorous standard.",
  pillars: [
    {
      number: "01",
      title: "Full-Stack Web & SaaS Platforms",
      pitch: "End-to-end multi-tenant web applications engineered for long-term scalability from day one.",
      deliverables: ["Multi-tenant org architecture & RBAC", "Stripe usage-based billing", "Next.js App Router hybrid rendering", "Realtime sync (WS/SSE)"],
    },
    {
      number: "02",
      title: "Rapid 0-to-1 Product Engineering",
      pitch: "Validated concepts into investor-ready, production-grade MVPs in 6–8 weeks.",
      deliverables: ["Architecture + schema + PRD", "Design system in strict TS", "CI/CD with ephemeral previews", "API + test suites"],
    },
    {
      number: "03",
      title: "Application Modernization & Optimization",
      pitch: "Eliminating technical debt and query latency without operational downtime.",
      deliverables: ["Monolith decomposition", "Zero-downtime migrations", "Core Web Vitals remediation", "React 19/TS migrations"],
    },
    {
      number: "04",
      title: "Cloud Infrastructure & DevOps",
      pitch: "Resilient cloud foundations for continuous delivery and compliance.",
      deliverables: ["IaC (Terraform/CDK)", "Docker + GH Actions", "Observability (Datadog/Prometheus)", "Security hardening/OWASP"],
    },
  ] satisfies ServicePillar[],
};
