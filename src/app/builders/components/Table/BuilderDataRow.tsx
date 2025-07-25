'use client'

import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards/utils/formatter'
import { BuilderRewardsSummary } from '@/app/collective-rewards/types'
import { getCombinedFiatAmount } from '@/app/collective-rewards/utils'
import { ConditionalTooltip } from '@/app/components'
import { ConnectTooltipContent } from '@/app/components/Tooltip/ConnectTooltip/ConnectTooltipContent'
import { GetPricesResult } from '@/app/user/types'
import { CommonComponentProps } from '@/components/commonProps'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { Paragraph } from '@/components/TypographyNew'
import { RIF } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'
import { BaseColumnId, Row, RowData, useTableActionsContext, useTableContext } from '@/shared/context'
import { DisclaimerFlow } from '@/shared/walletConnection'
import { useAppKitFlow } from '@/shared/walletConnection/connection/useAppKitFlow'
import { redirect, RedirectType } from 'next/navigation'
import { FC, HtmlHTMLAttributes, ReactElement, ReactNode, useState } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { COLUMN_TRANSFORMS, ColumnId, ColumnTransforms } from './BuilderTable.config'
import { ActionCell, ActionCellProps, getActionType } from './Cell/ActionCell'
import { AllocationCell, AllocationCellProps } from './Cell/AllocationCell'
import { BackersPercentageCell, BackersPercentageCellProps } from './Cell/BackersPercentageCell'
import { BackingCell, BackingCellProps } from './Cell/BackingCell'
import { BuilderNameCell, BuilderNameCellProps } from './Cell/BuilderNameCell'
import { RewardsCell, RewardsCellProps } from './Cell/RewardsCell'
import { SelectorCell } from './Cell/SelectorCell'

export type ColumnIdToCellPropsMap = {
  builder: BuilderNameCellProps
  backing: BackingCellProps
  backer_rewards: BackersPercentageCellProps
  rewards_past_cycle: RewardsCellProps
  rewards_upcoming: RewardsCellProps
  allocations: AllocationCellProps
  actions: ActionCellProps
}

export type BuilderRowData = RowData<ColumnId, ColumnIdToCellPropsMap[ColumnId]>

