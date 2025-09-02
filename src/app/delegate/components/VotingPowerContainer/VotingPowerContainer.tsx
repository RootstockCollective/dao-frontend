'use client'
import { Header } from '@/components/Typography'
import { VOTING_POWER_CARDS_INFO } from '../../lib/constants'
import { CardsState } from '../../lib/types'
import { VotingPowerCard, VotingPowerCardProps } from './VotingPowerCard'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { cn } from '@/lib/utils'

interface VotingPowerContainerProps {
  cards: CardsState
}

type CardsProps = VotingPowerCardProps & {
  dataTestId: string
  shouldDisplay: boolean
}

/**
 * Should use useDelegateContext
 * @param cards
 * @constructor
 */
export const VotingPowerContainer = ({ cards }: VotingPowerContainerProps) => {
  const isDesktop = useIsDesktop()
  const { isConnected } = useAccount()

  const votingPowerCards: CardsProps[] = useMemo(
    () =>
      [
        {
          ...VOTING_POWER_CARDS_INFO.available,
          ...cards.available,
          dataTestId: 'AvailableVotingPowerCard',
          shouldDisplay: true,
        },
        {
          ...VOTING_POWER_CARDS_INFO.own,
          ...cards.own,
          dataTestId: 'OwnVotingPowerCard',
          shouldDisplay: true,
        },
        {
          ...VOTING_POWER_CARDS_INFO.received,
          ...cards.received,
          dataTestId: 'ReceivedVotingPowerCard',
          shouldDisplay: isConnected || isDesktop,
        },
        {
          ...VOTING_POWER_CARDS_INFO.delegated,
          ...cards.delegated,
          dataTestId: 'DelegatedVotingPowerCard',
          shouldDisplay: isConnected || isDesktop,
        },
      ].filter(card => isDesktop || card.shouldDisplay),
    [cards, isDesktop, isConnected],
  )

  return (
    <div className="py-8 px-4 md:p-6 bg-bg-80" data-testid="votingPowerContainer">
      <Header variant="h3" className="mb-6">
        VOTING POWER
      </Header>
      <div className={cn('grid grid-cols-2 gap-4', 'md:flex md:flex-row md:gap-2')}>
        {votingPowerCards.map(card => (
          <VotingPowerCard {...card} key={card.dataTestId} data-testid={card.dataTestId} />
        ))}
      </div>
    </div>
  )
}
