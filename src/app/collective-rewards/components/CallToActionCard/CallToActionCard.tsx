import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

interface CallToActionCardProps extends CommonComponentProps {
  banner?: ReactNode
  title: ReactNode
}

export const CallToActionCard: FC<CallToActionCardProps> = ({ banner, title, children, className = '' }) => {
  return (
    <div data-testid="CallToActionCard" className={cn('flex flex-col flex-1 rounded-sm', className)}>
      {banner}
      {title}
      {children}
    </div>
  )
}
