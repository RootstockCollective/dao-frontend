'use client'

import { BackingBanner } from '@/app/backing/components/BackingBanner/BackingBanner'
import { BackingInfoTitleControl } from '@/app/backing/components/BackingInfoTitle/BackingInfoTitleControl'
import { BackingInfoContainer } from '@/app/backing/components/Container/BackingInfoContainer/BackingInfoContainer'
import { AnnualBackersIncentives } from '@/app/backing/components/Metrics/AnnualBackersIncentives'
import { EstimatedRewardsMetric } from '@/app/backing/components/Metrics/EstimatedRewardsMetric'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context/AllocationsContext'
import { ActionMetricsContainer, ActionsContainer, MetricsContainer } from '@/components/containers'
import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'
import { Header, Span } from '@/components/TypographyNew'
import { stRIF } from '@/lib/constants'
import { useSearchParams } from 'next/navigation'
import { useContext, useMemo } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { formatSymbol } from '../collective-rewards/rewards'
import { AvailableBackingMetric } from './components'
import { BuilderAllocationBar } from './components/BuilderAllocationBar'
import { AnnualBackingIncentives } from './components/Metrics/AnnualBackingIncentives'
import { Spotlight } from './components/Spotlight'

const NAME = 'Backing'

export const BackingPage = () => {
  const searchParams = useSearchParams()
  const { isConnected } = useAccount()
  const {
    state: {
      backer: { amountToAllocate: totalOnchainAllocation, allocationsCount },
    },
  } = useContext(AllocationsContext)

  const userSelections = useMemo(() => searchParams.get('builders')?.split(',') as Address[], [searchParams])

  const hasAllocations = isConnected && totalOnchainAllocation > 0n

  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm">
      <Header caps variant="h1" className="text-3xl leading-10 pb-[2.5rem]">
        {NAME}{' '}
        {isConnected && allocationsCount > 0 && (
          <Span variant="tag" className="text-v3-bg-accent-0 text-lg font-normal normal-case">
            {allocationsCount} Builders
          </Span>
        )}
      </Header>
      {!hasAllocations && (
        <div data-testid="CenterContainer" className="flex w-full items-stretch gap-2">
          <BackingInfoContainer title={<BackingInfoTitleControl />}>
            <BackingBanner />
          </BackingInfoContainer>
          <MetricsContainer className="grow-[3] h-full bg-v3-bg-accent-80">
            <AnnualBackersIncentives />
            <EstimatedRewardsMetric />
          </MetricsContainer>
        </div>
      )}

      {/* FIXME: we need to change the conditions to show the BuilderAllocationBar */}
      {isConnected && <BuilderAllocationBar />}

      {isConnected && (
        <ActionMetricsContainer className="flex flex-col w-full items-start p-6 gap-2 rounded-[4px] bg-v3-bg-accent-80">
          <div className="flex flex-col items-center gap-10 w-full">
            <div className="flex items-start gap-14 w-full">
              <div className="basis-1/2">
                <AvailableBackingMetric />
              </div>
              <div className="flex items-start basis-1/2 gap-14">
                <div className="basis-1/2">
                  <TokenAmountDisplay
                    label="Total backing"
                    amount={formatSymbol(totalOnchainAllocation, stRIF)}
                    tokenSymbol={stRIF}
                  />
                </div>
                {hasAllocations && (
                  <div className="basis-1/2">
                    <AnnualBackingIncentives />
                  </div>
                )}
              </div>
            </div>
            {(hasAllocations || userSelections) && <Spotlight />}
          </div>
        </ActionMetricsContainer>
      )}

      {!hasAllocations && !userSelections && (
        <ActionsContainer
          title={
            <Header variant="h3" caps>
              {isConnected ? 'Builders that you may want to back' : 'In the spotlight'}
            </Header>
          }
          className="bg-v3-bg-accent-80"
        >
          <Spotlight />
        </ActionsContainer>
      )}
    </div>
  )
}
