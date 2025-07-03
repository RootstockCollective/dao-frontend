import { cn } from '@/lib/utils'
import { motion, type HTMLMotionProps } from 'motion/react'
import Image from 'next/image'
import { NewProposalCardExtendedData } from './newProposalCards.data'
import { CardParagraph } from './CardParagraph'
import Link from 'next/link'
import { DotsOverlayHoriz } from './images/DotsOverlayHoriz'
import { DotsOverlayVert } from './images/DotsOverlayVert'
import { CardButton } from './CardButton'

interface Props extends HTMLMotionProps<'div'> {
  card: NewProposalCardExtendedData
}

export function NewProposalCardExtended({ card, className, ...props }: Props) {
  const { bigImage, cardTitle, bottomTextBlock, bottomTitle, detailsUrl, textBlock } = card

  return (
    <motion.div
      className={cn(
        'rounded-sm w-full max-w-[1200px] bg-text-80 overflow-hidden',
        'flex flex-col md:flex-row p-4',
        className,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 1, delay: 0.05 } }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
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
      <div className="basis-1/2 pl-2 sm:pl-8 pr-2 py-6 flex flex-col justify-end">
        {/* Top Section */}
        <div className="mt-2 sm:mt-0 flex flex-col gap-8">
          <h2 className="text-3xl sm:text-[44px] leading-none text-bg-100 uppercase font-kk-topo">
            {cardTitle}
          </h2>
          {/* Description Section */}
          <div className="flex flex-col gap-6 text-bg-100 font-rootstock-sans">{textBlock}</div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 flex flex-col gap-6">
          <h3 className="text-2xl leading-tight text-bg-100 uppercase font-kk-topo tracking-wide">
            {bottomTitle}
          </h3>

          <div className="flex flex-col gap-[26px]">
            {bottomTextBlock.map(({ header, text, url }, index) => (
              <CardParagraph key={index} header={header} url={url}>
                {text}
              </CardParagraph>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <CardButton className="border border-bg-0" onClick={() => {}}>
            Cancel
          </CardButton>
          <Link href={detailsUrl}>
            <CardButton className="bg-primary">Continue to details</CardButton>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
