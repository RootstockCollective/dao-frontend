import Image from 'next/image'
import { type NewProposalCardBaseData } from '../newProposalCards.data'
import { DotsOverlayVert } from '../images/DotsOverlayVert'
import { CardButton } from './CardButton'
import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { ProposalCategory } from '@/shared/types'
import { Header } from '@/components/Typography'
import { Expandable, ExpandableHeader, ExpandableContent } from '@/components/Expandable'
import { Button } from '@/components/Button'

interface Props extends HTMLAttributes<HTMLDivElement> {
  card: NewProposalCardBaseData
  onSelectCard: (_type: ProposalCategory) => void
}

export function NewProposalCard({ card, onSelectCard, className, ...props }: Props) {
  const { buttonText, cardTitle, image, textBlock } = card
  return (
    <div className={cn('rounded-sm w-full max-w-[568px] bg-text-80 overflow-hidden', className)} {...props}>
      <div className="h-full flex flex-col gap-6">
        {/* Image Section */}
        <div className="relative w-full h-[272px] p-4">
          <Image
            src={image}
            alt={cardTitle}
            className="w-full h-full object-cover overflow-hidden rounded-sm"
          />

          <div className="absolute -bottom-3 right-4">
            <DotsOverlayVert />
          </div>
        </div>

        {/* Content Section */}
        <div className="grow px-6 pb-10 flex flex-col gap-8">
          <Expandable>
            <ExpandableHeader triggerColor="black">
              <Header variant="e2" className="text-bg-100 text-3xl md:text-11" caps>
                {cardTitle}
              </Header>
            </ExpandableHeader>
            <ExpandableContent contentClassName="text-lg leading-snug text-bg-100 font-rootstock-sans">
              {textBlock}
            </ExpandableContent>
          </Expandable>

          {/* Button Section */}
          <Button variant="secondary" className="py-3 px-4">
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  )
}
