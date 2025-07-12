import Image from 'next/image'
import { type NewProposalCardBaseData } from '../newProposalCards.data'
import { DotsOverlayVert } from '../images/DotsOverlayVert'
import { CardButton } from './CardButton'
import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { ProposalCategory } from '@/shared/types'

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
          <div className="w-full h-full overflow-hidden rounded-sm">
            <Image src={image} alt={cardTitle} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-3 right-4">
            <DotsOverlayVert />
          </div>
        </div>

        {/* Content Section */}
        <div className="grow px-6 pb-10 flex flex-col gap-8">
          {/* Title Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl sm:text-[44px] leading-none font-normal text-bg-100 uppercase font-kk-topo">
              {cardTitle}
            </h2>
          </div>

          {/* Description Section */}
          <div className="grow flex flex-col gap-6 text-lg leading-snug text-bg-100 font-rootstock-sans">
            {textBlock}
          </div>

          {/* Button Section */}
          <div className="flex justify-end">
            <CardButton onClick={() => onSelectCard(card.type)} className="text-text-100 bg-bg-100">
              {buttonText}
            </CardButton>
          </div>
        </div>
      </div>
    </div>
  )
}
