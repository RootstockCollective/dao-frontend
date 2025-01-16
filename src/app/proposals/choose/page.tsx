import { HeaderTitle, Header, Headline } from '@/components/Typography'
import { BackButton } from '@/components/BackButton'
import { Card } from './Card'
import { cards } from './cards'

export default function ChooseProposal() {
  return (
    <div className="xl:pl-3">
      <BackButton className="mb-4" />
      <HeaderTitle className="mb-24 text-5xl text-center">Choose Your Proposal</HeaderTitle>
      <div className="flex flex-col xl:flex-row gap-12 justify-center items-center">
        {cards.map(card => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}
