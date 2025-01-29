import Link from 'next/link'
import { Paragraph, HeaderTitle } from '@/components/Typography'
import { Button } from '@/components/Button'
import { Popover } from '@/components/Popover'
import { PrepareProposalDropdown } from './prepare-proposal-dropdown'

export const HeaderSection = ({ createProposalDisabled = true, threshold = '' }) => (
  <div className="flex flex-row justify-between container">
    <HeaderTitle className="whitespace-nowrap">My Governance</HeaderTitle>
    <div className="grow flex flex-row justify-end gap-x-6">
      <PrepareProposalDropdown />
      {createProposalDisabled ? (
        <Popover
          content={
            <Paragraph variant="normal" className="text-sm">
              You need at least {threshold} Voting Power to create a proposal. The easiest way to get more
              Voting Power is to Stake more RIF.
            </Paragraph>
          }
          trigger="hover"
          background="dark"
          size="small"
        >
          <CreateProposalButton disabled />
        </Popover>
      ) : (
        <CreateProposalButton />
      )}
    </div>
  </div>
)

const CreateProposalButton = ({ disabled = false }) => (
  <Link href="/proposals/choose">
    <Button className="h-12 whitespace-nowrap" disabled={disabled} data-testid="CreateProposal">
      Create Proposal
    </Button>
  </Link>
)
