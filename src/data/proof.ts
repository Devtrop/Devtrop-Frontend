export interface CommitmentTile {
  value: string;
  label: string;
  basis: "contractual" | "practice" | "target";
}

export const PROOF_CONTENT = {
  sectionNumber: "02",
  sectionLabel: "ECOSYSTEM",
  badgeLabel: "BUILT WITH INDUSTRY-STANDARD OPEN SOURCE & CLOUD ECOSYSTEMS",
  techBadges: ["Next.js", "React", "TypeScript", "PostgreSQL", "AWS", "Vercel", "Supabase", "Tailwind CSS"],
  commitments: [
    { value: "100%", label: "Code & IP ownership, always transferred", basis: "contractual" },
    { value: "14-Day", label: "Sprint cadence: working website on a staging URL", basis: "contractual" },
    { value: "Type-safe", label: "End-to-end TypeScript, strict mode, tests in CI", basis: "practice" },
    { value: "LH ≥ 95", label: "Performance budget on every build we ship", basis: "target" },
  ] satisfies CommitmentTile[],
};
