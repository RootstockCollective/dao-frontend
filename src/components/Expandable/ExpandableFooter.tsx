'use client'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

// Footer section (always visible)
interface Props {
  children: ReactNode
  className?: string
}

export const ExpandableFooter: FC<Props> = ({ children, className }) => {
  return <div className={cn('flex flex-col', className)}>{children}</div>
}
