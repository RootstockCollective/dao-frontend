'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { HeaderMobile } from './headers/HeaderMobile'
import { FooterMobile } from '../Footer'
import { SidebarMobile } from './sidebars/SidebarMobile'

export default function ContainerMobile({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn('flex flex-col min-h-screen', className)}>
      <HeaderMobile />
      <div className="relative p-4 grow flex flex-col">
        <SidebarMobile />
        <main className="grow mb-25">{children}</main>
        <FooterMobile />
      </div>
    </div>
  )
}
