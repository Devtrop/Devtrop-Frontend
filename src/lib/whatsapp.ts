/**
 * src/lib/whatsapp.ts
 *
 * WhatsApp URL builder and pre-filled messages.
 * Reads number and message copy from validated env — server-side only.
 */
import { env } from "./env";

/** Build a wa.me deep-link with an optional pre-filled message. */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${env.WHATSAPP}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Pre-filled messages keyed by CTA context. */
export const WHATSAPP_MESSAGES = {
  default: env.WHATSAPP_MSG_DEFAULT,
  discovery: env.WHATSAPP_MSG_DISCOVERY,
  squad: env.WHATSAPP_MSG_SQUAD,
  milestone: env.WHATSAPP_MSG_MILESTONE,
  audit: env.WHATSAPP_MSG_AUDIT,
  bookACall: env.WHATSAPP_MSG_BOOK_A_CALL,
  standard: env.WHATSAPP_MSG_STANDARD,
  premium: env.WHATSAPP_MSG_PREMIUM,
  maintenance: env.WHATSAPP_MSG_MAINTENANCE,
} as const;
