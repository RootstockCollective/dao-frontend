'use client'

import { BackingBanner } from '@/app/backing/components/BackingBanner/BackingBanner'
import { BackingInfoTitleControl } from '@/app/backing/components/BackingInfoTitle/BackingInfoTitleControl'
import { BackingInfoContainer } from '@/app/backing/components/Container/BackingInfoContainer/BackingInfoContainer'
import { EstimatedRewardsMetric } from '@/app/backing/components/Metrics/EstimatedRewardsMetric'
import { GlobalAnnualBackersIncentives } from '@/app/backing/components/Metrics/GlobalAnnualBackersIncentives'
import { TotalBackingDisplay } from '@/app/backing/components/TotalBackingDisplay'
import {
  Allocations,
  AllocationsContext,
} from '@/app/collective-rewards/allocations/context/AllocationsContext'
import { formatSymbol, getFiatAmount } from '@/app/shared/formatter'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { Button, ButtonProps } from '@/components/Button'
import { ActionMetricsContainer, ActionsContainer, MetricsContainer } from '@/components/containers'
import { Expandable, ExpandableContent, ExpandableTrigger } from '@/components/Expandable'
import { KotoQuestionMarkIcon } from '@/components/Icons'
import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'
import { Tooltip } from '@/components/Tooltip'
import { Header, Label, Span } from '@/components/Typography'
import { RIF, STRIF } from '@/lib/constants'
import { currentLinks } from '@/lib/links'
import { cn, formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useRouter, useSearchParams } from 'next/navigation'
import { useContext, useMemo, useState } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { useBuilderContext } from '../collective-rewards/user'
import { BuilderAllocationBar } from './components/BuilderAllocationBar'
import { Spotlight } from './components/Spotlight'
import { AnimatePresence, motion } from 'motion/react'

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
    <Button
      variant="primary"
      className="md:h-1 px-2 py-1.5 md:px-4 md:py-3 w-auto md:w-fit border-4 md:border-auto"
      onClick={onClick}
    >
      <Span variant="body-s" bold>
        {text}
      </Span>
    </Button>
  )
}

interface DistributeButtonProps extends ButtonProps {
  hideTooltip?: boolean
}

const DistributeButton = ({ onClick, hideTooltip = false }: DistributeButtonProps) => {
  const isDesktop = useIsDesktop()
  return (
    <div className="flex items-center gap-3">
      <Button variant="secondary-outline" className="flex h-7 px-2 py-1 items-center gap-2" onClick={onClick}>
        <Label variant="tag-s" className="text-white font-rootstock-sans text-sm font-normal leading-[145%]">
          Distribute equally
        </Label>
      </Button>
      {!hideTooltip && (
        <div className="flex w-4 py-[6px] flex-col justify-center items-center self-stretch aspect-square">
          <Tooltip
            text={
              <Label variant={isDesktop ? 'body-s' : 'body-xs'}>
                You&apos;ll be distributing equally <br /> to each of the Builders below
              </Label>
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
      )}
    </div>
  )
}

export const BackingPage = () => {
  const isDesktop = useIsDesktop()
  const searchParams = useSearchParams()
  const { isConnected } = useAccount()
  const {
    state: {
      backer: { balance, allocationsCount, cumulativeAllocation },
      allocations,
      isAllocationTxPending,
    },
    initialState: {
      backer: { amountToAllocate: totalOnchainAllocation },
    },
    actions: { updateAllocations },
  } = useContext(AllocationsContext)

  const { randomBuilders } = useBuilderContext()
  const { prices } = usePricesContext()
  const [isExpanded, setIsExpanded] = useState(false)

  const availableToAllocate = balance - totalOnchainAllocation
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
  const hideTooltip = !isExpanded && !isDesktop && hasAllocations

  const availableForBackingStatus = useMemo(() => {
    if (isAllocationTxPending) return 'pending'
    if (availableForBacking > availableToAllocate) return 'increasing'
    if (availableForBacking < availableToAllocate) return 'decreasing'
    return undefined
  }, [availableForBacking, availableToAllocate, isAllocationTxPending])

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
        <ActionMetricsContainer className="flex flex-col w-full items-start px-0 py-6 gap-2 rounded-[4px] bg-v3-bg-accent-80">
          <div className="flex flex-col items-center gap-6 md:gap-10 w-full">
            <div className="flex flex-col md:flex-row items-start w-full px-6 md:gap-14">
              <div className="flex flex-row gap-6 w-full md:w-auto">
                <TokenAmountDisplay
                  label={isDesktop ? 'Available for backing' : 'Available stRIF'}
                  amount={formatSymbol(availableForBacking, STRIF)}
                  tokenSymbol={STRIF}
                  amountInCurrency={hideTooltip ? undefined : availableBackingUSD}
                  status={availableForBackingStatus}
                  actions={
                    availableForBacking > 0n ? (
                      <DistributeButton onClick={distributeBackingEqually} hideTooltip={hideTooltip} />
                    ) : (
                      <StakeButton />
                    )
                  }
                />
                {!isDesktop && (
                  <div className="basis-2/5">
                    <AnimatePresence>
                      {hasAllocations && !isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.25 }}
                        >
                          <TotalBackingDisplay cumulativeAllocation={cumulativeAllocation} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {(isDesktop || !hasAllocations) && (
                <TotalBackingDisplay
                  cumulativeAllocation={cumulativeAllocation}
                  hasAllocations={hasAllocations}
                />
              )}

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <TotalBackingDisplay
                      cumulativeAllocation={cumulativeAllocation}
                      hasAllocations={hasAllocations && isExpanded}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {!isDesktop && hasAllocations && (
                <Expandable className="w-full" onToggleExpanded={setIsExpanded}>
                  <ExpandableTrigger color="var(--color-bg-0)" className="justify-center" />
                </Expandable>
              )}
            </div>
            {(hasAllocations || userSelections) && <Spotlight />}
          </div>
        </ActionMetricsContainer>
      )}

      {!hasAllocations && !userSelections && (
        <ActionsContainer className="bg-v3-bg-accent-80 px-0">
          <Header variant="h3" caps className="px-6">
            {isConnected ? 'Builders that you may want to back' : 'In the spotlight'}
          </Header>
          <Spotlight />
        </ActionsContainer>
      )}
    </div>
  )
}
