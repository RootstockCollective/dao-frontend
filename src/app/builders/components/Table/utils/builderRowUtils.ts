import { formatSymbol } from '@/app/collective-rewards/rewards/utils'
import { BuilderRewardsSummary } from '@/app/collective-rewards/types'
import { getCombinedFiatAmount, getFiatAmount } from '@/app/collective-rewards/utils'
import { GetPricesResult } from '@/app/user/types'
import { RBTC, RIF, STRIF, USD, USDRIF } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { redirect, RedirectType } from 'next/navigation'
import { BuilderTable } from '../BuilderTable.config'
import { getActionType, Action } from '../Cell/ActionCell'
import { Allocations } from '@/app/collective-rewards/allocations/context'

type RowStyle = 'selected' | 'unselected' | 'base'

export const MOBILE_ROW_STYLES: Record<RowStyle, string> = {
  selected: 'bg-v3-text-80 text-v3-bg-accent-100 border-b-v3-bg-accent-60 border-b-1',
  unselected:
    'bg-v3-bg-accent-80 text-v3-primary-100 relative after:absolute after:bottom-0 after:inset-x-4 after:h-px after:bg-v3-bg-accent-60',
  base: 'flex flex-col py-5 px-4 w-full min-w-full',
}

export const DESKTOP_ROW_STYLES: Record<RowStyle, string> = {
  selected: 'bg-v3-text-80 text-v3-bg-accent-100',
  unselected: 'bg-v3-bg-accent-80 text-v3-primary-100',
  base: 'flex border-b-v3-bg-accent-60 border-b-1 gap-4 pl-4',
}

// Export for backward compatibility
export const selectedRowStyle = MOBILE_ROW_STYLES.selected
export const unselectedRowStyle = MOBILE_ROW_STYLES.unselected

// Data transformation function
export const convertDataToRowData = (
  data: BuilderRewardsSummary[],
  prices: GetPricesResult,
  allocations: Allocations,
): BuilderTable['Row'][] => {
  if (!data.length) return []

  return data.map<BuilderTable['Row']>(builder => {
    const backerBacking = allocations[builder.address] ?? 0n
    const actionType = getActionType(builder, backerBacking > 0n)
    const builderBacking = builder.totalAllocation ?? 0n

    const rifPrice = prices[RIF]?.price ?? 0
    const rbtcPrice = prices[RBTC]?.price ?? 0
    const usdrifPrice = prices[USDRIF]?.price ?? 1

    // Get actual values from API
    const pastCycleRif = builder.lastCycleRewards?.rif.amount.value ?? 0n
    const pastCycleRbtc = builder.lastCycleRewards?.rbtc.amount.value ?? 0n
    const upcomingRif = builder.backerEstimatedRewards?.rif.amount.value ?? 0n
    const upcomingRbtc = builder.backerEstimatedRewards?.rbtc.amount.value ?? 0n

    // FIXME: Mock USDRIF values for testing - replace with real API data when available
    // If values are 0, generate mock data for testing purposes
    const shouldMockPastCycle = pastCycleRif === 0n && pastCycleRbtc === 0n
    const shouldMockUpcoming = upcomingRif === 0n && upcomingRbtc === 0n

    const mockPastCycleRif = shouldMockPastCycle ? 150000000000000000000n : pastCycleRif // ~150 RIF
    const mockPastCycleRbtc = shouldMockPastCycle ? 50000000000000000n : pastCycleRbtc // ~0.05 RBTC
    const mockPastCycleUsdrif = shouldMockPastCycle ? 75000000000000000000n : pastCycleRif // ~75 USDRIF

    const mockUpcomingRif = shouldMockUpcoming ? 200000000000000000000n : upcomingRif // ~200 RIF
    const mockUpcomingRbtc = shouldMockUpcoming ? 75000000000000000n : upcomingRbtc // ~0.075 RBTC
    const mockUpcomingUsdrif = shouldMockUpcoming ? 100000000000000000000n : upcomingRif // ~100 USDRIF

    const finalPastCycleRif = shouldMockPastCycle ? mockPastCycleRif : pastCycleRif
    const finalPastCycleRbtc = shouldMockPastCycle ? mockPastCycleRbtc : pastCycleRbtc
    const finalPastCycleUsdrif = shouldMockPastCycle ? mockPastCycleUsdrif : pastCycleRif

    const finalUpcomingRif = shouldMockUpcoming ? mockUpcomingRif : upcomingRif
    const finalUpcomingRbtc = shouldMockUpcoming ? mockUpcomingRbtc : upcomingRbtc
    const finalUpcomingUsdrif = shouldMockUpcoming ? mockUpcomingUsdrif : upcomingRif

    return {
      id: builder.address,
      data: {
        builder: {
          builder,
        },
        backer_rewards: {
          percentage: builder.backerRewardPct,
        },
        rewards_past_cycle: {
          rbtcValue: finalPastCycleRbtc,
          rifValue: finalPastCycleRif,
          usdrifValue: finalPastCycleUsdrif,
          rifPrice,
          rbtcPrice,
          usdrifPrice,
          usdValue:
            builder.lastCycleRewards || shouldMockPastCycle
              ? getCombinedFiatAmount([
                  { value: finalPastCycleRif, symbol: RIF, price: rifPrice, currency: USD },
                  { value: finalPastCycleRbtc, symbol: RBTC, price: rbtcPrice, currency: USD },
                  { value: finalPastCycleUsdrif, symbol: USDRIF, price: usdrifPrice, currency: USD },
                ]).toNumber()
              : 0,
        },
        rewards_upcoming: {
          rbtcValue: finalUpcomingRbtc,
          rifValue: finalUpcomingRif,
          usdrifValue: finalUpcomingUsdrif,
          rifPrice,
          rbtcPrice,
          usdrifPrice,
          usdValue:
            builder.backerEstimatedRewards || shouldMockUpcoming
              ? getCombinedFiatAmount([
                  { value: finalUpcomingRif, symbol: RIF, price: rifPrice, currency: USD },
                  { value: finalUpcomingRbtc, symbol: RBTC, price: rbtcPrice, currency: USD },
                  { value: finalUpcomingUsdrif, symbol: USDRIF, price: usdrifPrice, currency: USD },
                ]).toNumber()
              : 0,
        },
        backing: {
          amount: builderBacking,
          formattedAmount: formatSymbol(builderBacking, STRIF),
          formattedUsdAmount: formatCurrency(
            getFiatAmount({ value: builderBacking, price: rifPrice, symbol: STRIF, currency: USD }),
          ),
        },
        backingShare: {
          backingPercentage: builder.totalAllocationPercentage
            ? Number(builder.totalAllocationPercentage)
            : undefined,
        },
        actions: {
          actionType,
          onClick: () => {
            redirect(`/backing?builders=${builder.address}`, RedirectType.push)
          },
        },
      },
    }
  })
}

// Utility function for selected builders action state
export const getSelectedBuildersActionState = (actions: Action[], selectedBuilderIds: string[]) => {
  const selectedCount = selectedBuilderIds.length
  const isMultipleDifferentActions = actions.some(action => action !== actions[0])
  const showAction = isMultipleDifferentActions ? 'adjustBacking' : actions[0]

  const handleActionClick = () => {
    redirect(`/backing?builders=${selectedBuilderIds.join(',')}`, RedirectType.push)
  }

  return {
    selectedBuilderIds,
    selectedCount,
    showAction,
    handleActionClick,
  }
}
