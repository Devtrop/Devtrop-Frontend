/**
 * src/lib/env.ts
 *
 * Server-side environment variable validation using Zod.
 * Imported by server components and lib utilities only.
 * Provides defaults for optional variables to prevent build failures.
 */
import { z } from "zod";

const envSchema = z.object({
  // Contact
  GMAIL_INFO: z.string().email("GMAIL_INFO must be a valid email address").default("hello@devtrop.com"),
  WHATSAPP: z
    .string()
    .min(7, "WHATSAPP must be a valid phone number (digits only, no +)")
    .regex(/^\d+$/, "WHATSAPP must contain only digits (no + or spaces)")
    .default("8801897208737"),

  // WhatsApp pre-filled messages
  WHATSAPP_MSG_DEFAULT: z.string().min(1).default("Hi, I'd like to discuss a project with Devtrop."),
  WHATSAPP_MSG_DISCOVERY: z.string().min(1).default("Hi, I'd like to book a 30-minute discovery call with Devtrop to discuss my project."),
  WHATSAPP_MSG_SQUAD: z.string().min(1).default("Hi, I'm interested in the Dedicated Engineering Squad plan. I'd like to discuss deploying a squad for my project."),
  WHATSAPP_MSG_MILESTONE: z.string().min(1).default("Hi, I'm interested in the Fixed-Scope Milestone Build. I'd like to scope out an MVP project with Devtrop."),
  WHATSAPP_MSG_AUDIT: z.string().min(1).default("Hi, I'm interested in the 2-Week Architecture & Code Audit. I'd like to request an audit for my codebase."),
  WHATSAPP_MSG_BOOK_A_CALL: z
    .string()
    .min(1)
    .default("Hi, I'd like to book a call with Devtrop to discuss my project."),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.warn("⚠️  Some environment variables are missing, using defaults:");
    result.error.issues.forEach((issue) => {
      console.warn(`  • ${issue.path.join(".")}: ${issue.message}`);
    });
    // Return parsed data with defaults
    return envSchema.parse({});
  }
  return result.data;
}

export const env = validateEnv();
