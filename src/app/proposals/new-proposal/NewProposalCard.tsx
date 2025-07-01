import { cn } from '@/lib/utils'
import { motion, type HTMLMotionProps } from 'motion/react'
import Image from 'next/image'
import { Button } from '@/components/ButtonNew'
import { type NewProposalCardData } from './newProposalCards.data'

interface Props extends HTMLMotionProps<'div'> {
  card: NewProposalCardData
}

export function NewProposalCard({ card, className, ...props }: Props) {
  const { buttonText, cardTitle, image, onButtonClick, textBlock } = card
  return (
    <motion.div
      className={cn(
        'rounded-sm w-full max-w-[540px] bg-text-80 overflow-hidden',
        'flex flex-col gap-6',
        className,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 1 } }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      {...props}
    >
      {/* Image Section */}
      <div className="relative w-full h-[272px] p-4">
        <div className="w-full h-full overflow-hidden rounded-sm">
          <Image src={image} alt={cardTitle} className="w-full h-full object-cover" />
        </div>
        {/* Decorative dots overlay - SVG pattern */}
        <div className="absolute -bottom-3 right-4">
          <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
            <rect x="10" y="10" width="10" height="10" rx="1" fill="#1C1A1B" />
            <rect x="20" y="20" width="10" height="10" rx="1" fill="#1C1A1B" />
            <rect x="0" y="30" width="10" height="10" rx="1" fill="#1C1A1B" />
            <rect x="10" y="0" width="10" height="10" rx="1" fill="#E4E1DA" />
          </svg>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 pb-10 flex flex-col gap-8">
        {/* Title Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-[44px] leading-none font-normal text-bg-100 uppercase font-kk-topo">
            {cardTitle}
          </h2>
        </div>

        {/* Description Section */}
        <div className="flex flex-col gap-6 text-lg leading-snug text-bg-100 font-rootstock-sans">
          {textBlock}
        </div>

        {/* Button Section */}
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onButtonClick}>
            {buttonText}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
