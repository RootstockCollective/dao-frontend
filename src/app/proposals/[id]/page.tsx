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
import { CopyButton } from '@/components/CopyButton'
import { MetricsCard } from '@/components/MetricsCard'
import { Popover } from '@/components/Popover'
import { Header, Paragraph, Span, Typography } from '@/components/Typography'
import { ProposalQuorum } from '@/app/proposals/components/ProposalQuorum'
import { config } from '@/config'
import { RIF, RIF_ADDRESS } from '@/lib/constants'
import { formatNumberWithCommas, truncateMiddle, formatCurrency } from '@/lib/utils'
import { useExecuteProposal } from '@/shared/hooks/useExecuteProposal'
import { useQueueProposal } from '@/shared/hooks/useQueueProposal'
import { useVoteOnProposal } from '@/shared/hooks/useVoteOnProposal'
import { TX_MESSAGES } from '@/shared/txMessages'
import { waitForTransactionReceipt } from '@wagmi/core'
import { useRouter, useParams } from 'next/navigation'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
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
import { ConnectWorkflow } from '@/shared/walletConnection'

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

const PageWithProposal = (proposal: ParsedProposal) => {
  const { proposalId, name, description, proposer, Starts } = proposal
  const [vote, setVote] = useState<Vote | null>('for')
  const [errorVoting, setErrorVoting] = useState('')
  const { address, isConnected } = useAccount()
  const votingModal = useModal()
  const submittedModal = useModal()
  const { setMessage } = useAlertContext()

  const [againstVote, forVote, abstainVote] = useGetProposalVotes(proposalId, true)
  const snapshot = useGetProposalSnapshot(proposalId)

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
  const { onQueueProposal, proposalNeedsQueuing, isQueuing, isTxHashFromQueueLoading } =
    useQueueProposal(proposalId)

  const { onExecuteProposal, canProposalBeExecuted, proposalEtaHumanDate, isPendingExecution } =
    useExecuteProposal(proposalId)

  const [isExecuting, setIsExecuting] = useState(false)

  const cannotCastVote =
    !isProposalActive ||
    didUserVoteAlready ||
    !doesUserHasEnoughThreshold ||
    isVoting ||
    isWaitingVotingReceipt

  const proposalType: SupportedProposalActionName | undefined =
    proposal.calldatasParsed[0]?.type === 'decoded' ? proposal.calldatasParsed[0].functionName : undefined

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

  const formatVoteCount = (voteCount: string) => formatNumberWithCommas(Big(voteCount).ceil().toString())

  const linkfyUrls = (description: string) => {
    // https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
    const urlRegex =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g
    return description.replace(urlRegex, url => {
      const href = url.startsWith('http') || url.startsWith('https') ? url : `https://${url}`
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">${url}</a>`
    })
  }

  // @ts-ignore
  return (
    <div className="pl-4 grid grid-rows-1 gap-[32px] mb-[100px]">
      <div className="flex items-center justify-between">
        <Header className="text-3xl ">{proposalName}</Header>
        {(proposalType === 'communityApproveBuilder' || proposalType === 'whitelistBuilder') && (
          <DewhitelistButton
            proposal={proposal}
            canCreateProposal={canCreateProposal}
            proposalState={proposalState as ProposalState}
          />
        )}
      </div>

      <div className="flex flex-row gap-4 items-baseline">
        <div className="flex flex-row items-baseline gap-1">
          <Paragraph className="text-sm text-gray-500">Proposed by: </Paragraph>
          <Popover
            content={
              <div className="text-[12px] font-bold mb-1">
                <p data-testid="addressTooltip">{proposer}</p>
              </div>
            }
            size="small"
            trigger="hover"
          >
            <CopyButton icon={null} copyText={proposer} className="text-primary font-semibold">
              {builderName || truncateMiddle(proposer, 3, 3)}
            </CopyButton>
          </Popover>
        </div>
        <Paragraph className="text-sm text-gray-500">Created {Starts.fromNow()}</Paragraph>
        <Popover
          content={
            <div className="text-[12px] font-bold mb-1">
              <p data-testid="proposalIDTooltip">{proposalId}</p>
            </div>
          }
          size="small"
          trigger="hover"
        >
          <CopyButton icon={null} copyText={proposalId} className="font-semibold text-primary">
            ID {truncateMiddle(proposalId, 3, 3)}
          </CopyButton>
        </Popover>
        {blocksUntilClosure !== null && proposalState === ProposalState.Active && (
          <Paragraph className="text-sm text-gray-500">
            Blocks until closure: <span className="text-primary">{blocksUntilClosure.toString()}</span>
          </Paragraph>
        )}
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-x-8 basis-1/2">
          <ProposalQuorum blockNumber={proposal.blockNumber} />
          <MetricsCard
            title="Snapshot"
            amount={formatNumberWithCommas(snapshot?.toString() || '-')}
            fiatAmount="Taken at block"
            borderless={true}
          />
        </div>
        <div>
          {!isConnected && (
            <DisconnectedAction
              proposalState={proposalState}
              proposalNeedsQueuing={proposalNeedsQueuing}
              proposalStateHuman={proposalStateHuman}
              isExecuting={isExecuting}
              isPendingExecution={isPendingExecution}
            />
          )}
          {isConnected && proposalState === ProposalState.Active && (
            <>
              {cannotCastVote ? (
                <Popover
                  content={
                    <div className="text-[12px] font-bold mb-1">
                      <p data-testid="ParagraphCannotCastVote">{cannotCastVoteReason}</p>
                    </div>
                  }
                  size={!doesUserHasEnoughThreshold ? 'medium' : 'small'}
                  position={!doesUserHasEnoughThreshold ? 'left-bottom' : 'bottom'}
                  trigger="hover"
                >
                  <Button disabled data-testid="VoteOnChain">
                    Vote on chain
                  </Button>
                </Popover>
              ) : (
                <Button onClick={openModal} data-testid="VoteOnChain">
                  Vote on chain
                </Button>
              )}
            </>
          )}
          {isConnected && proposalNeedsQueuing && proposalStateHuman === 'Succeeded' && (
            <Button
              onClick={handleQueuingProposal}
              className="mt-2"
              disabled={isQueuing || isTxHashFromQueueLoading}
              loading={isQueuing}
              data-testid="PutOnQueue"
            >
              Put on Queue
            </Button>
          )}
          {isConnected && proposalState === ProposalState.Queued && (
            <Popover
              size="small"
              trigger="hover"
              disabled={isExecuting || isPendingExecution}
              content={
                !canProposalBeExecuted ? (
                  <p className="text-[12px] font-bold mb-1">
                    The proposal is not ready to be executed yet. It should be ready on:{' '}
                    {proposalEtaHumanDate}
                  </p>
                ) : isExecuting ? (
                  <p className="text-[12px] font-bold mb-1">The proposal is being executed.</p>
                ) : (
                  !isPendingExecution && (
                    <p className="text-[12px] font-bold mb-1">
                      The proposal <br /> can be executed.
                    </p>
                  )
                )
              }
            >
              <Button
                onClick={handleVotingExecution}
                className="mt-2 ml-auto"
                disabled={!canProposalBeExecuted || isExecuting || isPendingExecution}
                data-testid="Execute"
              >
                Execute
              </Button>
            </Popover>
          )}
          {isConnected && (isExecuting || isPendingExecution) && (
            <Span variant="light" className="inline-block mt-2">
              Pending transaction confirmation <br />
              to complete execution.
            </Span>
          )}
          {votingModal.isModalOpened && address && (
            <VoteProposalModal
              onSubmit={handleVoting}
              onClose={votingModal.closeModal}
              proposal={proposal}
              address={address}
              votingPower={votingPowerAtSnapshot}
              isVoting={isVoting}
              errorMessage={errorVoting}
            />
          )}
          {submittedModal.isModalOpened && vote && (
            <VoteSubmittedModal proposal={proposal} vote={vote} onClose={submittedModal.closeModal} />
          )}
        </div>
      </div>
      <div className="flex flex-row gap-x-12">
        <div className="w-2/3">
          <Header variant="h1" className="text-[24px] mb-6">
            Description
          </Header>
          <Paragraph
            variant="normal"
            className="text-[16px] text-justify font-light whitespace-pre-wrap"
            html={linkfyUrls(description)}
          />
        </div>
        <div className="w-1/3 flex flex-col gap-y-2">
          <Header variant="h1" className="text-[24px]">
            Votes
          </Header>
          <div className="flex flex-row justify-between border border-white border-opacity-40 rounded-lg px-[16px] py-[11px]">
            <Paragraph variant="semibold" className="text-[16px] text-st-success">
              {formatVoteCount(forVote)}
            </Paragraph>
            <Paragraph variant="semibold" className="text-[16px] text-st-success">
              For
            </Paragraph>
          </div>
          <div className="flex flex-row justify-between border border-white border-opacity-40 rounded-lg px-[16px] py-[11px]">
            <Paragraph variant="semibold" className="text-[16px] text-st-error">
              {formatVoteCount(againstVote)}
            </Paragraph>
            <Paragraph variant="semibold" className="text-[16px] text-st-error">
              Against
            </Paragraph>
          </div>
          <div className="flex flex-row justify-between border border-white border-opacity-40 rounded-lg px-[16px] py-[11px]">
            <Paragraph variant="semibold" className="text-[16px] text-text-light">
              {formatVoteCount(abstainVote)}
            </Paragraph>
            <Paragraph variant="semibold" className="text-[16px] text-text-light">
              Abstain
            </Paragraph>
          </div>
          <Header variant="h1" className="text-[24px]">
            Actions
          </Header>
          <div className="border border-white border-opacity-40 rounded-lg px-[16px] py-[11px]">
            <div className="flex flex-col">
              {/*<div className="flex justify-between">*/}
              {/*  <Paragraph variant="semibold" className="text-[16px]">*/}
              {/*    Transfer*/}
              {/*  </Paragraph>*/}
              {/*  <Paragraph variant="normal" className="text-[16px]">*/}
              {/*    {toFixed(formatUnits(0 || 0n, 18))}*/}
              {/*  </Paragraph>*/}
              {/*</div>*/}
              {/*<div className="flex justify-between">*/}
              {/*  <Paragraph variant="semibold" className="text-[16px]">*/}
              {/*    To*/}
              {/*  </Paragraph>*/}
              {/*  <Paragraph variant="normal" className="text-[16px]">*/}
              {/*    {truncateMiddle('123' || '')}*/}
              {/*  </Paragraph>*/}
              {/*</div>*/}
              {/* @ts-ignore */}
              <CalldataRows calldatasParsed={proposal.calldatasParsed} />
            </div>
            <div>
              {/* <Paragraph variant="semibold" className="text-[16px]">
                      {proposal.actions.amount} {proposal.actions.tokenSymbol}
                    </Paragraph>
                    <Paragraph variant="semibold" className="text-[16px]">
                      {shortAddress(proposal.actions.toAddress)}
                    </Paragraph> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
interface DisconnectedActionProps {
  proposalState: number | undefined
  proposalNeedsQueuing: boolean | undefined
  proposalStateHuman: string
  isExecuting: boolean
  isPendingExecution: boolean
}
const DisconnectedAction = ({
  proposalState,
  proposalNeedsQueuing,
  proposalStateHuman,
  isExecuting,
  isPendingExecution,
}: DisconnectedActionProps) => {
  if (proposalState === ProposalState.Active) {
    return (
      <ConnectWorkflow
        ConnectComponent={({ onClick }) => (
          <Button variant="secondary" onClick={onClick} data-testid="VoteOnChain">
            Vote on chain
          </Button>
        )}
      />
    )
  }
  if (proposalNeedsQueuing && proposalStateHuman === 'Succeeded') {
    return (
      <ConnectWorkflow
        ConnectComponent={({ onClick }) => (
          <Button variant="secondary" onClick={onClick} className="mt-2" data-testid="PutOnQueue">
            Put on Queue
          </Button>
        )}
      />
    )
  }
  if (proposalState === ProposalState.Queued) {
    return (
      <ConnectWorkflow
        ConnectComponent={({ onClick }) => (
          <Button variant="secondary" onClick={onClick} className="mt-2 ml-auto" data-testid="Execute">
            Execute
          </Button>
        )}
      />
    )
  }
  if (isExecuting || isPendingExecution) {
    return (
      <Span variant="light" className="inline-block mt-2">
        Pending transaction confirmation <br />
        to complete execution.
      </Span>
    )
  }
  return null
}

interface CalldataRowsData {
  calldatasParsed: DecodedData[]
}

const CalldataRows = ({ calldatasParsed }: CalldataRowsData) => {
  return calldatasParsed.map((callData, index) => <CalldataDisplay key={index} {...callData} />)
}

const CalldataDisplay = (props: DecodedData) => {
  const { prices } = usePricesContext()
  const currentTokenSymbol = useRef('') // For tracking the token

  // Process token information and create cache - at the top level
  const usdValueCache = useMemo(() => {
    const cache: Record<number, string> = {}

    // Only process if this is the decoded case
    if (props.type === 'decoded') {
      const { functionName, inputs, args } = props

      // First check if this is a withdraw function
      if (functionName === 'withdraw') {
        // For withdraw function, use ZeroAddress (RBTC) as the token
        currentTokenSymbol.current = zeroAddress
      } else {
        // For other functions, try to find the token symbol
        let foundToken = false
        for (let i = 0; i < inputs.length; i++) {
          const input = inputs[i]
          const inputName = input.name
          const functionInputNames =
            actionInputNameFormatMap[functionName] ||
            ({} as InputNameFormatMap<typeof functionName, typeof inputName>)
          const formattedName = (functionInputNames[inputName as never] || inputName) as string

          if (formattedName === 'token') {
            currentTokenSymbol.current = String(args[i] || '')
            foundToken = true
            break
          }
        }

        // If no token found and the function is withdrawERC20, use ZeroAddress as fallback
        if (!foundToken && functionName === 'withdrawERC20') {
          currentTokenSymbol.current = zeroAddress
        }
      }

      // Then calculate USD values if we have a token
      if (currentTokenSymbol.current && prices) {
        const tokenSymbol =
          Object.entries(tokenContracts).find(
            ([key, value]) => value === currentTokenSymbol.current.toLowerCase(),
          )?.[0] ?? ''

        const tokenPrice = tokenSymbol ? prices[tokenSymbol] : undefined

        if (tokenPrice && typeof tokenPrice.price === 'number') {
          // Pre-calculate for all inputs
          inputs.forEach((input, idx) => {
            const inputName = input.name
            const functionInputNames =
              actionInputNameFormatMap[functionName] ||
              ({} as InputNameFormatMap<typeof functionName, typeof inputName>)
            const formattedName = (functionInputNames[inputName as never] || inputName) as string

            if (formattedName === 'amount') {
              // Use proper typing for the input value
              const inputValue = args[idx] as InputParameterTypeByFnByName<
                typeof functionName,
                typeof inputName
              >

              let newPrice = getCombinedFiatAmount([
                {
                  value: inputValue as bigint,
                  price: tokenPrice.price,
                  symbol: tokenSymbol,
                  currency: 'USD',
                },
              ])
              cache[idx] = `= USD ${formatCurrency(newPrice.toNumber())}`
            }
          })
        }
      }
    }

    return cache
  }, [props, prices])

  // Handle decoded case
  if (props.type === 'decoded') {
    const { functionName, inputs, args } = props

    return (
      <div>
        <span className="flex justify-between">
          <Paragraph variant="semibold" className="text-[16px] text-left">
            Function:
          </Paragraph>
          <Span className="font-normal text-left">{functionName}</Span>
        </span>

        <Paragraph variant="semibold" className="text-[16px] mt-2">
          Arguments:
        </Paragraph>
        <ul>
          {inputs.map((input, index) => {
            const inputName = input.name
            const functionInputNames =
              actionInputNameFormatMap[functionName] ||
              ({} as InputNameFormatMap<typeof functionName, typeof inputName>)
            const formattedInputName = (functionInputNames[inputName as never] || inputName) as string

            const inputValue = args[index] as InputParameterTypeByFnByName<
              typeof functionName,
              typeof inputName
            >

            // If this is the token input, update the token value for rendering
            if (formattedInputName === 'token') {
              currentTokenSymbol.current = String(inputValue)
            }

            const inputValueComposerMap = (actionComponentMap[functionName] || {}) as InputValueComposerMap<
              typeof functionName,
              typeof inputName
            >

            const InputComponent = inputValueComposerMap[
              inputName as keyof typeof inputValueComposerMap
            ] as InputValueComponent<InputParameterTypeByFnByName<typeof functionName, typeof inputName>>

            return (
              <li key={index} className="my-2 flex justify-between">
                <Typography tagVariant="span" className="font-semibold text-[16px] text-left">
                  {formattedInputName}
                </Typography>
                <div className="flex flex-col items-end">
                  {InputComponent && (
                    <InputComponent
                      value={inputValue}
                      htmlProps={{
                        className: 'font-normal text-right',
                      }}
                    />
                  )}
                  {formattedInputName === 'amount' && usdValueCache[index] && (
                    <Span className="text-xs text-gray-400 mt-1">{usdValueCache[index]}</Span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  // Handle fallback case
  const { affectedAddress, callData } = props
  return (
    <div>
      <Paragraph variant="semibold" className="text-[16px] mt-2">
        Affected Address:
      </Paragraph>
      <span
        className="font-normal text-left overflow-hidden text-ellipsis whitespace-nowrap block w-full"
        title={affectedAddress}
      >
        {affectedAddress}
      </span>

      <Paragraph variant="semibold" className="text-[16px] mt-2">
        Raw Call Data:
      </Paragraph>
      <span
        className="font-normal text-left overflow-hidden text-ellipsis whitespace-nowrap block w-full"
        title={callData}
      >
        {callData}
      </span>
    </div>
  )
}

type DewhitelistButton = {
  proposal: ParsedProposal
  canCreateProposal: boolean
  proposalState: ProposalState
}

const DewhitelistButton: FC<DewhitelistButton> = ({
  proposal: { calldatasParsed, proposalId },
  canCreateProposal,
  proposalState,
}) => {
  const router = useRouter()
  const builderRegistryContract = 'BuilderRegistryAbi'
  const dewhitelistBuilderAction = 'dewhitelistBuilder'
  const builderAddress =
    calldatasParsed[0]?.type === 'decoded' ? getAddress(calldatasParsed[0].args[0]?.toString() || '') : ''
  const isProposalExecuted = proposalState === ProposalState.Executed
  const isButtonEnabled = builderAddress && isProposalExecuted

  return (
    <>
      {isButtonEnabled && (
        <Button
          startIcon={<MinusIcon />}
          onClick={() =>
            router.push(
              `/proposals/create?contract=${builderRegistryContract}&action=${dewhitelistBuilderAction}&builderAddress=${builderAddress}&proposalId=${proposalId}`,
            )
          }
          disabled={!canCreateProposal}
        >
          De-whitelist
        </Button>
      )}
    </>
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
