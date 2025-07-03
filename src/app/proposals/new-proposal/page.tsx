'use client'

import { useCallback, useState } from 'react'
import { Deactivation } from './Deactivation'
import { NewProposalCard } from './NewProposalCard'
import { newProposalCards } from './newProposalCards.data'
import { Paragraph, Header } from '@/components/TypographyNew'

import { NewProposalCardExtended } from './NewProposalCardExtended'

export default function NewProposal() {
  const [proposalSelection, setProposalSelection] = useState<number | null>(null)
  const onSelectProposal = useCallback((cardIndex: number) => {
    setProposalSelection(cardIndex)
  }, [])
  const cancelCardSelection = useCallback(() => setProposalSelection(null), [])
  return (
    <div>
      <Header className="mb-10 leading-tight uppercase">New Proposal</Header>
      <Paragraph className="mb-6">Select the type of proposal that you want to create:</Paragraph>
      <div className="flex flex-col gap-2">
        {/* добавить сюда анимацию */}
        {proposalSelection === null ? (
          <div className="w-full flex flex-col items-center justify-center lg:items-stretch lg:flex-row gap-2">
            {newProposalCards?.map((card, i) => (
              <div key={i}>
                <NewProposalCard key={i} card={card} cardIndex={i} onSelectCard={onSelectProposal} />
              </div>
            ))}
          </div>
        ) : (
          <NewProposalCardExtended
            card={newProposalCards[proposalSelection]}
            cancelCardSelection={cancelCardSelection}
          />
        )}
        <Deactivation />
      </div>
    </div>
  )
}
