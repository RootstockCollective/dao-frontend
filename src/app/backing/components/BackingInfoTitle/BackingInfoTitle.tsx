import { Span } from '@/components/TypographyNew'
import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { FC } from 'react'

interface BackingInfoTitleProps extends CommonComponentProps {
  hasAllocations: boolean
  isConnected: boolean
}

export const BackingInfoTitle: FC<BackingInfoTitleProps> = ({
  hasAllocations,
  isConnected,
  className = '',
}) => {
  return (
    <div className={cn(className)}>
      {isConnected && !hasAllocations && (
        <Span className="font-bold">You are not backing any Builders yet. </Span>
      )}
      <Span>Use your stRIF backing power to support the Builders you believe in.</Span>
    </div>
  )
}
