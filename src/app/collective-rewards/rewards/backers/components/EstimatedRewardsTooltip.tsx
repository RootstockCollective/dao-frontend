import { Typography } from '@/components/Typography/Typography'

export const EstimatedRewardsTooltip = () => (
  <>
    <Typography>
      An estimate of the remainder of this Cycle`s rewards from each Builder that will become fully claimable
      by the end of the current Cycle. These rewards gradually transition into your `Claimable Rewards` as the
      cycle progresses.
    </Typography>
    <Typography marginTop="1rem" marginBottom="1rem">
      To check the cycle`s completion, go to Collective Rewards → Current Cycle.
    </Typography>
    <Typography>
      The displayed information is dynamic and may vary based on total rewards and user activity. This data is
      for informational purposes only.
    </Typography>
  </>
)
