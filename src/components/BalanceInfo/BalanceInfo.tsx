import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Span } from '@/components/TypographyNew'
import { FC, ReactNode } from 'react'
import { Tooltip } from '../Tooltip'
import { KotoQuestionMarkIcon } from '../Icons'

interface Props {
  amount: ReactNode
  symbol: string
  title?: string
  tooltipContent?: ReactNode
  fiatAmount?: ReactNode
  'data-testid'?: string
  className?: string
}

export const BalanceInfo: FC<Props> = ({
  title,
  tooltipContent,
  amount,
  symbol,
  fiatAmount,
  'data-testid': dataTestId = 'BalanceInfo',
  className,
}) => {
  return (
    <div className={className} data-testid={dataTestId}>
      <div className="flex items-center flex-row gap-2">
        {title && (
          <Label variant="tag" className="text-bg-0" data-testid="Title">
            {title}
          </Label>
        )}

        {tooltipContent && (
          <Tooltip text={tooltipContent}>
            <KotoQuestionMarkIcon className="mb-1 hover:cursor-help" />
          </Tooltip>
        )}
      </div>

      <div className="flex items-end flex-row gap-2 mt-2">
        <Header variant="h1" data-testid="Amount" className="flex items-end flex-row gap-2">
          {amount}
        </Header>
        <div className="flex items-center flex-row gap-1">
          <TokenImage symbol={symbol} size={24} />{' '}
          <Span variant="body-l" bold>
            {symbol}
          </Span>
        </div>
      </div>
      {fiatAmount && (
        <Label variant="body-s" className="text-bg-0" bold data-testid="FiatAmount">
          {fiatAmount}
        </Label>
      )}
    </div>
  )
}
