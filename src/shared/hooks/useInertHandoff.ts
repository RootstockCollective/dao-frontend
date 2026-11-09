import { type RefObject, useLayoutEffect, useState } from 'react'

export const useInertHandoff = (
  isHidden: boolean,
  containerRef: RefObject<HTMLElement | null>,
  getTarget: (focused: HTMLElement) => HTMLElement | null | undefined,
) => {
  const [isInert, setIsInert] = useState(isHidden)

  useLayoutEffect(() => {
    const focused = document.activeElement
    if (isHidden && focused instanceof HTMLElement && containerRef.current?.contains(focused)) {
      getTarget(focused)?.focus({ preventScroll: true })
    }
    setIsInert(isHidden)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHidden])

  return isInert
}
