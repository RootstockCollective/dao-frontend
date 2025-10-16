import { Bar, BarDivider } from '@/components/Bar'
import { TokenImage } from '@/components/TokenImage'
import { Label } from '@/components/Typography'
import { RBTC, USD } from '@/lib/constants'
import Big from 'big.js'
import { ReactElement } from 'react'
import { MetricBarSegment } from './MetricBarSegment'
import { TokenSymbol } from './types'

export type MetricTooltipProps = {
  tokens: Array<{
    symbol: TokenSymbol
    value: string
    fiatValue: string
  }>
}

export const MetricTooltip = ({ tokens }: MetricTooltipProps): ReactElement => {
  const tokenCount = tokens.length

  const totalFiatValue = tokens.reduce((acc, { fiatValue }) => Big(fiatValue).add(acc), Big(0))

  return (
    <div className="flex flex-col p-4 items-start gap-[1rem] self-stretch rounded-sm bg-v3-text-80">
      {tokens.map(({ symbol, value, fiatValue }, metricIndex) => (
        <div key={symbol} className="flex flex-col items-center gap-2  self-stretch">
          <div className="flex flex-row items-end gap-2 self-stretch">
            <div className="flex flex-col items-end gap-[-0.125rem]">
              <Label variant="body-l" className="text-right text-v3-text-0 leading-[133%]">
                {value}
              </Label>
              <Label variant="body-xs" className="text-right text-v3-bg-accent-40 leading-[150%]">
                {fiatValue}
              </Label>
            </div>
            <div className="flex flex-col items-start self-stretch">
              <div className="flex items-center gap-1">
                <TokenImage symbol={symbol} size={symbol === RBTC ? 20 : 16} />{' '}
                {/* FIXME: someone should
                really fix the inconsistenct sizes of the token icons */}
                <Label variant="tag" className="leading-[145%] text-v3-text-0">
                  {symbol}
                </Label>
              </div>
              <Label variant="body-xs" className="text-v3-bg-accent-40 leading-[150%]">
                {USD}
              </Label>
            </div>
          </div>
          <Bar className="w-full h-1 self-stretch">
            {tokens.map(({ symbol, fiatValue }, segmentIndex) => {
              const widthPercentage = totalFiatValue.gt(0)
                ? Big(fiatValue).div(totalFiatValue).mul(100).toFixed(1)
                : 0

              return (
                <>
                  <MetricBarSegment
                    key={symbol}
                    token={symbol}
                    position={
                      segmentIndex === 0 ? 'left' : segmentIndex === tokenCount - 1 ? 'right' : 'center'
                    }
                    className={`${metricIndex !== segmentIndex ? 'bg-transparent' : ''}`}
                    style={{
                      flex: `${widthPercentage}%`,
                    }} // The width needs to be relative to the ratio of the value in USD to the total of all tokens in USD
                  />
                  {segmentIndex < tokenCount - 1 && <BarDivider />}
                </>
              )
            })}
          </Bar>
        </div>
      ))}
    </div>
  )
}
