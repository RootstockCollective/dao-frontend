'use client'

import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HeaderTitle } from '@/components/Typography'
import { BackButton } from '@/components/BackButton'
import { Card } from './Card'
import { cards } from './cards'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { InfoPanel } from './info-panel/info-panel'

export default function ChooseProposal() {
  // Tracks container to detect clicks outside of it using useClickOutside.
  const cardsRef = useRef<HTMLDivElement>(null)
  const infoPanelRef = useRef<HTMLDivElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [infoPanelIndex, setInfoPanelIndex] = useState<number | null>(null)
  // Closes the info panel when a click occurs outside the specified container.
  useClickOutside([cardsRef, infoPanelRef], () => setInfoPanelIndex(null))
  return (
    <div className="max-w-[1130px] mx-auto">
      <BackButton className="mb-4" />
      <HeaderTitle className="mb-24 text-5xl text-center">Choose Your Proposal</HeaderTitle>
      <div ref={cardsRef} className="mb-4 xl:mb-6 flex flex-row gap-4 justify-between overflow-x-auto">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            isHighlighted={
              // all cards are highlighted on mount
              (hoverIndex === null && infoPanelIndex === null) ||
              // highlight hovered card
              hoverIndex === index ||
              // highlight selected card
              infoPanelIndex === index
            }
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
            createProposalLink={`/proposals/create?${new URLSearchParams({
              contract: card.contract,
              action: card.action,
            })}`}
            showInfoPanel={() => setInfoPanelIndex(index)}
          />
        ))}
      </div>
      <div ref={infoPanelRef} className="relative">
        {/* Fades the info panel in and out when it is added to or removed from the DOM. */}
        <AnimatePresence mode="wait">
          {infoPanelIndex !== null && (
            <motion.div key={infoPanelIndex} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <InfoPanel mustHaveList={cards[infoPanelIndex].mustHave} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
