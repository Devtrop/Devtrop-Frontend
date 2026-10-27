/**
 * Helper to construct full image URLs from backend responses
 * Handles both absolute URLs (R2 CDN) and relative paths (local uploads)
 */

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=600&fit=crop'

export function getImageUrl(imageUrl?: string | null, placeholder = PLACEHOLDER_IMAGE): string {
  // No image URL provided, use placeholder
  if (!imageUrl || imageUrl.trim() === '') {
    return placeholder
  }

  // Already an absolute URL (starts with http:// or https://)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  // Relative path from backend - construct full URL
  // Backend might return: "blog/featured-images/xxx.png"
  // Or: "/blog/featured-images/xxx.png"

  // Get backend URL from environment
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

  // Remove leading slash if present to avoid double slashes
  const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl

  return `${backendUrl}/${cleanPath}`
}

export function getBlogCardImageUrl(imageUrl?: string | null): string {
  return getImageUrl(
    imageUrl,
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop',
  )
}

export function getBlogDetailImageUrl(imageUrl?: string | null): string {
  return getImageUrl(
    imageUrl,
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=600&fit=crop',
  )
}
