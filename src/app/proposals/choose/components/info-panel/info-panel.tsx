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
      className={cn(className, 'p-7 w-full bg-[#1A1A1A] overflow-hidden')}
    >
      {/* <div className="ml-4 max-w-[308px] min-w-[100px] text-center float-right">
        <Image placeholder="blur" src={exampleImage} alt="Example image" className="mb-2" />
        <Typography className="text-[10px]">Example of a grant proposal</Typography>
      </div> */}
      <ExampleCard proposal={proposal} className="ml-4 float-right" />
      <HeaderTitle className="text-[32px] uppercase leading-tight">{proposal} Must have</HeaderTitle>
      <Typography className="mb-8 text-lg leading-tight">
        A list of items you should have done to be able to submit a standard proposal
      </Typography>
      <ol className="p-0 space-y-6 list-none clearfix">
        {infoPanelData[proposal].map(({ id, text, icon, linkText, linkUrl }, i) => (
          <li key={id} className="">
            {cloneElement<HTMLAttributes<HTMLDivElement>>(icon, { className: 'inline-block mr-2' })}
            <Typography className="inline">
              {i + 1}. {text}
            </Typography>
            <a className="mt-2 block" target="_blank" rel="noopener noreferrer" href={linkUrl}>
              <Typography className="inline  text-lg font-[700] leading-tight text-primary">
                {linkText}
              </Typography>
              <LinkArrow className="h-[22px] ml-1 inline" />
            </a>
          </li>
        ))}
      </ol>
    </motion.div>
  )
}
