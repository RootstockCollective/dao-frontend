'use client'
import { useMemo } from 'react'
import { useFetchAllProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { useGetProposalSnapshot } from '@/app/proposals/hooks/useGetProposalSnapshot'
import { getProposalEventArguments } from '@/app/proposals/shared/utils'
import { Header } from '@/components/TypographyNew'
import { useParams } from 'next/navigation'
import { usePricesContext } from '@/shared/context/PricesContext'
import { ParsedActionDetails, ProposalType } from './types'
import type { GetPricesResult } from '@/app/user/types'
import { TechnicalDetails, ProgressBar, Description, VotingDetails, ProposalDetails } from './components'
import { RBTC, RIF, RIF_ADDRESS } from '@/lib/constants'
import { DecodedData } from '@/app/proposals/shared/utils'
import { useVoteOnProposal } from '@/shared/hooks/useVoteOnProposal'

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

// Utility to get token symbol from address (expandable)
const tokenAddressToSymbol = {
  [RIF_ADDRESS.toLowerCase()]: RIF,
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
        tokenSymbol: RBTC,
        price: prices?.[RBTC]?.price ?? 0,
        toAddress,
      }
    }
    case 'withdrawERC20': {
      const tokenAddress = typeof args[0] === 'string' ? args[0].toLowerCase() : ''
      const amount = typeof args[2] === 'bigint' ? args[2] : undefined
      const toAddress = typeof args[1] === 'string' ? args[1] : undefined
      const symbol = tokenAddressToSymbol[tokenAddress] || tokenAddress
      const price = symbol === RIF ? (prices?.[RIF]?.price ?? 0) : 0
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
  const { proposalId, name, description, proposer, Starts, calldatasParsed, fullProposalName } = proposal
  const { prices } = usePricesContext()
  const parsedAction = parseProposalActionDetails(calldatasParsed, prices)
  const { proposalState } = useVoteOnProposal(proposalId)
  const snapshot = useGetProposalSnapshot(proposalId)

  const actionName = calldatasParsed?.[0]?.type === 'decoded' ? calldatasParsed[0].functionName : undefined

  return (
    <div className="min-h-screen text-white px-4 py-8 flex flex-col gap-4 w-full max-w-full">
      <Header variant="h1" className="text-3xl text-white">
        {name}
      </Header>
      <div className="flex flex-row gap-2 w-full max-w-full mt-10">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-bg-80 p-6 flex flex-col gap-y-6">
            <ProgressBar proposalState={proposalState} />
            <ProposalDetails
              name={name}
              description={description}
              proposer={proposer}
              Starts={Starts}
              fullProposalName={fullProposalName}
              parsedAction={parsedAction}
              actionName={actionName}
            />
            <Description description={description} />
          </div>
          <TechnicalDetails proposalId={proposalId} snapshot={snapshot} />
        </div>
        <VotingDetails
          proposalId={proposalId}
          parsedAction={parsedAction}
          actionName={actionName}
          snapshot={snapshot}
        />
      </div>
    </div>
  )
}
