'use client'

import { useAccount } from 'wagmi'
import { InfoContainer, BackingBanner } from '@/app/backing/components/Container/BackingInfo'
import {
  MetricsContainer,
  AnnualBackersIncentivesMetric,
  EstimatedRewardsMetric,
} from '@/app/backing/components/Container/InfoMetrics'
import { PageTitleContainer } from '@/app/backing/components/Container/PageTitleContainer'
import { BuildersContainer } from '@/app/backing/components/builder-card/BuildersContainer/BuildersContainer'
import { ActionsContainer } from '@/app/backing/components/Container/ActionMetrics'

const NAME = 'Backing'
export const BackingPage = () => {
  const { address } = useAccount()

  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm">
      <PageTitleContainer leftText={NAME} className="mb-8" />
      <div data-testid="CenterContainer" className="flex w-full items-stretch gap-2">
        <InfoContainer
          className="grow-[9] h-full"
          title="Support innovative Builders by allocating your stRIF to those you align with."
        >
          <BackingBanner />
        </InfoContainer>
        <MetricsContainer className="grow-[3] h-full">
          <AnnualBackersIncentivesMetric />
          <EstimatedRewardsMetric />
        </MetricsContainer>
      </div>

      {/* {address && <ActionMetricsContainer>{/* TODO: ADD CHILDREN HERE */}
      {/* </ActionMetricsContainer>} */}
      <ActionsContainer title="BUILDERS THAT YOU MAY WANT TO BACK">
        <BuildersContainer />
      </ActionsContainer>
    </div>
  )
}
