export interface TechCard {
  tool: string;
  reason: string;
  benchmark: string;
}

export interface TechTab {
  id: string;
  label: string;
  cards: TechCard[];
}

export const TECH_MATRIX_CONTENT = {
  sectionNumber: "06",
  sectionLabel: "ARCHITECTURE",
  headline: "TECHNOLOGY MATRIX",
  subhead: "Every tool chosen for a reason. Every reason defensible.",
  tabs: [
    {
      id: "frontend",
      label: "Frontend & Edge",
      cards: [
        { tool: "React Server Components", reason: "Zero-bundle data fetching, streamed UI", benchmark: "Zero client JS for data-only components" },
        { tool: "Next.js App Router", reason: "Layouts, parallel routes, edge caching", benchmark: "Sub-100ms TTFB on edge-cached routes" },
        { tool: "TypeScript Strict", reason: "Schema→UI type safety", benchmark: "Zero runtime type errors in production" },
      ],
    },
    {
      id: "backend",
      label: "Distributed Backend",
      cards: [
        { tool: "Server Actions", reason: "Colocation, no API-layer drift", benchmark: "Type-safe client↔server with zero boilerplate" },
        { tool: "Queue-Based Async", reason: "BullMQ/SQS — durability under spikes", benchmark: "Zero dropped jobs under 10× burst load" },
        { tool: "WebSockets/SSE", reason: "Server-authoritative realtime", benchmark: "Sub-50ms event propagation at p99" },
      ],
    },
    {
      id: "database",
      label: "Databases & Caching",
      cards: [
        { tool: "PostgreSQL", reason: "RLS multi-tenancy, transactional integrity", benchmark: "Row-level isolation with zero cross-tenant leaks" },
        { tool: "Redis", reason: "Sub-ms read layer, rate limiting", benchmark: "Sub-1ms p99 cache reads" },
        { tool: "Connection Pooling", reason: "pgBouncer, EXPLAIN-driven tuning", benchmark: "Stable connections under 1k+ concurrent queries" },
      ],
    },
    {
      id: "devops",
      label: "Cloud & DevOps",
      cards: [
        { tool: "IaC (Terraform/CDK)", reason: "Reviewable, reproducible environments", benchmark: "Full env provisioned in < 10 minutes" },
        { tool: "GitHub Actions", reason: "Same pipeline from PR to prod", benchmark: "CI runs < 5 minutes for full suite" },
        { tool: "Observability Stack", reason: "Prometheus/Grafana/Datadog SLOs", benchmark: "SLOs defined and tracked per engagement" },
      ],
    },
  ] satisfies TechTab[],
};
