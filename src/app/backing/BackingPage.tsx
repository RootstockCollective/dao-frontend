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
import { Typography } from '@/components/TypographyNew/Typography'

const NAME = 'Backing'
export const BackingPage = () => {
  const { address } = useAccount()
  const [availableForBacking, setAvailableForBacking] = useState(0)
  const [totalBacking, setTotalBacking] = useState(0)

  return (
    <div
      data-testid={NAME}
      className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-10 rounded-sm"
    >
      <PageTitleContainer leftText={NAME}>
        {/* TODO: ADD CHILDREN HERE OR TEXT IN LEFT_TEXT */}
      </PageTitleContainer>
      <div data-testid="CenterContainer" className="flex flex-col items-start gap-2">
        <InfoContainer className="grow-[9]">{/* TODO: ADD CHILDREN HERE */}</InfoContainer>
        <MetricsContainer className="flex flex-col items-start w-[1144px] p-6">
          <div className="flex w-full gap-4">
            <Metric
              title={
                <Typography 
                  variant="tag" 
                  className="text-[#ACA39D] text-base font-medium font-rootstock-sans leading-[150%]"
                >
                  Available for backing
                </Typography>
              }
              className="flex-1"
              content={
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Typography 
                      variant="h1" 
                      caps 
                      className="text-white overflow-hidden text-ellipsis [-webkit-box-orient:vertical] [-webkit-line-clamp:1] [display:-webkit-box] leading-[40px]"
                    >
                      {availableForBacking}
                    </Typography>
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 bg-[#4B5CF0] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">st</span>
                      </div>
                      <Typography 
                        variant="body-l" 
                        bold 
                        className="text-white text-right"
                      >
                        stRIF
                      </Typography>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {availableForBacking === 0 ? (
                      <Button
                        variant="primary"
                        className="w-full bg-[#F47A2A] hover:bg-[#E6691B]"
                        onClick={() => {
                          // FIXME: Implement staking page and update this navigation
                        }}
                      >
                        <Typography 
                          variant="tag-s" 
                          className="text-[#171412]"
                        >
                          Stake some RIF
                        </Typography>
                      </Button>
                    ) : (
                      <Button variant="secondary" className="w-full">
                        <Typography 
                          variant="tag-s" 
                          className="text-[#171412]"
                        >
                          Distribute Equally
                        </Typography>
                      </Button>
                    )}
                  </div>
                </div>
              }
            />
            <Metric
              title={
                <Typography 
                  variant="tag" 
                  className="text-[#ACA39D] text-base font-medium font-rootstock-sans leading-[150%]"
                >
                  Total backing
                </Typography>
              }
              className="flex-1"
              content={
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Typography 
                      variant="h1" 
                      caps 
                      className="text-white overflow-hidden text-ellipsis [-webkit-box-orient:vertical] [-webkit-line-clamp:1] [display:-webkit-box] leading-[40px]"
                    >
                      {totalBacking}
                    </Typography>
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 bg-[#4B5CF0] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">st</span>
                      </div>
                      <Typography 
                        variant="body-l" 
                        bold 
                        className="text-white text-right"
                      >
                        stRIF
                      </Typography>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </MetricsContainer>
      </div>

      {address && <ActionMetricsContainer>{/* TODO: ADD CHILDREN HERE */}</ActionMetricsContainer>}
      <ActionsContainer title="TODO: ADD TITLE COMPONENT" />
    </div>
  )
}
