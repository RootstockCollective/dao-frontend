'use client'

import { LazyExoticComponent, ReactElement, useState, Suspense, lazy } from 'react'
import { HeaderTitle } from '@/components/Typography'
import { BackButton } from '@/components/BackButton'
import { Card } from './Card'
import { cards, type ProposalType } from './cards'
import { useRouter } from 'next/navigation'

export default function ChooseProposal() {
  const router = useRouter()
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null)
  const [ActiveInfoPanel, setActiveInfoPanel] = useState<LazyExoticComponent<() => ReactElement> | null>(null)

  const navigateToCreateProposal = (index: number) => {
    const { contract, action } = cards[index]
    router.push(
      `/proposals/create?${new URLSearchParams({
        contract,
        action,
      })}`,
    )
  }

  const showInfoPanel = (proposalType: ProposalType) => {
    setActiveInfoPanel(lazy(() => import(`./info-panel/${proposalType}`)))
  }

  return (
    <div className="xl:pl-3">
      <BackButton className="mb-4" />
      <HeaderTitle className="mb-24 text-5xl text-center">Choose Your Proposal</HeaderTitle>
      <div className="mb-8 flex flex-row gap-6 xl:gap-[clamp(10px,2vw,46px)] justify-center items-center">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            isHighlighted={highlightIndex === null || highlightIndex === index}
            onMouseEnter={() => setHighlightIndex(index)}
            onMouseLeave={() => setHighlightIndex(null)}
            navigateToCreateProposal={() => navigateToCreateProposal(index)}
            showInfoPanel={() => showInfoPanel(card.proposalType)}
          />
        ))}
      </div>
      {ActiveInfoPanel && (
        <Suspense fallback={<p>Loading...</p>}>
          <ActiveInfoPanel />
        </Suspense>
      )}
    </div>
  )
}
