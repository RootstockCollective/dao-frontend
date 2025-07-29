import { useCallback, useEffect, useRef } from 'react'

interface UseInactivityTimeoutOptions {
  condition: boolean
  onInactive: () => void
  timeout?: number
  throttleDelay?: number
}

export function useInactivityTimeout({
  condition,
  onInactive,
  timeout = 1500,
  throttleDelay = 300,
}: UseInactivityTimeoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastCallTimeRef = useRef<number>(0)

  const reset = useCallback(() => {
    if (!condition) return

    const now = Date.now()
    if (now - lastCallTimeRef.current < throttleDelay) return
    lastCallTimeRef.current = now

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      onInactive()
    }, timeout)
  }, [condition, onInactive, timeout, throttleDelay])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return reset
}
