import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { FC } from 'react'

export const DottedUnderlineLabel: FC<CommonComponentProps> = ({ className = '', children }) => {
  return (
    <span className={cn('underline decoration-dotted decoration-[0.2rem] underline-offset-4', className)}>
      {children}
    </span>
  )
}
