'use client'

import { BackingBanner } from '@/app/backing/components/BackingBanner/BackingBanner'
import { BackingInfoTitleControl } from '@/app/backing/components/BackingInfoTitle/BackingInfoTitleControl'
import { BackingInfoContainer } from '@/app/backing/components/Container/BackingInfoContainer/BackingInfoContainer'
import { EstimatedRewardsMetric } from '@/app/backing/components/Metrics/EstimatedRewardsMetric'
import { GlobalAnnualBackersIncentives } from '@/app/backing/components/Metrics/GlobalAnnualBackersIncentives'
import {
  Allocations,
  AllocationsContext,
} from '@/app/collective-rewards/allocations/context/AllocationsContext'
import { Button, ButtonProps } from '@/components/Button'
import { ActionMetricsContainer, ActionsContainer, MetricsContainer } from '@/components/containers'
import { KotoQuestionMarkIcon } from '@/components/Icons'
import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'
import { Tooltip } from '@/components/Tooltip'
import { Header, Label, Span } from '@/components/Typography'
import { RIF, STRIF } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { useRouter, useSearchParams } from 'next/navigation'
import { useContext, useMemo } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { formatSymbol, getFiatAmount } from '../collective-rewards/rewards'
import { useBuilderContext } from '../collective-rewards/user'
import { BuilderAllocationBar } from './components/BuilderAllocationBar'
import { BackerAnnualBackersIncentives } from './components/Metrics/BackerAnnualBackersIncentives'
import { Spotlight } from './components/Spotlight'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { currentLinks } from '@/lib/links'

const NAME = 'Backing'

const StakeButton = () => {
  const router = useRouter()
  const { balances } = useBalancesContext()

  const { hasRifBalance, getRifLink } = useMemo(() => {
    const rifBalance = Number(balances[RIF]?.balance ?? 0)
    const getRifLink = new URL(currentLinks.getRif)

    return {
      hasRifBalance: rifBalance > 0,
      getRifLink: getRifLink.toString(),
    }
  }, [balances])

  const { onClick, text } = hasRifBalance
    ? {
        onClick: () => router.push('/user?action=stake'),
        text: 'Stake RIF',
      }
    : {
        onClick: () => window.open(getRifLink.toString(), '_blank'),
        text: 'Get RIF',
      }

  return (
    <>
      <Button variant="primary" className="flex h-7 px-4 py-3 items-center gap-2" onClick={onClick}>
        <Span variant="body-s" bold>
          {text}
        </Span>
      </Button>
    </>
  )
}

const DistributeButton = ({ onClick }: ButtonProps) => (
  <div className="flex items-center gap-3">
    <Button variant="secondary-outline" className="flex h-7 px-2 py-1 items-center gap-2" onClick={onClick}>
      <Label variant="tag-s" className="text-white font-rootstock-sans text-sm font-normal leading-[145%]">
        Distribute equally
      </Label>
    </Button>
    <div className="flex w-4 py-[6px] flex-col justify-center items-center self-stretch aspect-square">
      <Tooltip
        text={
          <div className="flex w-[269px] p-6 flex-col items-start gap-2">
            <Label className="self-stretch text-v3-bg-accent-100 font-rootstock-sans text-[14px] font-normal leading-[145%]">
              You&apos;ll be distributing equally to each of the Builders below
            </Label>
          </div>
        }
        side="top"
        align="center"
        alignOffset={-60}
        sideOffset={10}
        className="bg-v3-text-80 rounded-[4px] shadow-lg"
      >
        <KotoQuestionMarkIcon />
      </Tooltip>
    </div>
  </div>
)

export const BackingPage = () => {
  const searchParams = useSearchParams()
  const { isConnected } = useAccount()
  const {
    state: {
      backer: { balance, allocationsCount, cumulativeAllocation },
      allocations,
    },
    initialState: {
      backer: { amountToAllocate: totalOnchainAllocation, balance: totalVotingPower },
    },
    actions: { updateAllocations },
  } = useContext(AllocationsContext)

  const { randomBuilders } = useBuilderContext()
  const { prices } = usePricesContext()
  const router = useRouter()

  const availableForBacking = balance - cumulativeAllocation
  const availableBackingUSD = useMemo(() => {
    const rifPriceUsd = prices[RIF]?.price ?? 0

    return !availableForBacking || !rifPriceUsd
      ? formatCurrency(0)
      : formatCurrency(getFiatAmount(availableForBacking, rifPriceUsd))
  }, [availableForBacking, prices])

  const distributeBackingEqually = () => {
    //FIXME: Take into account the inactive builders
    let newAllocations: Allocations = {}
    if (allocationsCount) {
      newAllocations = Object.keys(allocations).reduce((acc, key) => {
        const builderAddress = key as Address
        const newAllocation = availableForBacking / BigInt(allocationsCount) + allocations[builderAddress]
        acc[builderAddress] = newAllocation

        return acc
      }, {} as Allocations)

      return updateAllocations(newAllocations)
    }

    updateAllocations(
      randomBuilders.reduce((acc, builder) => {
        acc[builder.address] = availableForBacking / BigInt(randomBuilders.length)

        return acc
      }, {} as Allocations),
    )
  }

  const userSelections = useMemo(() => searchParams.get('builders')?.split(',') as Address[], [searchParams])

  const hasAllocations = isConnected && totalOnchainAllocation > 0n

  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm">
      <Header caps variant="h1" className="text-3xl leading-10 pb-[2.5rem]">
        {NAME}
      </Header>
      {!hasAllocations && (
        <div data-testid="CenterContainer" className="flex w-full items-stretch gap-2">
          <BackingInfoContainer title={<BackingInfoTitleControl />}>
            <BackingBanner />
          </BackingInfoContainer>
          <MetricsContainer className="grow-[3] h-full bg-v3-bg-accent-80">
            <GlobalAnnualBackersIncentives />
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
                <TokenAmountDisplay
                  label="Available for backing"
                  amount={formatSymbol(availableForBacking, STRIF)}
                  tokenSymbol={STRIF}
                  amountInCurrency={availableBackingUSD}
                  actions={
                    availableForBacking > 0n ? (
                      <DistributeButton onClick={distributeBackingEqually} />
                    ) : (
                      <StakeButton />
                    )
                  }
                />
              </div>
              <div className="flex items-start basis-1/2 gap-14">
                <div className="basis-1/2">
                  <TokenAmountDisplay
                    label="Total backing"
                    amount={formatSymbol(cumulativeAllocation, STRIF)}
                    tokenSymbol={STRIF}
                  />
                </div>
                {hasAllocations && (
                  <div className="basis-1/2">
                    <BackerAnnualBackersIncentives />
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
