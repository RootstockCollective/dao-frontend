'use client'
import { useFetchLatestProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { useGetProposalSnapshot } from '@/app/proposals/hooks/useGetProposalSnapshot'
import { useGetProposalVotes } from '@/app/proposals/hooks/useGetProposalVotes'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { actionFormatterMap, getEventArguments } from '@/app/proposals/shared/utils'
import { useModal } from '@/app/user/Balances/hooks/useModal'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/Breadcrumb'
import { Button } from '@/components/Button'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { MetricsCard } from '@/components/MetricsCard'
import { Popover } from '@/components/Popover'
import { Header, Paragraph, Span } from '@/components/Typography'
import { useVoteOnProposal } from '@/shared/hooks/useVoteOnProposal'
import { truncateMiddle } from '@/lib/utils'
import { useRouter } from 'next/router'
import { FC, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { Vote, VoteProposalModal } from '../../components/Modal/VoteProposalModal'
import { VoteSubmittedModal } from '../../components/Modal/VoteSubmittedModal'
import { useVotingPowerAtSnapshot } from '@/app/proposals/hooks/useVotingPowerAtSnapshot'
import { useExecuteProposal } from '@/shared/hooks/useExecuteProposal'
import { useQueueProposal } from '@/shared/hooks/useQueueProposal'
import { useGetProposalDeadline } from '@/app/proposals/hooks/useGetProposalDeadline'
import { waitForTransactionReceipt } from '@wagmi/core'
import { config } from '@/config'
import { useAlertContext } from '@/app/providers'
import { TX_MESSAGES } from '@/shared/txMessages'
import { CopyButton } from '@/components/CopyButton'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function ProposalView() {
  const {
    query: { id },
  } = useRouter()
  const { latestProposals, isLoading } = useFetchLatestProposals()

  const proposal = useMemo(() => {
    const proposal = latestProposals.find(proposal => proposal.args.proposalId.toString() === id)
    if (!proposal) {
      return null
    }
    // @ts-ignore
    return getEventArguments(proposal)
  }, [id, latestProposals])

  return (
    <MainContainer>
      {proposal && !isLoading ? <PageWithProposal {...proposal} /> : <LoadingSpinner />}
    </MainContainer>
  )
}

type PageWithProposal = ReturnType<typeof getEventArguments>

const PageWithProposal = (proposal: PageWithProposal) => {
  const { proposalId, name, description, proposer, Starts } = proposal
  const [vote, setVote] = useState<Vote | null>('for')
  const [errorVoting, setErrorVoting] = useState('')
  const { address } = useAccount()
  const votingModal = useModal()
  const submittedModal = useModal()
  const { setMessage } = useAlertContext()

  const [againstVote, forVote, abstainVote] = useGetProposalVotes(proposalId, true)
  const snapshot = useGetProposalSnapshot(proposalId)

  const { blocksUntilClosure } = useGetProposalDeadline(proposalId)

  const { votingPowerAtSnapshot, doesUserHasEnoughThreshold } = useVotingPowerAtSnapshot(snapshot as bigint)

  const { threshold } = useVotingPower()
  const { onVote, isProposalActive, didUserVoteAlready, proposalStateHuman, isVoting } =
    useVoteOnProposal(proposalId)
  const { onQueueProposal, proposalNeedsQueuing, isQueuing, isTxHashFromQueueLoading } =
    useQueueProposal(proposalId)

  const { onExecuteProposal, canProposalBeExecuted, proposalEtaHumanDate, isExecuting } =
    useExecuteProposal(proposalId)

  const cannotCastVote = !isProposalActive || didUserVoteAlready || !doesUserHasEnoughThreshold || isVoting

  const cannotCastVoteReason = useMemo(() => {
    if (!isProposalActive) {
      return 'This proposal is not active'
    }
    if (didUserVoteAlready) {
      return 'You already voted on this proposal'
    }
    if (!doesUserHasEnoughThreshold) {
      /* eslint-disable quotes */
      return "You don't have enough voting power to vote on this proposal"
    }
    if (isVoting) {
      return 'Your vote is being processed'
    }
    return ''
  }, [isProposalActive, didUserVoteAlready, doesUserHasEnoughThreshold, isVoting])

  const handleVoting = async (vote: Vote) => {
    try {
      setErrorVoting('')
      setMessage(null)
      const txHash = await onVote(vote)
      setMessage(TX_MESSAGES.voting.pending)
      votingModal.closeModal()
      setVote(vote)
      submittedModal.openModal()
      await waitForTransactionReceipt(config, {
        hash: txHash,
      })
      setMessage(TX_MESSAGES.voting.success)
    } catch (err: any) {
      if (err?.cause?.code !== 4001) {
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
      if (err?.cause?.code !== 4001) {
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
      setMessage(TX_MESSAGES.execution.pending)
      await waitForTransactionReceipt(config, {
        hash: txHash,
      })
      setMessage(TX_MESSAGES.execution.success)
    } catch (err: any) {
      if (err?.cause?.code !== 4001) {
        console.error(err)
        setMessage(TX_MESSAGES.execution.error)
      }
    }
  }

  const openModal = () => {
    setErrorVoting('')
    setMessage(null)
    votingModal.openModal()
  }

  // @ts-ignore
  return (
    <div className="pl-4 grid grid-rows-1 gap-[32px] mb-[100px]">
      <BreadcrumbSection title={name} />
      <Header className="text-2xl">{name}</Header>

      <div className="flex flex-row gap-4 items-baseline">
        <div className="flex flex-row items-baseline gap-1">
          <Paragraph className="text-sm text-gray-500">Proposed by: </Paragraph>
          <CopyButton icon={null} copyText={proposer} className="text-primary font-semibold">
            {truncateMiddle(proposer, 3, 3)}
          </CopyButton>
        </div>
        <Paragraph className="text-sm text-gray-500">Created {Starts.fromNow()}</Paragraph>
        <CopyButton icon={null} copyText={proposalId} className="font-semibold text-primary">
          ID {truncateMiddle(proposalId, 3, 3)}
        </CopyButton>
        {blocksUntilClosure !== null && proposalStateHuman === 'Active' && (
          <Paragraph className="text-sm text-gray-500">
            Blocks until closure: <span className="text-primary">{blocksUntilClosure.toString()}</span>
          </Paragraph>
        )}
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-x-6">
          <MetricsCard title="Threshold" amount={`${threshold?.toString()}`} />
          <MetricsCard title="Snapshot" amount={snapshot?.toString() || '-'} fiatAmount="Taken at block" />
          <MetricsCard title="State" amount={proposalStateHuman} />
        </div>
        <div>
          {proposalStateHuman === 'Active' && (
            <>
              {cannotCastVote ? (
                <Popover
                  content={
                    <div className="text-[12px] font-bold mb-1">
                      <p>{cannotCastVoteReason}</p>
                    </div>
                  }
                  size="small"
                  trigger="hover"
                >
                  <Button disabled>Vote on chain</Button>
                </Popover>
              ) : (
                <Button onClick={openModal}>Vote on chain</Button>
              )}
            </>
          )}
          {proposalNeedsQueuing && proposalStateHuman === 'Succeeded' && (
            <Button
              onClick={handleQueuingProposal}
              className="mt-2"
              disabled={isQueuing || isTxHashFromQueueLoading}
              loading={isQueuing}
            >
              Put on Queue
            </Button>
          )}
          {proposalStateHuman === 'Queued' && (
            <Popover
              size="small"
              trigger="hover"
              content={
                !canProposalBeExecuted ? (
                  <p className="text-[12px] font-bold mb-1">
                    The proposal is not ready to be executed yet. It should be ready on:{' '}
                    {proposalEtaHumanDate}
                  </p>
                ) : (
                  <p className="text-[12px] font-bold mb-1">The proposal can be executed.</p>
                )
              }
            >
              <Button
                onClick={handleVotingExecution}
                className="mt-2"
                disabled={!canProposalBeExecuted || isExecuting}
              >
                Execute
              </Button>
            </Popover>
          )}
          {isExecuting && <p>Pending transaction confirmation to complete execution.</p>}
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
          <Paragraph variant="normal" className="text-[16px] text-justify font-light">
            {description}
          </Paragraph>
        </div>
        <div className="w-1/3 flex flex-col gap-y-2">
          <Header variant="h1" className="text-[24px]">
            Votes
          </Header>
          <div className="flex flex-row justify-between border border-white border-opacity-40 rounded-lg px-[16px] py-[11px]">
            <Paragraph variant="semibold" className="text-[16px] text-st-success">
              {forVote.toString()}
            </Paragraph>
            <Paragraph variant="semibold" className="text-[16px] text-st-success">
              For
            </Paragraph>
          </div>
          <div className="flex flex-row justify-between border border-white border-opacity-40 rounded-lg px-[16px] py-[11px]">
            <Paragraph variant="semibold" className="text-[16px] text-st-error">
              {againstVote.toString()}
            </Paragraph>
            <Paragraph variant="semibold" className="text-[16px] text-st-error">
              Against
            </Paragraph>
          </div>
          <div className="flex flex-row justify-between border border-white border-opacity-40 rounded-lg px-[16px] py-[11px]">
            <Paragraph variant="semibold" className="text-[16px] text-text-light">
              {abstainVote.toString()}
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

const BreadcrumbSection: FC<{ title: string }> = ({ title }) => {
  return (
    <Breadcrumb className="pb-4 border-b">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/proposals">Proposals</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="max-w-lg truncate">{title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

interface CalldataRows {
  calldatasParsed: CalldataDisplayProps[]
}

const CalldataRows = ({ calldatasParsed }: CalldataRows) => {
  return calldatasParsed.map((callData, index) => <CalldataDisplay key={index} {...callData} />)
}

interface CalldataDisplayProps {
  functionName: string
  args: Record<number, string>
  inputs: { name: string }[]
}

const CalldataDisplay = ({ functionName, args, inputs }: CalldataDisplayProps) => (
  <div>
    <Paragraph variant="semibold" className="text-[16px]">
      Function: <Span className="font-normal">{functionName}</Span>
    </Paragraph>

    <Paragraph variant="semibold" className="text-[16px] mt-2">
      Arguments:
    </Paragraph>
    <ul>
      {inputs.map((input, index) => {
        const formatter = actionFormatterMap[input.name as keyof typeof actionFormatterMap]
        return (
          <li key={index} className="my-2">
            <Paragraph variant="semibold" className="text-[16px] break-words">
              {input.name}: <Span className="font-normal">{formatter?.(args[index] as never)}</Span>
            </Paragraph>
          </li>
        )
      })}
    </ul>
  </div>
)
