'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/utils'
import { HeaderMobile } from './headers/HeaderMobile'
import { FooterMobile } from './footers/FooterMobile'
import { SidebarMobile } from './sidebars/SidebarMobile'
import { useLayoutContext } from './LayoutProvider'

export default function ContainerMobile({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isSidebarOpen } = useLayoutContext()
  return (
    <div
      {...props}
      className={cn(
        'flex flex-col w-full',
        isSidebarOpen ? 'overflow-y-hidden h-[calc(100dvh-var(--header-height))]' : 'min-h-screen',
      )}
    >
      <HeaderMobile />
      <div className="relative p-4 grow flex flex-col">
        <SidebarMobile />
        <main className="grow mb-25">{children}</main>
        <FooterMobile />
      </div>
    </div>
  )
}
