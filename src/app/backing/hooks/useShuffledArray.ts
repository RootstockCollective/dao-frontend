import { useRef } from 'react'
import { seededShuffle } from '@/lib/math.utils'

export const useShuffledArray = <T>(array: T[] | undefined): T[] => {
  // Generate a random seed once per session
  const seedRef = useRef<number>(Math.floor(Math.random() * 1_000_000_000))

  if (!array) return []

  return seededShuffle(array, seedRef.current)
}
