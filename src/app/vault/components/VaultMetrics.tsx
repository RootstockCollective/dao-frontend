'use client'

import { BalanceInfo } from '@/components/BalanceInfo'
import { useVaultBalance } from '../hooks/useVaultBalance'
import { formatSymbol, formatApy } from '@/app/shared/formatter'

/**
 * Component displaying vault metrics including balance and lending parameters
 */
export const VaultMetrics = () => {
  const { totalAssets, estimatedApy, isLoading } = useVaultBalance()

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-row flex-wrap gap-6">
        <BalanceInfo
          className="max-w-[214px] min-w-[180px]"
          title="Vault Balance"
          amount={isLoading ? '...' : formatSymbol(totalAssets, 'USDRIF')}
          symbol="USDRIF"
        />
        <BalanceInfo
          className="max-w-[214px] min-w-[180px]"
          title="APY"
          amount={isLoading ? '...' : formatApy(estimatedApy)}
          symbol="%"
        />
      </div>
    </div>
  )
}
