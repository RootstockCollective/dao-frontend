import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { BuilderRewardPercentage, useGetBuildersRewards } from '@/app/collective-rewards/rewards'
import { BuilderContextProviderWithPrices } from '@/app/collective-rewards/user'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { AddressOrAliasWithCopy } from '@/components/Address'
import { Button } from '@/components/Button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/Collapsible'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Popover } from '@/components/Popover'
import { ProgressBar } from '@/components/ProgressBar/ProgressBar'
import { TableBody, TableCell, TableCore, TableHead, TableRow } from '@/components/Table'
import { HeaderTitle, Label, Typography } from '@/components/Typography'
import { RBTC, RIF } from '@/lib/constants'
import { cn, formatCurrency, shortAddress, toFixed } from '@/lib/utils'
import { useBasicPaginationUi } from '@/shared/hooks/usePaginationUi'
import { rbtcIconSrc } from '@/shared/rbtcIconSrc'
import Image from 'next/image'
import { FC, memo, useMemo, useState } from 'react'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa6'
import { LiaSortUpSolid } from 'react-icons/lia'
import { RiArrowUpSFill } from 'react-icons/ri'
import { Address, isAddress } from 'viem'

type Currency = {
  value: number
  symbol: string
}

export type Reward = {
  crypto: Currency
  fiat: Currency
}

type RewardCellProps = {
  rewards: Reward[]
}

export function getFormattedCurrency(value: number, symbol: string) {
  const formattedCurrency = formatCurrency(value, symbol)
  return `${formattedCurrency.substring(0, 1)}${symbol} ${formattedCurrency.substring(1)}`
}

export const rbtcIcon = (
  <Image src={`data:image/svg+xml;base64,${rbtcIconSrc}`} alt="rBTC Logo" width={16} height={16} />
)
export const rifIcon = <Image src={'/images/rif-logo.png'} alt="RIF Logo" width={16} height={16} />

export const RewardCell: FC<RewardCellProps> = ({ rewards }) => (
  <div className="flex flex-nowrap flex-row gap-2 whitespace-nowrap">
    {rewards &&
      rewards.map(({ crypto: { value, symbol }, fiat: { value: fiatValue, symbol: fiatSymbol } }) => (
        <div key={value + symbol} className="flex-1">
          {/* TODO: if the value is very small, should we show it in Gwei/wei? */}

          <Label className="flex items-center gap-1 font-normal text-sm leading-none text-text-primary font-rootstock-sans">
            {toFixed(value)}
            {symbol === RBTC && rbtcIcon}
            {symbol === RIF && rifIcon}
          </Label>
          <Label className="font-normal text-sm leading-none text-disabled-primary font-rootstock-sans">
            {`= ${getFormattedCurrency(fiatValue, fiatSymbol)}`}
          </Label>
        </div>
      ))}
  </div>
)

export const LazyRewardCell = memo(RewardCell, ({ rewards: prevReward }, { rewards: nextReward }) =>
  prevReward.every((reward, key) => reward.fiat.value === nextReward[key].fiat.value),
)

export const BuilderNameCell = ({ builderName, address }: { builderName: string; address: string }) => {
  const shortenAddress = shortAddress(address as Address)
  return (
    <TableCell className={cn(tableHeaders[0].className, 'border-solid')}>
      <div className="flex flex-row gap-x-1">
        <Jdenticon className="rounded-md bg-white" value={builderName} size="24" />
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
          <Typography tagVariant="label" className="font-semibold line-clamp-1 text-wrap">
            <AddressOrAliasWithCopy
              addressOrAlias={builderName || address}
              clipboard={address}
              clipboardAnimationText={shortenAddress}
              className="text-sm"
            />
          </Typography>
        </Popover>
      </div>
    </TableCell>
  )
}

export const BackerRewardsPercentage = ({
  rewardPercentage,
}: {
  rewardPercentage: BuilderRewardPercentage | null
}) => {
  const renderDelta = useMemo(() => {
    if (!rewardPercentage) return null

    const deltaPercentage = rewardPercentage.next - rewardPercentage.current
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
  }, [rewardPercentage])
  return (
    <TableCell className={cn(tableHeaders[1].className, 'border-b-0')}>
      <div className="flex flex-row gap-x-1 font-rootstock-sans justify-center gap-2 ">
        <div>{rewardPercentage?.current}</div>
        {renderDelta}
      </div>
    </TableCell>
  )
}

export const LastCycleRewardCell = ({ rewards }: { rewards: Reward[] }) => {
  return (
    <TableCell className={cn(tableHeaders[2].className, 'border-solid')}>
      <LazyRewardCell rewards={rewards} />
    </TableCell>
  )
}

