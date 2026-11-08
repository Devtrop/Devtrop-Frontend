import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/data/site";
import { WORK_CONTENT } from "@/data/work";

// Update these dates whenever corresponding page content changes.
// Using static dates prevents Google from thinking every page changed on every deploy.
const DATES = {
  home:     new Date("2026-10-08"),
  services: new Date("2026-10-01"),
  packages: new Date("2026-11-09"),
  work:     new Date("2026-10-08"),
  about:    new Date("2026-10-01"),
  contact:  new Date("2026-10-01"),
  privacy:  new Date("2026-09-01"),
  terms:    new Date("2026-09-01"),
  caseStudy: new Date("2026-10-08"),
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_CONFIG.url;

  return [
    {
      url: base,
      lastModified: DATES.home,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/services`,
      lastModified: DATES.services,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/packages`,
      lastModified: DATES.packages,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${base}/work`,
      lastModified: DATES.work,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...WORK_CONTENT.builds.map((build) => ({
      url: `${base}/work/${build.slug}`,
      lastModified: DATES.caseStudy,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    {
      url: `${base}/about`,
      lastModified: DATES.about,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/contact`,
      lastModified: DATES.contact,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${base}/privacy`,
      lastModified: DATES.privacy,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: DATES.terms,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
