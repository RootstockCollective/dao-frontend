import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { Card } from './cards'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  card: Card
}

export function Card({ card, className, ...props }: CardProps) {
  return (
    <div className={cn(className, 'w-[348px] h-[582px] p-2 bg-[#1A1A1A]')} {...props}>
      Card
    </div>
  )
}