const EstimatedRewardCell = ({ rewards }: { rewards: Reward[] }) => {
  return (
    <TableCell className={cn(tableHeaders[3].className, 'border-solid')}>
      <LazyRewardCell rewards={rewards} />
    </TableCell>
  )
}

type ShareProps = {
  // a percentage without decimals
  totalAllocationPercentage: bigint
}

const ShareCell = ({ totalAllocationPercentage }: ShareProps) => {
  return (
    <TableCell className={cn(tableHeaders[4].className, 'border-solid text-center border-b-0 items-center')}>
      <div className="flex flex-row gap-2 items-center">
        <ProgressBar progress={Number(totalAllocationPercentage)} color="#1bc47d" />
        <Label>{totalAllocationPercentage.toString()}%</Label>
      </div>
    </TableCell>
  )
}
const ActionCell = () => {
  /* TODO: manage the button status 
    - disabled when the backer cannot vote on the Builder
    - variant=primary when the builder is selected and text changed to "Selected"
    - variant=secondary by default and text is "Select"
  */
  /* TODO: add the onClick event
   *  - it needs to interact with the allocation context to add the builder to the selected builders
   */
  return (
    <TableCell className={cn(tableHeaders[5].className, 'border-solid align-center')}>
      <Button variant="secondary" /* disabled={true} */>Select</Button>
    </TableCell>
  )
}

enum RewardsColumnKeyEnum {
  builder = 'builder',
  lastCycleRewards = 'lastCycleRewards',
  estimatedRewards = 'estimatedRewards',
  rewardPercentage = 'rewardPercentage',
  totalAllocationPercentage = 'totalAllocationPercentage',
}
const tableHeaders = [
  { label: 'Builder', className: 'w-[14%]', key: RewardsColumnKeyEnum.builder },
  { label: 'Backer Rewards %', className: 'w-[10%]', key: RewardsColumnKeyEnum.rewardPercentage },
  { label: 'Last Cycle Rewards', className: 'w-[22%]', key: RewardsColumnKeyEnum.lastCycleRewards },
  { label: 'Est. Backers Rewards', className: 'w-[22%]', key: RewardsColumnKeyEnum.estimatedRewards },
  {
    label: 'Total Allocations',
    className: 'w-[18%]',
    // eslint-disable-next-line quotes
    tooltip: "The Builder's share of the total allocations",
    key: RewardsColumnKeyEnum.totalAllocationPercentage,
  },
  // TODO: text-center isn't applied
  { label: 'Actions', className: 'w-[14%]' },
]

type ISortConfig = {
  key: RewardsColumnKeyEnum
  direction: 'asc' | 'desc'
}

