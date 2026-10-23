'use client'

import { useRef } from 'react'

import { cn } from '@/lib/utils'
import { useInertHandoff } from '@/shared/hooks/useInertHandoff'
import { UserConnectionManager } from '@/shared/walletConnection'

import { useTopBarDock } from './TopBarDockProvider'

interface TopBarConnectProps {
  className?: string
  showContent?: boolean
}

/**
 * The top bar's Connect Wallet. While a page has its prompt docked under the bar it fades out
 * and goes inert, handing the focus to the docked prompt, so there is never two Connect buttons.
 */
export function TopBarConnect({ className, showContent }: TopBarConnectProps) {
  const { isDocked, slot } = useTopBarDock()
  const connectRef = useRef<HTMLDivElement>(null)
  const isInert = useInertHandoff(isDocked, connectRef, () => slot?.querySelector('button'))

  return (
    <UserConnectionManager
      className={cn(
        'transition-opacity duration-240 ease-out-cubic',
        isDocked && 'pointer-events-none opacity-0',
        className,
      )}
      ref={connectRef}
      inert={isInert}
      showContent={showContent}
    />
  )
}

/** Where a page portals its docked prompt. Hangs below the top bar row instead of growing it. */
export function TopBarDockSlot({ className }: { className?: string }) {
  const { setSlot } = useTopBarDock()
  return <div ref={setSlot} className={cn('absolute inset-x-0 top-full bg-l-black', className)} />
}
