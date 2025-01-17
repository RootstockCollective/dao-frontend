import { Paragraph, HeaderTitle } from '@/components/Typography'
import { Button } from '@/components/Button'
import { Popover } from '@/components/Popover'
import { useModal } from '@/app/user/Balances/hooks/useModal'
import { ProposalSelectionModal } from '@/components/Modal/ProposalSelectionModal'

interface Props {
  createProposalDisabledError: string | null
  isConnected: boolean
}

export const HeaderSection = ({ createProposalDisabledError, isConnected }: Props) => (
  <div className="flex flex-row justify-between container">
    <HeaderTitle>My Governance</HeaderTitle>
    <div className="flex flex-row gap-x-6">
      {createProposalDisabledError ? (
        <Popover
          content={
            !isConnected ? (
              <Paragraph variant="normal" className="text-sm">
                You need to connect your wallet to be able to Create a Proposal.
              </Paragraph>
            ) : (
              <Paragraph variant="normal" className="text-sm">
                {createProposalDisabledError}
              </Paragraph>
            )
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
      {/*<Button variant="secondary" disabled>*/}
      {/*  Delegate*/}
      {/*</Button>*/}
    </div>
  </div>
)

const CreateProposalButton = ({ disabled = false }) => {
  const modal = useModal()

  return (
    <>
      <Button onClick={modal.openModal} disabled={disabled} data-testid="CreateProposal">
        Create Proposal
      </Button>
      {modal.isModalOpened && <ProposalSelectionModal onClose={modal.closeModal} />}
    </>
  )
}
