'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Paragraph } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

import { useRbtcVaultMetrics } from '../hooks/useRbtcVaultMetrics'
import { RbtcVaultMetricCard } from './RbtcVaultMetricCard'
import { RbtcVaultMetricsRow } from './RbtcVaultMetricsRow'

export const RbtcVaultMetricsSection = () => {
  const { row1, row2, row3, isLoading, error } = useRbtcVaultMetrics()
  const { tvl, vaultApy, syntheticYieldApy, liquidityReserve } = row1
  const { currentNav, deployedCapital, unallocatedCapital, manualBuffer } = row2
  const { pendingDepositCapital, pendingWithdrawalCapital, netPendingCapital, pricePerShare } = row3

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 rounded-sm bg-v3-bg-accent-80 w-full min-h-[180px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 rounded-sm bg-v3-bg-accent-80 w-full min-h-[180px]">
        <Paragraph variant="body" className="text-st-error">
          Failed to load vault metrics. Please try again later.
        </Paragraph>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 items-start p-6 rounded-sm bg-v3-bg-accent-80 w-full">
      {/* Row 1 */}
      <RbtcVaultMetricsRow>
        <RbtcVaultMetricCard
          title="TVL"
          tooltipContent="Total assets currently managed by the vault, including deployed capital, liquid balance, and accrued yield."
          amount={tvl.amount}
          tokenSymbol={RBTC}
          fiatAmount={tvl.fiatAmount}
        />
        <RbtcVaultMetricCard
          title="Vault APY (Indicative)"
          tooltipContent="Estimated annualized return based on share price growth. Yield compounds automatically into the vault's NAV and may vary over time."
          amount={vaultApy}
        />
        <RbtcVaultMetricCard
          title="Synthetic Yield APY"
          tooltipContent="Fixed synthetic yield rate configured for the vault. Reflected in the vault's overall performance."
          amount={syntheticYieldApy}
          buttonLabel="Top Up Synthetic Yield APY"
        />
        <RbtcVaultMetricCard
          title="Liquidity Reserve"
          tooltipContent="Portion of vault liquidity available to support withdrawal processing and operational stability."
          amount={liquidityReserve.amount}
          tokenSymbol={RBTC}
          fiatAmount={liquidityReserve.fiatAmount}
        />
      </RbtcVaultMetricsRow>

      {/* Row 2 */}
      <RbtcVaultMetricsRow>
        <RbtcVaultMetricCard
          title="Current NAV"
          tooltipContent="Net Asset Value of the vault after accounting for liabilities such as withdrawal obligations and accrued fees. Updated at the close of the Deposit window."
          amount={currentNav.amount}
          tokenSymbol={RBTC}
          fiatAmount={currentNav.fiatAmount}
          buttonLabel="Update NAV"
          buttonVariant="primary"
        />
        <RbtcVaultMetricCard
          title="Deployed Capital"
          tooltipContent="Capital currently allocated into active strategies."
          amount={deployedCapital.amount}
          tokenSymbol={RBTC}
          fiatAmount={deployedCapital.fiatAmount}
          buttonLabel="Deposit to Vault"
        />
        <RbtcVaultMetricCard
          title="Unallocated Capital"
          tooltipContent="Liquid assets currently held in the vault. Available for new strategy allocations or to fund withdrawal requests."
          amount={unallocatedCapital.amount}
          tokenSymbol={RBTC}
          fiatAmount={unallocatedCapital.fiatAmount}
          buttonLabel="Transfer to Manager Wallet"
        />
        <RbtcVaultMetricCard
          title="Manual Buffer"
          tooltipContent="Temporary liquidity provided to the vault to help process withdrawal requests. Typically repaid from incoming deposits."
          amount={manualBuffer.amount}
          tokenSymbol={RBTC}
          fiatAmount={manualBuffer.fiatAmount}
          buttonLabel="Top Up Buffer"
        />
      </RbtcVaultMetricsRow>

      {/* Row 3 */}
      <RbtcVaultMetricsRow>
        <RbtcVaultMetricCard
          title="Pending Deposit Capital"
          tooltipContent="Deposit requests submitted, pending approval at epoch close. These may be canceled until the epoch is closed."
          amount={pendingDepositCapital.amount}
          tokenSymbol={RBTC}
          fiatAmount={pendingDepositCapital.fiatAmount}
        />
        <RbtcVaultMetricCard
          title="Pending Withdrawal Capital"
          tooltipContent="Withdrawal requests submitted and awaiting approval at epoch close. These may be canceled until the epoch is closed."
          amount={pendingWithdrawalCapital.amount}
          tokenSymbol={RBTC}
          fiatAmount={pendingWithdrawalCapital.fiatAmount}
        />
        <RbtcVaultMetricCard
          title="Net Pending Capital"
          tooltipContent="Difference between pending deposit and withdrawal requests awaiting approval at epoch close. A positive value indicates net inflow; a negative value indicates net outflow."
          amount={netPendingCapital.amount}
          tokenSymbol={RBTC}
          fiatAmount={netPendingCapital.fiatAmount}
        />
        <RbtcVaultMetricCard
          title="Price per Share"
          tooltipContent="Fixed synthetic yield rate configured for the vault. Reflected in the vault's overall performance."
          amount={pricePerShare.amount}
          tokenSymbol={RBTC}
          fiatAmount={pricePerShare.fiatAmount}
        />
      </RbtcVaultMetricsRow>
    </div>
  )
}
