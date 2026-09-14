'use client'

import { useRouter } from 'next/navigation'
import { type MouseEvent, useCallback, useState } from 'react'
import { useAccount } from 'wagmi'

import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { Button } from '@/components/Button'
import { NewPopover } from '@/components/NewPopover'
import { Span } from '@/components/Typography'
import { ConnectButtonComponent } from '@/shared/walletConnection/components/ConnectButtonComponent'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'

/**
 * Entry point for the Create Proposal button flow.
 * Handles all states: not connected, loading, insufficient VP, and can create.
 */
export const CreateProposalFlow = () => {
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
