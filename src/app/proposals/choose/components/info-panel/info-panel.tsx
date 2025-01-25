import { cloneElement, HTMLAttributes } from 'react'
import { type HTMLMotionProps, motion } from 'motion/react'
import LinkArrow from './icons/link-arrow'
import { HeaderTitle, Typography } from '@/components/Typography'
import { cn } from '@/lib/utils'
import type { ProposalType } from '../../types'
import { infoPanelData } from './data'
import { ExampleCard } from '../example-card/example-card'

interface InfoPanelProps extends HTMLMotionProps<'div'> {
  proposal: ProposalType
}

export function InfoPanel({ proposal, className }: InfoPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={cn(className, 'py-7 px-8 w-full bg-[#1A1A1A] overflow-hidden')}
    >
      <div className="flex flex-col lg:flex-row gap-4">
        <div>
          <HeaderTitle className="text-[32px] uppercase leading-tight">{proposal} Must have</HeaderTitle>
          <Typography className="mb-4 lg:mb-8 text-lg leading-tight">
            List of items you should have completed to submit {proposal.toLowerCase()} proposal
          </Typography>
          <ol className="p-0 space-y-6 list-none">
            {infoPanelData[proposal].map(({ id, text, icon, linkText, linkUrl }, i) => (
              <li key={id}>
                <div className="flex flex-row gap-2">
                  {/* Icon */}
                  <div className="pt-1">{icon}</div>
                  <Typography>{i + 1}.</Typography>
                  {/* Description paragraph */}
                  <Typography className="leading-tight">{text}</Typography>
                </div>

                {/* Orange link */}
                <a className="mt-2 block" target="_blank" rel="noopener noreferrer" href={linkUrl}>
                  <Typography className="inline text-lg font-[500] leading-tight text-primary">
                    {linkText}
                  </Typography>
                  <LinkArrow className="h-[22px] ml-1 inline" />
                </a>
              </li>
            ))}
          </ol>
        </div>
        <ExampleCard className="mt-4 lg:mt-0" proposal={proposal} />
      </div>
    </motion.div>
  )
}
