import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Google — full crawl access, prioritise search indexing
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [],
      },
      // Bing — full crawl access
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [],
      },
      // All other crawlers — allow everything, no disallows on a public marketing site
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",     // Never index API routes
        ],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
}
