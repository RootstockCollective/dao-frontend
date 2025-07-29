import { useCallback, useEffect, useMemo, useRef } from 'react'

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
  const start = useCallback(() => {
    if (!condition) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      onInactive()
    }, timeout)
  }, [condition, onInactive, timeout])

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const throttledStart = useMemo(() => {
    let timeoutId: NodeJS.Timeout | null = null
    return () => {
      if (timeoutId) return
      timeoutId = setTimeout(() => {
        timeoutId = null
        start()
      }, throttleDelay)
    }
  }, [start, throttleDelay])

  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  return { start: throttledStart, cancel }
}
