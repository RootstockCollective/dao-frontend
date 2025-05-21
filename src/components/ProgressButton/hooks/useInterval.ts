import { useState, useEffect } from 'react'

/**
 * Custom hook to handle interval-based state toggle.
 * @param duration Duration between toggles in ms
 * @returns boolean indicating current toggle state
 */
export const useInterval = (duration: number): boolean => {
  const [state, setState] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => !prev)
    }, duration)

    return () => clearInterval(interval)
  }, [duration])

  return state
}
