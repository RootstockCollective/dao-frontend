import { RefObject, useEffect } from 'react'

export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  refs: RefObject<T | null> | Array<RefObject<T | null>> | null,
  handleOnClickOutside: (event: MouseEvent | TouchEvent) => void,
) => {
  useEffect(() => {
    const refArray = Array.isArray(refs) ? refs : [refs]

    const listener = (event: MouseEvent | TouchEvent) => {
      const isInside = refArray.some(ref => ref?.current && ref.current.contains(event.target as Node))
      if (isInside) return
      handleOnClickOutside(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [refs, handleOnClickOutside])
}
