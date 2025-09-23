import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { FC } from 'react'

export const DottedUnderlineLabel: FC<CommonComponentProps> = ({ className = '', children }) => {
  return (
    <span
      className={cn('relative inline-block', className)}
      style={{
        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
        backgroundSize: '6px 6px',
        backgroundPosition: '0 calc(100% - 2px)',
        backgroundRepeat: 'repeat-x',
        paddingBottom: '4px',
      }}
    >
      {children}
    </span>
  )
}
