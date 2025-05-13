'use client'

import { HTMLAttributes } from 'react'
import { useAlertContext } from '@/app/providers'
import { FooterDesktop } from '@/components/Footer'
import { TopPageHeader } from '@/shared/walletConnection/components/topPageHeader/TopPageHeader'
import { SidebarDesktop } from '../LeftSidebar/SidebarDesktop'
import { Alert } from '../Alert'
import { HeaderDesktop } from './HeaderDesktop'
import Scroll from '@/components/Scroll'
import { cn } from '@/lib/utils'

export function ContainerDesktop({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { message, setMessage } = useAlertContext()
  return (
    <div {...props} className={cn('flex min-h-screen max-w-6xl mx-auto', className)}>
      <SidebarDesktop />
      {/* Central section */}
      <div className="grow flex flex-col">
        <HeaderDesktop />
        <div className="grow flex flex-col">
          <Scroll />
          <div className="flex flex-1 flex-col justify-between overflow-y-auto mt-10" id="main-container">
            <main className="p-8 mb-25">
              {message && (
                <Alert {...message} onDismiss={message.onDismiss === null ? null : () => setMessage(null)} />
              )}
              <TopPageHeader />
              {children}
            </main>
            <FooterDesktop variant="container" />
          </div>
        </div>
      </div>
    </div>
  )
}
