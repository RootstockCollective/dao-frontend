import { FC, ReactNode } from 'react'

import { Button } from '@/components/Button'
import { InfoIconButton } from '@/components/IconButton/InfoIconButton'
import { TokenImage } from '@/components/TokenImage'
import { Header, Span } from '@/components/Typography'

interface Props {
  title: string
  amount: string
  tooltipContent?: ReactNode
  tokenSymbol?: string
  fiatAmount?: string
  buttonLabel?: string
  buttonVariant?: 'primary' | 'secondary-outline'
  onButtonClick?: () => void
}

export const RbtcVaultMetricCard: FC<Props> = ({
  title,
  amount,
  tooltipContent,
  tokenSymbol,
  fiatAmount,
  buttonLabel,
  buttonVariant = 'secondary-outline',
  onButtonClick,
}) => {
  return (
    <div className="flex flex-1 flex-col gap-5 items-start">
      <div className="flex flex-col items-start">
        <div className="flex flex-col gap-0.5 items-start">
          <div className="flex items-center gap-2 h-6">
            <Span variant="tag" className="text-bg-0">
              {title}
            </Span>
            {tooltipContent !== undefined && (
              <InfoIconButton info={tooltipContent} className="cursor-pointer" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Header variant="h3">{amount}</Header>
            {tokenSymbol && (
              <div className="flex items-center gap-1">
                <TokenImage symbol={tokenSymbol} size={16} />
                <Span variant="tag-s" bold>
                  {tokenSymbol}
                </Span>
              </div>
            )}
          </div>
        </div>
        {fiatAmount && (
          <Span variant="body-xs" bold className="text-bg-0">
            {fiatAmount}
          </Span>
        )}
      </div>
      {buttonLabel && (
        <Button variant={buttonVariant} className="py-1.5 px-2" onClick={onButtonClick}>
          <Span variant="body-s">{buttonLabel}</Span>
        </Button>
      )}
    </div>
  )
}