const BuildersLeaderBoardTable = () => {
  const { data: rewardsData, isLoading, error: rewardsError } = useGetBuildersRewards()
  const [sortConfig, setSortConfig] = useState<ISortConfig>({
    key: RewardsColumnKeyEnum.totalAllocationPercentage,
    direction: 'asc',
  })

  // pagination
  const buildersPerPage = 10
  const tableDataLength = useMemo(() => Object.keys(rewardsData).length, [rewardsData])
  const maxPages = useMemo(() => Math.ceil(tableDataLength / buildersPerPage), [tableDataLength])
  const { paginationUi, currentPage } = useBasicPaginationUi(maxPages)

  useHandleErrors({ error: rewardsError, title: 'Error loading builder rewards' })

  type IRewardData = (typeof rewardsData)[number]
  const sortedRewardsData = useMemo(
    () =>
      Object.values(rewardsData).toSorted((a: IRewardData, b: IRewardData) => {
        const { key, direction } = sortConfig
        if (!key) return 0

        let aValue: number | string
        let bValue: number | string
        switch (key) {
          case RewardsColumnKeyEnum.builder:
            aValue = a.builderName || a.address
            bValue = b.builderName || b.address
            break
          case RewardsColumnKeyEnum.totalAllocationPercentage:
            aValue = Number(a.totalAllocationPercentage)
            bValue = Number(b.totalAllocationPercentage)
            break
          case RewardsColumnKeyEnum.rewardPercentage:
            if (!a.rewardPercentage || !b.rewardPercentage) return 0
            aValue = a.rewardPercentage.current
            bValue = b.rewardPercentage.current
            break
          case RewardsColumnKeyEnum.lastCycleRewards:
            aValue = a.lastCycleReward.RIF.crypto.value + a.lastCycleReward.RBTC.crypto.value
            bValue = b.lastCycleReward.RIF.crypto.value + b.lastCycleReward.RBTC.crypto.value
            break
          case RewardsColumnKeyEnum.estimatedRewards:
            aValue = a.estimatedReward.RIF.crypto.value + a.estimatedReward.RBTC.crypto.value
            bValue = b.estimatedReward.RIF.crypto.value + b.estimatedReward.RBTC.crypto.value
            break
          default:
            return 0
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return direction === 'asc'
            ? a.builderName.localeCompare(b.builderName)
            : b.builderName.localeCompare(a.builderName)
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return direction === 'asc' ? aValue - bValue : bValue - aValue
        }

        return 0
      }),
    [rewardsData, sortConfig],
  )

  const paginatedRewardsData = useMemo(
    () => sortedRewardsData.slice(currentPage * buildersPerPage, (currentPage + 1) * buildersPerPage),
    [currentPage, sortedRewardsData],
  )

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!tableDataLength) {
    return <EmptyLeaderboard />
  }

  const handleSort = (key: RewardsColumnKeyEnum) => {
    setSortConfig(prevSortConfig => {
      if (prevSortConfig?.key === key) {
        // Toggle direction if the same column is clicked
        return {
          key,
          direction: prevSortConfig.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      // Set initial sort direction to ascending
      return { key, direction: 'asc' }
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <TableCore className="table-fixed">
        <TableHead>
          <TableRow>
            {tableHeaders.map(header => (
              <TableCell
                key={header.label}
                className={cn(
                  'font-rootstock-sans font-bold text-base leading-none border-b border-solid border-[#2D2D2D]',
                  header.className,
                )}
              >
                <div className="flex flex-row">
                  {header.tooltip && (
                    <Popover
                      content={header.tooltip}
                      className="font-normal text-sm flex items-center"
                      size="small"
                      trigger="hover"
                    >
                      <FaRegQuestionCircle className="mr-1 self-center" />
                    </Popover>
                  )}
                  {header.label}
                  {header.key && (
                    <button
                      className={`text-xs text-white flex items-center ml-1 transition-transform duration-300 ${sortConfig?.key === header.key && sortConfig?.direction === 'asc' ? 'rotate-0' : 'rotate-180'}`}
                      onClick={() => handleSort(header.key)}
                    >
                      {sortConfig?.key === header.key ? (
                        <RiArrowUpSFill className="stroke-2" />
                      ) : (
                        <LiaSortUpSolid />
                      )}
                    </button>
                  )}
                </div>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.values(paginatedRewardsData).map(
            ({
              address,
              builderName,
              lastCycleReward,
              estimatedReward,
              totalAllocationPercentage,
              rewardPercentage,
            }) => (
              <TableRow key={address} className="text-[14px] border-hidden">
                <BuilderNameCell builderName={builderName} address={address} />
                <BackerRewardsPercentage rewardPercentage={rewardPercentage} />
                <LastCycleRewardCell rewards={[lastCycleReward.RBTC, lastCycleReward.RIF]} />
                <EstimatedRewardCell rewards={[estimatedReward.RBTC, estimatedReward.RIF]} />
                <ShareCell totalAllocationPercentage={totalAllocationPercentage} />
                <ActionCell />
              </TableRow>
            ),
          )}
        </TableBody>
      </TableCore>
      <div className="flex justify-center">{paginationUi}</div>
    </div>
  )
}

export const BuildersLeaderBoard = () => {
  const onManageAllocations = () => {
    // TODO: fill the allocation context if necessary and change the route
    console.log('Manage allocations')
  }
  return (
    <>
      <Collapsible defaultOpen>
        <CollapsibleTrigger>
          <div className="flex items-center justify-between w-full">
            <HeaderTitle className="">Rewards leaderboard</HeaderTitle>
            <Button variant="primary" onClick={onManageAllocations}>
              Manage Allocations
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CycleContextProvider>
            <BuilderContextProviderWithPrices>
              <div className="pt-6">
                <BuildersLeaderBoardTable />
              </div>
            </BuilderContextProviderWithPrices>
          </CycleContextProvider>
        </CollapsibleContent>
      </Collapsible>
    </>
  )
}

const EmptyLeaderboard = () => (
  <div className="relative w-full">
    <img className="w-full h-fll object-cover" alt="no builders yet" src="/images/joining-without-text.png" />
    <Typography
      tagVariant="h1"
      className="uppercase font-kk-topo text-[48px] leading-tight font-normal absolute inset-0 flex items-center justify-center tracking-[-0.96px]"
    >
      Builders are joining soon...
    </Typography>
  </div>
)
