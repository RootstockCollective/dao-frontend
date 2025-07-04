import Link from 'next/link'
import { Address } from 'viem'
import { Paragraph } from '@/components/TypographyNew'
import { CopyButton } from '@/components/CopyButton'
import { shortAddress } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'

interface ProposalNameColumnProps {
  name: string
  proposalId: string
}

export const ProposalNameColumn = ({ name, proposalId }: ProposalNameColumnProps) => {
  return (
    <Link
      className="text-primary group-hover:underline group-hover:text-bg-100 group-hover:decoration-bg-40"
      href={`/proposals/${proposalId}`}
    >
      <Paragraph>{name}</Paragraph>
    </Link>
  )
}

export const ProposerColumn = ({ by: proposer }: { by: Address }) => (
  <div>
    <Tooltip text="Copy address">
      <span className="font-rootstock-sans">
        <CopyButton icon={null} className="inline" copyText={proposer}>
          <span className="text-primary">by</span>&nbsp;
          <span>{shortAddress(proposer)}</span>
        </CopyButton>
      </span>
    </Tooltip>
  </div>
)
