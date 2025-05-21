import { useState, useEffect } from 'react'

interface ProgressState {
  progress: number
  flip: boolean
}

/**
 * Custom hook to handle progress animation and flipping effect.
 * @param animationDuration in ms
 * @param flipDuration in ms
 * @returns { progress: number; flip: boolean }
 */
export const useProgressAnimation = (animationDuration: number, flipDuration: number): ProgressState => {
  const [progress, setProgress] = useState(0)
  const [flip, setFlip] = useState(false)

  useEffect(() => {
    let animationFrameId: number
    let startTime: number | null = null

    const animate = (time: number) => {
      if (!startTime) startTime = time
      const elapsed = time - startTime
      const newProgress = Math.min(100, (elapsed / animationDuration) * 100)
      setProgress(newProgress)
      animationFrameId = requestAnimationFrame(animate)
      if (elapsed >= animationDuration) {
        startTime = null
        setProgress(0)
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    const flipInterval = setInterval(() => {
      setFlip(prev => !prev)
    }, flipDuration)

    return () => {
      cancelAnimationFrame(animationFrameId)
      clearInterval(flipInterval)
    }
  }, [animationDuration, flipDuration])

  return { progress, flip }
}
