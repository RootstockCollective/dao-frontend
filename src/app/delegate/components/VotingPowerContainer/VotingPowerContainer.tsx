'use client'
import { Header } from '@/components/TypographyNew'
import { CardsState } from '../types'
import { VotingPowerCard } from './VotingPowerCard'
import { VOTING_POWER_CARDS_INFO } from './constants'

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
    <div className="p-[24px] bg-bg-80">
      <Header variant="e3" className="mb-[24px] text-[20px]">
        VOTING POWER
      </Header>
      <div className="flex flex-col gap-[8px] sm:flex-row">
        <VotingPowerCard {...VOTING_POWER_CARDS_INFO.available} {...cards.available} />
        <VotingPowerCard {...VOTING_POWER_CARDS_INFO.own} {...cards.own} />
        <VotingPowerCard {...VOTING_POWER_CARDS_INFO.received} {...cards.received} />
        <VotingPowerCard {...VOTING_POWER_CARDS_INFO.delegated} {...cards.delegated} />
      </div>
    </div>
  )
}
