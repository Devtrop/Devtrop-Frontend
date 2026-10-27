import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Full name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .min(10, 'Phone number must be at least 10 digits'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const resendVerificationSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
})

export const verifyLoginOtpSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  otp: z
    .string()
    .min(1, 'Verification code is required')
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Verification code must be numbers only'),
})

export const resendLoginOtpSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
})

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/

export const applyJobSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Name is too long'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(6, 'Please enter a valid phone number')
    .max(20, 'Phone number is too long')
    .refine((val) => phoneRegex.test(val.replace(/\s+/g, '')), {
      message: 'Please enter a valid phone number (e.g. 017XXXXXXXX or +88017XXXXXXXX)',
    }),
  address: z.string().trim().max(200, 'Address is too long').optional(),
  github: z
    .string()
    .trim()
    .min(1, 'GitHub profile URL is required')
    .refine(
      (val) => /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?.*$/i.test(val),
      'Please enter a valid GitHub profile URL (e.g. https://github.com/username)',
    ),
  portfolio: z
    .string()
    .trim()
    .min(1, 'Portfolio URL is required')
    .refine((val) => {
      try {
        const parsed = new URL(val)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      } catch {
        return false
      }
    }, 'Please enter a valid URL including https:// or http:// (e.g. https://myportfolio.dev)'),
  linkedin: z
    .string()
    .trim()
    .min(1, 'LinkedIn profile URL is required')
    .refine(
      (val) =>
        /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+\/?.*$/i.test(val) ||
        /^https?:\/\/(www\.)?linkedin\.com\/.*$/i.test(val),
      'Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username)',
    ),
})

export const createUserInvitationSchema = z.object({
  name: z.string().min(1, 'Full name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().optional(),
  roleId: z.string().min(1, 'Please select a role'),
})

export const acceptInvitationSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const verifyJobOtpSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
  otp: z
    .string()
    .trim()
    .min(1, 'Verification code is required')
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain 6 numeric digits'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>
export type VerifyLoginOtpFormData = z.infer<typeof verifyLoginOtpSchema>
export type ResendLoginOtpFormData = z.infer<typeof resendLoginOtpSchema>
export type VerifyJobOtpFormData = z.infer<typeof verifyJobOtpSchema>
export type ApplyJobFormData = z.infer<typeof applyJobSchema>
export type CreateUserInvitationFormData = z.infer<typeof createUserInvitationSchema>
export type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>
