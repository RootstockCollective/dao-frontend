import { type HTMLMotionProps, motion } from 'motion/react'
import { HeaderTitle, Typography } from '@/components/Typography'
import { cn } from '@/lib/utils/utils'
import type { ProposalType } from '../../types'
import { infoPanelData } from './data'
import { ExampleCard } from '../example-card/example-card'
import { ArrowLink } from './arrow-link'

interface InfoPanelProps extends HTMLMotionProps<'div'> {
  proposal: ProposalType
}

export function InfoPanel({ proposal, className }: InfoPanelProps) {
  const { title, requirements, Footer } = infoPanelData[proposal]
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={cn(className, 'py-7 px-8 w-full bg-[#1A1A1A] overflow-hidden')}
      data-testid={`ChooseProposalInfoPanel${proposal}`}
    >
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex flex-col gap-10">
          <div className="grow">
            <HeaderTitle className="mb-6 text-[32px] uppercase leading-none">{title}</HeaderTitle>
            <ol className="p-0 space-y-6 list-none">
              {requirements.map(({ id, Text, Icon, LinkText, linkUrl }, i) => (
                <li key={id}>
                  <div className="flex flex-row gap-2">
                    <div className="pt-1">
                      <Icon />
                    </div>
                    <Typography>{i + 1}.</Typography>
                    <Text className="leading-tight" />
                  </div>
                  <ArrowLink target="_blank" rel="noopener noreferrer" href={linkUrl}>
                    <LinkText className="inline text-lg font-[600] leading-tight text-primary" />
                  </ArrowLink>
                </li>
              ))}
            </ol>
          </div>
          {Footer && <Footer />}
        </div>
        <ExampleCard className="mt-4 lg:mt-0" proposal={proposal} />
      </div>
    </motion.div>
  )
}
