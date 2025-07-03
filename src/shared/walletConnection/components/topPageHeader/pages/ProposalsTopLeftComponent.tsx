'use client'
import { Dropdown, prepareProposalsData } from '@/components/dropdown'
import { Paragraph } from '@/components/Typography'
import { Popover } from '@/components/Popover'
import { useRouter } from 'next/navigation'
import { HeaderButton } from '@/components/Button'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { useAccount } from 'wagmi'

export const ProposalsTopLeftComponent = () => {
  const { canCreateProposal: canUserCreateProposals, threshold } = useVotingPower()
  const { isConnected } = useAccount()

  if (!isConnected) {
    return null
  }
  return (
    <div className="flex flex-row gap-x-4">
      {/* PREPARE YOUR PROPOSAL */}
      <div className="flex-1">
        <Dropdown
          title={'Prepare your proposal'}
          description={
            'If these steps are not completed, your proposal is unlikely to reach quorum and succeed in a vote.'
          }
          data={prepareProposalsData}
        />
      </div>
      {/* CREATE PROPOSAL */}
      <Popover
        content={
          <Paragraph variant="normal" className="text-sm">
            You need at least {threshold} Voting Power to create a proposal. The easiest way to get more
            Voting Power is to Stake more RIF.
          </Paragraph>
        }
        disabled={canUserCreateProposals}
        trigger="hover"
        background="dark"
        size="small"
      >
        <CreateProposalButton disabled={!canUserCreateProposals} />
      </Popover>
    </div>
  )
}

/**
 * A button that redirects the user to the proposal creation page
 * @param disabled
 * @constructor
 */
const CreateProposalButton = ({ disabled = false }) => {
  const { push } = useRouter()
  const onHeaderButtonClick = () => push('/proposals/new-proposal')
  return (
    <HeaderButton
      disabled={disabled}
      data-testid="CreateProposal"
      onClick={onHeaderButtonClick}
      className="h-[59px] p-[24px]"
      variant="outlined"
    >
      Create Proposal
    </HeaderButton>
  )
}
