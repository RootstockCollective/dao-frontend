'use client'
import { useFetchLatestProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { useGetProposalSnapshot } from '@/app/proposals/hooks/useGetProposalSnapshot'
import { useGetProposalVotes } from '@/app/proposals/hooks/useGetProposalVotes'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { getEventArguments } from '@/app/proposals/shared/utils'
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
import { Header, Paragraph } from '@/components/Typography'
import { useVoteOnProposal } from '@/lib/useVoteOnProposal'
import { shortAddress, truncateMiddle } from '@/lib/utils'
import { useRouter } from 'next/router'
import { FC, useMemo, useState } from 'react'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import { Vote, VoteProposalModal } from '../../components/Modal/VoteProposalModal'
import { VoteSubmittedModal } from '../../components/Modal/VoteSubmittedModal'
import { useVotingPowerAtSnapshot } from '@/app/proposals/hooks/useVotingPowerAtSnapshot'

export default function ProposalView() {
  const {
    query: { id },
  } = useRouter()
  const { latestProposals } = useFetchLatestProposals()

  const proposal = useMemo(() => {
    const proposal = latestProposals.find(proposal => proposal.args.proposalId.toString() === id)
    if (!proposal) {
      return null
    }
    // @ts-ignore
    return getEventArguments(proposal)
  }, [id, latestProposals])

  return <MainContainer>{proposal && <PageWithProposal {...proposal} />}</MainContainer>
}

type PageWithProposal = ReturnType<typeof getEventArguments>

const PageWithProposal = (proposal: PageWithProposal) => {
  const { proposalId, name, description, proposer, Starts } = proposal
  const [vote, setVote] = useState<Vote | null>('for')
  const [errorVoting, setErrorVoting] = useState('')
  const { address } = useAccount()
  const votingModal = useModal()
  const submittedModal = useModal()

  const [againstVote, forVote, abstainVote] = useGetProposalVotes(proposalId, true)
  const snapshot = useGetProposalSnapshot(proposalId)

  const { votingPowerAtSnapshot } = useVotingPowerAtSnapshot(snapshot as bigint)

  const { threshold, canCreateProposal } = useVotingPower()
  const {
    onVote,
    isProposalActive,
    didUserVoteAlready,
    proposalStateHuman,
    proposalNeedsQueuing,
    onQueueProposal,
  } = useVoteOnProposal(proposalId)

  const cannotCastVote = !isProposalActive || didUserVoteAlready || !canCreateProposal

  const handleVoting = async (vote: Vote) => {
    try {
      setErrorVoting('')
      const tx = await onVote(vote)
      votingModal.closeModal()
      setVote(vote)
      submittedModal.openModal()
    } catch (err) {
      setErrorVoting((err as Error).toString())
    }
  }

  return (
    <div className="pl-4 grid grid-rows-1 gap-[32px] mb-[100px]">
      <BreadcrumbSection title={name} />
      <Header className="text-2xl">{name}</Header>
      <div className="flex flex-row">
        <Paragraph className="text-sm text-gray-500">
          Proposed by: <span className="text-primary">{shortAddress(proposer, 10)}</span>
        </Paragraph>
        <Paragraph className="text-sm text-gray-500 ml-4">
          Created at: <span className="text-primary">{Starts}</span>
        </Paragraph>
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-x-6">
          <MetricsCard title="Threshold" amount={`${threshold?.toString()}`} />
          <MetricsCard title="Snapshot" amount={snapshot?.toString() || '-'} fiatAmount="Taken at block" />
          <MetricsCard title="State" amount={proposalStateHuman} />
        </div>
        <div>
          {cannotCastVote ? (
            <Popover
              content={cannotCastVoteReason(!isProposalActive, didUserVoteAlready, !canCreateProposal)}
              size="small"
              trigger="hover"
            >
              <Button disabled>Vote on chain</Button>
            </Popover>
          ) : (
            <Button onClick={votingModal.openModal}>Vote on chain</Button>
          )}
          {proposalNeedsQueuing && ['Succeeded', 'Queued'].includes(proposalStateHuman) && (
            <Button onClick={onQueueProposal} className="mt-2" disabled={proposalStateHuman === 'Queued'}>
              Put on Queue
            </Button>
          )}
          {votingModal.isModalOpened && address && (
            <VoteProposalModal
              onSubmit={handleVoting}
              onClose={votingModal.closeModal}
              proposal={proposal}
              address={address}
              votingPower={votingPowerAtSnapshot}
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
              <div className="flex justify-between">
                <Paragraph variant="semibold" className="text-[16px]">
                  Transfer
                </Paragraph>
                <Paragraph variant="semibold" className="text-[16px]">
                  {formatUnits(proposal.transferToValue, 18)}
                </Paragraph>
              </div>
              <div className="flex justify-between">
                <Paragraph variant="semibold" className="text-[16px]">
                  To
                </Paragraph>
                <Paragraph variant="semibold" className="text-[16px]">
                  {truncateMiddle(proposal.transferTo)}
                </Paragraph>
              </div>
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

const cannotCastVoteReason = (
  isProposalInactive: boolean,
  didUserVoteAlready: boolean,
  notEnoughVotingPower: boolean,
) => (
  <div className="text-[12px] font-bold mb-1">
    {isProposalInactive ? (
      <p>This proposal is not active</p>
    ) : (
      <>
        {didUserVoteAlready ? (
          <p>You already voted on this proposal</p>
        ) : (
          notEnoughVotingPower && <p>You don&apos;t have enough voting power to vote on this proposal</p>
        )}
      </>
    )}
  </div>
)
