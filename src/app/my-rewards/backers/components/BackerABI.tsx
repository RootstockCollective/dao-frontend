import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { FIXED_ABI_PCT } from '@/lib/constants'

export const BackerABI = () => (
  <RewardCard isLoading={false} title="ABI">
    {`${FIXED_ABI_PCT}%`}
  </RewardCard>
)