export const convertDataToRowData = (
  data: BuilderRewardsSummary[],
  userAllocations: (bigint | undefined)[],
  prices: GetPricesResult,
): Row<ColumnId>[] => {
  // FIXME: fix the Row type to take a generic for custom RowData type

  if (!data.length) return []

  return data.map<{ id: Address; data: ColumnIdToCellPropsMap }>((builder, index) => {
    const allocation = userAllocations[index] ?? 0n
    const actionType = getActionType(builder, allocation > 0n)

    const rifPrice = prices[RIF]?.price ?? 0
    const formattedAmount = formatSymbol(allocation, 'stRIF')
    const formattedUsdAmount = formatCurrency(getFiatAmount(allocation, rifPrice), { currency: 'USD' })

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
          rbtcValue: builder.lastCycleRewards.rbtc.amount.value,
          rifValue: builder.lastCycleRewards.rif.amount.value,
          usdValue: getCombinedFiatAmount([
            builder.lastCycleRewards.rif.amount,
            builder.lastCycleRewards.rbtc.amount,
          ]).toNumber(),
        },
        rewards_upcoming: {
          rbtcValue: builder.builderEstimatedRewards.rbtc.amount.value,
          rifValue: builder.builderEstimatedRewards.rif.amount.value,
          usdValue: getCombinedFiatAmount([
            builder.builderEstimatedRewards.rif.amount,
            builder.builderEstimatedRewards.rbtc.amount,
          ]).toNumber(),
        },
        backing: {
          amount: allocation,
          formattedAmount: formattedAmount,
          formattedUsdAmount: formattedUsdAmount,
        },
        allocations: {
          allocationPct: Number(builder.totalAllocationPercentage),
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

export const BuilderCell = (props: BuilderNameCellProps): ReactElement => {
  const { selectedRows } = useTableContext<ColumnId>()
  const isSelected = selectedRows[props.builder.address]

  return (
    <TableCell key="builder" columnId="builder" className="justify-start gap-4">
      <SelectorCell
        isHovered={props.isHighlighted}
        isSelected={isSelected}
        className="pt-3 pb-3 rounded-full"
      >
        <Jdenticon className="rounded-full bg-white w-10" value={props.builder.address} />
      </SelectorCell>

      <BuilderNameCell {...props} />
    </TableCell>
  )
}

// TODO: @refactor move to app/components/Table/Cell/TableCell.tsx
export const TableCellBase = <CID extends BaseColumnId = BaseColumnId>({
  children,
  className,
  onClick,
  columnId,
  forceShow,
  columnTransforms,
}: HtmlHTMLAttributes<HTMLTableCellElement> & {
  columnId: CID
  forceShow?: boolean
  columnTransforms: ColumnTransforms<CID>
}): ReactNode => {
  const { columns } = useTableContext<CID>()
  if (forceShow || !columns.find(col => col.id === columnId)?.hidden) {
    return (
      <td
        className={cn('flex self-stretch items-center select-none', columnTransforms[columnId], className)}
        onClick={onClick}
      >
        {children}
      </td>
    )
  }

  return null
}

const TableCell = ({
  children,
  className,
  onClick,
  columnId,
  forceShow,
}: HtmlHTMLAttributes<HTMLTableCellElement> & { columnId: ColumnId; forceShow?: boolean }): ReactNode => {
  return (
    <TableCellBase<ColumnId>
      className={className}
      onClick={onClick}
      columnId={columnId}
      forceShow={forceShow}
      columnTransforms={COLUMN_TRANSFORMS}
    >
      {children}
    </TableCellBase>
  )
}

export const BackerRewardsCell = (props: BackersPercentageCellProps): ReactElement => {
  return (
    <TableCell columnId="backer_rewards" className="gap-2 flex justify-center">
      <BackersPercentageCell {...props} />
    </TableCell>
  )
}

const RewardsPastCycleCell = (props: RewardsCellProps): ReactElement => {
  return (
    <TableCell columnId="rewards_past_cycle" className="justify-center">
      <RewardsCell {...props} />
    </TableCell>
  )
}

const RewardsUpcomingCell = (props: RewardsCellProps): ReactElement => {
  return (
    <TableCell columnId="rewards_upcoming" className="justify-center">
      <RewardsCell {...props} />
    </TableCell>
  )
}

export const BuilderBackingCell = (props: BackingCellProps): ReactElement => {
  return (
    <TableCell columnId="backing" className="flex flex-col gap-2 align-middle justify-center">
      <BackingCell {...props} />
    </TableCell>
  )
}

const BuilderAllocationsCell = (props: AllocationCellProps): ReactElement => {
  return (
    <TableCell columnId="allocations" className="justify-center">
      <AllocationCell {...props} className="w-[60%] justify-center" />
    </TableCell>
  )
}

export const ActionsCell = ({
  className,
  forceShow,
  ...props
}: ActionCellProps & { forceShow?: boolean }): ReactElement => {
  const { isConnected } = useAccount()

  return (
    <TableCell
      columnId="actions"
      className={cn('border-solid align-center w-full', className)}
      forceShow={forceShow}
    >
      {forceShow && <ActionCell {...props} hidden={!isConnected} />}
    </TableCell>
  )
}

interface BuilderDataRowProps extends CommonComponentProps<HTMLTableRowElement> {
  row: Row<ColumnId>
}

export const selectedRowStyle = 'bg-v3-text-80 text-v3-bg-accent-100'
export const unselectedRowStyle = 'bg-v3-bg-accent-80 text-v3-primary-100'

export const BuilderDataRow: FC<BuilderDataRowProps> = ({ row, ...props }) => {
  const {
    id: rowId,
    data: {
      builder,
      backing,
      backer_rewards,
      rewards_past_cycle,
      rewards_upcoming,
      allocations: { allocationPct },
      actions,
    },
  } = row as Row<ColumnId> & { data: ColumnIdToCellPropsMap }
  const { selectedRows } = useTableContext<ColumnId>()
  const { isConnected } = useAccount()
  const { intermediateStep, handleConnectWallet, handleCloseIntermediateStep, onConnectWalletButtonClick } =
    useAppKitFlow()

  const [isHovered, setIsHovered] = useState(false)
  const dispatch = useTableActionsContext<ColumnId>()

  const hasSelections = Object.values(selectedRows).some(Boolean)

  const handleToggleSelection = () => {
    if (!isConnected) {
      return
    }

    dispatch({
      type: 'TOGGLE_ROW_SELECTION',
      payload: rowId,
    })
  }

  return (
    <>
      <ConditionalTooltip
        side="top"
        align="start"
        className="p-0 ml-16"
        conditionPairs={[
          {
            condition: () => !isConnected,
            lazyContent: () => (
              <ConnectTooltipContent onClick={onConnectWalletButtonClick}>
                Connect your wallet to select Builders, back and adjust their backing.
              </ConnectTooltipContent>
            ),
          },
          {
            condition: () => !hasSelections,
            lazyContent: () => (
              <div className="flex justify-center">
                <div className="bg-v3-text-80 rounded-sm shadow-sm w-64 flex flex-col items-start p-6 gap-2">
                  <Paragraph className="text-v3-bg-accent-100 text-sm w-full font-normal leading-5 rootstock-sans self-stretch">
                    Click table line to select the Builder(s) that you would like to back
                  </Paragraph>
                </div>
              </div>
            ),
          },
        ]}
      >
        <tr
          {...props}
          className={cn(
            'flex border-b-v3-bg-accent-60 border-b-1 gap-4',
            selectedRows[rowId] || isHovered ? selectedRowStyle : unselectedRowStyle,
          )}
          onClick={handleToggleSelection}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <BuilderCell {...builder} isHighlighted={isHovered} />
          <BackerRewardsCell {...backer_rewards} />
          <RewardsPastCycleCell {...rewards_past_cycle} />
          <RewardsUpcomingCell {...rewards_upcoming} />
          <BuilderBackingCell {...backing} />
          {!(isHovered && isConnected) && <BuilderAllocationsCell allocationPct={allocationPct} />}
          <ActionsCell {...actions} forceShow={isHovered && isConnected} />
          <td className="w-[24px]"></td>
        </tr>
      </ConditionalTooltip>

      {!!intermediateStep && (
        <DisclaimerFlow onAgree={handleConnectWallet} onClose={handleCloseIntermediateStep} />
      )}
    </>
  )
}
