import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Span } from '@/components/Typography'
import { FiatSymbol, TokenSymbol } from '@/lib/tokens'
import { FC, ReactNode } from 'react'
import { KotoQuestionMarkIcon } from '../Icons'
import { Tooltip } from '../Tooltip'

interface Props {
  amount: ReactNode
  symbol?: TokenSymbol | FiatSymbol
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
            <KotoQuestionMarkIcon className="mb-1 hover:cursor-help" data-testid="TooltipIcon" />
          </Tooltip>
        )}
      </div>

      <div className="flex items-center flex-row gap-2 md:mt-2 mt-4">
        <Header
          variant="h1"
          className="flex items-end flex-row gap-2 !leading-none"
          data-testid={`Amount-${symbol}`}
        >
          {amount}
        </Header>
        {symbol ? (
          <div className="flex items-center flex-row gap-1">
            <TokenImage symbol={symbol as TokenSymbol} size={24} />
            <Span variant="body-l" bold>
              {symbol}
            </Span>
          </div>
        ) : null}
      </div>
      {fiatAmount && (
        <Label variant="body-s" className="text-bg-0" bold data-testid={`FiatAmount-${symbol}`}>
          {fiatAmount}
        </Label>
      )}
    </div>
  )
}
