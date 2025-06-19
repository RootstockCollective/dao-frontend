'use client'

import { useAccount } from 'wagmi'
import { BuildersSpotlight } from '@/app/backing/components/BuildersSpotlight/BuildersSpotlight'
import { ActionsContainer } from '@/components/containers'
import { BackingBanner } from '@/app/backing/components/BackingBanner/BackingBanner'
import { BackingInfoContainer } from '@/app/backing/components/Container/BackingInfoContainer/BackingInfoContainer'
import { MetricsContainer } from '@/components/containers'
import { AnnualBackersIncentivesMetric } from '@/app/backing/components/Metrics/AnnualBackersIncentivesMetric'
import { EstimatedRewardsMetric } from '@/app/backing/components/Metrics/EstimatedRewardsMetric'
import { useGetBuildersRewards } from '@/app/collective-rewards/rewards/builders/hooks/useGetBuildersRewards'
import { getTokens } from '@/lib/tokens'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Header } from '@/components/TypographyNew'

const NAME = 'Backing'
export const BackingPage = () => {
  const { address } = useAccount()
  const { data: rewardsData, error: rewardsError } = useGetBuildersRewards(getTokens())
  useHandleErrors({ error: rewardsError, title: 'Error loading builder rewards' })

  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm">
      <Header caps variant="h1" className="text-3xl leading-10 pb-[2.5rem]">
        {NAME}
      </Header>
      <div data-testid="CenterContainer" className="flex w-full items-stretch gap-2">
        <BackingInfoContainer
          className="grow-[9] h-full"
          title="Support innovative Builders by allocating your stRIF to those you align with."
        >
          <BackingBanner />
        </BackingInfoContainer>
        <MetricsContainer className="grow-[3] h-full">
          <AnnualBackersIncentivesMetric />
          <EstimatedRewardsMetric rewardsData={rewardsData} />
        </MetricsContainer>
      </div>

      {/* {address && <ActionMetricsContainer>{/* TODO: ADD CHILDREN HERE */}
      {/* </ActionMetricsContainer>} */}
      <ActionsContainer title="BUILDERS THAT YOU MAY WANT TO BACK" className="">
        <BuildersSpotlight rewardsData={rewardsData} />
      </ActionsContainer>
    </div>
  )
}
