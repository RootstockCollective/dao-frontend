import { HeaderTitle, Typography } from '@/components/Typography'
import { MetricsCard } from '@/components/MetricsCard'
import { useStRifHoldings } from './hooks/useStRifHoldings'
import { formatNumberWithCommas } from '@/lib/utils'
import { Popover } from '@/components/Popover'
import { QuestionIcon } from '@/components/Icons'
import { tokenContracts } from '@/lib/contracts'
import { useTreasuryBalances } from './hooks/useTreasuryBalances'
import { useMemo } from 'react'

/**
 * Displays key treasury metrics including total stRIF, treasury balance,
 * and total value locked (TVL) in USD.
 */
export const MetricsSection = () => {
  const { stRifBalance, stRifUsdBalance, totalFundingUsd, tvlUsd } = useStRifHoldings()
  // Only RBTC and RIF are whitelisted for now
  const whitelistedTokenContracts = useMemo(() => Object.values(tokenContracts), [])
  const { balances, loading } = useTreasuryBalances(whitelistedTokenContracts)

  return (
    <div>
      <HeaderTitle className="mb-4">Metrics</HeaderTitle>
      <div className="flex flex-row gap-4">
        <MetricsCard
          className="max-w-[214px] min-w-[120px]"
          title={<Typography className="text-sm font-bold">Total stRIF</Typography>}
          amount={`${formatNumberWithCommas(stRifBalance)} STRIF`}
          fiatAmount={`= USD $${formatNumberWithCommas(stRifUsdBalance)}`}
          borderless
        />
        <MetricsCard
          className="max-w-[214px] min-w-[120px]"
          title={<Typography className="text-sm font-bold">Treasury</Typography>}
          amount={`${formatNumberWithCommas(totalFundingUsd)} USD`}
          borderless
        />
        <MetricsCard
          className="max-w-[214px] min-w-[120px] overflow-visible"
          title={
            <div className="flex flex-row gap-2">
              <Typography tagVariant="span" className="text-sm font-bold">
                TVL{' '}
              </Typography>
              <Popover
                contentContainerClassName="w-max"
                trigger="hover"
                content={
                  <div>
                    <Typography className="">Total value locked</Typography>
                    <Typography className="text-sm">(Total stRIF + Treasury)</Typography>
                  </div>
                }
              >
                <QuestionIcon className="ml-1 hover:cursor-help" />
              </Popover>
            </div>
          }
          amount={`${formatNumberWithCommas(tvlUsd)} USD`}
          borderless
        />
        {!loading && balances.length && (
          <MetricsCard
            className="max-w-[214px] min-w-[120px] overflow-visible"
            title={
              <div className="flex flex-row gap-2">
                <Typography tagVariant="span" className="text-sm font-bold">
                  Others{' '}
                </Typography>
              </div>
            }
            amount={
              <div className="flex flex-col">
                {balances.map(({ symbol, balance }) => (
                  <Typography
                    key={symbol}
                    tagVariant="h2"
                    paddingBottom="2px"
                    paddingTop="10px"
                    lineHeight="28.8px"
                    fontFamily="kk-topo"
                    className="text-[24px] text-primary font-normal"
                  >
                    {formatNumberWithCommas(balance)} {symbol}
                  </Typography>
                ))}
              </div>
            }
            borderless
          />
        )}
      </div>
    </div>
  )
}
