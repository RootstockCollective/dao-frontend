'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { HeaderMobile } from './HeaderMobile'
import { FooterMobile } from '../Footer'

export default function ContainerMobile({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn('flex flex-col min-h-screen', className)}>
      <HeaderMobile />
      <div className="p-4 grow flex flex-col">
        <main className="grow mb-25">{children}</main>
        <FooterMobile />
      </div>
    </div>
  )
}
