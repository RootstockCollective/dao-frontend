import type { MouseEvent } from 'react'

const NAV_THROTTLE_MS = 700
let lastNavAt = 0

// Module-level timestamp shared by desktop and mobile sidebar MenuItems, prevents bursts of navigations that trigger the AWS WAF rate-limit.
export function throttleNav(e: MouseEvent) {
  const now = Date.now()
  if (now - lastNavAt < NAV_THROTTLE_MS) {
    e.preventDefault()
    e.stopPropagation()
    return
  }
  lastNavAt = now
}
