import Image from 'next/image'
import { type NewProposalCardBaseData } from '../newProposalCards.data'
import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { ProposalCategory } from '@/shared/types'
import { Header } from '@/components/Typography'
import { Expandable, ExpandableHeader, ExpandableContent } from '@/components/Expandable'
import { Button } from '@/components/Button'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface Props extends HTMLAttributes<HTMLDivElement> {
  card: NewProposalCardBaseData
  onSelectCard: (_type: ProposalCategory) => void
}

export function NewProposalCard({ card, onSelectCard, className, ...props }: Props) {
  const isDesktop = useIsDesktop()
  const { buttonText, cardTitle, image, smallImage, textBlock } = card

  const descriptionStyle = 'text-lg leading-snug text-bg-100 font-rootstock-sans'

  return (
    <div className={cn('rounded-sm w-full md:max-w-[568px] bg-text-80', className)} {...props}>
      <div className="h-full flex flex-col gap-6">
        {/* Image Section */}
        <div className="relative w-full pt-4 pb-0 px-4 md:mt-0 mt-8">
          <Image
            src={!isDesktop ? smallImage : image}
            alt={cardTitle}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Section */}
        <div className="grow px-6 pb-10 flex flex-col gap-8">
          {isDesktop ? (
            // Desktop: Always expanded, no expandable wrapper
            <div className="flex flex-col gap-2">
              <Header variant="e2" className="text-bg-100 text-3xl md:text-11" caps>
                {cardTitle}
              </Header>
              <div className="text-lg leading-snug text-bg-100 font-rootstock-sans">{textBlock}</div>
            </div>
          ) : (
            // Mobile: Expandable behavior
            <Expandable>
              <ExpandableHeader triggerColor="black">
                <Header variant="e2" className="text-bg-100 text-3xl md:text-11" caps>
                  {cardTitle}
                </Header>
              </ExpandableHeader>
              <ExpandableContent
                contentClassName={descriptionStyle}
                previewCharLimit={200}
                previewClassName={descriptionStyle}
                showPreview
              >
                {textBlock}
              </ExpandableContent>
            </Expandable>
          )}

          {/* Button Section */}
          <Button
            variant="secondary"
            className="py-3 px-4 self-end"
            onClick={() => onSelectCard(card.type)}
            data-testid={card.buttonDataTestId}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  )
}
