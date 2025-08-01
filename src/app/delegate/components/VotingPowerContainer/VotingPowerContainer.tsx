'use client'
import { Header } from '@/components/TypographyNew'
import { VOTING_POWER_CARDS_INFO } from '../../lib/constants'
import { CardsState } from '../../lib/types'
import { VotingPowerCard } from './VotingPowerCard'

interface VotingPowerContainerProps {
  cards: CardsState
}

/**
 * Should use useDelegateContext
 * @param cards
 * @constructor
 */
export const VotingPowerContainer = ({ cards }: VotingPowerContainerProps) => {
  return (
    <div className="p-[24px] bg-bg-80" data-testid="votingPowerContainer">
      <Header variant="e3" className="mb-[24px] text-[20px]">
        VOTING POWER
      </Header>
      <div className="flex flex-col gap-[8px] sm:flex-row">
        <VotingPowerCard
          {...VOTING_POWER_CARDS_INFO.available}
          {...cards.available}
          data-testid="AvailableVotingPowerCard"
        />
        <VotingPowerCard {...VOTING_POWER_CARDS_INFO.own} {...cards.own} data-testid="OwnVotingPowerCard" />
        <VotingPowerCard
          {...VOTING_POWER_CARDS_INFO.received}
          {...cards.received}
          data-testid="ReceivedVotingPowerCard"
        />
        <VotingPowerCard
          {...VOTING_POWER_CARDS_INFO.delegated}
          {...cards.delegated}
          data-testid="DelegatedVotingPowerCard"
        />
      </div>
    </div>
  )
}
