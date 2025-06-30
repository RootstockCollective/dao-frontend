import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

interface CallToActionCardProps extends CommonComponentProps {
  banner?: ReactNode
  title: ReactNode
}

export const CallToActionCard: FC<CallToActionCardProps> = ({ banner, title, children, className = '' }) => {
  return (
    <div data-testid="CallToActionCard" className={cn('flex flex-col bg-v3-text-80 flex-1', className)}>
      {banner}
      {title}
      {children}
    </div>
  )
}
