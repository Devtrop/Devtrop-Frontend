/**
 * src/lib/env.ts
 *
 * Server-side environment variable validation using Zod.
 * Imported by server components and lib utilities only.
 * Throws at startup if any required variable is missing or malformed —
 * catching misconfiguration at build time rather than runtime.
 */
import { z } from "zod";

const envSchema = z.object({
  // Contact
  GMAIL_INFO: z.string().email("GMAIL_INFO must be a valid email address"),
  WHATSAPP: z
    .string()
    .min(7, "WHATSAPP must be a valid phone number (digits only, no +)")
    .regex(/^\d+$/, "WHATSAPP must contain only digits (no + or spaces)"),

  // WhatsApp pre-filled messages
  WHATSAPP_MSG_DEFAULT: z.string().min(1),
  WHATSAPP_MSG_DISCOVERY: z.string().min(1),
  WHATSAPP_MSG_SQUAD: z.string().min(1),
  WHATSAPP_MSG_MILESTONE: z.string().min(1),
  WHATSAPP_MSG_AUDIT: z.string().min(1),
  WHATSAPP_MSG_BOOK_A_CALL: z
    .string()
    .min(1)
    .default("Hi, I'd like to book a call with Devtrop to discuss my project."),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`\n\n❌ Invalid environment variables:\n${formatted}\n`);
  }
  return result.data;
}

export const env = validateEnv();
