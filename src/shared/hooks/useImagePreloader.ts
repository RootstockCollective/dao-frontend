import { useEffect, useState } from 'react'

/**
 * Hook to preload multiple images and track loading state
 * @param imagePaths - Array of image paths to preload
 * @returns Object containing loading state and error state
 */
export function useImagePreloader(imagePaths: string[]) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!imagePaths.length) {
      setIsLoaded(true)
      return
    }

    let loadedCount = 0
    const totalImages = imagePaths.length

    const handleLoad = () => {
      if (++loadedCount === totalImages) {
        setIsLoaded(true)
      }
    }

    const handleError = (err: Error) => {
      setError(err)
      // Still increment count to prevent infinite loading
      if (++loadedCount === totalImages) {
        setIsLoaded(true)
      }
    }

    setIsLoaded(false)
    setError(null)

    imagePaths.forEach(path => {
      const image = new window.Image()
      image.onload = handleLoad
      image.onerror = () => handleError(new Error(`Failed to load image: ${path}`))
      image.src = path
    })
  }, [imagePaths])

  return { isLoaded, error }
}
