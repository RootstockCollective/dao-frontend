import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { NewProposalCardData } from '../newProposalCards.data'
import { CardParagraph } from './CardParagraph'
import { Header } from '@/components/Typography'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { Button } from '@/components/Button'
import { Divider } from '@/components/Divider'
import Link from 'next/link'

interface Props extends HTMLAttributes<HTMLDivElement> {
  card: NewProposalCardData
  cancelCardSelection: () => void
}

export function NewProposalCardExtended({ card, className, cancelCardSelection, ...props }: Props) {
  const isDesktop = useIsDesktop()
  const { bigImage, cardTitle, bottomTextBlock, bottomTitle, textBlock, smallImage, detailsUrl } = card

  return (
    <div
      className={cn(
        'rounded-sm w-full max-w-[1144px] mx-auto bg-text-80',
        'flex flex-col md:flex-row p-4',
        className,
      )}
      {...props}
    >
      {/* Left Side - Image Section */}
      <div className="relative basis-1/2 overflow-visible">
        <Image
          src={!isDesktop ? smallImage : bigImage}
          alt={cardTitle}
          className="md:absolute md:inset-0 md:z-base md:h-full w-full md:object-right object-cover"
        />
      </div>

      {/* Right Side - Content Section */}
      <div className="basis-1/2 pr-2 pb-6 pt-0 md:pt-6 flex flex-col justify-end gap-8">
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
            {bottomTextBlock.map(({ header, text, url, dataTestId }, index) => (
              <CardParagraph key={index} header={header} url={url} data-testid={dataTestId}>
                {text}
              </CardParagraph>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`md:p-0 p-4 ${!isDesktop ? 'fixed bottom-0 left-0 right-0 bg-bg-100' : ''}`}>
          <Divider className="md:hidden" />
          <div className="flex gap-4 md:justify-end md:mt-0 mt-4">
            <Button
              variant="secondary-outline"
              onClick={cancelCardSelection}
              textClassName="md:text-bg-100"
              className="md:w-auto flex-1 md:flex-none"
              data-testid="CancelButton"
            >
              Cancel
            </Button>
            <Link href={detailsUrl}>
              <Button
                variant="primary"
                className="py-3 px-6 md:w-auto flex-1 md:flex-none"
                textClassName="flex-shrink-0"
                data-testid="ContinueToDetailsButton"
              >
                Continue to details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
