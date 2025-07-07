import { CompleteBuilder } from '@/app/collective-rewards/types'
import { filterBuildersByState, useBuilderContext } from '@/app/collective-rewards/user'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Span } from '@/components/TypographyNew/'
import { TOKENS } from '@/lib/tokens'
import { Address } from 'viem'
import { useGetBuilderAllTimeShare } from '@/app/my-rewards/builder/hooks/useGetBuilderAllTimeShare'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'

export interface RewardCardAllTimeShareProps {
  isLoading: boolean
  amount: string
}

export const AllTimeShare = ({ gauge }: { gauge: Address }) => {
  const { builders, isLoading: isBuildersLoading, error: buildersError } = useBuilderContext()
  const activatedBuilders = filterBuildersByState<CompleteBuilder>(builders, {
    activated: true,
  })

  const activatedGauges = activatedBuilders?.map(({ gauge }) => gauge) ?? []

  const rifAddress = TOKENS.rif.address

  const { amount, isLoading, error } = useGetBuilderAllTimeShare({
    gauge: gauge!,
    gauges: activatedGauges,
    rifAddress,
  })

  useHandleErrors({ error: buildersError || error, title: 'Error loading all time share' })
  return (
    <RewardCard
      data-testid="all-time-share"
      isLoading={isBuildersLoading || isLoading}
      title="All time share"
      info="Your percentage share of total rewards across all cycles"
    >
      <Span className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--color-v3-text-100)] text-xl font-kk-topo">
        {amount}
      </Span>
    </RewardCard>
  )
}
