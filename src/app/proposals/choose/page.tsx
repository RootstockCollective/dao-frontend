'use client'

import { useState } from 'react'
import { HeaderTitle } from '@/components/Typography'
import { BackButton } from '@/components/BackButton'
import { Card } from './Card'
import { cards } from './cards'

export default function ChooseProposal() {
  const [findMore, setFindMore] = useState<number>()

  const handleFindMore = (id: number) => {
    const selectedCard = cards.find(card => card.id === id)
    setFindMore(id)
    console.log('Find out more', selectedCard?.title)
  }
  const handleChoose = (id: number) => {
    const selectedCard = cards.find(card => card.id === id)
    console.log('card chosen', selectedCard?.title)
  }
  return (
    <div className="xl:pl-3">
      <BackButton className="mb-4" />
      <HeaderTitle className="mb-24 text-5xl text-center">Choose Your Proposal</HeaderTitle>
      <div className="flex flex-row gap-6 xl:gap-[clamp(10px,2vw,46px)] justify-center items-center">
        {cards.map(card => (
          <Card key={card.id} card={card} handleChoose={handleChoose} handleFindMore={handleFindMore} />
        ))}
      </div>
    </div>
  )
}
