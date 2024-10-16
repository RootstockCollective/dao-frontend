import { useGetBuildersRewards } from '@/app/bim/leaderboard/hooks/useGetBuildersRewards'
import { useAlertContext } from '@/app/providers'
import { Address } from '@/components/Address'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Table } from '@/components/Table'
import { HeaderTitle, Label, Paragraph, Typography } from '@/components/Typography'
import { tokenContracts } from '@/lib/contracts'
import { formatCurrency } from '@/lib/utils'
import { PricesContextProvider } from '@/shared/context/PricesContext'
import { memo, useEffect } from 'react'

type Currency = {
  value: number
  symbol?: string
}

type FiatCurrency = {
  value: number
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
    fiat: { value: fiatValue, currency },
  },
}: RewardCellProps) => (
  <>
    <Label className="font-semibold text-sm">
      {onChainValue} {onChainSymbol}
    </Label>
    <br />
    <Label className="font-normal text-sm text-white text-opacity-60">
      {`= ${currency} ${formatCurrency(fiatValue, currency)}`}
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

  const data = rifData.concat(rbtcData)

  const tableData = data.map(({ address, lastEpochReward, projectedReward, share }) => ({
    'Builder name': <BuilderNameCell builderName={address} />,
    'Last Epoch Reward': <LazyRewardCell reward={lastEpochReward} />,
    'Projected Reward': <LazyRewardCell reward={projectedReward} />,

    /*
     * TODO: share appearance should change according to the previous share,
     * but for the MVP it will always be the same
     */
    'Share %': <Label className="font-semibold text-sm">{share}</Label>,
  }))

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
      <HeaderTitle>Rewards leaderboard</HeaderTitle>
      <PricesContextProvider>
        <LeaderBoardTable />
      </PricesContextProvider>
    </>
  )
}
