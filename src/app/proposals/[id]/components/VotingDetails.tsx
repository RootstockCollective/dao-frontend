import { MouseEvent, useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { zeroAddress } from 'viem'
import { useGetProposalVotes } from '@/app/proposals/hooks/useGetProposalVotes'
import { useVotingPowerAtSnapshot } from '@/app/proposals/hooks/useVotingPowerAtSnapshot'
import { useProposalQuorumAtSnapshot } from '@/app/proposals/hooks/useProposalQuorumAtSnapshot'
import { useGetVoteForSpecificProposal } from '@/app/proposals/hooks/useVoteCast'
import { useVoteOnProposal } from '@/shared/hooks/useVoteOnProposal'
import { useQueueProposal } from '@/shared/hooks/useQueueProposal'
import { useExecuteProposal } from '@/shared/hooks/useExecuteProposal'
import { waitForTransactionReceipt } from '@wagmi/core'
import { config } from '@/config'
import { executeTxFlow } from '@/shared/notification'
import { Vote } from '@/shared/types'
import { ProposalState } from '@/shared/types'
import Big from '@/lib/big'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { ConnectButtonComponent } from '@/shared/walletConnection/components/ConnectButtonComponent'
import { NewPopover } from '@/components/NewPopover'
import { VotingDetails as VotingDetailsComponent, ButtonAction } from '../../components/vote-details'
import { ActionDetails } from '../../components/action-details'
import { ParsedActionDetails, ActionType } from '../types'
import { Span } from '@/components/Typography'
import { Eta } from '../../shared/types'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { MobileVotingButton } from './MobileVotingButton'
import { Modal } from '@/components/Modal'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'

const actionNameToActionTypeMap = new Map<string, ActionType>([
  ['withdraw', ActionType.Transfer],
  ['withdrawERC20', ActionType.Transfer],
  ['communityApproveBuilder', ActionType.BuilderApproval],
  ['whitelistBuilder', ActionType.BuilderApproval],
  ['removeWhitelistedBuilder', ActionType.RemoveBuilder],
  ['dewhitelistBuilder', ActionType.RemoveBuilder],
])

interface VotingDetailsProps {
  proposalId: string
  parsedAction: ParsedActionDetails
  actionName: string | undefined
  snapshot: bigint | undefined
  proposalDeadline: Big
  voteStart: string | undefined
  voteOnProposalData: ReturnType<typeof useVoteOnProposal>
}

export const VotingDetails = ({
  proposalId,
  parsedAction,
  actionName,
  snapshot,
  proposalDeadline,
  voteStart,
  voteOnProposalData,
}: VotingDetailsProps) => {
  const { openDrawer, closeDrawer } = useLayoutContext()
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

  const [popoverOpen, setPopoverOpen] = useState(false)
  const voteButtonRef = useRef<HTMLButtonElement>(null)

  const actionType: string =
    actionName && actionNameToActionTypeMap.has(actionName)
      ? actionNameToActionTypeMap.get(actionName)!
      : ActionType.Unknown

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

  const handleProposalAction = (action: () => void) => (_: MouseEvent<HTMLButtonElement>) => {
    if (!isConnected) {
      setPopoverOpen(true)
      return
    }
    action()
  }

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

  useEffect(() => {
    if (!isDesktop) {
      openDrawer(
        <MobileVotingButton onClick={() => setIsModalOpen(true)} disabled={isQueueing || isExecuting} />,
      )
    }

    return () => closeDrawer()
  }, [])

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
        isConnected={isConnected}
        actionDisabled={isQueueing || isExecuting}
        eta={getEta(proposalState)}
      />
      {isDesktop && <ActionDetails parsedAction={parsedAction} actionType={actionType} />}
    </div>
  )

  // Mobile: Show button that opens modal
  if (!isDesktop) {
    return (
      <>
        <ActionDetails parsedAction={parsedAction} actionType={actionType} />
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)} fullscreen>
            <VotingDetailsContent />
          </Modal>
        )}
      </>
    )
  }

  // Desktop: Render exactly as before (unchanged behavior)
  return <VotingDetailsContent />
}
