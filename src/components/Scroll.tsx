'use client'
import { MAIN_CONTAINER_ID } from '@/lib/constants'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Dirty component to solve the issue of page not scrolling to the top of the page when clicking a <Link> from Next.js.
 * There are discussions on how to solve this issue in the Next.js repo.
 * https://github.com/vercel/next.js/discussions/64435
 * @constructor
 */
export default function Scroll() {
  // when clicking a link, user will not scroll to the top of the page if the header is sticky.
  // their current scroll position will persist to the next page.
  // this useEffect is a workaround to 'fix' that behavior.

  const pathname = usePathname()
  useEffect(() => {
    window.document.getElementById(MAIN_CONTAINER_ID)?.scrollTo(0, 0)
  }, [pathname])
  return <></>
}
