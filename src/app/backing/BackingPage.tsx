'use client'

import { useAccount } from 'wagmi'
import { InfoContainer } from './components/Container/backingInfo/InfoContainer'
import { MetricsContainer } from './components/Container/infoMetrics/MetricsContainer'
import { BuildersContainer } from './components/builder-card/BuildersContainer/BuildersContainer'
import { BackingBanner } from '@/app/backing/components/Container/backingInfo/BackingBanner'
import { AnnualBackersIncentivesMetric } from '@/app/backing/components/Container/infoMetrics/AnnualBackersIncentivesMetric'
import { EstimatedRewardsMetric } from '@/app/backing/components/Container/infoMetrics/EstimatedRewardsMetric'
import { ActionsContainer } from '@/app/backing/components/Container/actionMetrics/ActionsContainer'
import { PageTitleContainer } from '@/components/containers'

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
