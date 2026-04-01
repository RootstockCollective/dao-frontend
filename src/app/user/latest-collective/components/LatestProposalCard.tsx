import { Proposal } from '@/app/proposals/shared/types'
import { Paragraph } from '@/components/Typography'
import Link from 'next/link'
import { CreatorRowComponent } from './CreatorRowComponent'

interface LatestProposalCardProps {
  proposal: Proposal
  'data-testid'?: string
}

export const LatestProposalCard = ({
  proposal: { proposalId, name, category, Starts, proposer },
  'data-testid': dataTestId,
}: LatestProposalCardProps) => (
  <div className="p-6 flex-1 bg-bg-60 flex flex-col" data-testid={dataTestId}>
    <Link
      className="text-primary group-hover:underline group-hover:text-bg-100 group-hover:decoration-bg-40 flex-grow"
      href={`/proposals/${proposalId}`}
    >
      <Paragraph className="w-full line-clamp-3 break-all">{name}</Paragraph>
    </Link>
    <CreatorRowComponent
      className={'mt-3 flex-shrink-0'}
      category={category}
      Starts={Starts}
      proposer={proposer}
    />
  </div>
)
