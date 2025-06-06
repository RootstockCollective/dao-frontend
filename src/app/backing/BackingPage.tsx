'use client'

import { useAccount } from 'wagmi'
import { useState } from 'react'
import { ActionsContainer } from './components/Container'
import { ActionMetricsContainer } from './components/Container/ActionMetricsContainer'
import { InfoContainer } from './components/Container/InfoContainer'
import { MetricsContainer } from './components/Container/MetricsContainer'
import { PageTitleContainer } from './components/Container/PageTitleContainer'
import { Button } from '@/components/Button'
import { Metric } from './components/Metric/Metric'

const NAME = 'Backing'
export const BackingPage = () => {
  const { address } = useAccount()
  const [availableForBacking, setAvailableForBacking] = useState(0)

  return (
    <div
      data-testid={NAME}
      className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-10 rounded-sm"
    >
      <PageTitleContainer leftText={NAME}>
        {/* TODO: ADD CHILDREN HERE OR TEXT IN LEFT_TEXT */}
      </PageTitleContainer>
      <div data-testid="CenterContainer" className="flex w-full items-start gap-2">
        <InfoContainer className="grow-[9]">{/* TODO: ADD CHILDREN HERE */}</InfoContainer>
        <MetricsContainer className="grow-[3]">
          <Metric
            title="Available for backing"
            content={
              <div className="flex flex-col gap-4">
                <div className="text-[48px]">{availableForBacking}</div>
                <div className="flex gap-2">
                  {availableForBacking === 0 ? (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => {
                        // FIXME: Implement staking page and update this navigation
                      }}
                    >
                      Stake some RIF
                    </Button>
                  ) : (
                    <Button variant="secondary" className="w-full">
                      Distribute Equally
                    </Button>
                  )}
                </div>
              </div>
            }
          />
        </MetricsContainer>
      </div>

      {address && <ActionMetricsContainer>{/* TODO: ADD CHILDREN HERE */}</ActionMetricsContainer>}
      <ActionsContainer title="TODO: ADD TITLE COMPONENT" />
    </div>
  )
}
