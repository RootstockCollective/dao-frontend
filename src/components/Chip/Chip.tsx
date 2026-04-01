import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  className?: string
  onClick?: () => void
}
export const Chip = ({ children, className, onClick }: Props) => (
  <div
    className={cn('rounded-[30px] py-[4px] px-[12px] inline-flex items-center gap-[4px]', className)}
    onClick={onClick}
  >
    {children}
  </div>
)
