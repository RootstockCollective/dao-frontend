'use client'

import { HTMLAttributes } from 'react'

import { MAIN_CONTAINER_ID } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { TopPageHeader } from '@/shared/walletConnection/components/topPageHeader'

import { BottomDrawer } from './drawers/BottomDrawer'
import { FooterDesktop } from './footers/FooterDesktop'
import { HeaderDesktop } from './headers/HeaderDesktop'
import { SidebarDesktop } from './sidebars/SidebarDesktop'

export const MAIN_CONTAINER_MAX_WIDTH = '1440px'
export function ContainerDesktop({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn('flex min-h-screen mx-auto', className)}
      style={{ maxWidth: MAIN_CONTAINER_MAX_WIDTH }}
    >
      <SidebarDesktop />
      {/* Central section */}
      <div className="grow flex flex-col overflow-x-hidden">
        <HeaderDesktop />
        <div className="grow flex flex-col pb-24">
          <div className="flex flex-1 flex-col mt-10" id={MAIN_CONTAINER_ID}>
            <main className="p-8 mb-25 grow">
              <TopPageHeader />
              {children}
            </main>
            <BottomDrawer />
            <FooterDesktop />
          </div>
        </div>
      </div>
    </div>
  )
}
