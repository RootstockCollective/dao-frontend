import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { NewProposalCardExtendedData } from '../newProposalCards.data'
import { CardParagraph } from './CardParagraph'
import Link from 'next/link'
import { DotsOverlayHoriz } from '../images/DotsOverlayHoriz'
import { DotsOverlayVert } from '../images/DotsOverlayVert'
import { CardButton } from './CardButton'
import { Header } from '@/components/TypographyNew'

interface Props extends HTMLAttributes<HTMLDivElement> {
  card: NewProposalCardExtendedData
  cancelCardSelection: () => void
}

export function NewProposalCardExtended({ card, className, cancelCardSelection, ...props }: Props) {
  const { bigImage, cardTitle, bottomTextBlock, bottomTitle, detailsUrl, textBlock } = card

  return (
    <div
      className={cn(
        'rounded-sm w-full max-w-[1144px] mx-auto bg-text-80 overflow-hidden',
        'flex flex-col md:flex-row p-4',
        className,
      )}
      {...props}
    >
      {/* Left Side - Image Section */}
      <div className="relative basis-1/2">
        <Image src={bigImage} alt={cardTitle} className="w-full h-full object-cover" />
        {/* Decorative dots overlay - SVG pattern */}
        <div className="hidden md:block absolute top-[15px] -right-[30px]">
          <DotsOverlayHoriz />
        </div>
        <div className="block md:hidden absolute -bottom-[30px] right-0">
          <DotsOverlayVert />
        </div>
      </div>

      {/* Right Side - Content Section */}
      <div className="basis-1/2 pl-2 md:pl-8 pr-2 py-6 flex flex-col justify-end gap-8">
        {/* Top Section */}
        <div className="mt-2 md:mt-10 flex flex-col gap-8">
          <Header variant="e2" className="text-bg-100 text-3xl md:text-11" caps>
            {cardTitle}
          </Header>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-6">
          {/* Description Section */}
          <div className="flex flex-col gap-6 text-bg-100 font-rootstock-sans">{textBlock}</div>

          <Header variant="h3" className="mt-4 text-bg-100" caps>
            {bottomTitle}
          </Header>

          <div className="flex flex-col gap-6">
            {bottomTextBlock.map(({ header, text, url }, index) => (
              <CardParagraph key={index} header={header} url={url}>
                {text}
              </CardParagraph>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <CardButton className="border border-bg-0" onClick={cancelCardSelection}>
            Cancel
          </CardButton>
          <Link href={detailsUrl}>
            <CardButton className="bg-primary">Continue to details</CardButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
