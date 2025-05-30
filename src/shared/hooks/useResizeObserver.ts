import { useEffect, useState, RefObject } from 'react'

interface UseResizeObserverOptions {
  /** Initial width value */
  initialWidth?: number
  /** Initial height value */
  initialHeight?: number
}

/**
 * Hook that observes the size of an element using ResizeObserver
 * @returns Current width and height of the observed element
 */
export function useResizeObserver<T extends Element | null>(
  ref: RefObject<T>,
  options: UseResizeObserverOptions = {},
) {
  const { initialWidth = 0, initialHeight = 0 } = options
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  })

  useEffect(() => {
    if (!ref.current) return

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    resizeObserver.observe(ref.current)
    return () => resizeObserver.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return dimensions
}
