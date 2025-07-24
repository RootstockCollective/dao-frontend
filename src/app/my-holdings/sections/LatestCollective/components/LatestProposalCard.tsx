import { Proposal } from '@/app/proposals/shared/types'
import { Paragraph } from '@/components/TypographyNew'
import Link from 'next/link'
import { CreatorRowComponent } from './CreatorRowComponent'

interface LatestProposalCardProps {
  proposal: Proposal
}

export const LatestProposalCard = ({
  proposal: { proposalId, name, category, Starts, proposer },
}: LatestProposalCardProps) => (
  <div className="p-6 w-[360px] h-[156px] bg-bg-60">
    <Link
      className="text-primary group-hover:underline group-hover:text-bg-100 group-hover:decoration-bg-40"
      href={`/proposals/${proposalId}`}
    >
      <Paragraph className="w-full line-clamp-3 h-[72px]">{name}</Paragraph>
    </Link>
    <CreatorRowComponent className={'mt-3'} category={category} Starts={Starts} proposer={proposer} />
  </div>
)
