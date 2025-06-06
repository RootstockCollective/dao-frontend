'use client'

import { useState, useRef, RefObject } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HeaderTitle } from '@/components/Typography'
import { BackButton } from '@/components/BackButton'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { Card, cardData } from './components/card'
import { InfoPanel } from './components/info-panel'
import type { ProposalType } from './types'
import { cn } from '@/lib/utils/utils'

export default function ChooseProposal() {
  const [chosenProposal, setChosenProposal] = useState<ProposalType | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  // Closes the info panel when a click occurs outside the specified container.
  const cardsRef = useRef<HTMLDivElement>(null)
  const infoPanelRef = useRef<HTMLDivElement>(null)
  useClickOutside(
    [cardsRef, infoPanelRef].filter((ref): ref is RefObject<HTMLDivElement> => !!ref.current),
    () => setChosenProposal(null),
  )
  return (
    <>
      <BackButton className="mb-4" />
      <div className="mb-4 lg:mb-10 max-w-[740px] min-w-[600px] mx-auto">
        <HeaderTitle className="mb-24 text-5xl text-center">Choose Your Proposal</HeaderTitle>
        <div ref={cardsRef} className="flex flex-row gap-4 justify-between overflow-x-auto">
          {Object.entries(cardData).map(([proposalType, card], index) => (
            <Card
              key={card.id}
              proposal={proposalType as ProposalType}
              isHighlighted={
                // all cards are highlighted on mount
                (hoverIndex === null && chosenProposal === null) ||
                // highlight hovered card
                hoverIndex === index ||
                // highlight selected card
                chosenProposal === proposalType
              }
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              link={`/proposals/create?${new URLSearchParams({
                contract: card.contract,
                action: card.action,
              })}`}
              showInfoPanel={() => setChosenProposal(proposalType as ProposalType)}
              // Orange border around selected card
              className={cn(
                'border-[.8px] transition-colors duration-1000',
                proposalType === chosenProposal ? 'border-primary' : 'border-transparent',
              )}
            />
          ))}
        </div>
      </div>
      <div ref={infoPanelRef} className="relative max-w-[1130px] min-w-[600px] mx-auto">
        {/* Fades the info panel in and out when it is added to or removed from the DOM. */}
        <AnimatePresence mode="wait">
          {chosenProposal !== null && (
            <motion.div key={chosenProposal} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <InfoPanel proposal={chosenProposal} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
