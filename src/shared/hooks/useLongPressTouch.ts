import { useCallback, useRef } from 'react'

type Options = {
  onLongPress: (e: React.TouchEvent) => void
  threshold?: number
  moveTolerance?: number // cancel if finger drifts too far
}

const DEFAULT_THRESHOLD_MS = 500
const DEFAULT_MOVE_TOLERANCE_PX = 10

export function useLongPressTouch({
  onLongPress,
  threshold = DEFAULT_THRESHOLD_MS,
  moveTolerance = DEFAULT_MOVE_TOLERANCE_PX,
}: Options) {
  const timerRef = useRef<number | null>(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const fired = useRef(false)

  const clear = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 0) {
        return
      }
      const t = e.touches[0]
      startX.current = t.clientX
      startY.current = t.clientY
      fired.current = false

      // Optional: reduce browser gestures (works best when passive:false on listener)
      // e.preventDefault();

      timerRef.current = window.setTimeout(() => {
        fired.current = true
        onLongPress(e)
      }, threshold)
    },
    [onLongPress, threshold],
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 0) {
        return
      }
      const t = e.touches[0]
      const dx = t.clientX - startX.current
      const dy = t.clientY - startY.current
      if (Math.hypot(dx, dy) > moveTolerance) {
        clear() // cancel if user drags too far
      }
    },
    [clear, moveTolerance],
  )

  const onTouchEnd = useCallback(() => {
    // If released before threshold, do nothing (short tap)
    if (!fired.current) clear()
  }, [clear])

  const onTouchCancel = useCallback(() => {
    clear()
  }, [clear])

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel }
}
