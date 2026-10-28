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

    // Check if it's JSON
    if (response.headers.get('content-type')?.includes('application/json')) {
      try {
        const result = JSON.parse(text)

        if (!response.ok) {
          // Extract error message from backend
          const errorMsg = result.message || result.error || `Server error: ${response.status}`
          throw new Error(errorMsg)
        }

        return result
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message.includes('Server error')) {
          throw parseError
        }
        throw new Error('Invalid response from server')
      }
    } else {
      // Not JSON - backend error
      let errorMessage = 'Backend error occurred'

      if (text.includes('Cannot POST')) {
        errorMessage = 'Contact endpoint not found. Please ensure the backend is running.'
      } else if (response.status === 404) {
        errorMessage = 'Contact endpoint not found (404).'
      } else if (response.status >= 500) {
        errorMessage = `Backend server error (${response.status}). Please try again later.`
      } else if (response.status === 405) {
        errorMessage = 'Method not allowed.'
      }

      throw new Error(errorMessage)
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to submit contact form. Please try again.')
  }
}
