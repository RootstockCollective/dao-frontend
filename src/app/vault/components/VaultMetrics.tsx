'use client'

import { BalanceInfo } from '@/components/BalanceInfo'
import { useVaultBalance } from '../hooks/useVaultBalance'
import { useSubsidyPool } from '../hooks/useSubsidyPool'
import { formatSymbol, formatApy } from '@/app/shared/formatter'
import { Paragraph } from '@/components/Typography'

/**
 * Component displaying vault metrics including balance, lending parameters, and price per share
 */
export const VaultMetrics = () => {
  const { totalAssets, estimatedApy, pricePerShare, isLoading } = useVaultBalance()
  const { syntheticYield, isLoading: isLoadingSynthetic } = useSubsidyPool()

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-row flex-wrap gap-x-6 gap-y-6 md:gap-x-20">
        <BalanceInfo
          className="w-[214px] min-w-[180px]"
          title="Vault Balance"
          amount={isLoading ? '...' : formatSymbol(totalAssets, 'USDRIF')}
          symbol="USDRIF"
        />
        <BalanceInfo
          className="w-[214px] min-w-[180px]"
          title="APY"
          amount={isLoading ? '...' : formatApy(estimatedApy)}
          symbol="%"
          tooltipContent={
            <div className="flex flex-col gap-2 text-wrap max-w-[35rem] text-xs p-2">
              <Paragraph>
                Strategies APY:{' '}
                {isLoading || isLoadingSynthetic ? '...' : formatApy(estimatedApy - syntheticYield)}%
                <br />
                Synthetic yield: {isLoadingSynthetic ? '...' : formatApy(syntheticYield)}%
              </Paragraph>
            </div>
          }
        />
        <BalanceInfo
          className="w-[214px] min-w-[180px]"
          title="Price per Share"
          amount={isLoading ? '...' : formatSymbol(pricePerShare, 'USDRIF')}
          symbol="USDRIF"
        />
      </div>
    </div>
  )
}
