import Image from 'next/image'
import { type NewProposalCardBaseData } from '../newProposalCards.data'
import { DotsOverlayVert } from '../images/DotsOverlayVert'
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
  const { buttonText, cardTitle, image, textBlock } = card

  return (
    <div
      className={cn('rounded-sm w-full md:max-w-[568px] bg-text-80 overflow-hidden', className)}
      {...props}
    >
      <div className="h-full flex flex-col gap-6">
        {/* Image Section */}
        <div className="relative w-full md:h-[272px] h-[133px] md:p-4 px-4 pb-4 md:mt-0 mt-8">
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
              <ExpandableContent contentClassName="text-lg leading-snug text-bg-100 font-rootstock-sans">
                {textBlock}
              </ExpandableContent>
            </Expandable>
          )}

          {/* Button Section */}
          <Button variant="secondary" className="py-3 px-4">
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  )
}
