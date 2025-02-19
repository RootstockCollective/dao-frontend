import { Paragraph, HeaderTitle } from '@/components/Typography'
import { Popover } from '@/components/Popover'
import { Dropdown, prepareProposalsData } from '@/components/dropdown'
import { useRouter } from 'next/navigation'
import { HeaderButton } from '@/components/Button'

export const HeaderSection = ({ createProposalDisabled = true, threshold = '' }) => (
  <div className="flex flex-row justify-between container">
    <HeaderTitle className="whitespace-nowrap">My Governance</HeaderTitle>
    <div className="grow flex flex-row justify-end gap-x-6">
      <Dropdown
        title={'Prepare your proposal'}
        description={
          'If these steps are not completed, your proposal is unlikely to reach quorum and succeed in a vote.'
        }
        data={prepareProposalsData}
      />

      <Popover
        content={
          <Paragraph variant="normal" className="text-sm">
            You need at least {threshold} Voting Power to create a proposal. The easiest way to get more
            Voting Power is to Stake more RIF.
          </Paragraph>
        }
        disabled={!createProposalDisabled}
        trigger="hover"
        background="dark"
        size="small"
      >
        <CreateProposalButton disabled={createProposalDisabled} />
      </Popover>
    </div>
  </div>
)

const CreateProposalButton = ({ disabled = false }) => {
  const { push } = useRouter()

  return (
    <HeaderButton disabled={disabled} data-testid="CreateProposal" onClick={() => push('/proposals/choose')}>
      Create Proposal
    </HeaderButton>
  )
}
