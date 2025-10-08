import { Category } from '@/app/proposals/components/category'
import { ProposerColumn } from '@/app/proposals/components/table-columns/ProposalNameColumn'
import { SmallLineSeparator } from '@/components/Separators/SmallLineSeparator'
import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { ProposalCategory } from '@/shared/types'
import { Moment } from 'moment'
import { ClassNameValue } from 'tailwind-merge'
import { Address } from 'viem'

interface CreatorRowComponentProps {
  proposer: Address
  Starts: Moment
  category: ProposalCategory
  className?: ClassNameValue
}

export const CreatorRowComponent = ({ proposer, Starts, category, className }: CreatorRowComponentProps) => (
  <div className={cn('flex flex-row gap-2 items-center whitespace-nowrap flex-shrink-0', className)}>
    <ProposerColumn by={proposer} />
    <SmallLineSeparator />
    <Paragraph>{Starts.format('MMM DD, YYYY')}</Paragraph>
    <SmallLineSeparator />
    <Category category={category} className="w-auto" />
  </div>
)
