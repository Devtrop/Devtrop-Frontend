export interface ProcessPhase {
  number: string;
  title: string;
  timeline: string;
  narrative: string;
  deliverables: string[];
}

export const PROCESS_CONTENT = {
  sectionNumber: "05",
  sectionLabel: "PROCESS",
  headline: "ENGINEERING STANDARD",
  subhead: "Four phases. Every engagement. No shortcuts.",
  phases: [
    {
      number: "01",
      title: "Technical Specification & Architecture RFC",
      timeline: "Sprint 0 — Week 1",
      narrative: "Blueprints, ERDs, API contracts before production code.",
      deliverables: ["Signed-off RFC", "Sprint backlog", "Design tokens"],
    },
    {
      number: "02",
      title: "Bi-Weekly Agile Deployments",
      timeline: "Weeks 2–8",
      narrative: "Working features on live staging URLs every 14 days + recorded walkthroughs.",
      deliverables: ["Staging URLs", "Loom walkthroughs", "Retro summaries"],
    },
    {
      number: "03",
      title: "Automated Testing & Security Gates",
      timeline: "Continuous",
      narrative: "Playwright E2E, Vitest coverage, static analysis on every PR.",
      deliverables: ["Passing gates", "Zero critical vulns", "Audit reports"],
    },
    {
      number: "04",
      title: "Production Handoff & Hyper-Care",
      timeline: "Launch + 30 days",
      narrative: "IP transfer, docs, team onboarding, 30-day support.",
      deliverables: ["Repo transfer", "Architecture docs", "30-day warranty"],
    },
  ] satisfies ProcessPhase[],
};
