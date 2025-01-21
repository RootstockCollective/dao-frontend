'use client'

import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HeaderTitle } from '@/components/Typography'
import { BackButton } from '@/components/BackButton'
import { Card } from './Card'
import { cards } from './cards'
import { useClickOutside } from '@/shared/hooks/useClickOutside'

export default function ChooseProposal() {
  // Tracks container to detect clicks outside of it using useClickOutside.
  const cardsRef = useRef<HTMLDivElement>(null)
  const infoPanelRef = useRef<HTMLDivElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [infoPanelIndex, setInfoPanelIndex] = useState<number | null>(null)
  // Closes the info panel when a click occurs outside the specified container.
  useClickOutside([cardsRef, infoPanelRef], () => setInfoPanelIndex(null))
  return (
    <div className="xl:pl-3">
      <BackButton className="mb-4" />
      <HeaderTitle className="mb-24 text-5xl text-center">Choose Your Proposal</HeaderTitle>
      <div
        ref={cardsRef}
        className="mb-8 flex flex-row gap-6 xl:gap-[clamp(10px,2vw,46px)] justify-center items-center"
      >
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                {cards[infoPanelIndex].infoPanel}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
