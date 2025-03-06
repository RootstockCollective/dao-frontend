'use client'
import { usePathname } from 'next/navigation'

/**
 * Uses Strategy Algorithm to know when to render the left components which vary from page to page
 * @constructor
 */
export function TopPageHeaderLeftSlotStrategy() {
  const pathname = usePathname()
  return getLeftComponentForRoute(pathname)
}

function getLeftComponentForRoute(pathname: string) {
  const match = routePatterns.find(route => route.pattern.test(pathname))
  return match ? match.component : null
}

// Define route patterns and their components
const routePatterns = [
  { pattern: /^(\/|\/user)$/, component: null },
  { pattern: /^\/communities/, component: null },
  // Add more patterns as needed
]
