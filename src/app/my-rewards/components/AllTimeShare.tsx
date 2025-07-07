import { RequiredBuilder } from '@/app/collective-rewards/types'
import { useGetBuildersByState } from '@/app/collective-rewards/user'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Span } from '@/components/TypographyNew/'
import { getTokens } from '@/lib/tokens'
import { Address } from 'viem'
import { useBuilderAllTimeShare } from '../hooks/useBuilderAllTimeShare'
import { RewardCard } from './RewardCard'

export interface RewardCardAllTimeShareProps {
  isLoading: boolean
  amount: string
}

export const AllTimeShare = ({ gauge }: { gauge: Address }) => {
  const { data: activatedBuilders, error: activatedBuildersError } = useGetBuildersByState<RequiredBuilder>({
    activated: true,
  })
  const activatedGauges = activatedBuilders?.map(({ gauge }) => gauge) ?? []

  useHandleErrors({ error: activatedBuildersError, title: 'Error loading gauges' })

  const rifAddress = getTokens().rif.address

  const { amount, isLoading, error } = useBuilderAllTimeShare({
    gauge: gauge!,
    gauges: activatedGauges,
    rifAddress,
  })

  useHandleErrors({ error, title: 'Error loading all time share' })
  return (
    <RewardCard
      data-testid="all-time-share"
      isLoading={isLoading}
      title="All time share"
      info="Your percentage share of total rewards across all cycles"
      content={
        <Span className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--color-v3-text-100)] text-xl font-kk-topo">
          {amount}
        </Span>
      }
    />
  )
}
