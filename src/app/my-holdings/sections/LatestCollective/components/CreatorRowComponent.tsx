import { CategoryColumn } from '@/app/proposals/components/table-columns/CategoryColumn'
import { CopyButton } from '@/components/CopyButton'
import { SmallLineSeparator } from '@/components/Separators/SmallLineSeparator'
import { Tooltip } from '@/components/Tooltip'
import { Paragraph, Span } from '@/components/TypographyNew'
import { cn, shortAddress } from '@/lib/utils'
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
  <div className={cn('flex flex-row mt-2 items-center', className)}>
    <Tooltip text="Copy address">
      <Span>
        <CopyButton icon={null} className="inline" copyText={proposer}>
          <Span className="text-primary">by</Span>&nbsp;
          <Span>{shortAddress(proposer)}</Span>
        </CopyButton>
      </Span>
    </Tooltip>
    <SmallLineSeparator />
    <Paragraph>{Starts.format('MMM DD, YYYY')}</Paragraph>
    <SmallLineSeparator />
    <CategoryColumn category={category} className="w-auto" />
  </div>
)
