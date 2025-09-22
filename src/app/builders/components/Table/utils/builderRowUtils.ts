import { formatSymbol } from '@/app/collective-rewards/rewards/utils'
import { BuilderRewardsSummary } from '@/app/collective-rewards/types'
import { getCombinedFiatAmount, getFiatAmount } from '@/app/collective-rewards/utils'
import { BackingState } from '@/app/shared/context/BackingContext'
import { GetPricesResult } from '@/app/user/types'
import { RIF, STRIF, USD } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { redirect, RedirectType } from 'next/navigation'
import { BuilderTable } from '../BuilderTable.config'
import { Action, getActionType } from '../Cell/ActionCell'

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
  backings: BackingState['backings'],
): BuilderTable['Row'][] => {
  if (!data.length) return []

  return data.map<BuilderTable['Row']>(builder => {
    const backing = backings[builder.address]?.pending ?? 0n
    const actionType = getActionType(builder, backing > 0n)

    const rifPrice = prices[RIF]?.price ?? 0

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
          rbtcValue: builder.lastCycleRewards?.rbtc.amount.value ?? 0n,
          rifValue: builder.lastCycleRewards?.rif.amount.value ?? 0n,
          usdValue: builder.lastCycleRewards
            ? getCombinedFiatAmount([
              builder.lastCycleRewards.rif.amount,
              builder.lastCycleRewards.rbtc.amount,
            ]).toNumber()
            : 0,
        },
        rewards_upcoming: {
          rbtcValue: builder.backerEstimatedRewards?.rbtc.amount.value ?? 0n,
          rifValue: builder.backerEstimatedRewards?.rif.amount.value ?? 0n,
          usdValue: builder.backerEstimatedRewards
            ? getCombinedFiatAmount([
              builder.backerEstimatedRewards.rif.amount,
              builder.backerEstimatedRewards.rbtc.amount,
            ]).toNumber()
            : 0,
        },
        backing: {
          amount: backing,
          formattedAmount: formatSymbol(backing, STRIF),
          formattedUsdAmount: formatCurrency(
            getFiatAmount({ value: backing, price: rifPrice, symbol: STRIF, currency: USD }),
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
