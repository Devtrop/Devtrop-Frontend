export interface CaseStudySection {
  heading: string;
  body: string;
}

export interface ProofBuild {
  slug: string;
  category: string;
  title: string;
  outcome: string;
  stackTags: string[];
  image: string;
  imageAlt: string;
  liveUrl: string;
  featured: boolean;
  summary: string;
  sections: CaseStudySection[];
  deliverables: string[];
}

export const WORK_CONTENT = {
  sectionNumber: "03",
  sectionLabel: "WORK",
  headline: "WEBSITE BUILT TO BE EXAMINED",
  subhead:
    "Every claim below links to something live: a production app you can open in a new tab right now.",
  builds: [
    {
      slug: "feletrip",
      category: "Travel Marketplace",
      title: "Feletrip: Hotel & Travel Booking Marketplace",
      outcome:
        "A working bookings marketplace: hotels, rooms, deals, reviews, and vendor payouts running in production.",
      stackTags: [
        "Next.js",
        "React",
        "TypeScript",
        "Express",
        "PostgreSQL (Prisma)",
        "Redis",
        "SSLCommerz",
        "Socket.IO",
        "Leaflet",
        "TanStack Query",
        "next-auth",
        "Tailwind CSS",
        "HeroUI",
        "OpenAPI",
      ],
      image: "/work-feletrip-v2.png",
      imageAlt:
        "Screenshot of the Feletrip homepage showing the welcome banner and special deals section",
      liveUrl: "https://www.feletrip.com",
      featured: true,
      summary:
        "Feletrip is a hotel booking marketplace: travellers search verified properties and deals, hotel vendors manage listings and availability, and the platform handles payment, commission, and vendor payouts. This case study covers the marketplace model and the booking flow.",
      sections: [
        {
          heading: "The Problem",
          body: "Travellers want verified hotels, real availability, and deals in one place. Hotel and resort owners want direct bookings without feeding a foreign aggregator a large cut of every reservation. The hard part is not the search UI, it is the money: availability, booking state, payment, commission, and vendor payout have to agree with each other at all times. Bolt-on marketplace logic breaks the first time a booking and a cancellation race each other.",
        },
        {
          heading: "One Schema for the Whole Marketplace",
          body: "Hotels, rooms, bookings, payments, reviews, wishlists, deals, and locations share a single Prisma schema on PostgreSQL. Availability and pricing derive from the same room and booking tables the vendor dashboard edits, so a room that is sold cannot show as free. Vendors get their own profile and listing management, and a commission model computed per booking feeds a vendor-withdrawal flow, which makes the marketplace's cut auditable instead of a monthly spreadsheet.",
        },
        {
          heading: "The Booking Flow",
          body: "Travellers search by destination with Leaflet maps and date-range pickers, filter deals, and book rooms through an SSLCommerz payment flow. Sessions carry identity, and a client data layer keeps search, listing, and dashboard data fresh without full-page reloads. Chats between travellers and vendors run over Socket.IO, and content marketing pages (blogs, video, advertisement slots) sit on the same backend, so SEO pages and booking data never drift apart.",
        },
        {
          heading: "Platform Engineering",
          body: "The API is an Express service with JWT-based role permissions, Redis-backed caching, and Swagger-documented endpoints across 25 feature modules. Media uploads go through S3 with image processing, and email runs on Nodemailer with Brevo delivery. The frontend is Next.js App Router, server-rendered for search and listing pages.",
        },
        {
          heading: "Where It Stands",
          body: "Feletrip is live at feletrip.com with the booking, payment, and vendor payout flows in production.",
        },
      ],
      deliverables: [
        "Live production site at feletrip.com",
        "Vendor commission and withdrawal flow",
      ],
    },
    {
      slug: "biponiq",
      category: "Multi-Vendor Marketplace",
      title: "Biponiq: Multi-Vendor Storefront Builder",
      outcome:
        "A Shopify-style SaaS where each vendor gets a branded storefront on their own subdomain or custom domain, plus the tools to run it.",
      stackTags: [
        "Next.js",
        "React",
        "TypeScript",
        "Express",
        "PostgreSQL (Prisma)",
        "Redis + BullMQ",
        "SSLCommerz",
        "Gemini AI",
        "Socket.IO",
        "Tailwind CSS",
        "Zustand",
        "TanStack Query",
        "Google OAuth",
        "Cloudinary",
      ],
      image: "/work-biponiq.png",
      imageAlt:
        "Screenshot of the Biponiq homepage showing the Bengali hero copy and vendor store dashboard preview",
      liveUrl: "https://biponiq.com",
      featured: true,
      summary:
        "Biponiq is a multi-vendor storefront builder: vendors create branded shops on subdomains or custom domains, sell through local payments including cash-on-delivery, and get paid out by the platform. This case study covers the builder, the payout economy, and the AI assistant.",
      sections: [
        {
          heading: "The Problem",
          body: "Off-the-shelf store builders fail Bangladeshi vendors on three points: local payment gateways, cash-on-delivery, and courier integration. Vendors also rarely want a website, they want a shop that looks like their brand, so templates and editing matter more than raw feature count. Biponiq answers all of it in one platform: build the store, take the money, deliver the parcel, get paid.",
        },
        {
          heading: "Storefronts Without Code",
          body: "Each vendor gets a tenant with a subdomain and can attach a custom or purchased domain. A page-template system with a visual editor lets vendors restyle storefronts without touching code, and admin tooling includes controlled impersonation for support work. The backend tracks store subscriptions and visitor-package top-ups, which is how the platform monetizes growth instead of charging one flat fee.",
        },
        {
          heading: "The Payout Economy",
          body: "Checkout supports SSLCommerz and cash-on-delivery, with courier and delivery-charge modules handling dispatch. On the money side, the platform tracks vendor earnings, cashouts, and an affiliate program with its own payouts, all on the same Express and Prisma PostgreSQL foundation, with Redis and BullMQ keeping queue-heavy work like notifications and scheduled jobs off the request path.",
        },
        {
          heading: "AI and Analytics",
          body: "Every store gets a Gemini-powered chatbot grounded in a per-store knowledge base, so shopper questions about products and policies get answered with the vendor's own catalog data. Visitor tracking uses geo resolution, and Meta and TikTok pixel event modules let vendors run ad campaigns against real conversion data. Dashboards for admin, vendor, and affiliate roles read from the same schema.",
        },
        {
          heading: "Where It Stands",
          body: "Biponiq is live at biponiq.com with the storefront builder, payout economy, and AI assistant in production.",
        },
      ],
      deliverables: [
        "Live production site at biponiq.com",
        "Admin, vendor, and affiliate dashboards",
      ],
    },
  ] satisfies ProofBuild[],
};
