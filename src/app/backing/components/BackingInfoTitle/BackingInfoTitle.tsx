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
      <Span>Support innovative Builders by allocating your stRIF to those you align with.</Span>
    </div>
  )
}
