import { type RefObject, useLayoutEffect, useState } from 'react'

/**
 * `inert` for a control that hides while it may hold the focus.
 *
 * Making a focused element inert drops the focus to the page, so the next Tab starts over from the
 * top. When `isHidden` turns true with the focus inside `containerRef`, the focus first moves to
 * `getTarget(focused)`, the control that takes over the same action, and only then does the
 * container go inert. Both happen before the browser paints.
 */
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
    // getTarget is only read at the moment isHidden flips
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHidden])

  return isInert
}
