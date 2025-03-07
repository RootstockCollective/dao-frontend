'use client'
import { usePathname } from 'next/navigation'
import { getLeftComponentForRoute } from '@/lib/walletConnection/utils'

/**
 * Uses Strategy Algorithm to know when to render the left components which vary from page to page
 * @constructor
 */
export function TopPageHeaderLeftSlotStrategy() {
  const pathname = usePathname()
  return getLeftComponentForRoute(pathname)
}
