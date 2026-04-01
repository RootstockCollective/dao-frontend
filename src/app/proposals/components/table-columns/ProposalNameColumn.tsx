import Link from 'next/link'
import { Address } from 'viem'
import { Paragraph, Span } from '@/components/Typography'
import { CopyButton } from '@/components/CopyButton'
import { shortAddress } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface ProposalNameColumnProps {
  name: string
  proposalId: string
}

export const ProposalNameColumn = ({ name, proposalId }: ProposalNameColumnProps) => (
  <Link
    className="text-primary group-hover:underline group-hover:text-bg-100 group-hover:decoration-bg-40"
    href={`/proposals/${proposalId}`}
    data-testid="ProposalLink"
  >
    <Paragraph className="break-all">{name}</Paragraph>
  </Link>
)

export const ProposerColumn = ({ by: proposer }: { by: Address }) => {
  const isDesktop = useIsDesktop()
  return (
    <Tooltip text="Copy address">
      <CopyButton icon={null} className="inline" copyText={proposer}>
        <Span variant="body-s">by</Span>
        &nbsp;
        <Span variant="body-s" className="text-primary">
          {shortAddress(proposer, !isDesktop ? 2 : 4)}
        </Span>
      </CopyButton>
    </Tooltip>
  )
}
