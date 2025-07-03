'use client'

import React from 'react'
import { Deactivation } from './Deactivation'
import { NewProposalCard } from './NewProposalCard'
import { newProposalCards } from './newProposalCards.data'
import { Paragraph, Header } from '@/components/TypographyNew'

export default function NewProposal() {
  return (
    <div>
      <Header className="mb-10 leading-tight uppercase">New Proposal</Header>
      <div className="flex flex-col gap-2">
        <Paragraph>Select the type of proposal that you want to create:</Paragraph>
        <div className="w-full flex flex-col lg:flex-row gap-2 ">
          {newProposalCards?.map((card, i) => (
            <div key={i} className="basis-1/2 grow">
              <NewProposalCard card={card} />
            </div>
          ))}
        </div>
        <Deactivation />
      </div>
    </div>
  )
}
