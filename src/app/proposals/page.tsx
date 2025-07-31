'use client'
import { ErrorBoundary } from 'react-error-boundary'
import { withFallbackRetry } from '@/app/components'
import { ProposalsFromChain } from '@/app/proposals/ProposalsFromChain'
import { ProposalsFromTheGraph } from '@/app/proposals/ProposalsFromTheGraph'
import { HeroComponent } from '@/components/HeroComponent'
import { Button } from '@/components/ButtonNew'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { ConnectButtonComponentProps } from '@/shared/walletConnection'

export default function ProposalsPage() {
  return (
    <>
      <HeroComponent
        imageSrc="/images/hero/proposals-banner.png"
        title="Propose a Project,"
        subtitle="Get support to build it"
        items={[
          "Clarify your project's purpose on Discourse",
          'Submit a proposal to suggest a change or fund a project',
          'The community will view and discuss it',
          'The community will use their stRIF or delegated power to vote',
          'If your proposal passes quorum, it will be approved',
          'Complete your KYC to ensure eligibility (apply for Grants)',
        ]}
        button={<CreateProposalFlow />}
      />
      <ErrorBoundary fallbackRender={withFallbackRetry(<ProposalsFromChain />)}>
        <ProposalsFromTheGraph />
      </ErrorBoundary>
    </>
  )
}

/**
 * This will determine whether the user is connected to a wallet or not.
 * @constructor
 */
const CreateProposalFlow = () => {
  const { isConnected } = useAccount()
  const { push } = useRouter()

  if (!isConnected) {
    return <ConnectWorkflow ConnectComponent={CreateProposalButton} />
  }
  return <CreateProposalButton onClick={() => push('/proposals/new')} />
}

const CreateProposalButton = ({ onClick }: ConnectButtonComponentProps) => (
  <Button onClick={onClick}>Create a proposal</Button>
)
