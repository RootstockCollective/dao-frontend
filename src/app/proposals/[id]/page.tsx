'use client'
import { useFetchAllProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { useGetProposalDeadline } from '@/app/proposals/hooks/useGetProposalDeadline'
import { useGetProposalSnapshot } from '@/app/proposals/hooks/useGetProposalSnapshot'
import { useGetProposalVotes } from '@/app/proposals/hooks/useGetProposalVotes'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { useVotingPowerAtSnapshot } from '@/app/proposals/hooks/useVotingPowerAtSnapshot'
import {
  ActionComposerMap,
  ActionInputNameFormatMap,
  FunctionName,
  InputNameFormatMap,
  InputParameterName,
  InputParameterTypeByFnByName,
  InputValueComponent,
  InputValueComposerMap,
  SupportedProposalActionName,
} from '@/app/proposals/shared/supportedABIs'
import { DecodedData, getEventArguments, splitCombinedName } from '@/app/proposals/shared/utils'
import { useAlertContext } from '@/app/providers'
import { useModal } from '@/shared/hooks/useModal'
import { AddressOrAlias as AddressComponent } from '@/components/Address'
import { Button } from '@/components/Button'
import { Popover } from '@/components/Popover'
import { Header, Paragraph, Span } from '@/components/TypographyNew'
import { config } from '@/config'
import { RIF, RIF_ADDRESS } from '@/lib/constants'
import { formatNumberWithCommas, truncateMiddle, formatCurrency, shortAddress } from '@/lib/utils'
import { useExecuteProposal } from '@/shared/hooks/useExecuteProposal'
import { useQueueProposal } from '@/shared/hooks/useQueueProposal'
import { useVoteOnProposal } from '@/shared/hooks/useVoteOnProposal'
import { TX_MESSAGES } from '@/shared/txMessages'
import { waitForTransactionReceipt } from '@wagmi/core'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { FC, Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { MinusIcon } from '@/components/Icons'
import { getAddress, formatEther, zeroAddress } from 'viem'
import { type BaseError, useAccount } from 'wagmi'
import { Vote, VoteProposalModal } from '@/components/Modal/VoteProposalModal'
import { VoteSubmittedModal } from '@/components/Modal/VoteSubmittedModal'
import { ProposalState } from '@/shared/types'
import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'
import Big from '@/lib/big'
import { usePricesContext } from '@/shared/context/PricesContext'
import { getCombinedFiatAmount } from '@/app/collective-rewards/utils'
import { tokenContracts } from '@/lib/contracts'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { ProgressBar } from '@/components/ProgressBarNew'
import { ButtonAction, VotingDetails } from '../components/vote-details'
import moment from 'moment'
import { TokenImage } from '@/components/TokenImage'
import React from 'react'
import { ShortenAndCopy } from '@/components/ShortenAndCopy/ShortenAndCopy'
import { useProposalQuorumAtSnapshot } from '../hooks/useProposalQuorumAtSnapshot'
import { ProposalType } from '../create/CreateProposalHeaderSection'
import {
  ParsedActionDetails,
  ActionDetailsProps,
  ActionType,
  RenderWithdrawActionArgs,
  ParamLabels,
  ParamComponents,
} from './types'
import { ActionDetails } from '../components/action-details'

export default function ProposalView() {
  const { id } = useParams<{ id: string }>() ?? {}
  const { latestProposals } = useFetchAllProposals()

  const proposal = useMemo(() => {
    const proposal = latestProposals.find(proposal => proposal.args.proposalId.toString() === id)
    if (!proposal) {
      return null
    }
    // @ts-ignore
    return getEventArguments(proposal)
  }, [id, latestProposals])

  return <>{proposal && <PageWithProposal {...proposal} />}</>
}

type ParsedProposal = ReturnType<typeof getEventArguments>

const proposalStateToProgressMap = new Map([
  [ProposalState.Active, 25],
  [ProposalState.Succeeded, 50],
  [ProposalState.Queued, 75],
  [ProposalState.Executed, 100],
  [ProposalState.Defeated, 100],
  [ProposalState.Canceled, 100],
  [undefined, 0],
])

const actionNameToProposalTypeMap = new Map<string, ProposalType>([
  ['withdraw', ProposalType.WITHDRAW],
  ['withdrawERC20', ProposalType.WITHDRAW],
  ['communityApproveBuilder', ProposalType.BUILDER_ACTIVATION],
  ['removeWhitelistedBuilder', ProposalType.BUILDER_DEACTIVATION],
  ['dewhitelistBuilder', ProposalType.BUILDER_DEACTIVATION],
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

const parseProposalActionDetails = (calldatasParsed: any, prices: any): ParsedActionDetails => {
  const action = calldatasParsed?.[0]
  if (!action || action.type !== 'decoded')
    return { type: '-', display: '-', amount: undefined, tokenSymbol: undefined }
  const { functionName, args } = action
  switch (functionName) {
    case 'withdraw': {
      const amount = args[1]
      return {
        type: ProposalType.WITHDRAW,
        display: `Transfer of ${formatNumberWithCommas(formatEther(amount))} RBTC`,
        amount,
        tokenSymbol: 'RBTC',
        price: prices?.RBTC?.price ?? 0,
        toAddress: args[0],
      }
    }
    case 'withdrawERC20': {
      const tokenAddress = args[0]?.toLowerCase()
      const amount = args[2]
      const symbol = tokenAddressToSymbol[tokenAddress] || tokenAddress
      const price = symbol === 'RIF' ? (prices?.RIF?.price ?? 0) : 0
      return {
        type: ProposalType.WITHDRAW,
        display: `Transfer of ${formatNumberWithCommas(formatEther(amount))} ${symbol}`,
        amount,
        tokenSymbol: symbol,
        price,
        toAddress: args[1],
      }
    }
    case 'communityApproveBuilder': {
      return {
        type: ProposalType.BUILDER_ACTIVATION,
        display: 'Builder activation',
        builder: args[0],
      }
    }
    case 'removeWhitelistedBuilder':
    case 'dewhitelistBuilder': {
      return {
        type: ProposalType.BUILDER_DEACTIVATION,
        display: 'Builder deactivation',
        builder: args[0],
      }
    }
    default:
      return { type: '-', display: '-', amount: undefined, tokenSymbol: undefined }
  }
}

const PageWithProposal = (proposal: ParsedProposal) => {
  const { proposalId, name, description, proposer, Starts, calldatasParsed } = proposal
  const [vote, setVote] = useState<Vote | null>('for')
  const [errorVoting, setErrorVoting] = useState('')
  const { address, isConnected } = useAccount()
  const votingModal = useModal()
  const submittedModal = useModal()
  const { setMessage } = useAlertContext()

  const [againstVote, forVote, abstainVote] = useGetProposalVotes(proposalId, true)
  const snapshot = useGetProposalSnapshot(proposalId)
  const { quorum } = useProposalQuorumAtSnapshot(snapshot)

  const { blocksUntilClosure } = useGetProposalDeadline(proposalId)
  const { votingPowerAtSnapshot, doesUserHasEnoughThreshold } = useVotingPowerAtSnapshot(snapshot as bigint)
  const { canCreateProposal } = useVotingPower()

  const {
    onVote,
    isProposalActive,
    didUserVoteAlready,
    proposalState,
    proposalStateHuman,
    isVoting,
    isWaitingVotingReceipt,
    setVotingTxHash,
    isVotingConfirmed,
    isVotingFailed,
    votingError,
  } = useVoteOnProposal(proposalId)
  const { onQueueProposal } = useQueueProposal(proposalId)

  const { onExecuteProposal } = useExecuteProposal(proposalId)

  const [isExecuting, setIsExecuting] = useState(false)

  const cannotCastVote =
    !isProposalActive ||
    didUserVoteAlready ||
    !doesUserHasEnoughThreshold ||
    isVoting ||
    isWaitingVotingReceipt

  // Determine proposal type based on action (see ChooseProposal logic)
  // 'withdraw' => 'Standard', 'communityApproveBuilder' => 'Activation'
  let proposalTypeLabel = '—'
  const actionName = calldatasParsed?.[0]?.type === 'decoded' ? calldatasParsed[0].functionName : undefined
  if (actionName === 'withdraw' || actionName === 'withdrawERC20') proposalTypeLabel = 'Standard'
  if (actionName === 'communityApproveBuilder') proposalTypeLabel = 'Activation'

  console.log('actionName', actionName)

  const { proposalName, builderName } = splitCombinedName(name)

  const cannotCastVoteReason = useMemo(() => {
    if (!isProposalActive) {
      return 'This proposal is not active'
    }
    if (didUserVoteAlready) {
      return 'You already voted on this proposal'
    }
    if (!doesUserHasEnoughThreshold) {
      return (
        <>
          You don&apos;t have enough voting power to vote on the this proposal. Your voting power for this
          proposal is determined at the time this proposal was submitted. If your voting power has changed
          since then perhaps due to the amount of stRIF you have staked, then only proposals after this will
          take this new voting power into consideration. More details can be found in the{' '}
          <a
            href="https://rootstockcollective.xyz/pdfs/whitepaper.pdf"
            target="_blank"
            className="hover:underline"
            style={{ color: '#0065FF' }}
          >
            DAO whitepaper
          </a>
          .
        </>
      )
    }
    if (isVoting) {
      return 'Your vote is being processed'
    }
    if (isWaitingVotingReceipt) {
      return 'Your vote is being confirmed'
    }
    return ''
  }, [isProposalActive, didUserVoteAlready, doesUserHasEnoughThreshold, isVoting, isWaitingVotingReceipt])

  useEffect(() => {
    if (isVotingConfirmed) {
      setMessage(TX_MESSAGES.voting.success)
    }
    if (isVotingFailed) {
      console.error(votingError)
      const err = votingError as BaseError
      setErrorVoting(err.shortMessage || err.toString())
      setMessage(TX_MESSAGES.voting.error)
    }
  }, [isVotingConfirmed, isVotingFailed, setMessage, votingError])

  const handleVoting = async (vote: Vote) => {
    try {
      setErrorVoting('')
      setMessage(null)
      const txHash = await onVote(vote)
      setMessage(TX_MESSAGES.voting.pending)
      votingModal.closeModal()
      setVote(vote)
      submittedModal.openModal()
      setVotingTxHash(txHash)
    } catch (err: any) {
      if (!isUserRejectedTxError(err)) {
        console.error(err)
        setErrorVoting(err.shortMessage || err.toString())
        setMessage(TX_MESSAGES.voting.error)
      }
    }
  }

  const handleQueuingProposal = async () => {
    try {
      setMessage(null)
      const txHash = await onQueueProposal()
      setMessage(TX_MESSAGES.queuing.pending)
      await waitForTransactionReceipt(config, {
        hash: txHash,
      })
      setMessage(TX_MESSAGES.queuing.success)
    } catch (err: any) {
      if (!isUserRejectedTxError(err)) {
        console.error(err)
        setMessage(TX_MESSAGES.queuing.error)
      }
    }
  }

  const handleVotingExecution = async () => {
    try {
      setMessage(null)
      const txHash = await onExecuteProposal()
      if (!txHash) return
      setIsExecuting(true)
      setMessage(TX_MESSAGES.execution.pending)
      await waitForTransactionReceipt(config, {
        hash: txHash,
      })
      setMessage(TX_MESSAGES.execution.success)
    } catch (err: any) {
      if (!isUserRejectedTxError(err)) {
        if (
          err.details?.includes('Insufficient ERC20 balance') ||
          err.details?.includes('Insufficient Balance')
        ) {
          setMessage(TX_MESSAGES.execution.insufficientFunds)
        } else {
          console.error(err)
          setMessage(TX_MESSAGES.execution.error)
        }
      }
    }
    setIsExecuting(false)
  }

  const openModal = () => {
    setErrorVoting('')
    setMessage(null)
    votingModal.openModal()
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

  const actionNameToActionTypeMap = new Map<string, ActionType>([
    ['withdraw', ActionType.Transfer],
    ['withdrawERC20', ActionType.Transfer],
    ['communityApproveBuilder', ActionType.BuilderApproval],
    ['whitelistBuilder', ActionType.BuilderApproval],
    ['removeWhitelistedBuilder', ActionType.RemoveBuilder],
    ['dewhitelistBuilder', ActionType.RemoveBuilder],
  ])

  let actionType: ActionType = ActionType.Unknown
  let addressToWhitelist = ''

  if (actionName && actionNameToActionTypeMap[actionName]) {
    actionType = actionNameToActionTypeMap[actionName]
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

  console.log('proposalState', proposalState)

  const votingButtonActionMap = new Map<ProposalState, ButtonAction>([
    [ProposalState.Active, { actionName: 'Vote on proposal', onButtonClick: handleVoting }],
    [ProposalState.Succeeded, { actionName: 'Put on queue', onButtonClick: handleQueuingProposal }],
    [ProposalState.Queued, { actionName: 'Execute', onButtonClick: handleVotingExecution }],
  ])

  const { prices } = usePricesContext()
  const parsedAction = parseProposalActionDetails(calldatasParsed, prices)

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

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-10">
              <div>
                <Paragraph variant="body-s" className="text-white/70" bold>
                  Proposal type
                </Paragraph>
                <Paragraph variant="body">{parsedAction.display}</Paragraph>
              </div>
              <div>
                <Paragraph variant="body-s" className="text-white/70" bold>
                  Created on
                </Paragraph>
                <Paragraph variant="body">{Starts ? Starts.format('DD MMM YYYY') : '—'}</Paragraph>
              </div>
              <div>
                {actionName === 'communityApproveBuilder' ? (
                  <Paragraph variant="body-s" className="text-white/70" bold>
                    Builder name
                  </Paragraph>
                ) : null}
                <Paragraph variant="body-s" className="text-sm font-medium text-primary">
                  <a href={`/builders/${addressToWhitelist}`} className="hover:underline">
                    {builderName}
                  </a>
                </Paragraph>
              </div>
              <div>
                {actionName === 'communityApproveBuilder' ? (
                  <Paragraph variant="body-s" className="text-white/70" bold>
                    Builder address
                  </Paragraph>
                ) : null}
                {addressToWhitelist && actionName === 'communityApproveBuilder' ? (
                  <ShortenAndCopy value={addressToWhitelist} />
                ) : null}
              </div>
              <div>
                <Paragraph variant="body-s" className="text-white/70" bold>
                  Proposed by
                </Paragraph>
                {proposer ? <ShortenAndCopy value={proposer} /> : <Span variant="body">—</Span>}
              </div>
              <div>
                <Paragraph variant="body-s" className="text-white/70" bold>
                  Community discussion
                </Paragraph>
                <Paragraph variant="body-s" className="text-sm font-medium text-primary">
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
          <VotingDetails
            votingPower={votingPowerAtSnapshot.toString()}
            voteData={{
              for: forVote,
              against: againstVote,
              abstain: abstainVote,
              quorum,
            }}
            buttonAction={proposalState !== undefined ? votingButtonActionMap.get(proposalState) : undefined}
            actionDisabled={cannotCastVote}
          />
          <ActionDetails parsedAction={parsedAction} actionType={actionType} />
        </div>
      </div>
    </div>
  )
}

const actionInputNameFormatMap: Partial<ActionInputNameFormatMap<FunctionName[number], InputParameterName>> =
  {
    whitelistBuilder: {
      builder_: 'Address to be whitelisted',
      rewardReceiver_: 'Address to receive rewards',
    },
    communityApproveBuilder: {
      builder_: 'Address to be whitelisted',
    },
    removeWhitelistedBuilder: {
      builder_: 'Address to be removed',
    },
    dewhitelistBuilder: {
      builder_: 'Address to be de-whitelisted',
    },
    withdraw: {
      to: 'To address',
      amount: 'Amount',
    },
    withdrawERC20: {
      token: 'Token',
      to: 'To address',
      amount: 'Amount',
    },
  }

const AddressInputComponent: InputValueComponent<'address'> = ({ value, htmlProps }) => (
  <AddressComponent {...htmlProps} addressOrAlias={value.toString()} />
)

const BigIntInputComponent: InputValueComponent<'bigint'> = ({ value, htmlProps }) => (
  <Span {...(htmlProps as any)}>{formatNumberWithCommas(formatEther(BigInt(value)))}</Span>
)

const ERC20InputComponent: InputValueComponent<'bigint'> = ({ value, htmlProps }) => (
  <Span {...(htmlProps as any)}>
    {value.toLowerCase() === RIF_ADDRESS.toLowerCase() ? RIF : 'Unknown ERC20'}
  </Span>
)

const actionComponentMap: Partial<ActionComposerMap> = {
  whitelistBuilder: {
    builder_: AddressInputComponent,
    rewardReceiver_: AddressInputComponent,
  },
  removeWhitelistedBuilder: {
    builder_: AddressInputComponent,
  },
  dewhitelistBuilder: {
    builder_: AddressInputComponent,
  },
  communityApproveBuilder: {
    builder_: AddressInputComponent,
  },
  withdraw: {
    to: AddressInputComponent,
    amount: BigIntInputComponent,
  },
  withdrawERC20: {
    token: ERC20InputComponent,
    to: AddressInputComponent,
    amount: BigIntInputComponent,
  },
}
