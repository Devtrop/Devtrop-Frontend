/**
 * src/data/auth.ts
 *
 * Decoupled content layer for the Devtrop console sign-in page.
 * Swiss-international voice: uppercase labels, mono metadata, no marketing
 * claims — every line describes how authentication actually works.
 */

export interface AuthMetaItem {
  label: string
  value: string
}

export interface AuthStepCopy {
  step: string
  status: string
  title: string
  subtitle: string
  submit: string
  submitting: string
}

export interface LoginPageContent {
  eyebrow: string
  brandSuffix: string
  footerNote: string
  titleLines: string[]
  description: string
  meta: AuthMetaItem[]
  support: {
    label: string
    description: string
    cta: string
  }
  form: {
    credentials: AuthStepCopy & {
      emailLabel: string
      emailPlaceholder: string
      passwordLabel: string
      passwordPlaceholder: string
      showPassword: string
      hidePassword: string
    }
    otp: AuthStepCopy & {
      otpLabel: string
      resend: string
      resending: string
      resendIn: string
      back: string
      note: string
    }
    securityNote: string
    trouble: {
      label: string
      cta: string
    }
    errors: {
      generic: string
      credentials: string
      otp: string
      accountInactive: string
      accountSuspended: string
      accountDeleted: string
    }
    notices: {
      otpSent: string
      signedIn: string
      resent: string
    }
  }
}

export const LOGIN_PAGE_CONTENT: LoginPageContent = {
  eyebrow: 'SECURE ACCESS',
  brandSuffix: 'CONSOLE / 01',
  footerNote: 'Devtrop console — authorised access only',
  titleLines: ['Client', 'Console.'],
  description:
    'Sign in to review project builds, sprint walkthroughs, and delivery records held in your Devtrop workspace.',
  meta: [
    { label: 'AUTHENTICATION', value: 'EMAIL + 6-DIGIT OTP' },
    { label: 'ACCESS MODEL', value: 'PROVISIONED BY INVITE' },
    { label: 'SESSION', value: 'SHORT-LIVED TOKEN' },
  ],
  support: {
    label: 'NEED ACCESS?',
    description:
      'Console accounts are provisioned by the engineering team. Ask your project lead, or request access directly.',
    cta: 'Request access',
  },
  form: {
    credentials: {
      step: 'STEP 01 / 02',
      status: 'CREDENTIAL CHECK',
      title: 'Sign in',
      subtitle: 'Use the email address your workspace was provisioned under.',
      emailLabel: 'Email address',
      emailPlaceholder: 'you@company.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      submit: 'Continue',
      submitting: 'Checking credentials',
    },
    otp: {
      step: 'STEP 02 / 02',
      status: 'TWO-STEP VERIFICATION',
      title: 'Verify your identity',
      subtitle: 'Enter the 6-digit code sent to',
      otpLabel: '6-digit verification code',
      submit: 'Verify and sign in',
      submitting: 'Verifying code',
      resend: 'Resend code',
      resending: 'Sending',
      resendIn: 'Resend in',
      back: 'Back to credentials',
      note: 'The code expires after 5 minutes. Check your spam folder if it has not arrived.',
    },
    securityNote: 'Every console account is protected by two-step email verification.',
    trouble: {
      label: 'Trouble signing in?',
      cta: 'Contact the engineering team',
    },
    errors: {
      generic: 'Unable to sign in right now. Please try again.',
      credentials: 'That email and password combination did not work.',
      otp: 'That code did not match. Check the digits and try again.',
      accountInactive: 'This account is inactive. Contact your administrator to restore access.',
      accountSuspended:
        'This account has been suspended. Contact your administrator for assistance.',
      accountDeleted: 'This account is no longer available.',
    },
    notices: {
      otpSent: 'A 6-digit verification code is on its way to your inbox.',
      signedIn: 'Signed in. Opening your console…',
      resent: 'A fresh verification code was sent to your email.',
    },
  },
}
