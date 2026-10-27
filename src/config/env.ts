import { z } from 'zod'

const isServer = typeof window === 'undefined'

const envSchema = z.object({
  BACKEND_BASE_URL: z.string().default('http://localhost:5000/api/v1'),
  NEXT_PUBLIC_SITE_URL: z.string().default('http://localhost:3000'),
})

function parseEnv() {
  try {
    return envSchema.parse({
      BACKEND_BASE_URL: (process.env.BACKEND_BASE_URL || 'http://localhost:5000/api/v1').replace(
        /\/+$/,
        '',
      ),
      NEXT_PUBLIC_SITE_URL: (
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      ).replace(/\/+$/, ''),
    })
  } catch (error) {
    console.error('Environment validation error:', error)
    // Return defaults on error
    return {
      BACKEND_BASE_URL: 'http://localhost:5000/api/v1',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    }
  }
}

export const env = parseEnv() as {
  BACKEND_BASE_URL: string
  NEXT_PUBLIC_SITE_URL: string
}
