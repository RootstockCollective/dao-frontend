'use client'

import { useAccount } from 'wagmi'
import { PageTitleContainer } from '@/app/backing/components/Container/PageTitleContainer'
import { BuildersSpotlight } from '@/app/backing/components/BuildersSpotlight/BuildersSpotlight'
import { ActionsContainer } from '@/app/backing/components/Container/ActionContainer/ActionsContainer'
import { BackingBanner } from '@/app/backing/components/BackingBanner/BackingBanner'
import { BackingInfoContainer } from '@/app/backing/components/Container/BackingInfoContainer/BackingInfoContainer'
import { MetricsContainer } from '@/app/backing/components/Container/MetricsContainer/MetricsContainer'
import { AnnualBackersIncentivesMetric } from '@/app/backing/components/Metrics/AnnualBackersIncentivesMetric'
import { EstimatedRewardsMetric } from '@/app/backing/components/Metrics/EstimatedRewardsMetric'

const NAME = 'Backing'
export const BackingPage = () => {
  const { address } = useAccount()

  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm">
      <PageTitleContainer leftText={NAME} className="mb-8" />
      <div data-testid="CenterContainer" className="flex w-full items-stretch gap-2">
        <BackingInfoContainer
          className="grow-[9] h-full"
          title="Support innovative Builders by allocating your stRIF to those you align with."
        >
          <BackingBanner />
        </BackingInfoContainer>
        <MetricsContainer className="grow-[3] h-full">
          <AnnualBackersIncentivesMetric />
          <EstimatedRewardsMetric />
        </MetricsContainer>
      </div>

      {/* {address && <ActionMetricsContainer>{/* TODO: ADD CHILDREN HERE */}
      {/* </ActionMetricsContainer>} */}
      <ActionsContainer title="BUILDERS THAT YOU MAY WANT TO BACK">
        <BuildersSpotlight />
      </ActionsContainer>
    </div>
  )
}
