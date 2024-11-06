import { Button } from '@/components/Button'
import { Header } from '@/components/Typography'
import { GoRocket } from 'react-icons/go'

export const CreateProposalHeaderSection = ({ disabled = true, loading = false }) => (
  <div className="flex flex-row justify-between container pl-4">
    <Header variant="h2" className="font-semibold">
      Create proposal
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
