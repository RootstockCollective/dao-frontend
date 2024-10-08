import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Table } from '@/components/Table'
import { Label, Paragraph, Typography } from '@/components/Typography'
import { formatCurrency } from '@/lib/utils'
import { Address } from '@/components/Address'
import { PricesContextProvider } from '@/shared/context/PricesContext'
import { useGetBuildersRewards } from '@/app/bim/leaderboard/hooks/useGetBuildersRewards'
import { memo } from 'react'
import { tokenContracts } from '@/lib/contracts'

type Currency = {
  value: number
  symbol?: string
}

type FiatCurrency = Currency & {
  currency: string
}

export type Reward = {
  onChain: Currency
  fiat: FiatCurrency
}

type RewardCellProps = {
  reward: Reward
}

export const RewardCell = ({
  reward: {
    onChain: { value: onChainValue, symbol: onChainSymbol },
    fiat: { value: fiatValue, symbol: fiatSymbol, currency: fiatCurrency },
  },
}: RewardCellProps) => (
  <>
    <Label className="font-semibold text-sm">
      {onChainValue} {onChainSymbol}
    </Label>
    <br />
    <Label className="font-normal text-sm text-white text-opacity-60">
      {`= ${fiatSymbol} ${fiatCurrency} ${formatCurrency(fiatValue)}`}
    </Label>
  </>
)

export const LazyRewardCell = memo(
  RewardCell,
  (
    {
      reward: {
        fiat: { value: prevValue },
      },
    },
    {
      reward: {
        fiat: { value: nextValue },
      },
    },
  ) => prevValue === nextValue,
)

const isAddress = (builderName: string) => builderName.startsWith('0x') && builderName.length === 42

const BuilderNameCell = ({ builderName }: { builderName: string }) => {
  return isAddress(builderName) ? (
    <Address address={builderName} />
  ) : (
    <Typography tagVariant="label" className="font-semibold text-sm">
      {builderName}
    </Typography>
  )
}

const LeaderBoardTable = () => {
  const { data: rbtcData, isLoading: rbtcLoading } = useGetBuildersRewards(tokenContracts.RBTC)
  const { data: rifData, isLoading: rifLoading } = useGetBuildersRewards(tokenContracts.RIF)
  const data = rifData.concat(rbtcData)

  const tableData = data.map(({ address, lastEpochReward, projectedReward, performance }) => ({
    'Builder name': <BuilderNameCell builderName={address} />,
    'Last Epoch Reward': <LazyRewardCell reward={lastEpochReward} />,
    'Projected Reward': <LazyRewardCell reward={projectedReward} />,

    /*
     * TODO: performance appearance should change according to the previous performance,
     * but for the MVP it will always be the same
     */
    'Performance %': <Label className="font-semibold text-sm">{performance}</Label>,
  }))

  const isLoading = rbtcLoading || rifLoading

  return (
    <>
      {isLoading && <LoadingSpinner />}
      {!isLoading && data.length === 0 && <Paragraph>No data available</Paragraph>}
      {!isLoading && data.length > 0 && (
        <Table data={tableData} headerClassName="font-sora font-bold text-sm" />
      )}
    </>
  )
}

export const LeaderBoard = () => {
  return (
    <>
      <Paragraph className="font-semibold text-[18px]">Rewards leaderboard</Paragraph>
      <PricesContextProvider>
        <LeaderBoardTable />
      </PricesContextProvider>
    </>
  )
}
