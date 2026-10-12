import { Address } from 'viem'

import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useGetBuilderAllTimeShare } from '@/app/my-rewards/builder/hooks/useGetBuilderAllTimeShare'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { Span } from '@/components/Typography'
import { TOKENS } from '@/lib/tokens'

export const AllTimeShare = ({ gauge }: { gauge: Address }) => {
  const rifAddress = TOKENS.rif.address

  // The denominator is now a single protocol-wide total, so this no longer needs the builder list
  // just to collect every gauge address.
  const { amount, isLoading, error } = useGetBuilderAllTimeShare({
    gauge: gauge!,
    rifAddress,
  })

  useHandleErrors({ error, title: 'Error loading all time share' })
  return (
    <RewardCard
      data-testid="all-time-share"
      isLoading={isLoading}
      title="All time share"
      info="Your percentage share of total rewards across all cycles"
    >
      <Span className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--color-v3-text-100)] text-xl font-kk-topo">
        {amount}
      </Span>
    </RewardCard>
  )
}
