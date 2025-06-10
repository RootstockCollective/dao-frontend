'use client'

import { useAccount } from 'wagmi'
import { useMemo, useContext } from 'react'
import { usePricesContext } from '@/shared/context/PricesContext'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context/AllocationsContext'
import { ActionsContainer } from './components/Container'
import { ActionMetricsContainer } from './components/Container/ActionMetricsContainer'
import { InfoContainer } from './components/Container/InfoContainer'
import { MetricsContainer } from './components/Container/MetricsContainer'
import { PageTitleContainer } from './components/Container/PageTitleContainer'
import { Button } from '@/components/Button'
import { Metric } from './components/Metric/Metric'
import { Typography } from '@/components/TypographyNew/Typography'
import { TokenImage } from '@/components/TokenImage'
import { stRIF, RIF } from '@/lib/constants'
import KotoQuestionMarkIcon from '@/components/Icons/KotoQuestionMarkIcon'

const NAME = 'Backing'
export const BackingPage = () => {
  const { address } = useAccount()
  const { prices } = usePricesContext()
  // TODO: add useAllocationsContext hook?
  const { state } = useContext(AllocationsContext)
  const votingPower = state.backer.balance
  const totalOnchainAllocation = state.backer.amountToAllocate
  const rifPriceUsd = prices[RIF]?.price ?? 0

  const availableForBacking = useMemo(() => {
    if (!votingPower || !totalOnchainAllocation) return 0
    return Number(votingPower - totalOnchainAllocation)
  }, [votingPower, totalOnchainAllocation])

  const totalBacking = useMemo(() => {
    if (!totalOnchainAllocation) return 0
    return Number(totalOnchainAllocation)
  }, [totalOnchainAllocation])

  const availableBackingUSD = useMemo(() => {
    if (!availableForBacking || !rifPriceUsd) return 0
    return availableForBacking * rifPriceUsd
  }, [availableForBacking, rifPriceUsd])

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
          <div className="flex w-full items-start gap-14">
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
                <div className="flex flex-col items-start gap-2 self-stretch">
                  <div className="flex h-10 items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="pt-2 items-center [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]">
                        <Typography
                          variant="h1"
                          caps
                          className="text-white overflow-hidden text-ellipsis [-webkit-box-orient:vertical] [-webkit-line-clamp:1] [display:-webkit-box] font-kk-topo text-[32px] font-normal leading-[125%]"
                        >
                          {availableForBacking}
                        </Typography>
                      </div>
                      <div className="flex py-2 pl-2 pr-0 items-center gap-1 rounded">
                        <TokenImage symbol={stRIF} size={24} />
                        <Typography variant="body-l" bold className="text-white text-right">
                          stRIF
                        </Typography>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {availableForBacking === 0 ? (
                        <Button
                          variant="primary"
                          className="flex h-7 px-4 py-3 items-center gap-2 rounded bg-[#F47A2A] hover:bg-[#E6691B]"
                          onClick={() => {
                            // FIXME: Implement staking page and update this navigation
                          }}
                        >
                          <Typography variant="tag-s" className="text-[#171412]">
                            Stake some RIF
                          </Typography>
                        </Button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Button
                            variant="secondary"
                            className="flex h-7 px-2 py-1 items-center gap-2 rounded border border-[#66605C]"
                          >
                            <Typography
                              variant="tag-s"
                              className="text-white font-rootstock-sans text-sm font-normal leading-[145%]"
                            >
                              Distribute equally
                            </Typography>
                          </Button>
                          <div className="flex w-4 py-[6px] flex-col justify-center items-center self-stretch aspect-square">
                            <KotoQuestionMarkIcon />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {availableForBacking > 0 && (
                    <div className="flex items-start self-stretch">
                      <Typography
                        variant="tag-s"
                        className="text-[#ACA39D] font-rootstock-sans text-sm font-medium leading-[145%] self-stretch"
                      >
                        {availableBackingUSD} USD
                      </Typography>
                    </div>
                  )}
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
                <div className="flex flex-col items-start gap-2 self-stretch">
                  <div className="flex h-10 items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="pt-2 items-center [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]">
                        <Typography
                          variant="h1"
                          caps
                          className="text-white overflow-hidden text-ellipsis [-webkit-box-orient:vertical] [-webkit-line-clamp:1] [display:-webkit-box] font-kk-topo text-[32px] font-normal leading-[125%]"
                        >
                          {totalBacking}
                        </Typography>
                      </div>
                      <div className="flex py-2 pl-2 pr-0 items-center gap-1 rounded">
                        <TokenImage symbol={stRIF} size={24} />
                        <Typography variant="body-l" bold className="text-white text-right">
                          stRIF
                        </Typography>
                      </div>
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
