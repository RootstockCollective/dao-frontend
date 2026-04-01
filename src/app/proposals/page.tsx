'use client'
import { type MouseEvent, useCallback, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { withFallbackRetry } from '@/app/shared/components/Fallback/FallbackWithRetry'
import { ProposalsFromChain } from '@/app/proposals/ProposalsFromChain'
import { ProposalsFromTheGraph } from '@/app/proposals/ProposalsFromTheGraph'
import { HeroComponent } from '@/components/HeroComponent'
import { Button } from '@/components/Button'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { ConnectButtonComponent } from '@/shared/walletConnection/components/ConnectButtonComponent'
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
 * Entry point for the Create Proposal button flow.
 * Handles all states: not connected, loading, insufficient VP, and can create.
 */
const CreateProposalFlow = () => {
  const { isConnected } = useAccount()
  const { push } = useRouter()
  const { isLoading, canCreateProposal, threshold } = useVotingPower()

  const [popoverOpen, setPopoverOpen] = useState(false)
  const [popoverContent, setPopoverContent] = useState<'connect' | 'message'>('connect')
  const [popoverMessage, setPopoverMessage] = useState('')

  const handleClick = useCallback(
    (_: MouseEvent<HTMLButtonElement>) => {
      // Not connected: show connect popover
      if (!isConnected) {
        setPopoverContent('connect')
        setPopoverOpen(true)
        return
      }

      // Connected but loading or can't create: show message popover
      if (isLoading || !canCreateProposal) {
        const message = isLoading
          ? 'Checking your voting power...'
          : `You need at least ${threshold} Voting Power to create a proposal.`
        setPopoverMessage(message)
        setPopoverContent('message')
        setPopoverOpen(true)
        return
      }

      // Connected and can create: navigate
      push('/proposals/new')
    },
    [isConnected, isLoading, canCreateProposal, threshold, push],
  )

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
      content={
        popoverContent === 'connect' ? (
          <>
            <Span className="mb-4 text-left text-bg-100">Connect your wallet to create a proposal.</Span>
            <ConnectWorkflow
              ConnectComponent={props => <ConnectButtonComponent {...props} textClassName="text-bg-100" />}
            />
          </>
        ) : (
          <Span className="text-left text-bg-100">{popoverMessage}</Span>
        )
      }
    />
  )
}
