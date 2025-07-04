'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion, Variants } from 'motion/react'
import { Deactivation } from './Deactivation'
import { NewProposalCard } from './NewProposalCard'
import { newProposalCards } from './newProposalCards.data'
import { Paragraph } from '@/components/TypographyNew'
import { NewProposalCardExtended } from './NewProposalCardExtended'

const variants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.8,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
}

export default function NewProposal() {
  const [proposalSelection, setProposalSelection] = useState<number | null>(null)
  const onSelectProposal = useCallback((cardIndex: number) => {
    setProposalSelection(cardIndex)
  }, [])
  const cancelCardSelection = useCallback(() => setProposalSelection(null), [])
  return (
    <div>
      <AnimatePresence mode="popLayout">
        {proposalSelection === null ? (
          <motion.div key="selector" variants={variants} initial="initial" animate="animate" exit="exit">
            <Paragraph className="mb-6 leading-snug">
              Select the type of proposal that you want to create:
            </Paragraph>

            {/* 2 New Proposal Cards */}
            <div className="mb-2 w-full flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-2">
              {newProposalCards.map((card, i) => (
                <NewProposalCard key={i} card={card} cardIndex={i} onSelectCard={onSelectProposal} />
              ))}
            </div>

            <Deactivation />
          </motion.div>
        ) : (
          <motion.div key="extended" variants={variants} initial="initial" animate="animate" exit="exit">
            {/* One extended card */}
            <NewProposalCardExtended
              card={newProposalCards[proposalSelection]}
              cancelCardSelection={cancelCardSelection}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
