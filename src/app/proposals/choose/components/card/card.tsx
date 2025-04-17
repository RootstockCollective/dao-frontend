'use client'

import { PropsWithChildren } from 'react'
import Link from 'next/link'
import Image, { StaticImageData } from 'next/image'
import { motion, HTMLMotionProps } from 'motion/react'
import { cn } from '@/lib/utils'
import { cardData } from './data'
import { Button } from '@/components/Button'
import { HeaderTitle, Typography } from '@/components/Typography'
import type { ProposalType } from '../../types'

interface CardProps extends HTMLMotionProps<'div'> {
  proposal: ProposalType
  isHighlighted: boolean
  link: string
  showInfoPanel: () => void
}

/**
 * Interactive card component for displaying and selecting options for creating new proposals.
 */
export function Card({ proposal, isHighlighted, className, link, showInfoPanel, ...props }: CardProps) {
  const { image, title, description } = cardData[proposal]
  return (
    <motion.div
      {...props}
      initial={{ opacity: 1 }}
      animate={{ opacity: isHighlighted ? 1 : 0.5 }}
      className={cn(className, 'w-[348px] h-[582px] min-w-[280px] p-2 bg-[#1A1A1A] overflow-hidden')}
      data-testid={`ChooseProposalCard${proposal}`}
    >
      <CardBackground image={image} alt={title}>
        <div className="h-full py-7 flex flex-col items-center leading-tight">
          <HeaderTitle className="text-[32px] text-center">{title}</HeaderTitle>
          <div className="mb-[18px] grow flex items-end">
            <div className="min-h-[4rem]">
              <Typography className="leading-[22.4px]" tagVariant="p">
                {description}
              </Typography>
            </div>
          </div>
          {/* "Choose proposal" button QA test IDs: */}
          {/* ChooseProposalButtonStandard, ChooseProposalButtonActivation, ChooseProposalButtonDeactivation */}
          <Link href={link}>
            <Button data-testid={`ChooseProposalButton${proposal}`} className="mb-[14px] px-3 py-2">
              Choose proposal
            </Button>
          </Link>
          {/* "Find out more" Button QA test IDs: */}
          {/* ShowInfoPanelButtonStandard, ShowInfoPanelButtonActivation, ShowInfoPanelButtonDeactivation */}
          <Typography
            data-testid={`ShowInfoPanelButton${proposal}`}
            onClick={showInfoPanel}
            className="text-lg font-bold leading-none cursor-pointer"
            tagVariant="p"
          >
            Find out more
          </Typography>
        </div>
      </CardBackground>
    </motion.div>
  )
}

interface CardBackgroundProps extends PropsWithChildren {
  image: StaticImageData
  alt: string
}
function CardBackground({ image, alt, children }: CardBackgroundProps) {
  return (
    <div className="relative w-full h-full">
      <div className="absolute w-full h-full z-2">{children}</div>
      <div
        className="absolute w-full h-[506px] z-1"
        style={{
          background:
            'linear-gradient(180deg, rgba(26, 26, 26, 0.84) 7.85%, rgba(26, 26, 26, 0) 41.38%, #1A1A1A 74.71%)',
        }}
      />
      <div className="absolute h-[506px] w-full z-0">
        <Image priority fill src={image} alt={alt} placeholder="blur" className="object-cover" sizes="30vw" />
      </div>
    </div>
  )
}
