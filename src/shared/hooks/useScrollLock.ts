import { useEffect } from 'react'

/**
 * Disables page scrolling when `isOpen` is true and restores it when `isOpen` is false or on unmount.
 *
 * @param isOpen - Whether the scroll lock should be active
 */
export function useScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [isOpen])
}
