'use client'
import { type MouseEvent, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { withFallbackRetry } from '@/app/shared/components/Fallback/FallbackWithRetry'
import { ProposalsFromChain } from '@/app/proposals/ProposalsFromChain'
import { ProposalsFromTheGraph } from '@/app/proposals/ProposalsFromTheGraph'
import { HeroComponent } from '@/components/HeroComponent'
import { Button } from '@/components/Button'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { ConnectButtonComponentProps } from '@/shared/walletConnection'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { Paragraph, Span } from '@/components/Typography'
import { ExternalLink } from '@/components/Link'
import { ArrowUpRightLightIcon } from '@/components/Icons'
import { NewPopover } from '@/components/NewPopover'

export default function ProposalsPage() {
  return (
    <>
      <HeroComponent
        imageSrc="/images/hero/proposals-banner.png"
        title="Propose a Project,"
        subtitle="Get support to build it"
        items={[
          <Paragraph key="proposals-page-item-1">
            Clarify your project&apos;s purpose on{' '}
            <ExternalLink
              href="https://gov.rootstockcollective.xyz"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discourse
              <ArrowUpRightLightIcon />
            </ExternalLink>
          </Paragraph>,
          'Submit a proposal to suggest a change or fund a project',
          'The community will view and discuss it',
          'The community will use their stRIF or delegated power to vote',
          'If your proposal passes quorum, it will be approved',
          'Complete your KYC to ensure eligibility (apply for Grants)',
        ]}
        button={<CreateProposalFlow />}
        dataTestId="ProposalsHeroComponent"
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
  return <CreateProposalButton onClick={() => push('/proposals/new')} isConnected />
}

const CreateProposalButton = ({ onClick, isConnected = false }: ConnectButtonComponentProps) => {
  const { isLoading, canCreateProposal, threshold } = useVotingPower()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [popoverMessage, setPopoverMessage] = useState('')

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isConnected && (isLoading || !canCreateProposal)) {
      const message = isLoading
        ? 'Checking your voting power...'
        : `You need at least ${threshold} Voting Power to create a proposal.`
      setPopoverMessage(message)
      setPopoverOpen(true)
      return
    }
    onClick?.(event)
  }

  return (
    <NewPopover
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
      anchor={
        <Button onClick={handleClick} data-testid="CreateProposalButton">
          Create a proposal
        </Button>
      }
      className="bg-text-80 rounded-[4px] border border-text-80 p-6 shadow-lg w-72"
      contentClassName="flex flex-col items-start bg-transparent h-full"
      content={<Span className="text-left text-bg-100">{popoverMessage}</Span>}
    />
  )
}
