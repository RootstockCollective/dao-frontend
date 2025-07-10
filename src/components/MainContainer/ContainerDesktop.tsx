'use client'

import { HTMLAttributes } from 'react'
import { useAlertContext } from '@/app/providers'
import { FooterDesktop } from './footers/FooterDesktop'
import { TopPageHeader } from '@/shared/walletConnection/components/topPageHeader/TopPageHeader'
import { SidebarDesktop } from './sidebars/SidebarDesktop'
import { Alert } from '../Alert'
import { HeaderDesktop } from './headers/HeaderDesktop'
import { cn } from '@/lib/utils'
import { BottomDrawer } from './drawers/BottomDrawer'
import { MAIN_CONTAINER_ID } from '@/lib/constants'
import { useLayoutContext } from './LayoutProvider'
import { AnimatePresence } from 'motion/react'

export const MAIN_CONTAINER_MAX_WIDTH = '1440px'
export function ContainerDesktop({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { message, setMessage } = useAlertContext()
  const { subfooter } = useLayoutContext()

  return (
    <div
      {...props}
      className={cn('flex min-h-screen mx-auto', className)}
      style={{ maxWidth: MAIN_CONTAINER_MAX_WIDTH }}
    >
      <SidebarDesktop />
      {/* Central section */}
      <div className="grow flex flex-col">
        <HeaderDesktop />
        <div className="grow flex flex-col">
          <div className="flex flex-1 flex-col mt-10" id={MAIN_CONTAINER_ID}>
            <main className="p-8 mb-25 grow">
              {message && (
                <Alert {...message} onDismiss={message.onDismiss === null ? null : () => setMessage(null)} />
              )}
              <TopPageHeader />
              {children}
            </main>
            <BottomDrawer />
            <FooterDesktop />
            <AnimatePresence>{subfooter}</AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
