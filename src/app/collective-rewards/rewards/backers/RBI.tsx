import { FC } from 'react'
import {
  MetricsCardWithSpinner,
  MetricsCardTitle,
  MetricsCardContent,
  useGetBackerRBI,
  MetricsCardProps,
  Token,
  useGetBackerStakingHistoryWithStateSync,
  useGetBackerStakingHistoryWithGraph,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Address } from 'viem'
import { useFeatureFlags } from '@/shared/context/FeatureFlag'

interface RBIContentProps extends MetricsCardProps {
  rbiPct: Big
  isLoading: boolean
}

const RBIContent: FC<RBIContentProps> = ({ rbiPct, isLoading, ...metricsCardProps }) => {
  return (
    <MetricsCardWithSpinner isLoading={isLoading} borderless {...metricsCardProps}>
      <div className="flex flex-col gap-y-[10px]">
        <MetricsCardTitle
          className="text-wrap"
          title="Realized Backers Incentives %"
          data-testid="RBI"
          tooltip={{
            text: 'RBI for Backers',
          }}
        />
        <MetricsCardContent>{`${rbiPct.toFixed(0)}%`}</MetricsCardContent>
      </div>
    </MetricsCardWithSpinner>
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
