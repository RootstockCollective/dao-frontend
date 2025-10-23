'use client'

import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { HeaderMobile } from './headers/HeaderMobile'
import { FooterMobile } from './footers/FooterMobile'
import { SidebarMobile } from './sidebars/SidebarMobile'
import { useLayoutContext } from './LayoutProvider'
import { BottomDrawer } from '@/components/MainContainer/drawers/BottomDrawer'
import { TopPageHeader } from '@/shared/walletConnection/components/topPageHeader/TopPageHeader'
import { MAIN_CONTAINER_ID } from '@/lib/constants'

export default function ContainerMobile({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isSidebarOpen } = useLayoutContext()
  return (
    <div
      {...props}
      className={cn(
        'flex flex-col w-full',
        isSidebarOpen ? 'overflow-hidden h-[calc(100dvh-var(--header-height))]' : 'min-h-screen',
      )}
    >
      <HeaderMobile />
      <div className="relative px-4 grow flex flex-col" id={MAIN_CONTAINER_ID}>
        <SidebarMobile />
        <main className="grow mb-8">
          <TopPageHeader />
          {children}
        </main>
        <BottomDrawer />
        <FooterMobile />
      </div>
    </div>
  )
}
