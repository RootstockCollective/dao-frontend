'use client'

import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

export default function ContainerMobile({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn('', className)}>
      Mobile Container
      {children}
    </div>
  )
}
