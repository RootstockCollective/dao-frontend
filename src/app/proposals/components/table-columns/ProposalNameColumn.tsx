import Link from 'next/link'
import { splitCombinedName } from '../../shared/utils'
import { Paragraph } from '@/components/TypographyNew'

interface ProposalNameColumnProps {
  name: string
  proposalId: string
}

export const ProposalNameColumn = ({ name, proposalId }: ProposalNameColumnProps) => {
  const { proposalName } = splitCombinedName(name)
  return (
    <Link
      className="text-primary group-hover:underline group-hover:text-bg-100 group-hover:decoration-bg-40"
      href={`/proposals/${proposalId}`}
    >
      <Paragraph>{proposalName}</Paragraph>
    </Link>
  )
}

export const ProposalByColumn = ({ by: proposer }: { by: string }) => (
  <Paragraph>
    <span className="text-primary">by</span>&nbsp;
    {proposer}
  </Paragraph>
)
