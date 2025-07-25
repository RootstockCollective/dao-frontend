import Link from 'next/link'
import { Address } from 'viem'
import { Paragraph, Span } from '@/components/TypographyNew'
import { CopyButton } from '@/components/CopyButton'
import { shortAddress } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'

interface ProposalNameColumnProps {
  name: string
  proposalId: string
}

export const ProposalNameColumn = ({ name, proposalId }: ProposalNameColumnProps) => (
  <Link
    className="text-primary group-hover:underline group-hover:text-bg-100 group-hover:decoration-bg-40"
    href={`/proposals/${proposalId}`}
  >
    <Paragraph>{name}</Paragraph>
  </Link>
)

export const ProposerColumn = ({ by: proposer }: { by: Address }) => (
  <Tooltip text="Copy address">
    <CopyButton icon={null} className="inline" copyText={proposer}>
      <Span variant="body-s" className="text-primary">
        by
      </Span>
      &nbsp;
      <Span variant="body-s">{shortAddress(proposer)}</Span>
    </CopyButton>
  </Tooltip>
)
