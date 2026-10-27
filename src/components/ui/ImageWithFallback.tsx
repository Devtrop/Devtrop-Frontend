'use client'

import { useState } from 'react'

interface ImageWithFallbackProps {
  src?: string
  fallbackSrc: string
  alt: string
  className?: string
  width?: number
  height?: number
  loading?: 'eager' | 'lazy'
  decoding?: 'sync' | 'async' | 'auto'
}

export function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  className,
  width,
  height,
  loading,
  decoding,
}: ImageWithFallbackProps) {
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc)

  const handleError = () => {
    setImageSrc((currentSrc) => {
      if (currentSrc === fallbackSrc) {
        return currentSrc
      }

      return fallbackSrc
    })
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      onError={handleError}
    />
  )
}
