import { useGetBuildersRewards } from '@/app/collective-rewards/leaderboard/hooks/useGetBuildersRewards'
import { useAlertContext } from '@/app/providers'
import { AddressOrAlias, reduceAddress } from '@/components/Address'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { TableBody, TableCell, TableCore, TableHead, TableRow } from '@/components/Table'
import { HeaderTitle, Label, Typography } from '@/components/Typography'
import { tokenContracts } from '@/lib/contracts'
import { cn, formatCurrency, toFixed } from '@/lib/utils'
import { FC, memo, useEffect } from 'react'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { BuilderContextProviderWithPrices } from '@/app/collective-rewards/BuilderContext'
import { Popover } from '@/components/Popover'

type Currency = {
  value: number
  symbol: string
}

export type Reward = {
  crypto: Currency
  fiat: Currency
}

type TableData = {
  [address: string]: {
    displayName: string
    lastCycleReward: Reward[]
    projectedReward: Reward[]
    share: bigint
  }
}

type RewardCellProps = {
  rewards: Reward[]
}

export const RewardCell: FC<RewardCellProps> = ({ rewards }) => (
  <div className="flex flex-nowrap flex-row gap-1">
    {rewards &&
      rewards.map(({ crypto: { value, symbol }, fiat: { value: fiatValue, symbol: fiatSymbol } }) => (
        <div key={value + symbol} className="flex-1">
          {/* TODO: if the value is very small, should we show it in Gwei/wei? */}
          <Label className="font-normal text-sm leading-none text-text-primary font-rootstock-sans">
            {toFixed(value)} {symbol}
          </Label>
          <br />
          <Label className="font-normal text-sm leading-none text-disabled-primary font-rootstock-sans">
            {`= ${fiatSymbol} ${formatCurrency(fiatValue, fiatSymbol)}`}
          </Label>
        </div>
      ))}
  </div>
)

export const LazyRewardCell = memo(RewardCell, ({ rewards: prevReward }, { rewards: nextReward }) =>
  prevReward.every((reward, key) => reward.fiat.value === nextReward[key].fiat.value),
)

export const BuilderNameCell = ({ builderName, address }: { builderName: string; address: string }) => {
  return (
    <TableCell className={cn(tableHeaders[0], 'border-solid')}>
      <div className="flex flex-row gap-x-1">
        <Jdenticon className="rounded-md bg-white" value={builderName} size="24" />
        <Popover
          content={
            <div className="text-[12px] font-bold mb-1">
              <p data-testid="builderAddressTooltip">{reduceAddress(address)}</p>
            </div>
          }
          size="small"
          trigger="hover"
        >
          <Typography tagVariant="label" className="font-semibold line-clamp-1 text-wrap">
            <AddressOrAlias addressOrAlias={builderName} clipboard={address} className="text-sm" />
          </Typography>
        </Popover>
      </div>
    </TableCell>
  )
}

export const LastCycleRewardCell = ({ rewards }: { rewards: Reward[] }) => {
  return (
    <TableCell className={cn(tableHeaders[1], 'border-solid')}>
      <LazyRewardCell rewards={rewards} />
    </TableCell>
  )
}

const ProjectedRewardCell = ({ rewards }: { rewards: Reward[] }) => {
  return (
    <TableCell className={cn(tableHeaders[2], 'border-solid')}>
      <LazyRewardCell rewards={rewards} />
    </TableCell>
  )
}

const ShareCell = ({ share }: { share: bigint }) => {
  return (
    <TableCell className={cn(tableHeaders[3], 'border-solid text-center')}>
      <Label className={cn(tableBodyCellClasses, getShareTextColour(share))}>{share.toString()}%</Label>
    </TableCell>
  )
}

const getShareTextColour = (share: bigint) => {
  if (share >= 50n) return 'text-[#1BC47D]'
  if (share >= 20n) return 'text-[#E56B1A]'
  return 'text-[#F24822]'
}

const tableHeaders = [
  { label: 'Builder', width: 'w-[38%]' },
  { label: 'Last cycle Rewards', width: 'w-[24%]' },
  { label: 'Projected Rewards', width: 'w-[24%]' },
  { label: 'Share %', width: 'w-[14%]', text_position: 'text-center' },
]

const tableBodyCellClasses = 'font-normal text-base leading-none text-text-primary font-rootstock-sans'

const LeaderBoardTable = () => {
  const {
    data: rbtcData,
    isLoading: rbtcLoading,
    error: rbtcRewardsError,
  } = useGetBuildersRewards(tokenContracts.RBTC, 'RBTC')
  const {
    data: rifData,
    isLoading: rifLoading,
    error: rifRewardsError,
  } = useGetBuildersRewards(tokenContracts.RIF, 'RIF')
  const { setMessage: setErrorMessage } = useAlertContext()

  const data = [...rbtcData, ...rifData]
  const tableData = data.reduce<TableData>(
    (acc, { address, builderName, lastCycleReward, projectedReward, share }) => {
      const currentShare = acc[address]?.share ?? 0n
      acc[address] = {
        displayName: builderName || address,
        lastCycleReward: [...(acc[address]?.lastCycleReward ?? []), lastCycleReward],
        projectedReward: [...(acc[address]?.projectedReward ?? []), projectedReward],
        share: share > currentShare ? share : currentShare,
      }

      return acc
    },
    {},
  )
  const tableDataLength = Object.keys(tableData).length

  const isLoading = rbtcLoading || rifLoading

  useEffect(() => {
    if (rbtcRewardsError) {
      setErrorMessage({
        severity: 'error',
        title: 'Error loading RBTC rewards',
        content: rbtcRewardsError.message,
      })
      console.error('🐛 rbtcRewardsError:', rbtcRewardsError)
    }
  }, [rbtcRewardsError, setErrorMessage])

  useEffect(() => {
    if (rifRewardsError) {
      setErrorMessage({
        severity: 'error',
        title: 'Error loading RIF rewards',
        content: rifRewardsError.message,
      })
      console.error('🐛 rifRewardsError:', rifRewardsError)
    }
  }, [rifRewardsError, setErrorMessage])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!tableDataLength) {
    return <EmptyLeaderboard />
  }

  return (
    <TableCore>
      <TableHead>
        <TableRow>
          {tableHeaders.map(header => (
            <TableCell
              key={header.label}
              className={cn(
                'font-rootstock-sans font-bold text-base leading-none border-b border-solid border-[#2D2D2D]',
                header.width,
                header.text_position,
              )}
            >
              {header.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(tableData).map(
          ([address, { displayName, lastCycleReward, projectedReward, share }]) => (
            <TableRow key={address + share} className="text-[14px] border-hidden">
              <BuilderNameCell builderName={displayName} address={address} />
              <LastCycleRewardCell rewards={lastCycleReward} />
              <ProjectedRewardCell rewards={projectedReward} />
              <ShareCell share={share} />
            </TableRow>
          ),
        )}
      </TableBody>
    </TableCore>
  )
}

export const LeaderBoard = () => {
  return (
    <>
      <HeaderTitle>Rewards leaderboard</HeaderTitle>
      <BuilderContextProviderWithPrices>
        <LeaderBoardTable />
      </BuilderContextProviderWithPrices>
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
