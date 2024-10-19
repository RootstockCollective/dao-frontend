import { useGetBuildersRewards } from '@/app/bim/leaderboard/hooks/useGetBuildersRewards'
import { useAlertContext } from '@/app/providers'
import { AddressOrAlias } from '@/components/Address'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { TableBody, TableCell, TableCore, TableHead, TableRow } from '@/components/Table'
import { HeaderTitle, Label, Paragraph, Typography } from '@/components/Typography'
import { tokenContracts } from '@/lib/contracts'
import { cn, formatCurrency } from '@/lib/utils'
import { PricesContextProvider } from '@/shared/context/PricesContext'
import { FC, memo, useEffect } from 'react'
import { isAddress } from 'viem'

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
    lastEpochReward: Reward[]
    projectedReward: Reward[]
    share: string
  }
}

type RewardCellProps = {
  rewards: Reward[]
}

export const RewardCell: FC<RewardCellProps> = ({ rewards }) => (
  <div className="flex flex-nowrap flex-row gap-[50px]">
    {rewards &&
      rewards.map(({ crypto: { value, symbol }, fiat: { value: fiatValue, symbol: fiatSymbol } }) => (
        <div key={value + symbol}>
          <Label className="font-normal text-sm leading-none text-text-primary font-rootstock-sans">
            {value} {symbol}
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

export const BuilderNameCell = ({ builderName }: { builderName: string }) => {
  return (
    <TableCell className={cn(tableHeaders[0], 'border-solid')}>
      <AddressOrAlias addressOrAlias={builderName} />
    </TableCell>
  )
}

export const LastEpochRewardCell = ({ rewards }: { rewards: Reward[] }) => {
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

const ShareCell = ({ share }: { share: string }) => {
  return (
    <TableCell className={cn(tableHeaders[3], 'border-solid text-center')}>
      <Label className={cn(tableBodyCellClasses, getShareTextColour(share))}>{share}</Label>
    </TableCell>
  )
}

const getShareTextColour = (share: string) => {
  const shareValue = parseInt(share)
  if (shareValue >= 50) return 'text-[#1BC47D]'
  if (shareValue >= 20) return 'text-[#E56B1A]'
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
  } = useGetBuildersRewards(tokenContracts.RBTC)
  const {
    data: rifData,
    isLoading: rifLoading,
    error: rifRewardsError,
  } = useGetBuildersRewards(tokenContracts.RIF)
  const { setMessage: setErrorMessage } = useAlertContext()

  const data = [...rbtcData, ...rifData]
  const tableData = data.reduce<TableData>((acc, { address, lastEpochReward, projectedReward, share }) => {
    acc[address] = {
      lastEpochReward: [...(acc[address]?.lastEpochReward ?? []), lastEpochReward],
      projectedReward: [...(acc[address]?.projectedReward ?? []), projectedReward],
      share,
    }

    return acc
  }, {})
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

  return (
    <>
      {isLoading && <LoadingSpinner />}
      {!isLoading && tableDataLength === 0 && <Paragraph>No data available</Paragraph>}
      {!isLoading && tableDataLength > 0 && (
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
            {Object.entries(tableData).map(([address, { lastEpochReward, projectedReward, share }]) => (
              <TableRow key={address + share} className="text-[14px] border-hidden">
                <BuilderNameCell builderName={address} />
                <LastEpochRewardCell rewards={lastEpochReward} />
                <ProjectedRewardCell rewards={projectedReward} />
                <ShareCell share={share} />
              </TableRow>
            ))}
          </TableBody>
        </TableCore>
      )}
    </>
  )
}

export const LeaderBoard = () => {
  return (
    <>
      <HeaderTitle>Rewards leaderboard</HeaderTitle>
      <PricesContextProvider>
        <LeaderBoardTable />
      </PricesContextProvider>
    </>
  )
}
