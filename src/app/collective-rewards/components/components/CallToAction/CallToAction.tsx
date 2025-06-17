import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

interface CallToActionProps extends CommonComponentProps {
  banner?: ReactNode
  title: ReactNode
  content: ReactNode
}

export const CallToAction: FC<CallToActionProps> = ({ banner, title, content, className = '' }) => {
  return (
    <div data-testid="CallToAction" className={cn('flex flex-col bg-v3-text-80', className)}>
      {banner && banner}
      {title}
      {content}
    </div>
  )
}
