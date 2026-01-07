import { type MouseEvent, useCallback, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { zeroAddress } from 'viem'
import { useGetProposalVotes } from '@/app/proposals/hooks/useGetProposalVotes'
import { useVotingPowerAtSnapshot } from '@/app/proposals/hooks/useVotingPowerAtSnapshot'
import { useProposalQuorumAtSnapshot } from '@/app/proposals/hooks/useProposalQuorumAtSnapshot'
import { useGetVoteForSpecificProposal } from '@/app/proposals/hooks/useVoteCast'
import type { useVoteOnProposal } from '@/shared/hooks/useVoteOnProposal'
import { useQueueProposal } from '@/shared/hooks/useQueueProposal'
import { useExecuteProposal } from '@/shared/hooks/useExecuteProposal'
import { waitForTransactionReceipt } from '@wagmi/core'
import { config } from '@/config'
import { executeTxFlow, showToast } from '@/shared/notification'
import { useCheckTreasuryFunds } from '@/app/proposals/hooks/useCheckTreasuryFunds'
import type { Vote } from '@/shared/types'
import { ProposalState } from '@/shared/types'
import Big from '@/lib/big'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { ConnectButtonComponent } from '@/shared/walletConnection/components/ConnectButtonComponent'
import { NewPopover } from '@/components/NewPopover'
import { VotingDetails as VotingDetailsComponent, type ButtonAction } from '../../components/vote-details'
import { ActionDetails } from '../../components/action-details'
import type { ParsedActionDetails } from '../types'
import { Span } from '@/components/Typography'
import type { Eta } from '../../shared/types'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { MobileVotingButton } from './MobileVotingButton'
import { Modal } from '@/components/Modal'
import { useAppKitFlow } from '@/shared/walletConnection/connection/useAppKitFlow'

interface VotingDetailsProps {
  proposalId: string
  parsedActions: ParsedActionDetails[]
  snapshot: bigint | undefined
  proposalDeadline: Big
  voteStart: string | undefined
  voteOnProposalData: ReturnType<typeof useVoteOnProposal>
}

export const VotingDetails = ({
  proposalId,
  parsedActions,
  snapshot,
  proposalDeadline,
  voteStart,
  voteOnProposalData,
}: VotingDetailsProps) => {
  const { onConnectWalletButtonClick } = useAppKitFlow()
  const { address, isConnected } = useAccount()
  const [vote, setVote] = useGetVoteForSpecificProposal(address ?? zeroAddress, proposalId)
  const [isChoosingVote, setIsChoosingVote] = useState(false)
  const [votingTxIsPending, setVotingTxIsPending] = useState(false)

  // Mobile modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isDesktop = useIsDesktop()

  const [againstVote, forVote, abstainVote] = useGetProposalVotes(proposalId, true)
  const { quorum } = useProposalQuorumAtSnapshot(snapshot)
  const { votingPowerAtSnapshot, doesUserHasEnoughThreshold } = useVotingPowerAtSnapshot(snapshot as bigint)

  const { onVote, isProposalActive, proposalState, isVoting, isWaitingVotingReceipt, setVotingTxHash } =
    voteOnProposalData

  const [isQueueing, setIsQueueing] = useState<boolean>()
  const { onQueueProposal } = useQueueProposal(proposalId)

  const { onExecuteProposal, canProposalBeExecuted, proposalEta, proposalQueuedTime } =
    useExecuteProposal(proposalId)
  const [isExecuting, setIsExecuting] = useState(false)
  const { hasEnoughFunds, missingAsset, isLoading: isLoadingFundsCheck } = useCheckTreasuryFunds(proposalId)

  const [popoverOpen, setPopoverOpen] = useState(false)
  const voteButtonRef = useRef<HTMLButtonElement>(null)

  const cannotCastVote =
    proposalState !== ProposalState.Succeeded &&
    proposalState !== ProposalState.Queued &&
    (!isProposalActive || !!vote || !doesUserHasEnoughThreshold || isVoting || isWaitingVotingReceipt)

  const handleVoting = async (_vote: Vote) => {
    try {
      setIsChoosingVote(false)
      const txHash = await executeTxFlow({
        onRequestTx: () => {
          setVote(_vote)
          return onVote(_vote)
        },
        action: 'voting',
        onSuccess: () => {
          setVote(_vote)
        },
        onError: () => {
          setVote(undefined)
        },
        onPending: () => setVotingTxIsPending(true),
        onComplete: () => setVotingTxIsPending(false),
      })
      if (txHash) {
        setVotingTxHash(txHash)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const handleQueuingProposal = async () => {
    const txHash = await executeTxFlow({
      onRequestTx: () => {
        setIsQueueing(true)
        return onQueueProposal()
      },
      action: 'queuing',
      onComplete: () => {
        setIsQueueing(false)
      },
      onError: err => {
        console.log('ERROR', err)
      },
    })

    if (txHash) {
      await waitForTransactionReceipt(config, {
        hash: txHash,
      })
    }
  }

  const handleExecuteProposal = async () => {
    // Check if treasury has enough funds before executing
    if (!isLoadingFundsCheck && !hasEnoughFunds && missingAsset) {
      showToast({
        severity: 'error',
        title: 'Cannot Execute',
        content: `The transaction will fail because the treasury does not have enough ${missingAsset}.`,
      })
      return
    }

    const txHash = await executeTxFlow({
      onRequestTx: () => {
        setIsExecuting(true)
        return onExecuteProposal()
      },
      action: 'execution',
      onComplete: () => {
        setIsExecuting(false)
      },
    })

    if (txHash) {
      await waitForTransactionReceipt(config, {
        hash: txHash,
      })
    }
  }

  const handleProposalAction = useCallback(
    (action: () => void) => (_: MouseEvent<HTMLButtonElement>) => {
      if (!isConnected) {
        if (!isDesktop) {
          onConnectWalletButtonClick()
          return
        }
        setPopoverOpen(true)
        return
      }
      action()
    },
    [isConnected, isDesktop, onConnectWalletButtonClick],
  )

  const getButtonActionForState = (
    state?: ProposalState,
    _canProposalBeExecuted?: boolean,
    _cannotCastVote?: boolean,
  ): ButtonAction | undefined => {
    switch (state) {
      case ProposalState.Active:
        if (_cannotCastVote) return undefined
        return {
          actionName: 'Vote on proposal',
          onButtonClick: handleProposalAction(() => setIsChoosingVote(true)),
        }

      case ProposalState.Succeeded:
        return {
          actionName: 'Put on queue',
          onButtonClick: handleProposalAction(handleQueuingProposal),
        }

      case ProposalState.Queued:
        if (!_canProposalBeExecuted) return undefined

        return {
          actionName: 'Execute',
          onButtonClick: handleProposalAction(handleExecuteProposal),
        }
      default:
        return undefined
    }
  }

  const getEta = (_proposalState?: ProposalState): Eta | undefined => {
    switch (_proposalState) {
      case ProposalState.Canceled:
      case ProposalState.Defeated:
      case ProposalState.Succeeded:
        return undefined
      case ProposalState.Queued:
        if (!proposalEta) return undefined
        return {
          type: 'queue ends in',
          end: proposalEta,
          timeSource: 'timestamp',
          referenceStart: proposalQueuedTime,
          colorDirection: 'reversed',
        }
      case ProposalState.Active:
        return {
          type: 'vote end in',
          end: proposalDeadline,
          timeSource: 'blocks',
          referenceStart: voteStart ? Big(voteStart) : undefined,
        }
      default:
        return undefined
    }
  }

  // Extract the voting details content into a reusable component
  const VotingDetailsContent = () => (
    <div className="flex flex-col md:max-w-[376px]">
      <NewPopover
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
        anchorRef={voteButtonRef}
        className="bg-text-80 rounded-[4px] border border-text-80 p-6 shadow-lg w-72"
        contentClassName="flex flex-col items-start bg-transparent h-full"
        content={
          <>
            <Span className="mb-4 text-left text-bg-100">
              Connect your wallet to see your available voting power and to vote.
            </Span>
            <ConnectWorkflow
              ConnectComponent={props => <ConnectButtonComponent {...props} textClassName="text-bg-100" />}
            />
          </>
        }
      />
      <VotingDetailsComponent
        votingPower={votingPowerAtSnapshot}
        voteData={{
          for: forVote,
          against: againstVote,
          abstain: abstainVote,
          quorum,
        }}
        buttonAction={getButtonActionForState(
          proposalState,
          canProposalBeExecuted,
          !isConnected ? false : cannotCastVote,
        )}
        voteButtonRef={voteButtonRef}
        vote={vote}
        isChoosingVote={isChoosingVote}
        isVotingInProgress={isVoting || isWaitingVotingReceipt || votingTxIsPending}
        onCastVote={address && handleVoting}
        onCancelVote={() => setIsChoosingVote(false)}
        actionDisabled={isQueueing || isExecuting}
        eta={getEta(proposalState)}
      />
      {isDesktop && <ActionDetails parsedActions={parsedActions} />}
    </div>
  )

  // Mobile: Show button that opens modal
  if (!isDesktop) {
    return (
      <>
        <ActionDetails parsedActions={parsedActions} />
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)} fullscreen>
            <VotingDetailsContent />
          </Modal>
        )}
        <MobileVotingButton onClick={() => setIsModalOpen(true)} disabled={isQueueing || isExecuting} />
      </>
    )
  }

  // Desktop: Render exactly as before (unchanged behavior)
  return <VotingDetailsContent />
}
