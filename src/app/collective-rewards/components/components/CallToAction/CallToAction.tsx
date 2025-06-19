import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

interface CallToActionProps extends CommonComponentProps {
  banner?: ReactNode
  title: ReactNode
}

export const CallToAction: FC<CallToActionProps> = ({ banner, title, children, className = '' }) => {
  return (
    <div data-testid="CallToAction" className={cn('flex flex-col bg-v3-text-80', className)}>
      {banner}
      {title}
      {children}
    </div>
  )
}
