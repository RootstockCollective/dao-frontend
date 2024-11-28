import { AddressOrAliasWithCopy } from '@/components/Address'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { Popover } from '@/components/Popover'
import { TableCell } from '@/components/Table'
import { Label, Typography } from '@/components/Typography'
import { cn, formatCurrency, shortAddress, toFixed } from '@/lib/utils'
import { FC, memo, useContext, useEffect, useMemo, useState } from 'react'
import { FaArrowDown, FaArrowUp, FaCircle } from 'react-icons/fa'
import { Address, isAddress } from 'viem'
import { BuilderRewardPercentage, Reward } from '@/app/collective-rewards/rewards'
import { TableHeader } from '@/app/collective-rewards/shared'
import { ProgressBar } from '@/components/ProgressBar'
import { Button } from '@/components/Button'
import { BuilderStateFlags } from '@/app/collective-rewards/types'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { getBuilderInactiveState, isBuilderOperational } from '@/app/collective-rewards/utils'

export function getFormattedCurrency(value: number, symbol: string) {
  const formattedCurrency = formatCurrency(value, symbol)
  return `${formattedCurrency.substring(0, 1)}${symbol} ${formattedCurrency.substring(1)}`
}

type RewardCellProps = {
  tableHeader: TableHeader
  rewards: Reward[]
}

export const RewardCell: FC<RewardCellProps> = ({ tableHeader: { className }, rewards }) => (
  <TableCell className={cn(className, 'border-solid')}>
    <div className="flex flex-nowrap flex-row gap-1">
      {rewards &&
        rewards.map(({ crypto: { value, symbol }, fiat: { value: fiatValue, symbol: fiatSymbol }, logo }) => (
          <div key={value + symbol} className="flex-1">
            {/* TODO: if the value is very small, should we show it in Gwei/wei? */}

            <div className="flex items-center gap-1">
              <Label className="font-normal text-sm leading-none text-text-primary font-rootstock-sans">
                {toFixed(value)}
              </Label>
              <div className="ml-1">{logo}</div>
            </div>
            <Label className="font-normal text-sm leading-none text-disabled-primary font-rootstock-sans">
              {`= ${getFormattedCurrency(fiatValue, fiatSymbol)}`}
            </Label>
          </div>
        ))}
    </div>
  </TableCell>
)

export const LazyRewardCell = memo(RewardCell, ({ rewards: prevReward }, { rewards: nextReward }) =>
  prevReward.every((reward, key) => reward.fiat.value === nextReward[key].fiat.value),
)

type BuilderStatusFlagProps = {
  stateFlags: BuilderStateFlags
}
const getStatusColor = (isOperational: boolean, builderInactiveState: string) => {
  if(isOperational) return 'transparent'
  if(builderInactiveState === 'Paused') return '#F9E1FF'
  return '#932309'
}
const BuilderStatusFlag: FC<BuilderStatusFlagProps> = ({ stateFlags }) => {
  const isOperational = isBuilderOperational(stateFlags)
  const builderInactiveState = getBuilderInactiveState(stateFlags)

  const color = getStatusColor(isOperational, builderInactiveState)
  const content = builderInactiveState

  return (
    <Popover
      disabled={isOperational}
      content={content}
      className="font-normal text-sm flex items-center"
      size="small"
      trigger="hover"
    >
      <FaCircle color={color} size={8} />
    </Popover>
  )
}

type BuilderCellProps = {
  tableHeader: TableHeader
  builderName: string
  address: Address
} & BuilderStatusFlagProps

