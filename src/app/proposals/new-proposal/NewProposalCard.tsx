'use client'

import { cn } from '@/lib/utils'
import { motion, type HTMLMotionProps } from 'motion/react'
import Image from 'next/image'
import { type NewProposalCardBaseData } from './newProposalCards.data'
import { DotsOverlayVert } from './images/DotsOverlayVert'
import { CardButton } from './CardButton'

interface Props extends HTMLMotionProps<'div'> {
  card: NewProposalCardBaseData
}

export function NewProposalCard({ card, className, ...props }: Props) {
  const { buttonText, cardTitle, image, onButtonClick, textBlock } = card
  return (
    <motion.div
      className={cn('rounded-sm w-full h-full bg-text-80 overflow-hidden', 'flex flex-col gap-6', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 1, delay: 0.05 } }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      {...props}
    >
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
      <div className="px-6 pb-10 flex flex-col gap-8">
        {/* Title Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl sm:text-[44px] leading-none font-normal text-bg-100 uppercase font-kk-topo">
            {cardTitle}
          </h2>
        </div>

        {/* Description Section */}
        <div className="flex flex-col gap-6 text-lg leading-snug text-bg-100 font-rootstock-sans">
          {textBlock}
        </div>

        {/* Button Section */}
        <div className="flex justify-end">
          <CardButton onClick={onButtonClick} className="text-text-100 bg-bg-100">
            {buttonText}
          </CardButton>
        </div>
      </div>
    </motion.div>
  )
}
