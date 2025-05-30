import { useState, useEffect } from 'react'

/**
 * Custom hook to handle progress animation.
 * @param duration in ms
 * @returns progress percentage (0-100)
 */
export const useProgressAnimation = (duration: number): number => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let animationFrameId: number
    let startTime: number | null = null

    const animate = (time: number) => {
      if (!startTime) startTime = time
      const elapsed = time - startTime
      const newProgress = Math.min(100, (elapsed / duration) * 100)
      setProgress(newProgress)
      animationFrameId = requestAnimationFrame(animate)
      if (elapsed >= duration) {
        startTime = null
        setProgress(0)
      }
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [duration])

  return progress
}
