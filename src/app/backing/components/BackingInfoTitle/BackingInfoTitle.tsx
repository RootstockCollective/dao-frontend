import { Button } from '@/components/Button'
import { Paragraph, Span } from '@/components/Typography'
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
    <div className={cn('flex flex-row gap-3', className)}>
      <Paragraph variant="body">
        {isConnected && <Span bold>You are not backing any Builders yet. </Span>}
        Use your stRIF backing power to support the Builders you believe in.
      </Paragraph>

      {isConnected && hasAllocations && (
        <Button variant="primary" className="shrink-0 ml-auto">
          See all Builders
        </Button>
      )}
    </div>
  )
}
