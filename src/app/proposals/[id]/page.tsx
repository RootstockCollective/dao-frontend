'use client'
import { MouseEvent, Fragment, useMemo, useState, useRef, useEffect } from 'react'
import { useFetchAllProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { useGetProposalSnapshot } from '@/app/proposals/hooks/useGetProposalSnapshot'
import { useGetProposalVotes } from '@/app/proposals/hooks/useGetProposalVotes'
import { useVotingPowerAtSnapshot } from '@/app/proposals/hooks/useVotingPowerAtSnapshot'
import { DecodedData, getProposalEventArguments, splitCombinedName } from '@/app/proposals/shared/utils'
import { Header, Paragraph, Span } from '@/components/TypographyNew'
import { config } from '@/config'
import { RIF_ADDRESS } from '@/lib/constants'
import { formatNumberWithCommas } from '@/lib/utils'
import { useExecuteProposal } from '@/shared/hooks/useExecuteProposal'
import { useQueueProposal } from '@/shared/hooks/useQueueProposal'
import { useVoteOnProposal } from '@/shared/hooks/useVoteOnProposal'
import { waitForTransactionReceipt } from '@wagmi/core'
import { useParams } from 'next/navigation'
import { formatEther, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { ProposalState } from '@/shared/types'
import { usePricesContext } from '@/shared/context/PricesContext'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { ProgressBar } from '@/components/ProgressBarNew'
import { ButtonAction, VotingDetails } from '../components/vote-details'
import { TokenImage } from '@/components/TokenImage'
import { ShortenAndCopy } from '@/components/ShortenAndCopy/ShortenAndCopy'
import { useProposalQuorumAtSnapshot } from '../hooks/useProposalQuorumAtSnapshot'
import { ParsedActionDetails, ActionType, ProposalType } from './types'
import { ActionDetails } from '../components/action-details'
import type { GetPricesResult } from '@/app/user/types'
import { ConnectButtonComponent } from '@/shared/walletConnection/components/ConnectButtonComponent'
import { NewPopover } from '@/components/NewPopover'
import { useGetVoteForSpecificProposal } from '../hooks/useVoteCast'
import { Vote } from '@/shared/types'
import { executeTxFlow } from '@/shared/notification'

export default function ProposalView() {
  const { id } = useParams<{ id: string }>() ?? {}
  const { latestProposals } = useFetchAllProposals()

  const proposal = useMemo(() => {
    const proposal = latestProposals.find(proposal => proposal.args.proposalId.toString() === id)
    if (!proposal) {
      return null
    }
    // @ts-ignore
    return getProposalEventArguments(proposal)
  }, [id, latestProposals])

  return <>{proposal && <PageWithProposal {...proposal} />}</>
}

type ParsedProposal = ReturnType<typeof getProposalEventArguments>

const proposalStateToProgressMap = new Map([
  [ProposalState.Active, 25],
  [ProposalState.Succeeded, 50],
  [ProposalState.Queued, 75],
  [ProposalState.Executed, 100],
  [ProposalState.Defeated, 100],
  [ProposalState.Canceled, 100],
  [undefined, 0],
])

const actionNameToActionTypeMap = new Map<string, ActionType>([
  ['withdraw', ActionType.Transfer],
  ['withdrawERC20', ActionType.Transfer],
  ['communityApproveBuilder', ActionType.BuilderApproval],
  ['whitelistBuilder', ActionType.BuilderApproval],
  ['removeWhitelistedBuilder', ActionType.RemoveBuilder],
  ['dewhitelistBuilder', ActionType.RemoveBuilder],
])

const getStatusSteps = (proposalState: ProposalState) => {
  if (proposalState === ProposalState.Defeated || proposalState === ProposalState.Canceled) {
    return ['ACTIVE', 'FAILED']
  }
  return ['ACTIVE', 'SUCCEEDED', 'QUEUED', 'EXECUTED']
}

const renderStatusPath = (proposalState: ProposalState) => {
  const steps = getStatusSteps(proposalState)

  return (
    <>
      {steps.map((step, index) => (
        <Fragment key={step}>
          <Span variant="body-s">{step}</Span>
          {index < steps.length - 1 && <Span variant="body-s">{'>'}</Span>}
        </Fragment>
      ))}
    </>
  )
}

// Utility to get token symbol from address (expandable)
const tokenAddressToSymbol = {
  [RIF_ADDRESS.toLowerCase()]: 'RIF',
  // Add more tokens here
}

const parseProposalActionDetails = (
  calldatasParsed: DecodedData[],
  prices: GetPricesResult,
): ParsedActionDetails => {
  const action = calldatasParsed?.[0]
  if (!action || action.type !== 'decoded') return { type: '-', amount: undefined, tokenSymbol: undefined }
  const { functionName, args } = action
  switch (functionName) {
    case 'withdraw': {
      const amount = typeof args[1] === 'bigint' ? args[1] : undefined
      const toAddress = typeof args[0] === 'string' ? args[0] : undefined
      return {
        type: ProposalType.WITHDRAW,
        amount,
        tokenSymbol: 'RBTC',
        price: prices?.RBTC?.price ?? 0,
        toAddress,
      }
    }
    case 'withdrawERC20': {
      const tokenAddress = typeof args[0] === 'string' ? args[0].toLowerCase() : ''
      const amount = typeof args[2] === 'bigint' ? args[2] : undefined
      const toAddress = typeof args[1] === 'string' ? args[1] : undefined
      const symbol = tokenAddressToSymbol[tokenAddress] || tokenAddress
      const price = symbol === 'RIF' ? (prices?.RIF?.price ?? 0) : 0
      return {
        type: ProposalType.WITHDRAW,
        amount,
        tokenSymbol: symbol,
        price,
        toAddress,
      }
    }
    case 'communityApproveBuilder': {
      const builder = typeof args[0] === 'string' ? args[0] : undefined
      return {
        type: ProposalType.BUILDER_ACTIVATION,
        builder,
      }
    }
    case 'removeWhitelistedBuilder':
    case 'dewhitelistBuilder': {
      const builder = typeof args[0] === 'string' ? args[0] : undefined
      return {
        type: ProposalType.BUILDER_DEACTIVATION,
        builder,
      }
    }
    default:
      return { type: '-', amount: undefined, tokenSymbol: undefined }
  }
}

const PageWithProposal = (proposal: ParsedProposal) => {
  const { address, isConnected } = useAccount()
  const { proposalId, name, description, proposer, Starts, calldatasParsed, fullProposalName } = proposal
  const [vote, setVote] = useGetVoteForSpecificProposal(address ?? zeroAddress, proposalId)
  const [isChoosingVote, setIsChoosingVote] = useState(false)
  const [votingTxIsPending, setVotingTxIsPending] = useState(false)

  const [againstVote, forVote, abstainVote] = useGetProposalVotes(proposalId, true)
  const snapshot = useGetProposalSnapshot(proposalId)
  const { quorum } = useProposalQuorumAtSnapshot(snapshot)

  const { votingPowerAtSnapshot, doesUserHasEnoughThreshold } = useVotingPowerAtSnapshot(snapshot as bigint)

  const { onVote, isProposalActive, proposalState, isVoting, isWaitingVotingReceipt, setVotingTxHash } =
    useVoteOnProposal(proposalId)
  const [isQueueing, setIsQueueing] = useState<boolean>()
  const { onQueueProposal } = useQueueProposal(proposalId)

  const { onExecuteProposal, canProposalBeExecuted } = useExecuteProposal(proposalId)
  const [isExecuting, setIsExecuting] = useState(false)

  const [popoverOpen, setPopoverOpen] = useState(false)
  const voteButtonRef = useRef<HTMLButtonElement>(null)

  const cannotCastVote =
    proposalState !== ProposalState.Succeeded &&
    proposalState !== ProposalState.Queued &&
    (!isProposalActive || !!vote || !doesUserHasEnoughThreshold || isVoting || isWaitingVotingReceipt)

  const actionName = calldatasParsed?.[0]?.type === 'decoded' ? calldatasParsed[0].functionName : undefined
  const { builderName } = splitCombinedName(fullProposalName || name)

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
      setVotingTxHash(txHash)
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

  const linkfyUrls = (description: string | undefined | null): string => {
    if (typeof description !== 'string') return ''
    const urlRegex =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g
    return description.replace(urlRegex, url => {
      const href = url.startsWith('http') || url.startsWith('https') ? url : `https://${url}`
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">${url}</a>`
    })
  }

  const descriptionHtml = linkfyUrls(description)

  let actionType: ActionType = ActionType.Unknown
  let addressToWhitelist = ''

  if (actionName && actionNameToActionTypeMap.has(actionName)) {
    actionType = actionNameToActionTypeMap.get(actionName)!
  }

  if (
    actionName === 'communityApproveBuilder' &&
    calldatasParsed?.[0]?.type === 'decoded' &&
    typeof calldatasParsed[0].args[0] === 'string'
  ) {
    addressToWhitelist = calldatasParsed[0].args[0]
  } else if (
    actionName === 'withdraw' &&
    calldatasParsed?.[0]?.type === 'decoded' &&
    typeof calldatasParsed[0].args[1] === 'string'
  ) {
    addressToWhitelist = calldatasParsed[0].args[1]
  }

  const { prices } = usePricesContext()
  const parsedAction = parseProposalActionDetails(calldatasParsed, prices)

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

  return (
    <div className="min-h-screen text-white px-4 py-8 flex flex-col gap-4 w-full max-w-full">
      <Header variant="h1" className="text-3xl text-white">
        {name}
      </Header>
      <div className="flex flex-row gap-2 w-full max-w-full mt-10">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-bg-80 p-6 flex flex-col gap-y-6">
            <div className="flex flex-col w-full">
              <div className="flex flex-row justify-between w-full">{renderStatusPath(proposalState!)}</div>
              <ProgressBar progress={proposalStateToProgressMap.get(proposalState) ?? 0} className="mt-3" />
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mt-10">
              <div>
                <Span variant="tag-s" className="text-white/70" bold>
                  Proposal type
                </Span>
                <Paragraph variant="body" className="flex items-center">
                  {/* For transfer actions, show amount, token image, and symbol. For others, show a label. */}
                  {parsedAction.type === ProposalType.WITHDRAW &&
                  parsedAction.amount &&
                  parsedAction.tokenSymbol ? (
                    <>
                      Transfer of {formatNumberWithCommas(formatEther(parsedAction.amount))}
                      <Span className="inline-flex ml-2">
                        <TokenImage symbol={parsedAction.tokenSymbol} size={16} />
                        <Span className="font-bold ml-1">{parsedAction.tokenSymbol}</Span>
                      </Span>
                    </>
                  ) : parsedAction.type === ProposalType.BUILDER_ACTIVATION ? (
                    <>Builder activation</>
                  ) : parsedAction.type === ProposalType.BUILDER_DEACTIVATION ? (
                    <>Builder deactivation</>
                  ) : (
                    <>{parsedAction.type}</>
                  )}
                </Paragraph>
              </div>
              <div>
                <Span variant="tag-s" className="text-white/70" bold>
                  Created on
                </Span>
                <Paragraph variant="body">{Starts ? Starts.format('DD MMM YYYY') : '—'}</Paragraph>
              </div>
              <div>
                {actionName === 'communityApproveBuilder' ? (
                  <Span variant="tag-s" className="text-white/70" bold>
                    Builder name
                  </Span>
                ) : null}
                <Paragraph variant="body" className="text-sm font-medium text-primary">
                  {/** TODO: enable later when builder profile feature is implemented */}
                  {/* <a href={`/builders/${addressToWhitelist}`} className="hover:underline"> */}
                  {builderName}
                  {/* </a> */}
                </Paragraph>
              </div>
              <div>
                {actionName === 'communityApproveBuilder' ? (
                  <Span variant="tag-s" className="text-white/70" bold>
                    Builder address
                  </Span>
                ) : null}
                {addressToWhitelist && actionName === 'communityApproveBuilder' ? (
                  <ShortenAndCopy value={addressToWhitelist} />
                ) : null}
              </div>
              <div>
                <Span variant="tag-s" className="text-white/70" bold>
                  Proposed by
                </Span>
                {proposer ? <ShortenAndCopy value={proposer} /> : <Span variant="body">—</Span>}
              </div>
              <div>
                <Span variant="tag-s" className="text-white/70" bold>
                  Community discussion
                </Span>
                <Paragraph variant="body" className="text-sm font-medium text-primary">
                  <a
                    href="https://rootstockcollective.xyz/discourse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    See on Discourse
                  </a>
                </Paragraph>
              </div>
            </div>

            <div className="mt-14">
              <Header variant="h2" className="text-xl mb-4 text-white">
                DESCRIPTION
              </Header>
              <Paragraph
                variant="body"
                className="text-base text-white/90 whitespace-pre-line"
                html
                // eslint-disable-next-line react/no-children-prop
                children={descriptionHtml}
              />
            </div>
          </div>

          <div className="w-full mt-2 bg-bg-80 p-6">
            <Header variant="h3" className="text-lg mb-2">
              TECHNICAL DETAILS
            </Header>
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <Paragraph variant="body-s" className="text-white/70" bold>
                  Snapshot - taken at block
                </Paragraph>
                <Paragraph variant="body">{snapshot?.toString() || '—'}</Paragraph>
              </div>
              <div>
                <Paragraph variant="body-s" className="text-white/70" bold>
                  Proposal ID
                </Paragraph>
                {proposalId ? <ShortenAndCopy value={proposalId} /> : <Span variant="body">—</Span>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col max-w-[376px]">
          <NewPopover
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
            anchorRef={voteButtonRef}
            className="bg-text-80 rounded-[4px] border border-text-80 p-6 shadow-lg w-72"
            contentClassName="flex flex-col items-start bg-transparent h-full"
            content={
              <>
                <Span className="mb-4 text-left text-bg-100 text-base font-normal">
                  Connect your wallet to see your available voting power and to vote.
                </Span>
                <ConnectWorkflow
                  ConnectComponent={props => (
                    <ConnectButtonComponent {...props} textClassName="text-bg-100" />
                  )}
                />
              </>
            }
          />
          <VotingDetails
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
          />
          <ActionDetails parsedAction={parsedAction} actionType={actionType} />
        </div>
      </div>
    </div>
  )
}
