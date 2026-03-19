import { ReactNode } from 'react'

import SeparatorBar from '@/components/SeparatorBar/SeparatorBar'
import { TokenImage } from '@/components/TokenImage'
import { Header, HeaderVariants, Label, Span } from '@/components/Typography'

import { KotoQuestionMarkIcon } from '../Icons'
import { Tooltip } from '../Tooltip'

interface Props {
  amount: ReactNode
  symbol?: string
  title?: string
  tooltipContent?: ReactNode
  fiatAmount?: ReactNode
  headerVariant?: HeaderVariants
  /** Optional second value shown after a vertical separator (e.g. "99.99%" for TVL). Same visual weight as primary amount. */
  secondaryValue?: ReactNode
  'data-testid'?: string
  className?: string
}

export const BalanceInfo = ({
  title,
  tooltipContent,
  amount,
  symbol,
  fiatAmount,
  secondaryValue,
  headerVariant = 'h1',
  'data-testid': dataTestId = 'BalanceInfo',
  className,
}: Props) => {
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
          variant={headerVariant}
          className="flex items-end flex-row gap-2 leading-none!"
          data-testid={`Amount-${symbol}`}
        >
          {amount}
        </Header>
        {symbol ? (
          <div className="flex items-center flex-row gap-1">
            <TokenImage symbol={symbol} size={24} />
            <Span variant="body-l" bold>
              {symbol}
            </Span>
          </div>
        ) : null}
        {secondaryValue != null && secondaryValue !== '' && (
          <>
            <SeparatorBar className="shrink-0 mx-1" aria-hidden />
            <Header variant="h1" className="leading-none!" data-testid="SecondaryValue">
              {secondaryValue}
            </Header>
          </>
        )}
      </div>
      {fiatAmount && (
        <Label variant="body-s" className="text-bg-0" bold data-testid={`FiatAmount-${symbol}`}>
          {fiatAmount}
        </Label>
      )}
    </div>
  )
}
