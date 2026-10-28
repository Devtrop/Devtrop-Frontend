import { toast as sonnerToast } from 'sonner'
import type { ReactNode } from 'react'

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi

function sanitizeMessage<T>(message: T): T {
  if (typeof message === 'string') {
    return message
      .replace(UUID_REGEX, '')
      .replace(/\s{2,}/g, ' ')
      .trim() as unknown as T
  }
  return message
}

type ToastContent = string | ReactNode

function baseToast(message: ToastContent, data?: Parameters<typeof sonnerToast>[1]) {
  return sonnerToast(sanitizeMessage(message), data)
}

export const toast = Object.assign(baseToast, {
  ...sonnerToast,
  success: (message: ToastContent, data?: Parameters<typeof sonnerToast.success>[1]) =>
    sonnerToast.success(sanitizeMessage(message), data),
  error: (message: ToastContent, data?: Parameters<typeof sonnerToast.error>[1]) =>
    sonnerToast.error(sanitizeMessage(message), data),
  info: (message: ToastContent, data?: Parameters<typeof sonnerToast.info>[1]) =>
    sonnerToast.info(sanitizeMessage(message), data),
  warning: (message: ToastContent, data?: Parameters<typeof sonnerToast.warning>[1]) =>
    sonnerToast.warning(sanitizeMessage(message), data),
  message: (message: ToastContent, data?: Parameters<typeof sonnerToast.message>[1]) =>
    sonnerToast.message(sanitizeMessage(message), data),
})
