import { TokenImage } from '@/components/TokenImage'
import { Header, Label } from '@/components/Typography'
import { RBTC, USD } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'
import { ReactElement } from 'react'
import { MetricToken } from './types'

export type MetricTooltipContentProps = {
  tokens: Array<MetricToken & { fade?: boolean }>
}

export const MetricTooltipContent = ({ tokens }: MetricTooltipContentProps): ReactElement => {
  const tokenCount = tokens.length

  if (!tokenCount) {
    return <></>
  }

  return (
    <div className={`grid grid-rows-${tokenCount} p-4 items-start gap-2 rounded-sm bg-v3-text-80`}>
      {tokens.map(({ symbol, value, fiatValue, fade }) => (
        <div key={symbol} className={cn('grid grid-cols-2 gap-x-2 content-center', fade && 'opacity-40')}>
          {/* Crypto Value Row */}
          <Header
            variant="h3"
            className="text-v3-text-0 leading-[128%] font-normal self-start justify-self-end"
          >
            {value}
          </Header>
          <div className="flex pl-[0.0625rem] items-center gap-[0.1875rem]">
            <TokenImage symbol={symbol} size={symbol === RBTC ? 20 : 16} />
            {/* FIXME: someone should really fix the inconsistenct sizes of the token icons */}
            <Label variant="body-s" className="leading-[145%] text-v3-text-0 font-medium text-right">
              {symbol}
            </Label>
          </div>
          {/* Fiat Value Row */}
          <Label
            variant="body-xs"
            className="leading-[150%] text-v3-bg-accent-40 font-medium justify-self-end"
          >
            {formatCurrency(fiatValue, { showCurrencySymbol: false })}
          </Label>
          <Label variant="body-xs" className="leading-[150%] text-v3-bg-accent-40">
            {USD}
          </Label>
        </div>
      ))}
    </div>
  )
}
