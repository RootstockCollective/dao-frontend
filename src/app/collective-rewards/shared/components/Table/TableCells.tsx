import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import {
  BackerRewardPercentage,
  formatFiatAmount,
  formatSymbol,
  getFiatAmount,
  Reward,
} from '@/app/collective-rewards/rewards'
import { BuilderStateFlags } from '@/app/collective-rewards/types'
import {
  getBuilderInactiveState,
  isBuilderActive,
  isBuilderOperational,
} from '@/app/collective-rewards/utils'
import { AddressOrAliasWithCopy } from '@/components/Address'
import { Button } from '@/components/Button'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { Popover } from '@/components/Popover'
import { ProgressBar } from '@/components/ProgressBar'
import { TableCell } from '@/components/Table'
import { Label, Typography } from '@/components/Typography'
import { cn, shortAddress } from '@/lib/utils'
import { FC, memo, useContext, useMemo } from 'react'
import { ArrowDown, ArrowUp, Circle } from '@/components/Icons'
import { Address, isAddress, parseEther } from 'viem'

type TableCellProps = {
  className?: string
}

type RewardCellValueProps = {
  reward: Reward
}

const RewardCellValue: FC<RewardCellValueProps> = ({ reward }) => {
  const {
    amount: { value, price, symbol, currency },
    logo,
  } = reward

  const fiatAmount = getFiatAmount(value, price)

  return (
    <div className="flex-1">
      <div className="flex items-center gap-1">
        <Label className="font-normal text-sm leading-none text-text-primary font-rootstock-sans">
          {formatSymbol(value, symbol)}
        </Label>
        <div className="ml-1">{logo}</div>
      </div>
      <Label className="font-normal text-sm leading-none text-disabled-primary font-rootstock-sans">
        {formatFiatAmount(fiatAmount, currency)}
      </Label>
    </div>
  )
}

type RewardCellProps = TableCellProps & {
  rewards: Reward[]
  isHidden?: boolean
}

export const RewardCell: FC<RewardCellProps> = ({ className, rewards, isHidden }) => (
  <TableCell className={cn(className, 'border-solid', { hidden: isHidden })}>
    <div className="flex flex-nowrap flex-row gap-1">
      {rewards && rewards.map((reward, index) => <RewardCellValue key={index} reward={reward} />)}
    </div>
  </TableCell>
)

export const LazyRewardCell = memo(
  RewardCell,
  ({ rewards: prevReward, isHidden: prevIsHidden }, { rewards: nextReward, isHidden: nextIsHidden }) =>
    prevReward.every(
      (reward, key) =>
        reward.amount.value === nextReward[key].amount.value &&
        reward.amount.price === nextReward[key].amount.price,
    ) && prevIsHidden === nextIsHidden,
)

type BuilderStatusFlagProps = {
  stateFlags: BuilderStateFlags
}
const getStatusColor = (isActive: boolean, builderInactiveState: string) => {
  if (isActive) return 'transparent'
  if (builderInactiveState === 'Paused') return '#F9E1FF'
  return '#932309'
}

const BuilderStatusFlag: FC<BuilderStatusFlagProps> = ({ stateFlags }) => {
  const builderInactiveState = getBuilderInactiveState(stateFlags)
  const isActive = isBuilderActive(stateFlags)

  const color = getStatusColor(isActive, builderInactiveState)

  return (
    <Popover
      disabled={isActive}
      content={`Status: ${builderInactiveState}`}
      className="font-normal text-sm flex items-center"
      size="small"
      trigger="hover"
    >
      <Circle color={color} size={8} />
    </Popover>
  )
}

type BuilderCellProps = TableCellProps & {
  builderName: string
  address: Address
} & BuilderStatusFlagProps

export const BuilderNameCell: FC<BuilderCellProps> = ({ className, builderName, address, stateFlags }) => {
  const shortenAddress = shortAddress(address)
  return (
    <TableCell className={cn(className, 'border-solid')}>
      <div className="flex flex-row gap-x-1 items-center">
        <BuilderStatusFlag stateFlags={stateFlags} />
        <Jdenticon className="rounded-md bg-white min-w-6" value={address} size="24" />
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
            <Typography tagVariant="label" className="font-semibold line-clamp-1 text-wrap min-w-28 relative">
              <AddressOrAliasWithCopy
                addressOrAlias={builderName || address}
                clipboard={address}
                clipboardAnimationText={shortenAddress}
                className="text-sm max-w-[104px]"
              />
            </Typography>
          </Popover>
        </div>
      </div>
    </TableCell>
  )
}

type BackerRewardsPercentageProps = TableCellProps & {
  percentage: BackerRewardPercentage | null
}

const toPercentage = (value: bigint) => Number((value * 100n) / parseEther('1'))
export const BackerRewardsPercentage: FC<BackerRewardsPercentageProps> = ({ className, percentage }) => {
  const renderDelta = useMemo(() => {
    if (!percentage) return null

    const current = toPercentage(percentage.current)
    const next = toPercentage(percentage.next)

    const deltaPercentage = next - current
    if (deltaPercentage > 0) {
      const colorGreen = '#1bc47d'
      return (
        <div className="flex flex-row items-center">
          <ArrowUp className="fa-arrow-up" style={{ color: colorGreen }} />
          <div className={cn(`text-[${colorGreen}] text-sm`)}>+{deltaPercentage}</div>
        </div>
      )
    }
    if (deltaPercentage < 0) {
      const colorRed = '#f14722'
      return (
        <div className="flex flex-row items-center">
          <ArrowDown className="fa-arrow-down" style={{ color: colorRed }} />
          <div className={cn(`text-[${colorRed}] text-sm`)}>{deltaPercentage}</div>
        </div>
      )
    }
    return null
  }, [percentage])
  return (
    <TableCell className={cn(className, 'border-b-0')}>
      <div className="flex flex-row gap-x-1 font-rootstock-sans justify-center gap-2 ">
        <div>{percentage ? toPercentage(percentage.current) : ''}</div>
        {renderDelta}
      </div>
    </TableCell>
  )
}

type TotalAllocationCellProps = TableCellProps & {
  // a percentage without decimals
  percentage: bigint
}

export const TotalAllocationCell: FC<TotalAllocationCellProps> = ({ className, percentage }) => {
  return (
    <TableCell className={cn(className, 'border-solid text-center border-b-0 items-center')}>
      <div className="flex flex-row gap-2 items-center">
        <ProgressBar progress={Number(percentage)} color="#1bc47d" />
        <Label>{percentage.toString()}%</Label>
      </div>
    </TableCell>
  )
}

type ActionCellProps = TableCellProps & {
  builderAddress: Address
}

export const ActionCell: FC<ActionCellProps> = ({ className, builderAddress }) => {
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

  const isOperational = useMemo(() => {
    if (!builder) {
      console.log('Builder not found in selection') // TODO: handle this case better
      return
    }
    return isBuilderOperational(builder.stateFlags)
  }, [builder])

  const selectBuilder = () => {
    toggleSelectedBuilder(builder?.address as Address)
  }

  return (
    <TableCell className={cn(className, 'border-solid align-center')}>
      <Button
        variant={isSelected ? 'white' : 'secondary'}
        disabled={!isOperational || isPreallocated}
        onClick={selectBuilder}
        className="white text-center"
      >
        {isSelected ? 'Selected' : 'Select'}
      </Button>
    </TableCell>
  )
}
