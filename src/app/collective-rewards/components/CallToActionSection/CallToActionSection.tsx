import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import { InfoContainer } from '@/components/containers'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { REWARD_TOKEN_KEYS, TOKENS } from '@/lib/tokens'
import { useHandleErrors } from '../../utils'
import { BackersCallToAction } from '../BackersCallToAction'
import { BuildersCallToAction } from '../BuildersCallToAction'
import { TokenWithValue } from '../RewardsMetrics'

export const CallToActionSection = () => {
  const {
    data: estimatedRewards,
    isLoading: estimatedRewardsLoading,
    error: estimatedRewardsError,
  } = useGetBuilderEstimatedRewards()

  useHandleErrors({ error: estimatedRewardsError, title: 'Error loading CTA section' })

  const { backer: backerRewardsTokens, builder: builderRewardsTokens } = estimatedRewards.reduce<{
    backer: TokenWithValue[]
    builder: TokenWithValue[]
  }>(
    ({ backer, builder }, { backerEstimatedRewards, builderEstimatedRewards }) => {
      return {
        backer: REWARD_TOKEN_KEYS.map((tokenKey, index) => ({
          ...TOKENS[tokenKey],
          value: (backer[index]?.value ?? 0n) + (backerEstimatedRewards[tokenKey]?.amount?.value ?? 0n),
        })),
        builder: REWARD_TOKEN_KEYS.map((tokenKey, index) => ({
          ...TOKENS[tokenKey],
          value: (builder[index]?.value ?? 0n) + (builderEstimatedRewards[tokenKey]?.amount?.value ?? 0n),
        })),
      }
    },
    { backer: [], builder: [] },
  )

  if (estimatedRewardsLoading) {
    return <LoadingSpinner />
  }

  return (
    <InfoContainer className="flex-col md:flex-row p-0 pt-1 w-full">
      <BackersCallToAction rewardTokens={backerRewardsTokens} />
      <BuildersCallToAction rewardTokens={builderRewardsTokens} />
    </InfoContainer>
  )
}
