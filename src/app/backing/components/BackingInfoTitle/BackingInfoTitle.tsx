import { Button } from '@/components/ButtonNew'
import { Span } from '@/components/TypographyNew'
import { Typography } from '@/components/TypographyNew/Typography'
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
      <Typography className="text-v3-text-100">
        {isConnected && <Span className="font-bold">You are not backing any Builders yet. </Span>}
        <Span>Use your stRIF backing power to support the Builders you believe in.</Span>
      </Typography>

      {isConnected && hasAllocations && (
        <Button variant="primary" className="shrink-0 ml-auto">
          See all Builders
        </Button>
      )}
    </div>
  )
}
