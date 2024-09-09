import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Table } from '@/components/Table'
import { Label, Paragraph, Typography } from '@/components/Typography'
import { formatCurrency } from '@/lib/utils'
import { Reward, useLeaderBoardContext } from '@/app/bim/leaderboard/LeaderBoardContext'
import { Address } from '@/components/Address'

type RewardCellProps = {
  reward: Reward
}

export const RewardCell = ({ reward }: RewardCellProps) => (
  <>
    <Label className="font-semibold text-sm">
      {reward.onChain.value} {reward.onChain.symbol}
    </Label>
    <br />
    <Label className="font-normal text-sm text-white text-opacity-60">
      {`= ${reward.fiat.symbol} ${reward.fiat.currency} ${formatCurrency(reward.fiat.value)}`}
    </Label>
  </>
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

export const LeaderBoard = () => {
  const { data, isLoading } = useLeaderBoardContext()

  const tableData = data.map(({ name, lastEpochReward, projectedReward, performance }) => ({
    'Builder name': <BuilderNameCell builderName={name} />,
    'Last Epoch Reward': <RewardCell reward={lastEpochReward} />,
    'Projected Reward': <RewardCell reward={projectedReward} />,
    /*
     * TODO: performance appearance should change according to the previous performance,
     * but for the MVP it will always be the same
     */
    'Performance %': <Label className="font-semibold text-sm">{performance}</Label>,
  }))
  return (
    <>
      <Paragraph className="font-semibold text-[18px]">Rewards leaderboard</Paragraph>
      {isLoading && <LoadingSpinner />}
      {!isLoading && data.length === 0 && <Paragraph>No data available</Paragraph>}
      {!isLoading && data.length > 0 && (
        <Table data={tableData} headerClassName="font-sora font-bold text-sm" />
      )}
    </>
  )
}
