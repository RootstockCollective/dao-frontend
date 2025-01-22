import { Button } from '@/components/Button'
import { Header } from '@/components/Typography'
import { GoRocket } from 'react-icons/go'

interface CreateProposalHeaderSectionProps {
  proposalType: ProposalType
  disabled?: boolean
  loading?: boolean
}

export enum ProposalType {
  BUILDER_ACTIVATION = 'Builder Activation',
  BUILDER_DEACTIVATION = 'Builder Deactivation',
  STANDARD = 'Standard',
}

export const CreateProposalHeaderSection = ({
  proposalType,
  disabled = true,
  loading = false,
}: CreateProposalHeaderSectionProps) => (
  <div className="flex flex-row justify-between container pl-4">
    <Header variant="h2" className="font-semibold">
      Create {proposalType} proposal
    </Header>
    <div className="flex flex-row gap-x-6">
      <Button
        startIcon={<GoRocket />}
        disabled={disabled}
        buttonProps={{ type: 'submit' }}
        loading={loading}
        data-testid="Publish"
      >
        Publish
      </Button>
    </div>
  </div>
)
