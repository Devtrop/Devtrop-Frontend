const API_BASE_URL =
  typeof window !== 'undefined'
    ? '/api/v1'
    : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'

export interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export interface ContactResponse {
  success: boolean
  message: string
}

interface ApiErrorBody {
  message?: string | string[]
  error?: string
}

export async function submitContactForm(data: ContactFormData): Promise<ContactResponse> {
  try {
    const url = `${API_BASE_URL}/contact`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    // Get response text first
    const text = await response.text()

    // Try to parse JSON response
    let errorBody: ApiErrorBody | null = null
    const isJson = response.headers.get('content-type')?.includes('application/json')
    if (isJson) {
      try {
        errorBody = JSON.parse(text) as ApiErrorBody
      } catch {
        errorBody = null
      }
    }

    if (!response.ok) {
      // Extract error message from backend
      let errorMsg: string

      if (errorBody?.message) {
        errorMsg =
          typeof errorBody.message === 'string'
            ? errorBody.message
            : Array.isArray(errorBody.message)
              ? errorBody.message.join(', ')
              : String(errorBody.message)
      } else if (errorBody?.error) {
        errorMsg = errorBody.error
      } else if (text.trim()) {
        errorMsg = text
      } else if (response.status === 400) {
        errorMsg = 'Required at least 5 characters'
      } else if (response.status >= 500) {
        errorMsg = `Backend server error (${response.status}). Please try again later.`
      } else {
        errorMsg = `Server error: ${response.status}`
      }

      throw new Error(errorMsg)
    }

    return {
      success: true,
      message: typeof errorBody?.message === 'string' ? errorBody.message : 'Success',
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to submit contact form. Please try again.')
  }
}
