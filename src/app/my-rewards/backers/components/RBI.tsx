import { FC } from 'react'
import {
  useGetBackerRBI,
  MetricsCardProps,
  Token,
  useGetBackerStakingHistoryWithStateSync,
  useGetBackerStakingHistoryWithGraph,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Address } from 'viem'
import { useFeatureFlags } from '@/shared/context/FeatureFlag'
import { RewardCard } from '../../components/RewardCard'

interface RBIContentProps extends MetricsCardProps {
  rbiPct: Big
  isLoading: boolean
}

const RBIContent: FC<RBIContentProps> = ({ rbiPct, isLoading }) => {
  return (
    <RewardCard
      isLoading={isLoading}
      title="RBI"
      info={
        <span className="font-rootstock-sans text-sm font-normal">
          Your Realized Backers Incentives (%) represents the actual percentage of rewards you have received
          so far based on your backing allocations.
          <br />
          <br />
          The calculation follows the formula:
          <span className="flex justify-center">
            <span className="flex items-center space-x-1">
              <span className="text-base">Total Staked Time *</span>
              <span className="relative flex flex-col items-center justify-center space-y-1">
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="border-t border-current w-full" />
                </span>
                <span className="text-xs">
                  <span>Total Rewards Earned by Backer</span>
                </span>
                <span className="text-xs">
                  <span>Total stRIF Allocated by Backer</span>
                </span>
              </span>
            </span>
          </span>
          <br />
          This data is for informational purposes only and does not guarantee future performance.
        </span>
      }
      content={`${rbiPct.toFixed(2)}%`}
    />
  )
}

const RBIWStateSync: FC<RBIProps> = ({ backer, tokens, ...metricsCardProps }) => {
  const {
    data: backerStakingHistory,
    isLoading: backerStakingHistoryLoading,
    error: backerStakingHistoryError,
  } = useGetBackerStakingHistoryWithStateSync(backer)
  const {
    data: rbiPct,
    isLoading: rbiPctLoading,
    error: rbiPctError,
  } = useGetBackerRBI(backerStakingHistory, tokens)

  const isLoading = backerStakingHistoryLoading || rbiPctLoading
  const error = backerStakingHistoryError ?? rbiPctError

  useHandleErrors({ error, title: 'Error loading RBI with state sync' })

  return <RBIContent rbiPct={rbiPct} isLoading={isLoading} {...metricsCardProps} />
}

const RBIWTheGraph: FC<RBIProps> = ({ backer, tokens, ...metricsCardProps }) => {
  const {
    data: backerStakingHistory,
    isLoading: backerStakingHistoryLoading,
    error: backerStakingHistoryError,
  } = useGetBackerStakingHistoryWithGraph(backer)
  const {
    data: rbiPct,
    isLoading: rbiPctLoading,
    error: rbiPctError,
  } = useGetBackerRBI(backerStakingHistory, tokens)

  const isLoading = backerStakingHistoryLoading || rbiPctLoading
  const error = backerStakingHistoryError ?? rbiPctError
  useHandleErrors({ error, title: 'Error loading RBI with the graph' })

  return <RBIContent rbiPct={rbiPct} isLoading={isLoading} {...metricsCardProps} />
}

interface RBIProps extends MetricsCardProps {
  backer: Address
  tokens: Record<string, Token>
}
export const RBI: FC<RBIProps> = props => {
  const {
    flags: { use_state_sync },
  } = useFeatureFlags()
  return use_state_sync ? <RBIWStateSync {...props} /> : <RBIWTheGraph {...props} />
}