export const BuilderNameCell: FC<BuilderCellProps> = ({
  tableHeader: { className },
  builderName,
  address,
  stateFlags,
}) => {
  const shortenAddress = shortAddress(address)
  return (
    <TableCell className={cn(className, 'border-solid')}>
      <div className="flex flex-row gap-x-1 items-center">
        <BuilderStatusFlag stateFlags={stateFlags} />
        <Jdenticon className="rounded-md bg-white min-w-6" value={builderName} size="24" />
        <div className="w-32">
          <Popover
            content={
              <div className="text-[12px] font-bold mb-1">
                <p data-testid="builderAddressTooltip">{shortenAddress}</p>
              </div>
            }
            size="small"
            trigger="hover"
            disabled={!builderName || isAddress(builderName)}
          >
            <Typography tagVariant="label" className="font-semibold line-clamp-1 text-wrap min-w-28">
              <AddressOrAliasWithCopy
                addressOrAlias={builderName || address}
                clipboard={address}
                clipboardAnimationText={shortenAddress}
                className="text-sm"
              />
            </Typography>
          </Popover>
        </div>
      </div>
    </TableCell>
  )
}

type BackerRewardsPercentageProps = {
  tableHeader: TableHeader
  percentage: BuilderRewardPercentage | null
}

export const BackerRewardsPercentage: FC<BackerRewardsPercentageProps> = ({
  tableHeader: { className },
  percentage,
}) => {
  const renderDelta = useMemo(() => {
    if (!percentage) return null

    const deltaPercentage = percentage.next - percentage.current
    if (deltaPercentage > 0) {
      const colorGreen = '#1bc47d'
      return (
        <div className="flex flex-row items-center">
          <FaArrowUp style={{ color: colorGreen }} />
          <div className={cn(`text-[${colorGreen}] text-sm`)}>+{deltaPercentage}</div>
        </div>
      )
    }
    if (deltaPercentage < 0) {
      const colorRed = '#f14722'
      return (
        <div className="flex flex-row items-center">
          <FaArrowDown style={{ color: colorRed }} />
          <div className={cn(`text-[${colorRed}] text-sm`)}>{deltaPercentage}</div>
        </div>
      )
    }
    return null
  }, [percentage])
  return (
    <TableCell className={cn(className, 'border-b-0')}>
      <div className="flex flex-row gap-x-1 font-rootstock-sans justify-center gap-2 ">
        <div>{percentage?.current}</div>
        {renderDelta}
      </div>
    </TableCell>
  )
}

type TotalAllocationCellProps = {
  tableHeader: TableHeader
  // a percentage without decimals
  percentage: bigint
}

export const TotalAllocationCell: FC<TotalAllocationCellProps> = ({
  tableHeader: { className },
  percentage,
}) => {
  return (
    <TableCell className={cn(className, 'border-solid text-center border-b-0 items-center')}>
      <div className="flex flex-row gap-2 items-center">
        <ProgressBar progress={Number(percentage)} color="#1bc47d" />
        <Label>{percentage.toString()}%</Label>
      </div>
    </TableCell>
  )
}

type ActionCellProps = {
  tableHeader: TableHeader
  builderAddress: Address
}

export const ActionCell: FC<ActionCellProps> = ({ tableHeader: { className }, builderAddress }) => {
  const {
    state: { selections, allocations, getBuilder },
    actions: { toggleSelectedBuilder },
  } = useContext(AllocationsContext)

  const builder = useMemo(() => getBuilder(builderAddress), [builderAddress, getBuilder])

  const isPreallocated = useMemo(() => allocations[builderAddress] > 0n, [allocations, builderAddress])

  const isSelected = useMemo(
    () => selections[builderAddress] || isPreallocated,
    [selections, builderAddress, isPreallocated],
  )

  const isBuilderOperational = useMemo(() => {
    if (!builder) {
      console.log('Builder not found in selection') // TODO: handle this case better
      return
    }
    return (
      builder.stateFlags &&
      builder.stateFlags.kycApproved &&
      builder.stateFlags.communityApproved &&
      !builder.stateFlags.paused
    )
  }, [builder])

  const selectBuilder = () => {
    toggleSelectedBuilder(builder?.address as Address)
  }

  return (
    <TableCell className={cn(className, 'border-solid align-center')}>
      <Button
        variant={isSelected ? 'white' : 'secondary'}
        disabled={!isBuilderOperational || isPreallocated}
        onClick={selectBuilder}
        className="white text-center"
      >
        {isSelected ? 'Selected' : 'Select'}
      </Button>
    </TableCell>
  )
}
